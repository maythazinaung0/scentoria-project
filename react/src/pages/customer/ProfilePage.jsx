import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    UserCircle, ShoppingBag, ChevronDown, ChevronUp,
    Clock, CheckCircle, XCircle, Package, ArrowRight, Hourglass,
    Wallet, Plus, Send, Star, MessageSquare  
} from 'lucide-react';
import { useAuth } from "../../contexts/AuthContext";

  
const formatMMK = (amount) => {
    return new Intl.NumberFormat('en-MM', { style: 'currency', currency: 'MMK', minimumFractionDigits: 0 }).format(amount);
};

 
const API_BASE_URL = 'http://localhost/api';

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
};

const PAYMENT_METHOD_LABELS = {
    kbzpay: 'KBZ Pay',
    cbpay: 'CB Pay',
};

export default function ProfilePage() {
    const { user, isAdmin, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [reviews, setReviews] = useState([]);   
    const [walletBalance, setWalletBalance] = useState(0);
    const [topupRequests, setTopupRequests] = useState([]);
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    const [topupAmount, setTopupAmount] = useState('');
    const [topupMethod, setTopupMethod] = useState('kbzpay');
    const [topupLoading, setTopupLoading] = useState(false);
    const [topupError, setTopupError] = useState('');
    const [topupSuccess, setTopupSuccess] = useState(false);
    const [showTopupForm, setShowTopupForm] = useState(false);
    const [topupImage, setTopupImage] = useState(null);

    const authenticatedFetch = async (endpoint, options = {}) => {
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            ...options.headers,
        };

        const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });

        if (response.status === 401) {
            navigate('/login');
            throw new Error('Unauthorized');
        }

        return response;
    };

    useEffect(() => {
        if (authLoading) return;
        if (!user) { navigate('/login'); return; }
        if (isAdmin) { navigate('/admin'); return; }
        loadData();
    }, [user, isAdmin, authLoading]);

    async function loadData() {
        try {
            const [profileRes, ordersRes, topupsRes, reviewsRes] = await Promise.all([
                authenticatedFetch('/user/profile'),
                authenticatedFetch('/orders'),
                authenticatedFetch('/wallet-topups'),
                authenticatedFetch('/reviews')  
            ]);

            const profile = await profileRes.json();
            const orderData = await ordersRes.json();
            const topupData = await topupsRes.json();
            const reviewData = await reviewsRes.json();

            setWalletBalance(profile?.wallet_balance ?? 0);
            setOrders(orderData ?? []);
            setTopupRequests(topupData ?? []);
            setReviews(reviewData ?? []);  

        } catch (error) {
            console.error("Error connecting with Laravel backend APIs:", error);
        } finally {
            setLoading(false);
        }
    }

    async function submitTopup(e) {
        e.preventDefault();
        const amount = parseInt(topupAmount.replace(/,/g, ''), 10);
        if (!amount || amount < 1000) { setTopupError('Minimum top-up amount is 1,000 MMK.'); return; }
        if (amount > 10000000) { setTopupError('Maximum top-up request is 10,000,000 MMK.'); return; }

        setTopupLoading(true);
        setTopupError('');

        try {
            const formData = new FormData();
            formData.append('deposit_amount', amount);
            formData.append('topup_channel', topupMethod);
            if (topupImage) {
                formData.append('transaction_image', topupImage);
            }

            const token = localStorage.getItem('token');

            const response = await fetch('http://localhost/api/wallet-topups', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: formData
            });

            const resData = await response.json();

            if (!response.ok) {
                throw new Error(resData.message || 'Failed to submit request.');
            }

            setTopupAmount('');
            setTopupMethod('kbzpay');
            setTopupImage(null);
            setTopupSuccess(true);
            setShowTopupForm(false);
            setTimeout(() => setTopupSuccess(false), 4000);
            loadData();
        } catch (err) {
            setTopupError(err.message || 'Failed to submit request. Please try again.');
        } finally {
            setTopupLoading(false);
        }
    }

    const displayName = user?.name || user?.email?.split('@')[0] || 'Customer';
    const pendingTopup = topupRequests.filter(r => r.status === 'pending').reduce((s, r) => s + r.deposit_amount, 0);

    return (
        <div className="min-h-screen bg-nature-bg text-nature-dark pt-24 pb-20">
            <div className="max-w-3xl mx-auto px-4 space-y-10">

                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-nature-sage/30 border border-nature-border rounded-2xl flex items-center justify-center flex-shrink-0">
                        <UserCircle className="w-9 h-9 text-nature-olive" />
                    </div>
                    <div>
                        <h1 className="font-serif text-3xl text-nature-dark">Welcome back, {displayName}</h1>
                        <p className="text-nature-muted text-sm mt-0.5">{user?.email}</p>
                    </div>
                </div>

                {/* --- VIRTUAL WALLET SECTION --- */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <Wallet className="w-4 h-4 text-nature-olive" />
                        <h2 className="text-nature-olive text-sm tracking-widest uppercase">Virtual Wallet</h2>
                    </div>

                    <div className="bg-nature-card border border-nature-border rounded-2xl p-6 mb-4">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <p className="text-nature-muted text-xs tracking-widest uppercase mb-1">Available Balance</p>
                                <p className="font-serif text-4xl text-nature-olive">{formatMMK(walletBalance)}</p>
                                {pendingTopup > 0 && (
                                    <p className="text-nature-tan text-xs mt-1.5 flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        +{formatMMK(pendingTopup)} pending approval
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={() => { setShowTopupForm(v => !v); setTopupError(''); }}
                                className="flex items-center gap-2 bg-nature-sage/30 border border-nature-border hover:bg-nature-sage/50 text-nature-olive px-4 py-2.5 rounded-xl text-sm transition-colors"
                            >
                                <Plus className="w-4 h-4" /> Top Up Wallet
                            </button>
                        </div>

                        {showTopupForm && (
                            <form onSubmit={submitTopup} className="mt-5 pt-5 border-t border-nature-border space-y-3">
                                <p className="text-nature-dark text-xs tracking-wider uppercase">Request Top-Up</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-nature-muted text-xs mb-1">Amount (MMK) *</label>
                                        <input
                                            required
                                            type="number"
                                            min={1000}
                                            step={1000}
                                            value={topupAmount}
                                            onChange={e => setTopupAmount(e.target.value)}
                                            placeholder="e.g. 50000"
                                            className="w-full bg-nature-bg border border-nature-border focus:border-nature-olive/50 rounded-lg px-4 py-2.5 text-nature-dark text-sm outline-none transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-nature-muted text-xs mb-1">Payment Method *</label>
                                        <div className="flex gap-2">
                                            {[
                                                { value: 'kbzpay', label: 'KBZ Pay', icon: 'K' },
                                                { value: 'cbpay', label: 'CB Pay', icon: 'C' }
                                            ].map(m => (
                                                <button
                                                    key={m.value}
                                                    type="button"
                                                    onClick={() => setTopupMethod(m.value)}
                                                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs transition-colors ${topupMethod === m.value
                                                            ? 'bg-nature-sage/30 border-nature-olive/50 text-nature-olive'
                                                            : 'border-nature-border text-nature-muted hover:border-nature-tan hover:text-nature-dark'
                                                        }`}
                                                >
                                                    <span className="w-5 h-5 rounded-full bg-nature-bg flex items-center justify-center text-[10px] font-bold text-nature-subtle">{m.icon}</span>
                                                    {m.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-nature-muted text-xs mb-1">Transaction Screenshot (Image) *</label>
                                        <input
                                            required
                                            type="file"
                                            accept="image/*"
                                            onChange={e => setTopupImage(e.target.files[0])}
                                            className="w-full bg-nature-bg border border-nature-border focus:border-nature-olive/50 rounded-lg px-4 py-2 text-nature-dark text-sm outline-none file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-nature-sage/30 file:text-nature-olive hover:file:bg-nature-sage/50"
                                        />
                                    </div>
                                </div>
                                {topupError && <p className="text-red-600 text-xs">{topupError}</p>}
                                <div className="flex gap-2">
                                    <button type="submit" disabled={topupLoading} className="flex items-center gap-2 bg-nature-olive hover:bg-nature-olive-dark disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors">
                                        <Send className="w-4 h-4" /> {topupLoading ? 'Sending...' : 'Send Request'}
                                    </button>
                                    <button type="button" onClick={() => setShowTopupForm(false)} className="px-4 py-2.5 text-nature-muted hover:text-nature-dark text-sm transition-colors">Cancel</button>
                                </div>
                            </form>
                        )}

                        {topupSuccess && (
                            <div className="mt-4 bg-nature-sage/20 border border-nature-sage/40 rounded-xl px-4 py-3 flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-nature-olive flex-shrink-0" />
                                <p className="text-nature-olive text-sm">Top-up request sent! Admin will review it shortly.</p>
                            </div>
                        )}
                    </div>

                    {topupRequests.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-nature-muted text-xs tracking-wider uppercase mb-2">Request History</p>
                            {topupRequests.slice(0, 5).map(req => {
                                const statusStyle = TOPUP_STATUS_STYLES[req.status] ?? 'bg-nature-parchment text-nature-muted';
                                return (
                                    <div key={req.id} className="flex items-center justify-between bg-nature-card border border-nature-border rounded-xl px-4 py-3">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="text-nature-dark text-sm font-medium">+{formatMMK(req.deposit_amount)}</p>
                                                <span className="text-nature-muted text-xs bg-nature-sage/20 px-1.5 py-0.5 rounded">
                                                    {PAYMENT_METHOD_LABELS[req.topup_channel] ?? req.topup_channel}
                                                </span>
                                            </div>
                                            <p className="text-nature-muted text-xs">{new Date(req.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                        </div>
                                        <span className={`text-xs px-2.5 py-1 rounded-full capitalize ${statusStyle}`}>{req.status}</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>

                {/* --- ORDER HISTORY SECTION --- */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <ShoppingBag className="w-4 h-4 text-nature-olive" />
                        <h2 className="text-nature-olive text-sm tracking-widest uppercase">Order History</h2>
                        <span className="ml-auto text-nature-muted text-xs">{orders.length} order{orders.length !== 1 ? 's' : ''}</span>
                    </div>

                    {orders.length === 0 ? (
                        <div className="bg-nature-card border border-nature-border rounded-2xl p-10 text-center">
                            <Package className="w-10 h-10 text-nature-sand mx-auto mb-3" />
                            <p className="text-nature-muted text-sm mb-4">You haven't placed any orders yet.</p>
                            <Link to="/products" className="text-nature-olive hover:text-nature-olive-dark text-sm transition-colors">Browse fragrances</Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {orders.map(order => {
                                const StatusIcon = STATUS_ICONS[order.status] ?? Clock;
                                const isExpanded = expandedOrder === order.id;
                                return (
                                    <div key={order.id} className="bg-nature-card border border-nature-border rounded-2xl overflow-hidden">
                                        <button className="w-full flex items-center justify-between px-5 py-4 hover:bg-nature-sage/10 transition-colors text-left" onClick={() => setExpandedOrder(isExpanded ? null : order.id)}>
                                            <div>
                                                <p className="text-nature-dark text-sm font-medium">Order #<span className="font-mono text-nature-muted text-xs">{order.id}</span></p>
                                                <p className="text-nature-muted text-xs mt-0.5">{new Date(order.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-nature-olive font-semibold text-sm">{formatMMK(order.total_amount)}</span>
                                                <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full ${STATUS_STYLES[order.status]}`}>
                                                    <StatusIcon className="w-3 h-3" />
                                                    <span className="capitalize hidden sm:inline">{order.status}</span>
                                                </span>
                                                {isExpanded ? <ChevronUp className="w-4 h-4 text-nature-muted" /> : <ChevronDown className="w-4 h-4 text-nature-muted" />}
                                            </div>
                                        </button>
                                        {isExpanded && (
                                            <div className="border-t border-nature-border px-5 py-4 space-y-3">
                                                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-nature-muted mb-3">
                                                    <span className="col-span-2">Address: <span className="text-nature-dark">{order.address}</span></span>
                                                    <span>Payment Method: <span className="text-nature-dark capitalize">{order.payment_method?.replace('_', ' ')}</span></span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>

                {/* --- REVIEWS SECTION --- */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <MessageSquare className="w-4 h-4 text-nature-olive" />
                        <h2 className="text-nature-olive text-sm tracking-widest uppercase">My Reviews</h2>
                        <span className="ml-auto text-nature-muted text-xs">{reviews.length} reviewed</span>
                    </div>

                    {reviews.length === 0 ? (
                        <div className="bg-nature-card border border-nature-border rounded-2xl p-10 text-center">
                            <MessageSquare className="w-10 h-10 text-nature-sand mx-auto mb-3" />
                            <p className="text-nature-muted text-sm mb-4">You haven't left any reviews yet.</p>
                            <Link to="/products" className="text-nature-olive hover:text-nature-olive-dark text-sm transition-colors">Browse products to review</Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {reviews.map(review => (
                                <div key={review.id} className="bg-nature-card border border-nature-border rounded-2xl p-5 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-nature-dark font-medium text-sm">{review.product_name || `Product #${review.product_id}`}</h3>
                                        <div className="flex items-center gap-0.5">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'text-amber-500 fill-amber-500' : 'text-nature-sand'}`} />
                                            ))}
                                        </div>
                                    </div>
                                    {review.title && <p className="text-nature-dark font-semibold text-xs mt-1">{review.title}</p>}
                                    {review.comment && <p className="text-nature-muted text-xs bg-nature-bg/50 p-2.5 rounded-lg border border-nature-border/40 italic">"{review.comment}"</p>}
                                    <p className="text-[10px] text-nature-subtle text-right">{new Date(review.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

            </div>
        </div>
    );
}