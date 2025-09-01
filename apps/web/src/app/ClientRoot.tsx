'use client';
import { AppContextProvider } from '@/contexts/AppContext';
import { AppShell } from '@/components/shell/AppShell';
import { Navbar } from '@/components/Navbar';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

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
  const pathname = usePathname();

  // Force public pages to show the public navbar regardless of auth status
  const publicPages = ['/', '/login', '/register', '/forgot-password'];
  const isPublicPage = publicPages.includes(pathname);

  // Debug logging
  useEffect(() => {
    console.log('ClientRoot Debug:', {
      pathname,
      isAuthenticated,
      isPublicPage,
      willShowAppShell: isAuthenticated && !isPublicPage,
      willShowNavbar: !isAuthenticated || isPublicPage,
    });
  }, [pathname, isAuthenticated, isPublicPage]);

  useEffect(() => {
    if (isAuthenticated && !isPublicPage) {
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
  }, [isAuthenticated, isPublicPage]);

  return (
    <AppContextProvider user={user || undefined}>
      {isAuthenticated && !isPublicPage ? (
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
