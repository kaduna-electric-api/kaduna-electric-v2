import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, CreditCard, CheckCircle, AlertCircle, TrendingUp, BarChart3 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../../services/api';
import Loading from '../ui/Loading';
import toast from 'react-hot-toast';

const COLORS = ['#22c55e', '#ef4444', '#f59e0b'];

export default function AdminOverview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard').then(res => { setStats(res.data); setLoading(false); })
    .catch(() => { toast.error('Failed to load dashboard'); setLoading(false); });
  }, []);

  if (loading) return <Loading fullScreen/>;

  const statCards = [
    { icon: Users, label: 'Total Customers', value: stats?.stats?.totalCustomers || 0, color: 'bg-primary-50 text-primary-600' },
    { icon: CreditCard, label: 'Total Transactions', value: stats?.stats?.totalTransactions || 0, color: 'bg-purple-50 text-purple-600' },
    { icon: CheckCircle, label: 'Successful Payments', value: stats?.stats?.successfulPayments || 0, color: 'bg-green-50 text-green-600' },
    { icon: TrendingUp, label: 'Total Revenue', value: `₦${(stats?.stats?.totalRevenue || 0).toLocaleString()}`, color: 'bg-electric-50 text-electric-600' },
    { icon: AlertCircle, label: 'Pending Complaints', value: stats?.stats?.pendingComplaints || 0, color: 'bg-red-50 text-red-600' },
    { icon: Users, label: 'New Users (This Month)', value: stats?.stats?.newUsersThisMonth || 0, color: 'bg-indigo-50 text-indigo-600' },
  ];

  return (
    <div className="p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard Overview</h1>
        <p className="text-slate-400">Real-time system analytics and statistics</p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {statCards.map((card, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-slate-800 rounded-xl p-5 border border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.color}`}>
                <card.icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{card.value}</p>
            <p className="text-sm text-slate-400">{card.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Revenue (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={stats?.revenueByDay || []}>
              <defs><linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="_id" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
              <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRev)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Payment Status Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={stats?.transactionsByStatus || []} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="count">
                {(stats?.transactionsByStatus || []).map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {['Success', 'Failed', 'Pending'].map((label, i) => (
              <div key={label} className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }}/><span className="text-sm text-slate-400">{label}</span></div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}