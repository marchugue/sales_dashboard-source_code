import { memo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { SkeletonChart } from '@/components/ui/Skeleton';
import { useSettings } from '@/context/SettingsContext';

const CustomTooltip = ({ active, payload, label, formatCurrency }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-lg">
        <p className="text-sm font-medium text-slate-900 mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p
            key={index}
            className="text-sm"
            style={{ color: entry.color }}
          >
            {entry.name}: {formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

function SalesTrendChartComponent({ data, loading, period = 'daily' }) {
  const { formatCurrency, language, currencyConfig } = useSettings();

  if (loading) {
    return <SkeletonChart />;
  }

  if (!data || data.length === 0) {
    return (
      <div className="dashboard-card">
        <div className="dashboard-card-header">
          <h3 className="dashboard-card-title">Sales Trend</h3>
        </div>
        <div className="dashboard-card-content h-64 sm:h-80 flex items-center justify-center">
          <p className="text-slate-500">No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-card">
      <div className="dashboard-card-header">
        <div>
          <h3 className="dashboard-card-title">Sales Trend</h3>
          <p className="text-sm text-slate-500 mt-0.5">
            {period === 'monthly' ? 'Monthly sales over time' : 'Daily sales over time'}
          </p>
        </div>
      </div>
      <div className="dashboard-card-content">
        <div className="h-64 sm:h-80 w-full" style={{ minHeight: '256px' }}>
          <ResponsiveContainer width="100%" height="100%" minWidth={280} minHeight={256}>
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e2e8f0"
              />
              <XAxis
                dataKey="period"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 12 }}
                tickFormatter={(value) => {
                  const config = currencyConfig[language.currency] || currencyConfig.usd;
                  const converted = value * config.rate;
                  return `${config.symbol}${(converted / 1000).toFixed(0)}k`;
                }}
                dx={-10}
              />
              <Tooltip content={<CustomTooltip formatCurrency={formatCurrency} />} />
              <Area
                type="monotone"
                dataKey="sales"
                name="Sales"
                stroke="#2563eb"
                strokeWidth={2}
                fill="url(#colorSales)"
                activeDot={{ r: 6, fill: '#2563eb', strokeWidth: 0 }}
              />
              <Area
                type="monotone"
                dataKey="profit"
                name="Profit"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#colorProfit)"
                activeDot={{ r: 6, fill: '#10b981', strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export const SalesTrendChart = memo(SalesTrendChartComponent, (prevProps, nextProps) => {
  // Only re-render if data actually changed
  return (
    prevProps.loading === nextProps.loading &&
    prevProps.period === nextProps.period &&
    JSON.stringify(prevProps.data) === JSON.stringify(nextProps.data)
  );
});
