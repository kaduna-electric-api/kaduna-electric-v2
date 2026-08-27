import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Users, Ban, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../services/api';
import Loading from '../ui/Loading';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchUsers(); }, [page, search]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/admin/users?page=${page}&limit=20&search=${search}`);
      setUsers(data.users);
      setPagination({ total: data.total, pages: data.pages });
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  const toggleStatus = async (id) => {
    try {
      const { data } = await api.put(`/admin/users/${id}/toggle`);
      toast.success(data.message);
      fetchUsers();
    } catch { toast.error('Failed to update user'); }
  };

  if (loading) return <Loading fullScreen/>;

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2"><Users className="w-5 h-5"/> Customers</h2>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400"/>
          <input placeholder="Search users..." className="bg-slate-800 border border-slate-700 text-white pl-10 pr-4 py-2 rounded-lg text-sm w-64" value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}}/>
        </div>
      </div>
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-900 border-b border-slate-700">
            <tr>
              <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Name</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Email</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Phone</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Status</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id} className="border-b border-slate-700/50">
                <td className="py-3 px-4 text-white text-sm">{u.firstName} {u.lastName}</td>
                <td className="py-3 px-4 text-slate-300 text-sm">{u.email}</td>
                <td className="py-3 px-4 text-slate-300 text-sm">{u.phone || 'N/A'}</td>
                <td className="py-3 px-4"><span className={`text-xs px-2 py-1 rounded-full ${u.isActive?'bg-green-900 text-green-400':'bg-red-900 text-red-400'}`}>{u.isActive?'Active':'Inactive'}</span></td>
                <td className="py-3 px-4 text-right">
                  <button onClick={()=>toggleStatus(u._id)} className={`text-xs px-3 py-1 rounded-lg ${u.isActive?'bg-red-900/50 text-red-400 hover:bg-red-900':'bg-green-900/50 text-green-400 hover:bg-green-900'} transition-colors`}>
                    {u.isActive?<><Ban className="w-3 h-3 inline mr-1"/> Deactivate</>:<><CheckCircle className="w-3 h-3 inline mr-1"/> Activate</>}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && <p className="text-center text-slate-500 py-12">No users found</p>}
      </div>
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