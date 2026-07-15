import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Trophy, Clock, RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '../../api';
import { formatMMK } from '../../utils/currency';

function formatLabel(period, label) {
  if (period === 'all') {
    return label;
  }

  if (period === 'day') {
    if (!label || label.length !== 8) return label;
    const date = new Date(Number(label.slice(0, 4)), Number(label.slice(4, 6)) - 1, Number(label.slice(6, 8)));
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  if (!label || label.length !== 6) return label;
  const date = new Date(Number(label.slice(0, 4)), Number(label.slice(4, 6)) - 1, 1);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

const PERIOD_OPTIONS = [
  { value: 'day', label: 'Day' },
  { value: 'month', label: 'Month' },
  { value: 'all', label: 'All Time' },
];

function PeriodToggle({ value, onChange }) {
  return (
    <div className="inline-flex bg-white/30 backdrop-blur-xl border border-white/60 rounded-xl p-1 shadow-[0_2px_16px_-4px_rgba(44,53,39,0.08)]">
      {PERIOD_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium tracking-wide transition-colors ${
            value === opt.value ? 'bg-nature-olive text-white' : 'text-nature-muted hover:text-nature-olive'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function StatCard({ label, value, sub, icon: Icon, trend }) {
  return (
    <div className="bg-white/30 backdrop-blur-xl border border-white/60 rounded-2xl p-6 shadow-[0_2px_16px_-4px_rgba(44,53,39,0.08)]">
      <div className="flex items-center justify-between mb-3">
        <p className="text-nature-muted text-[10px] font-semibold tracking-[0.15em] uppercase">{label}</p>
        <div className="w-8 h-8 rounded-lg bg-nature-olive/10 flex items-center justify-center">
          <Icon className="w-4 h-4 text-nature-olive" />
        </div>
      </div>
      <p className="font-serif text-3xl text-neutral-800">{value}</p>
      {sub && (
        <p className={`text-xs mt-1.5 flex items-center gap-1 ${
          trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-rose-600' : 'text-nature-muted'
        }`}>
          {trend === 'up' && <TrendingUp className="w-3 h-3" />}
          {trend === 'down' && <TrendingDown className="w-3 h-3" />}
          {sub}
        </p>
      )}
    </div>
  );
}

function CustomTooltip({ active, payload, period }) {
  if (!active || !payload?.length) return null;
  const { label, total_revenue } = payload[0].payload;
  return (
    <div className="bg-white/90 backdrop-blur-xl border border-nature-border/60 rounded-lg px-3 py-2 shadow-lg">
      <p className="text-[10px] text-nature-muted mb-0.5">{formatLabel(period, label)}</p>
      <p className="text-xs font-semibold text-nature-olive">{formatMMK(total_revenue)}</p>
    </div>
  );
}

function RevenueTrend({ period, series }) {
  const titles = { day: 'Last 30 days', month: 'Last 12 months', all: 'Lifetime total' };
  const labelStep = Math.max(Math.ceil(series.length / 8), 1);

  return (
    <div className="bg-white/30 backdrop-blur-xl border border-white/60 rounded-2xl p-6 shadow-[0_2px_16px_-4px_rgba(44,53,39,0.08)]">
      <h2 className="font-serif text-xl text-neutral-800 mb-1">Revenue Trend</h2>
      <p className="text-nature-muted text-xs mb-6">{titles[period]}</p>

      {series.length === 0 ? (
        <p className="text-nature-muted text-sm text-center py-12">No revenue data yet.</p>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart
            key={period}
            data={series}
            margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
            <XAxis
              dataKey="label"
              tickFormatter={(label, i) => (i % labelStep === 0 ? formatLabel(period, label) : '')}
              tick={{ fontSize: 10, fill: '#8a8a7a' }}
              axisLine={{ stroke: '#e5e5e5' }}
              tickLine={false}
            />
            <YAxis hide />
            <Tooltip content={<CustomTooltip period={period} />} />
            <Line
              type="monotone"
              dataKey="total_revenue"
              stroke="#4A6838"
              strokeWidth={2.5}
              dot={{ r: 4, fill: '#4A6838', strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 6, fill: '#4A6838', strokeWidth: 2, stroke: '#fff' }}
              isAnimationActive={true}
              animationDuration={1200}
              animationEasing="ease-out"
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

function TopProducts({ products }) {
  const max = Math.max(...products.map((p) => p.quantity_sold), 1);

  return (
    <div className="bg-white/30 backdrop-blur-xl border border-white/60 rounded-2xl p-6 shadow-[0_2px_16px_-4px_rgba(44,53,39,0.08)]">
      <h2 className="font-serif text-xl text-neutral-800 mb-1">Best-Selling Products</h2>
      <p className="text-nature-muted text-xs mb-6">Ranked by units sold, all-time</p>

      {products.length === 0 ? (
        <p className="text-nature-muted text-sm text-center py-12">No product sales yet.</p>
      ) : (
        <div className="space-y-4">
          {products.map((p) => (
            <div key={p.rank}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-serif text-sm text-nature-olive w-5">{p.rank}</span>
                  <span className="text-sm font-medium text-neutral-800">{p.product_name}</span>
                </div>
                <div className="text-right whitespace-nowrap">
                  <span className="text-xs text-nature-muted">{p.quantity_sold} sold</span>
                  <span className="text-xs text-nature-olive font-semibold ml-3">{formatMMK(p.revenue)}</span>
                </div>
              </div>
              <div className="h-1.5 bg-nature-border/40 rounded-full overflow-hidden">
                <div
                  className="h-full bg-nature-olive rounded-full transition-all duration-500"
                  style={{ width: `${(p.quantity_sold / max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SalesReport() {
  const [period, setPeriod] = useState('month');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [runError, setRunError] = useState('');

  function fetchReport(signal) {
    return api.get('/admin/sales-report', { params: { period }, signal })
      .then(({ data }) => setReport(data))
      .catch((err) => {
        if (err.name !== 'CanceledError') console.error('Failed to load sales report:', err);
      });
  }

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    fetchReport(controller.signal).finally(() => setLoading(false));
    return () => controller.abort();
  }, [period]);

  async function handleRunNow() {
    setRunning(true);
    setRunError('');
    try {
      const { data } = await api.post('/admin/sales-report/run-batch');
      setReport(data);
    } catch (err) {
      setRunError(err.response?.data?.message || 'Batch job failed. Please try again.');
    } finally {
      setRunning(false);
    }
  }

  if (loading) {
    return (
      <div className="text-nature-dark space-y-6">
        <div className="h-10 w-48 bg-white/20 border border-white/50 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-28 bg-white/20 border border-white/50 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="h-72 bg-white/20 border border-white/50 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-nature-dark space-y-6">
        <h1 className="font-serif text-3xl">Sales Report</h1>
        <div className="bg-white/70 backdrop-blur-xl border border-nature-border/80 rounded-2xl p-16 text-center">
          <p className="text-nature-muted text-sm">Something went wrong loading the report.</p>
        </div>
      </div>
    );
  }

  const growth = report.growth_percent;
  const growthLabel = growth === null
    ? (period === 'all' ? 'Lifetime total' : 'No prior period to compare')
    : `${growth > 0 ? '+' : ''}${growth}% vs previous ${period}`;
  const topProduct = report.top_products[0];

  return (
    <div className="text-nature-dark space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl">Sales Report</h1>
          <p className="text-nature-muted text-sm mt-0.5 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {report.generated_at
              ? `Last updated ${new Date(report.generated_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}`
              : 'Not yet generated — run the batch job'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <PeriodToggle value={period} onChange={setPeriod} />
          <button
            onClick={handleRunNow}
            disabled={running}
            className="flex items-center gap-2 bg-nature-olive hover:bg-nature-olive/90 disabled:opacity-60 text-white text-xs font-medium tracking-wide transition-colors px-4 py-2.5 rounded-xl shadow-[0_4px_16px_-4px_rgba(74,104,56,0.5)]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${running ? 'animate-spin' : ''}`} />
            {running ? 'Running...' : 'Run Now'}
          </button>
        </div>
      </div>

      {runError && (
        <p className="text-rose-600 text-xs bg-rose-50 border border-rose-200/60 rounded-lg px-3 py-2">{runError}</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <StatCard
          label={period === 'all' ? 'Lifetime Revenue' : `This ${period === 'day' ? 'Day' : 'Month'}'s Revenue`}
          value={formatMMK(report.current_period_revenue)}
          sub={growthLabel}
          trend={growth === null ? null : growth >= 0 ? 'up' : 'down'}
          icon={TrendingUp}
        />
        <StatCard
          label="Best Seller"
          value={topProduct ? topProduct.product_name : '—'}
          sub={topProduct ? `${topProduct.quantity_sold} units sold` : 'No sales yet'}
          icon={Trophy}
        />
      </div>

      <RevenueTrend period={report.period} series={report.revenue_series} />
      <TopProducts products={report.top_products} />
    </div>
  );
}