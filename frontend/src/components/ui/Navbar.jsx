import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Zap, Menu, X, LayoutDashboard, LogOut } from 'lucide-react';
import useAuthStore from '../../store/authStore';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuthStore();
  const location = useLocation();
  const isPublic = !['/dashboard','/admin','/buy-token','/transactions','/complaints'].some(p => location.pathname.startsWith(p));

  if (!isPublic && isAuthenticated) return null;

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="section-padding max-w-7xl mx-auto flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center"><Zap className="w-5 h-5 text-white"/></div>
          <span className="font-bold text-xl text-primary-900">Kaduna Electric</span>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-gray-600 hover:text-primary-600 transition-colors">Home</Link>
          <Link to="/about" className="text-gray-600 hover:text-primary-600 transition-colors">About</Link>
          <Link to="/how-it-works" className="text-gray-600 hover:text-primary-600 transition-colors">How It Works</Link>
        </div>
        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <Link to={user?.role==='admin'?'/admin':'/dashboard'} className="flex items-center gap-2 text-primary-600 font-medium"><LayoutDashboard className="w-4 h-4"/> Dashboard</Link>
              <button onClick={logout} className="flex items-center gap-2 text-gray-600 hover:text-red-600"><LogOut className="w-4 h-4"/> Logout</button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-gray-600 hover:text-primary-600 font-medium">Sign In</Link>
              <Link to="/register" className="btn-primary text-sm">Get Started</Link>
            </div>
          )}
        </div>
        <button onClick={()=>setMobileOpen(!mobileOpen)} className="md:hidden p-2">{mobileOpen?<X className="w-6 h-6"/>:<Menu className="w-6 h-6"/>}</button>
      </div>
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 p-4 space-y-4">
          <Link to="/" onClick={()=>setMobileOpen(false)} className="block text-gray-600">Home</Link>
          <Link to="/about" onClick={()=>setMobileOpen(false)} className="block text-gray-600">About</Link>
          <Link to="/how-it-works" onClick={()=>setMobileOpen(false)} className="block text-gray-600">How It Works</Link>
          {isAuthenticated ? (
            <><Link to="/dashboard" onClick={()=>setMobileOpen(false)} className="block text-primary-600 font-medium">Dashboard</Link>
            <button onClick={()=>{logout();setMobileOpen(false);}} className="block text-red-600">Logout</button></>
          ) : (
            <><Link to="/login" onClick={()=>setMobileOpen(false)} className="block text-gray-600">Sign In</Link>
            <Link to="/register" onClick={()=>setMobileOpen(false)} className="block btn-primary text-center">Get Started</Link></>
          )}
        </div>
      )}
    </nav>
  );
}