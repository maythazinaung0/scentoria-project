import { Eye, Package, Loader2, ArrowRight } from 'lucide-react';
import { formatMMK } from '../../../utils/currency';
import { formatFulfillment } from '../../../utils/datetime';
import { STATUS_STYLES } from './constants';

// ---------------------------------------------------------------------------
// Status control.
//
// Business flow: the admin's ONLY action is moving an order from
// 'pending' to 'processing' once they've started fulfilling it. Every
// status after that is driven by the customer (they click a confirmation
// link in their email to mark it 'completed'; only they can 'cancel').
// So there is nothing for the admin to do once an order leaves 'pending' —
// showing a dropdown or override menu there would suggest control the
// admin doesn't actually have. We just show the badge for those cases.
// ---------------------------------------------------------------------------
function StatusControl({ order, onUpdateStatus, updating }) {
  const isPending = order.status === 'pending';

  function handleStartProcessing(e) {
    e.stopPropagation();
    if (!updating) onUpdateStatus(order.id, 'processing');
  }

  return (
    <div className="inline-flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
      <span
        className={`text-[11px] font-medium px-2.5 py-1 rounded-full capitalize ${STATUS_STYLES[order.status] || 'bg-gray-100 text-gray-700'}`}
      >
        {order.status}
      </span>

      {isPending && (
        <button
          onClick={handleStartProcessing}
          disabled={updating}
          title="Mark as Processing"
          className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full border border-nature-olive/30 text-nature-olive hover:bg-nature-olive/10 transition-colors disabled:opacity-50"
        >
          {updating ? <Loader2 className="w-3 h-3 animate-spin" /> : <ArrowRight className="w-3 h-3" />}
          Start Processing
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Order list table (order id, fulfillment, items, total, customer, status)
// `footer` renders inside the same card as the table (e.g. AdminPagination)
// so there's one continuous surface instead of a separately-floating bar.
// ---------------------------------------------------------------------------
export default function OrderTable({ filtered, onSelectOrder, onUpdateStatus, updatingId, footer }) {
  return (
    <div className="bg-white/30 backdrop-blur-xl border border-white/60 rounded-2xl overflow-hidden shadow-[0_2px_16px_-4px_rgba(44,53,39,0.08)]">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-nature-border/60">
              <th className="text-left text-nature-muted text-[10px] font-semibold tracking-[0.15em] uppercase px-5 py-4">Order ID</th>
              <th className="text-left text-nature-muted text-[10px] font-semibold tracking-[0.15em] uppercase px-5 py-4 hidden md:table-cell">Fulfillment</th>
              <th className="text-left text-nature-muted text-[10px] font-semibold tracking-[0.15em] uppercase px-5 py-4 hidden lg:table-cell">Order Items</th>
              <th className="text-left text-nature-muted text-[10px] font-semibold tracking-[0.15em] uppercase px-5 py-4">Total</th>
              <th className="text-left text-nature-muted text-[10px] font-semibold tracking-[0.15em] uppercase px-5 py-4">Customer</th>
              <th className="text-left text-nature-muted text-[10px] font-semibold tracking-[0.15em] uppercase px-5 py-4">Status</th>
              <th className="px-5 py-4 w-16" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((order, i) => (
              <tr
                key={order.id}
                onClick={() => onSelectOrder(order)}
                className={`${i !== filtered.length - 1 ? 'border-b border-nature-border/40' : ''} hover:bg-nature-olive/5 cursor-pointer transition-colors group`}
              >
                <td className="px-5 py-4 font-medium text-neutral-800">#{String(order.id).padStart(4, '0')}</td>
                <td className="px-5 py-4 text-xs text-nature-muted hidden md:table-cell whitespace-nowrap">{formatFulfillment(order.created_at)}</td>
                <td className="px-5 py-4 text-xs text-nature-muted hidden lg:table-cell">
                  <span className="inline-flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-nature-olive/50" /> {order.order_items?.length ?? 0} Items
                  </span>
                </td>
                <td className="px-5 py-4 text-nature-olive font-semibold">{formatMMK(order.total_amount || 0)}</td>
                <td className="px-5 py-4">
                  <p className="font-medium text-neutral-800 truncate max-w-[140px]">{order.customer_name || 'Guest'}</p>
                </td>
                <td className="px-5 py-4 whitespace-nowrap">
                  <StatusControl
                    order={order}
                    onUpdateStatus={onUpdateStatus}
                    updating={updatingId === order.id}
                  />
                </td>
                <td className="px-5 py-4">
                  <button
                    onClick={(e) => { e.stopPropagation(); onSelectOrder(order); }}
                    className="opacity-0 group-hover:opacity-100 flex items-center justify-center w-7 h-7 rounded-lg text-nature-muted hover:text-nature-olive hover:bg-nature-olive/10 transition-all"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {footer}
    </div>
  );
}