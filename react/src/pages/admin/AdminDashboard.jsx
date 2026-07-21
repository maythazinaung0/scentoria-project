import { useState } from 'react';
import { useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, CartesianGrid, PieChart, Pie,
} from 'recharts';
import { Package, ShoppingBag, DollarSign, Clock, CheckCircle, XCircle, RefreshCw, ArrowUpRight, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import api from '../../api';

const STATUS_COLORS = {
  pending:    '#C9A94F',
  processing: '#6B8A9E',
  completed:  '#4A6838',
  cancelled:  '#B0664A',
};

// Matches the periods the backend's report tables actually support —
// day (last 30 days, daily), month (last 12 months, monthly), all (yearly).
const PERIODS = [
  { key: 'day',   label: 'Last 30 days' },
  { key: 'month', label: 'Last 12 months' },
  { key: 'all',   label: 'All time' },
];

function formatMMK(value) {
  return new Intl.NumberFormat('en-US').format(value ?? 0) + ' MMK';
}

// Compact axis label: 400,000 -> "400k", 1,400,000 -> "1.4M". Keeping this
// short avoids labels wide enough to get clipped by the chart's left margin.
function formatAxisValue(value) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}k`;
  return `${value}`;
}

// revenue_series labels come back as 'Ymd' (day), 'Ym' (month), or 'Y' (all)
function formatSeriesLabel(period, label) {
  if (period === 'day') {
    const d = new Date(`${label.slice(0, 4)}-${label.slice(4, 6)}-${label.slice(6, 8)}`);
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  }
  if (period === 'month') {
    const d = new Date(`${label.slice(0, 4)}-${label.slice(4, 6)}-01`);
    return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  }
  return label; // year, already plain
}

function ChangeBadge({ value }) {
  if (value === null || value === undefined || Number.isNaN(value)) return null;
  const up = value >= 0;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <span className={`inline-flex items-center gap-0.5 text-[11px] font-semibold ${up ? 'text-emerald-700' : 'text-rose-600'}`}>
      <Icon className="w-3 h-3" />
      {Math.abs(value).toFixed(0)}%
    </span>
  );
}

function AreaTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-nature-card/90 backdrop-blur-xl border border-nature-border/80 rounded-2xl p-4 text-xs shadow-2xl transition-all duration-300 scale-100 animate-in fade-in zoom-in-95">
      <p className="text-nature-muted font-medium mb-1.5 tracking-wide">{label}</p>
      <p className="font-serif text-base font-semibold text-nature-olive">{formatMMK(payload[0].value)}</p>
    </div>
  );
}

function PieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-nature-card/90 backdrop-blur-xl border border-nature-border/80 rounded-2xl p-4 text-xs shadow-2xl transition-all duration-300 scale-100 animate-in fade-in zoom-in-95">
      <p className="text-nature-dark font-semibold capitalize tracking-wide mb-1">{payload[0].name}</p>
      <p className="text-nature-olive font-medium text-sm">{payload[0].value} orders</p>
    </div>
  );
}

const EMPTY_STATS = {
  revenue: { current: 0, previous: 0, growth_percent: null },
  orders: { current: 0, previous: 0, growth_percent: null },
  avg_order_value: { current: 0, previous: 0, growth_percent: null },
  pending_orders: 0,
  active_products: 0,
};

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [period, setPeriod] = useState('day');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchData = (p = period) => {
    setIsRefreshing(true);
    api.get('/admin', { params: { period: p } })
      .then(({ data }) => setData(data))
      .catch((err) => console.error('Dashboard fetch failed:', err))
      .finally(() => {
        setLoading(false);
        setIsRefreshing(false);
      });
  };

  useEffect(() => {
    fetchData(period);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  const stats = data?.stats ?? EMPTY_STATS;
  const revenueSeries = (data?.revenue_series ?? []).map(pt => ({
    label: formatSeriesLabel(period, pt.label),
    revenue: pt.total_revenue,
  }));
  const statusBreakdown = data?.status_breakdown ?? {};
  const statusData = Object.entries(statusBreakdown)
    .map(([name, value]) => ({ name, value, fill: STATUS_COLORS[name] ?? '#999' }))
    .filter(s => s.value > 0);
  const topProducts = data?.top_products ?? [];
  const lowStock = data?.low_stock ?? [];
  const recentOrders = data?.recent_orders ?? [];
  const filteredRecent = statusFilter === 'all'
    ? recentOrders
    : recentOrders.filter(o => o.status === statusFilter);

  const periodLabel = PERIODS.find(p => p.key === period)?.label.toLowerCase() ?? '';
  // Says what it's actually comparing against, rather than the generic "previous period" —
  // matches the day/month/year pairs AdminController::dateRangesFor() computes.
  const comparisonLabel = { day: 'vs yesterday', month: 'vs last month', all: 'vs last year' }[period];

  const statCards = [
    { label: 'Revenue', value: formatMMK(stats.revenue.current), change: stats.revenue.growth_percent, sub: comparisonLabel, icon: DollarSign },
    { label: 'Orders', value: stats.orders.current, change: stats.orders.growth_percent, sub: comparisonLabel, icon: ShoppingBag },
    { label: 'Avg. Order Value', value: formatMMK(stats.avg_order_value.current), change: stats.avg_order_value.growth_percent, sub: comparisonLabel, icon: TrendingUp },
    { label: 'Pending Orders', value: stats.pending_orders, change: null, sub: 'Awaiting action, all time', icon: Clock },
    { label: 'Active Products', value: stats.active_products, change: null, sub: 'In catalogue', icon: Package },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden selection:bg-nature-olive/10">
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px) scale(0.98); filter: blur(4px); } to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); } }
        .fade-up { animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) both; }
      `}</style>

      <div className="relative p-6 md:p-10 z-10">
        <div className="text-nature-dark space-y-10 max-w-7xl mx-auto">

          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 fade-up">
            <div className="space-y-1">
              <h1 className="font-serif text-4xl font-normal tracking-tight text-neutral-800">Dashboard</h1>
              <p className="text-nature-muted text-xs font-medium tracking-wide uppercase opacity-80">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-white/60 backdrop-blur-md border border-nature-border/80 rounded-xl p-1 shadow-sm">
                {PERIODS.map(p => (
                  <button
                    key={p.key}
                    onClick={() => setPeriod(p.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 ${
                      period === p.key ? 'bg-nature-olive text-white shadow-sm' : 'text-nature-muted hover:text-nature-olive'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <button
                onClick={() => fetchData(period)}
                disabled={isRefreshing}
                className="group flex items-center gap-2 text-nature-muted hover:text-nature-olive text-xs font-medium tracking-wide transition-all duration-500 border border-nature-border/80 hover:border-nature-olive/40 bg-white/60 backdrop-blur-md hover:bg-white px-4 py-2 rounded-xl shadow-sm hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 transition-transform duration-700 ease-out ${isRefreshing ? 'animate-spin' : 'group-hover:rotate-180'}`} />
                Refresh
              </button>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-5">
            {statCards.map(({ label, value, change, sub, icon: Icon }, i) => (
              <div
                key={label}
                className="fade-up bg-white/20 backdrop-blur-xl border border-white/50 rounded-2xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)] hover:shadow-[0_20px_40px_-10px_rgba(74,104,56,0.8)] hover:-translate-y-1.5 hover:bg-white/50 transition-all duration-500 group"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="flex items-start justify-between mb-5">
                  <p className="text-nature-muted text-xs font-semibold tracking-wide uppercase opacity-70 group-hover:text-nature-olive transition-colors duration-300">{label}</p>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-nature-olive/5 border border-nature-olive/10 group-hover:bg-nature-olive group-hover:scale-110 transition-all duration-500 ease-out">
                    <Icon className="w-4 h-4 text-nature-olive group-hover:text-white transition-colors duration-500" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2 mb-1">
                  <p className="font-serif text-3xl font-light tracking-tight text-neutral-800 transition-transform duration-500 group-hover:translate-x-0.5">
                    {loading ? '—' : value}
                  </p>
                  {!loading && <ChangeBadge value={change} />}
                </div>
                <p className="text-nature-muted/80 text-xs font-medium">{sub}</p>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="fade-up xl:col-span-2 bg-white/20 backdrop-blur-xl border border-white/50 rounded-2xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)] hover:shadow-[0_20px_40px_-10px_rgba(74,104,56,0.8)] transition-all duration-500" style={{ animationDelay: '200ms' }}>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-nature-olive animate-pulse" />
                    <h2 className="text-xs font-bold tracking-widest uppercase text-nature-olive">Revenue</h2>
                  </div>
                  <p className="text-nature-muted text-xs capitalize">{periodLabel}</p>
                </div>
              </div>
              {loading ? (
                <div className="h-56 bg-neutral-200/30 rounded-xl animate-pulse" />
              ) : (
                <div className="h-56 w-full opacity-95 hover:opacity-100 transition-opacity duration-300">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueSeries} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4A6838" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#4A6838" stopOpacity={0.00} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="4 4" stroke="#E5E5E5" vertical={false} />
                      <XAxis dataKey="label" tick={{ fill: '#8E918B', fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} />
                      <YAxis tickFormatter={formatAxisValue} tick={{ fill: '#8E918B', fontSize: 10, fontWeight: 500 }} axisLine={false} tickLine={false} width={48} />
                      <Tooltip content={<AreaTooltip />} cursor={{ stroke: '#4A6838', strokeWidth: 1.5, strokeDasharray: '3 3' }} />
                      <Area type="monotone" dataKey="revenue" stroke="#4A6838" strokeWidth={2.5} fill="url(#revenueGrad)" dot={{ fill: '#4A6838', r: 3, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, fill: '#3A5530', stroke: '#fff', strokeWidth: 2 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="fade-up bg-white/20 backdrop-blur-xl border border-white/50 rounded-2xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)] hover:shadow-[0_20px_40px_-10px_rgba(74,104,56,0.8)] transition-all duration-500" style={{ animationDelay: '300ms' }}>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-2 h-2 rounded-full bg-nature-olive" />
                <h2 className="text-xs font-bold tracking-widest uppercase text-nature-olive">Orders by Status</h2>
              </div>
              {loading ? (
                <div className="h-56 bg-neutral-200/30 rounded-xl animate-pulse" />
              ) : statusData.length === 0 ? (
                <div className="h-56 flex items-center justify-center text-nature-muted text-sm border border-dashed border-neutral-200 rounded-xl">No orders yet</div>
              ) : (
                <div className="flex flex-col justify-between h-[224px]">
                  <div className="h-32 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={statusData} cx="50%" cy="50%" innerRadius={42} outerRadius={56} paddingAngle={4} dataKey="value" strokeWidth={0}>
                          {statusData.map((entry, i) => <Cell key={i} fill={entry.fill} className="hover:opacity-85 transition-opacity duration-300 cursor-pointer" />)}
                        </Pie>
                        <Tooltip content={<PieTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {statusData.map(s => (
                      <div key={s.name} className="flex items-center justify-between p-2 rounded-xl bg-white/40 border border-neutral-200/20 shadow-sm hover:bg-white transition-all duration-300">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <div className="w-2 h-2 rounded-full shrink-0" style={{ background: s.fill }} />
                          <span className="text-nature-muted capitalize text-[11px] font-medium truncate">{s.name}</span>
                        </div>
                        <span className="text-neutral-800 font-mono text-[11px] font-semibold pl-1">{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Top products + Low stock */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="fade-up bg-white/20 backdrop-blur-xl border border-white/50 rounded-2xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)] hover:shadow-[0_20px_40px_-10px_rgba(74,104,56,0.8)] transition-all duration-500" style={{ animationDelay: '350ms' }}>
              <div className="flex items-center gap-2 mb-5">
                <div className="w-2 h-2 rounded-full bg-nature-olive" />
                <h2 className="text-xs font-bold tracking-widest uppercase text-nature-olive">Top Products</h2>
              </div>
              {loading ? (
                <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-10 bg-neutral-200/30 rounded-xl animate-pulse" />)}</div>
              ) : topProducts.length === 0 ? (
                <div className="py-8 text-center text-nature-muted text-sm">No sales in the batch report yet.</div>
              ) : (
                <div className="space-y-1.5">
                  {topProducts.map((p) => (
                    <div key={p.rank} className="flex items-center justify-between p-2.5 rounded-xl bg-white/40 border border-neutral-200/20 hover:bg-white transition-all duration-300">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-nature-muted font-mono text-[11px] w-5 shrink-0">#{p.rank}</span>
                        <span className="text-neutral-800 text-xs font-medium truncate">{p.product_name}</span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-nature-muted text-[11px]">{p.quantity_sold} sold</span>
                        <span className="text-nature-olive font-serif text-xs font-medium">{formatMMK(p.revenue)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="fade-up bg-white/20 backdrop-blur-xl border border-white/50 rounded-2xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)] hover:shadow-[0_20px_40px_-10px_rgba(74,104,56,0.8)] transition-all duration-500" style={{ animationDelay: '400ms' }}>
              <div className="flex items-center gap-2 mb-5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <h2 className="text-xs font-bold tracking-widest uppercase text-nature-olive">Low Stock</h2>
              </div>
              {loading ? (
                <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-10 bg-neutral-200/30 rounded-xl animate-pulse" />)}</div>
              ) : lowStock.length === 0 ? (
                <div className="py-8 text-center text-nature-muted text-sm">Everything's well stocked.</div>
              ) : (
                <div className="space-y-1.5">
                  {lowStock.map((v, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-white/40 border border-amber-200/40 hover:bg-white transition-all duration-300">
                      <span className="text-neutral-800 text-xs font-medium truncate">{v.product_name} — {v.size}</span>
                      <span className={`font-mono text-[11px] font-semibold px-2 py-0.5 rounded-lg ${v.stock_quantity <= 0 ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-800'}`}>
                        {v.stock_quantity} left
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="fade-up bg-white/20 backdrop-blur-xl border border-white/50 rounded-2xl overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)] hover:shadow-[0_20px_40px_-10px_rgba(74,104,56,0.8)] transition-all duration-500" style={{ animationDelay: '450ms' }}>
            <div className="flex flex-wrap items-center justify-between gap-3 px-8 py-5 border-b border-neutral-200/60 bg-white/30">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-nature-olive" />
                <h2 className="text-xs font-bold tracking-widest uppercase text-nature-olive">Recent Orders</h2>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {['all', 'pending', 'processing', 'completed', 'cancelled'].map(s => (
                    <button
                      key={s}
                      onClick={() => setStatusFilter(s)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium capitalize transition-all duration-200 ${
                        statusFilter === s ? 'bg-nature-olive text-white' : 'text-nature-muted hover:bg-white/60'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <a href="/admin/orders" className="group flex items-center gap-1 text-[11px] font-bold tracking-wider text-nature-olive transition-colors hover:text-nature-olive/70 whitespace-nowrap">
                  VIEW ALL ORDERS <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
                </a>
              </div>
            </div>
            {loading ? (
              <div className="p-6 space-y-3.5">
                {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-14 bg-neutral-200/30 rounded-xl animate-pulse" />)}
              </div>
            ) : filteredRecent.length === 0 ? (
              <div className="p-12 text-center text-nature-muted text-sm">No orders match this filter.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-neutral-50/40 text-left">
                      <th className="text-nature-muted text-[11px] font-bold tracking-wider uppercase px-8 py-4 opacity-80">Customer Name</th>
                      <th className="text-nature-muted text-[11px] font-bold tracking-wider uppercase px-8 py-4 hidden md:table-cell opacity-80">Order ID</th>
                      <th className="text-nature-muted text-[11px] font-bold tracking-wider uppercase px-8 py-4 opacity-80">Date</th>
                      <th className="text-right text-nature-muted text-[11px] font-bold tracking-wider uppercase px-8 py-4 opacity-80">Amount</th>
                      <th className="text-right text-nature-muted text-[11px] font-bold tracking-wider uppercase px-8 py-4 opacity-80">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecent.map((order) => (
                      <tr
                        key={order.id}
                        className="border-b border-neutral-200/40 last:border-0 hover:bg-white/80 transition-all duration-300 group"
                      >
                        <td className="px-8 py-4.5 text-neutral-800 font-medium group-hover:text-nature-olive transition-colors duration-300">{order.customer_name}</td>
                        <td className="px-8 py-4.5 text-nature-muted font-mono text-xs hidden sm:table-cell tracking-tight">#{String(order.id).slice(0, 8).toUpperCase()}</td>
                        <td className="px-8 py-4.5 text-nature-muted text-xs hidden md:table-cell">
                          {new Date(order.created_at).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-8 py-4.5 font-serif font-medium text-right text-nature-olive">{formatMMK(order.total_amount)}</td>
                        <td className="px-8 py-4.5 text-right">
                          <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1 rounded-xl uppercase tracking-wider transition-transform duration-300 group-hover:scale-105 ${
                            order.status === 'completed' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/50' :
                            order.status === 'pending' ? 'bg-amber-50 text-amber-800 border border-amber-200/50' :
                            order.status === 'cancelled' ? 'bg-rose-50 text-rose-700 border border-rose-200/50' :
                            'bg-sky-50 text-sky-800 border border-sky-200/50'
                          }`}>
                            {order.status === 'completed' && <CheckCircle className="w-3 h-3 text-emerald-600" />}
                            {order.status === 'cancelled' && <XCircle className="w-3 h-3 text-rose-500" />}
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}