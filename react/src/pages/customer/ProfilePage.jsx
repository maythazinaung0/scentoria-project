import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    UserCircle, ShoppingBag, ChevronDown, ChevronLeft, ChevronRight,
    Clock, CheckCircle, XCircle, Package, ArrowRight, Hourglass,
    Wallet, Plus, Send, Star, MessageSquare, Lock, Bookmark, MapPin, Phone,
    Trash2, Pencil, X, Copy, Check
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api';
import FieldError from '../../components/FieldError';
import { getFieldErrors, getErrorMessage } from '../../utils/formErrors';
import OrderDetail from '../../components/OrderDetail';
import { useConfirm } from '../../contexts/ConfirmContext';

const formatMMK = (amount) =>
    new Intl.NumberFormat('en-MM', {
        style: 'currency',
        currency: 'MMK',
        minimumFractionDigits: 0,
    }).format(amount ?? 0);

const STATUS_STYLES = {
    pending: 'bg-nature-sage/30 text-nature-olive dark:bg-night-border dark:text-nature-sage',
    processing: 'bg-nature-blue/30 text-nature-blue dark:bg-night-border dark:text-blue-400',
    completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400',
};

const STATUS_ICONS = {
    pending: Clock,
    processing: Hourglass,
    completed: CheckCircle,
    cancelled: XCircle,
};

const TOPUP_STATUS_STYLES = {
    pending: 'bg-nature-sage/30 text-nature-olive dark:bg-night-border dark:text-nature-sage',
    completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
    failed: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400',
};

const PAYMENT_METHOD_LABELS = {
    kbzpay: 'KBZ Pay',
    cbpay: 'CB Pay',
};

const panelClass = "bg-white/45 dark:bg-night-card backdrop-blur-xl border border-white/60 dark:border-night-border rounded-lg shadow-[0_4px_24px_-12px_rgba(44,53,39,0.15)] dark:shadow-[0_4px_24px_-12px_rgba(0,0,0,0.5)] transition-colors duration-300";
const modalPanelClass = "bg-white dark:bg-night-card border border-nature-border/50 dark:border-night-border rounded-lg shadow-[0_20px_60px_-15px_rgba(44,53,39,0.35)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] transition-colors duration-300";
const inputClass = "w-full bg-transparent border-b border-nature-border/80 dark:border-night-border focus:border-nature-olive dark:focus:border-nature-sage rounded-none px-0 py-1.5 text-nature-dark dark:text-night-text text-sm outline-none transition-colors placeholder:text-nature-muted/60 dark:placeholder:text-night-muted/60";
const labelClass = "block text-nature-muted dark:text-night-muted text-[10px] tracking-[0.2em] uppercase mb-1";

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
        <div className="flex items-center justify-between gap-2 bg-white/70 dark:bg-night-bg border border-nature-border/50 dark:border-night-border rounded-md px-3 py-2 transition-colors duration-300">
            <div className="min-w-0">
                <p className="text-nature-muted dark:text-night-muted text-[10px] tracking-[0.15em] uppercase">{label}</p>
                <p className="text-nature-dark dark:text-night-text text-sm font-medium truncate">{value}</p>
            </div>
            <button type="button" onClick={handleCopy} className="flex-shrink-0 text-nature-olive dark:text-nature-sage hover:text-nature-olive-dark dark:hover:text-nature-sage/80 transition-colors">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" strokeWidth={1.5} />}
            </button>
        </div>
    );
}

function Pagination({ currentPage, totalPages, onPageChange }) {
    if (totalPages <= 1) return null;

    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
    const pages = [];
    for (let i = start; i <= end; i++) pages.push(i);

    return (
        <div className="flex items-center justify-center gap-1.5 pt-6 mt-4 border-t border-nature-border/50 dark:border-night-border transition-colors duration-300">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-3 py-2 text-xs uppercase tracking-wide text-nature-muted dark:text-night-muted hover:text-nature-olive dark:hover:text-nature-sage disabled:opacity-30 disabled:hover:text-nature-muted transition-colors"
            >
                <ChevronLeft className="w-3.5 h-3.5" /> Prev
            </button>

            <div className="flex items-center gap-1">
                {start > 1 && (
                    <>
                        <button onClick={() => onPageChange(1)} className="w-8 h-8 text-xs rounded-md text-nature-muted dark:text-night-muted hover:bg-nature-sage/20 dark:hover:bg-night-border transition-colors">1</button>
                        {start > 2 && <span className="text-nature-muted dark:text-night-muted text-xs px-1">…</span>}
                    </>
                )}
                {pages.map(p => (
                    <button
                        key={p}
                        onClick={() => onPageChange(p)}
                        className={`w-8 h-8 text-xs rounded-md transition-colors ${p === currentPage ? 'bg-nature-olive dark:bg-nature-sage text-white dark:text-night-bg font-medium' : 'text-nature-muted dark:text-night-muted hover:bg-nature-sage/20 dark:hover:bg-night-border'}`}
                    >
                        {p}
                    </button>
                ))}
                {end < totalPages && (
                    <>
                        {end < totalPages - 1 && <span className="text-nature-muted dark:text-night-muted text-xs px-1">…</span>}
                        <button onClick={() => onPageChange(totalPages)} className="w-8 h-8 text-xs rounded-md text-nature-muted dark:text-night-muted hover:bg-nature-sage/20 dark:hover:bg-night-border transition-colors">{totalPages}</button>
                    </>
                )}
            </div>

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-3 py-2 text-xs uppercase tracking-wide text-nature-muted dark:text-night-muted hover:text-nature-olive dark:hover:text-nature-sage disabled:opacity-30 disabled:hover:text-nature-muted transition-colors"
            >
                Next <ChevronRight className="w-3.5 h-3.5" />
            </button>
        </div>
    );
}

