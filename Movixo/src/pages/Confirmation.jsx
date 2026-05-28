import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Download, Share2, Home, MapPin, Calendar, Clock, Ticket, QrCode } from 'lucide-react';
import { useAppContext } from '../lib/store.js';

export default function Confirmation() {
  const navigate = useNavigate();
  const { currentBooking } = useAppContext();

  if (!currentBooking?.movie || !currentBooking?.bookingId) return (
    <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center">
      <div className="text-center"><p className="text-gray-400 mb-4">No booking found</p><button onClick={() => navigate('/')} className="text-[#e63946] hover:underline">Go Home</button></div>
    </div>
  );

  const { movie, theatre, show, date, seats, totalAmount = 0, convenienceFee = 0, bookingId } = currentBooking;

  return (
    <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 20 }} className="text-center mb-6">
          <div className="w-20 h-20 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="text-white text-2xl font-black mb-1">Booking Confirmed!</h1>
          <p className="text-gray-400">Your tickets have been booked successfully</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-[#16213e] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
          <div className="relative h-32 overflow-hidden">
            <img src={movie?.image} alt={movie?.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#16213e] to-transparent" />
            <div className="absolute bottom-3 left-4">
              <h2 className="text-white font-black text-xl">{movie?.title}</h2>
              <p className="text-gray-300 text-sm">{(movie?.genre ?? []).join(' • ')}</p>
            </div>
          </div>

          <div className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 text-[#e63946] mt-0.5 shrink-0" />
                <div><p className="text-gray-500 text-xs">Date</p><p className="text-white text-sm font-semibold">{date ? new Date(date).toLocaleDateString('en-IN', { weekday:'short', day:'numeric', month:'long' }) : ''}</p></div>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-[#e63946] mt-0.5 shrink-0" />
                <div><p className="text-gray-500 text-xs">Show Time</p><p className="text-white text-sm font-semibold">{show?.time}</p></div>
              </div>
              <div className="flex items-start gap-2 col-span-2">
                <MapPin className="w-4 h-4 text-[#e63946] mt-0.5 shrink-0" />
                <div><p className="text-gray-500 text-xs">Theatre</p><p className="text-white text-sm font-semibold">{theatre?.name}</p><p className="text-gray-400 text-xs">{theatre?.location}</p></div>
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <Ticket className="w-4 h-4 text-[#e63946]" />
                <span className="text-white text-sm font-semibold">{seats?.length} Ticket{(seats?.length ?? 0) > 1 ? 's' : ''}</span>
                <span className="text-gray-400 text-xs">• {show?.format} • {show?.language}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {seats?.map(seat => (
                  <div key={seat.id} className="bg-[#e63946]/20 border border-[#e63946]/30 rounded-lg px-3 py-1.5 text-center">
                    <p className="text-[#e63946] font-bold text-sm">{seat.id}</p>
                    <p className="text-gray-400 text-xs capitalize">{seat.category}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-[#0f0f1a] border border-white/10 -ml-8" />
              <div className="flex-1 border-t-2 border-dashed border-white/10" />
              <div className="w-5 h-5 rounded-full bg-[#0f0f1a] border border-white/10 -mr-8" />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs mb-1">Booking ID</p>
                <p className="text-white font-mono font-bold text-lg tracking-wider">{bookingId}</p>
                <p className="text-gray-400 text-xs mt-1">Total Paid: <span className="text-white font-semibold">₹{totalAmount + convenienceFee}</span></p>
              </div>
              <div className="w-20 h-20 bg-white rounded-xl flex items-center justify-center">
                <QrCode className="w-14 h-14 text-black" />
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="flex gap-3 mt-6">
          <button className="flex-1 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 border border-white/10 text-white py-3 rounded-xl text-sm font-semibold transition-all"><Download className="w-4 h-4" />Download</button>
          <button className="flex-1 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 border border-white/10 text-white py-3 rounded-xl text-sm font-semibold transition-all"><Share2 className="w-4 h-4" />Share</button>
          <button onClick={() => navigate('/')} className="flex-1 flex items-center justify-center gap-2 bg-[#e63946] hover:bg-[#c1121f] text-white py-3 rounded-xl text-sm font-semibold transition-all"><Home className="w-4 h-4" />Home</button>
        </motion.div>
        <p className="text-center text-gray-500 text-xs mt-4">Confirmation sent to your registered email & phone</p>
      </div>
    </div>
  );
}
