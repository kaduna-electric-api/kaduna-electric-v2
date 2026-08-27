import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Copy, Download, Home } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Loading from '../ui/Loading';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const reference = searchParams.get('reference');

  useEffect(() => {
    if (reference) {
      api.get(`/payments/verify/${reference}`)
        .then(res => setTransaction(res.data.transaction))
        .catch(() => toast.error('Failed to verify payment'))
        .finally(() => setLoading(false));
    } else { setLoading(false); }
  }, [reference]);

  if (loading) return <Loading fullScreen/>;
  if (!transaction) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center"><p className="text-gray-600">No transaction found</p><Link to="/dashboard" className="btn-primary mt-4 inline-block">Go to Dashboard</Link></div>
    </div>
  );

  const copyToken = () => { navigator.clipboard.writeText(transaction.token.replace(/ /g,'')); toast.success('Token copied!'); };

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-20">
      <div className="section-padding max-w-lg mx-auto">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="card text-center space-y-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto"><Check className="w-10 h-10 text-green-600"/></div>
          <div><h3 className="text-2xl font-bold text-green-700">Payment Successful</h3><p className="text-gray-600">Your token has been generated</p></div>
          <div className="bg-gray-50 rounded-xl p-6 space-y-3 text-left">
            <div className="flex justify-between"><span className="text-gray-600">Meter</span><span className="font-medium">{transaction.meterNumber}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Amount</span><span className="font-medium">₦{transaction.amount.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Units</span><span className="font-medium">{transaction.units} kWh</span></div>
            <div className="pt-3 border-t"><p className="text-sm text-gray-500 mb-1">Token</p><p className="text-xl font-bold text-primary-700 tracking-wider">{transaction.token}</p></div>
            <div className="flex justify-between text-sm pt-2"><span className="text-gray-500">Transaction ID</span><span className="font-mono">{transaction.transactionRef}</span></div>
          </div>
          <div className="flex gap-3 justify-center">
            <button onClick={copyToken} className="btn-secondary flex items-center gap-2"><Copy className="w-4 h-4"/> Copy Token</button>
            <Link to="/transactions" className="btn-primary flex items-center gap-2"><Download className="w-4 h-4"/> View Receipt</Link>
          </div>
          <Link to="/dashboard" className="text-primary-600 hover:underline flex items-center justify-center gap-1 text-sm"><Home className="w-4 h-4"/> Back to Dashboard</Link>
        </motion.div>
      </div>
    </div>
  );
}