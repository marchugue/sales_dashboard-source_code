import { Download, Calendar, TrendingUp, PieChart, Globe, FileText, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { format, subDays } from 'date-fns';
import { generatePDF, generateExcel, generateCSV } from '@/services/reports';
import { dashboardAPI } from '@/services/api';
import { useHeader } from '@/components/layout/Layout';
import { FilterPanel, ActiveFilters } from '@/components/dashboard/FilterPanel';
import { useFilters, useFilterOptions } from '@/hooks/useDashboard';
import { useSettings } from '@/context/SettingsContext';

const defaultDateRange = {
  startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
  endDate: format(new Date(), 'yyyy-MM-dd'),
};

const reports = [
  {
    id: 'sales-summary',
    title: 'Sales Summary Report',
    description: 'Comprehensive overview of sales performance including revenue, orders, and trends.',
    icon: TrendingUp,
  },
  {
    id: 'category-analysis',
    title: 'Category Analysis Report',
    description: 'Detailed breakdown of sales and profit by product category.',
    icon: PieChart,
  },
  {
    id: 'regional-performance',
    title: 'Regional Performance Report',
    description: 'Geographic analysis of sales, orders, and customer distribution.',
    icon: Globe,
  },
];

export function Reports() {
  const [generating, setGenerating] = useState(null);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const { updateHeader } = useHeader();
  const { formatCurrency } = useSettings();

  // Filters - same as Dashboard
  const { filters, updateFilter, clearFilters, removeFilter, setFilters } = useFilters({
    ...defaultDateRange,
  });

  const memoizedFilters = useMemo(() => filters, [JSON.stringify(filters)]);
  const { filterOptions, loading: filterOptionsLoading } = useFilterOptions();

  // Calculate active filter count (excluding date range)
  const activeFilterCount = useMemo(() => {
    return Object.entries(filters).filter(([key, value]) => 
      value && key !== 'startDate' && key !== 'endDate'
    ).length;
  }, [filters]);

  // Connect to header - stable callback for date changes
  const handleDateRangeChange = useCallback((range) => {
    setFilters(prev => ({ ...prev, startDate: range.startDate, endDate: range.endDate }));
  }, [setFilters]);

  // Update header when relevant data changes
  useEffect(() => {
    updateHeader({
      dateRange: { startDate: filters.startDate, endDate: filters.endDate },
      onDateRangeChange: handleDateRangeChange,
      onFilterClick: () => setFilterPanelOpen(true),
      filterCount: activeFilterCount,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.startDate, filters.endDate, activeFilterCount, updateHeader, handleDateRangeChange]);

  const handleGenerate = async (reportType, format) => {
    setGenerating(reportType);
    
    try {
      console.log('Fetching data for filters:', memoizedFilters);
      
      // Fetch fresh data based on current filters
      const [kpiRes, trendRes, categoryRes, regionRes] = await Promise.all([
        dashboardAPI.getKPISummary(memoizedFilters),
        dashboardAPI.getSalesTrend('daily', memoizedFilters),
        dashboardAPI.getCategoryBreakdown(memoizedFilters),
        dashboardAPI.getRegionAnalysis(memoizedFilters)
      ]);
      
      // Extract data from API responses
      const kpi = kpiRes.data?.data || kpiRes.data || {};
      const trend = trendRes.data?.data || trendRes.data || [];
      const category = categoryRes.data?.data || categoryRes.data || [];
      const region = regionRes.data?.data || regionRes.data || [];
      
      const reportData = { kpi, trend, category, region };
      const dateRange = { startDate: filters.startDate, endDate: filters.endDate };
      
      console.log('Report data extracted:', reportData);
      
      if (format === 'pdf') {
        await generatePDF(reportType, reportData, dateRange, formatCurrency);
      } else if (format === 'excel') {
        await generateExcel(reportType, reportData, dateRange, formatCurrency);
      } else if (format === 'csv') {
        await generateCSV(reportType, reportData, dateRange, formatCurrency);
      }
    } catch (error) {
      console.error('Report generation failed:', error);
      console.error('Error details:', error.response?.data || error.message);
      alert(`Failed to generate report: ${error.response?.data?.message || error.message || 'Unknown error'}`);
    } finally {
      setGenerating(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Active filters */}
      <ActiveFilters
        filters={filters}
        onRemove={removeFilter}
        onClearAll={clearFilters}
      />

      {/* Reports grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reports.map((report) => (
          <div
            key={report.id}
            className="bg-card rounded-lg border border-border p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <report.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-card-foreground">{report.title}</h3>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{report.description}</p>
              </div>
            </div>

            <div className="mt-auto pt-4 border-t border-border">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                <Calendar className="w-4 h-4" />
                {filters.startDate && filters.endDate
                  ? `${format(new Date(filters.startDate), 'MMM d')} - ${format(new Date(filters.endDate), 'MMM d, yyyy')}`
                  : 'Select date range'}
              </div>

              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleGenerate(report.title, 'pdf')}
                  isLoading={generating === report.title}
                  className="flex items-center justify-center"
                >
                  <FileText className="w-4 h-4" />
                  PDF
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleGenerate(report.title, 'excel')}
                  isLoading={generating === report.title}
                  className="flex items-center justify-center"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Excel
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleGenerate(report.title, 'csv')}
                  isLoading={generating === report.title}
                  className="flex items-center justify-center"
                >
                  <Download className="w-4 h-4" />
                  CSV
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Panel */}
      <FilterPanel
        isOpen={filterPanelOpen}
        onClose={() => setFilterPanelOpen(false)}
        filters={filters}
        onFilterChange={updateFilter}
        onClearFilters={clearFilters}
        filterOptions={filterOptions}
        loading={filterOptionsLoading}
      />
    </div>
  );
}

export { Reports as default };
