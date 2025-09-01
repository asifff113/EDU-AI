'use client';

import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  Bot,
  Loader2,
  Settings,
  Plus,
  Trash2,
  Volume2,
  Mic,
  MicOff,
  Send,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
  hasImage?: boolean;
  imageUrl?: string;
};

type ChatSession = {
  id: string;
  name: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
};

type AIProvider = {
  name: string;
  displayName: string;
  models: { name: string; displayName?: string }[];
  type: 'text' | 'image';
};

export default function TutorPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [input, setInput] = useState('');
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedModelKey, setSelectedModelKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [autoSpeakResponses, setAutoSpeakResponses] = useState(false);
  const [responseSpeed, setResponseSpeed] = useState('normal');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [sidebarMinimized, setSidebarMinimized] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  // Get current session
  const currentSession = sessions.find((s) => s.id === currentSessionId);
  const messages = useMemo(() => currentSession?.messages || [], [currentSession?.messages]);

  const createNewChat = useCallback(() => {
    const newSession: ChatSession = {
      id: `session-${Date.now()}`,
      name: 'AI Tutor',
      messages: [
        {
          id: 'welcome',
          role: 'assistant',
          content:
            "Hi! I'm your AI Tutor. I can help with conversations and generate images. What would you like to learn today?",
          timestamp: new Date(),
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setSessions((prev) => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
  }, []);

  // Load and persist sessions
  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('tutor_sessions') : null;
      if (raw) {
        const parsed = JSON.parse(raw) as ChatSession[];
        // revive dates
        const revived = parsed.map((s) => ({
          ...s,
          createdAt: new Date(s.createdAt),
          updatedAt: new Date(s.updatedAt),
          messages: s.messages.map((m) => ({
            ...m,
            timestamp: m.timestamp ? new Date(m.timestamp) : undefined,
          })),
        }));
        if (revived.length > 0) {
          setSessions(revived);
          setCurrentSessionId(revived[0].id);
        }
      }
    } catch {}
    // Do not auto-create a new session on mount; user can click + to create
  }, [createNewChat]);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('tutor_sessions', JSON.stringify(sessions));
      }
    } catch {}
  }, [sessions]);
  const updateSessionName = (sessionId: string, messages: ChatMessage[]) => {
    const userMessages = messages.filter((m) => m.role === 'user');
    if (userMessages.length > 0) {
      const firstUserMessage = userMessages[0].content.trim();
      const name =
        firstUserMessage.length > 50
          ? firstUserMessage.substring(0, 47) + '...'
          : firstUserMessage || 'AI Tutor';
      setSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? { ...s, name, updatedAt: new Date() } : s)),
      );
    }
  };

  const fetchProviders = useCallback(async () => {
    try {
      const response = await fetch('/api/ai/providers');
      if (response.ok) {
        const data = await response.json();
        setProviders(data);

        // Initialize to first allowed model (Claude removed, locals kept, Gemini de-duplicated)
        const allowed = computeAllowedTextModelOptions(data);
        if (allowed.length > 0) {
          const first = allowed[0];
          setSelectedProvider(first.providerName);
          setSelectedModel(first.modelName);
          setSelectedModelKey(first.key);
        }
      }
    } catch (error) {
      console.error('Failed to fetch providers:', error);
    }
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  const generateUnsplashImage = async (query: string): Promise<string | null> => {
    try {
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&client_id=jpMjmFFb3Grbw1jH-_4rNzKIiMJsDbfKpum3unZJ3mo`,
      );
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        return data.results[0].urls.regular;
      }
      return null;
    } catch (error) {
      console.error('Failed to fetch image from Unsplash:', error);
      return null;
    }
  };

  const detectImageRequest = (text: string): string | null => {
    const imageKeywords = [
      'create image',
      'create pic',
      'generate image',
      'generate pic',
      'give me image',
      'give me pic',
      'show me image',
      'show me pic',
      'create a picture',
      'make an image',
      'draw',
      'illustrate',
    ];

    const lowerText = text.toLowerCase();
    const hasImageKeyword = imageKeywords.some((keyword) => lowerText.includes(keyword));

    if (hasImageKeyword) {
      // Extract what to generate
      let query = text;
      imageKeywords.forEach((keyword) => {
        query = query.replace(new RegExp(keyword, 'gi'), '').trim();
      });
      query = query.replace(/^(of|for|about|a|an|the)\s+/i, '').trim();
      return query || 'education concept';
    }

    return null;
  };

  // Build the allowed text model list: remove Claude, keep locals, collapse Gemini to one
  const computeAllowedTextModelOptions = (providerList: AIProvider[]) => {
    const textProvidersLocal = providerList.filter((p) => p.type === 'text');
    const allOptions = textProvidersLocal.flatMap((p) =>
      p.models
        // Drop models without a real identifier; they cannot be called reliably
        .filter((m) => typeof m.name === 'string' && m.name.trim().length > 0)
        // Remove Gemini Pro and Gemini 1.5 Pro models
        .filter(
          (m) =>
            !(
              m.name === 'gemini-pro' ||
              m.name === 'gemini-1.5-pro' ||
              (m.displayName &&
                (m.displayName.toLowerCase().includes('gemini pro') ||
                  m.displayName.toLowerCase().includes('1.5 pro')))
            ),
        )
        .map((m) => ({
          key: `${p.name}::${m.name}`,
          modelName: m.name,
          displayName: m.displayName || m.name,
          providerName: p.name,
          providerDisplayName: p.displayName,
        })),
    );

    // Deduplicate by key defensively
    const uniqueByKey = new Map<string, (typeof allOptions)[number]>();
    for (const opt of allOptions) {
      if (!uniqueByKey.has(opt.key)) uniqueByKey.set(opt.key, opt);
    }
    const uniqueOptions = Array.from(uniqueByKey.values());

    const isClaudeProvider = (opt: { providerName: string; providerDisplayName?: string }) => {
      const a = opt.providerDisplayName?.toLowerCase() || '';
      const b = opt.providerName.toLowerCase();
      return (
        a.includes('claude') ||
        a.includes('anthropic') ||
        b.includes('claude') ||
        b.includes('anthropic')
      );
    };

    const isGemini = (opt: { providerName: string; providerDisplayName?: string }) => {
      const a = opt.providerDisplayName?.toLowerCase() || '';
      const b = opt.providerName.toLowerCase();
      return a.includes('gemini') || b.includes('gemini');
    };

    // Include all local (Ollama) models, exclude Claude, include ALL Gemini models
    const isLocal = (opt: { providerName: string; providerDisplayName?: string }) => {
      const a = opt.providerDisplayName?.toLowerCase() || '';
      const b = opt.providerName.toLowerCase();
      return (
        a.includes('ollama') || a.includes('local') || b.includes('ollama') || b.includes('local')
      );
    };

    const localModels = uniqueOptions.filter(isLocal);
    const geminiModels = uniqueOptions.filter(isGemini);
    const others = uniqueOptions.filter((o) => !isLocal(o) && !isClaudeProvider(o) && !isGemini(o));

    const ordered = [...localModels, ...geminiModels, ...others];
    return ordered;
  };

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading || !currentSessionId) return;

    const userMessage: ChatMessage = {
      id: String(Date.now()),
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    };

    // Update current session with user message
    setSessions((prev) =>
      prev.map((s) =>
        s.id === currentSessionId
          ? { ...s, messages: [...s.messages, userMessage], updatedAt: new Date() }
          : s,
      ),
    );

    setInput('');
    setIsLoading(true);

    try {
      // Check if user wants an image
      const imageQuery = detectImageRequest(trimmed);

      if (imageQuery) {
        // Generate image using Unsplash
        const imageUrl = await generateUnsplashImage(imageQuery);

        const imageMessage: ChatMessage = {
          id: String(Date.now() + 1),
          role: 'assistant',
          content: imageUrl
            ? `Here's an image related to "${imageQuery}":`
            : `I couldn't find an image for "${imageQuery}", but I can still help you learn about it!`,
          timestamp: new Date(),
          hasImage: !!imageUrl,
          imageUrl: imageUrl || undefined,
        };

        setSessions((prev) =>
          prev.map((s) =>
            s.id === currentSessionId
              ? { ...s, messages: [...s.messages, imageMessage], updatedAt: new Date() }
              : s,
          ),
        );

        // Also generate a text response about the topic
        if (imageUrl) {
          const response = await fetch('/api/ai/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messages: [
                {
                  id: 'context',
                  role: 'user',
                  content: `Tell me about ${imageQuery} in an educational way.`,
                },
              ],
              provider: selectedProvider,
              model: selectedModel,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            const textMessage: ChatMessage = {
              id: String(Date.now() + 2),
              role: 'assistant',
              content:
                typeof data === 'string'
                  ? data
                  : data?.content || data?.message || "Here's some information about your topic.",
              timestamp: new Date(),
            };

            setSessions((prev) =>
              prev.map((s) =>
                s.id === currentSessionId
                  ? { ...s, messages: [...s.messages, textMessage], updatedAt: new Date() }
                  : s,
              ),
            );
          }
        }
      } else {
        // Regular text chat
        const currentMessages = sessions.find((s) => s.id === currentSessionId)?.messages || [];

        const response = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [...currentMessages, userMessage],
            provider: selectedProvider,
            model: selectedModel,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const assistantMessage: ChatMessage = {
            id: String(Date.now() + 1),
            role: 'assistant',
            content:
              typeof data === 'string'
                ? data
                : data?.content || data?.message || 'No response content',
            timestamp: new Date(),
          };

          setSessions((prev) =>
            prev.map((s) =>
              s.id === currentSessionId
                ? { ...s, messages: [...s.messages, assistantMessage], updatedAt: new Date() }
                : s,
            ),
          );

          // Update session name based on conversation
          updateSessionName(currentSessionId, [...currentMessages, userMessage]);
        } else {
          throw new Error('Failed to get response');
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        id: String(Date.now() + 1),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === currentSessionId
            ? { ...s, messages: [...s.messages, errorMessage], updatedAt: new Date() }
            : s,
        ),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Robust voice input (speech-to-text) implementation
  const startVoiceRecording = () => {
    if (typeof window === 'undefined') return;

    // If already recording, stop
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    // Setup SpeechRecognition
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        console.log('Voice recognition started');
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        console.log('Voice recognition result:', event);
        let transcript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            transcript += result[0].transcript;
          }
        }

        if (transcript.trim()) {
          console.log('Final transcript:', transcript);
          setInput((prev) => {
            const newText = prev ? prev + ' ' + transcript.trim() : transcript.trim();
            return newText;
          });
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Voice recognition error:', event.error);
        setIsRecording(false);
        recognitionRef.current = null;

        if (event.error === 'not-allowed') {
          alert('Microphone access denied. Please allow microphone access to use voice input.');
        } else if (event.error === 'no-speech') {
          console.log('No speech detected');
        }
      };

      recognition.onend = () => {
        console.log('Voice recognition ended');
        setIsRecording(false);
        recognitionRef.current = null;
      };

      recognition.start();
      console.log('Starting voice recognition...');
    } catch (error) {
      console.error('Error starting voice recognition:', error);
      setIsRecording(false);
      alert('Failed to start voice recognition. Please try again.');
    }
  };

  // Toggleable speech: if already speaking this message, stop; else, speak
  const speakText = (text: string, messageId: string) => {
    if (!voiceEnabled || typeof window === 'undefined') return;

    // If already speaking this message, stop
    if (speakingMessageId === messageId && isSpeaking) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      setIsSpeaking(false);
      return;
    }

    // Stop any current speech
    window.speechSynthesis.cancel();

    const utterance = new window.SpeechSynthesisUtterance(text);
    utterance.rate = responseSpeed === 'slow' ? 0.7 : responseSpeed === 'fast' ? 1.3 : 1;
    utterance.volume = 0.8;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setSpeakingMessageId(messageId);
    };
    utterance.onend = () => {
      setIsSpeaking(false);
      setSpeakingMessageId(null);
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      setSpeakingMessageId(null);
    };

    setSpeakingMessageId(messageId);
    window.speechSynthesis.speak(utterance);
  };

  const deleteSession = (sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    if (currentSessionId === sessionId) {
      const remaining = sessions.filter((s) => s.id !== sessionId);
      if (remaining.length > 0) {
        setCurrentSessionId(remaining[0].id);
      } else {
        createNewChat();
      }
    }
  };

  const allowedTextModelOptions = computeAllowedTextModelOptions(providers);

  // Ensure current selection is one of the allowed options
  useEffect(() => {
    if (allowedTextModelOptions.length > 0) {
      const allowedKeys = new Set(allowedTextModelOptions.map((o) => o.key));
      if (!allowedKeys.has(selectedModelKey)) {
        const first = allowedTextModelOptions[0];
        setSelectedModelKey(first.key);
        setSelectedProvider(first.providerName);
        setSelectedModel(first.modelName);
      }
    }
  }, [providers, allowedTextModelOptions, selectedModelKey]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Left Sidebar: minimizable with chat history and settings button */}
      <motion.div
        initial={false}
        animate={{ width: sidebarMinimized ? 60 : 288 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="fixed top-20 left-0 h-[calc(100vh-5rem)] bg-black/40 border-r border-purple-500/30 flex flex-col z-20 backdrop-blur-sm overflow-hidden"
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-purple-500/20 min-h-[73px]">
          {!sidebarMinimized && (
            <h3 className="text-lg font-semibold text-purple-300">Chat History</h3>
          )}
          <div className="flex items-center space-x-2">
            {!sidebarMinimized && (
              <Button
                onClick={() => setShowSettings(!showSettings)}
                variant={showSettings ? 'secondary' : 'ghost'}
                size="icon"
                className="text-purple-300 hover:text-white hover:bg-purple-500/20"
                title="Chatbot Settings"
              >
                <Settings className="w-6 h-6" />
              </Button>
            )}
            <Button
              onClick={() => setSidebarMinimized(!sidebarMinimized)}
              variant="ghost"
              size="icon"
              className="text-purple-300 hover:text-white hover:bg-purple-500/20"
              title={sidebarMinimized ? 'Expand Sidebar' : 'Minimize Sidebar'}
            >
              {sidebarMinimized ? (
                <ChevronRight className="w-5 h-5" />
              ) : (
                <ChevronLeft className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {!sidebarMinimized && (
          <div className="flex-1 overflow-y-auto px-4 py-2 scrollbar-thin scrollbar-thumb-purple-500/20 scrollbar-track-transparent">
            <div className="space-y-2">
              {sessions.map((session) => (
                <motion.div
                  key={session.id}
                  whileHover={{ scale: 1.02 }}
                  className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                    session.id === currentSessionId
                      ? 'bg-gradient-to-r from-purple-500/30 to-cyan-500/30 border border-purple-400/50'
                      : 'bg-black/20 hover:bg-purple-500/10 border border-transparent hover:border-purple-500/30'
                  }`}
                  onClick={() => setCurrentSessionId(session.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{session.name}</p>
                      <p className="text-xs text-gray-400">
                        {session.updatedAt.toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSession(session.id);
                      }}
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {sidebarMinimized && (
          <div className="flex-1 flex flex-col items-center py-4 space-y-4">
            <Button
              onClick={() => setShowSettings(!showSettings)}
              variant={showSettings ? 'secondary' : 'ghost'}
              size="icon"
              className="text-purple-300 hover:text-white hover:bg-purple-500/20"
              title="Chatbot Settings"
            >
              <Settings className="w-6 h-6" />
            </Button>
          </div>
        )}
      </motion.div>

      <div
        className="flex h-[calc(100vh-5rem)] mt-20"
        style={{ paddingLeft: sidebarMinimized ? 60 : 288 }}
      >
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Settings Panel */}
          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -100, opacity: 0 }}
                className="fixed top-20 h-[calc(100vh-5rem)] w-80 bg-black/40 backdrop-blur-xl border-r border-purple-500/30 p-4 z-40"
                style={{ left: sidebarMinimized ? 60 : 288 }}
              >
                <div className="flex flex-col space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-purple-300 mb-4 flex items-center border-b border-purple-500/20 pb-2">
                      <Settings className="w-5 h-5 mr-2" />
                      Chatbot Settings
                    </h4>
                    <div className="space-y-4">
                      {/* Voice Settings */}
                      <div className="space-y-3">
                        <h5 className="text-sm font-medium text-cyan-300">Voice Settings</h5>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-300">Voice Output</span>
                          <Button
                            onClick={() => setVoiceEnabled(!voiceEnabled)}
                            variant={voiceEnabled ? 'secondary' : 'outline'}
                            size="sm"
                          >
                            {voiceEnabled ? 'On' : 'Off'}
                          </Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-300">Auto-speak responses</span>
                          <Button
                            onClick={() => setAutoSpeakResponses(!autoSpeakResponses)}
                            variant={autoSpeakResponses ? 'secondary' : 'outline'}
                            size="sm"
                          >
                            {autoSpeakResponses ? 'On' : 'Off'}
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <span className="text-sm text-gray-300">Speech Speed</span>
                          <div className="flex space-x-2">
                            {['slow', 'normal', 'fast'].map((speed) => (
                              <Button
                                key={speed}
                                onClick={() => setResponseSpeed(speed)}
                                variant={responseSpeed === speed ? 'secondary' : 'outline'}
                                size="sm"
                                className="flex-1 capitalize"
                              >
                                {speed}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Chat Settings */}
                      <div className="space-y-3">
                        <h5 className="text-sm font-medium text-cyan-300">Chat Settings</h5>
                        <Button
                          onClick={() => {
                            if (confirm('Are you sure you want to clear all chat history?')) {
                              setSessions([]);
                              createNewChat();
                            }
                          }}
                          variant="outline"
                          className="w-full border-red-400 text-red-400 hover:bg-red-500/10 hover:text-white"
                        >
                          Clear All Chats
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Messages */}
          <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, idx) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.1 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-6 py-4 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-lg shadow-purple-500/25'
                      : 'bg-black/20 backdrop-blur-sm border border-purple-500/20 text-gray-100'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 whitespace-pre-wrap leading-relaxed">
                      {message.content}
                    </div>
                    {message.role === 'assistant' && voiceEnabled && (
                      <Button
                        onClick={() => speakText(message.content, message.id)}
                        variant="ghost"
                        size="sm"
                        className={`ml-2 flex-shrink-0 transition-colors ${
                          speakingMessageId === message.id && isSpeaking
                            ? 'text-green-400 animate-pulse bg-purple-500/20'
                            : 'text-purple-300 hover:text-white hover:bg-purple-500/20'
                        }`}
                        title={
                          speakingMessageId === message.id && isSpeaking
                            ? 'Stop voice output'
                            : 'Listen to response'
                        }
                      >
                        <Volume2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  {message.hasImage && message.imageUrl && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mt-3 rounded-lg overflow-hidden border border-purple-500/30"
                    >
                      <Image
                        src={message.imageUrl}
                        alt="Generated content"
                        width={400}
                        height={256}
                        className="w-full h-auto max-h-64 object-cover"
                      />
                    </motion.div>
                  )}
                  {message.timestamp && (
                    <div className="text-xs opacity-60 mt-2">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}

            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-black/20 backdrop-blur-sm border border-purple-500/20 rounded-2xl px-6 py-4 flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse animation-delay-200 absolute top-0 left-4"></div>
                    <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse animation-delay-400 absolute top-0 left-8"></div>
                  </div>
                  <span className="text-gray-300">AI is thinking...</span>
                </div>
              </motion.div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-purple-500/20 bg-black/20 backdrop-blur-xl p-4">
            <div className="max-w-5xl ml-4 mr-auto">
              <div className="flex items-end space-x-3">
                {/* New Chat Button */}
                <Button
                  onClick={createNewChat}
                  size="icon"
                  className="h-12 w-12 bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 rounded-full shadow-lg shadow-purple-500/25 flex-shrink-0"
                  title="New Chat"
                >
                  <Plus className="w-6 h-6" />
                </Button>
                {/* Model Selection Dropdown */}
                <Select
                  value={selectedModelKey}
                  onValueChange={(v) => {
                    const parts = v.split('::');
                    const prov = parts[0] || '';
                    const mod = parts[1] || '';
                    setSelectedProvider(prov);
                    setSelectedModel(mod);
                    setSelectedModelKey(v);
                  }}
                >
                  <SelectTrigger className="w-48 h-12 bg-black/30 border-purple-500/30 text-white rounded-2xl">
                    <SelectValue placeholder="Model" />
                  </SelectTrigger>
                  <SelectContent className="bg-black/90 border-purple-500/30">
                    {allowedTextModelOptions.map((opt) => (
                      <SelectItem
                        key={opt.key}
                        value={opt.key}
                        className="text-white hover:bg-purple-500/20"
                      >
                        {opt.displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {/* Chat Input */}
                <div className="flex-1 relative">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={onKeyDown}
                    placeholder="Ask me anything or request an image..."
                    disabled={isLoading}
                    className="h-12 bg-black/30 border-purple-500/30 text-white placeholder-gray-400 rounded-2xl px-4 pr-12 focus:ring-2 focus:ring-purple-500/50 focus:border-transparent"
                  />
                  <Button
                    onClick={startVoiceRecording}
                    variant="ghost"
                    size="sm"
                    className={`absolute right-2 top-1/2 transform -translate-y-1/2 transition-colors ${
                      isRecording
                        ? 'text-red-400 animate-pulse bg-red-100/10 hover:text-red-300'
                        : 'text-gray-400 hover:text-white'
                    }`}
                    title={isRecording ? 'Stop voice input' : 'Start voice input'}
                  >
                    {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </Button>
                </div>
                <Button
                  onClick={sendMessage}
                  disabled={isLoading || !input.trim()}
                  size="lg"
                  className="h-12 px-6 bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 rounded-2xl shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
