import { cn } from '@/lib/utils/cn';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  variant?: 'default' | 'shimmer' | 'wave';
}

export function Skeleton({
  className,
  variant = 'shimmer',
  ...props
}: SkeletonProps) {
  const baseClasses = 'rounded-md bg-muted relative overflow-hidden';

  const variantClasses = {
    default: 'animate-pulse',
    shimmer: 'animate-shimmer',
    wave: 'animate-pulse',
  };

  return (
    <div
      className={cn(baseClasses, variantClasses[variant], className)}
      {...props}
    >
      {variant === 'wave' && (
        <div className="animate-shimmer-wave absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      )}
    </div>
  );
}

export function SkeletonText({
  lines = 3,
  className,
  variant = 'shimmer',
}: {
  lines?: number;
  className?: string;
  variant?: 'default' | 'shimmer' | 'wave';
}) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant={variant}
          className={cn('h-4', i === lines - 1 ? 'w-3/4' : 'w-full')}
        />
      ))}
    </div>
  );
}

export function SkeletonTextLoading({
  text = 'Loading...',
  className,
  delay = 0,
}: {
  text?: string;
  className?: string;
  delay?: number;
}) {
  return (
    <span
      className={cn(
        'animate-text-loading inline-block bg-gradient-to-r from-slate-300 via-slate-500 to-slate-300 bg-clip-text text-transparent dark:from-slate-600 dark:via-slate-400 dark:to-slate-600',
        className
      )}
      style={{
        animationDelay: `${delay}ms`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}
    >
      {text}
    </span>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-lg border p-4', className)}>
      <Skeleton className="mb-4 h-4 w-1/4" />
      <SkeletonText lines={3} />
    </div>
  );
}
