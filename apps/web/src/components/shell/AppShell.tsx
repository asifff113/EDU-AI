'use client';

import { useEffect, useState } from 'react';
import { TopBar } from './TopBar';
import { PageHeader } from './PageHeader';
import { RightRail } from './RightRail';
import { GlobalSearch } from './GlobalSearch';
import { QuickAdd } from './QuickAdd';
import { HelpDialog } from './HelpDialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/contexts/AppContext';

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const { isRightRailCollapsed, setRightRailCollapsed } = useAppContext();
  const [openSearch, setOpenSearch] = useState(false);
  const [openQuickAdd, setOpenQuickAdd] = useState(false);
  const [openHelp, setOpenHelp] = useState(false);
  const [openContextSheet, setOpenContextSheet] = useState(false);
  const [isLg, setIsLg] = useState<boolean>(false);

  // Keep primary CTA visible on long pages: the header is sticky in PageHeader
  useEffect(() => {
    // Respect reduced motion automatically via CSS utilities
  }, []);

  useEffect(() => {
    const onResize = () => {
      setIsLg(window.matchMedia('(min-width: 1024px)').matches);
    };
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <div className="min-h-screen">
      <TopBar />

      {/* PageHeader removed as requested */}

      {/* Responsive layout */}
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6">
          {/* Main content area */}
          <main className="min-h-[50vh] pt-4" aria-live="polite">
            {children}
          </main>

          {/* Right rail removed */}
        </div>
      </div>

      {/* Context button removed */}

      {/* Bottom sheet for <1024px is handled by the same Sheet above since lg:hidden */}

      <GlobalSearch open={openSearch} onOpenChange={setOpenSearch} />
      <QuickAdd open={openQuickAdd} onOpenChange={setOpenQuickAdd} />
      <HelpDialog open={openHelp} onOpenChange={setOpenHelp} />
    </div>
  );
}
