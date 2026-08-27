import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Eye, EyeOff } from 'lucide-react';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

export default function Register() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', phone: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', form);
      setAuth(data.user, data.token);
      toast.success('Account created successfully!');
      window.location.href = '/dashboard';
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-blue-100 py-12 px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center mx-auto mb-4"><Zap className="w-6 h-6 text-white"/></div>
          <h2 className="text-2xl font-bold">Create Account</h2>
          <p className="text-gray-600 text-sm mt-1">Start managing your electricity payments</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">First Name</label><input required className="input-field" value={form.firstName} onChange={(e) => setForm({...form, firstName: e.target.value})} /></div>
            <div><label className="block text-sm font-medium mb-1">Last Name</label><input required className="input-field" value={form.lastName} onChange={(e) => setForm({...form, lastName: e.target.value})} /></div>
          </div>
          <div><label className="block text-sm font-medium mb-1">Email</label><input type="email" required className="input-field" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} /></div>
          <div><label className="block text-sm font-medium mb-1">Phone</label><input type="tel" className="input-field" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} /></div>
          <div><label className="block text-sm font-medium mb-1">Password</label>
            <div className="relative">
              <input type={showPass ? 'text' : 'password'} required className="input-field pr-10" minLength={6} value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-3.5 text-gray-400">{showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full btn-primary disabled:opacity-50">{loading ? 'Creating account...' : 'Create Account'}</button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">Already have an account? <Link to="/login" className="text-primary-600 hover:underline font-medium">Sign In</Link></p>
      </motion.div>
    </div>
  );
}