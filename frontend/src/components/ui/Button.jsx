import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const variants = {
  default: 'bg-primary text-primary-foreground hover:bg-primary-600 active:bg-primary-700',
  secondary: 'bg-secondary text-secondary-foreground border border-border hover:bg-accent hover:text-accent-foreground',
  ghost: 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
  danger: 'bg-destructive text-destructive-foreground hover:bg-rose-700 active:bg-rose-800',
};

const sizes = {
  default: 'h-10 px-4 py-2',
  sm: 'h-8 px-3 text-xs',
  lg: 'h-12 px-6 text-base',
  icon: 'h-10 w-10',
  'icon-sm': 'h-8 w-8',
};

export function Button({
  className,
  variant = 'default',
  size = 'default',
  isLoading = false,
  disabled = false,
  children,
  ...props
}) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
