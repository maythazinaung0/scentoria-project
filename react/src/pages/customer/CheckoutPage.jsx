import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Lock, Wallet, ShoppingBag } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios'; 

const API_BASE_URL = 'http://localhost/api';

const formatMMK = (amount) => new Intl.NumberFormat('en-MM', { style: 'currency', currency: 'MMK' }).format(amount);

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [walletBalance, setWalletBalance] = useState(null);
  const [form, setForm] = useState({
    full_name: '',
    email: user?.email ?? '',
    phone: '',
    address: '',
    payment_method: 'cash',
  });

  useEffect(() => {
    if (!user) return;

    axios.get(`${API_BASE_URL}/user/profile`)
      .then(({ data }) => {
        if (data) {
          setWalletBalance(data.wallet_balance ?? 0);
          setForm(f => ({
            ...f,
            full_name: data.name ?? f.full_name,
            phone: data.phone_number ?? f.phone,
            address: data.address ?? f.address,
          }));
        }
      })
      .catch(err => {
        console.error("Failed to load profile details:", err);
        setError('Failed to fetch profile data from server.');
      });
  }, [user]);

  function update(field, value) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!user || items.length === 0) return;
    setLoading(true);
    setError('');

    if (form.payment_method === 'virtual_currency') {
      if (walletBalance === null || walletBalance < total) {
        setError(`Insufficient wallet balance. You have ${formatMMK(walletBalance ?? 0)} but need ${formatMMK(total)}.`);
        setLoading(false);
        return;
      }
    }

    try {
      const payload = {
        address: form.address,
        payment_method: form.payment_method,
        total_amount: total,
        items: items.map(item => ({
          product_variant_id: item.product_variant_id,
          quantity: item.quantity,
          price: item.price
        }))
      };

      const response = await axios.post(`${API_BASE_URL}/orders`, payload);
      
      if (response.data && response.data.order_id) {
        await clearCart();
        navigate(`/order-confirmation/${response.data.order_id}`);
      } else {
        throw new Error('Server returned an invalid response.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-nature-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-nature-olive border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-nature-bg pt-24 flex items-center justify-center">
        <div className="text-center max-w-sm px-4">
          <ShoppingBag className="w-12 h-12 text-nature-sand mx-auto mb-4" />
          <h2 className="font-serif text-2xl text-nature-dark mb-2">Sign in to complete your order</h2>
          <p className="text-nature-muted text-sm mb-6">Your cart items are already saved. Just sign in or create an account to finish checking out.</p>
          <div className="flex flex-col gap-3">
            <Link to="/login?redirect=%2Fcheckout" className="bg-nature-olive hover:bg-nature-olive-dark text-white font-medium px-8 py-3 rounded-xl transition-colors tracking-[0.1em] text-sm">
              SIGN IN
            </Link>
            <Link to="/register?redirect=%2Fcheckout" className="border border-nature-olive text-nature-olive hover:bg-nature-olive/10 font-medium px-8 py-3 rounded-xl transition-colors tracking-[0.1em] text-sm">
              CREATE ACCOUNT
            </Link>
          </div>
          <p className="mt-4 text-nature-muted text-xs">
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
          <Link to="/products" className="text-nature-olive hover:text-nature-olive-dark transition-colors">Shop now</Link>
        </div>
      </div>
    );
  }

  const walletInsufficient = form.payment_method === 'virtual_currency' && walletBalance !== null && walletBalance < total;

  return (
    <div className="min-h-screen bg-nature-bg text-nature-dark pt-24">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <Link to="/cart" className="inline-flex items-center gap-2 text-nature-muted hover:text-nature-olive transition-colors text-sm mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Cart
        </Link>
        <h1 className="font-serif text-3xl text-nature-dark mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-5">
            <div className="bg-nature-card border border-nature-border rounded-xl p-6">
              <h3 className="text-nature-olive text-[11px] tracking-[0.2em] uppercase mb-5">Customer Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-nature-muted text-xs tracking-wider mb-1.5">Full Name *</label>
                  <input required value={form.full_name} onChange={e => update('full_name', e.target.value)}
                    className="w-full bg-nature-bg border border-nature-border focus:border-nature-olive/60 rounded-lg px-4 py-2.5 text-nature-dark text-sm outline-none transition-colors"
                    placeholder="Ma Aye Aye" />
                </div>
                <div>
                  <label className="block text-nature-muted text-xs tracking-wider mb-1.5">Email *</label>
                  <input required type="email" value={form.email} onChange={e => update('email', e.target.value)}
                    className="w-full bg-nature-bg border border-nature-border focus:border-nature-olive/60 rounded-lg px-4 py-2.5 text-nature-dark text-sm outline-none transition-colors"
                    placeholder="email@example.com" />
                </div>
                <div>
                  <label className="block text-nature-muted text-xs tracking-wider mb-1.5">Phone *</label>
                  <input required value={form.phone} onChange={e => update('phone', e.target.value)}
                    className="w-full bg-nature-bg border border-nature-border focus:border-nature-olive/60 rounded-lg px-4 py-2.5 text-nature-dark text-sm outline-none transition-colors"
                    placeholder="09 xxx xxx xxx" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-nature-muted text-xs tracking-wider mb-1.5">Delivery Address *</label>
                  <textarea required rows={3} value={form.address} onChange={e => update('address', e.target.value)}
                    className="w-full bg-nature-bg border border-nature-border focus:border-nature-olive/60 rounded-lg px-4 py-2.5 text-nature-dark text-sm outline-none transition-colors resize-none"
                    placeholder="No. 1, Street Name, Township, City" />
                </div>
              </div>
            </div>

            <div className="bg-nature-card border border-nature-border rounded-xl p-6">
              <h3 className="text-nature-olive text-[11px] tracking-[0.2em] uppercase mb-5">Payment Method</h3>
              <div className="space-y-3">
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
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                      form.payment_method === opt.value
                        ? opt.extra ? 'border-red-400/50 bg-red-50' : 'border-nature-olive/50 bg-nature-sage/10'
                        : 'border-nature-border hover:border-nature-tan'
                    }`}>
                    <input type="radio" name="payment" value={opt.value}
                      checked={form.payment_method === opt.value}
                      onChange={() => update('payment_method', opt.value)}
                      className="mt-0.5 accent-nature-olive" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {opt.value === 'virtual_currency' && <Wallet className="w-3.5 h-3.5 text-nature-blue" />}
                        <p className="text-nature-dark text-sm font-medium">{opt.label}</p>
                      </div>
                      <p className={`text-xs mt-0.5 ${opt.extra ? 'text-red-500' : 'text-nature-muted'}`}>{opt.desc}</p>
                      {opt.value === 'virtual_currency' && form.payment_method === 'virtual_currency' && !walletInsufficient && walletBalance !== null && (
                        <p className="text-nature-olive text-xs mt-1">After payment: {formatMMK(walletBalance - total)} remaining</p>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {error && <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

            <button type="submit" disabled={loading || walletInsufficient}
              className="w-full bg-nature-olive hover:bg-nature-olive-dark disabled:opacity-60 text-white font-medium py-3.5 rounded-xl transition-colors tracking-[0.1em] text-sm flex items-center justify-center gap-2">
              <Lock className="w-4 h-4" />
              {loading ? 'PLACING ORDER...' : 'PLACE ORDER'}
            </button>
          </form>

          <div className="bg-nature-card border border-nature-border rounded-xl p-5 h-fit sticky top-24">
            <h3 className="font-serif text-xl text-nature-dark mb-5">Order Summary</h3>
            <div className="space-y-3 mb-5">
              {items.map(item => {
                if (!item) return null;
                return (
                  <div key={item.id} className="flex justify-between text-sm">
                    <div className="mr-2 min-w-0">
                      <p className="text-nature-dark truncate">{item.product_name || 'Perfume Product'}</p>
                      <p className="text-nature-muted text-xs capitalize">{item.size || 'Variant'} × {item.quantity}</p>
                    </div>
                    <span className="text-nature-dark flex-shrink-0">{formatMMK(item.price * item.quantity)}</span>
                  </div>
                );
              })}
            </div>
            <div className="border-t border-nature-border pt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-nature-dark font-semibold">Total</span>
                <span className="text-nature-olive font-bold text-lg">{formatMMK(total)}</span>
              </div>
              {form.payment_method === 'virtual_currency' && walletBalance !== null && (
                <div className="flex justify-between text-xs">
                  <span className="text-nature-muted">Wallet balance</span>
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