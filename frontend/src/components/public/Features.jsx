import { motion } from 'framer-motion';
import { Shield, CreditCard, FileText, Headphones, Smartphone, Clock } from 'lucide-react';

const featuresList = [
  { icon: Shield, title: 'Secure Payments', desc: 'Bank-grade encryption for all transactions' },
  { icon: CreditCard, title: 'Instant Tokens', desc: 'Get your token immediately after payment' },
  { icon: FileText, title: 'Digital Receipts', desc: 'Download PDF receipts for every purchase' },
  { icon: Headphones, title: '24/7 Support', desc: 'Complaint system with real-time tracking' },
  { icon: Smartphone, title: 'Mobile Friendly', desc: 'Works perfectly on all devices' },
  { icon: Clock, title: 'Transaction History', desc: 'Full history with search and filters' },
];

export default function Features() {
  return (
    <section className="py-20 bg-white">
      <div className="section-padding max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Platform Features</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Everything you need to manage your electricity payments in one place</p>
        </motion.div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuresList.map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="card group hover:border-primary-200">
              <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-100 transition-colors">
                <f.icon className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-gray-600 text-sm">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}