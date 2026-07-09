import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Lock, Wallet, ShoppingBag, Pencil, User, Phone, MapPin, Check, Ban } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api';

const formatMMK = (amount) =>
  new Intl.NumberFormat('en-MM', { style: 'currency', currency: 'MMK', minimumFractionDigits: 0 }).format(amount ?? 0);

export default function CheckoutPage() {
  const { items, setItems, refreshCart } = useCart();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [walletBalance, setWalletBalance] = useState(null);

  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [editingInfo, setEditingInfo] = useState(false);

  const [form, setForm] = useState({
    full_name: '',
    email: user?.email ?? '',
    phone: '',
    address: '',
    payment_method: 'cash',
  });

  const itemCount = useMemo(() => items.reduce((acc, item) => acc + item.quantity, 0), [items]);

  const total = useMemo(
    () => Math.round(items.reduce((acc, item) => acc + Number(item.product_variant?.sale_price ?? 0) * item.quantity, 0)),
    [items]
  );

  useEffect(() => {
    if (!user) return;

    api.get('/user/profile')
      .then(({ data }) => {
        if (!data) return;
        setWalletBalance(data.wallet_balance ?? 0);
        setProfile(data);
        setForm(f => ({
          ...f,
          full_name: data.name ?? f.full_name,
          email: data.email ?? f.email,
          phone: data.phone_number ?? f.phone,
          address: data.address ?? f.address,
        }));
        setEditingInfo(!(data.name && data.phone_number && data.address));
      })
      .catch(err => {
        console.error('Failed to load profile details:', err);
        setEditingInfo(true);
      })
      .finally(() => setProfileLoading(false));
  }, [user]);

  function update(field, value) {
    setForm(f => ({ ...f, [field]: value }));
  }

  function handleSaveInfo() {
    // Locks editing mode and keeps the current state inputs visible for review
    setEditingInfo(false);
  }

  function cancelEditInfo() {
    if (!profile) return;
    setForm(f => ({
      ...f,
      full_name: profile.name ?? f.full_name,
      phone: profile.phone_number ?? f.phone,
      address: profile.address ?? f.address,
    }));
    setEditingInfo(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!user || items.length === 0) return;
    
    // If user submits while inputs are still active, lock the review mode
    if (editingInfo) {
      setEditingInfo(false);
      return;
    }

    setLoading(true);
    setError('');

    if (form.payment_method === 'virtual_currency') {
      if (walletBalance === null || walletBalance < total) {
        setError(`Insufficient wallet balance. You have ${formatMMK(walletBalance ?? 0)} but need ${formatMMK(total)}.`);
        setLoading(false);
        return;
      }
    }

    let response;
    try {
      const payload = {
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        address: form.address,
        payment_method: form.payment_method,
        total_amount: total,
        items: items.map(item => ({
          product_variant_id: item.product_variant?.id ?? item.product_variant_id,
          quantity: item.quantity,
          price: Math.round(Number(item.product_variant?.sale_price ?? 0)),
        })),
      };

      response = await api.post('/orders', payload);
    } catch (err) {
      console.error('Order submission failed:', err.response ?? err);
      const validationErrors = err.response?.data?.errors;
      if (validationErrors) {
        setError(Object.values(validationErrors).flat().join(' '));
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response) {
        setError(`Order failed (${err.response.status}). Please try again.`);
      } else {
        setError('Could not reach the server. Check your connection and try again.');
      }
      setLoading(false);
      return;
    }

    if (!response.data || !response.data.order_id) {
      setError('Order was placed, but the server returned an unexpected response.');
      setLoading(false);
      return;
    }

    setItems([]);
    refreshCart?.(false)?.catch?.(err => {
      console.warn('Order placed, but syncing the cart view failed:', err);
    });

    navigate(`/orders/${response.data.order_id}`);
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-nature-bg flex items-center justify-center">
        <div className="w-6 h-6 border border-nature-olive border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-nature-bg pt-24 flex items-center justify-center">
        <div className="text-center max-w-sm px-4">
          <ShoppingBag className="w-10 h-10 text-nature-sand mx-auto mb-6" strokeWidth={1} />
          <p className="text-[11px] uppercase tracking-[0.35em] text-nature-olive font-medium mb-3">Almost There</p>
          <h2 className="font-serif text-2xl text-nature-dark mb-3">Sign in to complete your order</h2>
          <p className="text-nature-muted text-sm mb-8">Your cart items are already saved. Just sign in or create an account to finish checking out.</p>
          <div className="flex flex-col gap-3">
            <Link to="/login?redirect=%2Fcheckout" className="bg-nature-olive hover:bg-nature-olive-dark text-white font-medium px-8 py-3.5 transition-colors tracking-[0.2em] text-xs rounded-md">
              SIGN IN
            </Link>
            <Link to="/register?redirect=%2Fcheckout" className="border border-nature-dark text-nature-dark hover:bg-nature-dark hover:text-white font-medium px-8 py-3.5 transition-colors tracking-[0.2em] text-xs rounded-md">
              CREATE ACCOUNT
            </Link>
          </div>
          <p className="mt-6 text-nature-muted text-xs">
            <Link to="/cart" className="text-nature-olive hover:text-nature-olive-dark transition-colors">← Back to cart</Link>
          </p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-nature-bg pt-24 flex items-center justify-center">
        <div className="text-center">
          <p className="text-nature-muted mb-4">Your cart is empty.</p>
          <Link to="/products" className="text-nature-olive hover:text-nature-olive-dark transition-colors text-xs uppercase tracking-[0.15em]">Shop now</Link>
        </div>
      </div>
    );
  }

  const walletInsufficient = form.payment_method === 'virtual_currency' && walletBalance !== null && walletBalance < total;
  const hasSavedInfo = Boolean(profile?.name && profile?.phone_number && profile?.address);

  const inputClass = "w-full bg-transparent border-b border-nature-border/80 focus:border-nature-olive rounded-none px-0 py-1.5 text-nature-dark text-sm outline-none transition-colors placeholder:text-nature-muted/60";
  const disabledInputClass = "w-full bg-transparent border-b border-nature-border/40 px-0 py-1.5 text-nature-muted text-sm outline-none cursor-not-allowed opacity-70 select-none";
  const labelClass = "block text-nature-muted text-[10px] tracking-[0.2em] uppercase mb-1";
  const panelClass = "bg-white/45 backdrop-blur-xl border border-white/60 rounded-lg shadow-[0_4px_24px_-12px_rgba(44,53,39,0.15)]";

  return (
    <div className="min-h-screen bg-nature-bg text-nature-dark pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        <Link to="/cart" className="inline-flex items-center gap-2 text-nature-muted hover:text-nature-olive transition-colors text-xs uppercase tracking-[0.15em] mb-6">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Cart
        </Link>
        <p className="text-[11px] uppercase tracking-[0.35em] text-nature-olive font-medium mb-2">Almost There</p>
        <div className="flex items-baseline justify-between mb-8 pb-5 border-b border-nature-border/70">
          <h1 className="font-serif text-3xl sm:text-4xl text-nature-dark tracking-tight">Checkout</h1>
          <span className="text-nature-muted text-xs uppercase tracking-[0.15em]">
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </span>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-6">

            {/* Delivery Form Container */}
            <div className={`${panelClass} p-6`}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-nature-olive text-[11px] tracking-[0.25em] uppercase font-medium">Delivery Details</h3>
                {!editingInfo && (
                  <button
                    type="button"
                    onClick={() => setEditingInfo(true)}
                    className="flex items-center gap-1.5 text-nature-muted hover:text-nature-olive text-xs uppercase tracking-wide transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" strokeWidth={1.5} /> Modify Information
                  </button>
                )}
              </div>

              {profileLoading ? (
                <div className="space-y-4 animate-pulse">
                  <div className="h-4 bg-white/60 w-1/2 rounded" />
                  <div className="h-4 bg-white/60 w-2/3 rounded" />
                  <div className="h-4 bg-white/60 w-3/4 rounded" />
                </div>
              ) : !editingInfo ? (
                // Confirmed View: User sees their inputs cleanly for visual layout validation
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <User className="w-4 h-4 text-nature-olive mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                    <div>
                      <p className="text-nature-dark text-sm font-medium">{form.full_name || 'N/A'}</p>
                      <p className="text-nature-muted text-xs">{form.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="w-4 h-4 text-nature-olive mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                    <p className="text-nature-dark text-sm">{form.phone || 'N/A'}</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-nature-olive mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                    <p className="text-nature-dark text-sm">{form.address || 'N/A'}</p>
                  </div>
                </div>
              ) : (
                // Editable Fields Form
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-3.5">
                    <div className="sm:col-span-2">
                      <label className={labelClass}>Full Name *</label>
                      <input required value={form.full_name} onChange={e => update('full_name', e.target.value)}
                        className={inputClass}
                        placeholder="Ma Aye Aye" />
                    </div>
                    
                    <div>
                      <label className={`${labelClass} flex items-center gap-1`}>
                        Email <Ban className="w-2.5 h-2.5 text-red-400" />
                      </label>
                      <div className="relative group">
                        <input disabled type="email" value={form.email}
                          className={disabledInputClass}
                          title="Email address cannot be changed" />
                      </div>
                    </div>

                    <div>
                      <label className={labelClass}>Phone *</label>
                      <input required value={form.phone} onChange={e => update('phone', e.target.value)}
                        className={inputClass}
                        placeholder="09 xxx xxx xxx" />
                    </div>

                    <div className="sm:col-span-2">
                      <label className={labelClass}>Delivery Address *</label>
                      <textarea required rows={2} value={form.address} onChange={e => update('address', e.target.value)}
                        className={`${inputClass} resize-none leading-snug`}
                        placeholder="No. 1, Street Name, Township, City" />
                    </div>
                  </div>

                  <div className="mt-5 flex items-center gap-4 border-t border-nature-border/40 pt-4">
                    <button type="button" onClick={handleSaveInfo}
                      className="bg-nature-olive hover:bg-nature-olive-dark text-white font-medium px-5 py-2 text-xs tracking-wider uppercase transition-colors rounded">
                      Save Details
                    </button>
                    {hasSavedInfo && (
                      <button type="button" onClick={cancelEditInfo}
                        className="text-nature-muted hover:text-nature-dark text-xs uppercase tracking-wide transition-colors">
                        Cancel
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Main form submit handles payment selection and submission execution */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className={`${panelClass} p-6`}>
                <h3 className="text-nature-olive text-[11px] tracking-[0.25em] uppercase font-medium mb-5">Payment Method</h3>
                <div className="divide-y divide-nature-border/60">
                  {[
                    { value: 'cash', label: 'Cash on Delivery', desc: 'Pay when your order arrives' },
                    {
                      value: 'virtual_currency',
                      label: 'Scentoria Virtual Wallet',
                      desc: walletBalance !== null
                        ? `Balance: ${formatMMK(walletBalance)}${walletInsufficient ? ' — insufficient for this order' : ''}`
                        : 'Loading balance...',
                      extra: walletBalance !== null && walletInsufficient,
                    },
                  ].map(opt => (
                    <label key={opt.value}
                      className="flex items-start gap-4 py-4 first:pt-0 last:pb-0 cursor-pointer">
                      <input type="radio" name="payment" value={opt.value}
                        checked={form.payment_method === opt.value}
                        onChange={() => update('payment_method', opt.value)}
                        className="mt-1 accent-nature-olive" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {opt.value === 'virtual_currency' && <Wallet className="w-3.5 h-3.5 text-nature-blue" strokeWidth={1.5} />}
                          <p className="text-nature-dark text-sm font-medium">{opt.label}</p>
                          {form.payment_method === opt.value && <Check className="w-3.5 h-3.5 text-nature-olive ml-auto" strokeWidth={1.5} />}
                        </div>
                        <p className={`text-xs mt-1 ${opt.extra ? 'text-red-500' : 'text-nature-muted'}`}>{opt.desc}</p>
                        {opt.value === 'virtual_currency' && form.payment_method === 'virtual_currency' && !walletInsufficient && walletBalance !== null && (
                          <p className="text-nature-olive text-xs mt-1.5">After payment: {formatMMK(walletBalance - total)} remaining</p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {error && <p className="text-red-600 text-sm bg-red-50/80 backdrop-blur-sm border border-red-200 px-4 py-3 rounded-md">{error}</p>}

              <button type="submit" disabled={loading || walletInsufficient || editingInfo}
                className="w-full bg-nature-olive hover:bg-nature-olive-dark disabled:opacity-50 text-white font-medium py-3.5 transition-colors tracking-[0.2em] text-xs flex items-center justify-center gap-2 rounded-md">
                <Lock className="w-3.5 h-3.5" strokeWidth={1.5} />
                {loading ? 'PLACING ORDER...' : 'PLACE ORDER'}
              </button>
            </form>
          </div>

          {/* Right Column Order Summary Sidecar */}
          <div className={`${panelClass} p-6 h-fit xl:sticky xl:top-24`}>
            <p className="text-[11px] uppercase tracking-[0.25em] text-nature-olive font-medium mb-5">Order Summary</p>
            <div className="space-y-3 mb-5 max-h-64 overflow-y-auto pr-1">
              {items.map(item => {
                const variant = item.product_variant;
                if (!variant) return null;
                return (
                  <div key={item.id} className="flex justify-between text-sm">
                    <div className="mr-2 min-w-0">
                      <p className="text-nature-dark truncate">{variant.product?.name ?? 'Perfume Product'}</p>
                      <p className="text-nature-muted text-xs uppercase tracking-wide">{variant.size ?? 'Variant'} × {item.quantity}</p>
                    </div>
                    <span className="text-nature-dark flex-shrink-0">{formatMMK(variant.sale_price * item.quantity)}</span>
                  </div>
                );
              })}
            </div>
            <div className="border-t border-nature-border/70 pt-4 space-y-3">
              <div className="flex justify-between items-baseline">
                <span className="text-nature-dark font-medium text-xs tracking-[0.15em] uppercase">Total</span>
                <span className="text-nature-olive font-serif font-semibold text-2xl">{formatMMK(total)}</span>
              </div>
              {form.payment_method === 'virtual_currency' && walletBalance !== null && (
                <div className="flex justify-between text-xs">
                  <span className="text-nature-muted uppercase tracking-wide">Wallet balance</span>
                  <span className={walletInsufficient ? 'text-red-500' : 'text-nature-olive'}>{formatMMK(walletBalance)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}