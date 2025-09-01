'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type HelpDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function HelpDialog({ open, onOpenChange }: HelpDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Help & Shortcuts</DialogTitle>
          <DialogDescription>Quick reference</DialogDescription>
        </DialogHeader>
        <div className="text-sm text-muted-foreground space-y-2">
          <p>
            <kbd className="px-1 py-0.5 rounded border">⌘</kbd>/
            <kbd className="px-1 py-0.5 rounded border">Ctrl</kbd> +{' '}
            <kbd className="px-1 py-0.5 rounded border">K</kbd> — Open global search
          </p>
          <p>
            <kbd className="px-1 py-0.5 rounded border">/</kbd> — Focus search input
          </p>
          <p>
            <kbd className="px-1 py-0.5 rounded border">N</kbd> — Quick Add
          </p>
          <p>
            <kbd className="px-1 py-0.5 rounded border">?</kbd> — Help
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
