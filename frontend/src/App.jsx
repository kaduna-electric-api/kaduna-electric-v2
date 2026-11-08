import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';

import Home from './pages/Home';
import Navbar from './components/ui/Navbar';
import Loading from './components/ui/Loading';

const About = lazy(() => import('./pages/About'));
const HowItWorks = lazy(() => import('./pages/HowItWorks'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Admin = lazy(() => import('./pages/Admin'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Login = lazy(() => import('./components/auth/Login'));
const Register = lazy(() => import('./components/auth/Register'));
const VerifyOtp = lazy(() => import('./components/auth/VerifyOtp'));
const CreatePassword = lazy(() => import('./components/auth/CreatePassword'));
const ForgotPassword = lazy(() => import('./components/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./components/auth/ResetPassword'));
const BuyToken = lazy(() => import('./components/payment/BuyToken'));
const PaymentSuccess = lazy(() => import('./components/payment/PaymentSuccess'));
const TransactionHistory = lazy(() => import('./components/tokens/TransactionHistory'));
const NewComplaint = lazy(() => import('./components/complaints/NewComplaint'));
const ComplaintList = lazy(() => import('./components/complaints/ComplaintList'));

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
      <Suspense fallback={<Loading fullScreen />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/create-password" element={<CreatePassword />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/dashboard/*" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/buy-token" element={<PrivateRoute><BuyToken /></PrivateRoute>} />
          <Route path="/payment/success" element={<PrivateRoute><PaymentSuccess /></PrivateRoute>} />
          <Route path="/transactions" element={<PrivateRoute><TransactionHistory /></PrivateRoute>} />
          <Route path="/complaints" element={<PrivateRoute><ComplaintList /></PrivateRoute>} />
          <Route path="/complaints/new" element={<PrivateRoute><NewComplaint /></PrivateRoute>} />
          <Route path="/admin/*" element={<PrivateRoute adminOnly><Admin /></PrivateRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;