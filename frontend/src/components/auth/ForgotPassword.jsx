import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
      toast.success('Reset email sent!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Request failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center mx-auto mb-4"><Mail className="w-6 h-6 text-white"/></div>
          <h2 className="text-2xl font-bold">Reset Password</h2>
        </div>
        {sent ? (
          <div className="text-center p-4 bg-green-50 rounded-xl text-green-700"><p>Check your email for reset instructions.</p></div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="email" required placeholder="Enter your email" className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} />
            <button type="submit" disabled={loading} className="w-full btn-primary disabled:opacity-50">{loading ? 'Sending...' : 'Send Reset Link'}</button>
          </form>
        )}
        <Link to="/login" className="flex items-center justify-center gap-2 mt-6 text-sm text-primary-600 hover:underline"><ArrowLeft className="w-4 h-4" /> Back to Login</Link>
      </motion.div>
    </div>
  );
}