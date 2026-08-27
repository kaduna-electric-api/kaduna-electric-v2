import { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, Zap, Receipt, MessageSquare, LogOut, Menu, X } from 'lucide-react';
import useAuthStore from '../store/authStore';
import CustomerDashboard from '../components/dashboard/CustomerDashboard';
import MeterManager from '../components/meters/MeterManager';

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Zap, label: 'Buy Token', path: '/buy-token' },
  { icon: Receipt, label: 'Transactions', path: '/transactions' },
  { icon: MessageSquare, label: 'Complaints', path: '/complaints' },
];

export default function Dashboard() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200 fixed h-full">
        <div className="p-6 border-b border-gray-100">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center"><Zap className="w-5 h-5 text-white"/></div>
            <span className="font-bold text-lg text-primary-900">Kaduna Electric</span>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {sidebarItems.map(item => (
            <Link key={item.path} to={item.path} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive(item.path)?'bg-primary-50 text-primary-700 font-medium':'text-gray-600 hover:bg-gray-50'}`}>
              <item.icon className="w-5 h-5"/>{item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-4 px-4">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center"><span className="font-bold text-primary-700">{user?.firstName?.[0]}{user?.lastName?.[0]}</span></div>
            <div className="overflow-hidden">
              <p className="font-medium text-sm truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={logout} className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg w-full transition-colors"><LogOut className="w-5 h-5"/> Logout</button>
        </div>
      </aside>
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50 px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center"><Zap className="w-5 h-5 text-white"/></div>
          <span className="font-bold text-primary-900">Kaduna Electric</span>
        </Link>
        <button onClick={()=>setMobileOpen(!mobileOpen)}>{mobileOpen?<X className="w-6 h-6"/>:<Menu className="w-6 h-6"/>}</button>
      </div>
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-white z-40 pt-16">
          <nav className="p-4 space-y-1">
            {sidebarItems.map(item=>(<Link key={item.path} to={item.path} onClick={()=>setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50"><item.icon className="w-5 h-5"/>{item.label}</Link>))}
            <button onClick={()=>{logout();setMobileOpen(false);}} className="flex items-center gap-3 px-4 py-3 text-red-600 w-full"><LogOut className="w-5 h-5"/> Logout</button>
          </nav>
        </div>
      )}
      <main className="flex-1 lg:ml-64 pt-16 lg:pt-0">
        <Routes>
          <Route path="/" element={<CustomerDashboard/>}/>
          <Route path="/meters" element={<MeterManager/>}/>
        </Routes>
      </main>
    </div>
  );
}