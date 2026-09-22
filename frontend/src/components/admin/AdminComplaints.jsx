import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Search, ChevronLeft, ChevronRight, Send, Clock, CheckCircle } from 'lucide-react';
import api from '../../services/api';
import Loading from '../ui/Loading';
import toast from 'react-hot-toast';

const statusColors = {
  Pending: 'bg-yellow-900 text-yellow-400',
  'Under Review': 'bg-primary-900 text-primary-400',
  Resolved: 'bg-green-900 text-green-400',
  Closed: 'bg-gray-800 text-gray-400'
};

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(null);
  const [response, setResponse] = useState('');

  useEffect(() => { fetchComplaints(); }, [page]);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/complaints/admin?page=${page}&limit=20`);
      setComplaints(data.complaints);
      setPagination({ total: data.total, pages: data.pages });
    } catch { toast.error('Failed to load complaints'); }
    finally { setLoading(false); }
  };

  const handleRespond = async (id) => {
    if (!response.trim()) return toast.error('Please enter a response');
    try {
      await api.put(`/complaints/${id}/respond`, { adminResponse: response, status: 'Resolved' });
      toast.success('Response sent');
      setResponding(null);
      setResponse('');
      fetchComplaints();
    } catch { toast.error('Failed to send response'); }
  };

  if (loading) return <Loading fullScreen/>;

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2"><MessageSquare className="w-5 h-5"/> Complaints</h2>
      </div>
      <div className="space-y-4">
        {complaints.map(c => (
          <motion.div key={c._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-800 rounded-xl p-5 border border-slate-700">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-sm font-mono text-primary-400 bg-primary-900/30 px-2 py-1 rounded">{c.reference}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${statusColors[c.status]}`}>{c.status}</span>
                </div>
                <p className="text-white font-medium">{c.subject}</p>
                <p className="text-slate-400 text-sm">{c.user?.firstName} {c.user?.lastName} — {c.user?.email}</p>
              </div>
              <span className="text-xs text-slate-500">{new Date(c.createdAt).toLocaleDateString()}</span>
            </div>
            <p className="text-slate-300 text-sm mb-3 bg-slate-900/50 p-3 rounded-lg">{c.description}</p>

            {c.adminResponse && (
              <div className="mb-3 p-3 bg-green-900/20 border border-green-900/30 rounded-lg">
                <p className="text-xs text-green-400 font-medium mb-1">Response:</p>
                <p className="text-sm text-green-300">{c.adminResponse}</p>
              </div>
            )}

            {c.status !== 'Resolved' && c.status !== 'Closed' && (
              <div>
                {responding === c._id ? (
                  <div className="space-y-2">
                    <textarea rows={3} className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg p-3 text-sm" placeholder="Type your response..." value={response} onChange={e=>setResponse(e.target.value)}/>
                    <div className="flex gap-2">
                      <button onClick={()=>handleRespond(c._id)} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"><Send className="w-4 h-4"/> Send Response</button>
                      <button onClick={()=>{setResponding(null);setResponse('');}} className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={()=>setResponding(c._id)} className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1"><MessageSquare className="w-4 h-4"/> Respond</button>
                )}
              </div>
            )}
          </motion.div>
        ))}
      </div>
      {complaints.length === 0 && <p className="text-center text-slate-500 py-12">No complaints found</p>}
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