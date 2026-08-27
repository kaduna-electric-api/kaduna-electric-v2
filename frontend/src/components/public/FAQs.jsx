import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqList = [
  { q: 'How do I purchase a token?', a: 'Login, add your meter, enter the amount, and pay securely. Your token is generated instantly.' },
  { q: 'What payment methods are accepted?', a: 'We accept card payments, bank transfers, and USSD via Paystack.' },
  { q: 'How long does it take to get my token?', a: 'Tokens are generated instantly after successful payment.' },
  { q: 'Can I manage multiple meters?', a: 'Yes, you can add and manage multiple meters from your dashboard.' },
  { q: 'What if my payment fails?', a: 'Use our complaint system with your transaction reference for quick resolution.' },
];

export default function FAQs() {
  const [open, setOpen] = useState(null);
  return (
    <section className="py-20 bg-white">
      <div className="section-padding max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
        </motion.div>
        <div className="space-y-4">
          {faqList.map((faq, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="border border-gray-200 rounded-xl overflow-hidden">
              <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors">
                <span className="font-semibold">{faq.q}</span>
                <ChevronDown className={`w-5 h-5 transition-transform ${open === i ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <p className="p-5 pt-0 text-gray-600">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}