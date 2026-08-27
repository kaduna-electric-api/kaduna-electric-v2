import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const benefits = [
  'Secure digital payment with Paystack',
  'Instant token generation',
  'Digital transaction records & PDF receipts',
  '24/7 customer support & complaint tracking',
  'Manage multiple meters from one account',
  'Real-time payment verification',
];

export default function WhyChooseUs() {
  return (
    <section className="py-20 bg-primary-900 text-white">
      <div className="section-padding max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Why Choose Us</h2>
          <p className="text-blue-200">The most reliable way to purchase electricity tokens</p>
        </motion.div>
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {benefits.map((b, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="flex items-center gap-4 bg-white/10 backdrop-blur-sm p-4 rounded-xl">
              <div className="w-8 h-8 bg-electric-500 rounded-full flex items-center justify-center flex-shrink-0"><Check className="w-5 h-5 text-white" /></div>
              <span>{b}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}