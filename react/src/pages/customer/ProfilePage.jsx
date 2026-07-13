import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    UserCircle, ShoppingBag, ChevronDown,
    Clock, CheckCircle, XCircle, Package, ArrowRight, Hourglass,
    Wallet, Plus, Send, Star, MessageSquare, Lock, Bookmark, MapPin, Phone,
    Trash2, Pencil, X, Copy, Check
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api';
import FieldError from '../../components/FieldError';
import { getFieldErrors, getErrorMessage } from '../../utils/formErrors';

const formatMMK = (amount) =>
    new Intl.NumberFormat('en-MM', { style: 'currency', currency: 'MMK', minimumFractionDigits: 0 }).format(amount ?? 0);

const STATUS_STYLES = {
    pending: 'bg-nature-sage/30 text-nature-olive',
    processing: 'bg-nature-blue/30 text-nature-blue',
    completed: 'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-red-100 text-red-700',
};



const STATUS_ICONS = {
    pending: Clock,
    processing: Hourglass,
    completed: CheckCircle,
    cancelled: XCircle,
};

const TOPUP_STATUS_STYLES = {
    pending: 'bg-nature-sage/30 text-nature-olive',
    completed: 'bg-emerald-100 text-emerald-700',
    failed: 'bg-red-100 text-red-700',
    rejected: 'bg-red-100 text-red-700',
};

const PAYMENT_METHOD_LABELS = {
    kbzpay: 'KBZ Pay',
    cbpay: 'CB Pay',
};

// Shared visual language, matching CheckoutPage
const panelClass = "bg-white/45 backdrop-blur-xl border border-white/60 rounded-lg shadow-[0_4px_24px_-12px_rgba(44,53,39,0.15)]";
const modalPanelClass = "bg-white border border-nature-border/50 rounded-lg shadow-[0_20px_60px_-15px_rgba(44,53,39,0.35)]";
const inputClass = "w-full bg-transparent border-b border-nature-border/80 focus:border-nature-olive rounded-none px-0 py-1.5 text-nature-dark text-sm outline-none transition-colors placeholder:text-nature-muted/60";
const labelClass = "block text-nature-muted text-[10px] tracking-[0.2em] uppercase mb-1";

function CopyableField({ label, value }) {
    const [copied, setCopied] = useState(false);

    async function handleCopy() {
        try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch {
            // Clipboard API can fail in insecure contexts — fail silently,
            // the value is still visible for manual copy.
        }
    }

    return (
        <div className="flex items-center justify-between gap-2 bg-white/70 border border-nature-border/50 rounded-md px-3 py-2">
            <div className="min-w-0">
                <p className="text-nature-muted text-[10px] tracking-[0.15em] uppercase">{label}</p>
                <p className="text-nature-dark text-sm font-medium truncate">{value}</p>
            </div>
            <button type="button" onClick={handleCopy} className="flex-shrink-0 text-nature-olive hover:text-nature-olive-dark transition-colors">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" strokeWidth={1.5} />}
            </button>
        </div>
    );
}

