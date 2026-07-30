import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import api from '../../api';

const panelClass = "bg-white/45 dark:bg-night-card backdrop-blur-xl border border-white/60 dark:border-night-border rounded-lg shadow-[0_4px_24px_-12px_rgba(44,53,39,0.15)] transition-colors duration-300";
const labelClass = "text-[11px] uppercase tracking-[0.25em] text-nature-olive dark:text-nature-sage font-medium";

const formatMMK = (amount) => {
    return new Intl.NumberFormat('en-MM', {
        style: 'currency',
        currency: 'MMK',
        minimumFractionDigits: 0
    }).format(amount);
};

export default function CartPage() {
    const { user } = useAuth();
    const { items, setItems, loading, refreshCart } = useCart();
    const [errors, setErrors] = useState({});
    const [removingId, setRemovingId] = useState(null);
    const [updatingId, setUpdatingId] = useState(null);

    // Clear an item's error message after a short delay
    useEffect(() => {
        const activeErrors = Object.keys(errors).filter(k => errors[k]);
        if (activeErrors.length === 0) return;
        const timers = activeErrors.map(id =>
            setTimeout(() => setErrors(prev => ({ ...prev, [id]: null })), 2500)
        );
        return () => timers.forEach(clearTimeout);
    }, [errors]);

    const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
    const total = items.reduce((acc, item) => acc + (item.product_variant?.sale_price ?? 0) * item.quantity, 0);

    async function updateQuantity(item, newQty) {
        if (newQty < 1 || updatingId === item.id) return;

        const maxStock = item.product_variant?.stock_quantity ?? Infinity;
        if (newQty > maxStock) {
            setErrors(prev => ({ ...prev, [item.id]: `Only ${maxStock} in stock` }));
            return;
        }

        const previousItems = [...items];
        setUpdatingId(item.id);
        
        setItems(prev => prev.map(i => i.id === item.id ? { ...i, quantity: newQty } : i));
        setErrors(prev => ({ ...prev, [item.id]: null }));

        try {
            await api.patch(`/cart/${item.id}`, { quantity: newQty });
            await refreshCart(true);
        } catch (err) {
            setItems(previousItems);
            setErrors(prev => ({ ...prev, [item.id]: err.response?.data?.message || 'Update failed' }));
        } finally {
            setUpdatingId(null);
        }
    }

    async function removeFromCart(id) {
        setRemovingId(id);
        const previousItems = [...items];
        setItems(prev => prev.filter(i => i.id !== id));
        try {
            await api.delete(`/cart/${id}`);
            await refreshCart(true);
        } catch (err) {
            setItems(previousItems);
            console.error('Error removing item from cart:', err);
        } finally {
            setRemovingId(null);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-nature-bg dark:bg-night-bg pt-24 flex items-center justify-center transition-colors duration-300">
                <Loader2 className="w-5 h-5 text-nature-olive dark:text-nature-sage animate-spin" strokeWidth={1.5} />
            </div>
        );
    }

    if (itemCount === 0) {
        return (
            <div className="min-h-screen bg-nature-bg dark:bg-night-bg pt-24 flex flex-col items-center justify-center text-center px-4 transition-colors duration-300">
                <ShoppingBag className="w-10 h-10 text-nature-olive dark:text-nature-sage mb-6" strokeWidth={1} />
                <p className={`${labelClass} mb-3`}>Your Cart</p>
                <h2 className="font-serif text-3xl text-nature-dark dark:text-night-text mb-3">Your cart is empty</h2>
                <p className="text-nature-muted dark:text-night-muted text-sm mb-9 max-w-xs">Discover our fragrance collection.</p>
                <Link
                    to="/products"
                    className="border border-nature-olive dark:border-nature-sage text-nature-olive dark:text-nature-sage hover:bg-nature-olive hover:text-white dark:hover:bg-nature-sage dark:hover:text-night-bg font-medium px-10 py-3.5 transition-colors tracking-[0.2em] text-xs rounded-md"
                >
                    SHOP FRAGRANCES
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-nature-bg dark:bg-night-bg text-nature-dark dark:text-night-text pt-20 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
                <Link to="/products" className="inline-block mb-6 text-nature-muted dark:text-night-muted hover:text-nature-olive dark:hover:text-nature-sage text-xs tracking-[0.15em] uppercase transition-colors">
                    ← Continue Shopping
                </Link>
                <p className={`${labelClass} mb-2`}>Your Selection</p>
                <div className="flex items-baseline justify-between mb-8 pb-5 border-b border-nature-border/70 dark:border-night-border">
                    <h1 className="font-serif text-3xl sm:text-4xl text-nature-dark dark:text-night-text tracking-tight">Shopping Cart</h1>
                    <span className="text-nature-muted dark:text-night-muted text-xs uppercase tracking-[0.15em]">{itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    <div className="xl:col-span-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {items.map(item => {
                                const variant = item.product_variant;
                                if (!variant) return null;
                                const price = variant.sale_price;
                                const isRemoving = removingId === item.id;
                                const isUpdating = updatingId === item.id;
                                const hasError = Boolean(errors[item.id]);

                                return (
                                    <div
                                        key={item.id}
                                        className={`${panelClass} p-4 sm:p-5 flex gap-4 transition-opacity duration-300 ${isRemoving ? 'opacity-40' : 'opacity-100'}`}
                                    >
                                        <div className="w-20 h-20 flex-shrink-0 border border-white/70 dark:border-night-border bg-white/40 dark:bg-night-bg rounded-md overflow-hidden">
                                            <img
                                                src={variant.product?.image_url ?? 'https://images.pexels.com/photos/3018845/pexels-photo-3018845.jpeg?auto=compress&cs=tinysrgb&w=200'}
                                                alt={variant.product?.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0 flex flex-col">
                                            <p className="text-nature-olive dark:text-nature-sage text-[10px] tracking-[0.2em] uppercase font-medium">
                                                {variant.product?.brand?.name ?? variant.product?.brand ?? 'Scentoria'}
                                            </p>
                                            <p className="font-serif text-base text-nature-dark dark:text-night-text leading-tight mt-1 truncate">{variant.product?.name}</p>
                                            <p className="text-nature-muted dark:text-night-muted text-xs uppercase tracking-wide mt-1">{variant.size} size</p>

                                            <div className="flex items-center justify-between mt-auto pt-3">
                                                <div className="flex items-center border border-nature-border/70 dark:border-night-border rounded-md bg-white/40 dark:bg-night-bg">
                                                    <button
                                                        onClick={() => updateQuantity(item, item.quantity - 1)}
                                                        disabled={isUpdating || item.quantity <= 1}
                                                        className="w-7 h-7 text-nature-dark dark:text-night-text text-sm flex items-center justify-center hover:bg-white/50 dark:hover:bg-night-card transition-colors disabled:opacity-40"
                                                        aria-label="Decrease quantity"
                                                    >−</button>
                                                    <span className="w-8 text-center text-sm font-medium text-nature-dark dark:text-night-text">
                                                        {isUpdating ? <Loader2 className="w-3.5 h-3.5 mx-auto animate-spin text-nature-olive dark:text-nature-sage" /> : item.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() => updateQuantity(item, item.quantity + 1)}
                                                        disabled={isUpdating}
                                                        className="w-7 h-7 text-nature-dark dark:text-night-text text-sm flex items-center justify-center hover:bg-white/50 dark:hover:bg-night-card transition-colors disabled:opacity-40"
                                                        aria-label="Increase quantity"
                                                    >+</button>
                                                </div>
                                                <p className="text-nature-olive dark:text-nature-sage font-serif font-semibold text-sm">{formatMMK(price * item.quantity)}</p>
                                            </div>

                                            <div className="flex items-center justify-between mt-2.5">
                                                <button
                                                    onClick={() => removeFromCart(item.id)}
                                                    disabled={isRemoving}
                                                    className="flex items-center gap-1.5 text-nature-muted dark:text-night-muted hover:text-red-500 transition-colors disabled:opacity-50 text-[11px] uppercase tracking-wide"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                                                    Remove
                                                </button>
                                                {hasError && (
                                                    <span className="flex items-center gap-1 text-red-500 dark:text-red-400 text-[11px] font-medium">
                                                        <AlertCircle className="w-3 h-3" />
                                                        {errors[item.id]}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Summary Panel */}
                    <div className={`${panelClass} p-6 h-fit xl:sticky xl:top-24`}>
                        <p className={`${labelClass} mb-5`}>Order Summary</p>
                        <div className="space-y-3 mb-5 max-h-64 overflow-y-auto pr-1">
                            {items.map(item => {
                                const variant = item.product_variant;
                                if (!variant) return null;
                                const price = variant.sale_price;
                                return (
                                    <div key={item.id} className="flex justify-between text-sm">
                                        <span className="text-nature-muted dark:text-night-muted truncate mr-2">{variant.product?.name} ({variant.size}) ×{item.quantity}</span>
                                        <span className="text-nature-dark dark:text-night-text flex-shrink-0">{formatMMK(price * item.quantity)}</span>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="border-t border-nature-border/70 dark:border-night-border pt-4 mb-6">
                            <div className="flex justify-between items-baseline">
                                <span className="text-nature-dark dark:text-night-text font-medium text-xs tracking-[0.15em] uppercase">Total</span>
                                <span className="text-nature-olive dark:text-nature-sage font-serif font-semibold text-2xl">{formatMMK(total)}</span>
                            </div>
                        </div>
                        {user ? (
                            <Link to="/checkout"
                                className="w-full bg-nature-olive dark:bg-nature-sage hover:bg-nature-olive-dark dark:hover:bg-nature-olive text-white dark:text-night-bg font-medium py-3.5 transition-colors tracking-[0.2em] text-xs flex items-center justify-center gap-2 rounded-md shadow-lg">
                                PROCEED TO CHECKOUT <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        ) : (
                            <>
                                <Link to="/login?redirect=%2Fcheckout"
                                    className="w-full bg-nature-olive dark:bg-nature-sage hover:bg-nature-olive-dark dark:hover:bg-nature-olive text-white dark:text-night-bg font-medium py-3.5 transition-colors tracking-[0.2em] text-xs flex items-center justify-center gap-2 rounded-md shadow-lg">
                                    SIGN IN TO CHECKOUT
                                </Link>
                                <p className="text-nature-muted dark:text-night-muted text-xs text-center mt-4 leading-relaxed">
                                    Your cart is saved. Sign in or register to complete your order.
                                </p>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}