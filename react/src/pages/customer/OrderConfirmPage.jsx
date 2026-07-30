import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Package, Copy, Check, XCircle } from 'lucide-react';
import api from '../../api';
import OrderDetail from '../../components/OrderDetail';

const panelClass = "bg-white/45 dark:bg-night-card backdrop-blur-xl border border-white/60 dark:border-night-border rounded-lg shadow-[0_4px_24px_-12px_rgba(44,53,39,0.15)] transition-colors duration-300";
const labelClass = "text-[11px] uppercase tracking-[0.25em] text-nature-olive dark:text-nature-sage font-medium";

const formatDate = (dateStr) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('en-MM', { day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: '2-digit' });
};

export default function OrderConfirmPage() {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [copied, setCopied] = useState(false);

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
            <div className="min-h-screen bg-nature-bg dark:bg-night-bg pt-24 flex items-center justify-center transition-colors duration-300">
                <div className="w-6 h-6 border border-nature-olive dark:border-nature-sage border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!order || error) {
        return (
            <div className="min-h-screen bg-nature-bg dark:bg-night-bg pt-24 flex flex-col items-center justify-center text-center px-4 transition-colors duration-300">
                <Package className="w-10 h-10 text-nature-olive dark:text-nature-sage mb-6" strokeWidth={1} />
                <h2 className="font-serif text-2xl text-nature-dark dark:text-night-text mb-3">Order not found</h2>
                <p className="text-nature-muted dark:text-night-muted text-sm max-w-xs mb-6">We couldn't find that order. It may have been removed, or the link may be incorrect.</p>
                <Link to="/products" className="text-nature-olive dark:text-nature-sage hover:underline text-xs uppercase tracking-[0.15em] transition-colors">← Continue shopping</Link>
            </div>
        );
    }

    const isCancelled = order.status === 'cancelled';
    const placedAt = formatDate(order.created_at);

    return (
        <div className="min-h-screen bg-nature-bg dark:bg-night-bg text-nature-dark dark:text-night-text pt-20 transition-colors duration-300">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 lg:py-14 animate-[fadeUp_0.5s_ease-out]">

                <div className="text-center mb-8">
                    <div className={`w-14 h-14 rounded-full border flex items-center justify-center mx-auto mb-5 ${isCancelled ? 'border-red-300 dark:border-red-900 bg-red-50/60 dark:bg-red-950/40' : 'border-nature-olive dark:border-nature-sage bg-white/40 dark:bg-night-card'} backdrop-blur-md`}>
                        {isCancelled
                            ? <XCircle className="w-6 h-6 text-red-500 dark:text-red-400" strokeWidth={1.25} />
                            : <CheckCircle2 className="w-6 h-6 text-nature-olive dark:text-nature-sage" strokeWidth={1.25} />}
                    </div>
                    <p className={`${labelClass} mb-2`}>
                        {isCancelled ? 'Order Cancelled' : 'Order Confirmed'}
                    </p>
                    <h1 className="font-serif text-3xl sm:text-4xl text-nature-dark dark:text-night-text mb-2 tracking-tight">
                        {isCancelled ? 'This order was cancelled' : 'Thank you'}
                    </h1>
                    <p className="text-nature-muted dark:text-night-muted text-sm max-w-sm mx-auto">
                        {isCancelled
                            ? 'If you were charged from your wallet, the balance has been refunded.'
                            : 'Your fragrance order has been received and saved to your account.'}
                    </p>
                </div>

                <div className={`${panelClass} p-6 sm:p-7 mb-6`}>
                    <div className="flex items-start justify-between mb-6 gap-3 pb-6 border-b border-nature-border/70 dark:border-night-border">
                        <div>
                            <button
                                onClick={copyOrderId}
                                className="flex items-center gap-1.5 text-nature-olive dark:text-nature-sage text-[11px] tracking-[0.2em] uppercase group"
                                title="Copy order number"
                            >
                                Order #{order.id}
                                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity" />}
                            </button>
                            {placedAt && <p className="text-nature-muted dark:text-night-muted text-xs mt-2">Placed {placedAt}</p>}
                        </div>
                    </div>

                    <OrderDetail order={order} />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link to="/products" className="bg-nature-olive dark:bg-nature-sage hover:bg-nature-olive-dark dark:hover:bg-nature-olive text-white dark:text-night-bg font-medium px-10 py-3.5 transition-colors tracking-[0.2em] text-xs text-center rounded-md shadow-lg">
                        CONTINUE SHOPPING
                    </Link>
                    <Link to="/" className="border border-nature-dark dark:border-night-border text-nature-dark dark:text-night-text hover:bg-nature-dark hover:text-white dark:hover:bg-night-card px-10 py-3.5 transition-colors tracking-[0.2em] text-xs text-center rounded-md">
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