'use client';

import { createContext, useContext, useMemo, useState, useEffect, useCallback } from 'react';

type UserSummary = {
  id: string;
  name: string;
  avatarUrl: string;
  role?: string;
  email?: string;
};

type AppContextValue = {
  user: UserSummary;
  notificationsCount: number;
  pageContext: string;
  setPageContext: (ctx: string) => void;
  isRightRailCollapsed: boolean;
  setRightRailCollapsed: (collapsed: boolean) => void;
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

type AppContextProviderProps = {
  children: React.ReactNode;
  user?: UserSummary;
};

const DEMO_USER: UserSummary = {
  id: 'demo-user',
  name: 'Alex Learner',
  avatarUrl:
    'https://api.dicebear.com/9.x/initials/svg?seed=Alex%20Learner&backgroundType=gradientLinear',
  role: 'student',
  email: 'demo@example.com',
};

export function AppContextProvider({ children, user }: AppContextProviderProps) {
  const actualUser: UserSummary = user ?? DEMO_USER;

  const [notificationsCount] = useState<number>(0);
  const [pageContext, setPageContext] = useState<string>('dashboard');

  const storageKey = `eduai:right-rail:collapsed:${actualUser.id}`;
  const [isRightRailCollapsed, setIsRightRailCollapsed] = useState<boolean>(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored !== null) {
        setIsRightRailCollapsed(stored === 'true');
      }
    } catch {}
  }, [storageKey]);

  const setRightRailCollapsed = useCallback(
    (collapsed: boolean) => {
      setIsRightRailCollapsed(collapsed);
      try {
        localStorage.setItem(storageKey, String(collapsed));
      } catch {}
    },
    [storageKey],
  );

  const value = useMemo<AppContextValue>(
    () => ({
      user: actualUser,
      notificationsCount,
      pageContext,
      setPageContext,
      isRightRailCollapsed,
      setRightRailCollapsed,
    }),
    [actualUser, notificationsCount, pageContext, isRightRailCollapsed, setRightRailCollapsed],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    // Return a safe default instead of throwing to avoid SSR or hydration-time crashes
    return {
      user: DEMO_USER,
      notificationsCount: 0,
      pageContext: 'dashboard',
      setPageContext: () => {},
      isRightRailCollapsed: false,
      setRightRailCollapsed: () => {},
    };
  }
  return ctx;
}
