import { motion } from 'framer-motion';
import { CreditCard, ShieldCheck, Zap } from 'lucide-react';

export default function AboutSection() {
  return (
    <section className="py-20 bg-white">
      <div className="section-padding max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-primary-600">Prepaid power, made clearer</p>
            <h2 className="text-3xl font-bold mb-6">Meet King&apos;s Power</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">King&apos;s Power brings the prepaid power journey into one clear, modern experience. Explore meter management, a guided purchase flow, transaction history, and in-app support.</p>
            <p className="text-gray-600 mb-8 leading-relaxed">Payments and credit repayments are simulated, and generated sample tokens cannot recharge real electricity meters. Customers can try a credit purchase up to ₦10,000 and record a simulated repayment.</p>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-primary-50 rounded-xl"><Zap className="w-8 h-8 text-primary-600 mx-auto mb-2"/><p className="font-bold text-lg">Meters</p><p className="text-sm text-gray-600">In one place</p></div>
              <div className="text-center p-4 bg-primary-50 rounded-xl"><CreditCard className="w-8 h-8 text-primary-600 mx-auto mb-2"/><p className="font-bold text-lg">₦10,000</p><p className="text-sm text-gray-600">Purchase limit</p></div>
              <div className="text-center p-4 bg-primary-50 rounded-xl"><ShieldCheck className="w-8 h-8 text-primary-600 mx-auto mb-2"/><p className="font-bold text-lg">Simulated</p><p className="text-sm text-gray-600">Payments only</p></div>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="bg-gradient-to-br from-primary-100 to-primary-50 rounded-3xl p-12 flex items-center justify-center h-96">
            <div className="text-center">
              <div className="w-24 h-24 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4"><Zap className="w-12 h-12 text-white"/></div>
              <p className="text-primary-800 font-semibold text-lg">Power, with clarity</p>
              <p className="text-primary-600">A simulated product experience</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}