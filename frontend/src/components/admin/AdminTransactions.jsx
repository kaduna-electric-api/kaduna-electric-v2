import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, CreditCard, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import api from '../../services/api';
import Loading from '../ui/Loading';
import toast from 'react-hot-toast';

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchTransactions(); }, [page, search]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/admin/transactions?page=${page}&limit=20&search=${search}`);
      setTransactions(data.transactions);
      setPagination({ total: data.total, pages: data.pages });
    } catch { toast.error('Failed to load transactions'); }
    finally { setLoading(false); }
  };

  if (loading) return <Loading fullScreen/>;

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2"><CreditCard className="w-5 h-5"/> All Transactions</h2>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400"/>
          <input placeholder="Search transactions..." className="bg-slate-800 border border-slate-700 text-white pl-10 pr-4 py-2 rounded-lg text-sm w-64" value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}}/>
        </div>
      </div>
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900 border-b border-slate-700">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Date</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Customer</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Meter</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Amount</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Method</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(t => (
                <tr key={t._id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                  <td className="py-3 px-4 text-slate-300 text-sm">{new Date(t.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 px-4 text-white text-sm">{t.user?.firstName} {t.user?.lastName}</td>
                  <td className="py-3 px-4 text-slate-300 text-sm font-mono">{t.meterNumber}</td>
                  <td className="py-3 px-4 text-white text-sm font-medium">₦{t.amount.toLocaleString()}</td>
                  <td className="py-3 px-4"><span className={`text-xs px-2 py-1 rounded-full ${t.paymentStatus==='success'?'bg-green-900 text-green-400':'bg-red-900 text-red-400'}`}>{t.paymentStatus}</span></td>
                  <td className="py-3 px-4 text-slate-300 text-sm capitalize">{t.paymentMethod}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {transactions.length === 0 && <p className="text-center text-slate-500 py-12">No transactions found</p>}
      </div>
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} className="flex items-center gap-1 text-sm text-slate-400 hover:text-white disabled:opacity-50"><ChevronLeft className="w-4 h-4"/> Previous</button>
          <span className="text-sm text-slate-400">Page {page} of {pagination.pages}</span>
          <button onClick={()=>setPage(p=>Math.min(pagination.pages,p+1))} disabled={page===pagination.pages} className="flex items-center gap-1 text-sm text-slate-400 hover:text-white disabled:opacity-50">Next <ChevronRight className="w-4 h-4"/></button>
        </div>
      )}
    </div>
  );
}