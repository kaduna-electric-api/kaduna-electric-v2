import { motion } from 'framer-motion';
import { CreditCard, ShieldCheck, Zap } from 'lucide-react';
import Footer from '../components/public/Footer';

export default function About() {
  return (
    <div className="animate-fade-in">
      <section className="bg-gradient-to-br from-primary-900 to-primary-800 text-white py-20">
        <div className="section-padding max-w-7xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-amber-300">Prepaid electricity accounts</p>
            <h1 className="text-4xl font-bold mb-4">About King&apos;s Power</h1>
            <p className="text-primary-200 max-w-2xl mx-auto">A modern, simulated experience for exploring prepaid power account tools.</p>
          </motion.div>
        </div>
      </section>
      <section className="py-20 bg-white">
        <div className="section-padding max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="text-3xl font-bold mb-6">Power tools, reimagined</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">King&apos;s Power brings meter management, purchase flows, transaction history, and support into one interface.</p>
              <p className="text-gray-600 mb-8 leading-relaxed">Payments and credit repayments are simulated. Generated sample tokens and estimated units do not recharge real meters.</p>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-primary-50 rounded-xl"><Zap className="w-8 h-8 text-primary-600 mx-auto mb-2"/><p className="font-bold text-lg">Meters</p><p className="text-sm text-gray-600">Manage accounts</p></div>
                <div className="text-center p-4 bg-primary-50 rounded-xl"><CreditCard className="w-8 h-8 text-primary-600 mx-auto mb-2"/><p className="font-bold text-lg">₦10,000</p><p className="text-sm text-gray-600">Purchase limit</p></div>
                <div className="text-center p-4 bg-primary-50 rounded-xl"><ShieldCheck className="w-8 h-8 text-primary-600 mx-auto mb-2"/><p className="font-bold text-lg">Simulated</p><p className="text-sm text-gray-600">Payment activity</p></div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="bg-gradient-to-br from-primary-100 to-primary-50 rounded-3xl p-12 flex items-center justify-center h-96">
              <div className="text-center">
                <div className="w-24 h-24 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4"><Zap className="w-12 h-12 text-white"/></div>
                <p className="text-primary-800 font-semibold text-lg">King&apos;s Power</p>
                <p className="text-primary-600">Powering a bold new experience</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      <section className="py-20 bg-gray-50">
        <div className="section-padding max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Purpose</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Designed to make common power account tasks easier to understand and explore.</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {[{icon: Zap, title: 'One clear flow', desc: 'Follow a guided journey from meter selection to a sample token.'},{icon: CreditCard, title: 'Clear purchase limits', desc: 'Purchases are capped at ₦10,000 and payment activity is simulated.'},{icon: ShieldCheck, title: 'Accurate token status', desc: 'Generated tokens do not recharge real meters.'}].map((item,i)=>(
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i*0.1 }} className="card text-center">
                <div className="w-14 h-14 bg-primary-50 rounded-xl flex items-center justify-center mx-auto mb-4"><item.icon className="w-7 h-7 text-primary-600"/></div>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <Footer/>
    </div>
  );
}