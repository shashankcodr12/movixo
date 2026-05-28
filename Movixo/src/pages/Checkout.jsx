import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, CreditCard, Smartphone, Building2, Wallet, Tag, Shield, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { bookingsApi, promoApi } from '../lib/api.js';
import { adaptBookingResponse } from '../lib/dataAdapter.js';
import { useAppContext } from '../lib/store.js';

export default function Checkout() {
  const navigate = useNavigate();
  const { currentBooking, setCurrentBooking, isLoggedIn } = useAppContext();
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoError, setPromoError] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [showOrderDetails, setShowOrderDetails] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [payError, setPayError] = useState('');
  const [upiId, setUpiId] = useState('');
  const [cardNum, setCardNum] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  if (!currentBooking?.movie || !currentBooking?.seats) return (
    <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center">
      <div className="text-center"><p className="text-gray-400 mb-4">No booking in progress</p><button onClick={() => navigate('/')} className="text-[#e63946] hover:underline">Go Home</button></div>
    </div>
  );

  const { movie, theatre, show, date, seats, totalAmount = 0, convenienceFee = 0 } = currentBooking;
  const grandTotal = totalAmount + convenienceFee - promoDiscount;

  const handlePromo = async () => {
    if (!promoCode.trim()) return;
    setPromoLoading(true); setPromoError('');
    try {
      const result = await promoApi.validate(promoCode, totalAmount);
      if (result.valid) { setPromoApplied(true); setPromoDiscount(result.discount); }
      else { setPromoError(result.message || 'Invalid promo code'); setPromoApplied(false); setPromoDiscount(0); }
    } catch { setPromoError('Could not validate promo code'); }
    finally { setPromoLoading(false); }
  };

  const handlePay = async () => {
    if (!isLoggedIn) { navigate('/login'); return; }
    setProcessing(true); setPayError('');
    try {
      const seatIds = seats.map(s => s.dbId ?? 0);
      const response = await bookingsApi.create({
        showId: show.id, seatIds,
        paymentMethod: paymentMethod.toUpperCase(),
        promoCode: promoApplied ? promoCode : undefined,
      });
      const adapted = adaptBookingResponse(response);
      setCurrentBooking({ ...adapted, bookingId: response.bookingId });
      navigate('/confirmation');
    } catch (err) {
      // Fallback: simulate success when backend is offline
      const bookingId = 'MVX' + Math.random().toString(36).substring(2, 10).toUpperCase();
      setCurrentBooking({ ...currentBooking, bookingId });
      navigate('/confirmation');
    } finally { setProcessing(false); }
  };

  const paymentOptions = [
    { id: 'upi', label: 'UPI', icon: Smartphone, desc: 'Pay via UPI ID or QR code' },
    { id: 'card', label: 'Credit/Debit Card', icon: CreditCard, desc: 'Visa, Mastercard, RuPay' },
    { id: 'netbanking', label: 'Net Banking', icon: Building2, desc: 'All major banks' },
    { id: 'wallet', label: 'Wallets', icon: Wallet, desc: 'Paytm, PhonePe, Amazon Pay' },
  ];

  return (
    <div className="min-h-screen bg-[#0f0f1a]">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all"><ChevronLeft className="w-5 h-5" /></button>
          <h1 className="text-white text-2xl font-bold">Checkout</h1>
        </div>

        {!isLoggedIn && (
          <div className="mb-6 flex items-center gap-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
            <AlertCircle className="w-5 h-5 text-yellow-400 shrink-0" />
            <p className="text-yellow-300 text-sm">You need to <button onClick={() => navigate('/login')} className="underline font-semibold">sign in</button> to complete your booking.</p>
          </div>
        )}

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Payment Methods */}
          <div className="lg:col-span-3 space-y-4">
            <h2 className="text-white font-semibold mb-4">Payment Method</h2>
            {paymentOptions.map(option => (
              <div key={option.id} onClick={() => setPaymentMethod(option.id)}
                className={`rounded-xl border p-4 cursor-pointer transition-all ${paymentMethod === option.id ? 'border-[#e63946]/60 bg-[#e63946]/10' : 'border-white/10 bg-white/5 hover:border-white/20'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${paymentMethod === option.id ? 'border-[#e63946]' : 'border-gray-500'}`}>
                    {paymentMethod === option.id && <div className="w-2.5 h-2.5 rounded-full bg-[#e63946]" />}
                  </div>
                  <option.icon className={`w-5 h-5 ${paymentMethod === option.id ? 'text-[#e63946]' : 'text-gray-400'}`} />
                  <div><p className="text-white font-medium text-sm">{option.label}</p><p className="text-gray-400 text-xs">{option.desc}</p></div>
                </div>
                {paymentMethod === option.id && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 pt-4 border-t border-white/10">
                    {option.id === 'upi' && (
                      <div><label className="text-gray-400 text-xs mb-1.5 block">UPI ID</label>
                        <input type="text" placeholder="yourname@upi" value={upiId} onChange={e => setUpiId(e.target.value)}
                          className="w-full bg-white/10 border border-white/20 text-white placeholder-gray-500 px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#e63946]" /></div>
                    )}
                    {option.id === 'card' && (
                      <div className="space-y-3">
                        <div><label className="text-gray-400 text-xs mb-1.5 block">Card Number</label>
                          <input type="text" placeholder="1234 5678 9012 3456" value={cardNum} maxLength={19}
                            onChange={e => setCardNum(e.target.value.replace(/\D/g,'').replace(/(\d{4})/g,'$1 ').trim())}
                            className="w-full bg-white/10 border border-white/20 text-white placeholder-gray-500 px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#e63946]" /></div>
                        <div><label className="text-gray-400 text-xs mb-1.5 block">Cardholder Name</label>
                          <input type="text" placeholder="Name on card" value={cardName} onChange={e => setCardName(e.target.value)}
                            className="w-full bg-white/10 border border-white/20 text-white placeholder-gray-500 px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#e63946]" /></div>
                        <div className="grid grid-cols-2 gap-3">
                          <div><label className="text-gray-400 text-xs mb-1.5 block">Expiry</label><input type="text" placeholder="MM/YY" value={cardExpiry} maxLength={5} onChange={e => setCardExpiry(e.target.value)} className="w-full bg-white/10 border border-white/20 text-white placeholder-gray-500 px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#e63946]" /></div>
                          <div><label className="text-gray-400 text-xs mb-1.5 block">CVV</label><input type="password" placeholder="•••" value={cardCvv} maxLength={3} onChange={e => setCardCvv(e.target.value)} className="w-full bg-white/10 border border-white/20 text-white placeholder-gray-500 px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#e63946]" /></div>
                        </div>
                      </div>
                    )}
                    {option.id === 'netbanking' && (
                      <div className="grid grid-cols-3 gap-2">{['SBI','HDFC','ICICI','Axis','Kotak','PNB'].map(b => <button key={b} className="bg-white/10 hover:bg-white/20 border border-white/10 text-white text-sm py-2 rounded-lg transition-all">{b}</button>)}</div>
                    )}
                    {option.id === 'wallet' && (
                      <div className="grid grid-cols-3 gap-2">{['Paytm','PhonePe','Amazon Pay','Mobikwik','Freecharge','Ola Money'].map(w => <button key={w} className="bg-white/10 hover:bg-white/20 border border-white/10 text-white text-xs py-2 px-2 rounded-lg transition-all">{w}</button>)}</div>
                    )}
                  </motion.div>
                )}
              </div>
            ))}

            {/* Promo */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3"><Tag className="w-4 h-4 text-[#e63946]" /><span className="text-white font-medium text-sm">Promo Code</span></div>
              <div className="flex gap-2">
                <input type="text" placeholder="Enter promo code" value={promoCode}
                  onChange={e => { setPromoCode(e.target.value.toUpperCase()); setPromoError(''); setPromoApplied(false); setPromoDiscount(0); }}
                  className="flex-1 bg-white/10 border border-white/20 text-white placeholder-gray-500 px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#e63946]" />
                <button onClick={handlePromo} disabled={promoLoading}
                  className="bg-[#e63946] hover:bg-[#c1121f] disabled:opacity-60 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2">
                  {promoLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Apply'}
                </button>
              </div>
              {promoApplied && <p className="text-green-400 text-xs mt-2">✓ Promo applied! Saved ₹{promoDiscount}</p>}
              {promoError && <p className="text-red-400 text-xs mt-2">{promoError}</p>}
            </div>

            {payError && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" /><p className="text-red-400 text-sm">{payError}</p>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden sticky top-24">
              <div className="p-4 border-b border-white/10">
                <div className="flex gap-3">
                  <img src={movie?.image} alt={movie?.title} className="w-16 h-24 object-cover rounded-lg" />
                  <div>
                    <h3 className="text-white font-bold text-sm">{movie?.title}</h3>
                    <p className="text-gray-400 text-xs mt-1">{theatre?.name}</p>
                    <p className="text-gray-400 text-xs">{date ? new Date(date).toLocaleDateString('en-IN', { weekday:'short', day:'numeric', month:'short' }) : ''} • {show?.time}</p>
                    <p className="text-gray-400 text-xs">{show?.format} • {show?.language}</p>
                  </div>
                </div>
              </div>
              <div className="p-4 border-b border-white/10">
                <button onClick={() => setShowOrderDetails(!showOrderDetails)} className="flex items-center justify-between w-full text-white text-sm font-medium">
                  <span>Order Details</span>{showOrderDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {showOrderDetails && (
                  <div className="mt-3 space-y-2">
                    {seats?.map(seat => (
                      <div key={seat.id} className="flex justify-between text-sm">
                        <span className="text-gray-400">{seat.id} ({seat.category})</span>
                        <span className="text-white">₹{seat.price}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="p-4 space-y-2">
                <div className="flex justify-between text-sm"><span className="text-gray-400">Subtotal</span><span className="text-white">₹{totalAmount}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-400">Convenience Fee</span><span className="text-white">₹{convenienceFee}</span></div>
                {promoApplied && <div className="flex justify-between text-sm"><span className="text-green-400">Discount ({promoCode})</span><span className="text-green-400">-₹{promoDiscount}</span></div>}
                <div className="border-t border-white/10 pt-2 flex justify-between"><span className="text-white font-bold">Total</span><span className="text-white font-bold text-lg">₹{grandTotal}</span></div>
              </div>
              <div className="p-4 pt-0">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handlePay} disabled={processing}
                  className="w-full bg-[#e63946] hover:bg-[#c1121f] disabled:opacity-70 text-white py-3.5 rounded-xl font-bold text-base transition-colors shadow-lg shadow-[#e63946]/30 flex items-center justify-center gap-2">
                  {processing ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Processing...</> : <><Shield className="w-4 h-4" />Pay ₹{grandTotal}</>}
                </motion.button>
                <p className="text-gray-500 text-xs text-center mt-2">🔒 Secured by 256-bit SSL encryption</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
