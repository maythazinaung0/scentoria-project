import { useEffect, useRef, useState } from 'react';
import { Eye, Package, ChevronDown, Loader2 } from 'lucide-react';
import { formatMMK } from '../../../utils/currency';
import { formatFulfillment } from '../../../utils/datetime';
import { STATUS_STYLES, STATUS_OPTIONS } from './constants';

// ---------------------------------------------------------------------------
// Inline status control — click the pill to change status without opening
// the detail modal. Closes on selection or on click-outside.
// ---------------------------------------------------------------------------
function StatusDropdown({ order, onUpdateStatus, updating }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  function handleSelect(e, value) {
    e.stopPropagation();
    setOpen(false);
    if (value !== order.status) onUpdateStatus(order.id, value);
  }

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        disabled={updating}
        className={`flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full capitalize transition-opacity hover:opacity-80 disabled:opacity-60 ${STATUS_STYLES[order.status] || 'bg-gray-100 text-gray-700'}`}
      >
        {updating ? <Loader2 className="w-3 h-3 animate-spin" /> : order.status}
        {!updating && <ChevronDown className="w-3 h-3" />}
      </button>

      {open && (
        <div className="absolute z-20 top-full mt-1 left-0 bg-white/95 backdrop-blur-xl border border-white/60 rounded-xl shadow-[0_12px_32px_-8px_rgba(44,53,39,0.25)] py-1.5 min-w-[140px]">
          {STATUS_OPTIONS.filter((o) => o.value).map((option) => (
            <button
              key={option.value}
              onClick={(e) => handleSelect(e, option.value)}
              className={`w-full text-left px-3.5 py-2 text-xs capitalize hover:bg-nature-olive/10 transition-colors flex items-center gap-2 ${
                option.value === order.status ? 'text-nature-olive font-semibold' : 'text-neutral-700'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${STATUS_STYLES[option.value]?.split(' ')[0] || 'bg-gray-300'}`} />
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Order list table (order id, fulfillment, items, total, customer, status)
// ---------------------------------------------------------------------------
export default function OrderTable({ filtered, onSelectOrder, onUpdateStatus, updatingId }) {
  return (
    <div className="bg-white/30 backdrop-blur-xl border border-white/60 rounded-2xl overflow-hidden shadow-[0_2px_16px_-4px_rgba(44,53,39,0.08)]">
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
              <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                <StatusDropdown
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
  );
}