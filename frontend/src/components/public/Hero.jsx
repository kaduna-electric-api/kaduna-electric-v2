import { motion } from 'framer-motion';
import { Zap, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 text-white min-h-[90vh] flex items-center">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-electric-400 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-400 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
      </div>
      <div className="section-padding max-w-7xl mx-auto w-full relative z-10 grid lg:grid-cols-2 gap-12 items-center">
        <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <Zap className="w-4 h-4 text-electric-400" />
            <span className="text-sm font-medium">Kaduna Electric Official Platform</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            Power Your Life.<br /><span className="text-electric-400">Pay With Ease.</span>
          </h1>
          <p className="text-lg text-blue-100 mb-8 max-w-lg">
            Purchase prepaid electricity tokens securely, manage your meters, track transactions and get customer support — all from one platform.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/register" className="btn-primary flex items-center gap-2 text-lg">
              Get Started <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/how-it-works" className="btn-secondary bg-white/10 border-white/30 text-white hover:bg-white/20">
              Learn More
            </Link>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }} className="hidden lg:block">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-electric-500 rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div><p className="font-semibold">Buy Token</p><p className="text-sm text-blue-200">Quick & Secure</p></div>
              </div>
              <span className="text-electric-400 font-bold">₦5,000</span>
            </div>
            <div className="space-y-3">
              <div className="h-3 bg-white/20 rounded-full w-full" />
              <div className="h-3 bg-white/20 rounded-full w-4/5" />
              <div className="h-3 bg-white/20 rounded-full w-3/5" />
            </div>
            <div className="mt-6 p-4 bg-green-500/20 rounded-xl border border-green-500/30">
              <p className="text-green-300 text-sm font-medium">✓ Payment Successful</p>
              <p className="text-xs text-green-200 mt-1">Token: 1234 5678 9012 3456</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}