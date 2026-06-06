import { useState, useEffect, useCallback } from 'react';
import { Calendar, BarChart3, PieChart, Globe } from 'lucide-react';
import { SalesTrendChart } from '@/components/dashboard/SalesTrendChart';
import { CategoryChart } from '@/components/dashboard/CategoryChart';
import { RegionChart } from '@/components/dashboard/RegionChart';
import { useSalesTrend, useCategoryBreakdown, useRegionAnalysis, useFilters } from '@/hooks/useDashboard';
import { useHeader } from '@/components/layout/Layout';
import { subDays, format } from 'date-fns';

const defaultDateRange = {
  startDate: format(subDays(new Date(), 90), 'yyyy-MM-dd'),
  endDate: format(new Date(), 'yyyy-MM-dd'),
};

export function Analytics() {
  const [period, setPeriod] = useState('monthly');
  const { filters, setFilters } = useFilters({ ...defaultDateRange });
  const { updateHeader } = useHeader();

  const { data: trendData, loading: trendLoading } = useSalesTrend(period, filters);
  const { data: categoryData, loading: categoryLoading } = useCategoryBreakdown(filters);
  const { data: regionData, loading: regionLoading } = useRegionAnalysis(filters);

  // Stable callback for date range changes
  const handleDateRangeChange = useCallback((range) => {
    setFilters(prev => ({ ...prev, startDate: range.startDate, endDate: range.endDate }));
  }, [setFilters]);

  // Update header state for TopBar
  useEffect(() => {
    updateHeader({
      dateRange: { startDate: filters.startDate, endDate: filters.endDate },
      onDateRangeChange: handleDateRangeChange,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.startDate, filters.endDate, updateHeader, handleDateRangeChange]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Detailed analysis of your sales performance
          </p>
        </div>

        {/* Period selector */}
        <div className="flex items-center gap-2 bg-card rounded-lg border border-border p-1 w-fit">
          <button
            onClick={() => setPeriod('daily')}
            className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors ${
              period === 'daily'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent'
            }`}
          >
            Daily
          </button>
          <button
            onClick={() => setPeriod('monthly')}
            className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors ${
              period === 'monthly'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent'
            }`}
          >
            Monthly
          </button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        {/* Analysis Period Card */}
        <div className="bg-card rounded-lg border border-border p-3 sm:p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-primary" />
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Analysis Period</p>
          </div>
          <p className="text-lg font-semibold text-card-foreground">
            {filters.startDate && filters.endDate 
              ? `${format(new Date(filters.startDate), 'MMM d')} - ${format(new Date(filters.endDate), 'MMM d, yyyy')}`
              : 'Last 90 Days'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {trendData?.length || 0} {period === 'daily' ? 'days' : 'months'} of data
          </p>
        </div>

        {/* Data Points Card */}
        <div className="bg-card rounded-lg border border-border p-3 sm:p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Data Points</p>
          </div>
          <p className="text-lg font-semibold text-card-foreground">
            {trendData?.length || 0}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {period === 'daily' ? 'Daily records' : 'Monthly summaries'}
          </p>
        </div>

        {/* Categories Card */}
        <div className="bg-card rounded-lg border border-border p-3 sm:p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-2">
            <PieChart className="w-4 h-4 text-primary" />
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Categories</p>
          </div>
          <p className="text-lg font-semibold text-card-foreground">
            {categoryData?.length || 0}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Product segments tracked
          </p>
        </div>

        {/* Regions Card */}
        <div className="bg-card rounded-lg border border-border p-3 sm:p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-4 h-4 text-primary" />
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Regions</p>
          </div>
          <p className="text-lg font-semibold text-card-foreground">
            {regionData?.length || 0}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Sales territories covered
          </p>
        </div>
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SalesTrendChart data={trendData} loading={trendLoading} period={period} />
        </div>
        <div>
          <RegionChart data={regionData} loading={regionLoading} />
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryChart data={categoryData} loading={categoryLoading} />
      </div>
    </div>
  );
}

export { Analytics as default };
