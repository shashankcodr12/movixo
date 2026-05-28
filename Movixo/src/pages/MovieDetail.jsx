import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Clock, Calendar, ChevronLeft, MapPin, Loader2, AlertCircle } from 'lucide-react';
import { moviesApi, showsApi } from '../lib/api.js';
import { adaptMovie, adaptTheatreWithShows } from '../lib/dataAdapter.js';
import { useAppContext } from '../lib/store.js';

const DATES = Array.from({ length: 7 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() + i);
  return {
    date: d.toISOString().split('T')[0],
    day:   d.toLocaleDateString('en-IN', { weekday: 'short' }),
    num:   d.getDate(),
    month: d.toLocaleDateString('en-IN', { month: 'short' }),
  };
});

export default function MovieDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setCurrentBooking } = useAppContext();

  const [movie, setMovie]               = useState(null);
  const [theatres, setTheatres]         = useState([]);
  const [reviews, setReviews]           = useState([]);
  const [selectedDate, setSelectedDate] = useState(DATES[0].date);
  const [activeTab, setActiveTab]       = useState('about');
  const [loadingMovie, setLoadingMovie] = useState(true);
  const [loadingShows, setLoadingShows] = useState(false);
  const [movieError, setMovieError]     = useState(null);

  // Fetch movie by ID from your backend: GET /api/movies/:id
  useEffect(() => {
    if (!id) return;
    setLoadingMovie(true);
    setMovieError(null);
    moviesApi.getById(Number(id))
      .then(dto => setMovie(adaptMovie(dto)))
      .catch(err => setMovieError(err.message))
      .finally(() => setLoadingMovie(false));

    // Reviews — only if your backend has this endpoint
    moviesApi.getReviews(Number(id)).then(setReviews).catch(() => setReviews([]));
  }, [id]);

  // Fetch shows: GET /api/shows?movieId=:id&date=:date
  useEffect(() => {
    if (!id) return;
    setLoadingShows(true);
    showsApi.getByMovieAndDate(Number(id), selectedDate)
      .then(data => setTheatres(data.map(d => adaptTheatreWithShows(d.theatre, d.shows))))
      .catch(() => setTheatres([]))   // no shows yet — show empty state
      .finally(() => setLoadingShows(false));
  }, [id, selectedDate]);

  const handleShowSelect = (theatre, show) => {
    setCurrentBooking({ movie, theatre, show, date: selectedDate });
    navigate('/seat-selection');
  };

  const availColor = (avail, total) => {
    if (avail === 0) return 'text-red-400 bg-red-400/10';
    if (avail / total < 0.2) return 'text-orange-400 bg-orange-400/10';
    return 'text-green-400 bg-green-400/10';
  };
  const availLabel = avail => avail === 0 ? 'Sold Out' : avail < 10 ? 'Filling Fast' : 'Available';

  if (loadingMovie) return (
    <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-10 h-10 text-[#e63946] animate-spin" />
        <p className="text-gray-400">Loading movie details...</p>
      </div>
    </div>
  );

  if (movieError || !movie) return (
    <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center">
      <div className="text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <p className="text-red-400 font-semibold mb-2">Failed to load movie</p>
        <p className="text-gray-500 text-sm mb-4">{movieError}</p>
        <button onClick={() => navigate('/')} className="text-[#e63946] hover:underline">← Go Back</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f0f1a]">

      {/* Banner — uses poster blurred as background */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img src={movie.image} alt={movie.title} className="w-full h-full object-cover blur-sm scale-110" />
        <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, ${movie.bannerColor ?? '#0f0f1a'}cc, ${movie.bannerColor ?? '#0f0f1a'})` }} />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f0f1a]/80 to-transparent" />
        <button onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-black/70 transition-all">
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {/* Movie Header */}
        <div className="flex gap-6 -mt-24 relative z-10 mb-8">
          <div className="w-32 md:w-44 shrink-0">
            <img src={movie.image} alt={movie.title}
              className="w-full aspect-[2/3] object-cover rounded-xl shadow-2xl border-2 border-white/10" />
          </div>
          <div className="flex-1 pt-20 md:pt-24">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {movie.genre.map(g => (
                <span key={g} className="bg-[#e63946] text-white text-xs font-bold px-2 py-0.5 rounded">{g}</span>
              ))}
              {movie.language.map(l => (
                <span key={l} className="bg-white/10 text-white text-xs px-2 py-0.5 rounded border border-white/20">{l}</span>
              ))}
            </div>
            <h1 className="text-2xl md:text-4xl font-black text-white mb-2">{movie.title}</h1>
            <div className="flex flex-wrap items-center gap-3 mb-3">
              {movie.rating > 0 && (
                <div className="flex items-center gap-1.5 bg-green-500/20 px-2 py-1 rounded-lg">
                  <Star className="w-4 h-4 text-green-400 fill-green-400" />
                  <span className="text-green-400 font-bold text-sm">{movie.rating}/10</span>
                </div>
              )}
              <div className="flex items-center gap-1 text-gray-300 text-sm">
                <Clock className="w-4 h-4" />
                {Math.floor(movie.duration / 60)}h {movie.duration % 60}m
              </div>
              <span className="text-gray-400 text-sm">
                {new Date(movie.releaseDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white/5 p-1 rounded-xl w-fit">
          {['about', 'cast', 'reviews'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${activeTab === tab ? 'bg-[#e63946] text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>
              {tab}
              {tab === 'reviews' && reviews.length > 0 && (
                <span className="ml-1.5 bg-white/20 text-xs px-1.5 py-0.5 rounded-full">{reviews.length}</span>
              )}
            </button>
          ))}
        </div>

        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          {activeTab === 'about' && (
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <h3 className="text-white font-semibold mb-3">About the Movie</h3>
                <p className="text-gray-300 leading-relaxed">{movie.description}</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    ['Genre',    movie.genre.join(', ')],
                    ['Language', movie.language.join(', ')],
                    ['Duration', `${Math.floor(movie.duration / 60)}h ${movie.duration % 60}m`],
                    ['Release',  new Date(movie.releaseDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })],
                    ...(movie.director !== 'TBA' ? [['Director', movie.director]] : []),
                  ].map(([label, value]) => (
                    <div key={label}>
                      <p className="text-gray-500 text-xs mb-0.5">{label}</p>
                      <p className="text-white text-sm font-medium">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'cast' && (
            <div>
              {movie.cast.length === 0
                ? <p className="text-gray-500 text-center py-8">No cast information available yet.</p>
                : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {movie.cast.map(member => (
                      <div key={member.name} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center hover:border-[#e63946]/30 transition-all">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#e63946]/30 to-purple-600/30 border-2 border-white/10 mx-auto mb-3 flex items-center justify-center">
                          {member.image
                            ? <img src={member.image} alt={member.name} className="w-full h-full object-cover rounded-full" />
                            : <span className="text-white font-bold text-xl">{member.name[0]}</span>}
                        </div>
                        <p className="text-white font-semibold text-sm">{member.name}</p>
                        <p className="text-gray-400 text-xs mt-0.5">{member.role}</p>
                      </div>
                    ))}
                  </div>
                )
              }
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-4">
              {reviews.length === 0
                ? <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review!</p>
                : reviews.map(r => (
                  <div key={r.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#e63946]/30 flex items-center justify-center text-white font-bold text-sm">
                          {r.userName?.[0] ?? 'U'}
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">{r.userName}</p>
                          <p className="text-gray-500 text-xs">{new Date(r.createdAt).toLocaleDateString('en-IN')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 bg-green-500/20 px-2 py-1 rounded">
                        <Star className="w-3 h-3 text-green-400 fill-green-400" />
                        <span className="text-green-400 text-xs font-bold">{r.rating}/10</span>
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm">{r.comment}</p>
                  </div>
                ))
              }
            </div>
          )}
        </motion.div>

        {/* ── Book Tickets ── */}
        <div className="border-t border-white/10 pt-8">
          <h2 className="text-white text-xl font-bold mb-5 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#e63946]" /> Select Date
          </h2>

          {/* Date Picker */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
            {DATES.map(d => (
              <button key={d.date} onClick={() => setSelectedDate(d.date)}
                className={`shrink-0 flex flex-col items-center px-4 py-3 rounded-xl border transition-all ${selectedDate === d.date ? 'bg-[#e63946] border-[#e63946] text-white shadow-lg shadow-[#e63946]/30' : 'bg-white/5 border-white/10 text-gray-300 hover:border-white/30'}`}>
                <span className="text-xs font-medium">{d.day}</span>
                <span className="text-xl font-black">{d.num}</span>
                <span className="text-xs">{d.month}</span>
              </button>
            ))}
          </div>

          {/* Shows */}
          {loadingShows && (
            <div className="flex items-center justify-center py-12 gap-3">
              <Loader2 className="w-6 h-6 text-[#e63946] animate-spin" />
              <span className="text-gray-400">Fetching showtimes...</span>
            </div>
          )}

          {!loadingShows && (
            <div className="space-y-4 mb-12">
              {theatres.length === 0 ? (
                <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
                  <p className="text-gray-400 mb-2">No shows available for this date.</p>
                  <p className="text-gray-600 text-xs">Add shows via <code className="text-[#e63946]">GET /api/shows?movieId={id}&date={selectedDate}</code></p>
                </div>
              ) : (
                theatres.map(theatre => (
                  <div key={theatre.id} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-white font-bold">{theatre.name}</h3>
                        <div className="flex items-center gap-1.5 text-gray-400 text-sm mt-1">
                          <MapPin className="w-3.5 h-3.5" />{theatre.location}
                          {theatre.distance && <><span className="text-gray-600">•</span>{theatre.distance}</>}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {theatre.shows.map(show => (
                        <button key={show.id}
                          onClick={() => show.availableSeats > 0 && handleShowSelect(theatre, show)}
                          disabled={show.availableSeats === 0}
                          className={`flex flex-col items-center border rounded-xl px-4 py-3 transition-all ${show.availableSeats === 0 ? 'border-red-500/20 bg-red-500/5 cursor-not-allowed opacity-60' : 'border-white/10 bg-white/5 hover:border-[#e63946]/50 hover:bg-[#e63946]/10 cursor-pointer'}`}>
                          <span className="text-white font-bold text-sm">{show.time}</span>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-gray-400 text-xs">{show.format}</span>
                            <span className="text-gray-600 text-xs">•</span>
                            <span className="text-gray-400 text-xs">{show.language}</span>
                          </div>
                          <div className={`mt-1.5 text-xs px-2 py-0.5 rounded-full font-medium ${availColor(show.availableSeats, show.totalSeats)}`}>
                            {availLabel(show.availableSeats)}
                          </div>
                          <div className="text-gray-500 text-xs mt-1">from ₹{show.price?.silver}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
