import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, CreditCard, Receipt, AlertCircle, Plus, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';
import Loading from '../ui/Loading';

export default function CustomerDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [metersRes, transRes] = await Promise.all([
          api.get('/meters'),
          api.get('/transactions/history?limit=5')
        ]);
        const meters = metersRes.data;
        const transactions = transRes.data.transactions || [];
        const totalSpent = transactions.filter(t => t.paymentStatus === 'success').reduce((sum, t) => sum + t.amount, 0);
        setStats({ meters: meters.length, spent: totalSpent, transactions: transactions.length });
        setRecent(transactions);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  if (loading) return <Loading fullScreen />;

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-20">
      <div className="section-padding max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">{greeting()}, {user?.firstName} 👋</h1>
          <p className="text-gray-600">Here's what's happening with your account</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card">
            <div className="flex items-center justify-between">
              <div><p className="text-gray-600 text-sm">My Meters</p><p className="text-3xl font-bold text-primary-700">{stats?.meters || 0}</p></div>
              <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center"><Zap className="w-6 h-6 text-primary-600" /></div>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card">
            <div className="flex items-center justify-between">
              <div><p className="text-gray-600 text-sm">Total Spent</p><p className="text-3xl font-bold text-primary-700">₦{(stats?.spent || 0).toLocaleString()}</p></div>
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center"><CreditCard className="w-6 h-6 text-green-600" /></div>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card">
            <div className="flex items-center justify-between">
              <div><p className="text-gray-600 text-sm">Transactions</p><p className="text-3xl font-bold text-primary-700">{stats?.transactions || 0}</p></div>
              <div className="w-12 h-12 bg-electric-50 rounded-xl flex items-center justify-center"><Receipt className="w-6 h-6 text-electric-600" /></div>
            </div>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/buy-token" className="card text-center hover:border-primary-300 group"><Zap className="w-8 h-8 text-primary-600 mx-auto mb-2 group-hover:scale-110 transition-transform"/><p className="font-medium text-sm">Buy Token</p></Link>
            <Link to="/dashboard/meters" className="card text-center hover:border-primary-300 group"><Plus className="w-8 h-8 text-primary-600 mx-auto mb-2 group-hover:scale-110 transition-transform"/><p className="font-medium text-sm">Add Meter</p></Link>
            <Link to="/transactions" className="card text-center hover:border-primary-300 group"><Receipt className="w-8 h-8 text-primary-600 mx-auto mb-2 group-hover:scale-110 transition-transform"/><p className="font-medium text-sm">View Transactions</p></Link>
            <Link to="/complaints/new" className="card text-center hover:border-primary-300 group"><AlertCircle className="w-8 h-8 text-primary-600 mx-auto mb-2 group-hover:scale-110 transition-transform"/><p className="font-medium text-sm">Report Problem</p></Link>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Transactions</h2>
            <Link to="/transactions" className="text-primary-600 text-sm hover:underline">View All</Link>
          </div>
          {recent.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No transactions yet</p>
          ) : (
            <div className="space-y-3">
              {recent.map((t) => (
                <div key={t._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${t.paymentStatus === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      {t.paymentStatus === 'success' ? <TrendingUp className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    </div>
                    <div><p className="font-medium text-sm">₦{t.amount.toLocaleString()}</p><p className="text-xs text-gray-500">{t.meterNumber}</p></div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded-full ${t.paymentStatus === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{t.paymentStatus}</span>
                    <p className="text-xs text-gray-400 mt-1">{new Date(t.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}