import { useState, useCallback, useMemo, useEffect } from 'react';
import { KPICardsGrid } from '@/components/dashboard/KPICard';
import { SalesTrendChart } from '@/components/dashboard/SalesTrendChart';
import { CategoryChart } from '@/components/dashboard/CategoryChart';
import { RegionChart } from '@/components/dashboard/RegionChart';
import { FilterPanel, ActiveFilters } from '@/components/dashboard/FilterPanel';
import { InsightsPanel, TopProductsPanel } from '@/components/dashboard/InsightsPanel';
import {
  useKPISummary,
  useSalesTrend,
  useCategoryBreakdown,
  useRegionAnalysis,
  useTopProducts,
  useInsights,
  useFilterOptions,
  useFilters,
} from '@/hooks/useDashboard';
import { useHeader } from '@/components/layout/Layout';
import { dashboardAPI } from '@/services/api';
import { subDays, format, differenceInDays } from 'date-fns';
import { generateInsights } from '@/lib/aiInsights';

// Default date range: last 30 days
const defaultDateRange = {
  startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
  endDate: format(new Date(), 'yyyy-MM-dd'),
};

export function Dashboard() {
  const [period, setPeriod] = useState('daily');
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const { updateHeader } = useHeader();

  // Filters
  const { filters, updateFilter, clearFilters, removeFilter, setFilters } = useFilters({
    ...defaultDateRange,
  });

  // Memoize filter objects to prevent infinite re-renders
  const memoizedFilters = useMemo(() => filters, [JSON.stringify(filters)]);

  // Data fetching
  const { data: kpiData, loading: kpiLoading } = useKPISummary(memoizedFilters);
  const { data: trendData, loading: trendLoading } = useSalesTrend(period, memoizedFilters);
  const { data: categoryData, loading: categoryLoading } = useCategoryBreakdown(memoizedFilters);
  const { data: regionData, loading: regionLoading } = useRegionAnalysis(memoizedFilters);
  const { data: topProductsData, loading: topProductsLoading } = useTopProducts(10, memoizedFilters);
  // Generate AI insights from actual data
  const insightsData = useMemo(() => {
    if (!kpiData) return null;
    return generateInsights({
      kpi: kpiData,
      trend: trendData,
      category: categoryData,
      region: regionData,
      topProducts: topProductsData,
    }, period);
  }, [kpiData, trendData, categoryData, regionData, topProductsData, period]);
  const insightsLoading = kpiLoading;
  const { data: filterOptions, loading: filterOptionsLoading } = useFilterOptions();

  // Handlers
  const handleExport = useCallback(async () => {
    try {
      await dashboardAPI.exportCSV(filters);
    } catch (error) {
      console.error('Export failed:', error);
    }
  }, [filters]);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, [setFilters]);

  const activeFilterCount = Object.values(filters).filter(Boolean).length - 2; // Exclude default dates

  // Stable callback for date range changes
  const handleDateRangeChange = useCallback((range) => {
    setFilters(prev => ({ ...prev, startDate: range.startDate, endDate: range.endDate }));
  }, [setFilters]);

  // Update header state for TopBar
  useEffect(() => {
    updateHeader({
      dateRange: { startDate: filters.startDate, endDate: filters.endDate },
      onDateRangeChange: handleDateRangeChange,
      onFilterClick: () => setFilterPanelOpen(true),
      filterCount: activeFilterCount > 0 ? activeFilterCount : 0,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.startDate, filters.endDate, activeFilterCount, updateHeader, handleDateRangeChange]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Overview of your sales performance and key metrics
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

      {/* Active filters */}
      <ActiveFilters
        filters={filters}
        onRemove={removeFilter}
        onClearAll={clearFilters}
      />

      {/* KPI Cards */}
      <KPICardsGrid data={kpiData} loading={kpiLoading} filters={filters} />

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2">
          <SalesTrendChart data={trendData} loading={trendLoading} period={period} />
        </div>
        <div>
          <RegionChart data={regionData} loading={regionLoading} />
        </div>
      </div>

      {/* Charts row 2 - Category & Top Products side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <CategoryChart data={categoryData} loading={categoryLoading} />
        <TopProductsPanel data={topProductsData} loading={topProductsLoading} />
      </div>

      {/* AI Insights - Full width at bottom */}
      <div className="w-full">
        <InsightsPanel 
          data={insightsData} 
          loading={insightsLoading} 
          title="AI-Powered Insights"
          subtitle={`Analysis based on ${filters.startDate ? format(new Date(filters.startDate), 'MMM d') : ''} - ${filters.endDate ? format(new Date(filters.endDate), 'MMM d, yyyy') : ''}`}
        />
      </div>

      {/* Filter Panel */}
      <FilterPanel
        isOpen={filterPanelOpen}
        onClose={() => setFilterPanelOpen(false)}
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
        filterOptions={filterOptions}
        loading={filterOptionsLoading}
      />
    </div>
  );
}

export { Dashboard as default };
