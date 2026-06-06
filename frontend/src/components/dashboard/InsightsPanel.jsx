import { memo } from 'react';
import { Lightbulb, TrendingUp, TrendingDown, AlertTriangle, Info } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { cn, formatNumber } from '@/lib/utils';
import { useSettings } from '@/context/SettingsContext';

const icons = {
  positive: TrendingUp,
  negative: TrendingDown,
  warning: AlertTriangle,
  info: Info,
};

const typeStyles = {
  positive: {
    icon: 'text-emerald-600 dark:text-emerald-400',
    badge: 'success',
    border: 'border-emerald-200 dark:border-emerald-800',
    bg: 'bg-emerald-50/50 dark:bg-emerald-950/30',
  },
  negative: {
    icon: 'text-rose-600 dark:text-rose-400',
    badge: 'danger',
    border: 'border-rose-200 dark:border-rose-800',
    bg: 'bg-rose-50/50 dark:bg-rose-950/30',
  },
  warning: {
    icon: 'text-amber-600 dark:text-amber-400',
    badge: 'warning',
    border: 'border-amber-200 dark:border-amber-800',
    bg: 'bg-amber-50/50 dark:bg-amber-950/30',
  },
  info: {
    icon: 'text-primary-600 dark:text-primary-400',
    badge: 'default',
    border: 'border-primary-200 dark:border-primary-800',
    bg: 'bg-primary-50/50 dark:bg-primary-950/30',
  },
};

export function InsightCard({ insight, index }) {
  const Icon = icons[insight.type] || icons.info;
  const styles = typeStyles[insight.type] || typeStyles.info;

  return (
    <div
      className={cn(
        'flex gap-2 sm:gap-4 p-3 sm:p-4 rounded-lg border transition-all hover:shadow-sm',
        styles.border,
        styles.bg
      )}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className={cn('flex-shrink-0 mt-0.5', styles.icon)}>
        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-1 sm:gap-2">
          <h4 className="text-xs sm:text-sm font-medium text-slate-900 leading-tight">
            {insight.title}
          </h4>
          <Badge variant={styles.badge} size="sm" className="text-xs hidden sm:inline-flex">
            {insight.type}
          </Badge>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
          {insight.description}
        </p>
        {insight.metric && (
          <p className="text-xs sm:text-sm font-medium text-slate-900 mt-1 sm:mt-2">
            {insight.metric}
          </p>
        )}
      </div>
    </div>
  );
}

function InsightsPanelComponent({ data, loading, title = 'AI Insights', subtitle = 'Automated analysis of your data' }) {
  if (loading) {
    return (
      <div className="dashboard-card">
        <div className="dashboard-card-header">
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="dashboard-card-content space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={`skeleton-${i}`} className="flex gap-4">
              <Skeleton className="w-5 h-5 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Use provided insights or default
  const insights = data || getDefaultInsights();

  return (
    <div className="dashboard-card">
      <div className="dashboard-card-header">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
            <Lightbulb className="w-4 h-4 text-primary-600" />
          </div>
          <div>
            <h3 className="dashboard-card-title">{title}</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {subtitle}
            </p>
          </div>
        </div>
      </div>
      <div className="dashboard-card-content">
        <div className="space-y-3">
          {insights.map((insight, index) => (
            <InsightCard key={index} insight={insight} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
}

// Default insights when no data is available
function getDefaultInsights() {
  return [
    {
      type: 'info',
      title: 'Welcome to AI Insights',
      description: 'Select a date range to see AI-powered analysis of your sales data, trends, and opportunities.',
      metric: 'Select date range',
    },
    {
      type: 'info',
      title: 'Smart Analysis Ready',
      description: 'Our AI will analyze your KPIs, trends, category performance, and regional data once data is loaded.',
    },
  ];
}

export const InsightsPanel = memo(InsightsPanelComponent, (prevProps, nextProps) => {
  return (
    prevProps.loading === nextProps.loading &&
    JSON.stringify(prevProps.data) === JSON.stringify(nextProps.data)
  );
});

function TopProductsPanelComponent({ data, loading }) {
  const { formatCurrency } = useSettings();

  if (loading) {
    return (
      <div className="dashboard-card">
        <div className="dashboard-card-header">
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="dashboard-card-content space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={`skeleton-${i}`} className="flex items-center gap-3">
              <Skeleton className="w-6 h-6 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const products = data || [];

  return (
    <div className="dashboard-card">
      <div className="dashboard-card-header">
        <div>
          <h3 className="dashboard-card-title">Top Products</h3>
          <p className="text-sm text-slate-500 mt-0.5">
            Best performing products by sales
          </p>
        </div>
      </div>
      <div className="dashboard-card-content">
        <div className="space-y-3">
          {products.slice(0, 5).map((product, index) => (
            <div
              key={`${product.product || 'product'}-${index}`}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <div className={cn(
                'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                index === 0 ? 'bg-primary-100 text-primary-700' :
                index === 1 ? 'bg-slate-200 text-slate-700' :
                index === 2 ? 'bg-slate-300 text-slate-700' :
                'bg-slate-100 text-slate-600'
              )}>
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {product.product}
                </p>
                <p className="text-xs text-slate-500">
                  {product.category} • {formatNumber(product.unitsSold)} sold
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900">
                  {formatCurrency(product.sales)}
                </p>
                <p className={cn(
                  'text-xs',
                  product.profit > 0 ? 'text-emerald-600' : 'text-rose-600'
                )}>
                  {formatCurrency(product.profit)} profit
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export const TopProductsPanel = memo(TopProductsPanelComponent, (prevProps, nextProps) => {
  return (
    prevProps.loading === nextProps.loading &&
    JSON.stringify(prevProps.data) === JSON.stringify(nextProps.data)
  );
});
