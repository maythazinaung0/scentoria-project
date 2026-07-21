import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, ShoppingBag, Loader2, AlertCircle, Check, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ScentoriaLogo from '../components/ScentoriaLogo';
import FieldError from '../components/FieldError';
import { getFieldErrors, getErrorMessage } from '../utils/formErrors';
import { isValidEmailFormat } from '../utils/vaildators';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [touchedEmail, setTouchedEmail] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';
  const isCheckoutRedirect = redirectTo === '/checkout';

  const emailFormatValid = isValidEmailFormat(email);

  async function handleSubmit(e) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setFieldErrors({});
    setFormError('');

    try {
      const user = await signIn(email.trim(), password);
      navigate(user.role === 'admin' ? '/admin' : redirectTo);
    } catch (err) {
      if (err.response?.status === 429) {
        setFormError('Too many login attempts. Please wait a moment and try again.');
      } else if (err.response?.status === 401) {
        setFormError(err.response?.data?.message || 'Invalid email or password.');
      } else {
        setFieldErrors(getFieldErrors(err));
        setFormError(getErrorMessage(err));
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
          <h1 className="font-serif text-2xl text-nature-dark mb-1">Welcome back</h1>
          <p className="text-nature-muted text-sm">Sign in to your account</p>
        </div>

        {isCheckoutRedirect && (
          <div className="bg-nature-sage/20 border border-nature-olive/30 rounded-xl px-4 py-3 mb-5 flex items-center gap-3">
            <ShoppingBag className="w-4 h-4 text-nature-olive flex-shrink-0" />
            <p className="text-nature-charcoal text-sm">Sign in to continue your checkout — cart is saved.</p>
          </div>
        )}

        <div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-2xl shadow-[0_20px_50px_-10px_rgba(74,104,56,0.35)] p-6">
          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="on">
            <div>
              <label htmlFor="login-email" className="block text-nature-muted text-xs font-semibold tracking-wider uppercase mb-1.5">Email</label>
              <div className="relative">
                <input
                  id="login-email"
                  required
                  autoFocus
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                  disabled={loading}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onFocus={() => setTouchedEmail(true)}
                  className={`w-full bg-white/70 border rounded-xl px-4 py-2.5 pr-9 text-sm outline-none transition-colors placeholder-nature-muted disabled:opacity-60 ${
                    touchedEmail && email.length > 0
                      ? emailFormatValid ? 'border-nature-olive/60' : 'border-red-300'
                      : 'border-nature-border/80 focus:border-nature-olive/60'
                  }`}
                  placeholder="you@example.com"
                />
                {touchedEmail && email.length > 0 && (
                  emailFormatValid
                    ? <Check className="w-4 h-4 text-nature-olive absolute right-3 top-1/2 -translate-y-1/2" />
                    : <X className="w-4 h-4 text-red-400 absolute right-3 top-1/2 -translate-y-1/2" />
                )}
              </div>
              {touchedEmail && email.length > 0 && !emailFormatValid && (
                <p className="text-red-600 text-[11px] mt-1">Enter a valid email address.</p>
              )}
              <FieldError errors={fieldErrors} field="email" />
            </div>
            <div>
              <label htmlFor="login-password" className="block text-nature-muted text-xs font-semibold tracking-wider uppercase mb-1.5">Password</label>
              <div className="relative">
                <input
                  id="login-password"
                  required
                  type={showPw ? 'text' : 'password'}
                  autoComplete="new-password"
                  disabled={loading}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-white/70 border border-nature-border/80 focus:border-nature-olive/60 rounded-xl px-4 py-2.5 pr-10 text-sm outline-none transition-colors placeholder-nature-muted disabled:opacity-60"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-nature-muted hover:text-nature-dark transition-colors"
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <FieldError errors={fieldErrors} field="password" />
            </div>

            {formError && (
              <p className="flex items-start gap-2 text-red-700 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                {formError}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-nature-olive hover:bg-nature-olive-dark disabled:opacity-60 text-white font-medium py-2.5 rounded-xl transition-colors tracking-[0.1em] text-sm mt-1 shadow-[0_4px_16px_-4px_rgba(74,104,56,0.5)]"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'SIGNING IN...' : 'SIGN IN'}
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