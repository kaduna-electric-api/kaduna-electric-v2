import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Zap, Menu, X, LayoutDashboard, LogOut, Bell } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import api from '../../services/api';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const { isAuthenticated, user, logout } = useAuthStore();
  const location = useLocation();
  const isPublic = !['/dashboard','/admin','/buy-token','/transactions','/complaints'].some(p => location.pathname.startsWith(p));

  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      setShowNotifications(false);
      return;
    }

    const fetchNotifications = async () => {
      try {
        const { data } = await api.get('/notifications');
        setNotifications(data.notifications || []);
      } catch (error) {
        console.error('Failed to load notifications', error);
      }
    };

    fetchNotifications();
  }, [isAuthenticated, location.pathname]);

  const unreadCount = notifications.filter((item) => !item.isRead).length;

  const handleMarkRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((item) => item._id === id ? { ...item, isRead: true } : item));
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  };

  if (!isPublic && isAuthenticated) return null;

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="section-padding max-w-7xl mx-auto flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-amber-300 rounded-lg flex items-center justify-center"><Zap className="w-5 h-5 text-slate-950"/></div>
          <span className="font-bold text-xl text-primary-900">King&apos;s Power</span>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-gray-600 hover:text-primary-600 transition-colors">Home</Link>
          <Link to="/about" className="text-gray-600 hover:text-primary-600 transition-colors">About</Link>
          <Link to="/how-it-works" className="text-gray-600 hover:text-primary-600 transition-colors">How It Works</Link>
        </div>
        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <div className="relative">
                <button onClick={() => setShowNotifications((prev) => !prev)} className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">{unreadCount > 9 ? '9+' : unreadCount}</span>
                  )}
                </button>
                {showNotifications && (
                  <div className="absolute right-0 mt-3 w-80 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 font-medium text-sm text-gray-700">Notifications</div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="px-4 py-5 text-sm text-gray-500">No notifications yet.</p>
                      ) : (
                        notifications.slice(0, 6).map((item) => (
                          <button key={item._id} onClick={() => handleMarkRead(item._id)} className={`w-full text-left px-4 py-3 border-b border-gray-100 ${!item.isRead ? 'bg-blue-50' : 'bg-white'}`}>
                            <p className="text-sm font-medium text-gray-800">{item.title}</p>
                            <p className="text-xs text-gray-600 mt-1">{item.message}</p>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
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