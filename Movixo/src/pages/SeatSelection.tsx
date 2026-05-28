import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Info, Monitor, Loader2, AlertCircle } from 'lucide-react';
import { showsApi } from '../lib/api';
import { adaptSeat } from '../lib/dataAdapter';
import { useAppContext } from '../lib/store';
import type { Seat } from '../lib/types';

export default function SeatSelection() {
  const navigate = useNavigate();
  const { currentBooking, setCurrentBooking } = useAppContext();

  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch real seat layout from Java backend
  useEffect(() => {
    const showId = currentBooking?.show?.id;
    if (!showId) return;
    setLoading(true);
    setError(null);
    showsApi
      .getSeats(showId)
      .then((dtos) => setSeats(dtos.map(adaptSeat)))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [currentBooking?.show?.id]);

  if (!currentBooking?.movie || !currentBooking?.show) {
    return (
      <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">No booking in progress</p>
          <button onClick={() => navigate('/')} className="text-[#e63946] hover:underline">Go Home</button>
        </div>
      </div>
    );
  }

  const { movie, theatre, show, date } = currentBooking;
  const selectedSeats = seats.filter((s) => s.status === 'selected');

  const toggleSeat = (seatId: string) => {
    setSeats((prev) =>
      prev.map((s) => {
        if (s.id !== seatId) return s;
        if (s.status === 'booked' || s.status === 'unavailable') return s;
        return { ...s, status: s.status === 'selected' ? 'available' : 'selected' };
      })
    );
  };

  const totalAmount = selectedSeats.reduce((sum, s) => sum + s.price, 0);
  const convenienceFee = Math.round(totalAmount * 0.12);

  const handleProceed = () => {
    if (selectedSeats.length === 0) return;
    setCurrentBooking({ ...currentBooking, seats: selectedSeats, totalAmount, convenienceFee });
    navigate('/checkout');
  };

  const rows = [...new Set(seats.map((s) => s.row))];

  const getCategoryColor = (category: Seat['category'], status: Seat['status']) => {
    if (status === 'booked') return 'bg-gray-700 border-gray-600 cursor-not-allowed opacity-50';
    if (status === 'unavailable') return 'bg-gray-800 border-gray-700 cursor-not-allowed opacity-30';
    if (status === 'selected') return 'bg-[#e63946] border-[#e63946] shadow-lg shadow-[#e63946]/30 scale-110';
    if (category === 'platinum') return 'bg-purple-900/50 border-purple-500/50 hover:bg-purple-600/60 hover:border-purple-400 cursor-pointer';
    if (category === 'gold') return 'bg-yellow-900/50 border-yellow-600/50 hover:bg-yellow-600/60 hover:border-yellow-400 cursor-pointer';
    return 'bg-blue-900/50 border-blue-600/50 hover:bg-blue-600/60 hover:border-blue-400 cursor-pointer';
  };

  return (
    <div className="min-h-screen bg-[#0f0f1a]">
      {/* Header */}
      <div className="sticky top-16 z-40 bg-[#0f0f1a]/95 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-white font-bold">{movie?.title}</h1>
            <p className="text-gray-400 text-sm">
              {theatre?.name} &bull; {show?.time} &bull; {show?.format} &bull;{' '}
              {date ? new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : ''}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-10 h-10 text-[#e63946] animate-spin" />
            <p className="text-gray-400">Loading seat layout...</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <AlertCircle className="w-10 h-10 text-red-400" />
            <p className="text-red-400 font-semibold">Failed to load seats</p>
            <p className="text-gray-500 text-sm">{error}</p>
            <button onClick={() => navigate(-1)} className="text-[#e63946] hover:underline text-sm">Go Back</button>
          </div>
        )}

        {/* Seat Map */}
        {!loading && !error && (
          <>
            {/* Screen */}
            <div className="text-center mb-10">
              <div className="relative inline-block w-full max-w-lg">
                <div className="h-3 bg-gradient-to-b from-white/30 to-transparent rounded-t-full mx-8" />
                <div className="flex items-center justify-center gap-2 mt-2">
                  <Monitor className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-500 text-xs font-medium uppercase tracking-widest">All eyes this way please!</span>
                </div>
              </div>
            </div>

            {/* Seats */}
            <div className="overflow-x-auto pb-4">
              <div className="min-w-max mx-auto">
                {rows.map((row) => {
                  const rowSeats = seats.filter((s) => s.row === row);
                  const category = rowSeats[0]?.category;
                  const prevRow = rows[rows.indexOf(row) - 1];
                  const prevCategory = prevRow ? seats.find((s) => s.row === prevRow)?.category : null;
                  const isFirstOfCategory = !prevCategory || prevCategory !== category;

                  return (
                    <div key={row}>
                      {isFirstOfCategory && (
                        <div className="flex items-center gap-3 my-3">
                          <div className="flex-1 h-px bg-white/10" />
                          <span
                            className={`text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full ${
                              category === 'platinum'
                                ? 'text-purple-400 bg-purple-400/10 border border-purple-400/20'
                                : category === 'gold'
                                ? 'text-yellow-400 bg-yellow-400/10 border border-yellow-400/20'
                                : 'text-blue-400 bg-blue-400/10 border border-blue-400/20'
                            }`}
                          >
                            {category} — ₹{rowSeats[0]?.price}
                          </span>
                          <div className="flex-1 h-px bg-white/10" />
                        </div>
                      )}
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-gray-600 text-xs w-5 text-right font-mono">{row}</span>
                        <div className="flex gap-1.5">
                          {rowSeats.map((seat, idx) => (
                            <span key={seat.id}>
                              {idx === Math.floor(rowSeats.length / 2) && (
                                <span className="inline-block w-4" />
                              )}
                              <motion.button
                                whileTap={seat.status !== 'booked' && seat.status !== 'unavailable' ? { scale: 0.9 } : {}}
                                onClick={() => toggleSeat(seat.id)}
                                className={`w-7 h-6 rounded text-xs font-bold border transition-all ${getCategoryColor(seat.category, seat.status)}`}
                                title={`${seat.id} — ₹${seat.price}`}
                              />
                            </span>
                          ))}
                        </div>
                        <span className="text-gray-600 text-xs w-5 font-mono">{row}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-6 mt-8 mb-6">
              {[
                { label: 'Available', color: 'bg-blue-900/50 border-blue-600/50' },
                { label: 'Selected', color: 'bg-[#e63946] border-[#e63946]' },
                { label: 'Booked', color: 'bg-gray-700 border-gray-600 opacity-50' },
              ].map(({ label, color }) => (
                <div key={label} className="flex items-center gap-2">
                  <div className={`w-6 h-5 rounded border ${color}`} />
                  <span className="text-gray-400 text-sm">{label}</span>
                </div>
              ))}
            </div>

            {/* Category Legend */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {[
                { label: 'Platinum', color: 'bg-purple-900/50 border-purple-500/50 text-purple-400' },
                { label: 'Gold', color: 'bg-yellow-900/50 border-yellow-600/50 text-yellow-400' },
                { label: 'Silver', color: 'bg-blue-900/50 border-blue-600/50 text-blue-400' },
              ].map(({ label, color }) => (
                <div key={label} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${color}`}>
                  <span className="text-xs font-medium">{label}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Sticky Bottom Bar */}
      <div className="sticky bottom-0 bg-[#16213e] border-t border-white/10 shadow-2xl">
        <div className="max-w-4xl mx-auto px-4 py-4">
          {selectedSeats.length > 0 ? (
            <div className="flex items-center justify-between">
              <div>
                <div className="flex flex-wrap gap-1.5 mb-1">
                  {selectedSeats.map((s) => (
                    <span key={s.id} className="bg-[#e63946]/20 text-[#e63946] text-xs font-bold px-2 py-0.5 rounded">
                      {s.id}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-white font-bold text-lg">₹{totalAmount + convenienceFee}</span>
                  <span className="text-gray-400 text-sm">({selectedSeats.length} ticket{selectedSeats.length > 1 ? 's' : ''})</span>
                  <div className="flex items-center gap-1 text-gray-500 text-xs">
                    <Info className="w-3 h-3" />
                    incl. ₹{convenienceFee} fee
                  </div>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleProceed}
                className="bg-[#e63946] hover:bg-[#c1121f] text-white px-8 py-3 rounded-xl font-bold transition-colors shadow-lg shadow-[#e63946]/30"
              >
                Proceed
              </motion.button>
            </div>
          ) : (
            <div className="text-center text-gray-400 text-sm py-1">
              Select seats to continue
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
