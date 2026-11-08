import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, ChevronLeft, ChevronRight, Search, Receipt, Zap, Eye, X, Copy } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Loading from '../ui/Loading';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';

const formatAmount = (amount) => `₦${Number(amount || 0).toLocaleString('en-NG')}`;

const getStatusLabel = (transaction) => {
  if (transaction.paymentMethod === 'credit') {
    return transaction.creditStatus === 'paid' ? 'Credit repaid' : 'Credit due';
  }
  return transaction.paymentStatus;
};

const getStatusStyle = (transaction) => {
  if (transaction.paymentMethod === 'credit') {
    return transaction.creditStatus === 'paid'
      ? 'border-cyan-300/20 bg-cyan-300/10 text-cyan-100'
      : 'border-blue-300/20 bg-blue-300/10 text-blue-100';
  }
  return transaction.paymentStatus === 'success'
    ? 'border-emerald-300/20 bg-emerald-300/10 text-emerald-100'
    : transaction.paymentStatus === 'pending'
      ? 'border-amber-300/20 bg-amber-300/10 text-amber-100'
      : 'border-rose-300/20 bg-rose-300/10 text-rose-100';
};

export default function TransactionHistory() {
  const { user } = useAuthStore();
  const [transactions, setTransactions] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [summary, setSummary] = useState({ totalTransactions: 0, totalSpent: 0 });
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams({ page: String(page), limit: '10', status });
        if (search.trim()) params.set('search', search.trim());
        const { data } = await api.get(`/transactions/history?${params}`, { signal: controller.signal });
        setTransactions(data.transactions || []);
        setSummary(data.summary || { totalTransactions: data.pagination?.total || 0, totalSpent: 0 });
        setPagination(data.pagination || {});
      } catch (requestError) {
        if (controller.signal.aborted) return;
        console.error('Failed to load transaction history', requestError);
        setError(requestError.response?.data?.message || 'We could not load your transactions. Please try again.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [page, search, status, reloadKey]);

  const downloadReceipt = async (id, ref) => {
    try {
      const response = await api.get(`/transactions/${id}/receipt`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `receipt-${ref}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download transaction receipt', error);
      toast.error(error.response?.data?.message || 'Failed to download receipt');
    }
  };

  const copyToken = async () => {
    if (!selectedTransaction?.token || selectedTransaction.token === 'PENDING') return;
    try {
      await navigator.clipboard.writeText(selectedTransaction.token.replace(/\s/g, ''));
      toast.success('Token copied');
    } catch (error) {
      console.error('Failed to copy transaction token', error);
      toast.error('Unable to copy token. Select and copy it manually.');
    }
  };

  useEffect(() => {
    if (!selectedTransaction) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setSelectedTransaction(null);
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [selectedTransaction]);

  if (loading && transactions.length === 0 && !error) return <Loading fullScreen />;

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 pb-20 pt-8 text-white">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_78%_0%,rgba(14,165,233,0.2),transparent_38%),radial-gradient(ellipse_at_5%_55%,rgba(37,99,235,0.16),transparent_35%)]" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:linear-gradient(to_bottom,black,transparent_90%)]" />
      <div className="section-padding relative mx-auto max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex flex-col gap-5 rounded-3xl border border-white/10 bg-slate-900/75 p-6 shadow-2xl shadow-blue-950/30 backdrop-blur-xl sm:flex-row sm:items-end sm:justify-between sm:p-8">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-cyan-200/20 bg-cyan-200/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100">
                <Receipt className="h-3.5 w-3.5" /> Account activity
              </span>
              <Link to="/dashboard" className="text-xs font-medium text-slate-300 transition hover:text-cyan-100">← Back to dashboard</Link>
            </div>
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Transaction history</h1>
            <p className="mt-2 text-sm text-slate-300 sm:text-base">Search purchases, check payment status, and download receipts.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:min-w-72">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-xs uppercase tracking-wider text-slate-400">Transactions</p>
              <p className="mt-1 text-2xl font-bold text-white">{summary.totalTransactions.toLocaleString('en-NG')}</p>
            </div>
            <div className="rounded-2xl border border-cyan-200/15 bg-cyan-200/[0.06] p-4">
              <p className="text-xs uppercase tracking-wider text-cyan-100/70">Paid total</p>
              <p className="mt-1 text-2xl font-bold text-cyan-100">{formatAmount(summary.totalSpent)}</p>
            </div>
          </div>
        </motion.div>

        <div className="mb-5 grid gap-3 rounded-2xl border border-white/10 bg-slate-900/70 p-4 backdrop-blur sm:grid-cols-[1fr_220px]">
          <label className="relative block">
            <span className="sr-only">Search meter number or transaction reference</span>
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => { setSearch(event.target.value); setPage(1); }}
              maxLength={100}
              placeholder="Search meter number or reference"
              className="w-full rounded-xl border border-white/10 bg-slate-950/80 py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/10"
            />
          </label>
          <label>
            <span className="sr-only">Filter by transaction status</span>
            <select
              value={status}
              onChange={(event) => { setStatus(event.target.value); setPage(1); }}
              className="w-full rounded-xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/50"
            >
              <option value="all">All activity</option>
              <option value="success">Successful</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="credit-due">Credit due</option>
              <option value="credit-paid">Credit repaid</option>
            </select>
          </label>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/75 shadow-2xl shadow-blue-950/20 backdrop-blur-xl">
          {error && (
            <div role="alert" className="m-4 rounded-xl border border-rose-300/20 bg-rose-300/10 p-4 text-sm text-rose-100">
              {error}
              <button type="button" onClick={() => setReloadKey((current) => current + 1)} className="ml-2 font-semibold underline">Retry</button>
            </div>
          )}
          {loading && transactions.length > 0 && <div className="h-1 animate-pulse bg-gradient-to-r from-blue-500 via-cyan-300 to-blue-500" />}

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[760px]">
              <thead className="border-b border-white/10 bg-white/[0.03]">
                <tr>
                  {['Date', 'Meter', 'Amount', 'Units', 'Status', 'Details'].map((heading) => (
                    <th key={heading} className={`px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400 ${heading === 'Details' ? 'text-right' : 'text-left'}`}>{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {transactions.map((transaction) => (
                  <tr key={transaction._id} className="transition-colors hover:bg-white/[0.035]">
                    <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-300">{new Date(transaction.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td className="px-5 py-4"><p className="font-mono text-sm text-white">{transaction.meterNumber}</p><p className="mt-1 text-xs text-slate-500">{transaction.transactionRef}</p></td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-white">{formatAmount(transaction.amount)}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-300">{transaction.units} kWh</td>
                    <td className="px-5 py-4"><span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${getStatusStyle(transaction)}`}>{getStatusLabel(transaction)}</span></td>
                    <td className="px-5 py-4 text-right">
                      <button type="button" aria-label={`View receipt for ${transaction.transactionRef}`} onClick={() => setSelectedTransaction(transaction)} className="inline-flex items-center gap-2 rounded-lg border border-cyan-200/20 bg-cyan-200/[0.05] px-3 py-2 text-xs font-medium text-cyan-100 transition hover:border-cyan-200/40 hover:bg-cyan-200/10">
                        <Eye className="h-4 w-4" /> View details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="divide-y divide-white/[0.06] md:hidden">
            {transactions.map((transaction) => (
              <article key={transaction._id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-300/10 text-cyan-200"><Zap className="h-5 w-5" /></span>
                    <div className="min-w-0">
                      <p className="font-semibold text-white">{formatAmount(transaction.amount)}</p>
                      <p className="mt-1 truncate font-mono text-xs text-slate-400">{transaction.meterNumber}</p>
                      <p className="mt-1 truncate text-xs text-slate-500">{transaction.transactionRef}</p>
                    </div>
                  </div>
                  <span className={`shrink-0 rounded-full border px-2 py-1 text-[11px] font-medium capitalize ${getStatusStyle(transaction)}`}>{getStatusLabel(transaction)}</span>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                  <span>{new Date(transaction.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })} · {transaction.units} kWh</span>
                  <button type="button" onClick={() => setSelectedTransaction(transaction)} className="inline-flex items-center gap-1.5 font-medium text-cyan-200">
                    <Eye className="h-4 w-4" /> View receipt
                  </button>
                </div>
              </article>
            ))}
          </div>

          {!loading && transactions.length === 0 && !error && (
            <div className="px-6 py-16 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-300/10 text-cyan-200"><Receipt className="h-7 w-7" /></span>
              <h2 className="mt-4 font-semibold text-white">No transactions found</h2>
              <p className="mt-1 text-sm text-slate-400">{search || status !== 'all' ? 'Try another search or clear the status filter.' : 'Your purchases and receipts will appear here.'}</p>
            </div>
          )}

          {pagination.pages > 1 && (
            <div className="flex items-center justify-between border-t border-white/10 px-4 py-4 sm:px-5">
              <button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1 || loading} className="inline-flex items-center gap-1 text-sm text-slate-300 transition hover:text-cyan-200 disabled:opacity-40"><ChevronLeft className="h-4 w-4" /> Previous</button>
              <span className="text-xs text-slate-400 sm:text-sm">Page {page} of {pagination.pages} · {pagination.total} results</span>
              <button type="button" onClick={() => setPage((current) => Math.min(pagination.pages, current + 1))} disabled={page === pagination.pages || loading} className="inline-flex items-center gap-1 text-sm text-slate-300 transition hover:text-cyan-200 disabled:opacity-40">Next <ChevronRight className="h-4 w-4" /></button>
            </div>
          )}
        </div>
      </div>
      {selectedTransaction && (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-950/80 p-0 backdrop-blur-sm sm:items-center sm:p-5"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedTransaction(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="receipt-details-title"
            className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl border border-white/10 bg-slate-900 shadow-2xl shadow-black/50 sm:rounded-3xl"
          >
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-white/10 bg-slate-900/95 p-5 backdrop-blur sm:p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200">King&apos;s Power</p>
                <h2 id="receipt-details-title" className="mt-1 text-xl font-bold text-white sm:text-2xl">Purchase receipt</h2>
                <p className="mt-1 text-sm text-slate-400">Full transaction details, available right here.</p>
              </div>
              <button type="button" aria-label="Close receipt details" onClick={() => setSelectedTransaction(null)} className="rounded-xl border border-white/10 p-2 text-slate-300 transition hover:border-white/20 hover:bg-white/10 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 p-5 sm:p-6">
              <div className="rounded-2xl border border-cyan-200/15 bg-gradient-to-br from-blue-500/15 to-cyan-300/[0.04] p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-300">{selectedTransaction.paymentMethod === 'credit' ? 'Credit purchase amount' : 'Purchase amount'}</p>
                    <p className="mt-1 text-3xl font-black text-white">{formatAmount(selectedTransaction.amount)}</p>
                  </div>
                  <span className={`rounded-full border px-3 py-1.5 text-xs font-semibold capitalize ${getStatusStyle(selectedTransaction)}`}>{getStatusLabel(selectedTransaction)}</span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 border-t border-white/10 pt-4">
                  <div><p className="text-xs text-slate-400">Energy units</p><p className="mt-1 font-semibold text-white">{selectedTransaction.units} kWh</p></div>
                  <div><p className="text-xs text-slate-400">Date and time</p><p className="mt-1 text-sm font-medium text-white">{new Date(selectedTransaction.createdAt).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' })}</p></div>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-white/10">
                <h3 className="border-b border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-white">Transaction information</h3>
                <dl className="divide-y divide-white/[0.06] px-4">
                  <div className="flex flex-wrap justify-between gap-2 py-3 text-sm"><dt className="text-slate-400">Customer</dt><dd className="text-right font-medium text-white">{[user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Account holder'}</dd></div>
                  <div className="flex flex-wrap justify-between gap-2 py-3 text-sm"><dt className="text-slate-400">Email</dt><dd className="break-all text-right font-medium text-white">{user?.email || '—'}</dd></div>
                  <div className="flex flex-wrap justify-between gap-2 py-3 text-sm"><dt className="text-slate-400">Meter number</dt><dd className="font-mono font-medium text-white">{selectedTransaction.meterNumber}</dd></div>
                  {selectedTransaction.meter?.nickname && <div className="flex flex-wrap justify-between gap-2 py-3 text-sm"><dt className="text-slate-400">Meter name</dt><dd className="text-right font-medium text-white">{selectedTransaction.meter.nickname}</dd></div>}
                  {selectedTransaction.meter?.address && <div className="flex flex-wrap justify-between gap-2 py-3 text-sm"><dt className="text-slate-400">Meter address</dt><dd className="text-right font-medium text-white">{selectedTransaction.meter.address}</dd></div>}
                  <div className="flex flex-wrap justify-between gap-2 py-3 text-sm"><dt className="text-slate-400">Payment method</dt><dd className="text-right font-medium text-white">{selectedTransaction.paymentMethod === 'demo' ? 'Simulated payment' : selectedTransaction.paymentMethod === 'paystack' ? 'Paystack checkout' : selectedTransaction.paymentMethod === 'credit' ? 'Simulated credit' : selectedTransaction.paymentMethod}</dd></div>
                  {selectedTransaction.paymentMethod === 'credit' && <div className="flex flex-wrap justify-between gap-2 py-3 text-sm"><dt className="text-slate-400">Credit repayment</dt><dd className="text-right font-medium text-white">{selectedTransaction.creditStatus === 'paid' ? 'Repaid (simulated)' : 'Outstanding'}</dd></div>}
                  <div className="flex flex-wrap justify-between gap-2 py-3 text-sm"><dt className="text-slate-400">Transaction reference</dt><dd className="break-all text-right font-mono text-xs font-medium text-white">{selectedTransaction.transactionRef}</dd></div>
                  {selectedTransaction.paystackRef && <div className="flex flex-wrap justify-between gap-2 py-3 text-sm"><dt className="text-slate-400">Payment reference</dt><dd className="break-all text-right font-mono text-xs font-medium text-white">{selectedTransaction.paystackRef}</dd></div>}
                </dl>
              </div>

              {selectedTransaction.paymentStatus === 'success' && selectedTransaction.token !== 'PENDING' && (
                <div className="rounded-2xl border border-blue-200/15 bg-blue-300/[0.06] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wider text-blue-100/70">Generated token</p>
                      <p className="mt-2 break-all font-mono text-lg font-bold tracking-wider text-white">{selectedTransaction.token}</p>
                    </div>
                    <button type="button" onClick={copyToken} className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/10">
                      <Copy className="h-4 w-4" /> Copy
                    </button>
                  </div>
                </div>
              )}

              <div className="rounded-xl border border-cyan-200/10 bg-cyan-200/[0.04] p-3 text-xs leading-5 text-cyan-50/80">
                This app uses simulated payments and generated sample tokens. They do not recharge real electricity meters.
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-4 sm:flex-row sm:justify-end">
                <button type="button" onClick={() => setSelectedTransaction(null)} className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.06]">Close</button>
                {selectedTransaction.paymentStatus === 'success' && (
                  <button type="button" onClick={() => downloadReceipt(selectedTransaction._id, selectedTransaction.transactionRef)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-300 to-blue-400 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:brightness-110">
                    <Download className="h-4 w-4" /> Download PDF
                  </button>
                )}
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
