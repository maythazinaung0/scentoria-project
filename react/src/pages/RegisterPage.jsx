import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, ShoppingBag } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ScentoriaLogo from '../components/ScentoriaLogo';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';
  const isCheckoutRedirect = redirectTo === '/checkout';

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      await signUp({ name, email, phone_number: phoneNumber, password, password_confirmation: confirmPassword });
      navigate(redirectTo);
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors) {
        setError(Object.values(errors).flat().join(' '));
      } else {
        setError(err.response?.data?.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-nature-bg flex items-center justify-center px-4 pt-16">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-2.5 justify-center mb-4">
            <ScentoriaLogo className="w-6 h-7 text-nature-olive" />
            <span className="font-serif text-xl tracking-[0.2em] text-nature-dark">SCENTORIA</span>
          </Link>
          <h1 className="font-serif text-2xl text-nature-dark mb-1">Create your account</h1>
          <p className="text-nature-muted text-sm">Join us to start your fragrance journey</p>
        </div>

        {isCheckoutRedirect && (
          <div className="bg-nature-sage/20 border border-nature-olive/30 rounded-xl px-4 py-3 mb-5 flex items-center gap-3">
            <ShoppingBag className="w-4 h-4 text-nature-olive flex-shrink-0" />
            <p className="text-nature-charcoal text-sm">Create an account to continue your checkout — cart is saved.</p>
          </div>
        )}

        <div className="bg-nature-card border border-nature-border rounded-2xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-nature-dark text-xs tracking-wider mb-1.5">Full Name</label>
              <input required value={name} onChange={e => setName(e.target.value)}
                className="w-full bg-nature-bg border border-nature-border focus:border-nature-olive/60 rounded-lg px-4 py-2.5 text-nature-dark text-sm outline-none transition-colors placeholder-nature-muted"
                placeholder="Your name" />
            </div>

            <div>
              <label className="block text-nature-dark text-xs tracking-wider mb-1.5">Email</label>
              <input required type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full bg-nature-bg border border-nature-border focus:border-nature-olive/60 rounded-lg px-4 py-2.5 text-nature-dark text-sm outline-none transition-colors placeholder-nature-muted"
                placeholder="you@example.com" />
            </div>

            <div>
              <label className="block text-nature-dark text-xs tracking-wider mb-1.5">Phone Number <span className="text-nature-muted normal-case">(optional)</span></label>
              <input type="tel" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)}
                className="w-full bg-nature-bg border border-nature-border focus:border-nature-olive/60 rounded-lg px-4 py-2.5 text-nature-dark text-sm outline-none transition-colors placeholder-nature-muted"
                placeholder="09xxxxxxxxx" />
            </div>

            <div>
              <label className="block text-nature-dark text-xs tracking-wider mb-1.5">Password</label>
              <div className="relative">
                <input required type={showPw ? 'text' : 'password'} minLength={8} value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full bg-nature-bg border border-nature-border focus:border-nature-olive/60 rounded-lg px-4 py-2.5 pr-10 text-nature-dark text-sm outline-none transition-colors placeholder-nature-muted"
                  placeholder="Min. 8 characters" />
                <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-nature-muted hover:text-nature-dark transition-colors">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-nature-muted text-[11px] mt-1">At least 8 characters, with uppercase, lowercase, and a number.</p>
            </div>

            <div>
              <label className="block text-nature-dark text-xs tracking-wider mb-1.5">Confirm Password</label>
              <input required type={showPw ? 'text' : 'password'} minLength={8} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                className="w-full bg-nature-bg border border-nature-border focus:border-nature-olive/60 rounded-lg px-4 py-2.5 text-nature-dark text-sm outline-none transition-colors placeholder-nature-muted"
                placeholder="Re-enter your password" />
            </div>

            {error && <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

            <button type="submit" disabled={loading}
              className="w-full bg-nature-olive hover:bg-nature-olive-dark disabled:opacity-60 text-white font-medium py-2.5 rounded-xl transition-colors tracking-[0.1em] text-sm mt-1">
              {loading ? 'Creating account...' : 'CREATE ACCOUNT'}
            </button>
          </form>
        </div>

        <p className="text-center mt-5 text-nature-muted text-sm">
          Already have an account?{' '}
          <Link to={`/login${redirectTo !== '/' ? `?redirect=${redirectTo}` : ''}`} className="text-nature-olive hover:text-nature-olive-dark transition-colors font-medium">
            Sign In
          </Link>
        </p>
        <p className="text-center mt-2">
          <Link to="/" className="text-nature-subtle text-xs hover:text-nature-muted transition-colors">← Back to home</Link>
        </p>
      </div>
    </div>
  );
}