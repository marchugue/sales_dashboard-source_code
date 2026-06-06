import { memo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { SkeletonChart } from '@/components/ui/Skeleton';
import { formatNumber } from '@/lib/utils';
import { useSettings } from '@/context/SettingsContext';

const COLORS = [
  '#2563eb',
  '#3b82f6',
  '#60a5fa',
  '#93c5fd',
  '#bfdbfe',
  '#1d4ed8',
  '#1e40af',
];

const CustomTooltip = ({ active, payload, formatCurrency }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-lg">
        <p className="text-sm font-medium text-slate-900 mb-1">
          {data.region} {data.country && `(${data.country})`}
        </p>
        <p className="text-sm text-slate-600">
          Sales: {formatCurrency(data.sales)}
        </p>
        <p className="text-sm text-slate-600">
          Orders: {formatNumber(data.orders)}
        </p>
        <p className="text-sm text-slate-600">
          Customers: {formatNumber(data.customers)}
        </p>
      </div>
    );
  }
  return null;
};

const CustomLegend = ({ payload }) => {
  return (
    <ul className="flex flex-wrap justify-center gap-x-4 gap-y-2 px-2">
      {payload.slice(0, 6).map((entry, index) => (
        <li key={`legend-${index}`} className="flex items-center gap-1.5">
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs text-slate-600 truncate max-w-[80px]">{entry.value}</span>
        </li>
      ))}
    </ul>
  );
};

function RegionChartComponent({ data, loading }) {
  const { formatCurrency } = useSettings();

  if (loading) {
    return <SkeletonChart />;
  }

  if (!data || data.length === 0) {
    return (
      <div className="dashboard-card">
        <div className="dashboard-card-header">
          <h3 className="dashboard-card-title">Sales by Region</h3>
        </div>
        <div className="dashboard-card-content h-64 sm:h-80 flex items-center justify-center">
          <p className="text-slate-500">No data available</p>
        </div>
      </div>
    );
  }

  // Calculate total for percentage
  const total = data.reduce((sum, item) => sum + item.sales, 0);
  const chartData = data.map((item) => ({
    ...item,
    percentage: ((item.sales / total) * 100).toFixed(1),
  }));

  return (
    <div className="dashboard-card">
      <div className="dashboard-card-header">
        <div>
          <h3 className="dashboard-card-title">Sales by Region</h3>
          <p className="text-sm text-slate-500 mt-0.5">
            Geographic distribution of revenue
          </p>
        </div>
      </div>
      <div className="dashboard-card-content">
        <div className="h-64 sm:h-80 w-full" style={{ minHeight: '256px' }}>
          <ResponsiveContainer width="100%" height="100%" minWidth={250} minHeight={256}>
            <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
              <Pie
                data={chartData}
                cx="50%"
                cy="40%"
                innerRadius={50}
                outerRadius={85}
                paddingAngle={2}
                dataKey="sales"
                nameKey="region"
                labelLine={false}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                    stroke="#fff"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip formatCurrency={formatCurrency} />} />
              <Legend
                content={<CustomLegend />}
                verticalAlign="bottom"
                align="center"
                layout="horizontal"
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export const RegionChart = memo(RegionChartComponent, (prevProps, nextProps) => {
  return (
    prevProps.loading === nextProps.loading &&
    JSON.stringify(prevProps.data) === JSON.stringify(nextProps.data)
  );
});
