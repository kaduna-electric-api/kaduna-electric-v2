import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, CreditCard, Receipt, AlertCircle, Plus, TrendingUp, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';
import Loading from '../ui/Loading';
import toast from 'react-hot-toast';

const notificationStyles = {
  info: 'bg-blue-300/10 text-blue-100 border-blue-200/20',
  success: 'bg-emerald-300/10 text-emerald-100 border-emerald-200/20',
  warning: 'bg-amber-300/10 text-amber-100 border-amber-200/20',
  critical: 'bg-rose-300/10 text-rose-100 border-rose-200/20',
};

export default function CustomerDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [creditAccount, setCreditAccount] = useState(null);
  const [creditError, setCreditError] = useState('');
  const [creditLoading, setCreditLoading] = useState(true);
  const [repayingCredit, setRepayingCredit] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [metersRes, transRes, notifRes] = await Promise.all([
          api.get('/meters'),
          api.get('/transactions/history?limit=5'),
          api.get('/notifications')
        ]);
        const meters = metersRes.data;
        const transactions = transRes.data.transactions || [];
        setStats({
          meters: meters.length,
          spent: transRes.data.summary?.totalSpent || 0,
          transactions: transRes.data.summary?.totalTransactions ?? transRes.data.pagination?.total ?? transactions.length
        });
        setRecent(transactions);
        setNotifications(notifRes.data.notifications || []);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const loadCreditAccount = async () => {
    setCreditLoading(true);
    setCreditError('');
    try {
      const { data } = await api.get('/credit/account');
      setCreditAccount(data);
    } catch (error) {
      console.error('Failed to load credit account', error);
      setCreditError(error.response?.data?.message || 'Unable to load your credit account. Please try again.');
    } finally {
      setCreditLoading(false);
    }
  };

  useEffect(() => {
    loadCreditAccount();
  }, []);

  const repayCredit = async () => {
    try {
      setRepayingCredit(true);
      const { data } = await api.post('/credit/repay');
      setCreditAccount((current) => ({
        ...current,
        balance: data.balance,
        canPurchaseOnCredit: data.canPurchaseOnCredit,
        repayments: [...(current?.repayments || []), data.repayment]
      }));
      setRecent((current) => current.map((transaction) => (
        transaction.paymentMethod === 'credit' && transaction.creditStatus === 'unpaid'
          ? { ...transaction, creditStatus: 'paid' }
          : transaction
      )));
      toast.success(`Simulated repayment of ₦${data.repayment.amount.toLocaleString()} recorded`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to record repayment');
    } finally {
      setRepayingCredit(false);
    }
  };

  if (loading) return <Loading fullScreen />;

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 pb-20 pt-8 text-white">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_78%_0%,rgba(14,165,233,0.2),transparent_38%),radial-gradient(ellipse_at_5%_48%,rgba(37,99,235,0.16),transparent_36%)]" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(rgba(255,255,255,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.14)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:linear-gradient(to_bottom,black,transparent_90%)]" />
      <div className="section-padding relative mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-8 overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 p-6 shadow-2xl shadow-blue-950/30 sm:p-9"
        >
          <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-32 h-80 w-80 rounded-full border border-cyan-200/10" />
          <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-20 h-60 w-60 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="relative flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-cyan-200/20 bg-cyan-200/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-cyan-100">
                <Zap className="h-3.5 w-3.5" /> Account control center
              </span>
              <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-5xl">{greeting()}, {user?.firstName}.</h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">Your meters, credit status, and electricity activity — all in one place.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/buy-token" className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-300 to-blue-400 px-5 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-950/30 transition hover:-translate-y-0.5 hover:brightness-110">
                <Zap className="h-4 w-4" /> Buy Token
              </Link>
            </div>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Link to="/dashboard/meters" className="group rounded-2xl border border-white/10 bg-slate-900/75 p-5 shadow-xl shadow-black/10 backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-cyan-200/30 hover:bg-slate-900">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-slate-400">My Meters</p><p className="mt-1 text-3xl font-bold text-white">{stats?.meters || 0}</p><p className="mt-2 text-xs text-cyan-200/80">Manage your meters <span className="transition group-hover:translate-x-1">→</span></p></div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-200/10 bg-cyan-200/10"><Zap className="h-6 w-6 text-cyan-200" /></div>
            </div>
          </motion.div>
          </Link>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-2xl border border-white/10 bg-slate-900/75 p-5 shadow-xl shadow-black/10 backdrop-blur">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-slate-400">Paid Purchases</p><p className="mt-1 text-3xl font-bold text-white">₦{(stats?.spent || 0).toLocaleString('en-NG')}</p><p className="mt-2 text-xs text-slate-500">Successful payments, excluding credit</p></div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-blue-200/10 bg-blue-200/10"><CreditCard className="h-6 w-6 text-blue-200" /></div>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-2xl border border-white/10 bg-slate-900/75 p-5 shadow-xl shadow-black/10 backdrop-blur">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-slate-400">All Transactions</p><p className="mt-1 text-3xl font-bold text-white">{(stats?.transactions || 0).toLocaleString('en-NG')}</p><p className="mt-2 text-xs text-slate-500">Across your account</p></div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-blue-200/10 bg-blue-200/10"><Receipt className="h-6 w-6 text-cyan-200" /></div>
            </div>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 rounded-2xl border border-cyan-200/15 bg-gradient-to-br from-slate-900/95 to-blue-950/70 p-6 shadow-xl shadow-blue-950/20 backdrop-blur sm:p-7">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="font-semibold text-lg">Credit Account</h2>
              <p className="text-sm text-slate-400">Limit: ₦{(creditAccount?.maxCredit || 10000).toLocaleString()} · Simulated credit</p>
              {creditLoading ? (
                <p className="mt-2 text-sm text-slate-300">Loading your credit account…</p>
              ) : creditError ? (
                <div className="mt-2">
                  <p role="alert" className="text-sm text-red-600">{creditError}</p>
                  <button type="button" onClick={loadCreditAccount} className="text-sm font-medium text-primary-700 hover:underline">Try again</button>
                </div>
              ) : (
                <>
                  <p className="mt-2 text-2xl font-bold text-cyan-100">Outstanding: ₦{(creditAccount?.balance || 0).toLocaleString()}</p>
                  {creditAccount?.balance > 0
                    ? <p className="mt-1 text-sm text-slate-300">Repay the full balance before buying on credit again.</p>
                    : <p className="mt-1 text-sm text-slate-300">Available: ₦{(creditAccount?.maxCredit || 10000).toLocaleString()}. Choose “Buy on credit” when purchasing a token.</p>}
                </>
              )}
            </div>
            {!creditLoading && !creditError && creditAccount?.balance > 0 && (
              <button onClick={repayCredit} disabled={repayingCredit} className="btn-primary disabled:opacity-60">
                {repayingCredit ? 'Recording repayment…' : `Record repayment · ₦${creditAccount.balance.toLocaleString()}`}
              </button>
            )}
            {!creditLoading && !creditError && creditAccount?.balance === 0 && (
              <Link to="/buy-token" className="btn-primary text-center">Start a credit purchase</Link>
            )}
          </div>
          <p className="mt-3 text-xs text-slate-400">Credit and repayments are simulated; no money is collected. A saved, approved meter is required to purchase.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-white">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/buy-token" className="group rounded-2xl border border-white/10 bg-slate-900/75 p-5 text-center transition hover:-translate-y-1 hover:border-cyan-200/30 hover:bg-slate-900"><Zap className="mx-auto mb-2 h-8 w-8 text-cyan-200 transition-transform group-hover:scale-110"/><p className="text-sm font-medium text-white">Buy Token</p></Link>
            <Link to="/dashboard/meters" className="group rounded-2xl border border-white/10 bg-slate-900/75 p-5 text-center transition hover:-translate-y-1 hover:border-cyan-200/30 hover:bg-slate-900"><Plus className="mx-auto mb-2 h-8 w-8 text-cyan-200 transition-transform group-hover:scale-110"/><p className="text-sm font-medium text-white">Add Meter</p></Link>
            <Link to="/complaints/new" className="group rounded-2xl border border-white/10 bg-slate-900/75 p-5 text-center transition hover:-translate-y-1 hover:border-cyan-200/30 hover:bg-slate-900"><AlertCircle className="mx-auto mb-2 h-8 w-8 text-cyan-200 transition-transform group-hover:scale-110"/><p className="text-sm font-medium text-white">Report Problem</p></Link>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-[1.3fr_0.7fr] gap-6 mb-8">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="rounded-2xl border border-white/10 bg-slate-900/75 p-5 shadow-xl shadow-black/10 backdrop-blur sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div><h2 className="text-lg font-semibold text-white">Recent Activity</h2><p className="mt-1 text-xs text-slate-400">Latest purchases and credit activity</p></div>
            </div>
            {recent.length === 0 ? (
              <p className="py-8 text-center text-slate-400">No transactions yet</p>
            ) : (
              <div className="space-y-3">
                {recent.map((t) => (
                  <div key={t._id} className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 transition-colors hover:bg-white/[0.06]">
                    <div className="flex items-center gap-4">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${t.paymentStatus === 'success' ? 'bg-emerald-300/10 text-emerald-200' : 'bg-rose-300/10 text-rose-200'}`}>
                        {t.paymentStatus === 'success' ? <TrendingUp className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                      </div>
                      <div><p className="text-sm font-medium text-white">₦{t.amount.toLocaleString('en-NG')}</p><p className="text-xs text-slate-400">{t.meterNumber}</p></div>
                    </div>
                    <div className="text-right">
                      <span className={`rounded-full border px-2 py-1 text-xs ${t.paymentMethod === 'credit' && t.creditStatus === 'unpaid' ? 'border-blue-200/20 bg-blue-300/10 text-blue-100' : t.paymentStatus === 'success' ? 'border-emerald-200/20 bg-emerald-300/10 text-emerald-100' : 'border-rose-200/20 bg-rose-300/10 text-rose-100'}`}>{t.paymentMethod === 'credit' ? (t.creditStatus === 'paid' ? 'credit repaid' : 'credit due') : t.paymentStatus}</span>
                      <p className="mt-1 text-xs text-slate-500">{new Date(t.createdAt).toLocaleDateString('en-NG')}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-5 border-t border-white/10 pt-4 text-right">
              <Link to="/transactions" className="inline-flex items-center gap-2 rounded-xl border border-cyan-200/20 bg-cyan-200/10 px-4 py-2.5 text-sm font-semibold text-cyan-100 transition hover:border-cyan-200/40 hover:bg-cyan-200/15">
                <Receipt className="h-4 w-4" /> View transaction history
              </Link>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="rounded-2xl border border-white/10 bg-slate-900/75 p-5 shadow-xl shadow-black/10 backdrop-blur sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-white"><Bell className="h-4 w-4 text-cyan-200" /> System Alerts</h2>
            </div>
            {notifications.length === 0 ? (
              <p className="py-6 text-sm text-slate-400">No recent alerts</p>
            ) : (
              <div className="space-y-3">
                {notifications.slice(0, 4).map((item) => (
                  <div key={item._id} className={`rounded-lg border p-3 ${notificationStyles[item.type] || notificationStyles.info}`}>
                    <p className="font-medium text-sm">{item.title}</p>
                    <p className="text-xs mt-1 opacity-80">{item.message}</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}