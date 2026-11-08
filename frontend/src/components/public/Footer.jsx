import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12">
      <div className="section-padding max-w-7xl mx-auto grid md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-white font-bold text-lg mb-4">King&apos;s Power</h3>
          <p className="text-sm">A simpler way to manage prepaid power account activity.</p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="/" className="hover:text-white transition-colors">Home</a></li>
            <li><a href="/about" className="hover:text-white transition-colors">About</a></li>
            <li><a href="/how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">Support</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/complaints" className="hover:text-white transition-colors">In-app support</Link></li>
            <li>Utility token vending is not connected</li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">Legal</h4>
          <p className="text-sm">© {new Date().getFullYear()} King&apos;s Power.</p>
          <p className="mt-2 text-xs">Payments are simulated; generated tokens do not recharge real meters.</p>
        </div>
      </div>
    </footer>
  );
}