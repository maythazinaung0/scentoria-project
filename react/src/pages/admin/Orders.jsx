import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  // 1. Fetch Orders from Backend with Defensive Type Checking
  const load = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/orders'); 
      
      // Inspect your network tab or console if data isn't showing up
      console.log("Raw API Response:", response.data); 

      // Safely handle different common API response formats
      if (Array.isArray(response.data)) {
        setOrders(response.data);
      } else if (response.data && Array.isArray(response.data.orders)) {
        setOrders(response.data.orders); // If wrapped in { orders: [] }
      } else if (response.data && Array.isArray(response.data.data)) {
        setOrders(response.data.data);   // If wrapped in { data: [] }
      } else {
        console.error("API structure unexpected. Expected array but got:", response.data);
        setOrders([]); // Fallback to safe empty array
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      setOrders([]); // Fallback on network/server error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    load(); 
  }, []);

  // 2. Update Order Status
  const updateStatus = async (orderId, newStatus) => {
    try {
      await axios.patch(`/api/admin/orders/${orderId}`, { status: newStatus });
      
      // Update UI locally immediately
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Could not update status. Please try again.");
    }
  };

  // 3. Format Currency to MMK (Myanmar Kyat)
  const formatMMK = (amount) => {
    return new Intl.NumberFormat('en-MM', {
      style: 'currency',
      currency: 'MMK',
      currencyDisplay: 'narrowSymbol'
    }).format(amount);
  };

  const statusColor = {
    pending: 'bg-amber-100 text-amber-800',
    processing: 'bg-sky-100 text-sky-800',
    completed: 'bg-emerald-100 text-emerald-800',
  };

  return (
    <div className="text-nature-dark">
      <h1 className="font-serif text-3xl text-nature-dark mb-8">Orders</h1>

      {/* Loading Skeleton State */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-nature-card rounded-xl h-16 animate-pulse" />
          ))}
        </div>
      ) : (!Array.isArray(orders) || orders.length === 0) ? (
        /* Safe Empty State (Checks if orders is an array to prevent crashes) */
        <p className="text-nature-muted text-center py-20">No orders yet.</p>
      ) : (
        /* Orders List Rendering */
        <div className="space-y-3">
          {orders.map(order => (
            <div key={order.id} className="bg-nature-card border border-nature-border rounded-2xl overflow-hidden">
              
              {/* Accordion Header */}
              <div
                className="flex flex-wrap items-center justify-between gap-3 p-5 cursor-pointer hover:bg-nature-sage/10 transition-colors"
                onClick={() => setExpanded(expanded === order.id ? null : order.id)}
              >
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-nature-dark font-medium">{order.customer_name}</p>
                    <p className="text-nature-muted text-xs font-mono">
                      {order.id ? order.id.slice(0, 8).toUpperCase() : 'N/A'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <p className="text-nature-muted text-xs hidden sm:block">
                    {order.created_at 
                      ? new Date(order.created_at).toLocaleDateString('en-MM', { day: '2-digit', month: 'short', year: 'numeric' })
                      : '—'
                    }
                  </p>
                  <p className="text-nature-olive font-semibold">{formatMMK(order.total_amount || 0)}</p>
                  
                  {/* Status Picker Selector / Badge */}
                  {order.status === 'pending' ? (
                    <select
                      value={order.status}
                      onClick={e => e.stopPropagation()}
                      onChange={e => updateStatus(order.id, e.target.value)}
                      className={`text-xs px-2 py-1 rounded-full border-0 outline-none cursor-pointer capitalize ${statusColor[order.status] || 'bg-gray-100'}`}
                    >
                      <option value="pending">pending</option>
                      <option value="completed">Accept Order</option>
                    </select>
                  ) : (
                    <span className={`text-xs px-2 py-1 rounded-full capitalize ${statusColor[order.status] || 'bg-gray-100'}`}>
                      {order.status}
                    </span>
                  )}
                </div>
              </div>

              {/* Accordion Content Details */}
              {expanded === order.id && (
                <div className="border-t border-nature-border p-5 bg-nature-bg/50">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5 text-sm">
                    <div>
                      <p className="text-nature-muted text-xs tracking-wider mb-1">CONTACT</p>
                      <p className="text-nature-dark">{order.customer_email || 'No email'}</p>
                      <p className="text-nature-dark">{order.customer_phone || 'No phone'}</p>
                    </div>
                    <div>
                      <p className="text-nature-muted text-xs tracking-wider mb-1">DELIVERY ADDRESS</p>
                      <p className="text-nature-dark">{order.customer_address || 'No address provided'}</p>
                    </div>
                  </div>
                  
                  {/* Inner Order Items Table */}
                  <div className="space-y-2">
                    <p className="text-nature-muted text-xs tracking-wider mb-2">ITEMS</p>
                    {order.order_items?.map(item => (
                      <div key={item.id} className="flex justify-between text-sm bg-nature-card rounded-lg px-4 py-2">
                        <span className="text-nature-dark">
                          {item.brand} — {item.product_name} <span className="text-nature-muted capitalize">({item.size})</span> ×{item.quantity}
                        </span>
                        <span className="text-nature-olive">{formatMMK((item.unit_price || 0) * (item.quantity || 1))}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          ))}
        </div>
      )}
    </div>
  );
}