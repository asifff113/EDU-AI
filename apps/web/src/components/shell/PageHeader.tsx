import { Button } from '@/components/ui/button';

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  primaryCta: { label: string; onClick?: () => void; href?: string };
  secondaryActions?: React.ReactNode;
  breadcrumbs?: Array<{ label: string; href?: string }>;
};

export function PageHeader({
  title,
  subtitle,
  primaryCta,
  secondaryActions,
  breadcrumbs,
}: PageHeaderProps) {
  return (
    <div className="sticky top-16 z-40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="w-full px-0 py-1 flex items-center justify-between">
        {/* Left side: title, subtitle, breadcrumbs */}
        <div className="min-w-0 flex-1">
          {breadcrumbs && breadcrumbs.length > 1 && (
            <nav aria-label="Breadcrumbs" className="text-sm text-muted-foreground truncate">
              {breadcrumbs.map((bc, i) => (
                <span key={i} className="mr-1">
                  {i > 0 && <span className="mx-1">/</span>}
                  {bc.href ? (
                    <a href={bc.href} className="hover:underline">
                      {bc.label}
                    </a>
                  ) : (
                    <span aria-current="page">{bc.label}</span>
                  )}
                </span>
              ))}
            </nav>
          )}
          <h1 className="text-sm sm:text-base font-semibold truncate">{title}</h1>
          {subtitle && <p className="text-muted-foreground truncate">{subtitle}</p>}
        </div>
        {/* Right side: actions */}
        <div className="flex items-center gap-2 justify-end flex-shrink-0">
          {secondaryActions}
          {primaryCta.href ? (
            <a href={primaryCta.href}>
              <Button>{primaryCta.label}</Button>
            </a>
          ) : (
            <Button onClick={primaryCta.onClick}>{primaryCta.label}</Button>
          )}
        </div>
      </div>
    </div>
  );
}
