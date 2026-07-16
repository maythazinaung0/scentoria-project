import { X, Mail, Phone, MapPin } from 'lucide-react';
import { formatMMK } from '../../../utils/currency';
import { formatFulfillment } from '../../../utils/datetime';
import { HIDE_SCROLLBAR } from '../../../utils/ui';
import Dropdown from '../../../components/Admin/Dropdown';
import { STATUS_STYLES, STATUS_UPDATE_OPTIONS } from './constants';

export default function OrderDetailModal({ order, onClose, onUpdateStatus, updating }) {
  const items = order.order_items ?? [];

  return (
    <div className="fixed inset-0 bg-nature-dark/85 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className={`bg-nature-card border border-nature-olive/20 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto ${HIDE_SCROLLBAR} space-y-5 animate-fadeIn`} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between pb-3 border-b border-nature-olive/20">
          <h2 className="font-serif text-xl">Order Details</h2>
          <button onClick={onClose} className="text-nature-muted hover:text-nature-olive transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex items-center justify-between bg-nature-bg p-3 rounded-xl border border-nature-olive/20">
          <div>
            <h3 className="font-serif text-xl font-medium">#{order.id}</h3>
            <p className="text-nature-muted text-xs mt-1">{formatFulfillment(order.created_at)}</p>
          </div>
          <span className={`text-xs px-3 py-1.5 rounded-full capitalize font-medium ${STATUS_STYLES[order.status] || 'bg-gray-100 text-gray-700'}`}>
            {order.status}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="bg-nature-bg p-2.5 rounded-lg border border-nature-olive/15">
            <span className="text-nature-olive text-[10px] font-semibold uppercase tracking-wider block mb-1">Customer</span>
            <span className="font-medium text-sm text-nature-dark">{order.customer_name || 'Guest'}</span>
          </div>
          <div className="bg-nature-bg p-2.5 rounded-lg border border-nature-olive/15">
            <span className="text-nature-olive text-[10px] font-semibold uppercase tracking-wider block mb-1">Payment Method</span>
            <span className="font-medium text-sm text-nature-dark capitalize">{order.payment_method?.replace('_', ' ') || '—'}</span>
          </div>
          <div className="bg-nature-bg p-2.5 rounded-lg border border-nature-olive/15 flex items-start gap-2">
            <Mail className="w-3.5 h-3.5 text-nature-olive mt-0.5 shrink-0" />
            <div><span className="text-nature-olive text-[10px] font-semibold uppercase tracking-wider block">Email</span><span className="text-nature-dark">{order.customer_email || 'No email'}</span></div>
          </div>
          <div className="bg-nature-bg p-2.5 rounded-lg border border-nature-olive/15 flex items-start gap-2">
            <Phone className="w-3.5 h-3.5 text-nature-olive mt-0.5 shrink-0" />
            <div><span className="text-nature-olive text-[10px] font-semibold uppercase tracking-wider block">Phone</span><span className="text-nature-dark">{order.customer_phone || 'No phone'}</span></div>
          </div>
          <div className="col-span-1 sm:col-span-2 bg-nature-bg p-2.5 rounded-lg border border-nature-olive/15 flex items-start gap-2">
            <MapPin className="w-3.5 h-3.5 text-nature-olive mt-0.5 shrink-0" />
            <div><span className="text-nature-olive text-[10px] font-semibold uppercase tracking-wider block">Delivery Address</span><span className="text-nature-dark">{order.customer_address || order.address || 'No address provided'}</span></div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-xs font-bold text-nature-olive uppercase tracking-wider">Items ({items.length})</h4>
          <div className="space-y-2">
            {items.map(item => (
              <div key={item.id} className="flex justify-between items-center bg-nature-bg border border-nature-olive/15 rounded-xl p-3 text-xs gap-2">
                <div className="min-w-0">
                  <p className="text-nature-dark font-medium truncate">{item.brand} — {item.product_name}</p>
                  <p className="text-nature-muted capitalize">{item.size} &bull; ×{item.quantity}</p>
                </div>
                <span className="text-nature-olive font-semibold shrink-0">{formatMMK((item.unit_price || 0) * (item.quantity || 1))}</span>
              </div>
            ))}
            {items.length === 0 && <p className="text-xs text-center text-nature-muted italic">No items on this order.</p>}
          </div>
        </div>

        <div className="flex justify-between items-center bg-nature-bg border border-nature-olive/20 rounded-xl p-3">
          <span className="text-nature-olive text-xs font-semibold uppercase tracking-wider">Order Total</span>
          <span className="text-nature-olive font-bold text-sm">{formatMMK(order.total_amount || 0)}</span>
        </div>

        <div className="pt-1">
          <button type="button" onClick={onClose} className="w-full border border-nature-olive/30 text-nature-dark hover:border-nature-olive hover:text-nature-olive transition-colors py-2 rounded-xl text-sm">Close</button>
        </div>
      </div>
    </div>
  );
}