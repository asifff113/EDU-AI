'use client';
import { AppContextProvider } from '@/contexts/AppContext';
import { AppShell } from '@/components/shell/AppShell';
import { Navbar } from '@/components/Navbar';
import { useEffect, useState } from 'react';

type UserSummary = {
  id: string;
  name: string;
  avatarUrl: string;
  role?: string;
  email?: string;
};

export default function ClientRoot({
  isAuthenticated,
  children,
}: {
  isAuthenticated: boolean;
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<UserSummary | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      // Fetch user info from /api/auth/me
      fetch('/api/auth/me', { credentials: 'include' })
        .then((res) => res.json())
        .then((data) => {
          console.log('User data from API:', data); // Debug log
          if (data && !data.error) {
            // Transform database user data to UserSummary
            const fullName =
              data.firstName && data.lastName
                ? `${data.firstName} ${data.lastName}`
                : data.username || data.email?.split('@')[0] || 'User';

            setUser({
              id: data.id,
              name: fullName,
              avatarUrl: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(fullName)}&backgroundType=gradientLinear`,
              role: data.role,
              email: data.email,
            });
          }
        })
        .catch((error) => {
          console.error('Error fetching user data:', error);
        });
    }
  }, [isAuthenticated]);

  return (
    <AppContextProvider user={user || undefined}>
      {isAuthenticated ? (
        <AppShell>{children}</AppShell>
      ) : (
        <>
          <Navbar />
          {children}
        </>
      )}
    </AppContextProvider>
  );
}
