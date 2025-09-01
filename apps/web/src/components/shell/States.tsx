import { Card, CardContent } from '@/components/ui/card';

export function EmptyState({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <Card>
      <CardContent>
        <div className="py-10 text-center space-y-2">
          <div className="text-muted-foreground">{title}</div>
          {action}
        </div>
      </CardContent>
    </Card>
  );
}

export function LoadingState() {
  return (
    <div className="space-y-3">
      <div className="h-8 w-3/4 bg-muted/50 rounded" />
      <div className="h-4 w-1/2 bg-muted/50 rounded" />
      <div className="h-24 w-full bg-muted/50 rounded" />
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <Card>
      <CardContent>
        <div className="py-6 text-center space-y-2">
          <div className="text-red-600 dark:text-red-400">{message}</div>
          {onRetry && (
            <button className="text-sm underline" onClick={onRetry}>
              Retry
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
