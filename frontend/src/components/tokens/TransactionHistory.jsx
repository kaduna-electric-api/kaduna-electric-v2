import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../services/api';
import Loading from '../ui/Loading';
import toast from 'react-hot-toast';

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => { fetchTransactions(); }, [page]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/transactions/history?page=${page}&limit=10`);
      setTransactions(data.transactions);
      setPagination(data.pagination);
    } catch (err) { toast.error('Failed to load transactions'); }
    finally { setLoading(false); }
  };

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
    } catch { toast.error('Failed to download receipt'); }
  };

  if (loading) return <Loading fullScreen/>;

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-20">
      <div className="section-padding max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
          <h1 className="text-2xl font-bold">Transaction History</h1>
          <p className="text-gray-600">View and download receipts for all your purchases</p>
        </motion.div>
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Meter</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Amount</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Units</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Action</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-sm">{new Date(t.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-sm font-mono">{t.meterNumber}</td>
                    <td className="py-3 px-4 text-sm font-medium">₦{t.amount.toLocaleString()}</td>
                    <td className="py-3 px-4 text-sm">{t.units} kWh</td>
                    <td className="py-3 px-4"><span className={`text-xs px-2 py-1 rounded-full ${t.paymentStatus==='success'?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>{t.paymentStatus}</span></td>
                    <td className="py-3 px-4 text-right">{t.paymentStatus==='success' && (<button onClick={()=>downloadReceipt(t._id, t.transactionRef)} className="text-primary-600 hover:text-primary-800"><Download className="w-4 h-4"/></button>)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {transactions.length === 0 && <div className="text-center py-12 text-gray-500">No transactions found</div>}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-gray-100">
              <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} className="flex items-center gap-1 text-sm text-gray-600 hover:text-primary-600 disabled:opacity-50"><ChevronLeft className="w-4 h-4"/> Previous</button>
              <span className="text-sm text-gray-600">Page {page} of {pagination.pages}</span>
              <button onClick={()=>setPage(p=>Math.min(pagination.pages,p+1))} disabled={page===pagination.pages} className="flex items-center gap-1 text-sm text-gray-600 hover:text-primary-600 disabled:opacity-50">Next <ChevronRight className="w-4 h-4"/></button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}