export default function ProfilePage() {
    const { user, isAdmin, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('wallet');

    const [orders, setOrders] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [wishlists, setWishlists] = useState([]);
    const [walletBalance, setWalletBalance] = useState(0);
    const [topupRequests, setTopupRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    const [selectedOrder, setSelectedOrder] = useState(null);
    const [visibleCount, setVisibleCount] = useState(5);

    // Admin's KBZ Pay / CB Pay receiving details, fetched once so the
    // top-up form can show the right QR code + account info per channel.
    const [paymentMethods, setPaymentMethods] = useState(null);

    const [topupAmount, setTopupAmount] = useState('');
    const [topupMethod, setTopupMethod] = useState('kbzpay');
    const [senderName, setSenderName] = useState('');
    const [transactionRef, setTransactionRef] = useState('');
    const [topupLoading, setTopupLoading] = useState(false);
    const [topupError, setTopupError] = useState('');
    const [topupSuccess, setTopupSuccess] = useState(false);
    const [showTopupForm, setShowTopupForm] = useState(false);
    const [topupImage, setTopupImage] = useState(null);

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);
 const [passwordErrors, setPasswordErrors] = useState({}); // { field: [messages] }
    const [passwordFormError, setPasswordFormError] = useState('');    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [showPasswordForm, setShowPasswordForm] = useState(false);
const passwordChecks = [
        { label: 'At least 8 characters', pass: newPassword.length >= 8 },
        { label: 'One uppercase & one lowercase letter', pass: /[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword) },
        { label: 'At least one number', pass: /\d/.test(newPassword) },
        { label: 'At least one symbol', pass: /[^A-Za-z0-9]/.test(newPassword) },
    ];
    // Review editing
    const [editingReviewId, setEditingReviewId] = useState(null);
    const [editRating, setEditRating] = useState(0);
    const [editComment, setEditComment] = useState('');
    const [editSaving, setEditSaving] = useState(false);
    const [editError, setEditError] = useState('');

    const [confirmModal, setConfirmModal] = useState(null); // { title, message, confirmLabel, onConfirm }
    const [confirmLoading, setConfirmLoading] = useState(false);

    function openConfirm({ title, message, confirmLabel = 'Confirm', onConfirm }) {
        setConfirmModal({ title, message, confirmLabel, onConfirm });
    }

    async function handleConfirm() {
        if (!confirmModal) return;
        setConfirmLoading(true);
        try {
            await confirmModal.onConfirm();
            setConfirmModal(null);
        } catch (err) {
            alert(err.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setConfirmLoading(false);
        }
    }

    useEffect(() => {
        if (authLoading) return;
        if (!user) { navigate('/login'); return; }
        if (isAdmin) { navigate('/admin'); return; }
        loadData();
    }, [user, isAdmin, authLoading]);

    async function loadData() {
        setLoading(true);
        const [profileRes, ordersRes, topupsRes, reviewsRes, wishlistsRes, paymentMethodsRes] = await Promise.allSettled([
            api.get('/user/profile'),
            api.get('/orders'),
            api.get('/wallet-topups'),
            api.get('/reviews'),
            api.get('/wishlists'),
            api.get('/payment-methods'),
        ]);

        if (profileRes.status === 'fulfilled') setWalletBalance(profileRes.value.data?.wallet_balance ?? 0);
        else console.error('Failed to load profile:', profileRes.reason);

        if (ordersRes.status === 'fulfilled') setOrders(ordersRes.value.data ?? []);
        else console.error('Failed to load orders:', ordersRes.reason);

        if (topupsRes.status === 'fulfilled') setTopupRequests(topupsRes.value.data ?? []);
        else console.error('Failed to load top-ups:', topupsRes.reason);

        if (reviewsRes.status === 'fulfilled') setReviews(reviewsRes.value.data ?? []);
        else console.error('Failed to load reviews:', reviewsRes.reason);

        if (wishlistsRes.status === 'fulfilled') setWishlists(wishlistsRes.value.data ?? []);
        else console.error('Failed to load wishlist:', wishlistsRes.reason);

        if (paymentMethodsRes.status === 'fulfilled') setPaymentMethods(paymentMethodsRes.value.data ?? null);
        else console.error('Failed to load payment methods:', paymentMethodsRes.reason);

        setLoading(false);
    }

    async function submitTopup(e) {
        e.preventDefault();
        const amount = parseInt(topupAmount.replace(/,/g, ''), 10);
        if (!amount || amount < 1000) { setTopupError('Minimum top-up amount is 1,000 MMK.'); return; }
        if (amount > 10000000) { setTopupError('Maximum top-up request is 10,000,000 MMK.'); return; }
        if (!senderName.trim()) { setTopupError('Please enter the sender name shown in your payment app.'); return; }
        if (!transactionRef.trim()) { setTopupError('Please enter the transaction reference number.'); return; }
        if (!topupImage) { setTopupError('Please attach your transaction screenshot.'); return; }

        setTopupLoading(true);
        setTopupError('');

        try {
            const formData = new FormData();
            formData.append('deposit_amount', amount);
            formData.append('topup_channel', topupMethod);
            formData.append('sender_name', senderName.trim());
            formData.append('transaction_reference', transactionRef.trim());
            formData.append('transaction_image', topupImage);

            await api.post('/wallet-topups', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            setTopupAmount('');
            setTopupMethod('kbzpay');
            setSenderName('');
            setTransactionRef('');
            setTopupImage(null);
            setTopupSuccess(true);
            setShowTopupForm(false);
            setTimeout(() => setTopupSuccess(false), 4000);
            loadData();
        } catch (err) {
            setTopupError(err.response?.data?.message || 'Failed to submit request. Please try again.');
        } finally {
            setTopupLoading(false);
        }
    }

   async function handleChangePassword(e) {
        e.preventDefault();
        setPasswordErrors({});
        setPasswordFormError('');
        setPasswordSuccess('');

        setPasswordLoading(true);
        try {
            await api.post('/user/change-password', {
                current_password: currentPassword,
                new_password: newPassword,
                new_password_confirmation: confirmPassword,
            });

            setPasswordSuccess('Password updated successfully!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setShowPasswordForm(false);
        } catch (err) {
            setPasswordErrors(getFieldErrors(err));
            setPasswordFormError(getErrorMessage(err));
        } finally {
            setPasswordLoading(false);
        }
    }
    // --- Orders ---
    async function handleCancelOrder(orderId) {
        await api.put(`/orders/${orderId}/cancel`);
        await loadData();
        setSelectedOrder(null);
    }

    function confirmCancelOrder(order) {
        openConfirm({
            title: 'Cancel this order?',
            message: 'If this order was paid using your virtual wallet, the amount will be refunded automatically.',
            confirmLabel: 'Yes, Cancel',
            onConfirm: () => handleCancelOrder(order.id),
        });
    }

    // --- Wishlist ---
    async function handleRemoveWishlist(wishlistId) {
        await api.delete(`/wishlists/${wishlistId}`);
        setWishlists(prev => prev.filter(w => w.id !== wishlistId));
    }

    function confirmRemoveWishlist(item) {
        openConfirm({
            title: 'Remove from wishlist?',
            message: `"${item.product_name}" will be removed from your wishlist.`,
            confirmLabel: 'Remove',
            onConfirm: () => handleRemoveWishlist(item.id),
        });
    }

    // --- Reviews ---
    function startEditReview(review) {
        setEditingReviewId(review.id);
        setEditRating(review.rating);
        setEditComment(review.comment || '');
        setEditError('');
    }

    function cancelEditReview() {
        setEditingReviewId(null);
        setEditError('');
    }

    async function handleSaveReview(reviewId) {
        if (!editRating) { setEditError('Please select a star rating.'); return; }
        setEditSaving(true);
        setEditError('');
        try {
            await api.put(`/reviews/${reviewId}`, { rating: editRating, comment: editComment });
            setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, rating: editRating, comment: editComment } : r));
            setEditingReviewId(null);
        } catch (err) {
            setEditError(err.response?.data?.message || 'Could not update review.');
        } finally {
            setEditSaving(false);
        }
    }

    async function handleDeleteReview(reviewId) {
        await api.delete(`/reviews/${reviewId}`);
        setReviews(prev => prev.filter(r => r.id !== reviewId));
    }

    function confirmDeleteReview(review) {
        openConfirm({
            title: 'Delete this review?',
            message: `Your review for "${review.product_name || 'this product'}" will be permanently deleted.`,
            confirmLabel: 'Delete',
            onConfirm: () => handleDeleteReview(review.id),
        });
    }

    const displayName = user?.name || user?.email?.split('@')[0] || 'Customer';
    const pendingTopup = topupRequests.filter(r => r.status === 'pending').reduce((s, r) => s + r.deposit_amount, 0);
    const selectedPaymentInfo = paymentMethods?.[topupMethod];

    const sidebarItems = [
        { id: 'wallet', label: 'Wallet & Top Up', icon: Wallet },
        { id: 'orders', label: 'Order History', icon: ShoppingBag, count: orders.length },
        { id: 'wishlist', label: 'My Wishlist', icon: Bookmark, count: wishlists.length },
        { id: 'reviews', label: 'My Reviews', icon: MessageSquare, count: reviews.length },
        { id: 'security', label: 'Security Settings', icon: Lock },
    ];

    if (loading || authLoading) {
        return (
            <div className="min-h-screen bg-nature-bg flex items-center justify-center">
                <div className="w-6 h-6 border border-nature-olive border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-nature-bg text-nature-dark pt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">

                <p className="text-[11px] uppercase tracking-[0.35em] text-nature-olive font-medium mb-2">Your Account</p>
                <div className="flex items-baseline justify-between mb-8 pb-5 border-b border-nature-border/70">
                    <div>
                        <h1 className="font-serif text-3xl sm:text-4xl text-nature-dark tracking-tight">Welcome back, {displayName}</h1>
                        <p className="text-nature-muted text-sm mt-1">{user?.email}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">

                    {/* SIDEBAR NAVIGATION */}
                    <aside className={`${panelClass} p-4 space-y-1 h-fit xl:sticky xl:top-24`}>
                        <p className="text-nature-muted text-[10px] tracking-[0.2em] uppercase mb-2 px-3">Account Menu</p>
                        {sidebarItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeTab === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium transition-colors ${isActive
                                            ? 'bg-nature-olive text-white'
                                            : 'text-nature-muted hover:bg-nature-sage/20 hover:text-nature-dark'
                                        }`}
                                >
                                    <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-nature-olive'}`} strokeWidth={1.5} />
                                    <span className="truncate">{item.label}</span>
                                    {item.count !== undefined && item.count > 0 && (
                                        <span className={`ml-auto text-[11px] px-2 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-nature-sage/30 text-nature-olive'}`}>
                                            {item.count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </aside>

                    {/* DYNAMIC CONTENT AREA */}
                    <main className="xl:col-span-3 min-h-[400px] space-y-6">

                        {/* --- WALLET & TOP UP --- */}
                        {activeTab === 'wallet' && (
                            <div className={`${panelClass} p-6`}>
                                <h3 className="text-nature-olive text-[11px] tracking-[0.25em] uppercase font-medium mb-5">Virtual Wallet</h3>

                                <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-nature-border/60 mb-6">
                                    <div>
                                        <p className={labelClass}>Available Balance</p>
                                        <p className="font-serif text-4xl text-nature-olive mt-1">{formatMMK(walletBalance)}</p>
                                        {pendingTopup > 0 && (
                                            <p className="text-nature-tan text-xs mt-2 flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> +{formatMMK(pendingTopup)} pending approval
                                            </p>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => { setShowTopupForm(v => !v); setTopupError(''); }}
                                        className="flex items-center gap-2 bg-nature-olive hover:bg-nature-olive-dark text-white font-medium px-5 py-2.5 rounded-md text-xs tracking-wider uppercase transition-colors"
                                    >
                                        <Plus className="w-3.5 h-3.5" /> Request Top Up
                                    </button>
                                </div>

                                {showTopupForm && (
                                    <div className="pb-6 mb-6 border-b border-nature-border/60 space-y-5">

                                        {/* Step 1: choose channel + show where to actually send money */}
                                        <div>
                                            <label className={labelClass}>1. Send Money Via</label>
                                            <div className="flex gap-2 mt-1.5 mb-4">
                                                {[{ value: 'kbzpay', label: 'KBZ Pay' }, { value: 'cbpay', label: 'CB Pay' }].map(m => (
                                                    <button
                                                        key={m.value} type="button" onClick={() => setTopupMethod(m.value)}
                                                        className={`px-3 py-1.5 rounded border text-xs tracking-wide transition-colors ${topupMethod === m.value
                                                                ? 'bg-nature-olive border-nature-olive text-white'
                                                                : 'border-nature-border text-nature-muted hover:border-nature-olive'
                                                            }`}
                                                    >
                                                        {m.label}
                                                    </button>
                                                ))}
                                            </div>

                                            {selectedPaymentInfo ? (
                                                <div className="bg-nature-bg/60 border border-nature-border/50 rounded-md p-4 flex flex-col sm:flex-row gap-4">
                                                    {selectedPaymentInfo.qr_code_url && (
                                                        <img
                                                            src={selectedPaymentInfo.qr_code_url}
                                                            alt={`${PAYMENT_METHOD_LABELS[topupMethod]} QR code`}
                                                            className="w-32 h-32 object-contain bg-white rounded-md border border-nature-border/40 flex-shrink-0 mx-auto sm:mx-0"
                                                        />
                                                    )}
                                                    <div className="flex-1 space-y-2">
                                                        <CopyableField label="Account Name" value={selectedPaymentInfo.account_name} />
                                                        <CopyableField label="Account Number" value={selectedPaymentInfo.account_number} />
                                                        <p className="text-nature-muted text-[11px]">Scan the QR code or send manually to this account, then fill in the details below.</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-nature-muted text-xs bg-nature-bg/60 border border-nature-border/50 rounded-md p-3">
                                                    Payment details are unavailable right now — please refresh the page.
                                                </p>
                                            )}
                                        </div>

                                        {/* Step 2: the actual submission form */}
                                        <form onSubmit={submitTopup} className="space-y-4">
                                            <label className={labelClass}>2. Confirm Your Payment</label>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
                                                <div>
                                                    <label className={labelClass}>Amount Sent (MMK) *</label>
                                                    <input
                                                        required type="number" min={1000} step={1000}
                                                        value={topupAmount} onChange={e => setTopupAmount(e.target.value)}
                                                        placeholder="e.g. 50000" className={inputClass}
                                                    />
                                                </div>
                                                <div>
                                                    <label className={labelClass}>Sender Name *</label>
                                                    <input
                                                        required type="text"
                                                        value={senderName} onChange={e => setSenderName(e.target.value)}
                                                        placeholder="Name shown in your payment app" className={inputClass}
                                                    />
                                                </div>
                                                <div className="sm:col-span-2">
                                                    <label className={labelClass}>Transaction Reference No. *</label>
                                                    <input
                                                        required type="text"
                                                        value={transactionRef} onChange={e => setTransactionRef(e.target.value)}
                                                        placeholder="e.g. 20260711098765" className={inputClass}
                                                    />
                                                    <p className="text-nature-muted text-[11px] mt-1">Found on your payment confirmation screen after sending money.</p>
                                                </div>
                                                <div className="sm:col-span-2">
                                                    <label className={labelClass}>Transaction Screenshot *</label>
                                                    <input
                                                        required type="file" accept="image/*"
                                                        onChange={e => setTopupImage(e.target.files[0])}
                                                        className="w-full text-nature-dark text-sm mt-1.5 file:mr-4 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-nature-sage/30 file:text-nature-olive hover:file:bg-nature-sage/50"
                                                    />
                                                </div>
                                            </div>
                                            {topupError && <p className="text-red-600 text-sm bg-red-50/80 border border-red-200 px-4 py-3 rounded-md">{topupError}</p>}
                                            <div className="flex items-center gap-4">
                                                <button type="submit" disabled={topupLoading}
                                                    className="flex items-center gap-2 bg-nature-olive hover:bg-nature-olive-dark disabled:opacity-50 text-white font-medium px-5 py-2.5 rounded-md text-xs tracking-wider uppercase transition-colors">
                                                    <Send className="w-3.5 h-3.5" /> {topupLoading ? 'Sending...' : 'Submit for Review'}
                                                </button>
                                                <button type="button" onClick={() => setShowTopupForm(false)} className="text-nature-muted hover:text-nature-dark text-xs uppercase tracking-wide transition-colors">Cancel</button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                {topupSuccess && (
                                    <div className="mb-6 bg-nature-sage/20 border border-nature-sage/40 rounded-md px-4 py-3 flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-nature-olive flex-shrink-0" strokeWidth={1.5} />
                                        <p className="text-nature-olive text-sm">Top-up request sent! Admin will review it shortly.</p>
                                    </div>
                                )}

                                {topupRequests.length > 0 ? (
                                    <div className="space-y-2">
                                        <p className={labelClass}>Top-Up History</p>
                                        {topupRequests.map(req => {
                                            const statusStyle = TOPUP_STATUS_STYLES[req.status] ?? 'bg-nature-sand/30 text-nature-muted';
                                            return (
                                                <div key={req.id} className="flex items-center justify-between border-b border-nature-border/40 py-3 last:border-0">
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-nature-dark text-sm font-medium">+{formatMMK(req.deposit_amount)}</p>
                                                            <span className="text-nature-muted text-[11px] bg-nature-sage/20 px-1.5 py-0.5 rounded">
                                                                {PAYMENT_METHOD_LABELS[req.topup_channel] ?? req.topup_channel}
                                                            </span>
                                                        </div>
                                                        <p className="text-nature-muted text-xs mt-0.5">{new Date(req.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                                        {req.transaction_reference && (
                                                            <p className="text-nature-subtle text-[11px] font-mono mt-0.5">Ref: {req.transaction_reference}</p>
                                                        )}
                                                    </div>
                                                    <span className={`text-xs px-2.5 py-1 rounded-full capitalize ${statusStyle}`}>{req.status}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-nature-muted text-sm text-center py-6">No top-up request history found.</p>
                                )}
                            </div>
                        )}

                        {/* --- ORDER HISTORY --- */}
                        {activeTab === 'orders' && (
                            <div className={`${panelClass} p-6`}>
                                <h3 className="text-nature-olive text-[11px] tracking-[0.25em] uppercase font-medium mb-5">Order History</h3>

                                {orders.length === 0 ? (
                                    <div className="text-center py-16">
                                        <Package className="w-10 h-10 text-nature-sand mx-auto mb-4" strokeWidth={1} />
                                        <p className="text-nature-muted text-sm mb-5">You haven't placed any orders yet.</p>
                                        <Link to="/products" className="inline-flex items-center bg-nature-olive hover:bg-nature-olive-dark text-white px-6 py-2.5 rounded-md text-xs tracking-wider uppercase transition-colors">Browse Fragrances</Link>
                                    </div>
                                ) : (
                                    <>
                                        <div className="divide-y divide-nature-border/60">
                                            {orders.slice(0, visibleCount).map(order => {
                                                const StatusIcon = STATUS_ICONS[order.status] ?? Clock;
                                                return (
                                                    <button
                                                        key={order.id}
                                                        onClick={() => setSelectedOrder(order)}
                                                        className="w-full flex items-center justify-between py-4 text-left hover:bg-nature-bg/40 transition-colors -mx-2 px-2 rounded-md"
                                                    >
                                                        <div>
                                                            <p className="text-nature-dark text-sm font-medium">
                                                                Order #<span className="font-mono text-nature-muted text-xs">{order.id}</span>
                                                            </p>
                                                            <p className="text-nature-muted text-xs mt-0.5">
                                                                {new Date(order.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-nature-olive font-semibold text-sm">{formatMMK(order.total_amount)}</span>
                                                            <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full ${STATUS_STYLES[order.status]}`}>
                                                                <StatusIcon className="w-3 h-3" />
                                                                <span className="capitalize hidden sm:inline">{order.status}</span>
                                                            </span>
                                                            <ChevronDown className="w-4 h-4 text-nature-muted -rotate-90" />
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {visibleCount < orders.length && (
                                            <div className="pt-5 text-center">
                                                <button
                                                    onClick={() => setVisibleCount(c => c + 5)}
                                                    className="text-nature-olive hover:text-nature-olive-dark text-xs font-medium tracking-wider uppercase transition-colors"
                                                >
                                                    Load More Orders ({orders.length - visibleCount} remaining)
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}

                        {/* --- WISHLIST --- */}
                        {activeTab === 'wishlist' && (
                            <div className={`${panelClass} p-6`}>
                                <h3 className="text-nature-olive text-[11px] tracking-[0.25em] uppercase font-medium mb-5">Your Wishlist</h3>

                                {wishlists.length === 0 ? (
                                    <div className="text-center py-16">
                                        <Bookmark className="w-10 h-10 text-nature-sand mx-auto mb-4" strokeWidth={1} />
                                        <p className="text-nature-muted text-sm mb-5">Your wishlist is currently empty.</p>
                                        <Link to="/products" className="inline-flex items-center bg-nature-olive hover:bg-nature-olive-dark text-white px-6 py-2.5 rounded-md text-xs tracking-wider uppercase transition-colors">Discover Favorites</Link>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {wishlists.map(item => (
                                            <div key={item.id} className="relative flex items-center gap-4 border border-nature-border/60 rounded-md p-4 hover:border-nature-olive/40 transition-colors">
                                                <button
                                                    type="button"
                                                    onClick={() => confirmRemoveWishlist(item)}
                                                    title="Remove from wishlist"
                                                    className="absolute top-2.5 right-2.5 text-nature-muted hover:text-red-600 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                                                </button>

                                                <div className="w-16 h-16 bg-nature-bg rounded-md border border-nature-border/60 overflow-hidden flex-shrink-0 flex items-center justify-center">
                                                    {item.product_image
                                                        ? <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                                                        : <Package className="w-6 h-6 text-nature-sand" strokeWidth={1.5} />}
                                                </div>
                                                <div className="flex-1 min-w-0 pr-6">
                                                    <h4 className="text-nature-dark font-medium text-sm truncate">{item.product_name}</h4>
                                                    <p className="text-nature-muted text-xs capitalize mt-0.5">{item.product_type || 'Perfume'}</p>
                                                    <Link to={`/products/${item.product_slug}`} className="inline-flex items-center gap-1 text-nature-olive hover:text-nature-olive-dark text-xs font-medium mt-2 transition-colors">
                                                        View Product <ArrowRight className="w-3 h-3" />
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* --- REVIEWS --- */}
                        {activeTab === 'reviews' && (
                            <div className={`${panelClass} p-6`}>
                                <h3 className="text-nature-olive text-[11px] tracking-[0.25em] uppercase font-medium mb-5">Your Reviews</h3>

                                {reviews.length === 0 ? (
                                    <div className="text-center py-16">
                                        <MessageSquare className="w-10 h-10 text-nature-sand mx-auto mb-4" strokeWidth={1} />
                                        <p className="text-nature-muted text-sm mb-5">You haven't left any reviews yet.</p>
                                        <Link to="/products" className="inline-flex items-center bg-nature-olive hover:bg-nature-olive-dark text-white px-6 py-2.5 rounded-md text-xs tracking-wider uppercase transition-colors">Browse Products to Review</Link>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-nature-border/60">
                                        {reviews.map(review => {
                                            const isEditing = editingReviewId === review.id;
                                            return (
                                                <div key={review.id} className="py-4 first:pt-0 last:pb-0 space-y-2">
                                                    <div className="flex items-center justify-between gap-3">
                                                        <h4 className="text-nature-dark font-medium text-sm">{review.product_name || `Product #${review.product_id}`}</h4>
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-md bg-nature-bg border border-nature-border/60 overflow-hidden flex-shrink-0 flex items-center justify-center">
                                                                {review.product_image
                                                                    ? <img src={review.product_image} alt={review.product_name} className="w-full h-full object-cover" />
                                                                    : <Package className="w-4 h-4 text-nature-sand" strokeWidth={1.5} />}
                                                            </div>
                                                            <div>
                                                              <Link to={`/products/${review.product_slug}`} className="text-nature-dark font-medium text-sm hover:text-nature-olive transition-colors">
    {review.product_name || `Product #${review.product_slug}`}
</Link>

                                                                {review.brand_name && <p className="text-nature-muted text-xs">{review.brand_name}</p>}
                                                            </div>
                                                        </div>


                                                        {!isEditing && (
                                                            <div className="flex items-center gap-3 flex-shrink-0">
                                                                <div className="flex items-center gap-0.5">
                                                                    {[...Array(5)].map((_, i) => (
                                                                        <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'text-amber-500 fill-amber-500' : 'text-nature-sand'}`} />
                                                                    ))}
                                                                </div>
                                                                <button onClick={() => startEditReview(review)} title="Edit review" className="text-nature-muted hover:text-nature-olive transition-colors">
                                                                    <Pencil className="w-3.5 h-3.5" strokeWidth={1.5} />
                                                                </button>
                                                                <button onClick={() => confirmDeleteReview(review)} title="Delete review" className="text-nature-muted hover:text-red-600 transition-colors">
                                                                    <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {isEditing ? (
                                                        <div className="bg-nature-bg/60 border border-nature-border/50 rounded-md p-4 space-y-3">
                                                            <div>
                                                                <label className={labelClass}>Rating</label>
                                                                <div className="flex items-center gap-1 mt-1">
                                                                    {[1, 2, 3, 4, 5].map(n => (
                                                                        <button key={n} type="button" onClick={() => setEditRating(n)}>
                                                                            <Star className={`w-5 h-5 transition-colors ${n <= editRating ? 'text-amber-500 fill-amber-500' : 'text-nature-sand hover:text-amber-300'}`} />
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <label className={labelClass}>Comment</label>
                                                                <textarea
                                                                    value={editComment}
                                                                    onChange={e => setEditComment(e.target.value)}
                                                                    rows={3}
                                                                    className="w-full bg-white/70 border border-nature-border/70 focus:border-nature-olive rounded-md px-3 py-2 text-nature-dark text-sm outline-none transition-colors resize-none mt-1"
                                                                    placeholder="Share your thoughts on this fragrance..."
                                                                />
                                                            </div>
                                                            {editError && <p className="text-red-600 text-xs">{editError}</p>}
                                                            <div className="flex items-center gap-3">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleSaveReview(review.id)}
                                                                    disabled={editSaving}
                                                                    className="bg-nature-olive hover:bg-nature-olive-dark disabled:opacity-50 text-white px-4 py-2 rounded-md text-xs font-medium tracking-wide uppercase transition-colors"
                                                                >
                                                                    {editSaving ? 'Saving...' : 'Save Changes'}
                                                                </button>
                                                                <button type="button" onClick={cancelEditReview} className="text-nature-muted hover:text-nature-dark text-xs uppercase tracking-wide transition-colors flex items-center gap-1">
                                                                    <X className="w-3.5 h-3.5" /> Cancel
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            {review.title && <p className="text-nature-dark font-semibold text-xs">{review.title}</p>}
                                                            {review.comment && <p className="text-nature-muted text-xs bg-nature-bg/60 p-3 rounded-md border border-nature-border/40 italic">"{review.comment}"</p>}
                                                            <p className="text-nature-subtle text-[11px] text-right">{new Date(review.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                                        </>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* --- SECURITY SETTINGS --- */}
                        {activeTab === 'security' && (
                            <div className={`${panelClass} p-6`}>
                                <h3 className="text-nature-olive text-[11px] tracking-[0.25em] uppercase font-medium mb-5">Security Settings</h3>

                                <div className="flex items-center justify-between gap-4 pb-5 border-b border-nature-border/60 mb-5">
                                    <div>
                                        <p className="text-nature-dark text-sm font-medium">Account Password</p>
                                        <p className="text-nature-muted text-xs mt-0.5">Update your password regularly to keep your account secure.</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => { setShowPasswordForm(v => !v); setPasswordError(''); setPasswordSuccess(''); }}
                                        className="bg-nature-olive hover:bg-nature-olive-dark text-white px-5 py-2.5 rounded-md text-xs tracking-wider uppercase transition-colors flex-shrink-0"
                                    >
                                        {showPasswordForm ? 'Hide Form' : 'Change Password'}
                                    </button>
                                </div>

                                {showPasswordForm && (
                                    <form onSubmit={handleChangePassword} className="max-w-md space-y-4">
                                        <div>
                                            <label className={labelClass}>Current Password *</label>
                                            <input required type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
                                                placeholder="Enter current password" className={inputClass} />
                                            <FieldError errors={passwordErrors} field="current_password" />
                                        </div>
                                        <div>
                                            <label className={labelClass}>New Password *</label>
                                            <input required type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                                                placeholder="Min 8 characters" className={inputClass} />
                                            <FieldError errors={passwordErrors} field="new_password" />

                                            {newPassword.length > 0 && (
                                                <ul className="mt-2 space-y-1">
                                                    {passwordChecks.map(check => (
                                                        <li key={check.label} className={`text-[11px] flex items-center gap-1.5 ${check.pass ? 'text-nature-olive' : 'text-nature-muted'}`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${check.pass ? 'bg-nature-olive' : 'bg-nature-sand'}`} />
                                                            {check.label}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                        <div>
                                            <label className={labelClass}>Confirm New Password *</label>
                                            <input required type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                                                placeholder="Re-enter new password" className={inputClass} />
                                        </div>

                                        {passwordFormError && (
                                            <p className="text-red-600 text-sm bg-red-50/80 border border-red-200 px-4 py-3 rounded-md">{passwordFormError}</p>
                                        )}

                                        <div className="flex items-center gap-4 pt-2">
                                            <button type="submit" disabled={passwordLoading}
                                                className="bg-nature-olive hover:bg-nature-olive-dark disabled:opacity-50 text-white font-medium px-5 py-2.5 rounded-md text-xs tracking-wider uppercase transition-colors">
                                                {passwordLoading ? 'Updating...' : 'Save Password'}
                                            </button>
                                            <button type="button" onClick={() => setShowPasswordForm(false)} className="text-nature-muted hover:text-nature-dark text-xs uppercase tracking-wide transition-colors">Cancel</button>
                                        </div>
                                    </form>
                                )}

                                {passwordSuccess && (
                                    <div className="mt-5 bg-nature-sage/20 border border-nature-sage/40 rounded-md px-4 py-3 flex items-center gap-2 max-w-md">
                                        <CheckCircle className="w-4 h-4 text-nature-olive flex-shrink-0" strokeWidth={1.5} />
                                        <p className="text-nature-olive text-sm">{passwordSuccess}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </main>
                </div>
            </div>

            {/* --- ORDER DETAIL MODAL --- */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className={`${modalPanelClass} max-w-lg w-full max-h-[85vh] overflow-y-auto p-6`}>
                        <div className="flex items-start justify-between mb-5 pb-5 border-b border-nature-border/60">
                            <div>
                                <h3 className="font-serif text-xl text-nature-dark">
                                    Order #<span className="font-mono text-nature-muted text-base">{selectedOrder.id}</span>
                                </h3>
                                <p className="text-nature-muted text-xs mt-1">
                                    {new Date(selectedOrder.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                            </div>
                            <button onClick={() => setSelectedOrder(null)} className="text-nature-muted hover:text-nature-dark transition-colors">
                                <X className="w-5 h-5" strokeWidth={1.5} />
                            </button>
                        </div>

                        <div className="flex items-center gap-2 mb-5">
                            {(() => {
                                const StatusIcon = STATUS_ICONS[selectedOrder.status] ?? Clock;
                                return (
                                    <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full ${STATUS_STYLES[selectedOrder.status]}`}>
                                        <StatusIcon className="w-3.5 h-3.5" />
                                        <span className="capitalize">{selectedOrder.status}</span>
                                    </span>
                                );
                            })()}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-nature-bg/50 border border-nature-border/40 rounded-md p-4 mb-5">
                            <div className="flex items-start gap-2.5">
                                <MapPin className="w-4 h-4 text-nature-olive mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                                <div>
                                    <p className={labelClass}>Ship To</p>
                                    <p className="text-nature-dark text-sm">{selectedOrder.shipping_name || 'Customer'}</p>
                                    <p className="text-nature-muted text-xs mt-0.5">{selectedOrder.address}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2.5">
                                <Phone className="w-4 h-4 text-nature-olive mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                                <div>
                                    <p className={labelClass}>Contact & Payment</p>
                                    <p className="text-nature-dark text-sm">{selectedOrder.shipping_phone || 'N/A'}</p>
                                    <p className="text-nature-muted text-xs mt-0.5 capitalize">{selectedOrder.payment_method?.replace('_', ' ')}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3 mb-5">
                            {selectedOrder.items && selectedOrder.items.map(item => (
                                <div key={item.id} className="flex justify-between items-start text-xs border-b border-nature-border/40 pb-3 last:border-0 last:pb-0">
                                    <div>
                                        <h4 className="text-nature-dark text-sm font-medium">{item.product_name}</h4>
                                        <p className="text-nature-muted mt-0.5">
                                            {item.brand_name} · <span className="font-medium text-nature-dark">{item.variant_size}</span> · qty {item.quantity}
                                        </p>
                                    </div>
                                    <span className="text-nature-dark font-medium">{formatMMK(item.price * item.quantity)}</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-between items-baseline pt-3 border-t border-nature-border/60 mb-2">
                            <span className="text-nature-dark font-medium text-xs tracking-[0.15em] uppercase">Total</span>
                            <span className="text-nature-olive font-serif font-semibold text-xl">{formatMMK(selectedOrder.total_amount)}</span>
                        </div>

                        {['pending', 'processing'].includes(selectedOrder.status) && (
                            <div className="pt-4 mt-4 border-t border-nature-border/60">
                                <button
                                    type="button"
                                    onClick={() => confirmCancelOrder(selectedOrder)}
                                    className="w-full flex items-center justify-center gap-1.5 text-red-600 border border-red-200 hover:bg-red-600 hover:text-white hover:border-red-600 px-4 py-2.5 rounded-md text-xs font-medium tracking-wide uppercase transition-colors"
                                >
                                    <XCircle className="w-3.5 h-3.5" /> Cancel Order
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* --- SHARED CONFIRM MODAL --- */}
            {confirmModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className={`${modalPanelClass} max-w-sm w-full p-6`}>
                        <h3 className="font-serif text-lg text-nature-dark mb-2">{confirmModal.title}</h3>
                        <p className="text-nature-muted text-sm mb-6">{confirmModal.message}</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setConfirmModal(null)}
                                disabled={confirmLoading}
                                className="flex-1 border border-nature-border text-nature-dark hover:bg-nature-bg disabled:opacity-50 px-4 py-2.5 rounded-md text-xs font-medium tracking-wide uppercase transition-colors"
                            >
                                Go Back
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={confirmLoading}
                                className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-md text-xs font-medium tracking-wide uppercase transition-colors"
                            >
                                {confirmLoading ? 'Please wait...' : confirmModal.confirmLabel}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}