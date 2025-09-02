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
    <div className="space-y-8">
      {/* Enhanced Header with Communication Theme */}
      <div
        className="relative group bg-gradient-to-r from-cyan-500/20 via-blue-600/15 to-teal-500/20 
        rounded-2xl p-8 border border-cyan-500/20 backdrop-blur-xl shadow-2xl shadow-cyan-500/10
        hover:shadow-3xl hover:shadow-cyan-500/20 transition-all duration-700 transform-gpu
        before:absolute before:inset-0 before:bg-gradient-to-r before:from-cyan-500/5 before:to-blue-500/5 
        before:rounded-2xl before:opacity-0 before:transition-opacity before:duration-500 hover:before:opacity-100"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl"></div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-cyan-500/20 group-hover:bg-cyan-400/30 transition-all duration-300 group-hover:rotate-6 group-hover:scale-110 transform-gpu">
            <MessageSquare className="h-8 w-8 text-cyan-300 group-hover:text-cyan-200" />
          </div>
          <div>
            <h1 className="text-4xl font-bold mb-2 text-white group-hover:text-cyan-100 transition-colors duration-300">
              {t('nav.chat')}
            </h1>
            <p className="text-cyan-300 group-hover:text-cyan-200 transition-colors duration-300 text-lg">
              {t('pages.chatDesc')}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Enhanced Conversations & Search - Purple Social Theme */}
        <Card
          className="lg:col-span-1 group relative border-0 bg-gradient-to-br from-purple-500/20 via-violet-600/15 to-fuchsia-600/20 
          backdrop-blur-xl shadow-xl shadow-purple-500/20 hover:shadow-2xl hover:shadow-purple-500/30 
          transition-all duration-500 hover:scale-[1.02] transform-gpu perspective-1000 
          before:absolute before:inset-0 before:bg-gradient-to-r before:from-purple-500/10 before:to-violet-500/10 
          before:rounded-xl before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl"></div>
          <CardHeader className="relative z-10">
            <CardTitle
              className="text-xl font-bold text-white group-hover:text-purple-200 transition-colors duration-300 
              flex items-center gap-3"
            >
              <div className="p-2 rounded-lg bg-purple-500/20 group-hover:bg-purple-400/30 transition-all duration-300 group-hover:rotate-6">
                <Users className="h-5 w-5 text-purple-300 group-hover:text-purple-200" />
              </div>
              Conversations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 relative z-10">
            {/* Enhanced Search */}
            <div className="flex gap-2">
              <Input
                placeholder="Search users..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="bg-white/10 border border-purple-500/30 text-white placeholder:text-purple-300/60 
                  focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 backdrop-blur-sm"
              />
              <Button
                onClick={search}
                className="bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 
                  text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 
                  hover:scale-110 transform-gpu"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
            {/* Enhanced Search Results */}
            {results.length > 0 && (
              <div className="space-y-2">
                {results.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => startChat(u.id)}
                    className="w-full text-left p-3 rounded-lg bg-white/10 hover:bg-white/20 
                      border border-white/20 hover:border-purple-400/50 transition-all duration-300 
                      flex items-center gap-3 group hover:scale-105 transform-gpu backdrop-blur-sm"
                  >
                    <img
                      src={u.avatar || '/api/placeholder/40'}
                      alt="avatar"
                      className="h-8 w-8 rounded-full object-cover border-2 border-purple-300/30 
                        group-hover:border-purple-300 transition-all duration-300 group-hover:scale-110"
                      onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
                    />
                    <span className="text-white group-hover:text-purple-200 transition-colors duration-300 font-medium">
                      {u.firstName ? `${u.firstName} ${u.lastName ?? ''}` : (u.username ?? u.email)}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Enhanced Conversations List */}
            <div className="space-y-3 max-h-[50vh] overflow-auto">
              {conversations.map((c) => (
                <div
                  key={c.id}
                  className={`relative group w-full p-4 rounded-xl transition-all duration-300 
                    hover:scale-105 hover:-translate-y-1 transform-gpu cursor-pointer
                    ${
                      activeId === c.id
                        ? 'bg-gradient-to-r from-purple-400/30 to-violet-400/30 border-2 border-purple-400/50 shadow-lg shadow-purple-500/20'
                        : 'bg-white/10 hover:bg-white/20 border border-white/20 hover:border-purple-400/50'
                    } backdrop-blur-sm`}
                >
                  <div className="cursor-pointer" onClick={() => setActiveId(c.id)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 font-medium">
                        <img
                          src={otherOf(c)?.avatar || '/api/placeholder/40'}
                          alt="avatar"
                          className="h-10 w-10 rounded-full object-cover border-2 border-purple-300/30 
                            group-hover:border-purple-300 transition-all duration-300 group-hover:scale-110"
                          onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
                        />
                        <span className="text-white group-hover:text-purple-200 transition-colors duration-300 text-lg">
                          {getConversationName(c)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {c._count && (
                          <Badge
                            className="bg-purple-500/30 text-purple-200 border-purple-400/30 
                            hover:bg-purple-400/40 transition-all duration-300"
                          >
                            {c._count.messages} msgs
                          </Badge>
                        )}
                        <Button
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-all duration-300 h-8 w-8 p-0 
                            bg-red-500/20 hover:bg-red-500/40 text-red-300 hover:text-red-200 
                            border border-red-500/30 hover:border-red-400 hover:scale-110 transform-gpu"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteConversation(c.id);
                          }}
                          variant="outline"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {conversations.length === 0 && (
                <div className="p-8 text-center">
                  <div className="text-4xl mb-4">💬</div>
                  <div className="text-white/70 text-lg">No conversations yet</div>
                  <div className="text-purple-300 text-sm mt-2">
                    Search for users above to start chatting!
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Messages & Calls - Cyan Communication Theme */}
        <Card
          className="lg:col-span-2 group relative border-0 bg-gradient-to-br from-cyan-500/20 via-blue-600/15 to-sky-600/20 
          backdrop-blur-xl shadow-xl shadow-cyan-500/20 hover:shadow-2xl hover:shadow-cyan-500/30 
          transition-all duration-500 hover:scale-[1.01] transform-gpu perspective-1000 
          before:absolute before:inset-0 before:bg-gradient-to-r before:from-cyan-500/10 before:to-blue-500/10 
          before:rounded-xl before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl"></div>
          <CardHeader className="relative z-10">
            <CardTitle
              className="text-xl font-bold text-white group-hover:text-cyan-200 transition-colors duration-300 
              flex items-center gap-3"
            >
              <div className="p-2 rounded-lg bg-cyan-500/20 group-hover:bg-cyan-400/30 transition-all duration-300 group-hover:rotate-6">
                <MessageSquare className="h-5 w-5 text-cyan-300 group-hover:text-cyan-200" />
              </div>
              {activeId
                ? `Chat with ${getConversationName(conversations.find((c) => c.id === activeId) || ({} as Conversation))}`
                : 'Select a conversation'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 relative z-10">
            {activeId ? (
              <>
                {/* Enhanced Call Controls */}
                <div className="flex gap-3 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                  <Button
                    size="sm"
                    onClick={() => call('video')}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 
                      text-white shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all duration-300 
                      hover:scale-110 transform-gpu"
                  >
                    <Video className="h-4 w-4 mr-2" /> Video Call
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => call('audio')}
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 
                      text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 
                      hover:scale-110 transform-gpu"
                  >
                    <Mic className="h-4 w-4 mr-2" /> Voice Call
                  </Button>
                  <Button
                    size="sm"
                    onClick={stopMedia}
                    className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 
                      text-white shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transition-all duration-300 
                      hover:scale-110 transform-gpu"
                  >
                    <PhoneOff className="h-4 w-4 mr-2" /> End Call
                  </Button>
                </div>
                {/* Enhanced Video Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <video
                    ref={localVideoRef}
                    className="w-full rounded-xl bg-gradient-to-br from-gray-800/50 to-black/50 
                    backdrop-blur-sm border border-white/20"
                    playsInline
                  />
                  <video
                    ref={remoteVideoRef}
                    className="w-full rounded-xl bg-gradient-to-br from-gray-800/50 to-black/50 
                    backdrop-blur-sm border border-white/20"
                    playsInline
                  />
                </div>

                {/* Enhanced Messages Area */}
                <div className="h-[45vh] overflow-auto rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 p-4 space-y-3">
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className="p-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20"
                    >
                      {m.type !== 'text' && m.fileUrl ? (
                        <div className="flex items-center gap-3">
                          <Badge className="bg-cyan-500/30 text-cyan-200 border-cyan-400/30">
                            {m.type.toUpperCase()}
                          </Badge>
                          <a
                            href={m.fileUrl}
                            target="_blank"
                            className="text-cyan-300 hover:text-cyan-200 underline transition-colors duration-300"
                          >
                            Open file
                          </a>
                        </div>
                      ) : (
                        <div className="text-white font-medium">{m.content}</div>
                      )}
                      <div className="text-xs text-cyan-300 mt-2">
                        {new Date(m.createdAt).toLocaleString()}
                      </div>
                    </div>
                  ))}
                  {messages.length === 0 && (
                    <div className="text-center p-8">
                      <div className="text-4xl mb-4">💭</div>
                      <div className="text-cyan-300 text-lg">No messages yet</div>
                      <div className="text-white/60 text-sm mt-2">Start the conversation!</div>
                    </div>
                  )}
                </div>

                {/* Enhanced Message Input */}
                <div className="flex items-center gap-3 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
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
                    className="flex-1 bg-white/10 border border-cyan-500/30 text-white placeholder:text-cyan-300/60 
                      focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 backdrop-blur-sm"
                  />
                  <input ref={fileRef} type="file" className="hidden" />
                  <Button
                    onClick={() => fileRef.current?.click()}
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 
                      text-white shadow-lg shadow-yellow-500/25 hover:shadow-yellow-500/40 transition-all duration-300 
                      hover:scale-110 transform-gpu"
                    size="sm"
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={send}
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 
                      text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300 
                      hover:scale-110 transform-gpu"
                    size="sm"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="p-16 text-center">
                <div className="text-6xl mb-6">🌟</div>
                <div className="text-2xl font-bold text-white mb-4">Ready to Connect!</div>
                <div className="text-cyan-300 text-lg mb-2">
                  Select a conversation or search for users to start chatting
                </div>
                <div className="text-white/60">
                  Experience real-time messaging with voice and video calls
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
