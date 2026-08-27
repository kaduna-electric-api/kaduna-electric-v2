import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, ChevronRight, Check, Loader2, Copy, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const STEPS = ['Select Meter', 'Enter Amount', 'Confirm', 'Payment'];

export default function BuyToken() {
  const [step, setStep] = useState(0);
  const [meters, setMeters] = useState([]);
  const [selectedMeter, setSelectedMeter] = useState(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    api.get('/meters').then((res) => setMeters(res.data)).catch(() => toast.error('Failed to load meters'));
  }, []);

  const handlePayment = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/payments/initialize', { meterId: selectedMeter._id, amount: parseInt(amount) });
      setResult(data.data);
      setStep(4);
      toast.success('Payment successful!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed');
    } finally { setLoading(false); }
  };

  const copyToken = () => { navigator.clipboard.writeText(result.token.replace(/ /g, '')); toast.success('Token copied!'); };

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-20">
      <div className="section-padding max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-2xl font-bold">Buy Electricity Token</h1>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {STEPS.map((s, i) => (
              <div key={i} className={`flex items-center gap-2 text-sm ${i <= step ? 'text-primary-600 font-medium' : 'text-gray-400'}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${i <= step ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}>{i < step ? <Check className="w-3 h-3" /> : i + 1}</span>
                {s}{i < STEPS.length - 1 && <ChevronRight className="w-4 h-4" />}
              </div>
            ))}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="card space-y-4">
              <h3 className="font-semibold">Select a Meter</h3>
              {meters.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No meters added yet</p>
                  <Link to="/dashboard/meters" className="btn-primary text-sm">Add Meter</Link>
                </div>
              ) : (
                meters.map((m) => (
                  <button key={m._id} onClick={() => { setSelectedMeter(m); setStep(1); }} className={`w-full p-4 rounded-xl border-2 text-left transition-all ${selectedMeter?._id === m._id ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-primary-300'}`}>
                    <div className="flex items-center justify-between">
                      <div><p className="font-semibold">{m.nickname || 'Meter'} <span className="text-gray-500 font-normal">({m.meterNumber})</span></p>{m.address && <p className="text-sm text-gray-500">{m.address}</p>}</div>
                      <Zap className="w-5 h-5 text-primary-600" />
                    </div>
                  </button>
                ))
              )}
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="card space-y-4">
              <h3 className="font-semibold">Enter Amount</h3>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[1000, 2000, 5000, 10000, 20000, 50000].map((amt) => (
                  <button key={amt} onClick={() => setAmount(amt.toString())} className={`p-3 rounded-lg border-2 font-medium transition-all ${amount === amt.toString() ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 hover:border-primary-300'}`}>₦{amt.toLocaleString()}</button>
                ))}
              </div>
              <input type="number" placeholder="Custom amount (min ₦100)" className="input-field" value={amount} onChange={(e) => setAmount(e.target.value)} min={100} />
              <div className="flex gap-3">
                <button onClick={() => setStep(0)} className="btn-secondary flex-1">Back</button>
                <button onClick={() => amount >= 100 ? setStep(2) : toast.error('Minimum amount is ₦100')} className="btn-primary flex-1">Continue</button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="card space-y-4">
              <h3 className="font-semibold">Confirm Purchase</h3>
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between"><span className="text-gray-600">Meter</span><span className="font-medium">{selectedMeter.meterNumber}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Amount</span><span className="font-medium">₦{parseInt(amount).toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Payment Method</span><span className="font-medium">Demo Mode</span></div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800 flex items-center gap-2"><Zap className="w-4 h-4" /> Payment Environment: DEMO</div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="btn-secondary flex-1">Back</button>
                <button onClick={() => setStep(3)} className="btn-primary flex-1">Proceed to Payment</button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="card text-center py-12">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4"><Zap className="w-8 h-8 text-primary-600" /></div>
              <h3 className="font-semibold text-lg mb-2">Processing Payment</h3>
              <p className="text-gray-600 mb-6">Please wait while we process your demo payment...</p>
              <button onClick={handlePayment} disabled={loading} className="btn-primary w-full">{loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Confirm Payment'}</button>
            </motion.div>
          )}

          {step === 4 && result && (
            <motion.div key="step4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="card text-center space-y-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto"><Check className="w-10 h-10 text-green-600" /></div>
              <div><h3 className="text-2xl font-bold text-green-700">Payment Successful</h3><p className="text-gray-600">Your token has been generated</p></div>
              <div className="bg-gray-50 rounded-xl p-6 space-y-3 text-left max-w-sm mx-auto">
                <div className="flex justify-between"><span className="text-gray-600">Meter Number</span><span className="font-medium">{result.meterNumber}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Amount</span><span className="font-medium">₦{result.amount.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Units</span><span className="font-medium">{result.units} kWh</span></div>
                <div className="pt-3 border-t"><p className="text-sm text-gray-500 mb-1">Token</p><p className="text-xl font-bold text-primary-700 tracking-wider">{result.token}</p></div>
                <div className="flex justify-between text-sm pt-2"><span className="text-gray-500">Transaction ID</span><span className="font-mono">{result.reference}</span></div>
              </div>
              <div className="flex gap-3 justify-center">
                <button onClick={copyToken} className="btn-secondary flex items-center gap-2"><Copy className="w-4 h-4" /> Copy Token</button>
                <Link to="/transactions" className="btn-primary flex items-center gap-2"><Download className="w-4 h-4" /> View Receipt</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}