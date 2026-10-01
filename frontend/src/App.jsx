import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';

// Pages
import Home from './pages/Home';
import About from './pages/About';
import HowItWorks from './pages/HowItWorks';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import NotFound from './pages/NotFound';

// Auth
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import VerifyOtp from './components/auth/VerifyOtp';
import CreatePassword from './components/auth/CreatePassword';
import ForgotPassword from './components/auth/ForgotPassword';

// Payment
import BuyToken from './components/payment/BuyToken';
import PaymentSuccess from './components/payment/PaymentSuccess';

// Tokens
import TransactionHistory from './components/tokens/TransactionHistory';

// Complaints
import NewComplaint from './components/complaints/NewComplaint';
import ComplaintList from './components/complaints/ComplaintList';

// UI
import Navbar from './components/ui/Navbar';
import Loading from './components/ui/Loading';

const PrivateRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (adminOnly && user?.role !== 'admin') return <Navigate to="/dashboard" />;
  return children;
};

function App() {
  const isLoading = useAuthStore((s) => s.isLoading);
  if (isLoading) return <Loading fullScreen />;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/create-password" element={<CreatePassword />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/dashboard/*" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/buy-token" element={<PrivateRoute><BuyToken /></PrivateRoute>} />
        <Route path="/payment/success" element={<PrivateRoute><PaymentSuccess /></PrivateRoute>} />
        <Route path="/transactions" element={<PrivateRoute><TransactionHistory /></PrivateRoute>} />
        <Route path="/complaints" element={<PrivateRoute><ComplaintList /></PrivateRoute>} />
        <Route path="/complaints/new" element={<PrivateRoute><NewComplaint /></PrivateRoute>} />
        <Route path="/admin/*" element={<PrivateRoute adminOnly><Admin /></PrivateRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;