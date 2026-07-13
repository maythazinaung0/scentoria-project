import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Package, MapPin, Wallet, Banknote, Copy, Check, Clock, Truck, XCircle } from 'lucide-react';
import api from '../../api';

const formatMMK = (amount) =>
  new Intl.NumberFormat('en-MM', { style: 'currency', currency: 'MMK', minimumFractionDigits: 0 }).format(Number(amount) || 0);

const formatDate = (dateStr) => {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('en-MM', { day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: '2-digit' });
};

// Order lifecycle, in order — used to derive how far along the stepper should be filled.
const STEPS = [
  { key: 'pending',    label: 'Order Placed', icon: Package },
  { key: 'processing', label: 'Processing',   icon: Clock },
  { key: 'completed',  label: 'Delivered',    icon: Truck },
];

export default function OrderConfirmPage() {
  const { id } = useParams();
   const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [imgErrors, setImgErrors] = useState({});

  useEffect(() => {
    if (!id) return;

    api.get(`/orders/${id}`)
      .then(({ data }) => setOrder(data))
      .catch((err) => {
        console.error('Error fetching order:', err.response ?? err);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, [id]);

  function copyOrderId() {
    navigator.clipboard.writeText(String(order.id)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-nature-bg pt-24 flex items-center justify-center">
        <div className="w-6 h-6 border border-nature-olive border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order || error) {
    return (
      <div className="min-h-screen bg-nature-bg pt-24 flex flex-col items-center justify-center text-center px-4">
        <Package className="w-10 h-10 text-nature-sand mb-6" strokeWidth={1} />
        <h2 className="font-serif text-2xl text-nature-dark mb-3">Order not found</h2>
        <p className="text-nature-muted text-sm max-w-xs mb-6">We couldn't find that order. It may have been removed, or the link may be incorrect.</p>
        <Link to="/products" className="text-nature-olive hover:text-nature-olive-dark text-xs uppercase tracking-[0.15em] transition-colors">← Continue shopping</Link>
      </div>
    );
  }

  const items = order.items ?? [];
  const isCancelled = order.status === 'cancelled';
  const currentStepIndex = STEPS.findIndex(s => s.key === order.status);
  const placedAt = formatDate(order.created_at);

  return (
    <div className="min-h-screen bg-nature-bg text-nature-dark pt-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 lg:py-14 animate-[fadeUp_0.5s_ease-out]">

        <div className="text-center mb-8">
          <div className={`w-14 h-14 rounded-full border flex items-center justify-center mx-auto mb-5 ${isCancelled ? 'border-red-300 bg-red-50/60' : 'border-nature-olive bg-white/40'} backdrop-blur-md`}>
            {isCancelled
              ? <XCircle className="w-6 h-6 text-red-500" strokeWidth={1.25} />
              : <CheckCircle2 className="w-6 h-6 text-nature-olive" strokeWidth={1.25} />}
          </div>
          <p className="text-[11px] uppercase tracking-[0.35em] text-nature-olive font-medium mb-2">
            {isCancelled ? 'Order Cancelled' : 'Order Confirmed'}
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl text-nature-dark mb-2 tracking-tight">
            {isCancelled ? 'This order was cancelled' : 'Thank you'}
          </h1>
          <p className="text-nature-muted text-sm max-w-sm mx-auto">
            {isCancelled
              ? 'If you were charged from your wallet, the balance has been refunded.'
              : 'Your fragrance order has been received and saved to your account.'}
          </p>
        </div>

        <div className="bg-white/45 backdrop-blur-xl border border-white/60 rounded-lg p-6 sm:p-7 mb-6 shadow-[0_4px_24px_-12px_rgba(44,53,39,0.15)]">

          <div className="flex items-start justify-between mb-6 gap-3 pb-6 border-b border-nature-border/70">
            <div>
              <button
                onClick={copyOrderId}
                className="flex items-center gap-1.5 text-nature-olive text-[11px] tracking-[0.2em] uppercase group"
                title="Copy order number"
              >
                Order #{order.id}
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity" />}
              </button>
              {placedAt && <p className="text-nature-muted text-xs mt-2">Placed {placedAt}</p>}
            </div>
          </div>

          {/* Status progress */}
          {!isCancelled ? (
            <div className="flex items-center mb-7 px-1">
              {STEPS.map((step, i) => {
                const isDone = i <= currentStepIndex;
                const isLast = i === STEPS.length - 1;
                return (
                  <div key={step.key} className={`flex items-center ${isLast ? '' : 'flex-1'}`}>
                    <div className="flex flex-col items-center gap-2">
                      <div className={`w-3 h-3 rounded-full border transition-colors ${
                        isDone ? 'bg-nature-olive border-nature-olive' : 'border-nature-border bg-white/50'
                      }`} />
                      <span className={`text-[10px] tracking-[0.1em] uppercase text-center whitespace-nowrap ${isDone ? 'text-nature-olive font-medium' : 'text-nature-muted'}`}>
                        {step.label}
                      </span>
                    </div>
                    {!isLast && (
                      <div className={`flex-1 h-px mx-2 -mt-5 transition-colors ${i < currentStepIndex ? 'bg-nature-olive' : 'bg-nature-border/70'}`} />
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="mb-7 px-4 py-3 border border-red-200 bg-red-50/70 backdrop-blur-sm text-red-600 text-xs rounded-md">
              This order will not be processed further.
            </div>
          )}

          {/* Items — scrolls instead of pushing the page tall on large orders */}
          {items.length > 0 && (
  <div className="divide-y divide-nature-border/60 mb-6 max-h-72 overflow-y-auto pr-1">
    {items.map(item => {
      const imageUrl = item.variant?.product?.image_url;
      const showImage = imageUrl && !imgErrors[item.id];

      return (
        <div key={item.id} className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0">
          {/* Image / Fallback Container */}
          <div className="w-12 h-12 flex-shrink-0 border border-white/70 bg-white/40 rounded-md overflow-hidden flex items-center justify-center">
            {showImage ? (
              <img
                src={imageUrl}
                alt={item.variant?.product?.name ?? ''}
                onError={() => setImgErrors(prev => ({ ...prev, [item.id]: true }))}
                className="w-full h-full object-cover"
              />
            ) : (
              <Package className="w-5 h-5 text-nature-sand" strokeWidth={1} />
            )}
          </div>

          {/* Item Details */}
          <div className="flex-1 min-w-0">
            <p className="text-nature-dark text-sm font-medium truncate">
              {item.variant?.product?.name ?? 'Fragrance Product'}
            </p>
            <p className="text-nature-muted text-xs uppercase tracking-wide mt-0.5">
              {item.variant?.size ?? 'Variant'} × {item.quantity}
            </p>
          </div>

          {/* Item Price */}
          <span className="text-nature-dark text-sm flex-shrink-0">
            {formatMMK(item.price * item.quantity)}
          </span>
        </div>
      );
    })}
  </div>
)}
          <div className="border-t border-nature-border/70 pt-5 space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-nature-olive mt-0.5 flex-shrink-0" strokeWidth={1.5} />
              <div className="flex-1">
                <p className="text-nature-muted text-[10px] uppercase tracking-[0.15em] mb-1">Delivering to</p>
                <p className="text-nature-dark text-sm">{order.address}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              {order.payment_method === 'virtual_currency'
                ? <Wallet className="w-4 h-4 text-nature-olive mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                : <Banknote className="w-4 h-4 text-nature-olive mt-0.5 flex-shrink-0" strokeWidth={1.5} />}
              <div className="flex-1">
                <p className="text-nature-muted text-[10px] uppercase tracking-[0.15em] mb-1">Payment method</p>
                <p className="text-nature-dark text-sm">
                  {order.payment_method === 'virtual_currency' ? 'Scentoria Virtual Wallet' : 'Cash on Delivery'}
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-nature-border/70 pt-5 mt-5 flex justify-between items-baseline">
            <span className="text-nature-dark font-medium text-xs tracking-[0.15em] uppercase">Total</span>
            <span className="text-nature-olive font-serif font-semibold text-2xl">{formatMMK(order.total_amount)}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/products" className="bg-nature-olive hover:bg-nature-olive-dark text-white font-medium px-10 py-3.5 transition-colors tracking-[0.2em] text-xs text-center rounded-md">
            CONTINUE SHOPPING
          </Link>
          <Link to="/" className="border border-nature-dark text-nature-dark hover:bg-nature-dark hover:text-white px-10 py-3.5 transition-colors tracking-[0.2em] text-xs text-center rounded-md">
            GO HOME
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}