import { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { SkeletonTable } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { formatDate, formatNumber, cn } from '@/lib/utils';
import { useSettings } from '@/context/SettingsContext';

const columns = [
  { key: 'orderNumber', header: 'Order #', sortable: true },
  { key: 'orderDate', header: 'Date', sortable: true, format: 'date' },
  { key: 'product', header: 'Product', sortable: true },
  { key: 'category', header: 'Category', sortable: true },
  { key: 'region', header: 'Region', sortable: true },
  { key: 'quantity', header: 'Qty', sortable: true, align: 'right', format: 'number' },
  { key: 'price', header: 'Price', sortable: true, align: 'right', format: 'currency' },
  { key: 'sales', header: 'Sales', sortable: true, align: 'right', format: 'currency' },
  { key: 'profit', header: 'Profit', sortable: true, align: 'right', format: 'currency' },
];

export function DataTable({
  data,
  pagination,
  loading,
  onPageChange,
  onLimitChange,
}) {
  const { formatCurrency } = useSettings();
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const handleSort = (key) => {
    if (sortConfig.key === key) {
      setSortConfig({
        key,
        direction: sortConfig.direction === 'asc' ? 'desc' : 'asc',
      });
    } else {
      setSortConfig({ key, direction: 'asc' });
    }
  };

  const sortedData = sortConfig.key
    ? [...data].sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        
        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;
        
        if (typeof aVal === 'string') {
          return sortConfig.direction === 'asc'
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }
        
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      })
    : data;

  const formatCellValue = (value, format) => {
    switch (format) {
      case 'currency':
        return formatCurrency(value);
      case 'number':
        return formatNumber(value);
      case 'date':
        return formatDate(value);
      default:
        return value;
    }
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground" />;
    }
    return sortConfig.direction === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-primary" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-primary" />
    );
  };

  if (loading) {
    return <SkeletonTable rows={5} columns={columns.length} />;
  }

  if (!data || data.length === 0) {
    return (
      <div className="dashboard-card">
        <div className="dashboard-card-header">
          <h3 className="dashboard-card-title">Transaction Data</h3>
        </div>
        <div className="p-12 text-center">
          <p className="text-muted-foreground">No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-card">
      <div className="dashboard-card-header">
        <div>
          <h3 className="dashboard-card-title">Transaction Data</h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            {pagination?.total?.toLocaleString()} total records
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted border-b border-border">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    'px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap',
                    column.align === 'right' && 'text-right',
                    column.sortable && 'cursor-pointer hover:bg-accent'
                  )}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div
                    className={cn(
                      'flex items-center gap-1',
                      column.align === 'right' && 'justify-end'
                    )}
                  >
                    <span className="hidden sm:inline">{column.header}</span>
                    <span className="sm:hidden">{column.shortHeader || column.header.slice(0, 3)}</span>
                    {column.sortable && getSortIcon(column.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sortedData.map((row, index) => (
              <tr
                key={`${row.orderNumber || row.orderId || 'row'}-${index}`}
                className="hover:bg-accent/50 transition-colors"
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      'px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-card-foreground whitespace-nowrap',
                      column.align === 'right' && 'text-right',
                      column.key === 'product' && 'max-w-[120px] sm:max-w-xs truncate'
                    )}
                  >
                    {formatCellValue(row[column.key], column.format)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="px-3 sm:px-6 py-3 sm:py-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
            <span className="hidden sm:inline">Show</span>
            <select
              value={pagination.limit}
              onChange={(e) => onLimitChange?.(Number(e.target.value))}
              className="h-7 sm:h-8 w-14 sm:w-16 rounded border border-border bg-background text-xs sm:text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="hidden sm:inline">per page</span>
            <span className="sm:hidden">/page</span>
            <span className="hidden sm:inline">
              {' '}
              | {((pagination.page - 1) * pagination.limit) + 1} -{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {/* First page - hidden on mobile */}
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onPageChange?.(1)}
              disabled={pagination.page === 1}
              className="hidden sm:flex"
            >
              <ChevronsLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onPageChange?.(pagination.page - 1)}
              disabled={!pagination.hasPrevPage}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            {/* Page numbers - show 3 on mobile, 5 on desktop */}
            <div className="flex items-center gap-1 px-1 sm:px-2">
              {Array.from(
                { length: Math.min(typeof window !== 'undefined' && window.innerWidth < 640 ? 3 : 5, pagination.totalPages) },
                (_, i) => {
                  const maxButtons = typeof window !== 'undefined' && window.innerWidth < 640 ? 3 : 5;
                  let pageNum;
                  if (pagination.totalPages <= maxButtons) {
                    pageNum = i + 1;
                  } else if (pagination.page <= Math.ceil(maxButtons / 2)) {
                    pageNum = i + 1;
                  } else if (pagination.page >= pagination.totalPages - Math.floor(maxButtons / 2)) {
                    pageNum = pagination.totalPages - maxButtons + 1 + i;
                  } else {
                    pageNum = pagination.page - Math.floor(maxButtons / 2) + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => onPageChange?.(pageNum)}
                      className={cn(
                        'w-7 sm:w-8 h-7 sm:h-8 rounded text-xs sm:text-sm font-medium transition-colors',
                        pagination.page === pageNum
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-accent'
                      )}
                    >
                      {pageNum}
                    </button>
                  );
                }
              )}
            </div>

            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onPageChange?.(pagination.page + 1)}
              disabled={!pagination.hasNextPage}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            {/* Last page - hidden on mobile */}
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onPageChange?.(pagination.totalPages)}
              disabled={pagination.page === pagination.totalPages}
              className="hidden sm:flex"
            >
              <ChevronsRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
