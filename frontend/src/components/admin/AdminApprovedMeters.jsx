import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Search, CheckCircle, XCircle, Zap } from 'lucide-react';
import api from '../../services/api';
import Loading from '../ui/Loading';
import toast from 'react-hot-toast';

const emptyForm = {
  meterNumber: '',
  meterType: 'prepaid',
  address: '',
  source: 'company-api',
  isActive: true,
};

export default function AdminApprovedMeters() {
  const [meters, setMeters] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const fetchApprovedMeters = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/approved-meters');
      setMeters(data);
    } catch (error) {
      toast.error('Failed to load approved meters');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovedMeters();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/admin/approved-meters', form);
      toast.success('Meter registered successfully');
      setForm(emptyForm);
      fetchApprovedMeters();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to register meter');
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (meter) => {
    try {
      await api.put(`/admin/approved-meters/${meter._id}`, {
        ...meter,
        isActive: !meter.isActive,
      });
      toast.success('Meter status updated');
      fetchApprovedMeters();
    } catch (error) {
      toast.error('Failed to update meter status');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/approved-meters/${id}`);
      toast.success('Meter removed from registry');
      fetchApprovedMeters();
    } catch (error) {
      toast.error('Failed to remove meter');
    }
  };

  const filteredMeters = meters.filter((meter) => {
    const searchText = search.toLowerCase();
    return (
      meter.meterNumber.toLowerCase().includes(searchText) ||
      (meter.address || '').toLowerCase().includes(searchText)
    );
  });

  if (loading) return <Loading fullScreen />;

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2"><Zap className="w-5 h-5" /> Approved Meter Registry</h2>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search meter number..."
            className="bg-slate-800 border border-slate-700 text-white pl-10 pr-4 py-2 rounded-lg text-sm w-64"
          />
        </div>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="bg-slate-800 rounded-xl p-5 border border-slate-700 mb-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Add Meter to Company Registry</h3>
        <div className="grid md:grid-cols-4 gap-4">
          <input
            required
            value={form.meterNumber}
            onChange={(e) => setForm({ ...form, meterNumber: e.target.value })}
            placeholder="Meter Number"
            className="input-field"
          />
          <select
            value={form.meterType}
            onChange={(e) => setForm({ ...form, meterType: e.target.value })}
            className="input-field"
          >
            <option value="prepaid">Prepaid</option>
            <option value="postpaid">Postpaid</option>
          </select>
          <input
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            placeholder="Address"
            className="input-field"
          />
          <input
            value={form.source}
            onChange={(e) => setForm({ ...form, source: e.target.value })}
            placeholder="Source"
            className="input-field"
          />
        </div>
        <div className="flex justify-end mt-4">
          <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
            {saving ? 'Adding...' : 'Add Meter'}
          </button>
        </div>
      </motion.form>

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-900 border-b border-slate-700">
            <tr>
              <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Meter Number</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Type</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Address</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Source</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Status</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMeters.map((meter) => (
              <tr key={meter._id} className="border-b border-slate-700/50">
                <td className="py-3 px-4 text-white text-sm font-mono">{meter.meterNumber}</td>
                <td className="py-3 px-4 text-slate-300 text-sm capitalize">{meter.meterType}</td>
                <td className="py-3 px-4 text-slate-300 text-sm">{meter.address || 'N/A'}</td>
                <td className="py-3 px-4 text-slate-300 text-sm">{meter.source || 'company-api'}</td>
                <td className="py-3 px-4">
                  <span className={`text-xs px-2 py-1 rounded-full ${meter.isActive ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'}`}>
                    {meter.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => toggleStatus(meter)}
                      className={`text-xs px-3 py-1 rounded-lg ${meter.isActive ? 'bg-red-900/50 text-red-400 hover:bg-red-900' : 'bg-green-900/50 text-green-400 hover:bg-green-900'}`}
                    >
                      {meter.isActive ? <><XCircle className="w-3 h-3 inline mr-1" /> Disable</> : <><CheckCircle className="w-3 h-3 inline mr-1" /> Enable</>}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(meter._id)}
                      className="text-xs px-3 py-1 rounded-lg bg-slate-700 text-slate-200 hover:bg-slate-600"
                    >
                      <Trash2 className="w-3 h-3 inline mr-1" /> Remove
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredMeters.length === 0 && <p className="text-center text-slate-500 py-12">No approved meters found</p>}
      </div>
    </div>
  );
}
