import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Trophy, Clock } from 'lucide-react';
import api from '../../api';
import { formatMMK } from '../../utils/currency';

function formatYearMonth(ym) {
  if (!ym || ym.length !== 6) return ym;
  const year = ym.slice(0, 4);
  const month = ym.slice(4, 6);
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
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

function RevenueTrend({ monthly }) {
  const max = Math.max(...monthly.map((m) => m.total_revenue), 1);

  return (
    <div className="bg-white/30 backdrop-blur-xl border border-white/60 rounded-2xl p-6 shadow-[0_2px_16px_-4px_rgba(44,53,39,0.08)]">
      <h2 className="font-serif text-xl text-neutral-800 mb-1">Revenue Trend</h2>
      <p className="text-nature-muted text-xs mb-6">Monthly revenue from completed orders</p>

      {monthly.length === 0 ? (
        <p className="text-nature-muted text-sm text-center py-12">No revenue data yet.</p>
      ) : (
        <div className="flex items-end gap-3 h-48">
          {monthly.map((m) => (
            <div key={m.year_month} className="flex-1 flex flex-col items-center gap-2 group">
              <p className="text-[10px] text-nature-olive font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                {formatMMK(m.total_revenue)}
              </p>
              <div
                className="w-full bg-gradient-to-t from-nature-olive to-nature-olive/50 rounded-t-lg transition-all duration-500 group-hover:from-nature-olive group-hover:to-nature-olive"
                style={{ height: `${Math.max((m.total_revenue / max) * 100, 4)}%` }}
              />
              <p className="text-[10px] text-nature-muted whitespace-nowrap">{formatYearMonth(m.year_month)}</p>
            </div>
          ))}
        </div>
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
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    api.get('/admin/sales-report', { signal: controller.signal })
      .then(({ data }) => setReport(data))
      .catch((err) => {
        if (err.name !== 'CanceledError') console.error('Failed to load sales report:', err);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

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

  const growth = report.growth_percent;
  const growthLabel = growth === null
    ? 'No prior month to compare'
    : `${growth > 0 ? '+' : ''}${growth}% vs last month`;
  const topProduct = report.top_products[0];

  return (
    <div className="text-nature-dark space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl">Sales Report</h1>
          <p className="text-nature-muted text-sm mt-0.5 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {report.generated_at
              ? `Last updated ${new Date(report.generated_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })} (nightly batch)`
              : 'Not yet generated — run the nightly batch job'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <StatCard
          label="This Month's Revenue"
          value={formatMMK(report.current_month_revenue)}
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

      <RevenueTrend monthly={report.monthly_revenue} />
      <TopProducts products={report.top_products} />
    </div>
  );
}