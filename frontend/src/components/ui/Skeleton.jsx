import { cn } from '@/lib/utils';

export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-slate-200',
        className
      )}
      {...props}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="kpi-card">
      <Skeleton className="h-4 w-24 mb-2" />
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-4 w-20 mt-2" />
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="dashboard-card">
      <div className="dashboard-card-header">
        <Skeleton className="h-5 w-32" />
      </div>
      <div className="dashboard-card-content h-64">
        <Skeleton className="h-full w-full" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5, columns = 4 }) {
  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i}>
                <Skeleton className="h-4 w-20" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td key={colIndex}>
                  <Skeleton className="h-4 w-full" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
