import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Clock3, Loader2, RefreshCcw } from 'lucide-react';
import api from '../../services/api';
import AuthShell from './AuthShell';

const OTP_LENGTH = 6;
const OTP_DURATION_SECONDS = 180;

export default function VerifyOtp() {
  const location = useLocation();
  const navigate = useNavigate();
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [countdown, setCountdown] = useState(OTP_DURATION_SECONDS);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(
    location.state?.cooldownSeconds ?? 60
  );
  const [error, setError] = useState(location.state?.initialError || '');
  const inputRefs = useRef([]);

  const email = useMemo(() => new URLSearchParams(location.search).get('email') || '', [location.search]);

  useEffect(() => {
    if (countdown <= 0) return undefined;

    const timer = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  useEffect(() => {
    if (resendCooldown <= 0) return undefined;

    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const focusInput = (index) => {
    const next = inputRefs.current[index];
    if (next) next.focus();
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;

    const nextOtp = [...otp];
    nextOtp[index] = value;
    setOtp(nextOtp);
    setError('');

    if (value && index < OTP_LENGTH - 1) {
      focusInput(index + 1);
    }
  };

  const handleKeyDown = (index, event) => {
    if (event.key === 'Backspace' && !otp[index] && index > 0) {
      focusInput(index - 1);
    }

    if (event.key === 'ArrowLeft' && index > 0) {
      focusInput(index - 1);
    }

    if (event.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      focusInput(index + 1);
    }
  };

  const handlePaste = (event) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;

    const nextOtp = Array(OTP_LENGTH).fill('');
    for (let i = 0; i < pasted.length; i += 1) {
      nextOtp[i] = pasted[i];
    }
    setOtp(nextOtp);
    setError('');
    const targetIndex = Math.min(pasted.length, OTP_LENGTH - 1);
    focusInput(targetIndex);
  };

  const handleVerify = async () => {
    const otpValue = otp.join('');
    if (!email) {
      setError('No email was provided for verification.');
      return;
    }

    if (otpValue.length !== OTP_LENGTH) {
      setError('Please enter the complete 6-digit code.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/verify-otp', { email, otp: otpValue });
      if (!data.verificationToken) {
        setError('Email verification could not be completed. Please try again.');
        return;
      }
      sessionStorage.setItem('registrationVerificationToken', data.verificationToken);
      navigate(`/create-password?email=${encodeURIComponent(email)}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email) {
      setError('No email was provided to resend the code.');
      return;
    }

    if (resendCooldown > 0) {
      setError(`Please wait ${resendCooldown} seconds before requesting a new code.`);
      return;
    }

    setResending(true);
    try {
      const { data } = await api.post('/auth/resend-otp', { email });
      if (data.passwordSetupRequired && data.verificationToken) {
        sessionStorage.setItem('registrationVerificationToken', data.verificationToken);
        navigate(`/create-password?email=${encodeURIComponent(email)}`);
        return;
      }
      setOtp(Array(OTP_LENGTH).fill(''));
      setCountdown(OTP_DURATION_SECONDS);
      setResendCooldown(60);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to resend verification code.');
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthShell step={2}>
        <p className="auth-kicker">ONE QUICK CHECK</p>
        <h2 className="auth-title">Verify your email</h2>
        <p className="auth-subtitle">
          Enter the six-digit code sent to <strong className="auth-email-highlight">{email || 'your email'}</strong>.
        </p>

        {error && (
          <div className="auth-alert" role="alert">
            {error}
          </div>
        )}

        <div className="auth-countdown" role="timer" aria-label={`Code expires in ${formatTime(countdown)}`}>
          <span className="auth-countdown-ring" style={{ '--otp-progress': `${(countdown / OTP_DURATION_SECONDS) * 360}deg` }}>
            <Clock3 size={17} />
          </span>
          <span><small>CODE EXPIRES IN</small><strong>{formatTime(countdown)}</strong></span>
          <span className="auth-countdown-note">3 MIN</span>
        </div>

        <div className="auth-code-row" onPaste={handlePaste} aria-label="Six-digit verification code">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(element) => {
                inputRefs.current[index] = element;
              }}
              value={digit}
              onChange={(event) => handleOtpChange(index, event.target.value)}
              onKeyDown={(event) => handleKeyDown(index, event)}
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              maxLength={1}
              className="auth-code-input"
              aria-label={`Digit ${index + 1}`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={handleVerify}
          disabled={loading || countdown === 0}
          className="auth-submit auth-verify-submit"
        >
          {loading ? <><Loader2 size={17} className="animate-spin" /> Checking code</> : <>Verify code <ArrowRight size={17} /></>}
        </button>

        <div className="auth-otp-actions">
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={resending || resendCooldown > 0}
            className="auth-resend-link"
          >
            <RefreshCcw className="h-4 w-4" />
            {resending ? 'Sending...' : resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
          </button>

          <Link to="/register" className="auth-back-link">
            <ArrowLeft className="h-4 w-4" />
            Edit details
          </Link>
        </div>

        {countdown === 0 && (
          <p className="auth-expired-note">Your code has expired. Request a fresh one to continue.</p>
        )}
    </AuthShell>
  );
}
