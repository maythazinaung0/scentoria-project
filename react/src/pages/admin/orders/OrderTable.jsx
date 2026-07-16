import { Package, Loader2, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { formatMMK } from '../../../utils/currency';
import { formatFulfillment } from '../../../utils/datetime';
import { STATUS_STYLES } from './constants';

const COLUMNS = [
  { key: 'id', label: 'Order ID', className: 'px-5 py-4' },
  { key: 'fulfillment', label: 'Fulfillment', className: 'px-5 py-4 hidden md:table-cell' },
  { key: 'items', label: 'Order Items', className: 'px-5 py-4 hidden lg:table-cell' },
  { key: 'total', label: 'Total', className: 'px-5 py-4' },
  { key: 'customer', label: 'Customer', className: 'px-5 py-4' },
  { key: 'status', label: 'Status', className: 'px-5 py-4' },
];

function SortHeader({ col, sortKey, sortDir, onSort }) {
  const active = sortKey === col.key;
  return (
    <th
      onClick={() => onSort(col.key)}
      className={`text-left text-[10px] font-semibold tracking-[0.15em] uppercase cursor-pointer select-none group whitespace-nowrap ${col.className}`}
    >
      <span className={`inline-flex items-center gap-1 ${active ? 'text-nature-olive' : 'text-nature-muted group-hover:text-neutral-700'}`}>
        {col.label}
        {active ? (
          sortDir === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
        ) : (
          <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-40 transition-opacity" />
        )}
      </span>
    </th>
  );
}

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
//
// The pending state is rendered as a clickable pill in the same visual
// language as the product status toggle (colored pill + dot), rather than
// a bordered button, so "this is a state you can flip" reads consistently
// across the admin. onUpdateStatus is expected to confirm before acting.
// ---------------------------------------------------------------------------
function StatusControl({ order, onUpdateStatus, updating }) {
  const isPending = order.status === 'pending';

  function handleStartProcessing(e) {
    e.stopPropagation();
    if (!updating) onUpdateStatus(order.id, 'processing');
  }

  if (!isPending) {
    return (
      <span
        className={`text-[11px] font-medium px-2.5 py-1 rounded-full capitalize ${STATUS_STYLES[order.status] || 'bg-gray-100 text-gray-700'}`}
      >
        {order.status}
      </span>
    );
  }

  return (
    <button
      onClick={handleStartProcessing}
      disabled={updating}
      title="Click to start processing"
      className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full font-medium capitalize transition-opacity hover:opacity-75 disabled:opacity-50 disabled:cursor-wait bg-amber-100 text-amber-800"
    >
      {updating ? (
        <Loader2 className="w-2.5 h-2.5 animate-spin" />
      ) : (
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
      )}
      pending
    </button>
  );
}

// ---------------------------------------------------------------------------
// Order list table (order id, fulfillment, items, total, customer, status)
// Clicking anywhere on a row opens the detail modal — no separate eye
// button, matching the Products table's row-click pattern.
// `footer` renders inside the same card as the table (e.g. AdminPagination)
// so there's one continuous surface instead of a separately-floating bar.
// ---------------------------------------------------------------------------
export default function OrderTable({ filtered, onSelectOrder, onUpdateStatus, updatingId, sortKey, sortDir, onSort, footer }) {
  return (
    <div className="bg-white/30 backdrop-blur-xl border border-white/60 rounded-2xl overflow-hidden shadow-[0_2px_16px_-4px_rgba(44,53,39,0.08)]">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-nature-border/60">
              {COLUMNS.map(col => (
                <SortHeader key={col.key} col={col} sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((order, i) => (
              <tr
                key={order.id}
                onClick={() => onSelectOrder(order)}
                className={`${i !== filtered.length - 1 ? 'border-b border-nature-border/40' : ''} hover:bg-nature-olive/5 cursor-pointer transition-colors group`}
              >
                <td className="px-5 py-4 font-medium text-neutral-800">#{order.id}</td>
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
                <td className="px-5 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                  <StatusControl
                    order={order}
                    onUpdateStatus={onUpdateStatus}
                    updating={updatingId === order.id}
                  />
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