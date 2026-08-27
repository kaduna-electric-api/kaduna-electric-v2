import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary-600 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">Page not found</p>
        <Link to="/" className="btn-primary inline-flex items-center gap-2"><Home className="w-5 h-5"/> Go Home</Link>
      </div>
    </div>
  );
}