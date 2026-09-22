import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, ArrowLeft } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) return toast.error('Password must be at least 6 characters');
    if (password !== confirm) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      const { data } = await api.post(`/auth/reset-password/${token}`, { password });
      toast.success(data.message || 'Password reset successful');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center mx-auto mb-4"><Lock className="w-6 h-6 text-white"/></div>
          <h2 className="text-2xl font-bold">Set New Password</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="password" required placeholder="New password" className="input-field" value={password} onChange={(e)=>setPassword(e.target.value)} />
          <input type="password" required placeholder="Confirm password" className="input-field" value={confirm} onChange={(e)=>setConfirm(e.target.value)} />
          <button type="submit" disabled={loading} className="w-full btn-primary disabled:opacity-50">{loading ? 'Saving...' : 'Set Password'}</button>
        </form>
        <Link to="/login" className="flex items-center justify-center gap-2 mt-6 text-sm text-primary-600 hover:underline"><ArrowLeft className="w-4 h-4"/> Back to Login</Link>
      </motion.div>
    </div>
  );
}
