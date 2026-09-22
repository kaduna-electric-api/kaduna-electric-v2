import { motion } from 'framer-motion';
import { Building2, Target, Heart, Shield, Users, Zap } from 'lucide-react';
import Footer from '../components/public/Footer';

export default function About() {
  return (
    <div className="animate-fade-in">
      <section className="bg-gradient-to-br from-primary-900 to-primary-800 text-white py-20">
        <div className="section-padding max-w-7xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl font-bold mb-4">About Kaduna Electric</h1>
            <p className="text-primary-200 max-w-2xl mx-auto">Powering lives across Northern Nigeria with reliable electricity distribution and digital innovation.</p>
          </motion.div>
        </div>
      </section>
      <section className="py-20 bg-white">
        <div className="section-padding max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="text-3xl font-bold mb-6">Who We Are</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">Kaduna Electric is one of Nigeria's leading electricity distribution companies, serving millions of customers across Kaduna, Kebbi, Sokoto, and Zamfara states.</p>
              <p className="text-gray-600 mb-8 leading-relaxed">The Token Vending System represents our commitment to digital transformation, making it easier for customers to purchase prepaid electricity tokens from anywhere, at any time.</p>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-primary-50 rounded-xl"><Building2 className="w-8 h-8 text-primary-600 mx-auto mb-2"/><p className="font-bold text-2xl">4</p><p className="text-sm text-gray-600">States</p></div>
                <div className="text-center p-4 bg-primary-50 rounded-xl"><Users className="w-8 h-8 text-primary-600 mx-auto mb-2"/><p className="font-bold text-2xl">2M+</p><p className="text-sm text-gray-600">Customers</p></div>
                <div className="text-center p-4 bg-primary-50 rounded-xl"><Zap className="w-8 h-8 text-primary-600 mx-auto mb-2"/><p className="font-bold text-2xl">24/7</p><p className="text-sm text-gray-600">Power</p></div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="bg-gradient-to-br from-primary-100 to-primary-50 rounded-3xl p-12 flex items-center justify-center h-96">
              <div className="text-center">
                <div className="w-24 h-24 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4"><Zap className="w-12 h-12 text-white"/></div>
                <p className="text-primary-800 font-semibold text-lg">Trusted Infrastructure</p>
                <p className="text-primary-600">Powering Northern Nigeria</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      <section className="py-20 bg-gray-50">
        <div className="section-padding max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Purpose</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">We exist to make electricity accessible, affordable, and manageable for every Nigerian household.</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {[{icon: Target, title: 'Mission', desc: 'To provide reliable electricity distribution with world-class customer service through digital innovation.'},{icon: Heart, title: 'Values', desc: 'Integrity, customer focus, innovation, and excellence drive everything we do.'},{icon: Shield, title: 'Commitment', desc: 'We are committed to reducing energy poverty and empowering communities.'}].map((item,i)=>(
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