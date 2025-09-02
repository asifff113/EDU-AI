'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getApiBaseUrl } from '@/lib/env';
import { io, Socket } from 'socket.io-client';
import Peer from 'simple-peer';
import type { Instance as PeerInstance } from 'simple-peer';

type Room = { id: string; title: string; description?: string; isPublic: boolean };
type Breakout = { id: string; name: string };

export default function VirtualClassroomsPage() {
  const { t } = useTranslation('common');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [activeRoomId, setActiveRoomId] = useState('');
  const [whiteboardOps, setWhiteboardOps] = useState<any[]>([]);
  const [breakouts, setBreakouts] = useState<Breakout[]>([]);
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [chat, setChat] = useState<{ from: string; text: string; at: number }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [handRaised, setHandRaised] = useState(false);
  const [participants, setParticipants] = useState<any[]>([]);
  const [emoji, setEmoji] = useState('👍');
  const [currentUserId, setCurrentUserId] = useState('');

  // Whiteboard canvas state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [tool, setTool] = useState<'pen' | 'line' | 'rect'>('pen');
  const [strokeColor, setStrokeColor] = useState('#111111');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const strokesRef = useRef<any[]>([]);
  const redoRef = useRef<any[]>([]);
  const startPointRef = useRef<{ x: number; y: number } | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const peerRef = useRef<PeerInstance | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const base = getApiBaseUrl();

  useEffect(() => {
    // get current user
    fetch('/api/auth/me', { credentials: 'include' })
      .then((r) => r.json())
      .then((u) => setCurrentUserId(u?.id || 'me'))
      .catch(() => setCurrentUserId('me'));
    const init = async () => {
      const res = await fetch(`${base}/classrooms`, { credentials: 'include' });
      const data = await res.json();
      setRooms(Array.isArray(data) ? data : []);
    };
    init();
    const socket = io(`${base}/classrooms`, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;
    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !activeRoomId) return;
    socket.emit('join', { classroomId: activeRoomId });
    const onSignal = (payload: any) => peerRef.current?.signal(payload.data);
    const onWhiteboard = (payload: any) => setWhiteboardOps((ops) => [...ops, payload.op]);
    const onChat = (m: any) => setChat((c) => [...c, m]);
    const onHand = (m: any) =>
      setParticipants((p) => [
        ...p.filter((x) => x.id !== m.userId),
        { id: m.userId, hand: m.hand },
      ]);
    const onReaction = (m: any) =>
      setParticipants((p) => [...p, { id: m.userId, reaction: m.emoji, at: Date.now() }]);
    const onHost = (m: any) => {
      // apply only if global or targeted to me
      if (m.targetUserId && m.targetUserId !== currentUserId) return;
      if (m.type === 'mute' && localStreamRef.current) {
        localStreamRef.current.getAudioTracks().forEach((t) => (t.enabled = false));
      }
      if (m.type === 'unmute' && localStreamRef.current) {
        localStreamRef.current.getAudioTracks().forEach((t) => (t.enabled = true));
      }
    };
    socket.on('signal', onSignal);
    socket.on('whiteboard', onWhiteboard);
    socket.on('chat', onChat);
    socket.on('hand', onHand);
    socket.on('reaction', onReaction);
    socket.on('host', onHost);
    // load breakouts
    fetch(`${base}/classrooms/${activeRoomId}/breakouts`, { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => setBreakouts(Array.isArray(d) ? d : []));
    fetch(`${base}/classrooms/${activeRoomId}/participants`, { credentials: 'include' })
      .then((r) => r.json())
      .then(setParticipants)
      .catch(() => {});
    return () => {
      socket.emit('leave', { classroomId: activeRoomId });
      socket.off('signal', onSignal);
      socket.off('whiteboard', onWhiteboard);
      socket.off('chat', onChat);
      socket.off('hand', onHand);
      socket.off('reaction', onReaction);
      socket.off('host', onHost);
    };
  }, [activeRoomId]);

  const createRoom = async () => {
    const res = await fetch(`${base}/classrooms`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description: desc, isPublic: true }),
    });
    const room = await res.json();
    setRooms((r) => [room, ...r]);
    setTitle('');
    setDesc('');
  };

  const join = async (id: string) => {
    await fetch(`${base}/classrooms/${id}/join`, { method: 'POST', credentials: 'include' });
    setActiveRoomId(id);
  };

  const startAV = async (video: boolean) => {
    if (!activeRoomId) return;
    const stream = await navigator.mediaDevices.getUserMedia({ video, audio: true });
    localStreamRef.current = stream;
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
      localVideoRef.current.muted = true;
      await localVideoRef.current.play().catch(() => {});
    }
    const peer = new Peer({ initiator: true, trickle: true, stream });
    peerRef.current = peer;
    peer.on('signal', (data) =>
      socketRef.current?.emit('signal', { room: activeRoomId, data, from: 'me' }),
    );
    peer.on('stream', (remote) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remote;
        remoteVideoRef.current.play().catch(() => {});
      }
    });
  };

  const whiteboardDraw = (op: any) => {
    if (!activeRoomId) return;
    socketRef.current?.emit('whiteboard', { room: activeRoomId, op });
    setWhiteboardOps((ops) => [...ops, op]);
  };

  const startScreenShare = async () => {
    if (!activeRoomId) return;
    const display = await (navigator.mediaDevices as any).getDisplayMedia({
      video: true,
      audio: true,
    });
    const newTrack = display.getVideoTracks()[0];
    const oldTrack = localStreamRef.current?.getVideoTracks()[0];
    if (!newTrack || !oldTrack) return;
    localStreamRef.current?.removeTrack(oldTrack);
    localStreamRef.current?.addTrack(newTrack);
    if (localVideoRef.current) localVideoRef.current.srcObject = localStreamRef.current!;
    // simple-peer replaceTrack if available
    if (peerRef.current && (peerRef.current as any).replaceTrack) {
      try {
        (peerRef.current as any).replaceTrack(oldTrack, newTrack, localStreamRef.current!);
      } catch {}
    }
    newTrack.onended = () => {
      // revert to camera
      navigator.mediaDevices.getUserMedia({ video: true, audio: false }).then((cam) => {
        const camTrack = cam.getVideoTracks()[0];
        localStreamRef.current?.removeTrack(newTrack);
        localStreamRef.current?.addTrack(camTrack);
        if (localVideoRef.current) localVideoRef.current.srcObject = localStreamRef.current!;
        if (peerRef.current && (peerRef.current as any).replaceTrack) {
          try {
            (peerRef.current as any).replaceTrack(newTrack, camTrack, localStreamRef.current!);
          } catch {}
        }
      });
    };
  };

  const startRecording = () => {
    const stream = localStreamRef.current;
    if (!stream) return;
    const rec = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' });
    const chunks: BlobPart[] = [];
    rec.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };
    rec.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'recording.webm';
      a.click();
      URL.revokeObjectURL(url);
    };
    rec.start();
    mediaRecorderRef.current = rec;
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const createBreakout = async () => {
    if (!activeRoomId) return;
    const name = prompt('Breakout name') || 'Room';
    const res = await fetch(`${base}/classrooms/${activeRoomId}/breakouts`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (res.ok) {
      const list = await fetch(`${base}/classrooms/${activeRoomId}/breakouts`, {
        credentials: 'include',
      }).then((r) => r.json());
      setBreakouts(list);
    }
  };

  const joinBreakout = async (id: string) => {
    await fetch(`${base}/classrooms/breakouts/${id}/join`, {
      method: 'POST',
      credentials: 'include',
    });
    socketRef.current?.emit('leave', { classroomId: activeRoomId });
    socketRef.current?.emit('join', { breakoutId: id });
  };

  const sendChat = () => {
    if (!activeRoomId || !chatInput.trim()) return;
    const msg = { from: currentUserId || 'me', text: chatInput.trim(), at: Date.now() };
    setChat((c) => [...c, msg]);
    socketRef.current?.emit('chat', { room: activeRoomId, message: msg });
    setChatInput('');
  };

  const toggleHand = () => {
    const next = !handRaised;
    setHandRaised(next);
    socketRef.current?.emit('hand', { room: activeRoomId, hand: next, userId: 'me' });
  };

  const sendReaction = () => {
    if (!activeRoomId) return;
    socketRef.current?.emit('reaction', {
      room: activeRoomId,
      emoji,
      userId: currentUserId || 'me',
    });
  };

  // Host actions
  const amHost = participants.some(
    (p) => p.userId === currentUserId && (p.role === 'host' || p.role === 'cohost'),
  );
  const hostMuteAll = () => socketRef.current?.emit('host', { room: activeRoomId, type: 'mute' });
  const hostUnmuteAll = () =>
    socketRef.current?.emit('host', { room: activeRoomId, type: 'unmute' });
  const hostKick = async (uid: string) => {
    socketRef.current?.emit('host', { room: activeRoomId, type: 'kick', targetUserId: uid });
    await fetch(`${base}/classrooms/${activeRoomId}/kick`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: uid }),
    }).catch(() => {});
  };
  const hostPromote = async (uid: string) => {
    socketRef.current?.emit('host', {
      room: activeRoomId,
      type: 'role',
      targetUserId: uid,
      role: 'cohost',
    });
    await fetch(`${base}/classrooms/${activeRoomId}/role`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: uid, role: 'cohost' }),
    }).catch(() => {});
  };

  // Whiteboard canvas drawing
  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const s of strokesRef.current) {
      ctx.strokeStyle = s.color;
      ctx.lineWidth = s.width;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.beginPath();
      if (s.type === 'stroke') {
        s.points.forEach((p: any, i: number) => {
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        });
        ctx.stroke();
      } else if (s.type === 'line') {
        ctx.moveTo(s.start.x, s.start.y);
        ctx.lineTo(s.end.x, s.end.y);
        ctx.stroke();
      } else if (s.type === 'rect') {
        ctx.strokeRect(
          Math.min(s.start.x, s.end.x),
          Math.min(s.start.y, s.end.y),
          Math.abs(s.end.x - s.start.x),
          Math.abs(s.end.y - s.start.y),
        );
      }
    }
  };

  const canvasPointer = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (e.type === 'pointerdown') {
      setIsDrawing(true);
      startPointRef.current = { x, y };
      redoRef.current = [];
      if (tool === 'pen')
        strokesRef.current.push({
          type: 'stroke',
          color: strokeColor,
          width: strokeWidth,
          points: [{ x, y }],
        });
    } else if (e.type === 'pointermove' && isDrawing) {
      if (tool === 'pen') {
        const s = strokesRef.current[strokesRef.current.length - 1];
        s.points.push({ x, y });
        redrawCanvas();
      }
    } else if (e.type === 'pointerup' && isDrawing) {
      setIsDrawing(false);
      if (tool === 'line' || tool === 'rect') {
        const start = startPointRef.current!;
        const end = { x, y };
        strokesRef.current.push({ type: tool, color: strokeColor, width: strokeWidth, start, end });
        redrawCanvas();
      }
      // broadcast op
      const op = strokesRef.current[strokesRef.current.length - 1];
      socketRef.current?.emit('whiteboard', { room: activeRoomId, op });
    }
  };

  const undo = () => {
    const s = strokesRef.current.pop();
    if (s) {
      redoRef.current.push(s);
      redrawCanvas();
      socketRef.current?.emit('whiteboard', { room: activeRoomId, op: { type: 'undo' } });
    }
  };
  const redo = () => {
    const s = redoRef.current.pop();
    if (s) {
      strokesRef.current.push(s);
      redrawCanvas();
      socketRef.current?.emit('whiteboard', {
        room: activeRoomId,
        op: { type: 'redo', stroke: s },
      });
    }
  };
  useEffect(() => {
    if (whiteboardOps.length === 0) return;
    const op = whiteboardOps[whiteboardOps.length - 1];
    if (op?.type === 'undo') {
      const s = strokesRef.current.pop();
      if (s) redoRef.current.push(s);
    } else if (op?.type === 'redo') {
      if (op.stroke) strokesRef.current.push(op.stroke);
    } else if (op) {
      strokesRef.current.push(op);
    }
    redrawCanvas();
  }, [whiteboardOps]);

  return (
    <div className="space-y-6 relative">
      {/* Header - Indigo/Cyan Card */}
      <div className="group perspective-1000">
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600/20 via-cyan-500/15 to-fuchsia-400/20 rounded-xl p-6 border border-indigo-400/30 shadow-xl backdrop-blur-sm transition-all duration-500 hover:scale-[1.02] hover:rotate-1 hover:shadow-2xl hover:shadow-indigo-500/25 transform-gpu">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-cyan-500 to-fuchsia-500"></div>
          <div className="relative">
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-indigo-400 via-cyan-400 to-fuchsia-400 bg-clip-text text-transparent">
              {t('nav.virtualClassrooms')}
            </h1>
            <p className="text-indigo-200/80">{t('pages.virtualClassroomsDesc')}</p>
          </div>
        </div>
      </div>

      {/* Tabs Section - Orange Card */}
      <div className="group perspective-1000">
        <Tabs defaultValue="lobby" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 bg-gradient-to-r from-orange-600/30 via-amber-500/20 to-yellow-600/30 backdrop-blur-xl border border-orange-400/30 p-1 transition-all duration-500 hover:scale-[1.01] hover:shadow-lg hover:shadow-orange-500/20 transform-gpu">
            <TabsTrigger
              value="lobby"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white transition-all duration-300"
            >
              Lobby
            </TabsTrigger>
            <TabsTrigger
              value="classroom"
              disabled={!activeRoomId}
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white transition-all duration-300"
            >
              Classroom
            </TabsTrigger>
          </TabsList>

          <TabsContent value="lobby" className="space-y-4">
            {/* Create Classroom Card - Purple */}
            <div className="group perspective-1000">
              <Card className="relative overflow-hidden bg-gradient-to-br from-purple-500/20 via-violet-400/15 to-fuchsia-500/20 backdrop-blur-xl border border-purple-400/30 shadow-xl transition-all duration-500 hover:scale-[1.01] hover:-rotate-0.5 hover:shadow-2xl hover:shadow-purple-500/25 transform-gpu">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-purple-500 via-violet-500 to-fuchsia-500"></div>
                <CardHeader>
                  <CardTitle className="bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">
                    Create Classroom
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex gap-2">
                  <Input
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-purple-500/10 border-purple-400/30 focus:border-purple-400 text-purple-100 placeholder:text-purple-300/60"
                  />
                  <Input
                    placeholder="Description"
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    className="bg-purple-500/10 border-purple-400/30 focus:border-purple-400 text-purple-100 placeholder:text-purple-300/60"
                  />
                  <Button
                    onClick={createRoom}
                    className="bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 transform-gpu"
                  >
                    Create
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Available Classrooms Card - Teal */}
            <div className="group perspective-1000">
              <Card className="relative overflow-hidden bg-gradient-to-br from-teal-500/20 via-cyan-400/15 to-blue-500/20 backdrop-blur-xl border border-teal-400/30 shadow-xl transition-all duration-500 hover:scale-[1.01] hover:rotate-0.5 hover:shadow-2xl hover:shadow-teal-500/25 transform-gpu">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500"></div>
                <CardHeader>
                  <CardTitle className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                    Available Classrooms
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {rooms.map((r, index) => {
                    const colorThemes = [
                      {
                        bg: 'from-green-500/15 via-emerald-400/10 to-teal-500/15',
                        border: 'border-green-400/30',
                        shadow: 'hover:shadow-green-500/25',
                      },
                      {
                        bg: 'from-blue-500/15 via-indigo-400/10 to-purple-500/15',
                        border: 'border-blue-400/30',
                        shadow: 'hover:shadow-blue-500/25',
                      },
                      {
                        bg: 'from-rose-500/15 via-pink-400/10 to-red-500/15',
                        border: 'border-rose-400/30',
                        shadow: 'hover:shadow-rose-500/25',
                      },
                    ];
                    const theme = colorThemes[index % colorThemes.length];

                    return (
                      <div key={r.id} className="group/item perspective-1000">
                        <div
                          className={`relative overflow-hidden p-3 rounded transition-all duration-500 hover:-translate-y-1 hover:rotate-0.5 hover:shadow-xl ring-1 ring-white/10 hover:ring-2 bg-gradient-to-br ${theme.bg} ${theme.border} ${theme.shadow} backdrop-blur-sm transform-gpu`}
                        >
                          <div className="font-semibold">{r.title}</div>
                          <div className="text-sm text-muted-foreground">{r.description}</div>
                          <div className="mt-2 flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => join(r.id)}
                              className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 transform-gpu text-white"
                            >
                              Join
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="classroom" className="space-y-4">
            <div className="flex gap-4 flex-wrap">
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => startAV(true)}>
                    Start Video
                  </Button>
                  <Button size="sm" onClick={() => startAV(false)}>
                    Start Audio
                  </Button>
                  <Button size="sm" variant="outline" onClick={startScreenShare}>
                    Share Screen
                  </Button>
                  {!recording ? (
                    <Button size="sm" variant="outline" onClick={startRecording}>
                      Start Rec
                    </Button>
                  ) : (
                    <Button size="sm" variant="destructive" onClick={stopRecording}>
                      Stop Rec
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <video
                    ref={localVideoRef}
                    className="w-64 h-40 bg-black/40 rounded"
                    playsInline
                  />
                  <video
                    ref={remoteVideoRef}
                    className="w-64 h-40 bg-black/40 rounded"
                    playsInline
                  />
                </div>
              </div>

              <div className="flex-1 min-w-[300px]">
                <Card>
                  <CardHeader>
                    <CardTitle>Whiteboard</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 mb-2">
                      <select
                        value={tool}
                        onChange={(e) => setTool(e.target.value as any)}
                        className="border rounded px-2 py-1"
                      >
                        <option value="pen">Pen</option>
                        <option value="line">Line</option>
                        <option value="rect">Rect</option>
                      </select>
                      <input
                        type="color"
                        value={strokeColor}
                        onChange={(e) => setStrokeColor(e.target.value)}
                      />
                      <input
                        type="range"
                        min={1}
                        max={12}
                        value={strokeWidth}
                        onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
                      />
                      <Button size="sm" variant="outline" onClick={undo}>
                        Undo
                      </Button>
                      <Button size="sm" variant="outline" onClick={redo}>
                        Redo
                      </Button>
                    </div>
                    <canvas
                      ref={canvasRef}
                      width={640}
                      height={300}
                      className="border rounded bg-white touch-none"
                      onPointerDown={canvasPointer}
                      onPointerMove={canvasPointer}
                      onPointerUp={canvasPointer}
                    />
                  </CardContent>
                </Card>
              </div>

              <div className="min-w-[260px] space-y-3">
                <Card>
                  <CardHeader>
                    <CardTitle>Participants</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {participants.map((p) => (
                      <div
                        key={p.userId || p.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <span>
                          {p.user?.firstName || p.userId || 'User'} {p.hand && '✋'}{' '}
                          {p.reaction || ''}
                        </span>
                        {/* Host actions (assumes client knows if host) */}
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => hostKick(p.userId || p.id)}
                          >
                            Kick
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => hostPromote(p.userId || p.id)}
                          >
                            Promote
                          </Button>
                        </div>
                      </div>
                    ))}
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline" onClick={hostMuteAll}>
                        Mute all
                      </Button>
                      <Button size="sm" variant="outline" onClick={hostUnmuteAll}>
                        Unmute all
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Chat</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="h-40 overflow-auto border rounded p-2 text-sm">
                      {chat.map((m, i) => (
                        <div key={i}>
                          <strong>{m.from}:</strong> {m.text}
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type a message"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') sendChat();
                        }}
                      />
                      <Button onClick={sendChat}>Send</Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={emoji}
                        onChange={(e) => setEmoji(e.target.value)}
                        className="border rounded px-2 py-1"
                      >
                        <option>👍</option>
                        <option>👏</option>
                        <option>🎉</option>
                        <option>❤️</option>
                        <option>😂</option>
                      </select>
                      <Button variant="outline" size="sm" onClick={sendReaction}>
                        React
                      </Button>
                      <Button variant="outline" size="sm" onClick={toggleHand}>
                        {handRaised ? 'Lower Hand' : 'Raise Hand'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
