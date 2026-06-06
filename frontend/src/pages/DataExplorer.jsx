import { useState, useCallback, useEffect } from 'react';
import { Table2, Download, Search } from 'lucide-react';
import { DataTable } from '@/components/dashboard/DataTable';
import { FilterPanel, ActiveFilters } from '@/components/dashboard/FilterPanel';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  useRawData,
  useFilterOptions,
  useFilters,
  usePagination,
  useDebounce,
} from '@/hooks/useDashboard';
import { useHeader } from '@/components/layout/Layout';
import { dashboardAPI } from '@/services/api';

export function DataExplorer() {
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 500);
  const { updateHeader } = useHeader();

  // Filters
  const { filters, updateFilter, clearFilters, removeFilter, setFilters } = useFilters({});

  // Pagination
  const {
    page,
    limit,
    setPage,
    setLimit,
    setTotal,
    totalPages,
    hasNextPage,
    hasPrevPage,
  } = usePagination(1, 25);

  // Data fetching
  const { data: filterOptions, loading: filterOptionsLoading } = useFilterOptions();
  const { data: rawDataResponse, loading: rawDataLoading } = useRawData(
    { ...filters, search: debouncedSearch },
    { page, limit }
  );

  // Handlers
  const handleExport = useCallback(async () => {
    try {
      await dashboardAPI.exportCSV(filters);
    } catch (error) {
      console.error('Export failed:', error);
    }
  }, [filters]);

  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
  }, [setPage]);

  const handleLimitChange = useCallback((newLimit) => {
    setLimit(newLimit);
    setPage(1);
  }, [setLimit, setPage]);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
    setPage(1);
  }, [setFilters, setPage]);

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  // Update header state for TopBar
  useEffect(() => {
    updateHeader({
      onFilterClick: () => setFilterPanelOpen(true),
      filterCount: activeFilterCount,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilterCount, updateHeader]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Data Explorer</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Browse, search, and filter all transaction data
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" size="sm" onClick={handleExport} className="flex-1 sm:flex-none">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline ml-1">Export CSV</span>
          </Button>
        </div>
      </div>

      {/* Search and stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card rounded-lg border border-border p-3 sm:p-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-right">
          {rawDataResponse?.pagination?.total?.toLocaleString() || 0} total records
        </div>
      </div>

      {/* Mobile orientation suggestion */}
      <div className="sm:hidden bg-primary/10 border border-primary/20 rounded-lg p-3 flex items-center gap-3">
        <svg className="w-5 h-5 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        <p className="text-xs text-primary-foreground/80">
          <span className="font-semibold">Tip:</span> Rotate your phone to landscape for better table viewing, or visit on desktop for full functionality.
        </p>
      </div>

      {/* Active filters */}
      <ActiveFilters
        filters={filters}
        onRemove={removeFilter}
        onClearAll={clearFilters}
      />

      {/* Data table */}
      <DataTable
        data={rawDataResponse?.data || []}
        loading={rawDataLoading}
        pagination={{
          page,
          limit,
          total: rawDataResponse?.pagination?.total || 0,
          totalPages: Math.ceil((rawDataResponse?.pagination?.total || 0) / limit),
          hasNextPage: page < Math.ceil((rawDataResponse?.pagination?.total || 0) / limit),
          hasPrevPage: page > 1,
        }}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
      />

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

export { DataExplorer as default };
