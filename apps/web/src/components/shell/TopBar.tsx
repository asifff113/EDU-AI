'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import i18n from 'i18next';
import { useTranslation } from 'react-i18next';
import {
  Triangle,
  LogOut,
  User,
  Menu,
  LayoutDashboard,
  Bot,
  FileText,
  BookOpen,
  Rocket,
  MessageSquare,
  Settings as SettingsIcon,
  Users,
  Video,
  Shield,
  GraduationCap,
  Search,
  Sun,
  Moon,
  Monitor,
  Languages,
  Heart,
  DollarSign,
  Bell,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useAppContext } from '@/contexts/AppContext';
import { getApiBaseUrl } from '@/lib/env';
import { useEffect, useState } from 'react';

export function TopBar() {
  const router = useRouter();
  const { user } = useAppContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState<'system' | 'light' | 'dark'>('system');
  const [mounted, setMounted] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [lang, setLang] = useState('en');
  const [notifsOpen, setNotifsOpen] = useState(false);
  const [notifUnread, setNotifUnread] = useState(0);
  const [notifList, setNotifList] = useState<Array<any>>([]);

  function applyTheme(t: 'system' | 'light' | 'dark') {
    if (typeof window === 'undefined') return;
    const root = document.documentElement;
    if (t === 'dark') {
      root.classList.add('dark');
    } else if (t === 'light') {
      root.classList.remove('dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', prefersDark);
    }
  }

  // Initialize theme from localStorage and apply once mounted
  useEffect(() => {
    // Defer to next tick to avoid SSR/CSR mismatch
    setTimeout(() => {
      const stored =
        (typeof window !== 'undefined' &&
          (localStorage.getItem('theme') as 'system' | 'light' | 'dark')) ||
        'system';
      setTheme(stored);
      applyTheme(stored);
      setMounted(true);
      setIsClient(true);
    }, 0);
  }, []);

  // Apply theme whenever it changes after mount
  useEffect(() => {
    if (!mounted) return;
    applyTheme(theme);
  }, [theme, mounted]);

  // Language switch
  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Defer read to next tick to avoid SSR mismatch
    setTimeout(() => {
      const stored = localStorage.getItem('lang') || 'en';
      setLang(stored);
    }, 0);
  }, []);

  const setLanguage = (l: string) => {
    try {
      localStorage.setItem('lang', l);
    } catch {}
    // Switch language without full page reload
    i18n.changeLanguage(l).catch(() => {});
    const url = new URL(window.location.href);
    url.searchParams.set('lng', l);
    router.replace(url.pathname + url.search);
  };

  // Notifications realtime
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/notifications', { credentials: 'include' });
        const data = await res.json().catch(() => ({ unread: 0, list: [] }));
        setNotifUnread(data.unread || 0);
        setNotifList(Array.isArray(data.list) ? data.list : []);
      } catch {}
    };
    load();
    const base = getApiBaseUrl();
    import('socket.io-client').then(({ io }) => {
      const s = io(`${base}/notifications`, {
        withCredentials: true,
        transports: ['websocket', 'polling'],
      });
      s.on('notifications:update', load);
      // @ts-ignore
      TopBar._notifSocket = s;
    });
    return () => {
      // @ts-ignore
      TopBar._notifSocket?.disconnect?.();
    };
  }, []);

  const cycleTheme = () => {
    const next = theme === 'system' ? 'light' : theme === 'light' ? 'dark' : 'system';
    setTheme(next);
    try {
      localStorage.setItem('theme', next);
    } catch {}
  };

  const handleLogout = async () => {
    try {
      const base = getApiBaseUrl();
      await fetch(`${base}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });

      // Clear any local storage
      localStorage.removeItem('user');
      localStorage.removeItem('token');

      // Clear session storage
      sessionStorage.clear();

      // Redirect to home page
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);

      // Clear storage even if logout request fails
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      sessionStorage.clear();

      // Force redirect anyway
      window.location.href = '/';
    }
  };

  const { t } = useTranslation('common');

  // Prevent hydration issues by ensuring consistent rendering
  if (!isClient) {
    return (
      <header
        className="h-16 sticky top-0 z-50 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm"
        suppressHydrationWarning
      >
        <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 h-16 flex items-center gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Triangle className="size-5 text-primary" />
            <span className="font-semibold text-lg tracking-tight">EDU AI</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8" />
            <div className="w-8 h-8" />
            <div className="w-8 h-8" />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header
      className="h-16 sticky top-0 z-50 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm"
      suppressHydrationWarning
    >
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 h-16 flex items-center gap-3">
        <Link href="/dashboard" className="flex items-center gap-2 min-w-0">
          <Triangle className="size-5 text-primary drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
          <span className="text-base font-semibold truncate">{t('nav.app')}</span>
        </Link>
        {/* Futuristic colorful 3D navigation pills */}
        <Link
          href="/dashboard"
          className="relative ml-4 px-4 py-2 rounded-2xl bg-gradient-to-r from-fuchsia-500 to-violet-500 text-sm font-semibold text-white ring-1 ring-inset ring-white/20 shadow-lg shadow-fuchsia-500/20 transition transform-gpu hover:-translate-y-[1.5px] active:translate-y-0 hover:from-fuchsia-600 hover:to-violet-600"
        >
          <span className="pointer-events-none absolute inset-0 rounded-2xl bg-[linear-gradient(180deg,rgba(255,255,255,0.18),rgba(255,255,255,0)_40%)] opacity-70" />
          <span className="relative inline-flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4 drop-shadow-[0_1px_6px_rgba(255,255,255,0.35)]" />{' '}
            {t('nav.dashboard')}
          </span>
        </Link>
        <Link
          href="/tutor"
          className="relative px-4 py-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-sm font-semibold text-white ring-1 ring-inset ring-white/20 shadow-lg shadow-cyan-500/20 transition transform-gpu hover:-translate-y-[1.5px] active:translate-y-0 hover:from-cyan-600 hover:to-fuchsia-600"
        >
          <span className="pointer-events-none absolute inset-0 rounded-2xl bg-[linear-gradient(180deg,rgba(255,255,255,0.18),rgba(255,255,255,0)_40%)] opacity-70" />
          <span className="relative inline-flex items-center gap-2">
            <Bot className="h-4 w-4 drop-shadow-[0_1px_6px_rgba(255,255,255,0.35)]" />{' '}
            {t('nav.tutor')}
          </span>
        </Link>
        <Link
          href="/courses"
          className="relative px-4 py-2 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-500 text-sm font-semibold text-white ring-1 ring-inset ring-white/20 shadow-lg shadow-violet-500/20 transition transform-gpu hover:-translate-y-[1.5px] active:translate-y-0 hover:from-violet-600 hover:to-purple-600"
        >
          <span className="pointer-events-none absolute inset-0 rounded-2xl bg-[linear-gradient(180deg,rgba(255,255,255,0.18),rgba(255,255,255,0)_40%)] opacity-70" />
          <span className="relative inline-flex items-center gap-2">
            <BookOpen className="h-4 w-4 drop-shadow-[0_1px_6px_rgba(255,255,255,0.35)]" />{' '}
            {t('nav.courses')}
          </span>
        </Link>
        <Link
          href="/profiles"
          className="relative px-4 py-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-sm font-semibold text-white ring-1 ring-inset ring-white/20 shadow-lg shadow-emerald-500/20 transition transform-gpu hover:-translate-y-[1.5px] active:translate-y-0 hover:from-emerald-600 hover:to-teal-600"
        >
          <span className="pointer-events-none absolute inset-0 rounded-2xl bg-[linear-gradient(180deg,rgba(255,255,255,0.18),rgba(255,255,255,0)_40%)] opacity-70" />
          <span className="relative inline-flex items-center gap-2">
            <Users className="h-4 w-4 drop-shadow-[0_1px_6px_rgba(255,255,255,0.35)]" />{' '}
            {t('nav.profiles')}
          </span>
        </Link>
        <Link
          href="/qa"
          className="relative px-4 py-2 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 text-sm font-semibold text-white ring-1 ring-inset ring-white/20 shadow-lg shadow-orange-500/20 transition transform-gpu hover:-translate-y-[1.5px] active:translate-y-0 hover:from-orange-600 hover:to-red-600"
        >
          <span className="pointer-events-none absolute inset-0 rounded-2xl bg-[linear-gradient(180deg,rgba(255,255,255,0.18),rgba(255,255,255,0)_40%)] opacity-70" />
          <span className="relative inline-flex items-center gap-2">
            <MessageSquare className="h-4 w-4 drop-shadow-[0_1px_6px_rgba(255,255,255,0.35)]" />{' '}
            {t('nav.qa')}
          </span>
        </Link>

        {/* Global Search (desktop >= lg) */}
        {mounted && (
          <div className="hidden lg:flex items-center gap-1 ml-4 w-96">
            <div className="relative flex-1" suppressHydrationWarning>
              <input
                aria-label="Global search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const q = encodeURIComponent(searchQuery.trim());
                    if (q) window.location.href = `/search?q=${q}`;
                  }
                }}
                placeholder="Search..."
                className="w-full rounded-xl bg-white/5 backdrop-blur-md border border-white/10 px-3 py-2 text-sm ring-1 ring-inset ring-white/10 shadow-inner focus:outline-none focus:ring-2 focus:ring-fuchsia-500/60 focus:border-fuchsia-500/30 transition"
              />
              <button
                aria-label="Search"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-foreground/80 hover:text-white transition"
                onClick={() => {
                  const q = encodeURIComponent(searchQuery.trim());
                  if (q) window.location.href = `/search?q=${q}`;
                }}
              >
                <Search className="h-4 w-4 drop-shadow-[0_0_6px_rgba(168,85,247,0.5)]" />
              </button>
            </div>
            {/* Theme toggle */}
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                aria-label="Toggle theme"
                title={`Theme: ${theme}`}
                onClick={cycleTheme}
                className="relative h-10 w-10 rounded-2xl bg-gradient-to-br from-fuchsia-500/20 via-violet-500/15 to-cyan-500/20 backdrop-blur-md ring-1 ring-inset ring-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_10px_30px_-12px_rgba(168,85,247,0.55)] hover:ring-fuchsia-400/70 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_18px_36px_-14px_rgba(168,85,247,0.7)] transition transform-gpu hover:-translate-y-[1.5px]"
              >
                {theme === 'light' ? (
                  <Sun className="h-5 w-5 text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.55)]" />
                ) : theme === 'dark' ? (
                  <Moon className="h-5 w-5 text-violet-300 drop-shadow-[0_0_8px_rgba(167,139,250,0.55)]" />
                ) : (
                  <Monitor className="h-5 w-5 text-cyan-300 drop-shadow-[0_0_8px_rgba(103,232,249,0.55)]" />
                )}
              </Button>
            )}
            {/* Notifications */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Notifications"
                onClick={() => setNotifsOpen((v) => !v)}
                className="relative h-10 w-10 rounded-2xl bg-gradient-to-br from-sky-500/20 to-cyan-500/20 backdrop-blur-md ring-1 ring-inset ring-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_10px_30px_-12px_rgba(56,189,248,0.55)] hover:ring-cyan-300/70 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_18px_36px_-14px_rgba(56,189,248,0.7)] transition transform-gpu hover:-translate-y-[1.5px]"
              >
                <div className="relative">
                  <Bell className="h-5 w-5 text-cyan-300 drop-shadow-[0_0_8px_rgba(56,189,248,0.65)]" />
                  {notifUnread > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center">
                      {notifUnread}
                    </span>
                  )}
                </div>
              </Button>
              {notifsOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-md border border-white/10 bg-background/95 backdrop-blur shadow-md p-1 z-50">
                  <div className="px-3 py-2 text-sm font-semibold">Notifications</div>
                  <div className="max-h-80 overflow-auto">
                    {notifList.length === 0 && (
                      <div className="px-3 py-2 text-xs text-muted-foreground">
                        No notifications
                      </div>
                    )}
                    {notifList.map((n) => (
                      <div
                        key={n.id}
                        className={`px-3 py-2 text-sm ${n.readAt ? 'opacity-75' : ''}`}
                      >
                        <div className="font-medium">{n.title}</div>
                        {n.body && <div className="text-xs text-muted-foreground">{n.body}</div>}
                        <div className="text-[10px] text-muted-foreground">
                          {new Date(n.createdAt).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-2 border-t border-white/10 space-y-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={async () => {
                        try {
                          const response = await fetch('/api/notifications/read-all', {
                            method: 'POST',
                            credentials: 'include',
                          });
                          if (response.ok) {
                            setNotifUnread(0);
                            setNotifList((l) =>
                              l.map((n) => ({ ...n, readAt: new Date().toISOString() })),
                            );
                          }
                        } catch (error) {
                          console.error('Failed to mark all as read:', error);
                        }
                      }}
                    >
                      Mark all read
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="w-full"
                      onClick={async () => {
                        try {
                          const response = await fetch('/api/notifications', {
                            method: 'POST',
                            credentials: 'include',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              type: 'system',
                              title: 'Test Notification',
                              body: 'This is a test notification to verify functionality',
                            }),
                          });
                          if (response.ok) {
                            // Refresh notifications
                            const notifs = await fetch('/api/notifications', {
                              credentials: 'include',
                            }).then((r) => r.json().catch(() => []));
                            setNotifList(notifs);
                            setNotifUnread(notifs.filter((n: any) => !n.readAt).length);
                          }
                        } catch (error) {
                          console.error('Failed to create test notification:', error);
                        }
                      }}
                    >
                      Test Notification
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Language menu */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Language"
                onClick={() => setLangOpen((v) => !v)}
                className="relative h-10 w-10 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 backdrop-blur-md ring-1 ring-inset ring-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_10px_30px_-12px_rgba(16,185,129,0.55)] hover:ring-emerald-300/70 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_18px_36px_-14px_rgba(16,185,129,0.7)] transition transform-gpu hover:-translate-y-[1.5px]"
              >
                <Languages className="h-5 w-5 text-emerald-300 drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
              </Button>
              {langOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md border border-white/10 bg-background/95 backdrop-blur shadow-md p-1 z-50">
                  {[
                    { code: 'en', label: 'English' },
                    { code: 'bn', label: 'বাংলা (Bengali)' },
                    { code: 'hi', label: 'हिन्दी (Hindi)' },
                    { code: 'ur', label: 'اردو (Urdu)' },
                    { code: 'es', label: 'Español' },
                    { code: 'fr', label: 'Français' },
                    { code: 'ar', label: 'العربية' },
                  ].map((o) => (
                    <button
                      key={o.code}
                      className={`w-full text-left px-3 py-2 rounded hover:bg-accent ${lang === o.code ? 'font-semibold' : ''}`}
                      onClick={() => setLanguage(o.code)}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mobile/Tablet Search button */}
        <div className="ml-auto lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open search"
            className="h-10 w-10 rounded-2xl bg-gradient-to-br from-fuchsia-500/20 via-violet-500/15 to-cyan-500/20 backdrop-blur-md ring-1 ring-inset ring-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_10px_30px_-12px_rgba(168,85,247,0.55)] active:scale-95 transition"
            onClick={() => {
              const q = encodeURIComponent(searchQuery.trim());
              window.location.href = q ? `/search?q=${q}` : '/search';
            }}
          >
            <Search className="h-4 w-4 text-fuchsia-300 drop-shadow-[0_0_8px_rgba(168,85,247,0.7)]" />
          </Button>
        </div>

        {/* Desktop Navigation */}
        <div className="ml-auto hidden xl:flex items-center gap-6">
          {/* Navigation Links */}
          <nav className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {t('nav.dashboard')}
            </Link>
            <Link
              href="/tutor"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {t('nav.tutor')}
            </Link>
            <Link
              href="/courses"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {t('nav.courses')}
            </Link>
            <Link
              href="/profiles"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {t('nav.profiles')}
            </Link>
            <Link
              href="/qa"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {t('nav.qa')}
            </Link>

            <Link
              href="/profile"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {t('nav.profile')}
            </Link>
          </nav>

          {/* User Info & Logout */}
          <div className="flex items-center gap-3 pl-4 border-l">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{user.name}</span>
            </div>

            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              <span className="ml-2">{t('nav.logout')}</span>
            </Button>
          </div>
        </div>

        {/* Mobile Menu - Hamburger Icon */}
        <div className="xl:hidden ml-auto">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-2xl bg-gradient-to-br from-fuchsia-500/20 via-violet-500/15 to-cyan-500/20 text-white ring-1 ring-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_10px_30px_-12px_rgba(168,85,247,0.55)] hover:ring-fuchsia-400/70 active:scale-95 transition"
                aria-label="Open mobile menu"
              >
                <Menu className="h-6 w-6 text-fuchsia-300 drop-shadow-[0_0_8px_rgba(168,85,247,0.7)]" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[88vw] sm:w-[380px] p-0 overflow-y-auto border-l border-white/10 bg-gradient-to-br from-[#0B0B1A]/90 via-[#0A0A16]/85 to-[#0B0B1A]/90 backdrop-blur-2xl ring-1 ring-white/10"
            >
              {/* Accessible title for screen readers */}
              <SheetHeader className="sr-only">
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="relative h-full p-5">
                {/* Futuristic colorful background glows */}
                <div className="pointer-events-none absolute -top-20 -right-28 h-72 w-72 rounded-full bg-fuchsia-500/25 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-cyan-500/25 blur-3xl" />
                <div className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)] bg-gradient-to-br from-fuchsia-500/10 via-violet-500/10 to-cyan-500/10" />

                {/* Profile Card */}
                <div className="relative mb-4 p-4 rounded-2xl border border-white/15 bg-gradient-to-br from-white/10 to-white/[0.04] backdrop-blur-xl shadow-[0_12px_48px_-12px_rgba(124,58,237,0.35)]">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-fuchsia-500 to-violet-500 flex items-center justify-center text-white shadow-[0_10px_30px_-12px_rgba(168,85,247,0.6)] ring-1 ring-white/20">
                        <User className="h-5 w-5" />
                      </div>
                    </div>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {(user.role || 'user').toString().replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick Action */}
                <Button
                  asChild
                  className="w-full justify-center mb-4 rounded-xl bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-600 hover:to-sky-600 text-white shadow"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Link href="/launch">
                    <span className="flex items-center gap-2">
                      <Rocket className="h-4 w-4" /> {t('pages.launchTitle')}
                    </span>
                  </Link>
                </Button>

                {/* Navigation Links - Moved from top bar */}
                <div className="flex flex-col gap-2">
                  <Button
                    asChild
                    className="w-full justify-start rounded-2xl px-5 py-4 text-white shadow-lg shadow-indigo-500/20 ring-1 ring-white/10 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 transition-transform hover:scale-[1.01]"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Link href="/certificates" className="flex items-center">
                      <Triangle className="h-4 w-4 mr-3 text-white" />
                      {t('nav.certificates')}
                    </Link>
                  </Button>
                  <Button
                    asChild
                    className="w-full justify-start rounded-2xl px-5 py-4 text-white shadow-lg shadow-violet-500/20 ring-1 ring-white/10 bg-gradient-to-r from-violet-500 to-fuchsia-600 hover:from-violet-600 hover:to-fuchsia-700 transition-transform hover:scale-[1.01]"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Link href="/resume" className="flex items-center">
                      <Triangle className="h-4 w-4 mr-3 text-white" />
                      {t('nav.resume')}
                    </Link>
                  </Button>
                  <Button
                    asChild
                    className="w-full justify-start rounded-2xl px-5 py-4 text-white shadow-lg shadow-emerald-500/20 ring-1 ring-white/10 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 transition-transform hover:scale-[1.01]"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Link href="/job-portal" className="flex items-center">
                      <LayoutDashboard className="h-4 w-4 mr-3 text-white" />
                      {t('nav.jobPortal')}
                    </Link>
                  </Button>
                  <Button
                    asChild
                    className="w-full justify-start rounded-2xl px-5 py-4 text-white shadow-lg shadow-fuchsia-500/20 ring-1 ring-white/10 bg-gradient-to-r from-fuchsia-500 to-violet-500 hover:from-fuchsia-600 hover:to-violet-600 transition-transform hover:scale-[1.01]"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Link href="/discussion-forums" className="flex items-center">
                      <MessageSquare className="h-4 w-4 mr-3 text-white" />
                      {t('nav.discussionForums')}
                    </Link>
                  </Button>
                  <Button
                    asChild
                    className="w-full justify-start rounded-2xl px-5 py-4 text-white shadow-lg shadow-blue-500/20 ring-1 ring-white/10 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 transition-transform hover:scale-[1.01]"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Link href="/chat" className="flex items-center">
                      <MessageSquare className="h-4 w-4 mr-3 text-white" />
                      {t('nav.chat')}
                    </Link>
                  </Button>
                  <Button
                    asChild
                    className="w-full justify-start rounded-2xl px-5 py-4 text-white shadow-lg shadow-sky-500/20 ring-1 ring-white/10 bg-gradient-to-r from-sky-500 to-fuchsia-500 hover:from-sky-600 hover:to-fuchsia-600 transition-transform hover:scale-[1.01]"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Link href="/study-together" className="flex items-center">
                      <Users className="h-4 w-4 mr-3 text-white" />
                      {t('nav.studyTogether')}
                    </Link>
                  </Button>
                  <Button
                    asChild
                    className="w-full justify-start rounded-2xl px-5 py-4 text-white shadow-lg shadow-violet-500/20 ring-1 ring-white/10 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 transition-transform hover:scale-[1.01]"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Link href="/exam" className="flex items-center">
                      <GraduationCap className="h-4 w-4 mr-3 text-white" />
                      {t('nav.exam')}
                    </Link>
                  </Button>
                  <Button
                    asChild
                    className="w-full justify-start rounded-2xl px-5 py-4 text-white shadow-lg shadow-indigo-500/20 ring-1 ring-white/10 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 transition-transform hover:scale-[1.01]"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Link href="/virtual-classrooms" className="flex items-center">
                      <Video className="h-4 w-4 mr-3 text-white" />
                      {t('nav.virtualClassrooms')}
                    </Link>
                  </Button>
                  <Button
                    asChild
                    className="w-full justify-start rounded-2xl px-5 py-4 text-white shadow-lg shadow-green-500/20 ring-1 ring-white/10 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 transition-transform hover:scale-[1.01]"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Link href="/resources" className="flex items-center">
                      <FileText className="h-4 w-4 mr-3 text-white" />
                      {t('nav.resources')}
                    </Link>
                  </Button>

                  <Button
                    asChild
                    className="w-full justify-start rounded-2xl px-5 py-4 text-white shadow-lg shadow-emerald-500/20 ring-1 ring-white/10 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 transition-transform hover:scale-[1.01]"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Link href="/mentorship" className="flex items-center">
                      <Users className="h-4 w-4 mr-3 text-white" />
                      Mentorship
                    </Link>
                  </Button>

                  <Button
                    asChild
                    className="w-full justify-start rounded-2xl px-5 py-4 text-white shadow-lg shadow-amber-500/20 ring-1 ring-white/10 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 transition-transform hover:scale-[1.01]"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Link href="/store" className="flex items-center">
                      <FileText className="h-4 w-4 mr-3 text-white" />
                      Store
                    </Link>
                  </Button>

                  <Button
                    asChild
                    className="w-full justify-start rounded-2xl px-5 py-4 text-white shadow-lg shadow-teal-500/20 ring-1 ring-white/10 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 transition-transform hover:scale-[1.01]"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Link href="/mental-health" className="flex items-center">
                      <Heart className="h-4 w-4 mr-3 text-white" />
                      Mental Health
                    </Link>
                  </Button>

                  <Button
                    asChild
                    className="w-full justify-start rounded-2xl px-5 py-4 text-white shadow-[0_18px_44px_-18px_rgba(99,102,241,0.55)] ring-1 ring-white/15 bg-gradient-to-br from-indigo-600 to-fuchsia-600 hover:from-indigo-500 hover:to-fuchsia-500 transition-transform hover:scale-[1.02]"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Link href="/subscriptions" className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-3 text-white" />
                      Subscriptions
                    </Link>
                  </Button>

                  {/* User-specific pages */}
                  <Button
                    asChild
                    className="w-full justify-start rounded-2xl px-5 py-4 text-white shadow-[0_18px_44px_-18px_rgba(236,72,153,0.55)] ring-1 ring-white/15 bg-gradient-to-br from-pink-600 to-violet-600 hover:from-pink-500 hover:to-violet-500 transition-transform hover:scale-[1.02]"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Link href="/profile" className="flex items-center">
                      <User className="h-4 w-4 mr-3 text-white" />
                      {t('nav.profile')}
                    </Link>
                  </Button>
                  <Button
                    asChild
                    className="w-full justify-start rounded-2xl px-5 py-4 text-white shadow-[0_18px_44px_-18px_rgba(100,116,139,0.55)] ring-1 ring-white/15 bg-gradient-to-br from-slate-600 to-zinc-600 hover:from-slate-500 hover:to-zinc-500 transition-transform hover:scale-[1.02]"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Link href="/settings" className="flex items-center">
                      <SettingsIcon className="h-4 w-4 mr-3 text-white" />
                      {t('nav.settings')}
                    </Link>
                  </Button>
                  {user.role === 'admin' && (
                    <Button
                      asChild
                      className="w-full justify-start rounded-2xl px-5 py-4 text-white shadow-[0_18px_44px_-18px_rgba(239,68,68,0.55)] ring-1 ring-white/15 bg-gradient-to-br from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 transition-transform hover:scale-[1.02]"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Link href="/admin" className="flex items-center">
                        <Shield className="h-4 w-4 mr-3 text-white" />
                        {t('nav.admin')}
                      </Link>
                    </Button>
                  )}
                </div>

                {/* Logout */}
                <div className="border-t border-white/10 mt-5 pt-4">
                  <Button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full justify-center rounded-2xl px-5 py-4 text-white shadow-[0_18px_44px_-18px_rgba(239,68,68,0.55)] ring-1 ring-white/15 bg-gradient-to-br from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 transition-transform hover:scale-[1.02]"
                  >
                    <span className="flex items-center gap-2">
                      <LogOut className="h-4 w-4" />
                      {t('nav.logout')}
                    </span>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
