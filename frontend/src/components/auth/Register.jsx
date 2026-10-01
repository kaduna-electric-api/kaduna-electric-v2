import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Loader2 } from 'lucide-react';
import api from '../../services/api';
import AuthShell from './AuthShell';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim() || !form.phone.trim()) {
      setError('Please complete all required fields.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/register', {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim()
      });

      navigate(`/verify-otp?email=${encodeURIComponent(form.email.trim().toLowerCase())}`);
    } catch (err) {
      if (err.response?.data?.pendingRegistration) {
        navigate(`/verify-otp?email=${encodeURIComponent(form.email.trim().toLowerCase())}`, {
          state: {
            initialError: err.response.data.message,
            cooldownSeconds: err.response.data.resendAfterSeconds || 0
          }
        });
        return;
      }
      setError(err.response?.data?.message || 'Unable to send verification email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell step={1}>
      <p className="auth-kicker">GET STARTED</p>
      <h2 className="auth-title">Create your account</h2>
      <p className="auth-subtitle">Add your details to get started with Kaduna Electric.</p>

      {error && <div className="auth-alert" role="alert">{error}</div>}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="grid grid-cols-2 gap-3">
          <div className="auth-field">
            <label className="auth-label" htmlFor="register-first-name">First name</label>
            <input id="register-first-name" autoComplete="given-name" required className="input-field auth-input" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
          </div>
          <div className="auth-field">
            <label className="auth-label" htmlFor="register-last-name">Last name</label>
            <input id="register-last-name" autoComplete="family-name" required className="input-field auth-input" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
          </div>
        </div>

        <div className="auth-field">
          <label className="auth-label" htmlFor="register-email">Email address</label>
          <input id="register-email" type="email" autoComplete="email" required className="input-field auth-input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>

        <div className="auth-field">
          <label className="auth-label" htmlFor="register-phone">Phone number</label>
          <input id="register-phone" type="tel" autoComplete="tel" required className="input-field auth-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>

        <button type="submit" disabled={loading} className="auth-submit">
          {loading ? <><Loader2 size={17} className="animate-spin" /> Sending code</> : <>Continue <ArrowRight size={17} /></>}
        </button>
      </form>

      <p className="auth-footer">Already have an account? <Link to="/login" className="auth-inline-link">Sign in</Link></p>
    </AuthShell>
  );
}
