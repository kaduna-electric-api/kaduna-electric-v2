export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12">
      <div className="section-padding max-w-7xl mx-auto grid md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-white font-bold text-lg mb-4">Kaduna Electric</h3>
          <p className="text-sm">Powering lives across Northern Nigeria with reliable electricity distribution.</p>
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
            <li>support@kadunaelectric.com</li>
            <li>0700-KADUNA-ELECTRIC</li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">Legal</h4>
          <p className="text-sm">© 2024 Kaduna Electric. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}