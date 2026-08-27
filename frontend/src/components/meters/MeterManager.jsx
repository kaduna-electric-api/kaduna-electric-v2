import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Zap, Check, X } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function MeterManager() {
  const [meters, setMeters] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ meterNumber: '', nickname: '', address: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchMeters(); }, []);

  const fetchMeters = async () => {
    try { const { data } = await api.get('/meters'); setMeters(data); }
    catch { toast.error('Failed to load meters'); }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/meters', form);
      toast.success('Meter added successfully');
      setShowAdd(false);
      setForm({ meterNumber: '', nickname: '', address: '' });
      fetchMeters();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add meter');
    } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this meter?')) return;
    try { await api.delete(`/meters/${id}`); toast.success('Meter removed'); fetchMeters(); }
    catch { toast.error('Failed to remove meter'); }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">My Meters</h2>
        <button onClick={()=>setShowAdd(!showAdd)} className="btn-primary flex items-center gap-2 text-sm"><Plus className="w-4 h-4"/> Add Meter</button>
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} onSubmit={handleAdd} className="card mb-6 overflow-hidden">
            <h3 className="font-semibold mb-4">Add New Meter</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <input required placeholder="Meter Number" className="input-field" value={form.meterNumber} onChange={e=>setForm({...form,meterNumber:e.target.value})}/>
              <input placeholder="Nickname (optional)" className="input-field" value={form.nickname} onChange={e=>setForm({...form,nickname:e.target.value})}/>
              <input placeholder="Address (optional)" className="input-field" value={form.address} onChange={e=>setForm({...form,address:e.target.value})}/>
            </div>
            <div className="flex gap-3 mt-4">
              <button type="button" onClick={()=>setShowAdd(false)} className="btn-secondary text-sm">Cancel</button>
              <button type="submit" disabled={loading} className="btn-primary text-sm">{loading?'Adding...':'Add Meter'}</button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {meters.map(meter => (
          <motion.div key={meter._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center"><Zap className="w-5 h-5 text-primary-600"/></div>
                <div>
                  <p className="font-semibold">{meter.nickname || 'Meter'}</p>
                  <p className="text-sm text-gray-500 font-mono">{meter.meterNumber}</p>
                </div>
              </div>
              <button onClick={()=>handleDelete(meter._id)} className="text-gray-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4"/></button>
            </div>
            {meter.address && <p className="text-sm text-gray-500 mt-2">{meter.address}</p>}
          </motion.div>
        ))}
      </div>
      {meters.length === 0 && <p className="text-center text-gray-500 py-12">No meters added yet</p>}
    </div>
  );
}