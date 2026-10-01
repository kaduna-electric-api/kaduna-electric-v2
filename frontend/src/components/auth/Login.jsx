import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';
import AuthShell from './AuthShell';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const setAuth = useAuthStore((s) => s.setAuth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setUnverifiedEmail('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      setAuth(data.user, data.token);
      window.location.href = data.user.role === 'admin' ? '/admin' : '/dashboard';
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      if (['EMAIL_NOT_VERIFIED', 'PASSWORD_SETUP_REQUIRED'].includes(err.response?.data?.code)) {
        setUnverifiedEmail(err.response.data.email || form.email.trim().toLowerCase());
      }
    } finally { setLoading(false); }
  };

  const handleResendVerification = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/resend-otp', { email: unverifiedEmail });
      if (data.passwordSetupRequired && data.verificationToken) {
        sessionStorage.setItem('registrationVerificationToken', data.verificationToken);
        navigate(`/create-password?email=${encodeURIComponent(unverifiedEmail)}`);
        return;
      }
      navigate(`/verify-otp?email=${encodeURIComponent(unverifiedEmail)}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to resend verification code.');
      if (err.response?.status === 429) {
        navigate(`/verify-otp?email=${encodeURIComponent(unverifiedEmail)}`, {
          state: {
            initialError: err.response.data.message,
            cooldownSeconds: Number(err.response.data.message.match(/wait (\d+) seconds/i)?.[1] || 60)
          }
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell mode="login">
        <p className="auth-kicker">WELCOME BACK</p>
        <h2 className="auth-title">Sign in</h2>
        <p className="auth-subtitle">Access your Kaduna Electric account.</p>
        {error && (
          <div className="auth-alert" role="alert">
            <p>{error}</p>
            {unverifiedEmail && (
              <button type="button" onClick={handleResendVerification} disabled={loading} className="auth-inline-link mt-2 border-0 bg-transparent p-0">
                {loading ? 'Checking account...' : 'Resend code or continue setup'}
              </button>
            )}
          </div>
        )}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label className="auth-label" htmlFor="login-email">Email address</label>
            <input id="login-email" type="email" autoComplete="email" required className="input-field auth-input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="auth-field">
            <label className="auth-label" htmlFor="login-password">Password</label>
            <div className="relative">
              <input id="login-password" type={showPass ? 'text' : 'password'} autoComplete="current-password" required className="input-field auth-input pr-11" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              <button type="button" onClick={() => setShowPass(!showPass)} className="auth-password-toggle" aria-label={showPass ? 'Hide password' : 'Show password'}>{showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
            </div>
          </div>
          <button type="submit" disabled={loading} className="auth-submit">{loading ? <><Loader2 size={17} className="animate-spin" /> Signing in</> : <>Sign in <ArrowRight size={17} /></>}</button>
        </form>
        <div className="auth-login-links">
          <Link to="/forgot-password" className="auth-inline-link">Forgot password?</Link>
          <p className="auth-footer">New to Kaduna Electric? <Link to="/register" className="auth-inline-link">Create account</Link></p>
        </div>
    </AuthShell>
  );
}