import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { differenceInDays } from 'date-fns';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { cn, formatNumber } from '@/lib/utils';
import { useSettings } from '@/context/SettingsContext';

const icons = {
  TrendingUp,
  TrendingDown,
  Minus,
};

export function KPICard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  format = 'currency',
  loading = false,
  className,
}) {
  const { formatCurrency } = useSettings();

  if (loading) {
    return <SkeletonCard className={className} />;
  }

  const isPositive = change > 0;
  const isNegative = change < 0;
  const isNeutral = change === 0;

  const TrendIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;
  const trendColor = isPositive
    ? 'text-emerald-600 bg-emerald-50'
    : isNegative
    ? 'text-rose-600 bg-rose-50'
    : 'text-slate-500 bg-slate-100';

  const formattedValue =
    format === 'currency'
      ? formatCurrency(value)
      : format === 'number'
      ? formatNumber(value)
      : value;

  return (
    <div
      className={cn(
        'bg-white rounded-lg border border-slate-200 p-3 sm:p-6 shadow-sm transition-shadow hover:shadow-md',
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-slate-500 truncate">{title}</p>
          <p className="text-lg sm:text-2xl font-bold text-slate-900 mt-0.5 sm:mt-1 truncate">{formattedValue}</p>
          
          {change !== undefined && change !== null && (
            <div className="flex items-center gap-1 mt-1 sm:mt-2">
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 text-xs font-medium px-1.5 sm:px-2 py-0.5 rounded-full',
                  trendColor
                )}
              >
                <TrendIcon className="w-3 h-3" />
                {isPositive ? '+' : ''}
                {change}%
              </span>
              <span className="text-xs text-slate-500 hidden sm:inline">{changeLabel}</span>
            </div>
          )}
        </div>

        {Icon && (
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
            <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
          </div>
        )}
      </div>
    </div>
  );
}

export function KPICardsGrid({ data, loading, filters }) {
  // Calculate comparison label based on date range
  const getComparisonLabel = () => {
    if (!filters?.startDate || !filters?.endDate) return 'vs previous period';
    
    const days = differenceInDays(new Date(filters.endDate), new Date(filters.startDate));
    
    if (days <= 7) return 'vs last week';
    if (days <= 31) return 'vs last month';
    if (days <= 90) return 'vs last quarter';
    if (days <= 365) return 'vs last year';
    return 'vs previous period';
  };

  const changeLabel = getComparisonLabel();

  const cards = [
    {
      title: 'Total Sales',
      value: data?.totalSales ?? 0,
      change: 12.5,
      changeLabel,
      icon: icons.TrendingUp,
      format: 'currency',
    },
    {
      title: 'Total Profit',
      value: data?.totalProfit ?? 0,
      change: 8.2,
      changeLabel,
      icon: icons.TrendingUp,
      format: 'currency',
    },
    {
      title: 'Total Orders',
      value: data?.totalOrders ?? 0,
      change: -3.1,
      changeLabel,
      icon: icons.TrendingDown,
      format: 'number',
    },
    {
      title: 'Average Order Value',
      value: data?.averageOrderValue ?? 0,
      change: 5.7,
      changeLabel,
      icon: icons.TrendingUp,
      format: 'currency',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <KPICard
          key={card.title}
          {...card}
          loading={loading}
        />
      ))}
    </div>
  );
}
