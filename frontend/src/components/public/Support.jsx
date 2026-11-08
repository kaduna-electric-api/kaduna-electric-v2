import { motion } from 'framer-motion';
import { MessageCircle, ShieldCheck, Zap } from 'lucide-react';

export default function Support() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="section-padding max-w-7xl mx-auto text-center">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <h2 className="text-3xl font-bold mb-4">Customer Support</h2>
          <p className="text-gray-600 mb-12 max-w-2xl mx-auto">Get help with your account and submit a support request. No utility support channel is connected.</p>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-8">
          {[{ icon: Zap, title: 'Help center', desc: 'Browse account guidance and FAQs.' },{ icon: MessageCircle, title: 'In-app support', desc: 'Submit and track an account request.' },{ icon: ShieldCheck, title: 'Service status', desc: 'Utility token vending and provider support are not connected.' }].map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="card">
              <item.icon className="w-10 h-10 text-primary-600 mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
              <p className="text-gray-600">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}