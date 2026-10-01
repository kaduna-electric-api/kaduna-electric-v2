import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';
import AuthShell from './AuthShell';

export default function CreatePassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verificationToken] = useState(() => sessionStorage.getItem('registrationVerificationToken') || '');

  const email = useMemo(() => new URLSearchParams(location.search).get('email') || '', [location.search]);
  const strengthChecks = [password.length >= 8, /[A-Za-z]/.test(password) && /\d/.test(password), /[^A-Za-z0-9]/.test(password)];
  const strength = strengthChecks.filter(Boolean).length;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!email) {
      setError('Missing email. Please restart registration.');
      return;
    }

    if (!verificationToken) {
      setError('Your email verification session has expired. Please verify your email again.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/set-password', { email, password, confirmPassword, verificationToken });
      sessionStorage.removeItem('registrationVerificationToken');
      setAuth(data.user, data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create your account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell step={3}>
        <p className="auth-kicker">FINAL STEP</p>
        <h2 className="auth-title">Create your password</h2>
        <p className="auth-subtitle">Your email is verified. Set a password for <strong className="auth-email-highlight">{email || 'your account'}</strong>.</p>

        {error && (
          <div className="auth-alert" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form auth-password-form">
          <div className="auth-field">
            <label className="auth-label" htmlFor="new-password">Password</label>
            <div className="relative">
              <input
                id="new-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                minLength={6}
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="input-field auth-input pr-11"
                placeholder="Minimum 6 characters"
              />
              <button type="button" onClick={() => setShowPassword((prev) => !prev)} className="auth-password-toggle" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {password && (
              <div className="auth-strength" aria-label={`Password strength ${strength} out of 3`}>
                <div className="auth-strength-bars">{strengthChecks.map((passed, index) => <span key={index} className={passed ? 'is-filled' : ''} />)}</div>
                <span>{strength === 3 ? 'Strong password' : strength === 2 ? 'Good password' : 'Add a number or symbol for strength'}</span>
              </div>
            )}
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="confirm-password">Confirm password</label>
            <div className="relative">
              <input
                id="confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="input-field auth-input pr-11"
                placeholder="Re-enter your password"
              />
              <button type="button" onClick={() => setShowConfirmPassword((prev) => !prev)} className="auth-password-toggle" aria-label={showConfirmPassword ? 'Hide confirmation' : 'Show confirmation'}>
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {confirmPassword && (
              <span className={`auth-match ${password === confirmPassword ? 'is-match' : 'is-mismatch'}`} aria-live="polite">
                {password === confirmPassword ? 'Passwords match' : 'Passwords do not match'}
              </span>
            )}
          </div>

          <button type="submit" disabled={loading} className="auth-submit" aria-label="Create account with password">
            {loading ? <><Loader2 size={17} className="animate-spin" /> Creating account</> : <>Create account <ArrowRight size={17} /> </>}
          </button>
        </form>

        <div className="auth-password-back">
          <Link to={`/verify-otp?email=${encodeURIComponent(email)}`} className="auth-back-link">
            <ArrowLeft className="h-4 w-4" />
            Back to verification
          </Link>
        </div>
    </AuthShell>
  );
}
