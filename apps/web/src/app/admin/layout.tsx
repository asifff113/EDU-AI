'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        const user = await res.json();
        if (!res.ok || user.role !== 'admin') router.replace('/');
      } catch {
        router.replace('/');
      }
    };
    check();
  }, [router]);

  return <>{children}</>;
}
