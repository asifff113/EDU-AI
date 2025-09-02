'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslation } from 'react-i18next';
import { getApiBaseUrl } from '@/lib/env';
import { io, Socket } from 'socket.io-client';
import { BadgeCheck, Lock, Pin } from 'lucide-react';

type Board = {
  id: string;
  name: string;
  description?: string;
  _count?: { topics: number; moderators: number };
};
type Topic = {
  id: string;
  title: string;
  tags: string[];
  pinned: boolean;
  locked: boolean;
  author?: any;
  _count?: { posts: number };
};
type Post = { id: string; content: string; isExpert: boolean; author?: any; createdAt: string };

export default function DiscussionForumsPage() {
  const { t } = useTranslation('common');
  const base = getApiBaseUrl();
  const [boards, setBoards] = useState<Board[]>([]);
  const [activeBoard, setActiveBoard] = useState<string>('');
  const [topics, setTopics] = useState<Topic[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [newBoardName, setNewBoardName] = useState('');
  const [newBoardDesc, setNewBoardDesc] = useState('');
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [topicTags, setTopicTags] = useState('');
  const [newPost, setNewPost] = useState('');
  const [activeTopic, setActiveTopic] = useState('');
  const [searchText, setSearchText] = useState('');
  const [searchTag, setSearchTag] = useState('');
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    fetch(`${base}/forums/boards`, { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        setBoards(Array.isArray(d) ? d : []);
        if (d?.[0]?.id) setActiveBoard(d[0].id);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!activeBoard) return;
    fetch(`${base}/forums/boards/${activeBoard}/topics`, { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => setTopics(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, [activeBoard]);

  useEffect(() => {
    if (!activeTopic) return;
    fetch(`${base}/forums/topics/${activeTopic}/posts`, { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => setPosts(Array.isArray(d) ? d : []))
      .catch(() => {});
    const socket = io(base.replace('/api', ''), {
      transports: ['websocket'],
      withCredentials: true,
    });
    socketRef.current = socket;
    socket.emit('forums:join', { room: `topic:${activeTopic}` });
    const onNew = (p: any) => setPosts((prev) => [...prev, p]);
    socket.on('forums:post', onNew);
    return () => {
      socket.off('forums:post', onNew);
      socket.disconnect();
    };
  }, [activeTopic]);

  const createBoard = async () => {
    if (!newBoardName.trim()) return;
    const res = await fetch(`${base}/forums/boards`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newBoardName.trim(), description: newBoardDesc }),
    });
    if (res.ok) {
      setNewBoardName('');
      setNewBoardDesc('');
      const d = await res.json();
      setBoards((b) => [d, ...b]);
    }
  };

  const createTopic = async () => {
    if (!newTopicTitle.trim()) return;
    const res = await fetch(`${base}/forums/boards/${activeBoard}/topics`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: newTopicTitle.trim(),
        tags: topicTags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      }),
    });
    if (res.ok) {
      setNewTopicTitle('');
      setTopicTags('');
      const d = await res.json();
      setTopics((t) => [d, ...t]);
    }
  };

  const postReply = async () => {
    if (!newPost.trim() || !activeTopic) return;
    const content = newPost.trim();
    setNewPost('');
    setPosts((p) => [
      ...p,
      {
        id: Math.random().toString(),
        content,
        isExpert: false,
        createdAt: new Date().toISOString(),
      } as any,
    ]);
    socketRef.current?.emit('forums:post', { room: `topic:${activeTopic}`, post: { content } });
    await fetch(`${base}/forums/topics/${activeTopic}/posts`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });
  };

  const acceptAnswer = async (postId: string) => {
    await fetch(`${base}/forums/topics/${activeTopic}/accept/${postId}`, {
      method: 'POST',
      credentials: 'include',
    });
    setPosts((p) => (p as any).map((x: any) => ({ ...x, accepted: x.id === postId })));
  };

  const pinTopic = async (pinned: boolean) => {
    await fetch(`${base}/forums/topics/${activeTopic}/pin`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pinned }),
    });
    setTopics((t) => t.map((x) => (x.id === activeTopic ? { ...x, pinned } : x)));
  };

  const lockTopic = async (locked: boolean) => {
    await fetch(`${base}/forums/topics/${activeTopic}/lock`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locked }),
    });
    setTopics((t) => t.map((x) => (x.id === activeTopic ? { ...x, locked } : x)));
  };

  const runSearch = async () => {
    if (!activeBoard) return;
    const url = new URL(`${base}/forums/boards/${activeBoard}/search`);
    if (searchText) url.searchParams.set('text', searchText);
    if (searchTag) url.searchParams.set('tag', searchTag);
    const r = await fetch(url.toString(), { credentials: 'include' });
    const d = await r.json();
    setTopics(Array.isArray(d) ? d : []);
  };

  return (
    <div className="space-y-6 relative">
      {/* Header - Indigo/Cyan Card */}
      <div className="group perspective-1000">
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600/20 via-cyan-500/15 to-fuchsia-400/20 rounded-xl p-6 border border-indigo-400/30 shadow-xl backdrop-blur-sm transition-all duration-500 hover:scale-[1.02] hover:rotate-1 hover:shadow-2xl hover:shadow-indigo-500/25 transform-gpu">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-cyan-500 to-fuchsia-500"></div>
          <div className="relative">
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-indigo-400 via-cyan-400 to-fuchsia-400 bg-clip-text text-transparent">
              {t('nav.discussionForums')}
            </h1>
            <p className="text-indigo-200/80">
              Topic-based boards with moderated discussions and expert participation.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Section - Emerald Card */}
      <div className="group perspective-1000">
        <Tabs defaultValue="boards" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 bg-gradient-to-r from-emerald-600/30 via-green-500/20 to-teal-600/30 backdrop-blur-xl border border-emerald-400/30 p-1 transition-all duration-500 hover:scale-[1.01] hover:shadow-lg hover:shadow-emerald-500/20 transform-gpu">
            <TabsTrigger
              value="boards"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-green-500 data-[state=active]:text-white transition-all duration-300"
            >
              Boards
            </TabsTrigger>
            <TabsTrigger
              value="topics"
              disabled={!activeBoard}
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-green-500 data-[state=active]:text-white transition-all duration-300"
            >
              Topics
            </TabsTrigger>
            <TabsTrigger
              value="posts"
              disabled={!activeTopic}
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-green-500 data-[state=active]:text-white transition-all duration-300"
            >
              Posts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="boards" className="space-y-4">
            {/* Create Board Card - Purple/Violet */}
            <div className="group perspective-1000">
              <Card className="relative overflow-hidden bg-gradient-to-br from-purple-500/20 via-violet-400/15 to-fuchsia-500/20 backdrop-blur-xl border border-purple-400/30 shadow-xl transition-all duration-500 hover:scale-[1.01] hover:-rotate-0.5 hover:shadow-2xl hover:shadow-purple-500/25 transform-gpu">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-purple-500 via-violet-500 to-fuchsia-500"></div>
                <CardHeader>
                  <CardTitle className="bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">
                    Create Board
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex gap-2">
                  <Input
                    placeholder="Board name"
                    value={newBoardName}
                    onChange={(e) => setNewBoardName(e.target.value)}
                    className="bg-purple-500/10 border-purple-400/30 focus:border-purple-400 text-purple-100 placeholder:text-purple-300/60"
                  />
                  <Input
                    placeholder="Description"
                    value={newBoardDesc}
                    onChange={(e) => setNewBoardDesc(e.target.value)}
                    className="bg-purple-500/10 border-purple-400/30 focus:border-purple-400 text-purple-100 placeholder:text-purple-300/60"
                  />
                  <Button
                    onClick={createBoard}
                    className="bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 transform-gpu"
                  >
                    Create
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Board Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {boards.map((b, index) => {
                // Different color themes for each board card
                const colorThemes = [
                  {
                    bg: 'from-orange-500/15 via-amber-400/10 to-yellow-500/15',
                    border: 'border-orange-400/30',
                    shadow: 'hover:shadow-orange-500/25',
                    top: 'from-orange-500 via-amber-500 to-yellow-500',
                  },
                  {
                    bg: 'from-blue-500/15 via-sky-400/10 to-cyan-500/15',
                    border: 'border-blue-400/30',
                    shadow: 'hover:shadow-blue-500/25',
                    top: 'from-blue-500 via-sky-500 to-cyan-500',
                  },
                  {
                    bg: 'from-rose-500/15 via-pink-400/10 to-red-500/15',
                    border: 'border-rose-400/30',
                    shadow: 'hover:shadow-rose-500/25',
                    top: 'from-rose-500 via-pink-500 to-red-500',
                  },
                  {
                    bg: 'from-emerald-500/15 via-green-400/10 to-teal-500/15',
                    border: 'border-emerald-400/30',
                    shadow: 'hover:shadow-emerald-500/25',
                    top: 'from-emerald-500 via-green-500 to-teal-500',
                  },
                ];
                const theme = colorThemes[index % colorThemes.length];

                return (
                  <div key={b.id} className="group perspective-1000">
                    <div
                      className={`relative overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:rotate-0.5 hover:shadow-2xl ring-1 ring-white/10 hover:ring-2 bg-gradient-to-br ${theme.bg} ${theme.border} ${theme.shadow} backdrop-blur-xl transform-gpu p-3 rounded ${activeBoard === b.id ? 'ring-2 ring-primary' : ''}`}
                    >
                      <div
                        className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${theme.top} opacity-70 group-hover:opacity-100 transition-opacity`}
                      ></div>
                      <div className="relative">
                        <div className="font-semibold">{b.name}</div>
                        <div className="text-sm text-muted-foreground">{b.description}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {b._count?.topics ?? 0} topics • {b._count?.moderators ?? 0} moderators
                        </div>
                        <div className="mt-2 flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setActiveBoard(b.id)}
                            className="border-white/20 hover:bg-white/10 transition-all duration-300"
                          >
                            Open
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="topics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>New Topic</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="Title"
                    value={newTopicTitle}
                    onChange={(e) => setNewTopicTitle(e.target.value)}
                  />
                  <Input
                    placeholder="tags (comma)"
                    value={topicTags}
                    onChange={(e) => setTopicTags(e.target.value)}
                  />
                  <Button onClick={createTopic}>Create</Button>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="search text"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                  <Input
                    placeholder="tag"
                    value={searchTag}
                    onChange={(e) => setSearchTag(e.target.value)}
                  />
                  <Button variant="outline" onClick={runSearch}>
                    Search
                  </Button>
                </div>
              </CardContent>
            </Card>
            <div className="space-y-2">
              {topics.map((t) => (
                <div
                  key={t.id}
                  className={`p-3 rounded border ${activeTopic === t.id ? 'border-primary' : 'border-white/10'}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{t.title}</div>
                      <div className="text-xs text-muted-foreground">{t.tags?.join(', ')}</div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {t._count?.posts ?? 0} posts
                    </div>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setActiveTopic(t.id)}>
                      Open
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setActiveTopic(t.id);
                        pinTopic(!(t as any).pinned);
                      }}
                    >
                      <Pin className="h-4 w-4 mr-1" /> {(t as any).pinned ? 'Unpin' : 'Pin'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setActiveTopic(t.id);
                        lockTopic(!(t as any).locked);
                      }}
                    >
                      <Lock className="h-4 w-4 mr-1" /> {(t as any).locked ? 'Unlock' : 'Lock'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="posts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Reply</CardTitle>
              </CardHeader>
              <CardContent className="flex gap-2">
                <Textarea
                  placeholder="Write your reply"
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                />
                <Button onClick={postReply}>Post</Button>
              </CardContent>
            </Card>
            <div className="space-y-2">
              {posts.map((p, i) => (
                <div key={i} className="p-3 rounded border border-white/10">
                  <div className="text-sm whitespace-pre-wrap">{p.content}</div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    {p.isExpert ? (
                      <span className="inline-flex items-center gap-1 text-emerald-400">
                        <BadgeCheck className="h-3 w-3" /> Expert
                      </span>
                    ) : (
                      'Member'
                    )}
                    <Button size="sm" variant="outline" onClick={() => acceptAnswer((p as any).id)}>
                      Mark Accepted
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
