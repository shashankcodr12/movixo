import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star, TrendingUp, Sparkles, Filter, Loader2, AlertCircle } from 'lucide-react';
import MovieCard from '../components/MovieCard';
import { moviesApi } from '../lib/api';
import { adaptMovie } from '../lib/dataAdapter';
import { useAppContext } from '../lib/store';
import type { Movie } from '../lib/types';

const GENRES = ['All', 'Action', 'Romance', 'Sci-Fi', 'Thriller', 'Comedy', 'Drama', 'Superhero'];
const LANGUAGES = ['All', 'Hindi', 'English', 'Tamil', 'Telugu'];
const FORMATS = ['All', '2D', '3D', 'IMAX', '4DX'];

export default function Home() {
  const { selectedCity } = useAppContext();
  const [heroIndex, setHeroIndex] = useState(0);
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedLang, setSelectedLang] = useState('All');
  const [selectedFormat, setSelectedFormat] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  const [movies, setMovies] = useState<Movie[]>([]);
  const [upcoming, setUpcoming] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch movies from Java backend
  useEffect(() => {
    setLoading(true);
    setError(null);
    moviesApi
      .getAll({
        city: selectedCity,
        genre: selectedGenre !== 'All' ? selectedGenre : undefined,
        language: selectedLang !== 'All' ? selectedLang : undefined,
        format: selectedFormat !== 'All' ? selectedFormat : undefined,
      })
      .then((dtos) => setMovies(dtos.map(adaptMovie)))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [selectedCity, selectedGenre, selectedLang, selectedFormat]);

  useEffect(() => {
    moviesApi.getUpcoming().then((dtos) => setUpcoming(dtos.map(adaptMovie))).catch(() => {});
  }, []);

  const heroMovies = movies.slice(0, 3);

  useEffect(() => {
    if (heroMovies.length === 0) return;
    const timer = setInterval(() => {
      setHeroIndex((i) => (i + 1) % heroMovies.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroMovies.length]);

  const hero = heroMovies[heroIndex];

  return (
    <div className="min-h-screen bg-[#0f0f1a]">
      {/* Hero Banner */}
      {hero && (
        <div className="relative h-[420px] md:h-[520px] overflow-hidden">
          <motion.div
            key={heroIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
          >
            <img src={hero.banner} alt={hero.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f1a] via-transparent to-transparent" />
          </motion.div>

          <div className="relative z-10 h-full flex items-center">
            <div className="max-w-7xl mx-auto px-4 w-full">
              <motion.div
                key={heroIndex}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="max-w-xl"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-[#e63946] text-white text-xs font-bold px-2 py-1 rounded">{hero.certificate}</span>
                  {hero.format.map((f) => (
                    <span key={f} className="bg-white/10 text-white text-xs px-2 py-1 rounded border border-white/20">{f}</span>
                  ))}
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-white mb-3 leading-tight">{hero.title}</h1>
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-yellow-400 font-bold">{hero.rating}/10</span>
                  </div>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-300 text-sm">{hero.genre.join(', ')}</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-300 text-sm">{Math.floor(hero.duration / 60)}h {hero.duration % 60}m</span>
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

          <div className="absolute bottom-6 right-6 flex items-center gap-3 z-10">
            <button
              onClick={() => setHeroIndex((i) => (i - 1 + heroMovies.length) % heroMovies.length)}
              className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex gap-1.5">
              {heroMovies.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setHeroIndex(i)}
                  className={`h-1.5 rounded-full transition-all ${i === heroIndex ? 'w-6 bg-[#e63946]' : 'w-1.5 bg-white/30'}`}
                />
              ))}
            </div>
            <button
              onClick={() => setHeroIndex((i) => (i + 1) % heroMovies.length)}
              className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
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
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
              showFilters
                ? 'bg-[#e63946]/20 border-[#e63946]/40 text-[#e63946]'
                : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10 space-y-4"
          >
            <div>
              <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-2">Genre</p>
              <div className="flex flex-wrap gap-2">
                {GENRES.map((g) => (
                  <button
                    key={g}
                    onClick={() => setSelectedGenre(g)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      selectedGenre === g ? 'bg-[#e63946] text-white' : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-2">Language</p>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map((l) => (
                  <button
                    key={l}
                    onClick={() => setSelectedLang(l)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      selectedLang === l ? 'bg-[#e63946] text-white' : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-2">Format</p>
              <div className="flex flex-wrap gap-2">
                {FORMATS.map((f) => (
                  <button
                    key={f}
                    onClick={() => setSelectedFormat(f)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      selectedFormat === f ? 'bg-[#e63946] text-white' : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-10 h-10 text-[#e63946] animate-spin" />
            <p className="text-gray-400">Loading movies from server...</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <p className="text-red-400 font-semibold">Failed to load movies</p>
            <p className="text-gray-500 text-sm text-center max-w-sm">{error}</p>
            <p className="text-gray-600 text-xs">Make sure your Java backend is running at <code className="text-[#e63946]">{import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api'}</code></p>
          </div>
        )}

        {/* Movie Grid */}
        {!loading && !error && movies.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {movies.map((movie, i) => (
              <MovieCard key={movie.id} movie={movie} index={i} />
            ))}
          </div>
        )}

        {!loading && !error && movies.length === 0 && (
          <div className="text-center py-20">
            <Sparkles className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No movies found for the selected filters.</p>
            <button
              onClick={() => { setSelectedGenre('All'); setSelectedLang('All'); setSelectedFormat('All'); }}
              className="mt-4 text-[#e63946] hover:underline text-sm"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Upcoming Section */}
        {upcoming.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="w-5 h-5 text-[#e63946]" />
              <h2 className="text-white text-xl font-bold">Coming Soon</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcoming.slice(0, 3).map((m) => (
                <div key={m.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex gap-4 hover:border-[#e63946]/30 transition-all cursor-pointer">
                  <div className="w-20 h-28 bg-white/10 rounded-lg overflow-hidden shrink-0">
                    <img src={m.image} alt={m.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-[#e63946] font-semibold mb-1">COMING SOON</div>
                    <h3 className="text-white font-semibold mb-1">{m.title}</h3>
                    <p className="text-gray-400 text-xs mb-2">{m.genre.join(' • ')}</p>
                    <div className="text-gray-500 text-xs">
                      Release: {new Date(m.releaseDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                    <button className="mt-3 text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg transition-all">
                      Notify Me
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
