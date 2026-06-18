import Link from 'next/link';

export function LoadingState({ message = 'Loading...' }: { message?: string }) {
  return (
    <main className="mx-auto max-w-6xl px-4 py-16">
      <p className="text-center text-slate-500">{message}</p>
    </main>
  );
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return <div className="wh-empty">{children}</div>;
}

export function BackLink({ href = '/', children = 'Back to jobs' }: { href?: string; children?: React.ReactNode }) {
  return (
    <Link href={href} className="wh-link inline-flex items-center gap-1">
      <span aria-hidden="true">←</span>
      {children}
    </Link>
  );
}

export function StatusBadge({ status }: { status: 'pending' | 'accepted' | 'rejected' | 'active' | 'flagged' | 'removed' | string }) {
  const styles: Record<string, string> = {
    pending: 'wh-badge-amber',
    accepted: 'wh-badge-emerald',
    rejected: 'wh-badge-red',
    active: 'wh-badge-emerald',
    flagged: 'wh-badge-amber',
    removed: 'wh-badge-red',
  };

  return (
    <span className={`${styles[status] || 'wh-pill'} capitalize`}>
      {status}
    </span>
  );
}

export function PageSection({
  title,
  subtitle,
  badge,
  action,
  children,
  className = '',
}: {
  title: string;
  subtitle?: string;
  badge?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <main className={`mx-auto max-w-6xl px-4 py-10 md:py-14 ${className}`}>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <header>
          {badge && <span className="wh-badge">{badge}</span>}
          <h1 className={`wh-page-title ${badge ? 'mt-3' : ''}`}>{title}</h1>
          {subtitle && <p className="wh-page-subtitle">{subtitle}</p>}
        </header>
        {action}
      </div>
      {children}
    </main>
  );
}
