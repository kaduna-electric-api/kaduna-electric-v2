import { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, CreditCard, MessageSquare, LogOut, Menu, X, Shield } from 'lucide-react';
import useAuthStore from '../store/authStore';
import AdminOverview from '../components/admin/AdminOverview';
import AdminUsers from '../components/admin/AdminUsers';
import AdminTransactions from '../components/admin/AdminTransactions';
import AdminComplaints from '../components/admin/AdminComplaints';

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: Users, label: 'Users', path: '/admin/users' },
  { icon: CreditCard, label: 'Transactions', path: '/admin/transactions' },
  { icon: MessageSquare, label: 'Complaints', path: '/admin/complaints' },
];

export default function Admin() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside className="hidden lg:flex flex-col w-64 bg-slate-900 text-white fixed h-full">
        <div className="p-6 border-b border-slate-800">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-electric-500 rounded-lg flex items-center justify-center"><Shield className="w-5 h-5 text-white"/></div>
            <span className="font-bold text-lg">Admin Panel</span>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {sidebarItems.map(item => (
            <Link key={item.path} to={item.path} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive(item.path)?'bg-primary-600 text-white font-medium':'text-slate-300 hover:bg-slate-800'}`}>
              <item.icon className="w-5 h-5"/>{item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-4 px-4">
            <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center"><span className="font-bold">{user?.firstName?.[0]}</span></div>
            <div><p className="font-medium text-sm">{user?.firstName}</p><p className="text-xs text-slate-400">Administrator</p></div>
          </div>
          <button onClick={logout} className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-slate-800 rounded-lg w-full transition-colors"><LogOut className="w-5 h-5"/> Logout</button>
        </div>
      </aside>
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-slate-900 text-white border-b border-slate-800 z-50 px-4 h-16 flex items-center justify-between">
        <span className="font-bold">Admin Panel</span>
        <button onClick={()=>setMobileOpen(!mobileOpen)}>{mobileOpen?<X className="w-6 h-6"/>:<Menu className="w-6 h-6"/>}</button>
      </div>
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-slate-900 text-white z-40 pt-16">
          <nav className="p-4 space-y-1">
            {sidebarItems.map(item=>(<Link key={item.path} to={item.path} onClick={()=>setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800"><item.icon className="w-5 h-5"/>{item.label}</Link>))}
            <button onClick={()=>{logout();setMobileOpen(false);}} className="flex items-center gap-3 px-4 py-3 text-red-400 w-full"><LogOut className="w-5 h-5"/> Logout</button>
          </nav>
        </div>
      )}
      <main className="flex-1 lg:ml-64 pt-16 lg:pt-0">
        <Routes>
          <Route path="/" element={<AdminOverview/>}/>
          <Route path="/users" element={<AdminUsers/>}/>
          <Route path="/transactions" element={<AdminTransactions/>}/>
          <Route path="/complaints" element={<AdminComplaints/>}/>
        </Routes>
      </main>
    </div>
  );
}