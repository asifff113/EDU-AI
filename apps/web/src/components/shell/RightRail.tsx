'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, MoreHorizontal } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/contexts/AppContext';

type ModuleKey = 'dueSoon' | 'upcoming' | 'notes' | 'extra1' | 'extra2';

const ALL_MODULES: Array<{ key: ModuleKey; title: string; empty: string }> = [
  { key: 'dueSoon', title: 'Due soon', empty: 'Nothing due 🎉' },
  { key: 'upcoming', title: 'Upcoming', empty: 'No events' },
  { key: 'notes', title: 'Notes', empty: 'Start a note from any lesson' },
  { key: 'extra1', title: 'Extra', empty: '—' },
  { key: 'extra2', title: 'Extra', empty: '—' },
];

type RightRailProps = {
  variant?: 'inline' | 'sheet';
};

export function RightRail({ variant = 'inline' }: RightRailProps) {
  const { isRightRailCollapsed, setRightRailCollapsed } = useAppContext();
  const [openKeys, setOpenKeys] = useState<Record<ModuleKey, boolean>>({
    dueSoon: true,
    upcoming: true,
    notes: true,
    extra1: false,
    extra2: false,
  });

  const modules = useMemo(() => [], []);

  if (variant === 'inline') return null;

  const Content = (
    <div className="h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto px-4 py-4 space-y-4">
      {modules.map((m) => (
        <section key={m.key} aria-labelledby={`rr-${m.key}`} className="contents">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle id={`rr-${m.key}`}>{m.title}</CardTitle>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={openKeys[m.key] ? 'Collapse section' : 'Expand section'}
                  onClick={() => setOpenKeys((s) => ({ ...s, [m.key]: !s[m.key] }))}
                >
                  {openKeys[m.key] ? (
                    <ChevronUp className="size-4" />
                  ) : (
                    <ChevronDown className="size-4" />
                  )}
                </Button>
                <Button variant="ghost" size="icon" aria-label="More">
                  <MoreHorizontal className="size-4" />
                </Button>
              </div>
            </CardHeader>
            {openKeys[m.key] && (
              <CardContent>
                <div className="text-sm text-muted-foreground">{m.empty}</div>
              </CardContent>
            )}
          </Card>
        </section>
      ))}

      {variant === 'inline' && (
        <div className="pt-2">
          <Button variant="outline" className="w-full" onClick={() => setRightRailCollapsed(true)}>
            Collapse rail
          </Button>
        </div>
      )}
    </div>
  );

  if (variant === 'inline') return null;

  return null;
}
