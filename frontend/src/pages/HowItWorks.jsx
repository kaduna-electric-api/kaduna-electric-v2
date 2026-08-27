import { motion } from 'framer-motion';
import { UserPlus, Plus, CreditCard, Key, CheckCircle } from 'lucide-react';
import Footer from '../components/public/Footer';

const steps = [
  { icon: UserPlus, title: 'Create Account', desc: 'Sign up in seconds with your email and phone number.' },
  { icon: Plus, title: 'Add Your Meter', desc: 'Register your prepaid meter number. Add multiple meters.' },
  { icon: CreditCard, title: 'Make Payment', desc: 'Enter amount and pay securely via Paystack.' },
  { icon: Key, title: 'Get Your Token', desc: 'Your token is generated instantly after payment.' },
];

export default function HowItWorks() {
  return (
    <div className="animate-fade-in">
      <section className="bg-gradient-to-br from-primary-900 to-primary-800 text-white py-20">
        <div className="section-padding max-w-7xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl font-bold mb-4">How It Works</h1>
            <p className="text-blue-200 max-w-2xl mx-auto">Four simple steps to power your home</p>
          </motion.div>
        </div>
      </section>
      <section className="py-20 bg-white">
        <div className="section-padding max-w-4xl mx-auto">
          <div className="space-y-12">
            {steps.map((step,i)=>(
              <motion.div key={i} initial={{ opacity: 0, x: i%2===0?-30:30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="flex gap-8 items-start">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center shadow-lg"><step.icon className="w-8 h-8 text-white"/></div>
                </div>
                <div className="pt-2">
                  <span className="text-sm font-bold text-primary-600 bg-primary-50 px-3 py-1 rounded-full">Step {i+1}</span>
                  <h3 className="text-xl font-bold mb-2 mt-2">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-20 bg-primary-50">
        <div className="section-padding max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-6"/>
            <h2 className="text-3xl font-bold mb-4">That's It!</h2>
            <p className="text-gray-600 mb-8">No more queues. No more paper tokens. Everything is digital, secure, and instant.</p>
            <a href="/register" className="btn-primary inline-block">Get Started Now</a>
          </motion.div>
        </div>
      </section>
      <Footer/>
    </div>
  );
}