export default function ProfilePage() {
    const openConfirm = useConfirm();
    const { user, isAdmin, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('wallet');

    const [orders, setOrders] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [wishlists, setWishlists] = useState([]);
    const [walletBalance, setWalletBalance] = useState(0);
    const [topupRequests, setTopupRequests] = useState([]);
    const [topupErrors, setTopupErrors] = useState({});
    const [loading, setLoading] = useState(true);

    const [selectedOrder, setSelectedOrder] = useState(null);
    const [ordersPage, setOrdersPage] = useState(1);
    const [wishlistPage, setWishlistPage] = useState(1);
    const [reviewsPage, setReviewsPage] = useState(1);
    const ITEMS_PER_PAGE = 5;
    const WISHLIST_PER_PAGE = 6;

    const [paymentMethods, setPaymentMethods] = useState(null);

    const [topupAmount, setTopupAmount] = useState('');
    const [topupMethod, setTopupMethod] = useState('kbzpay');
    const [senderName, setSenderName] = useState('');
    const [topupLoading, setTopupLoading] = useState(false);
    const [topupError, setTopupError] = useState('');
    const [topupSuccess, setTopupSuccess] = useState(false);
    const [showTopupForm, setShowTopupForm] = useState(false);
    const [topupImage, setTopupImage] = useState(null);

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordErrors, setPasswordErrors] = useState({});
    const [passwordFormError, setPasswordFormError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [showPasswordForm, setShowPasswordForm] = useState(false);

    const passwordChecks = [
        { label: 'At least 8 characters', pass: newPassword.length >= 8 },
        { label: 'One uppercase & one lowercase letter', pass: /[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword) },
        { label: 'At least one number', pass: /\d/.test(newPassword) },
        { label: 'At least one symbol', pass: /[^A-Za-z0-9]/.test(newPassword) },
    ];

    const [editingReviewId, setEditingReviewId] = useState(null);
    const [editRating, setEditRating] = useState(0);
    const [editComment, setEditComment] = useState('');
    const [editSaving, setEditSaving] = useState(false);
    const [editError, setEditError] = useState('');

    useEffect(() => {
        setOrdersPage(1);
        setWishlistPage(1);
        setReviewsPage(1);
    }, [activeTab]);

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
        setTopupErrors({});
        setTopupError('');

        const amount = parseInt(topupAmount.replace(/,/g, ''), 10);

        setTopupLoading(true);

        try {
            const formData = new FormData();
            formData.append('deposit_amount', amount || '');
            formData.append('topup_channel', topupMethod);
            formData.append('sender_name', senderName.trim());
            if (topupImage) formData.append('transaction_image', topupImage);

            await api.post('/wallet-topups', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                skipErrorToast: true,
            });

            setTopupAmount('');
            setSenderName('');
            setTopupImage(null);
            setTopupSuccess(true);
            setShowTopupForm(false);
            setTimeout(() => setTopupSuccess(false), 4000);
            loadData();
        } catch (err) {
            const fieldErrors = getFieldErrors(err);
            setTopupErrors(fieldErrors);
            if (Object.keys(fieldErrors).length === 0) {
                setTopupError(getErrorMessage(err));
            }
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
            const errors = getFieldErrors(err);
            setPasswordErrors(errors);

            if (Object.keys(errors).length === 0) {
                setPasswordFormError(getErrorMessage(err));
            }
        } finally {
            setPasswordLoading(false);
        }
    }
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
            <div className="min-h-screen bg-nature-bg dark:bg-night-bg flex items-center justify-center transition-colors duration-300">
                <div className="w-6 h-6 border border-nature-olive dark:border-nature-sage border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-nature-bg dark:bg-night-bg text-nature-dark dark:text-night-text pt-20 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">

                <p className="text-[11px] uppercase tracking-[0.35em] text-nature-olive dark:text-nature-sage font-medium mb-2">Your Account</p>
                <div className="flex items-baseline justify-between mb-8 pb-5 border-b border-nature-border/70 dark:border-night-border transition-colors duration-300">
                    <div>
                        <h1 className="font-serif text-3xl sm:text-4xl text-nature-dark dark:text-night-text tracking-tight">Welcome back, {displayName}</h1>
                        <p className="text-nature-muted dark:text-night-muted text-sm mt-1">{user?.email}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">

                    <aside className={`${panelClass} p-5 h-fit xl:sticky xl:top-24 flex flex-col`}>
                        <div className="flex items-center gap-3 pb-5 mb-4 border-b border-nature-border/60 dark:border-night-border">
                            <div className="w-11 h-11 rounded-full bg-nature-olive/15 dark:bg-nature-sage/20 text-nature-olive dark:text-nature-sage font-serif text-lg flex items-center justify-center flex-shrink-0">
                                {displayName.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                                <p className="text-nature-dark dark:text-night-text text-sm font-medium truncate">{displayName}</p>
                                <p className="text-nature-muted dark:text-night-muted text-xs truncate">{user?.email}</p>
                            </div>
                        </div>

                        <p className="text-nature-muted dark:text-night-muted text-[10px] tracking-[0.2em] uppercase mb-2 px-1">Account Menu</p>
                        <nav className="space-y-2">
                            {sidebarItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = activeTab === item.id;
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => setActiveTab(item.id)}
                                        className={`w-full flex items-center gap-3 px-4 py-4 rounded-md text-sm font-medium transition-colors ${isActive
                                            ? 'bg-nature-olive dark:bg-nature-sage text-white dark:text-night-bg shadow-sm'
                                            : 'text-nature-muted dark:text-night-muted hover:bg-nature-sage/20 dark:hover:bg-night-border hover:text-nature-dark dark:hover:text-night-text'
                                            }`}
                                    >
                                        <Icon className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? 'text-white dark:text-night-bg' : 'text-nature-olive dark:text-nature-sage'}`} strokeWidth={1.5} />
                                        <span className="truncate">{item.label}</span>
                                        {item.count !== undefined && item.count > 0 && (
                                            <span className={`ml-auto text-[11px] px-2 py-0.5 rounded-full ${isActive ? 'bg-white/20 dark:bg-night-bg/30 text-white dark:text-night-bg' : 'bg-nature-sage/30 dark:bg-night-border text-nature-olive dark:text-nature-sage'}`}>
                                                {item.count}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </nav>

                        <div className="mt-6 pt-5 border-t border-nature-border/60 dark:border-night-border">
                            <div className="bg-nature-bg/60 dark:bg-night-bg rounded-md px-4 py-3.5 transition-colors duration-300">
                                <p className="text-nature-muted dark:text-night-muted text-[10px] tracking-[0.2em] uppercase mb-1">Wallet Balance</p>
                                <p className="text-nature-olive dark:text-nature-sage font-serif text-lg">{formatMMK(walletBalance)}</p>
                            </div>
                        </div>
                    </aside>
                    <main className="xl:col-span-3 min-h-[400px] space-y-6">

                        {activeTab === 'wallet' && (
                            <div className={`${panelClass} p-6`}>
                                <h3 className="text-nature-olive dark:text-nature-sage text-[11px] tracking-[0.25em] uppercase font-medium mb-5">Virtual Wallet</h3>

                                <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-nature-border/60 dark:border-night-border mb-6">
                                    <div>
                                        <p className={labelClass}>Available Balance</p>
                                        <p className="font-serif text-4xl text-nature-olive dark:text-nature-sage mt-1">{formatMMK(walletBalance)}</p>
                                        {pendingTopup > 0 && (
                                            <p className="text-nature-tan dark:text-nature-sage/80 text-xs mt-2 flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> +{formatMMK(pendingTopup)} pending approval
                                            </p>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => { setShowTopupForm(v => !v); setTopupError(''); }}
                                        className="flex items-center gap-2 bg-nature-olive hover:bg-nature-olive-dark dark:bg-nature-sage dark:hover:bg-nature-sage/80 text-white dark:text-night-bg font-medium px-5 py-2.5 rounded-md text-xs tracking-wider uppercase transition-colors"
                                    >
                                        <Plus className="w-3.5 h-3.5" /> Request Top Up
                                    </button>
                                </div>

                                {showTopupForm && (
                                    <div className="pb-6 mb-6 border-b border-nature-border/60 dark:border-night-border space-y-5">

                                        <div>
                                            <label className={labelClass}>1. Send Money Via</label>
                                            <div className="flex gap-2 mt-1.5 mb-4">
                                                {[{ value: 'kbzpay', label: 'KBZ Pay' }, { value: 'cbpay', label: 'CB Pay' }].map(m => (
                                                    <button
                                                        key={m.value} type="button" onClick={() => setTopupMethod(m.value)}
                                                        className={`px-3 py-1.5 rounded border text-xs tracking-wide transition-colors ${topupMethod === m.value
                                                            ? 'bg-nature-olive border-nature-olive dark:bg-nature-sage dark:border-nature-sage text-white dark:text-night-bg font-medium'
                                                            : 'border-nature-border dark:border-night-border text-nature-muted dark:text-night-muted hover:border-nature-olive dark:hover:border-nature-sage'
                                                            }`}
                                                    >
                                                        {m.label}
                                                    </button>
                                                ))}
                                            </div>

                                            {selectedPaymentInfo ? (
                                                <div className="bg-nature-bg/60 dark:bg-night-bg border border-nature-border/50 dark:border-night-border rounded-md p-4 flex flex-col sm:flex-row gap-4 transition-colors duration-300">
                                                    {selectedPaymentInfo.qr_code_url && (
                                                        <img
                                                            src={selectedPaymentInfo.qr_code_url}
                                                            alt={`${PAYMENT_METHOD_LABELS[topupMethod]} QR code`}
                                                            className="w-32 h-32 object-contain bg-white rounded-md border border-nature-border/40 dark:border-night-border flex-shrink-0 mx-auto sm:mx-0"
                                                        />
                                                    )}
                                                    <div className="flex-1 space-y-2">
                                                        <CopyableField label="Account Name" value={selectedPaymentInfo.account_name} />
                                                        <CopyableField label="Account Number" value={selectedPaymentInfo.account_number} />
                                                        <p className="text-nature-muted dark:text-night-muted text-[11px]">Scan the QR code or send manually to this account, then fill in the details below.</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-nature-muted dark:text-night-muted text-xs bg-nature-bg/60 dark:bg-night-bg border border-nature-border/50 dark:border-night-border rounded-md p-3 transition-colors duration-300">
                                                    Payment details are unavailable right now — please refresh the page.
                                                </p>
                                            )}
                                        </div>

                                        <form onSubmit={submitTopup} className="space-y-4" noValidate>
                                            <label className={labelClass}>2. Confirm Your Payment</label>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
                                                <div>
                                                    <label className={labelClass}>Amount Sent (MMK) *</label>
                                                    <input
                                                        type="number"
                                                        max="10000000"
                                                        value={topupAmount}
                                                        onChange={e => {
                                                            const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 8);
                                                            setTopupAmount(digitsOnly);
                                                        }}
                                                        placeholder="e.g. 50000"
                                                        className={inputClass}
                                                    />
                                                    <FieldError errors={topupErrors} field="deposit_amount" />
                                                </div>

                                                <div>
                                                    <label className={labelClass}>Sender Name *</label>
                                                    <input
                                                        type="text"
                                                        value={senderName}
                                                        onChange={e => setSenderName(e.target.value)}
                                                        maxLength={255}
                                                        placeholder="Name shown in your payment app"
                                                        className={inputClass}
                                                    />
                                                    <FieldError errors={topupErrors} field="sender_name" />
                                                </div>

                                                <div className="sm:col-span-2">
                                                    <label className={labelClass}>Transaction Screenshot *</label>
                                                    <input
                                                        type="file" accept="image/png,image/jpeg,image/jpg"
                                                        onChange={e => setTopupImage(e.target.files[0])}
                                                        className="w-full text-nature-dark dark:text-night-text text-sm mt-1.5 file:mr-4 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-nature-sage/30 file:text-nature-olive dark:file:bg-night-border dark:file:text-nature-sage hover:file:bg-nature-sage/50 dark:hover:file:bg-night-border/80 transition-colors"
                                                    />
                                                    <FieldError errors={topupErrors} field="transaction_image" />
                                                </div>
                                            </div>

                                            {topupError && <p className="text-red-600 dark:text-red-400 text-sm bg-red-50/80 dark:bg-red-950/35 border border-red-200 dark:border-red-900/40 px-4 py-3 rounded-md">{topupError}</p>}
                                            <div className="flex items-center gap-4">
                                                <button type="submit" disabled={topupLoading}
                                                    className="flex items-center gap-2 bg-nature-olive hover:bg-nature-olive-dark dark:bg-nature-sage dark:hover:bg-nature-sage/80 disabled:opacity-50 text-white dark:text-night-bg font-medium px-5 py-2.5 rounded-md text-xs tracking-wider uppercase transition-colors">
                                                    <Send className="w-3.5 h-3.5" /> {topupLoading ? 'Sending...' : 'Submit for Review'}
                                                </button>
                                                <button type="button" onClick={() => setShowTopupForm(false)} className="text-nature-muted dark:text-night-muted hover:text-nature-dark dark:hover:text-night-text text-xs uppercase tracking-wide transition-colors">Cancel</button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                {topupSuccess && (
                                    <div className="mb-6 bg-nature-sage/20 dark:bg-nature-sage/10 border border-nature-sage/40 dark:border-nature-sage/30 rounded-md px-4 py-3 flex items-center gap-2 transition-colors duration-300">
                                        <CheckCircle className="w-4 h-4 text-nature-olive dark:text-nature-sage flex-shrink-0" strokeWidth={1.5} />
                                        <p className="text-nature-olive dark:text-nature-sage text-sm">Top-up request sent! Admin will review it shortly.</p>
                                    </div>
                                )}

                                {topupRequests.length > 0 ? (
                                    <div className="space-y-2">
                                        <p className={labelClass}>Top-Up History</p>
                                        <div className="max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">
                                            {topupRequests.map(req => {
                                                const statusStyle = TOPUP_STATUS_STYLES[req.status] ?? 'bg-nature-sand/30 text-nature-muted dark:bg-night-border dark:text-night-muted';
                                                return (
                                                    <div key={req.id} className="flex items-center justify-between border-b border-nature-border/40 dark:border-night-border py-3 last:border-0 transition-colors duration-300">
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <p className="text-nature-dark dark:text-night-text text-sm font-medium">+{formatMMK(req.deposit_amount)}</p>
                                                                <span className="text-nature-muted dark:text-night-muted text-[11px] bg-nature-sage/20 dark:bg-night-border px-1.5 py-0.5 rounded">
                                                                    {PAYMENT_METHOD_LABELS[req.topup_channel] ?? req.topup_channel}
                                                                </span>
                                                            </div>
                                                            <p className="text-nature-muted dark:text-night-muted text-xs mt-0.5">
                                                                {new Date(req.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                            </p>
                                                        </div>
                                                        <span className={`text-[11px] px-2.5 py-1 rounded-full capitalize font-medium ${statusStyle}`}>
                                                            {req.status}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-nature-muted dark:text-night-muted text-xs text-center py-6">No top-up requests yet.</p>
                                )}
                            </div>
                        )}

                        {activeTab === 'orders' && (
                            <div className={`${panelClass} p-6`}>
                                <h3 className="text-nature-olive dark:text-nature-sage text-[11px] tracking-[0.25em] uppercase font-medium mb-5">Order History</h3>

                                {selectedOrder ? (
                                    <div>
                                        <button
                                            onClick={() => setSelectedOrder(null)}
                                            className="inline-flex items-center gap-1.5 text-xs text-nature-olive dark:text-nature-sage hover:underline mb-4 font-medium"
                                        >
                                            <ChevronLeft className="w-4 h-4" /> Back to all orders
                                        </button>
                                        <OrderDetail order={selectedOrder} onCancel={confirmCancelOrder} />
                                    </div>
                                ) : orders.length > 0 ? (
                                    <div className="space-y-4">
                                        <div className="space-y-3">
                                            {orders
                                                .slice((ordersPage - 1) * ITEMS_PER_PAGE, ordersPage * ITEMS_PER_PAGE)
                                                .map(order => {
                                                    const statusStyle = STATUS_STYLES[order.status] ?? 'bg-nature-sand/30 text-nature-muted dark:bg-night-border dark:text-night-muted';
                                                    const StatusIcon = STATUS_ICONS[order.status] ?? Clock;

                                                    return (
                                                        <div
                                                            key={order.id}
                                                            onClick={() => setSelectedOrder(order)}
                                                            className="bg-white/70 dark:bg-night-bg border border-nature-border/50 dark:border-night-border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-nature-olive dark:hover:border-nature-sage cursor-pointer transition-colors"
                                                        >
                                                            <div className="space-y-1">
                                                                <div className="flex items-center gap-2.5">
                                                                    <p className="text-nature-dark dark:text-night-text font-medium text-sm">Order #{order.id}</p>
                                                                    <span className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full capitalize font-medium ${statusStyle}`}>
                                                                        <StatusIcon className="w-3 h-3" />
                                                                        {order.status}
                                                                    </span>
                                                                </div>
                                                                <p className="text-nature-muted dark:text-night-muted text-xs">
                                                                    {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • {order.items?.length || 0} items
                                                                </p>
                                                            </div>
                                                            <div className="flex items-center justify-between sm:justify-end gap-4">
                                                                <p className="text-nature-olive dark:text-nature-sage font-serif text-base">{formatMMK(order.total_amount)}</p>
                                                                <span className="text-nature-muted dark:text-night-muted hover:text-nature-dark dark:hover:text-night-text transition-colors">
                                                                    <ArrowRight className="w-4 h-4" />
                                                                </span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                        </div>

                                        <Pagination
                                            currentPage={ordersPage}
                                            totalPages={Math.ceil(orders.length / ITEMS_PER_PAGE)}
                                            onPageChange={setOrdersPage}
                                        />
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <Package className="w-10 h-10 text-nature-muted/40 dark:text-night-muted mx-auto mb-3" strokeWidth={1.5} />
                                        <p className="text-nature-dark dark:text-night-text font-serif text-lg mb-1">No orders yet</p>
                                        <p className="text-nature-muted dark:text-night-muted text-xs mb-5">Explore our collection and find your signature scent.</p>
                                        <Link to="/shop" className="inline-block bg-nature-olive dark:bg-nature-sage text-white dark:text-night-bg font-medium px-5 py-2.5 rounded-md text-xs tracking-wider uppercase hover:bg-nature-olive-dark dark:hover:bg-nature-sage/80 transition-colors">
                                            Browse Shop
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'wishlist' && (
                            <div className={`${panelClass} p-6`}>
                                <h3 className="text-nature-olive dark:text-nature-sage text-[11px] tracking-[0.25em] uppercase font-medium mb-5">My Wishlist</h3>

                                {wishlists.length > 0 ? (
                                    <div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {wishlists
                                                .slice((wishlistPage - 1) * WISHLIST_PER_PAGE, wishlistPage * WISHLIST_PER_PAGE)
                                                .map(item => (
                                                    <div key={item.id} className="bg-white/70 dark:bg-night-bg border border-nature-border/50 dark:border-night-border rounded-lg p-4 flex flex-col justify-between transition-colors duration-300">
                                                        <div>
                                                            <Link to={`/products/${item.product_id}`} className="block group mb-3">
                                                                {item.product_image && (
                                                                    <div className="w-full h-36 bg-nature-bg dark:bg-night-card rounded-md overflow-hidden mb-3">
                                                                        <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                                                    </div>
                                                                )}
                                                                <h4 className="font-serif text-nature-dark dark:text-night-text text-sm group-hover:text-nature-olive dark:group-hover:text-nature-sage transition-colors line-clamp-1">{item.product_name}</h4>
                                                            </Link>
                                                            <p className="text-nature-olive dark:text-nature-sage font-serif text-sm mb-4">{formatMMK(item.product_price)}</p>
                                                        </div>
                                                        <div className="flex items-center justify-between pt-3 border-t border-nature-border/40 dark:border-night-border">
                                                            <Link
                                                                to={`/products/${item.product_id}`}
                                                                className="text-xs uppercase tracking-wider text-nature-olive dark:text-nature-sage hover:underline font-medium"
                                                            >
                                                                View
                                                            </Link>
                                                            <button
                                                                type="button"
                                                                onClick={() => confirmRemoveWishlist(item)}
                                                                className="text-nature-muted dark:text-night-muted hover:text-red-600 dark:hover:text-red-400 transition-colors p-1"
                                                                title="Remove"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>

                                        <Pagination
                                            currentPage={wishlistPage}
                                            totalPages={Math.ceil(wishlists.length / WISHLIST_PER_PAGE)}
                                            onPageChange={setWishlistPage}
                                        />
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <Bookmark className="w-10 h-10 text-nature-muted/40 dark:text-night-muted mx-auto mb-3" strokeWidth={1.5} />
                                        <p className="text-nature-dark dark:text-night-text font-serif text-lg mb-1">Your wishlist is empty</p>
                                        <p className="text-nature-muted dark:text-night-muted text-xs mb-5">Save items you love to find them easily later.</p>
                                        <Link to="/shop" className="inline-block bg-nature-olive dark:bg-nature-sage text-white dark:text-night-bg font-medium px-5 py-2.5 rounded-md text-xs tracking-wider uppercase hover:bg-nature-olive-dark dark:hover:bg-nature-sage/80 transition-colors">
                                            Explore Shop
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'reviews' && (
                            <div className={`${panelClass} p-6`}>
                                <h3 className="text-nature-olive dark:text-nature-sage text-[11px] tracking-[0.25em] uppercase font-medium mb-5">My Reviews</h3>

                                {reviews.length > 0 ? (
                                    <div className="space-y-4">
                                        <div className="space-y-4">
                                            {reviews
                                                .slice((reviewsPage - 1) * ITEMS_PER_PAGE, reviewsPage * ITEMS_PER_PAGE)
                                                .map(review => {
                                                    const isEditing = editingReviewId === review.id;
                                                    return (
                                                        <div key={review.id} className="bg-white/70 dark:bg-night-bg border border-nature-border/50 dark:border-night-border rounded-lg p-4 transition-colors duration-300">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <Link to={`/products/${review.product_id}`} className="font-serif text-nature-dark dark:text-night-text text-sm hover:text-nature-olive dark:hover:text-nature-sage transition-colors">
                                                                    {review.product_name || `Product #${review.product_id}`}
                                                                </Link>
                                                                <span className="text-nature-muted dark:text-night-muted text-xs">
                                                                    {new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                                </span>
                                                            </div>

                                                            {isEditing ? (
                                                                <div className="space-y-3 mt-3 pt-3 border-t border-nature-border/40 dark:border-night-border">
                                                                    <div>
                                                                        <label className={labelClass}>Rating</label>
                                                                        <div className="flex items-center gap-1 mt-1">
                                                                            {[1, 2, 3, 4, 5].map(star => (
                                                                                <button
                                                                                    type="button"
                                                                                    key={star}
                                                                                    onClick={() => setEditRating(star)}
                                                                                    className="p-0.5 text-nature-muted dark:text-night-muted hover:text-amber-500 transition-colors"
                                                                                >
                                                                                    <Star className={`w-5 h-5 ${star <= editRating ? 'text-amber-500 fill-amber-500' : ''}`} />
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
                                                                            maxLength={1000}
                                                                            className="w-full bg-transparent border border-nature-border/80 dark:border-night-border focus:border-nature-olive dark:focus:border-nature-sage rounded-md p-2.5 text-nature-dark dark:text-night-text text-sm outline-none transition-colors"
                                                                        />
                                                                    </div>
                                                                    {editError && <p className="text-red-600 dark:text-red-400 text-xs">{editError}</p>}
                                                                    <div className="flex items-center gap-2">
                                                                        <button
                                                                            type="button"
                                                                            disabled={editSaving}
                                                                            onClick={() => handleSaveReview(review.id)}
                                                                            className="bg-nature-olive dark:bg-nature-sage text-white dark:text-night-bg font-medium px-4 py-1.5 rounded text-xs tracking-wider uppercase hover:bg-nature-olive-dark dark:hover:bg-nature-sage/80 disabled:opacity-50 transition-colors"
                                                                        >
                                                                            {editSaving ? 'Saving...' : 'Save'}
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            onClick={cancelEditReview}
                                                                            className="text-nature-muted dark:text-night-muted hover:text-nature-dark dark:hover:text-night-text text-xs uppercase tracking-wide transition-colors px-2 py-1.5"
                                                                        >
                                                                            Cancel
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div>
                                                                    <div className="flex items-center gap-1 mb-2">
                                                                        {[1, 2, 3, 4, 5].map(star => (
                                                                            <Star
                                                                                key={star}
                                                                                className={`w-3.5 h-3.5 ${star <= review.rating ? 'text-amber-500 fill-amber-500' : 'text-nature-border dark:text-night-border'}`}
                                                                            />
                                                                        ))}
                                                                    </div>
                                                                    {review.comment && (
                                                                        <p className="text-nature-muted dark:text-night-muted text-sm mb-3">{review.comment}</p>
                                                                    )}
                                                                    <div className="flex items-center gap-4 pt-2 border-t border-nature-border/40 dark:border-night-border">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => startEditReview(review)}
                                                                            className="flex items-center gap-1 text-xs uppercase tracking-wider text-nature-olive dark:text-nature-sage hover:underline font-medium"
                                                                        >
                                                                            <Pencil className="w-3.5 h-3.5" /> Edit
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => confirmDeleteReview(review)}
                                                                            className="flex items-center gap-1 text-xs uppercase tracking-wider text-red-600 dark:text-red-400 hover:underline font-medium"
                                                                        >
                                                                            <Trash2 className="w-3.5 h-3.5" /> Delete
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                        </div>

                                        <Pagination
                                            currentPage={reviewsPage}
                                            totalPages={Math.ceil(reviews.length / ITEMS_PER_PAGE)}
                                            onPageChange={setReviewsPage}
                                        />
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <MessageSquare className="w-10 h-10 text-nature-muted/40 dark:text-night-muted mx-auto mb-3" strokeWidth={1.5} />
                                        <p className="text-nature-dark dark:text-night-text font-serif text-lg mb-1">No reviews yet</p>
                                        <p className="text-nature-muted dark:text-night-muted text-xs mb-5">Share your thoughts on products you've purchased.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className={`${panelClass} p-6`}>
                                <h3 className="text-nature-olive dark:text-nature-sage text-[11px] tracking-[0.25em] uppercase font-medium mb-5">Security Settings</h3>

                                <div className="space-y-6">
                                    <div className="bg-white/70 dark:bg-night-bg border border-nature-border/50 dark:border-night-border rounded-lg p-5 transition-colors duration-300">
                                        <div className="flex items-center justify-between flex-wrap gap-4">
                                            <div>
                                                <h4 className="text-nature-dark dark:text-night-text font-medium text-sm mb-1">Password</h4>
                                                <p className="text-nature-muted dark:text-night-muted text-xs">Update your password regularly to keep your account secure.</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => { setShowPasswordForm(v => !v); setPasswordSuccess(''); setPasswordFormError(''); }}
                                                className="bg-nature-sage/30 dark:bg-night-border text-nature-olive dark:text-nature-sage font-medium px-4 py-2 rounded-md text-xs tracking-wider uppercase hover:bg-nature-sage/50 dark:hover:bg-night-border/80 transition-colors"
                                            >
                                                {showPasswordForm ? 'Cancel' : 'Change Password'}
                                            </button>
                                        </div>

                                        {passwordSuccess && (
                                            <div className="mt-4 bg-nature-sage/20 dark:bg-nature-sage/10 border border-nature-sage/40 dark:border-nature-sage/30 rounded-md px-4 py-3 flex items-center gap-2">
                                                <CheckCircle className="w-4 h-4 text-nature-olive dark:text-nature-sage flex-shrink-0" strokeWidth={1.5} />
                                                <p className="text-nature-olive dark:text-nature-sage text-sm">{passwordSuccess}</p>
                                            </div>
                                        )}

                                        {showPasswordForm && (
                                            <form onSubmit={handleChangePassword} className="mt-5 pt-5 border-t border-nature-border/40 dark:border-night-border space-y-4" noValidate>
                                                <div>
                                                    <label className={labelClass}>Current Password *</label>
                                                    <input
                                                        type="password"
                                                        value={currentPassword}
                                                        onChange={e => setCurrentPassword(e.target.value)}
                                                        className={inputClass}
                                                    />
                                                    <FieldError errors={passwordErrors} field="current_password" />
                                                </div>

                                                <div>
                                                    <label className={labelClass}>New Password *</label>
                                                    <input
                                                        type="password"
                                                        value={newPassword}
                                                        onChange={e => setNewPassword(e.target.value)}
                                                        className={inputClass}
                                                    />
                                                    <div className="mt-2 space-y-1">
                                                        {passwordChecks.map((check, i) => (
                                                            <p key={i} className={`text-[11px] flex items-center gap-1.5 ${check.pass ? 'text-nature-olive dark:text-nature-sage font-medium' : 'text-nature-muted dark:text-night-muted'}`}>
                                                                <span className={`w-1.5 h-1.5 rounded-full ${check.pass ? 'bg-nature-olive dark:bg-nature-sage' : 'bg-nature-border dark:bg-night-border'}`} />
                                                                {check.label}
                                                            </p>
                                                        ))}
                                                    </div>
                                                    <FieldError errors={passwordErrors} field="new_password" />
                                                </div>

                                                <div>
                                                    <label className={labelClass}>Confirm New Password *</label>
                                                    <input
                                                        type="password"
                                                        value={confirmPassword}
                                                        onChange={e => setConfirmPassword(e.target.value)}
                                                        className={inputClass}
                                                    />
                                                </div>

                                                {passwordFormError && (
                                                    <p className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-950/35 border border-red-200 dark:border-red-900/40 px-4 py-3 rounded-md">{passwordFormError}</p>
                                                )}

                                                <div className="flex items-center gap-3 pt-2">
                                                    <button
                                                        type="submit"
                                                        disabled={passwordLoading}
                                                        className="bg-nature-olive dark:bg-nature-sage text-white dark:text-night-bg font-medium px-5 py-2.5 rounded-md text-xs tracking-wider uppercase hover:bg-nature-olive-dark dark:hover:bg-nature-sage/80 disabled:opacity-50 transition-colors"
                                                    >
                                                        {passwordLoading ? 'Updating...' : 'Update Password'}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPasswordForm(false)}
                                                        className="text-nature-muted dark:text-night-muted hover:text-nature-dark dark:hover:text-night-text text-xs uppercase tracking-wide transition-colors px-2 py-2.5"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </form>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                    </main>

                </div>

            </div>
        </div>
    );
}