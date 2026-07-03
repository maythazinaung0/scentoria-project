import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, ShoppingBag } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ScentoriaLogo from '../components/ScentoriaLogo';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';
  const isCheckoutRedirect = redirectTo === '/checkout';

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await signIn(email, password);

      // Route based on who just logged in — same form for admins and customers.
      navigate(user.role === 'admin' ? '/admin' : redirectTo);
    } catch (err) {
      const message = err.response?.data?.message || 'Invalid email or password.';
      setError(message);
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
          <h1 className="font-serif text-2xl text-nature-dark mb-1">Welcome back</h1>
          <p className="text-nature-muted text-sm">Sign in to your account</p>
        </div>

        {isCheckoutRedirect && (
          <div className="bg-nature-sage/20 border border-nature-olive/30 rounded-xl px-4 py-3 mb-5 flex items-center gap-3">
            <ShoppingBag className="w-4 h-4 text-nature-olive flex-shrink-0" />
            <p className="text-nature-charcoal text-sm">Sign in to continue your checkout — cart is saved.</p>
          </div>
        )}

        <div className="bg-nature-card border border-nature-border rounded-2xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-nature-dark text-xs tracking-wider mb-1.5">Email</label>
              <input required type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full bg-nature-bg border border-nature-border focus:border-nature-olive/60 rounded-lg px-4 py-2.5 text-nature-dark text-sm outline-none transition-colors placeholder-nature-muted"
                placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-nature-dark text-xs tracking-wider mb-1.5">Password</label>
              <div className="relative">
                <input required type={showPw ? 'text' : 'password'} minLength={6} value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full bg-nature-bg border border-nature-border focus:border-nature-olive/60 rounded-lg px-4 py-2.5 pr-10 text-nature-dark text-sm outline-none transition-colors placeholder-nature-muted"
                  placeholder="Min. 6 characters" />
                <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-nature-muted hover:text-nature-dark transition-colors">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

            <button type="submit" disabled={loading}
              className="w-full bg-nature-olive hover:bg-nature-olive-dark disabled:opacity-60 text-white font-medium py-2.5 rounded-xl transition-colors tracking-[0.1em] text-sm mt-1">
              {loading ? 'Signing in...' : 'SIGN IN'}
            </button>
          </form>
        </div>

        <p className="text-center mt-5 text-nature-muted text-sm">
          Don't have an account?{' '}
          <Link to={`/register${redirectTo !== '/' ? `?redirect=${redirectTo}` : ''}`} className="text-nature-olive hover:text-nature-olive-dark transition-colors font-medium">
            Register
          </Link>
        </p>
        <p className="text-center mt-2">
          <Link to="/" className="text-nature-subtle text-xs hover:text-nature-muted transition-colors">← Back to home</Link>
        </p>
      </div>
    </div>
  );
}