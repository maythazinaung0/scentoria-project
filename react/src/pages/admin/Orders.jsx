import React, { useState, useEffect } from 'react';
import { Package } from 'lucide-react';
import api from '../../api'; 

const formatMMK = (amount) => {
  return new Intl.NumberFormat('en-MM', {
    style: 'currency',
    currency: 'MMK',
    minimumFractionDigits: 0
  }).format(amount);
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(null);

  async function load() {
    try {
      setLoading(true);
      const response = await api.get('/admin/orders');
      
      
      if (Array.isArray(response.data)) {
        setOrders(response.data);
      } else if (response.data && Array.isArray(response.data.data)) {
        setOrders(response.data.data);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error("Failed to query administration orders registry:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setStatusUpdating(orderId);
    await api.patch(`/admin/orders/${orderId}`, { status: newStatus });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (error) {
      console.error("Error mutating administrative database workflow state:", error);
      alert("Could not update order status context attributes.");
    } finally {
      setStatusUpdating(null);
    }
  };

  const statusColor = {
    pending: 'bg-amber-50 text-amber-800 border-amber-200',
    processing: 'bg-blue-50 text-blue-800 border-blue-200',
    completed: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    cancelled: 'bg-rose-50 text-rose-800 border-rose-200',
  };

  return (
    <div className="text-nature-dark space-y-6">
      <div>
        <h1 className="font-serif text-3xl">Orders</h1>
        <p className="text-nature-muted text-sm mt-0.5">{orders.length} transactions processed</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-nature-card rounded-xl h-20 animate-pulse border border-nature-border" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 text-nature-muted bg-white border border-nature-border rounded-2xl">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No Order Record Found.</p>
        </div>
      ) : (
        <div className="bg-white border border-nature-border rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b bg-slate-50/70 text-nature-muted text-xs uppercase tracking-wider">
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Customer Info</th>
                  <th className="px-6 py-4">Total Charge</th>
                  <th className="px-6 py-4">Status Flag</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-nature-border/40">
                {orders.map(order => (
                  <React.Fragment key={order.id}>
                    <tr className="hover:bg-slate-50/60 transition-colors cursor-pointer" onClick={() => setExpanded(expanded === order.id ? null : order.id)}>
                      <td className="px-6 py-4 font-mono text-xs font-semibold">
                        #{order.id}
                        <span className="block text-[10px] text-nature-muted font-sans font-normal mt-0.5">
                          {order.created_at ? new Date(order.created_at).toLocaleDateString('en-MM', {day: '2-digit', month: 'short'}) : '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-sm">{order.customer_name}</div>
                        <div className="text-xs text-nature-muted truncate max-w-[200px]">{order.customer_email || 'No email registered'}</div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-nature-olive">
                        {formatMMK(order.total_amount)}
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={order.status}
                          disabled={statusUpdating === order.id}
                          onClick={e => e.stopPropagation()}
                          onChange={e => handleStatusChange(order.id, e.target.value)}
                          className={`text-xs px-2.5 py-1 rounded-full border outline-none font-medium capitalize cursor-pointer transition-all ${statusColor[order.status] || 'bg-gray-100'}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-right text-xs text-nature-olive font-medium">
                        {expanded === order.id ? 'Hide Details' : 'View Details'}
                      </td>
                    </tr>
                    
                    {expanded === order.id && (
                      <tr>
                        <td colSpan="5" className="bg-slate-50/50 px-8 py-5 border-t border-b">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                            <div className="space-y-1">
                              <span className="text-[10px] uppercase font-bold tracking-wider text-nature-muted block">Metadata</span>
                              <p className="text-nature-dark font-medium">{order.customer_phone || 'No Phone Number'}</p>
                              <p className="text-nature-muted leading-relaxed">{order.customer_address || 'No Delivery Address Set'}</p>
                            </div>
                            <div className="md:col-span-2 space-y-2">
                              <span className="text-[10px] uppercase font-bold tracking-wider text-nature-muted block">Line Items</span>
                              <div className="space-y-1.5">
                                {order.order_items?.map((item, idx) => (
                                  <div key={idx} className="flex justify-between items-center bg-white border border-gray-200/80 rounded-xl px-4 py-2.5 shadow-sm">
                                    <span className="font-medium text-nature-dark">
                                      {item.brand} &bull; {item.product_name} 
                                      <span className="text-nature-muted text-[11px] font-normal mx-1">({item.size})</span>
                                      <span className="bg-slate-100 text-slate-700 font-bold px-1.5 py-0.5 rounded ml-1 text-[10px]">×{item.quantity}</span>
                                    </span>
                                    <span className="font-mono text-nature-muted">{formatMMK(item.unit_price * item.quantity)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}