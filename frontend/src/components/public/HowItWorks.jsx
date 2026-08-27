import { motion } from 'framer-motion';
import { UserPlus, Plus, CreditCard, Key } from 'lucide-react';

const steps = [
  { icon: UserPlus, title: 'Create Account', desc: 'Sign up in seconds with your email' },
  { icon: Plus, title: 'Add Meter', desc: 'Register your prepaid meter number' },
  { icon: CreditCard, title: 'Make Payment', desc: 'Pay securely with card or transfer' },
  { icon: Key, title: 'Get Token', desc: 'Receive your token instantly' },
];

export default function HowItWorks() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="section-padding max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">How It Works</h2>
          <p className="text-gray-600">Four simple steps to power your home</p>
        </motion.div>
        <div className="grid md:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }} className="relative text-center">
              <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <step.icon className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-electric-500 rounded-full flex items-center justify-center text-white font-bold text-sm">{i + 1}</div>
              <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
              <p className="text-gray-600 text-sm">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}