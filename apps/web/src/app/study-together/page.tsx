'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  MessageSquare,
  Video,
  Mic,
  Plus,
  Paperclip,
  Send,
  Search,
  Lock,
  Globe,
  PhoneOff,
} from 'lucide-react';
import { getApiBaseUrl } from '@/lib/env';
import { io, Socket } from 'socket.io-client';
import Peer from 'simple-peer';

type Group = {
  id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  _count?: { members: number; messages: number };
};

type Message = {
  id: string;
  senderId: string;
  content?: string;
  type: string;
  fileUrl?: string;
  createdAt: string;
};

export default function StudyTogetherPage() {
  const { t } = useTranslation('common');
  const [groups, setGroups] = useState<Group[]>([]);
  const [activeGroupId, setActiveGroupId] = useState<string>('');
  const [creating, setCreating] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', description: '', isPublic: true });
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [sending, setSending] = useState(false);
  const [groupError, setGroupError] = useState('');
  const fileRef = useRef<HTMLInputElement | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const peerRef = useRef<Peer | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const [audioMuted, setAudioMuted] = useState(false);
  const [videoMuted, setVideoMuted] = useState(false);
  const [screenSharing, setScreenSharing] = useState(false);
  const [mics, setMics] = useState<MediaDeviceInfo[]>([]);
  const [cams, setCams] = useState<MediaDeviceInfo[]>([]);
  const [selectedMic, setSelectedMic] = useState<string>('');
  const [selectedCam, setSelectedCam] = useState<string>('');

  useEffect(() => {
    const load = async () => {
      const base = getApiBaseUrl();
      const res = await fetch(`${base}/groups`, { credentials: 'include' });
      const data = await res.json();
      setGroups(Array.isArray(data) ? data : []);
    };
    load();
    // init socket
    const base = getApiBaseUrl();
    const wsUrl = base.startsWith('http') ? base.replace('http', 'ws') : base;
    const socket = io(`${base}/groups`, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  useEffect(() => {
    const loadMessages = async () => {
      if (!activeGroupId) return;
      setGroupError('');
      const base = getApiBaseUrl();
      // Try to join (idempotent for public groups/creators)
      try {
        const joinRes = await fetch(`${base}/groups/${activeGroupId}/join`, {
          method: 'POST',
          credentials: 'include',
        });
        if (!joinRes.ok) {
          const err = await joinRes.json().catch(() => ({}));
          setGroupError(err?.message || 'Unable to join this group');
        }
      } catch {
        setGroupError('Network error while joining group');
      }
      const res = await fetch(`${base}/groups/${activeGroupId}/messages`, {
        credentials: 'include',
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setGroupError(err?.message || 'Unable to load messages');
        setMessages([]);
        return;
      }
      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);
    };
    loadMessages();
  }, [activeGroupId]);

  useEffect(() => {
    // enumerate devices
    navigator.mediaDevices
      .enumerateDevices()
      .then((devices) => {
        const micList = devices.filter((d) => d.kind === 'audioinput');
        const camList = devices.filter((d) => d.kind === 'videoinput');
        setMics(micList);
        setCams(camList);
        if (!selectedMic && micList[0]) setSelectedMic(micList[0].deviceId);
        if (!selectedCam && camList[0]) setSelectedCam(camList[0].deviceId);
      })
      .catch(() => {});
  }, [selectedMic, selectedCam]);

  // Socket handlers for signaling and messages
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;
    if (!activeGroupId) return;
    socket.emit('join', { groupId: activeGroupId, userId: 'me' });
    const onMessage = (payload: any) => {
      // could push realtime messages; for now rely on REST send adding to list
    };
    const onSignal = (payload: any) => {
      if (!peerRef.current) return;
      peerRef.current.signal(payload.data);
    };
    socket.on('message', onMessage);
    socket.on('signal', onSignal);
    return () => {
      socket.emit('leave', { groupId: activeGroupId });
      socket.off('message', onMessage);
      socket.off('signal', onSignal);
    };
  }, [activeGroupId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const base = getApiBaseUrl();
      const res = await fetch(`${base}/groups`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGroup),
      });
      const data = await res.json();
      if (res.ok) {
        setGroups((g) => [data, ...g]);
        setNewGroup({ name: '', description: '', isPublic: true });
      }
    } finally {
      setCreating(false);
    }
  };

  const handleSend = async () => {
    if (!activeGroupId) return;
    if (!chatInput && !(fileRef.current?.files && fileRef.current.files.length)) return;
    setSending(true);
    try {
      const base = getApiBaseUrl();
      const form = new FormData();
      if (chatInput) form.set('content', chatInput);
      const f = fileRef.current?.files?.[0];
      if (f) form.set('file', f);
      const res = await fetch(`${base}/groups/${activeGroupId}/messages`, {
        method: 'POST',
        credentials: 'include',
        body: form,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setGroupError(err?.message || 'Failed to send message');
      } else {
        const data = await res.json();
        setMessages((m) => [...m, data]);
        setChatInput('');
        if (fileRef.current) fileRef.current.value = '';
      }
    } finally {
      setSending(false);
    }
  };

  const stopMedia = () => {
    peerRef.current?.destroy();
    peerRef.current = null;
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    setAudioMuted(false);
    setVideoMuted(false);
    setScreenSharing(false);
  };

  const startCall = async (kind: 'video' | 'audio') => {
    if (!activeGroupId) return;
    const socket = socketRef.current;
    if (!socket) return;
    stopMedia();
    const stream = await navigator.mediaDevices.getUserMedia({
      video:
        kind === 'video' ? { deviceId: selectedCam ? { exact: selectedCam } : undefined } : false,
      audio: { deviceId: selectedMic ? { exact: selectedMic } : undefined },
    });
    localStreamRef.current = stream;
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
      localVideoRef.current.muted = true;
      await localVideoRef.current.play().catch(() => {});
    }
    const peer = new Peer({ initiator: true, trickle: true, stream });
    peerRef.current = peer;
    peer.on('signal', (data) => {
      socket.emit('signal', { groupId: activeGroupId, data, from: 'me' });
    });
    peer.on('stream', (remote) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remote;
        remoteVideoRef.current.play().catch(() => {});
      }
    });
  };

  const acceptCall = async (kind: 'video' | 'audio') => {
    if (!activeGroupId) return;
    const socket = socketRef.current;
    if (!socket) return;
    stopMedia();
    const stream = await navigator.mediaDevices.getUserMedia({
      video:
        kind === 'video' ? { deviceId: selectedCam ? { exact: selectedCam } : undefined } : false,
      audio: { deviceId: selectedMic ? { exact: selectedMic } : undefined },
    });
    localStreamRef.current = stream;

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
      localVideoRef.current.muted = true;
      await localVideoRef.current.play().catch(() => {});
    }
    const peer = new Peer({ initiator: false, trickle: true, stream });
    peerRef.current = peer;
    peer.on('signal', (data) => {
      socket.emit('signal', { groupId: activeGroupId, data, from: 'me' });
    });
    peer.on('stream', (remote) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remote;
        remoteVideoRef.current.play().catch(() => {});
      }
    });
  };

  const revertToCamera = async () => {
    try {
      const cam = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: selectedCam ? { exact: selectedCam } : undefined },
        audio: false,
      });
      const newTrack = cam.getVideoTracks()[0];
      const oldTrack = localStreamRef.current?.getVideoTracks()[0];
      if (!newTrack || !oldTrack) return;
      localStreamRef.current?.removeTrack(oldTrack);
      localStreamRef.current?.addTrack(newTrack);
      if (localVideoRef.current) localVideoRef.current.srcObject = localStreamRef.current!;
      if (peerRef.current && (peerRef.current as any).replaceTrack) {
        try {
          (peerRef.current as any).replaceTrack(oldTrack, newTrack, localStreamRef.current!);
        } catch {}
      }
      setScreenSharing(false);
    } catch {}
  };

  const startScreenShare = async () => {
    try {
      const display = (await (navigator.mediaDevices as any).getDisplayMedia({
        video: true,
      })) as MediaStream;
      const newTrack = display.getVideoTracks()[0];
      const oldTrack = localStreamRef.current?.getVideoTracks()[0];
      if (!newTrack || !oldTrack) return;
      // replace in local stream
      localStreamRef.current?.removeTrack(oldTrack);
      localStreamRef.current?.addTrack(newTrack);
      if (localVideoRef.current) localVideoRef.current.srcObject = localStreamRef.current!;
      // replace in peer
      if (peerRef.current && (peerRef.current as any).replaceTrack) {
        try {
          (peerRef.current as any).replaceTrack(oldTrack, newTrack, localStreamRef.current!);
        } catch {}
      }
      newTrack.onended = () => {
        // revert back to camera when screen share ends
        revertToCamera();
      };
      setScreenSharing(true);
    } catch {}
  };

  const toggleAudio = () => {
    const tracks = localStreamRef.current?.getAudioTracks() || [];
    const next = !audioMuted;
    tracks.forEach((t) => (t.enabled = !next));
    setAudioMuted(next);
  };

  const toggleVideo = () => {
    const tracks = localStreamRef.current?.getVideoTracks() || [];
    const next = !videoMuted;
    tracks.forEach((t) => (t.enabled = !next));
    setVideoMuted(next);
  };

  const activeGroup = useMemo(
    () => groups.find((g) => g.id === activeGroupId),
    [groups, activeGroupId],
  );

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-sky-500/10 via-violet-500/10 to-fuchsia-500/10 rounded-xl p-6 border border-white/10">
        <h1 className="text-3xl font-bold mb-2">{t('nav.studyTogether')}</h1>
        <p className="text-muted-foreground">{t('pages.studyTogetherDesc')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Groups List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" /> Groups
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input placeholder="Search groups..." />
              <Button variant="secondary">
                <Search className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2 max-h-[50vh] overflow-auto">
              {groups.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setActiveGroupId(g.id)}
                  className={`w-full text-left p-3 rounded-md border hover:bg-accent ${activeGroupId === g.id ? 'bg-accent' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{g.name}</div>
                      {g.description && (
                        <div className="text-sm text-muted-foreground line-clamp-1">
                          {g.description}
                        </div>
                      )}
                    </div>
                    <Badge variant="outline" className="flex items-center gap-1">
                      {g.isPublic ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                      {g.isPublic ? 'Public' : 'Private'}
                    </Badge>
                  </div>
                  {g._count && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      {g._count.members} members • {g._count.messages} messages
                    </div>
                  )}
                </button>
              ))}
              {groups.length === 0 && (
                <div className="text-sm text-muted-foreground">No groups yet. Create one!</div>
              )}
            </div>

            <form onSubmit={handleCreate} className="space-y-2 pt-2 border-t">
              <div className="font-semibold">Create Group</div>
              <Input
                placeholder="Group name"
                value={newGroup.name}
                onChange={(e) => setNewGroup((s) => ({ ...s, name: e.target.value }))}
                required
              />
              <Textarea
                placeholder="Description (optional)"
                value={newGroup.description}
                onChange={(e) => setNewGroup((s) => ({ ...s, description: e.target.value }))}
                rows={2}
              />
              <div className="flex items-center gap-2 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newGroup.isPublic}
                    onChange={(e) => setNewGroup((s) => ({ ...s, isPublic: e.target.checked }))}
                  />
                  Public group
                </label>
              </div>
              <Button type="submit" disabled={creating}>
                <Plus className="h-4 w-4 mr-2" />
                Create
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Chat & Calls */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" /> {activeGroup?.name || 'Select a group'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeGroupId ? (
              <>
                <div className="flex flex-wrap gap-2 items-center">
                  <Button variant="secondary" size="sm" onClick={() => startCall('video')}>
                    <Video className="h-4 w-4 mr-2" /> Start Video
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => startCall('audio')}>
                    <Mic className="h-4 w-4 mr-2" /> Start Audio
                  </Button>
                  <Button variant="outline" size="sm" onClick={stopMedia}>
                    <PhoneOff className="h-4 w-4 mr-2" /> End
                  </Button>
                  <Button variant="outline" size="sm" onClick={toggleAudio}>
                    {audioMuted ? 'Unmute' : 'Mute'}
                  </Button>
                  <Button variant="outline" size="sm" onClick={toggleVideo}>
                    {videoMuted ? 'Video On' : 'Video Off'}
                  </Button>
                  {!screenSharing ? (
                    <Button variant="outline" size="sm" onClick={startScreenShare}>
                      Share Screen
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" onClick={revertToCamera}>
                      Stop Share
                    </Button>
                  )}
                  <div className="flex items-center gap-2 text-xs">
                    <label>
                      Mic:
                      <select
                        className="ml-1 border rounded px-1 py-0.5 bg-background"
                        value={selectedMic}
                        onChange={(e) => setSelectedMic(e.target.value)}
                      >
                        {mics.map((m) => (
                          <option key={m.deviceId} value={m.deviceId}>
                            {m.label || 'Microphone'}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Cam:
                      <select
                        className="ml-1 border rounded px-1 py-0.5 bg-background"
                        value={selectedCam}
                        onChange={(e) => setSelectedCam(e.target.value)}
                      >
                        {cams.map((c) => (
                          <option key={c.deviceId} value={c.deviceId}>
                            {c.label || 'Camera'}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>
                {groupError && <div className="text-sm text-red-500">{groupError}</div>}
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
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                  />
                  <input ref={fileRef} type="file" className="hidden" />
                  <Button variant="outline" onClick={() => fileRef.current?.click()}>
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button onClick={handleSend} disabled={sending}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-muted-foreground">Select a group to start chatting.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
