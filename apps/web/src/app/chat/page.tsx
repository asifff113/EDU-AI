'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  PhoneOff,
  Search,
  Video,
  Mic,
  Send,
  Paperclip,
  MessageSquare,
  Trash2,
} from 'lucide-react';
import { getApiBaseUrl } from '@/lib/env';
import { io, Socket } from 'socket.io-client';
import { useSearchParams } from 'next/navigation';
import Peer from 'simple-peer';
import type { Instance as PeerInstance } from 'simple-peer';

type UserLite = {
  id: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  avatar?: string;
};
type Conversation = {
  id: string;
  participants: { userId: string }[];
  others?: UserLite[];
  _count?: { messages: number };
};
type Message = {
  id: string;
  senderId: string;
  content?: string;
  type: string;
  fileUrl?: string;
  createdAt: string;
};

export default function ChatPage() {
  const { t } = useTranslation('common');
  const searchParams = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserLite[]>([]);
  const [text, setText] = useState('');
  const fileRef = useRef<HTMLInputElement | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const peerRef = useRef<PeerInstance | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const init = async () => {
      await refreshConversations();

      // Deep-link: ?u={userId}&call=audio|video
      const userId = searchParams?.get('u');
      const callType = searchParams?.get('call');
      if (userId) {
        const base = getApiBaseUrl();
        const convRes = await fetch(`${base}/chat/conversation`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        });
        if (convRes.ok) {
          const convo = await convRes.json();
          setActiveId(convo.id);
          if (callType === 'audio') setTimeout(() => call('audio'), 100);
          if (callType === 'video') setTimeout(() => call('video'), 100);
        }
      }
    };
    init();
    const base = getApiBaseUrl();
    const socket = io(`${base}/chat`, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;
    socket.on('connect_error', (err) => {
      // noop; connection errors will retry automatically
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const load = async () => {
      if (!activeId) return;
      const base = getApiBaseUrl();
      socketRef.current?.emit('join', { conversationId: activeId });
      const res = await fetch(`${base}/chat/messages/${activeId}`, { credentials: 'include' });
      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);
    };
    load();
    const onMsg = (payload: any) => setMessages((m) => [...m, payload]);
    const onSignal = (payload: any) => peerRef.current?.signal(payload.data);
    socketRef.current?.on('message', onMsg);
    socketRef.current?.on('signal', onSignal);
    return () => {
      if (activeId) socketRef.current?.emit('leave', { conversationId: activeId });
      socketRef.current?.off('message', onMsg);
      socketRef.current?.off('signal', onSignal);
    };
  }, [activeId]);

  const otherOf = (c: Conversation): UserLite | undefined => (c.others && c.others[0]) || undefined;

  const getConversationName = (c: Conversation): string => {
    const other = otherOf(c);
    if (!other) {
      return 'Unknown User';
    }

    // Try to build a full name from firstName + lastName
    if (other.firstName && other.lastName) {
      return `${other.firstName} ${other.lastName}`;
    }

    // Fall back to firstName only
    if (other.firstName) {
      return other.firstName;
    }

    // Fall back to username
    if (other.username) {
      return other.username;
    }

    // Fall back to email
    if (other.email) {
      return other.email;
    }

    return 'User';
  };

  const refreshConversations = async () => {
    const base = getApiBaseUrl();
    const res = await fetch(`${base}/chat/conversations`, { credentials: 'include' });
    const data = await res.json();
    setConversations(Array.isArray(data) ? data : []);
  };

  const search = async () => {
    const base = getApiBaseUrl();
    const res = await fetch(`${base}/chat/search?q=${encodeURIComponent(query)}`, {
      credentials: 'include',
    });
    const data = await res.json();
    setResults(Array.isArray(data) ? data : []);
  };

  const deleteConversation = async (conversationId: string) => {
    if (
      !confirm('Are you sure you want to delete this conversation? This action cannot be undone.')
    )
      return;
    const base = getApiBaseUrl();
    const res = await fetch(`${base}/chat/conversations/${conversationId}/delete`, {
      method: 'POST',
      credentials: 'include',
    });
    if (res.ok) {
      setConversations((prev) => prev.filter((c) => c.id !== conversationId));
      if (activeId === conversationId) {
        setActiveId('');
        setMessages([]);
      }
    }
  };

  const startChat = async (userId: string) => {
    const base = getApiBaseUrl();
    const res = await fetch(`${base}/chat/conversation`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    const convo = await res.json();
    setActiveId(convo.id);
    setResults([]);
    setQuery('');
    // Refresh list to ensure proper ordering and deduplication
    await refreshConversations();
  };

  const send = async () => {
    if (!activeId) return;
    if (!text && !(fileRef.current?.files && fileRef.current.files.length)) return;
    const base = getApiBaseUrl();
    const form = new FormData();
    if (text) form.set('content', text);
    const f = fileRef.current?.files?.[0];
    if (f) form.set('file', f);
    const res = await fetch(`${base}/chat/messages/${activeId}`, {
      method: 'POST',
      credentials: 'include',
      body: form,
    });
    if (res.ok) {
      const msg = await res.json();
      setMessages((m) => [...m, msg]);
      socketRef.current?.emit('message', { conversationId: activeId, message: msg });
      setText('');
      if (fileRef.current) fileRef.current.value = '';
      // Refresh conversations to update order (latest message moves to top)
      await refreshConversations();
    }
  };

  const stopMedia = () => {
    peerRef.current?.destroy();
    peerRef.current = null;
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
  };

  const call = async (kind: 'video' | 'audio') => {
    if (!activeId) return;
    stopMedia();
    const stream = await navigator.mediaDevices.getUserMedia({
      video: kind === 'video',
      audio: true,
    });
    localStreamRef.current = stream;
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
      localVideoRef.current.muted = true;
      await localVideoRef.current.play().catch(() => {});
    }
    const peer = new Peer({ initiator: true, trickle: true, stream });
    peerRef.current = peer;
    peer.on('signal', (data) =>
      socketRef.current?.emit('signal', { conversationId: activeId, data, from: 'me' }),
    );
    peer.on('stream', (remote) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remote;
        remoteVideoRef.current.play().catch(() => {});
      }
    });
    socketRef.current?.on('signal', (payload: any) => peer.signal(payload.data));
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-cyan-500/10 via-violet-500/10 to-fuchsia-500/10 rounded-xl p-6 border border-white/10">
        <h1 className="text-3xl font-bold mb-2">{t('nav.chat')}</h1>
        <p className="text-muted-foreground">{t('pages.chatDesc')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations & Search */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" /> Conversations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Search users..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <Button variant="secondary" onClick={search}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
            {results.length > 0 && (
              <div className="space-y-1">
                {results.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => startChat(u.id)}
                    className="w-full text-left p-2 rounded hover:bg-accent flex items-center gap-2"
                  >
                    <img
                      src={u.avatar || '/api/placeholder/40'}
                      alt="avatar"
                      className="h-6 w-6 rounded-full object-cover"
                      onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
                    />
                    <span>
                      {u.firstName ? `${u.firstName} ${u.lastName ?? ''}` : (u.username ?? u.email)}
                    </span>
                  </button>
                ))}
              </div>
            )}
            <div className="space-y-2 max-h-[50vh] overflow-auto">
              {conversations.map((c) => (
                <div
                  key={c.id}
                  className={`relative group w-full p-3 rounded border hover:bg-accent ${activeId === c.id ? 'bg-accent' : ''}`}
                >
                  <div className="cursor-pointer" onClick={() => setActiveId(c.id)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-medium">
                        <img
                          src={otherOf(c)?.avatar || '/api/placeholder/40'}
                          alt="avatar"
                          className="h-7 w-7 rounded-full object-cover"
                          onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
                        />
                        <span>{getConversationName(c)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {c._count && <Badge variant="outline">{c._count.messages} msgs</Badge>}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteConversation(c.id);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {conversations.length === 0 && (
                <div className="text-sm text-muted-foreground">No conversations yet.</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Messages & Calls */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />{' '}
              {activeId
                ? `Chat with ${getConversationName(conversations.find((c) => c.id === activeId) || ({} as Conversation))}`
                : 'Select a conversation'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeId ? (
              <>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => call('video')}>
                    <Video className="h-4 w-4 mr-2" /> Video
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => call('audio')}>
                    <Mic className="h-4 w-4 mr-2" /> Audio
                  </Button>
                  <Button variant="outline" size="sm" onClick={stopMedia}>
                    <PhoneOff className="h-4 w-4 mr-2" /> End
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <video ref={localVideoRef} className="w-full rounded bg-black/40" playsInline />
                  <video ref={remoteVideoRef} className="w-full rounded bg-black/40" playsInline />
                </div>
                <div className="h-[45vh] overflow-auto border rounded-md p-3 space-y-2">
                  {messages.map((m) => (
                    <div key={m.id} className="text-sm">
                      {m.type !== 'text' && m.fileUrl ? (
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{m.type.toUpperCase()}</Badge>
                          <a href={m.fileUrl} target="_blank" className="underline">
                            Open file
                          </a>
                        </div>
                      ) : (
                        <div>{m.content}</div>
                      )}
                      <div className="text-xs text-muted-foreground">
                        {new Date(m.createdAt).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Write a message..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        send();
                      }
                    }}
                  />
                  <input ref={fileRef} type="file" className="hidden" />
                  <Button variant="outline" onClick={() => fileRef.current?.click()}>
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button onClick={send}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-muted-foreground">
                Select a conversation or search a user to start chatting.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
