import { useEffect, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, CartesianGrid, PieChart, Pie,
} from 'recharts';
import { Package, ShoppingBag, DollarSign, Clock, CheckCircle, XCircle, RefreshCw, ArrowUpRight } from 'lucide-react';
import api from '../../api';
 
const STATUS_COLORS = {
  pending:    '#C9A94F',
  processing: '#6B8A9E',
  completed:  '#4A6838',
  cancelled:  '#B0664A',
};
 
function formatMMK(value) {
  return new Intl.NumberFormat('en-US').format(value) + ' MMK';
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
 
export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [productCount, setProductCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
 
  const fetchData = () => {
    setIsRefreshing(true);
    api.get('/admin')
      .then(({ data }) => {
        setOrders(data.orders);
        setProductCount(data.product_count);
      })
      .catch((err) => console.error('Dashboard fetch failed:', err))
      .finally(() => {
        setLoading(false);
        setIsRefreshing(false);
      });
  };
 
  useEffect(() => {
    fetchData();
  }, []);
 
  const completedOrders = orders.filter(o => o.status === 'completed');
  const pendingOrders = orders.filter(o => o.status === 'pending');
  const totalRevenue = completedOrders.reduce((s, o) => s + o.total_amount, 0);
  const todayRevenue = completedOrders.filter(o => {
    const d = new Date(o.created_at);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  }).reduce((s, o) => s + o.total_amount, 0);
 
  const trendData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const short = d.toLocaleDateString('en-US', { weekday: 'short' });
    const dayOrders = orders.filter(o => {
      const od = new Date(o.created_at);
      return od.toDateString() === d.toDateString() && o.status !== 'cancelled';
    });
    return { short, revenue: dayOrders.reduce((s, o) => s + o.total_amount, 0) };
  });
 
  const statusData = ['pending', 'processing', 'completed', 'cancelled'].map(s => ({
    name: s,
    value: orders.filter(o => o.status === s).length,
    fill: STATUS_COLORS[s],
  })).filter(s => s.value > 0);
 
  const recentOrders = orders.slice(0, 6);
 
  const statCards = [
    { label: 'Total Revenue', value: loading ? '—' : formatMMK(totalRevenue), sub: loading ? '' : `Today: ${formatMMK(todayRevenue)}`, icon: DollarSign },
    { label: 'Total Orders', value: loading ? '—' : orders.length, sub: loading ? '' : `${completedOrders.length} completed`, icon: ShoppingBag },
    { label: 'Pending Orders', value: loading ? '—' : pendingOrders.length, sub: 'Awaiting action', icon: Clock },
    { label: 'Active Products', value: loading ? '—' : productCount, sub: 'In catalogue', icon: Package },
  ];
 
  return (
    <div className="min-h-screen relative overflow-hidden   selection:bg-nature-olive/10">
      <style>{`
        @keyframes floatA { 0%,100% { transform: translate(0,0) scale(1); } 33% { transform: translate(40px,-60px) scale(1.12); } 66% { transform: translate(-20px, 20px) scale(0.95); } }
        @keyframes floatB { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-60px,40px) scale(1.15); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px) scale(0.98); filter: blur(4px); } to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); } }
        .anim-blob-a { animation: floatA 25s ease-in-out infinite; background: radial-gradient(circle, rgba(74,104,56,0.12) 0%, rgba(255,255,255,0) 70%); }
        .anim-blob-b { animation: floatB 30s ease-in-out infinite; background: radial-gradient(circle, rgba(201,169,79,0.08) 0%, rgba(255,255,255,0) 70%); }
        .fade-up { animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) both; }
      `}</style>
 
     
 
      <div className="relative p-6 md:p-10 z-10">
        <div className="text-nature-dark space-y-10 max-w-7xl mx-auto">
 
          {/* Header section */}
          <div className="flex items-center justify-between fade-up">
            <div className="space-y-1">
              <h1 className="font-serif text-4xl font-normal tracking-tight text-neutral-800">Dashboard</h1>
              <p className="text-nature-muted text-xs font-medium tracking-wide uppercase opacity-80">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <button
              onClick={fetchData}
              disabled={isRefreshing}
              className="group flex items-center gap-2 text-nature-muted hover:text-nature-olive text-xs font-medium tracking-wide transition-all duration-500 border border-nature-border/80 hover:border-nature-olive/40 bg-white/60 backdrop-blur-md hover:bg-white px-4 py-2 rounded-xl shadow-sm hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 transition-transform duration-700 ease-out ${isRefreshing ? 'animate-spin' : 'group-hover:rotate-180'}`} />
              Sync Ledger
            </button>
          </div>
 
          {/* Stats Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {statCards.map(({ label, value, sub, icon: Icon }, i) => (
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
                <p className="font-serif text-3xl font-light tracking-tight mb-1 text-neutral-800 transition-transform duration-500 group-hover:translate-x-0.5">{value}</p>
                <p className="text-nature-muted/80 text-xs font-medium">{sub}</p>
              </div>
            ))}
          </div>
 
          {/* Charts Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Main Area Chart Container */}
            <div className="fade-up xl:col-span-2 bg-white/20 backdrop-blur-xl border border-white/50 rounded-2xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)] hover:shadow-[0_20px_40px_-10px_rgba(74,104,56,0.8)] transition-all duration-500" style={{ animationDelay: '200ms' }}>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-nature-olive animate-pulse" />
                    <h2 className="text-xs font-bold tracking-widest uppercase text-nature-olive">Revenue Performance</h2>
                  </div>
                  <p className="text-nature-muted text-xs">Rolling 7-day visualization matrix</p>
                </div>
                <div className="flex items-center gap-2 bg-neutral-100/80 px-3 py-1.5 rounded-lg border border-neutral-200/40">
                  <div className="w-4 h-0.5 rounded bg-nature-olive" />
                  <span className="text-nature-muted text-[11px] font-semibold uppercase tracking-wider">Gross Revenue</span>
                </div>
              </div>
              {loading ? (
                <div className="h-56 bg-neutral-200/30 rounded-xl animate-pulse" />
              ) : (
                <div className="h-56 w-full opacity-95 hover:opacity-100 transition-opacity duration-300">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4A6838" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#4A6838" stopOpacity={0.00} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="4 4" stroke="#E5E5E5" vertical={false} />
                      <XAxis dataKey="short" tick={{ fill: '#8E918B', fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} />
                      <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} tick={{ fill: '#8E918B', fontSize: 10, fontWeight: 500 }} axisLine={false} tickLine={false} width={40} />
                      <Tooltip content={<AreaTooltip />} cursor={{ stroke: '#4A6838', strokeWidth: 1.5, strokeDasharray: '3 3' }} />
                      <Area type="natural" dataKey="revenue" stroke="#4A6838" strokeWidth={2.5} fill="url(#revenueGrad)" dot={{ fill: '#4A6838', r: 3, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, fill: '#3A5530', stroke: '#fff', strokeWidth: 2 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
 
            {/* Pie Chart Card */}
            <div className="fade-up bg-white/20 backdrop-blur-xl border border-white/50 rounded-2xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)] hover:shadow-[0_20px_40px_-10px_rgba(74,104,56,0.8)] transition-all duration-500" style={{ animationDelay: '300ms' }}>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-2 h-2 rounded-full bg-nature-olive" />
                <h2 className="text-xs font-bold tracking-widest uppercase text-nature-olive">Allocation Stream</h2>
              </div>
              {loading ? (
                <div className="h-56 bg-neutral-200/30 rounded-xl animate-pulse" />
              ) : statusData.length === 0 ? (
                <div className="h-56 flex items-center justify-center text-nature-muted text-sm border border-dashed border-neutral-200 rounded-xl">No active volumes</div>
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
 
          {/* Table Container */}
          <div className="fade-up bg-white/20 backdrop-blur-xl border border-white/50 rounded-2xl overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)] hover:shadow-[0_20px_40px_-10px_rgba(74,104,56,0.8)] transition-all duration-500" style={{ animationDelay: '400ms' }}>
            <div className="flex items-center justify-between px-8 py-5 border-b border-neutral-200/60 bg-white/30">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-nature-olive" />
                <h2 className="text-xs font-bold tracking-widest uppercase text-nature-olive">Live Activity Feed</h2>
              </div>
              <a href="#" className="group flex items-center gap-1 text-[11px] font-bold tracking-wider text-nature-olive transition-colors hover:text-nature-olive/70">
                VIEW LEDGER <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
              </a>
            </div>
            {loading ? (
              <div className="p-6 space-y-3.5">
                {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-14 bg-neutral-200/30 rounded-xl animate-pulse" />)}
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="p-12 text-center text-nature-muted text-sm">No transaction sequences found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-neutral-50/40 text-left">
                      <th className="text-nature-muted text-[11px] font-bold tracking-wider uppercase px-8 py-4 opacity-80">Customer Profile</th>
                      <th className="text-nature-muted text-[11px] font-bold tracking-wider uppercase px-8 py-4 hidden md:table-cell opacity-80">Timestamp</th>
                      <th className="text-right text-nature-muted text-[11px] font-bold tracking-wider uppercase px-8 py-4 opacity-80">Quantum</th>
                      <th className="text-right text-nature-muted text-[11px] font-bold tracking-wider uppercase px-8 py-4 opacity-80">Status Token</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order, index) => (
                      <tr
                        key={order.id}
                        className="border-b border-neutral-200/40 last:border-0 hover:bg-white/80 transition-all duration-300 group"
                        style={{ animationDelay: `${index * 50}ms` }}
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