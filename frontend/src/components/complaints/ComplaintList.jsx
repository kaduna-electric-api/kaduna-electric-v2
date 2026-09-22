import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Plus, Clock, CheckCircle, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Loading from '../ui/Loading';
import toast from 'react-hot-toast';

const statusColors = {
  Pending: 'bg-yellow-100 text-yellow-700',
  'Under Review': 'bg-primary-100 text-primary-700',
  Resolved: 'bg-green-100 text-green-700',
  Closed: 'bg-gray-100 text-gray-700'
};

export default function ComplaintList() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/complaints').then(res => { setComplaints(res.data); setLoading(false); })
    .catch(() => { toast.error('Failed to load complaints'); setLoading(false); });
  }, []);

  if (loading) return <Loading fullScreen/>;

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-20">
      <div className="section-padding max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div><h1 className="text-2xl font-bold">My Complaints</h1><p className="text-gray-600">Track and manage your support requests</p></div>
          <Link to="/complaints/new" className="btn-primary flex items-center gap-2 text-sm"><Plus className="w-4 h-4"/> New Complaint</Link>
        </div>
        <div className="space-y-4">
          {complaints.map(c => (
            <motion.div key={c._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-mono text-primary-600 bg-primary-50 px-2 py-1 rounded">{c.reference}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${statusColors[c.status]}`}>{c.status}</span>
                  </div>
                  <h3 className="font-semibold mb-1">{c.subject}</h3>
                  <p className="text-gray-600 text-sm mb-2">{c.description}</p>
                  <p className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleString()}</p>
                </div>
              </div>
              {c.adminResponse && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-100">
                  <p className="text-sm font-medium text-green-800 mb-1">Admin Response:</p>
                  <p className="text-sm text-green-700">{c.adminResponse}</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
        {complaints.length === 0 && (
          <div className="card text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4"/>
            <p className="text-gray-500 mb-4">No complaints yet</p>
            <Link to="/complaints/new" className="btn-primary text-sm">Submit a Complaint</Link>
          </div>
        )}
      </div>
    </div>
  );
}