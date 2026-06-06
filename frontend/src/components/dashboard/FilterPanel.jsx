import { useState, useEffect } from 'react';
import { X, SlidersHorizontal, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { cn } from '@/lib/utils';

export function FilterPanel({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onClearFilters,
  filterOptions,
  loading,
}) {
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters, isOpen]);

  const handleApply = () => {
    onFilterChange(localFilters);
    onClose();
  };

  const handleClear = () => {
    setLocalFilters({});
    onClearFilters();
    onClose();
  };

  const updateFilter = (key, value) => {
    setLocalFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
    }));
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/80 z-40"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <aside
        className={cn(
          'fixed top-0 bottom-0 right-0 z-50 w-full sm:w-80 bg-background shadow-xl transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-card">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold text-card-foreground">Filters</h2>
            {activeFilterCount > 0 && (
              <span className="bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-accent text-muted-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6 overflow-y-auto h-[calc(100%-140px)]">
          {/* Date Range */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Calendar className="w-4 h-4" />
              Date Range
            </div>
            <div className="space-y-2">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">From</label>
                <Input
                  type="date"
                  value={localFilters.startDate || ''}
                  onChange={(e) => updateFilter('startDate', e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">To</label>
                <Input
                  type="date"
                  value={localFilters.endDate || ''}
                  onChange={(e) => updateFilter('endDate', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Category */}
          {filterOptions?.categories && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-muted-foreground">Category</label>
                {localFilters.category && (
                  <button
                    onClick={() => updateFilter('category', '')}
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-accent transition-colors"
                  >
                    <X className="w-3 h-3" />
                    Clear
                  </button>
                )}
              </div>
              <Select
                value={localFilters.category || ''}
                onChange={(e) => updateFilter('category', e.target.value)}
              >
                <option value="">All Categories</option>
                {filterOptions.categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </Select>
            </div>
          )}

          {/* Region */}
          {filterOptions?.regions && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-muted-foreground">Region</label>
                {localFilters.region && (
                  <button
                    onClick={() => updateFilter('region', '')}
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-accent transition-colors"
                  >
                    <X className="w-3 h-3" />
                    Clear
                  </button>
                )}
              </div>
              <Select
                value={localFilters.region || ''}
                onChange={(e) => updateFilter('region', e.target.value)}
              >
                <option value="">All Regions</option>
                {filterOptions.regions.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </Select>
            </div>
          )}

          {/* Product */}
          {filterOptions?.products && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-muted-foreground">Product</label>
                {localFilters.product && (
                  <button
                    onClick={() => updateFilter('product', '')}
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-accent transition-colors"
                  >
                    <X className="w-3 h-3" />
                    Clear
                  </button>
                )}
              </div>
              <Select
                value={localFilters.product || ''}
                onChange={(e) => updateFilter('product', e.target.value)}
              >
                <option value="">All Products</option>
                {filterOptions.products.slice(0, 50).map((product) => (
                  <option key={product} value={product}>
                    {product}
                  </option>
                ))}
              </Select>
              {filterOptions.products.length > 50 && (
                <p className="text-xs text-muted-foreground">
                  Showing first 50 products. Use search for more.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border bg-card">
          <div className="flex gap-2">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={handleClear}
            >
              Clear
            </Button>
            <Button
              className="flex-1"
              onClick={handleApply}
              isLoading={loading}
            >
              Apply
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}

// Active filter badges
export function ActiveFilters({ filters, onRemove, onClearAll }) {
  // Exclude startDate and endDate from display (shown in header date picker instead)
  const activeFilters = Object.entries(filters).filter(([key, value]) => {
    return value && key !== 'startDate' && key !== 'endDate';
  });

  if (activeFilters.length === 0) return null;

  const formatLabel = (key, value) => {
    switch (key) {
      case 'category':
        return `Category: ${value}`;
      case 'region':
        return `Region: ${value}`;
      case 'product':
        return `Product: ${value}`;
      case 'search':
        return `Search: "${value}"`;
      default:
        return `${key}: ${value}`;
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {activeFilters.map(([key, value]) => (
        <span
          key={key}
          className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"
        >
          <span className="truncate max-w-[150px]">{formatLabel(key, value)}</span>
          <button
            onClick={() => onRemove(key)}
            className="p-0.5 rounded-full hover:bg-primary/20 transition-colors flex-shrink-0"
            aria-label={`Remove ${key} filter`}
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      <button
        onClick={onClearAll}
        className="text-xs text-muted-foreground hover:text-foreground hover:underline transition-colors"
      >
        Clear all
      </button>
    </div>
  );
}
