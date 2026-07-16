import { useEffect, useRef, useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, ShoppingBag, Loader2, AlertCircle, Check, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ScentoriaLogo from '../components/ScentoriaLogo';
import FieldError from '../components/FieldError';
import { getFieldErrors, getErrorMessage } from '../utils/formErrors';
import { getPasswordChecks, isPasswordPolicyMet } from '../utils/PasswordPolicy';
import { isValidEmailFormat, isValidName } from '../utils/vaildators';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import api from '../api';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [touchedPassword, setTouchedPassword] = useState(false);
  const [touchedName, setTouchedName] = useState(false);
  const [touchedEmail, setTouchedEmail] = useState(false);

  // 'idle' | 'checking' | 'available' | 'taken' | 'error'
  const [emailStatus, setEmailStatus] = useState('idle');
  const abortRef = useRef(null);

  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';
  const isCheckoutRedirect = redirectTo === '/checkout';

  const passwordChecks = getPasswordChecks(password);
  const policyMet = isPasswordPolicyMet(password);
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;

  const nameValid = isValidName(name);
  const emailFormatValid = isValidEmailFormat(email);
  const debouncedEmail = useDebouncedValue(email, 500);

  // Once the email looks well-formed, ask the backend whether it's already
  // registered. Debounced so we're not hitting the API every keystroke, and
  // any in-flight request is aborted if the user keeps typing.
  useEffect(() => {
    if (!isValidEmailFormat(debouncedEmail)) {
      setEmailStatus('idle');
      return;
    }

    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setEmailStatus('checking');
    api.post('/check-email', { email: debouncedEmail.trim() }, { signal: controller.signal })
      .then(res => setEmailStatus(res.data?.exists ? 'taken' : 'available'))
      .catch(err => {
        if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return;
        setEmailStatus('error');
      });

    return () => controller.abort();
  }, [debouncedEmail]);

  const emailOk = emailFormatValid && emailStatus === 'available';
  const canSubmit = nameValid && emailOk && policyMet && passwordsMatch;

  async function handleSubmit(e) {
    e.preventDefault();
    if (loading) return;
    setFieldErrors({});
    setFormError('');

    if (!nameValid) {
      setFormError('Please enter your full name.');
      return;
    }
    if (!emailFormatValid) {
      setFormError('Please enter a valid email address.');
      return;
    }
    if (emailStatus === 'taken') {
      setFormError('This email is already registered. Try signing in instead.');
      return;
    }
    if (!policyMet) {
      setFormError('Please meet all password requirements below.');
      return;
    }
    if (!passwordsMatch) {
      setFormError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await signUp({
        name: name.trim(),
        email: email.trim(),
        phone_number: phoneNumber.trim() || undefined,
        password,
        password_confirmation: confirmPassword,
      });
      navigate(redirectTo);
    } catch (err) {
      if (err.response?.status === 429) {
        setFormError('Too many attempts. Please wait a moment and try again.');
      } else {
        setFieldErrors(getFieldErrors(err));
        setFormError(getErrorMessage(err));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-nature-bg flex items-center justify-center px-4 pt-16 pb-10">
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

        <div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-2xl shadow-[0_20px_50px_-10px_rgba(74,104,56,0.35)] p-6">
          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="on" noValidate>
            <div>
              <label htmlFor="reg-name" className="block text-nature-muted text-xs font-semibold tracking-wider uppercase mb-1.5">Full Name</label>
              <div className="relative">
                <input
                  id="reg-name"
                  required
                  autoFocus
                  autoComplete="name"
                  disabled={loading}
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onFocus={() => setTouchedName(true)}
                  className={`w-full bg-white/70 border rounded-xl px-4 py-2.5 pr-9 text-sm outline-none transition-colors placeholder-nature-muted disabled:opacity-60 ${
                    touchedName && name.length > 0
                      ? nameValid ? 'border-nature-olive/60' : 'border-red-300'
                      : 'border-nature-border/80 focus:border-nature-olive/60'
                  }`}
                  placeholder="Your name"
                />
                {touchedName && name.length > 0 && (
                  nameValid
                    ? <Check className="w-4 h-4 text-nature-olive absolute right-3 top-1/2 -translate-y-1/2" />
                    : <X className="w-4 h-4 text-red-400 absolute right-3 top-1/2 -translate-y-1/2" />
                )}
              </div>
              {touchedName && name.length > 0 && !nameValid && (
                <p className="text-red-600 text-[11px] mt-1">Use your name — letters only, at least 2 characters.</p>
              )}
              <FieldError errors={fieldErrors} field="name" />
            </div>

            <div>
              <label htmlFor="reg-email" className="block text-nature-muted text-xs font-semibold tracking-wider uppercase mb-1.5">Email</label>
              <div className="relative">
                <input
                  id="reg-email"
                  required
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
                      ? (!emailFormatValid || emailStatus === 'taken')
                        ? 'border-red-300'
                        : emailStatus === 'available'
                          ? 'border-nature-olive/60'
                          : 'border-nature-border/80 focus:border-nature-olive/60'
                      : 'border-nature-border/80 focus:border-nature-olive/60'
                  }`}
                  placeholder="you@example.com"
                />
                {touchedEmail && email.length > 0 && (
                  !emailFormatValid ? (
                    <X className="w-4 h-4 text-red-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  ) : (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2">
                      {emailStatus === 'checking' && <Loader2 className="w-4 h-4 text-nature-muted animate-spin" />}
                      {emailStatus === 'available' && <Check className="w-4 h-4 text-nature-olive" />}
                      {emailStatus === 'taken' && <X className="w-4 h-4 text-red-400" />}
                    </span>
                  )
                )}
              </div>
              {touchedEmail && email.length > 0 && !emailFormatValid && (
                <p className="text-red-600 text-[11px] mt-1">Enter a valid email address.</p>
              )}
              {touchedEmail && emailFormatValid && emailStatus === 'taken' && (
                <p className="text-red-600 text-[11px] mt-1">
                  This email is already registered.{' '}
                  <Link to={`/login${redirectTo !== '/' ? `?redirect=${redirectTo}` : ''}`} className="underline font-medium">Sign in instead</Link>
                </p>
              )}
              {touchedEmail && emailFormatValid && emailStatus === 'available' && (
                <p className="text-nature-olive text-[11px] mt-1">Looks good — this email is available.</p>
              )}
              <FieldError errors={fieldErrors} field="email" />
            </div>

            <div>
              <label htmlFor="reg-phone" className="block text-nature-muted text-xs font-semibold tracking-wider uppercase mb-1.5">
                Phone Number <span className="text-nature-muted normal-case font-normal">(optional)</span>
              </label>
              <input
                id="reg-phone"
                type="tel"
                autoComplete="tel"
                disabled={loading}
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
                className="w-full bg-white/70 border border-nature-border/80 focus:border-nature-olive/60 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors placeholder-nature-muted disabled:opacity-60"
                placeholder="09xxxxxxxxx"
              />
              <FieldError errors={fieldErrors} field="phone_number" />
            </div>

            <div>
              <label htmlFor="reg-password" className="block text-nature-muted text-xs font-semibold tracking-wider uppercase mb-1.5">Password</label>
              <div className="relative">
                <input
                  id="reg-password"
                  required
                  type={showPw ? 'text' : 'password'}
                  autoComplete="new-password"
                  disabled={loading}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setTouchedPassword(true)}
                  className="w-full bg-white/70 border border-nature-border/80 focus:border-nature-olive/60 rounded-xl px-4 py-2.5 pr-10 text-sm outline-none transition-colors placeholder-nature-muted disabled:opacity-60"
                  placeholder="Create a password"
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

              {touchedPassword && (
                <div className="mt-2.5 bg-nature-bg/60 border border-nature-border/50 rounded-lg px-3 py-2.5 space-y-1.5">
                  {passwordChecks.map((check) => (
                    <div key={check.key} className={`flex items-center gap-1.5 text-[11px] transition-colors ${check.pass ? 'text-nature-olive' : 'text-nature-muted'}`}>
                      <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0 ${check.pass ? 'bg-nature-olive text-white' : 'border border-nature-border'}`}>
                        {check.pass && <Check className="w-2.5 h-2.5" strokeWidth={3} />}
                      </span>
                      {check.label}
                    </div>
                  ))}
                </div>
              )}
              <FieldError errors={fieldErrors} field="password" />
            </div>

            <div>
              <label htmlFor="reg-confirm" className="block text-nature-muted text-xs font-semibold tracking-wider uppercase mb-1.5">Confirm Password</label>
              <div className="relative">
                <input
                  id="reg-confirm"
                  required
                  type={showPw ? 'text' : 'password'}
                  autoComplete="new-password"
                  disabled={loading}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className={`w-full bg-white/70 border rounded-xl px-4 py-2.5 pr-9 text-sm outline-none transition-colors placeholder-nature-muted disabled:opacity-60 ${
                    confirmPassword.length > 0
                      ? passwordsMatch ? 'border-nature-olive/60' : 'border-red-300'
                      : 'border-nature-border/80 focus:border-nature-olive/60'
                  }`}
                  placeholder="Re-enter your password"
                />
                {confirmPassword.length > 0 && passwordsMatch && (
                  <Check className="w-4 h-4 text-nature-olive absolute right-3 top-1/2 -translate-y-1/2" />
                )}
              </div>
              {confirmPassword.length > 0 && !passwordsMatch && (
                <p className="text-red-600 text-[11px] mt-1">Passwords don't match yet.</p>
              )}
            </div>

            {formError && (
              <p className="flex items-start gap-2 text-red-700 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                {formError}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || emailStatus === 'checking' || (touchedPassword && !canSubmit)}
              className="w-full flex items-center justify-center gap-2 bg-nature-olive hover:bg-nature-olive-dark disabled:opacity-60 text-white font-medium py-2.5 rounded-xl transition-colors tracking-[0.1em] text-sm mt-1 shadow-[0_4px_16px_-4px_rgba(74,104,56,0.5)]"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
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