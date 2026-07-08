import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Package } from 'lucide-react';
import axios from 'axios'; 

const formatMMK = (amount) => `${Number(amount).toLocaleString()} MMK`;

export default function OrderConfirmPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    axios.get(`http://localhost/api/orders/${id}`)
      .then((response) => {
        setOrder(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching order:", error);
        setLoading(false);
      });
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-nature-bg pt-24 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-nature-olive border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!order) return (
    <div className="min-h-screen bg-nature-bg pt-24 flex items-center justify-center text-nature-muted">
      Order not found.
    </div>
  );

  return (
    <div className="min-h-screen bg-nature-bg text-nature-dark pt-24">
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-nature-sage/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-nature-olive" />
        </div>
        <h1 className="font-serif text-3xl text-nature-dark mb-3">Order Confirmed</h1>
        <p className="text-nature-muted mb-8">
          Thank you! Your fragrance order has been received.
        </p>

        <div className="bg-nature-card border border-nature-border rounded-xl p-6 text-left mb-6">
          <div className="flex items-center gap-3 mb-5">
            <Package className="w-4 h-4 text-nature-olive" />
            <span className="text-nature-olive text-[11px] tracking-[0.2em] uppercase">Order Details</span>
          </div>
          <div className="space-y-2.5 mb-5 text-sm">
            {[
              { label: 'Order ID', value: `#${order.id}`, mono: true },
              { label: 'Address', value: order.address },
              { label: 'Payment Method', value: order.payment_method, cap: true },
              { label: 'Status', value: order.status, cap: true },
            ].map(row => (
              <div key={row.label} className="flex justify-between">
                <span className="text-nature-muted">{row.label}</span>
                <span className={`${row.mono ? 'font-mono text-xs' : ''} ${row.cap ? 'capitalize text-nature-olive font-medium' : 'text-nature-dark'} text-right ml-4`}>
                  {row.value}
                </span>
              </div>
            ))}
          </div>

          { /* Order Items section - updated to look for Laravel's standard snake_case relation array */}
            {order.items && order.items.length > 0 && (
            <div className="border-t border-nature-border pt-4 space-y-2">
                {order.items.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-nature-muted">
                    {item.variant?.product?.name || 'Fragrance Product'} ({item.variant?.size || 'Variant'}) ×{item.quantity}[cite: 21]
                    </span>
                    <span className="text-nature-dark">{formatMMK(item.price * item.quantity || 0)}</span>
                </div>
                ))}
            </div>
            )}

          <div className="border-t border-nature-border pt-4 mt-4 flex justify-between">
            <span className="text-nature-dark font-semibold">Total</span>
            <span className="text-nature-olive font-bold text-lg">{formatMMK(order.total_amount)}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/products" className="bg-nature-olive hover:bg-nature-olive-dark text-white font-medium px-8 py-3 rounded-xl transition-colors tracking-[0.1em] text-sm">
            CONTINUE SHOPPING
          </Link>
          <Link to="/" className="border border-nature-border text-nature-dark hover:border-nature-olive px-8 py-3 rounded-xl transition-colors tracking-[0.1em] text-sm">
            GO HOME
          </Link>
        </div>
      </div>
    </div>
  );
}