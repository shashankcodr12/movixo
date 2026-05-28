import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star, TrendingUp, Sparkles, Filter, Loader2, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import MovieCard from '../components/MovieCard.jsx';
import { moviesApi, BASE_URL } from '../lib/api.js';
import { adaptMovie } from '../lib/dataAdapter.js';

const GENRES    = ['All', 'Action', 'Drama', 'Romance', 'Comedy', 'Thriller', 'Sci-Fi', 'Superhero', 'Horror'];
const LANGUAGES = ['All', 'Hindi', 'English', 'Tamil', 'Telugu'];

export default function Home() {
  const [heroIndex, setHeroIndex]       = useState(0);
  const [genre, setGenre]               = useState('All');
  const [lang, setLang]                 = useState('All');
  const [showFilters, setShowFilters]   = useState(false);
  const [allMovies, setAllMovies]       = useState([]);   // raw from API
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [backendOnline, setBackendOnline] = useState(true);

  // ── Fetch all movies from your Java backend ──────────────────
  useEffect(() => {
    setLoading(true);
    setError(null);
    moviesApi.getAll()
      .then(data => {
        setAllMovies(data.map(adaptMovie));
        setBackendOnline(true);
      })
      .catch(err => {
        setError(err.message);
        setBackendOnline(false);
      })
      .finally(() => setLoading(false));
  }, []);

  // ── Filter on the frontend (since your backend doesn't filter yet) ──
  const movies = allMovies.filter(m => {
    const genreMatch = genre === 'All' || m.genre.includes(genre);
    const langMatch  = lang  === 'All' || m.language.includes(lang);
    return genreMatch && langMatch;
  });

  // ── Hero carousel ────────────────────────────────────────────
  const heroMovies = movies.slice(0, 3);
  useEffect(() => {
    if (!heroMovies.length) return;
    const t = setInterval(() => setHeroIndex(i => (i + 1) % heroMovies.length), 5000);
    return () => clearInterval(t);
  }, [heroMovies.length]);
  const hero = heroMovies[heroIndex];

  return (
    <div className="min-h-screen bg-[#0f0f1a]">

      {/* ── Backend Status Banner ── */}
      {!loading && (
        <div className={`flex items-center justify-center gap-2 py-2 text-xs font-medium ${backendOnline ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
          {backendOnline
            ? <><Wifi className="w-3.5 h-3.5" /> Connected to backend — {BASE_URL}</>
            : <><WifiOff className="w-3.5 h-3.5" /> Backend offline — make sure Spring Boot is running on port 8080</>
          }
        </div>
      )}

      {/* ── Hero Banner ── */}
      {hero && (
        <div className="relative h-[420px] md:h-[520px] overflow-hidden">
          <motion.div
            key={heroIndex}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}
            className="absolute inset-0"
          >
            {/* Use poster as banner, with genre-colored gradient overlay */}
            <img
              src={hero.image}
              alt={hero.title}
              className="w-full h-full object-cover scale-110 blur-sm"
            />
            <div className="absolute inset-0" style={{ background: `linear-gradient(to right, ${hero.bannerColor ?? '#0f0f1a'}ee, ${hero.bannerColor ?? '#0f0f1a'}99, transparent)` }} />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f1a] via-transparent to-transparent" />
          </motion.div>

          <div className="relative z-10 h-full flex items-center">
            <div className="max-w-7xl mx-auto px-4 w-full flex items-center gap-8">
              {/* Poster */}
              <motion.img
                key={heroIndex + 'poster'}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}
                src={hero.image}
                alt={hero.title}
                className="hidden md:block w-36 rounded-xl shadow-2xl border-2 border-white/10 shrink-0"
              />
              {/* Info */}
              <motion.div
                key={heroIndex + 'text'}
                initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.15 }}
                className="max-w-xl"
              >
                <div className="flex items-center gap-2 mb-3">
                  {hero.genre.map(g => (
                    <span key={g} className="bg-[#e63946] text-white text-xs font-bold px-2 py-1 rounded">{g}</span>
                  ))}
                  {hero.language.map(l => (
                    <span key={l} className="bg-white/10 text-white text-xs px-2 py-1 rounded border border-white/20">{l}</span>
                  ))}
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-white mb-3 leading-tight">{hero.title}</h1>
                <div className="flex items-center gap-3 mb-3">
                  {hero.rating > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-yellow-400 font-bold">{hero.rating}/10</span>
                    </div>
                  )}
                  <span className="text-gray-300 text-sm">
                    {Math.floor(hero.duration / 60)}h {hero.duration % 60}m
                  </span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-300 text-sm">
                    {new Date(hero.releaseDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-6 line-clamp-2">{hero.description}</p>
                <a
                  href={`/movie/${hero.id}`}
                  className="inline-block bg-[#e63946] hover:bg-[#c1121f] text-white px-8 py-3 rounded-xl font-bold text-base transition-all hover:scale-105 shadow-lg shadow-[#e63946]/30"
                >
                  Book Tickets
                </a>
              </motion.div>
            </div>
          </div>

          {/* Carousel Controls */}
          {heroMovies.length > 1 && (
            <div className="absolute bottom-6 right-6 flex items-center gap-3 z-10">
              <button onClick={() => setHeroIndex(i => (i - 1 + heroMovies.length) % heroMovies.length)}
                className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex gap-1.5">
                {heroMovies.map((_, i) => (
                  <button key={i} onClick={() => setHeroIndex(i)}
                    className={`h-1.5 rounded-full transition-all ${i === heroIndex ? 'w-6 bg-[#e63946]' : 'w-1.5 bg-white/30'}`} />
                ))}
              </div>
              <button onClick={() => setHeroIndex(i => (i + 1) % heroMovies.length)}
                className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Main Content ── */}
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-[#e63946]" />
            <h2 className="text-white text-xl font-bold">Now Showing</h2>
            {!loading && (
              <span className="bg-[#e63946]/20 text-[#e63946] text-xs font-semibold px-2 py-0.5 rounded-full">
                {movies.length} movies
              </span>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${showFilters ? 'bg-[#e63946]/20 border-[#e63946]/40 text-[#e63946]' : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'}`}
          >
            <Filter className="w-4 h-4" /> Filters
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10 space-y-4">
            {[{ label: 'Genre', items: GENRES, val: genre, set: setGenre },
              { label: 'Language', items: LANGUAGES, val: lang, set: setLang }
            ].map(({ label, items, val, set }) => (
              <div key={label}>
                <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-2">{label}</p>
                <div className="flex flex-wrap gap-2">
                  {items.map(item => (
                    <button key={item} onClick={() => set(item)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${val === item ? 'bg-[#e63946] text-white' : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'}`}>
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-10 h-10 text-[#e63946] animate-spin" />
            <p className="text-gray-400">Fetching movies from your backend...</p>
            <p className="text-gray-600 text-xs font-mono">{BASE_URL}/movies</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <p className="text-red-400 font-semibold text-lg">Cannot connect to backend</p>
            <div className="bg-black/30 rounded-xl p-4 text-center max-w-md">
              <p className="text-gray-400 text-sm mb-2">{error}</p>
              <p className="text-gray-500 text-xs">Make sure your Spring Boot app is running:</p>
              <code className="text-[#e63946] text-sm">mvn spring-boot:run</code>
              <p className="text-gray-500 text-xs mt-2">Then add CORS to your controller:</p>
              <code className="text-green-400 text-xs block mt-1">@CrossOrigin(origins = "*")</code>
            </div>
          </div>
        )}

        {/* Movie Grid */}
        {!loading && !error && movies.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {movies.map((movie, i) => <MovieCard key={movie.id} movie={movie} index={i} />)}
          </div>
        )}

        {!loading && !error && movies.length === 0 && allMovies.length > 0 && (
          <div className="text-center py-20">
            <Sparkles className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No movies match this filter.</p>
            <button onClick={() => { setGenre('All'); setLang('All'); }} className="mt-4 text-[#e63946] hover:underline text-sm">
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
