import { motion } from 'framer-motion';
import { ArrowUpRight, ShieldCheck, Zap } from 'lucide-react';
import './auth.css';

const steps = ['Your details', 'Verify email', 'Set password'];

export default function AuthShell({ children, step, mode = 'signup' }) {
  return (
    <main className="auth-page">
      <motion.div
        className="auth-shell"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <aside className="auth-showcase">
          <div className="auth-brand">
            <span className="auth-brand-icon"><Zap size={18} fill="currentColor" /></span>
            <span>Kaduna Electric</span>
          </div>

          <div className="auth-showcase-copy">
            <p className="auth-kicker">POWERING YOUR EVERYDAY</p>
            <h1>Energy that moves <em>with you.</em></h1>
            <p className="auth-showcase-description">One secure place for your electricity account.</p>
          </div>

          <div className="auth-energy-art" aria-hidden="true">
            <div className="auth-art-topline">
              <span>LIVE CONNECTION</span>
              <span className="auth-live-dot" />
            </div>
            <div className="auth-grid-lines" />
            <div className="auth-signal-path auth-signal-path-one" />
            <div className="auth-signal-path auth-signal-path-two" />
            <div className="auth-bars">
              <span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span />
            </div>
            <div className="auth-art-caption">
              <div className="auth-art-bolt"><Zap size={20} fill="currentColor" /></div>
              <div>
                <strong>Always connected</strong>
                <span>POWERING KADUNA</span>
              </div>
              <ArrowUpRight className="auth-art-arrow" size={18} />
            </div>
          </div>

          <div className="auth-showcase-foot">
            <ShieldCheck size={16} />
            <span>SECURE ACCOUNT ACCESS</span>
            <span className="auth-foot-line" />
            <span>{mode === 'signup' ? `${String(step).padStart(2, '0')} / 03` : 'SECURE'}</span>
          </div>
        </aside>

        <section className="auth-form-panel">
          {mode === 'signup' && (
            <div className="auth-progress" aria-label={`Step ${step} of 3`}>
              {steps.map((label, index) => {
                const number = index + 1;
                const state = number < step ? 'complete' : number === step ? 'current' : 'upcoming';
                return (
                  <div className={`auth-progress-step is-${state}`} key={label} aria-current={number === step ? 'step' : undefined}>
                    <span className="auth-progress-node">{number < step ? <ShieldCheck size={14} /> : `0${number}`}</span>
                    <span>{label}</span>
                  </div>
                );
              })}
              <div className="auth-progress-track"><span style={{ transform: `scaleX(${Math.max(0, (step - 1) / 2)})` }} /></div>
            </div>
          )}
          <motion.div
            className="auth-form-content"
            key={mode === 'signup' ? step : mode}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.08 }}
          >
            {children}
          </motion.div>
          <p className="auth-legal">By continuing, you agree to keep your account details secure.</p>
        </section>
      </motion.div>
    </main>
  );
}