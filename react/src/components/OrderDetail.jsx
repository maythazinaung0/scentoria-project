import { MapPin, Wallet, Banknote, Package, Clock, Truck, XCircle } from 'lucide-react';
import { useState } from 'react';

const formatMMK = (amount) =>
    new Intl.NumberFormat('en-MM', { style: 'currency', currency: 'MMK', minimumFractionDigits: 0 }).format(Number(amount) || 0);

const STEPS = [
    { key: 'pending', label: 'Order Placed', icon: Package },
    { key: 'processing', label: 'Processing', icon: Clock },
    { key: 'completed', label: 'Delivered', icon: Truck },
];


export default function OrderDetail({ order, showCancelButton = false, onCancelRequest }) {
    const [imgErrors, setImgErrors] = useState({});

    const items = order.items ?? [];
    const isCancelled = order.status === 'cancelled';
    const currentStepIndex = STEPS.findIndex(s => s.key === order.status);

    return (
        <div>
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

            {items.length > 0 && (
                <div className="divide-y divide-nature-border/60 mb-6 max-h-72 overflow-y-auto pr-1">
                    {items.map(item => {
                        const imageUrl = item.variant?.product?.image_url;
                        const showImage = imageUrl && !imgErrors[item.id];

                        return (
                            <div key={item.id} className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0">
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
                                <div className="flex-1 min-w-0">
                                    <p className="text-nature-dark text-sm font-medium truncate">
                                        {item.variant?.product?.name ?? item.product_name ?? 'Fragrance Product'}
                                    </p>
                                    <p className="text-nature-muted text-xs uppercase tracking-wide mt-0.5">
                                        {item.variant?.size ?? item.variant_size ?? 'Variant'} × {item.quantity}
                                    </p>
                                </div>
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

            {showCancelButton && ['pending', 'processing'].includes(order.status) && (
                <div className="pt-4 mt-4 border-t border-nature-border/60">
                    <button
                        type="button"
                        onClick={onCancelRequest}
                        className="w-full flex items-center justify-center gap-1.5 text-red-600 border border-red-200 hover:bg-red-600 hover:text-white hover:border-red-600 px-4 py-2.5 rounded-md text-xs font-medium tracking-wide uppercase transition-colors"
                    >
                        <XCircle className="w-3.5 h-3.5" /> Cancel Order
                    </button>
                </div>
            )}
        </div>
    );
}