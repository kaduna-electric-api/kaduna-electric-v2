import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const CATEGORIES = ['Payment problem', 'Token problem', 'Meter problem', 'Account problem', 'Failed transaction', 'Other'];

export default function NewComplaint() {
  const [form, setForm] = useState({ category: '', subject: '', description: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/complaints', form);
      toast.success(`Complaint submitted: ${data.reference}`);
      navigate('/complaints');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-20">
      <div className="section-padding max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><AlertCircle className="w-6 h-6 text-primary-600"/> New Complaint</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select required className="input-field" value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Subject</label>
              <input required className="input-field" value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})}/>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea required rows={4} className="input-field" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/>
            </div>
            <button type="submit" disabled={loading} className="w-full btn-primary flex items-center justify-center gap-2">
              {loading ? 'Submitting...' : <><Send className="w-4 h-4"/> Submit Complaint</>}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}