import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import ClientRoot from './ClientRoot';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Edu AI',
  description: 'A futuristic, colorful, highly-performant education platform',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Server-side check for an auth cookie. If present we render the full AppShell.
  // If absent we render pages without the interior dashboard UI so protected
  // components aren't visible to unauthenticated visitors.
  const cookieStore = await cookies();
  const token = cookieStore.get('eduai_token')?.value;
  const isAuthenticated = Boolean(token);
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <ClientRoot isAuthenticated={isAuthenticated}>{children}</ClientRoot>
        </Providers>
      </body>
    </html>
  );
}
