import { useEffect, useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, Trophy, Clock, RefreshCw, ArrowUp, ArrowDown, ArrowUpDown, Search } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '../../api';
import { formatMMK } from '../../utils/currency';
import AdminPagination from '../../components/Admin/AdminPagination';

function formatLabel(period, label) {
  if (period === 'all') return label;
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
  const { label, total_revenue, previous_revenue, previous_label } = payload[0].payload;
  return (
    <div className="bg-white/90 backdrop-blur-xl border border-nature-border/60 rounded-lg px-3 py-2 shadow-lg space-y-1">
      <div>
        <p className="text-[10px] text-nature-muted mb-0.5">{formatLabel(period, label)}</p>
        <p className="text-xs font-semibold text-nature-olive">{formatMMK(total_revenue)}</p>
      </div>
      {previous_revenue !== undefined && previous_revenue !== null && (
        <div className="pt-1 border-t border-nature-border/30">
          <p className="text-[10px] text-nature-muted mb-0.5">{formatLabel(period, previous_label)} (prior)</p>
          <p className="text-xs font-medium text-nature-muted">{formatMMK(previous_revenue)}</p>
        </div>
      )}
    </div>
  );
}

function RevenueTrend({ period, series, previousSeries }) {
  const titles = { day: 'Last 30 days', month: 'Last 12 months', all: 'Lifetime total' };
  const labelStep = Math.max(Math.ceil(series.length / 8), 1);

  const combined = series.map((pt, i) => ({
    label: pt.label,
    total_revenue: pt.total_revenue,
    previous_revenue: previousSeries?.[i]?.total_revenue ?? null,
    previous_label: previousSeries?.[i]?.label ?? null,
  }));

  const showComparison = period !== 'all' && previousSeries?.length > 0;

  return (
    <div className="bg-white/30 backdrop-blur-xl border border-white/60 rounded-2xl p-6 shadow-[0_2px_16px_-4px_rgba(44,53,39,0.08)]">
      <div className="flex items-center justify-between mb-1">
        <h2 className="font-serif text-xl text-neutral-800">Revenue Trend</h2>
        {showComparison && (
          <div className="flex items-center gap-3 text-[11px] text-nature-muted">
            <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-nature-olive rounded-full" />Current</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-nature-muted/50 rounded-full" style={{ borderTop: '1px dashed' }} />Prior period</span>
          </div>
        )}
      </div>
      <p className="text-nature-muted text-xs mb-6">{titles[period]}</p>

      {series.length === 0 ? (
        <p className="text-nature-muted text-sm text-center py-12">No revenue data yet.</p>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart key={period} data={combined} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
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
            {showComparison && (
              <Line
                type="monotone"
                dataKey="previous_revenue"
                stroke="#8a8a7a"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={false}
                isAnimationActive={false}
              />
            )}
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

const PRODUCT_COLUMNS = [
  { key: 'rank', label: '#', sortable: true },
  { key: 'product_name', label: 'Product', sortable: true },
  { key: 'quantity_sold', label: 'Units', sortable: true },
  { key: 'revenue', label: 'Revenue', sortable: true },
  { key: 'revenue_share', label: 'Share', sortable: true },
];

function ProductSortHeader({ col, sortKey, sortDir, onSort, align = 'left' }) {
  const active = sortKey === col.key;
  const justify = align === 'right' ? 'justify-end' : '';
  return (
    <th
      onClick={() => col.sortable && onSort(col.key)}
      className={`py-2 px-3 text-[10px] font-semibold tracking-wider uppercase ${align === 'right' ? 'text-right' : 'text-left'} ${col.sortable ? 'cursor-pointer select-none group' : ''}`}
    >
      <span className={`inline-flex items-center gap-1 ${justify} ${active ? 'text-nature-olive' : 'text-nature-muted group-hover:text-neutral-700'}`}>
        {col.label}
        {col.sortable && (active ? (
          sortDir === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
        ) : (
          <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-40 transition-opacity" />
        ))}
      </span>
    </th>
  );
}

function ProductPerformance({ products }) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('rank');
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const totalUnits = products.reduce((sum, p) => sum + p.quantity_sold, 0);
  const totalRevenue = products.reduce((sum, p) => sum + p.revenue, 0);

  function handleSort(key) {
    if (sortKey === key) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'rank' ? 'asc' : 'desc'); // revenue/units feel natural starting high-to-low
    }
  }

  const filtered = useMemo(
    () => products.filter(p => !search || p.product_name.toLowerCase().includes(search.toLowerCase())),
    [products, search]
  );

  const sorted = useMemo(() => {
    const arr = [...filtered];
    const dir = sortDir === 'asc' ? 1 : -1;
    arr.sort((a, b) => {
      const av = sortKey === 'product_name' ? a[sortKey].toLowerCase() : a[sortKey];
      const bv = sortKey === 'product_name' ? b[sortKey].toLowerCase() : b[sortKey];
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  useEffect(() => { setPage(1); }, [search, perPage]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / perPage));
  const clampedPage = Math.min(page, totalPages);
  const visible = useMemo(() => {
    const start = (clampedPage - 1) * perPage;
    return sorted.slice(start, start + perPage);
  }, [sorted, clampedPage, perPage]);

  return (
    <div className="bg-white/30 backdrop-blur-xl border border-white/60 rounded-2xl p-6 shadow-[0_2px_16px_-4px_rgba(44,53,39,0.08)]">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-1">
        <h2 className="font-serif text-xl text-neutral-800">Product Performance</h2>
        <span className="text-nature-muted text-xs">{products.length} products</span>
      </div>
      <p className="text-nature-muted text-xs mb-4">Full breakdown across all recorded sales</p>

      <div className="relative mb-4 max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-nature-muted" />
        <input
          type="text"
          placeholder="Search product..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-white/70 border border-nature-border/50 focus:border-nature-border rounded-xl pl-9 pr-4 py-2 text-xs outline-none transition-colors w-full placeholder-nature-muted/70"
        />
      </div>

      {products.length === 0 ? (
        <p className="text-nature-muted text-sm text-center py-12">No product sales yet.</p>
      ) : sorted.length === 0 ? (
        <p className="text-nature-muted text-sm text-center py-12">No products match "{search}".</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-nature-border/40">
                  {PRODUCT_COLUMNS.map(col => (
                    <ProductSortHeader
                      key={col.key}
                      col={col}
                      sortKey={sortKey}
                      sortDir={sortDir}
                      onSort={handleSort}
                      align={col.key === 'quantity_sold' || col.key === 'revenue' || col.key === 'revenue_share' ? 'right' : 'left'}
                    />
                  ))}
                </tr>
              </thead>
              <tbody>
                {visible.map((p) => (
                  <tr key={p.rank} className="border-b border-nature-border/20 last:border-0">
                    <td className="py-2.5 px-3 font-serif text-nature-olive">{p.rank}</td>
                    <td className="py-2.5 px-3 font-medium text-neutral-800">{p.product_name}</td>
                    <td className="py-2.5 px-3 text-right text-nature-muted">{p.quantity_sold}</td>
                    <td className="py-2.5 px-3 text-right text-nature-olive font-semibold">{formatMMK(p.revenue)}</td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="inline-flex items-center gap-2 justify-end w-full">
                        <div className="w-16 h-1.5 bg-nature-border/40 rounded-full overflow-hidden">
                          <div className="h-full bg-nature-olive rounded-full" style={{ width: `${p.revenue_share}%` }} />
                        </div>
                        <span className="text-nature-muted text-xs w-9 text-right">{p.revenue_share}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              {!search && (
                <tfoot>
                  <tr className="border-t border-nature-border/40 font-semibold">
                    <td className="py-2.5 px-3" colSpan={2}>Total (all {products.length})</td>
                    <td className="py-2.5 px-3 text-right text-neutral-800">{totalUnits}</td>
                    <td className="py-2.5 px-3 text-right text-nature-olive">{formatMMK(totalRevenue)}</td>
                    <td className="py-2.5 px-3 text-right text-nature-muted">100%</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          <AdminPagination
            page={clampedPage}
            totalPages={totalPages}
            onPageChange={setPage}
            perPage={perPage}
            onPerPageChange={setPerPage}
            totalItems={sorted.length}
          />
        </>
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

<RevenueTrend period={report.period} series={report.revenue_series} previousSeries={report.previous_period_series} /><ProductPerformance products={report.product_performance} />
    </div>
  );
}