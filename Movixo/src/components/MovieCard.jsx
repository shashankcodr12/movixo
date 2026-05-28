import { Link } from 'react-router-dom';
import { Star, Clock, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function MovieCard({ movie, index = 0 }) {
  const [liked, setLiked] = useState(false);

  const formatVotes = (votes) => {
    if (votes >= 100000) return `${(votes / 100000).toFixed(1)}L`;
    if (votes >= 1000) return `${(votes / 1000).toFixed(1)}K`;
    return String(votes);
  };

  const formatDuration = (mins) => `${Math.floor(mins / 60)}h ${mins % 60}m`;
  const ratingColor = movie.rating >= 8 ? 'text-green-400' : movie.rating >= 7 ? 'text-yellow-400' : 'text-orange-400';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="group relative"
    >
      <Link to={`/movie/${movie.id}`}>
        <div className="relative overflow-hidden rounded-xl bg-[#16213e] border border-white/5 hover:border-[#e63946]/40 transition-all duration-300 hover:shadow-2xl hover:shadow-[#e63946]/10 hover:-translate-y-1">
          {/* Poster */}
          <div className="relative aspect-[2/3] overflow-hidden">
            <img src={movie.image} alt={movie.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm text-white text-xs font-bold px-2 py-0.5 rounded border border-white/20">
              {movie.certificate}
            </div>
            <button
              onClick={(e) => { e.preventDefault(); setLiked(!liked); }}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/70 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
            >
              <Heart className={`w-4 h-4 ${liked ? 'fill-red-500 text-red-500' : 'text-white'}`} />
            </button>
            <div className="absolute bottom-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {(movie.format ?? []).slice(0, 2).map(f => (
                <span key={f} className="bg-[#e63946]/80 text-white text-xs px-1.5 py-0.5 rounded font-medium">{f}</span>
              ))}
            </div>
          </div>

          <div className="p-3">
            <h3 className="text-white font-semibold text-sm leading-tight mb-1 line-clamp-1">{movie.title}</h3>
            <p className="text-gray-400 text-xs mb-2 line-clamp-1">{(movie.genre ?? []).join(' • ')}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Star className={`w-3.5 h-3.5 fill-current ${ratingColor}`} />
                <span className={`text-xs font-bold ${ratingColor}`}>{movie.rating}/10</span>
                <span className="text-gray-500 text-xs">({formatVotes(movie.votes)})</span>
              </div>
              <div className="flex items-center gap-1 text-gray-500">
                <Clock className="w-3 h-3" />
                <span className="text-xs">{formatDuration(movie.duration)}</span>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {(movie.language ?? []).slice(0, 2).map(lang => (
                <span key={lang} className="text-xs bg-white/5 text-gray-400 px-2 py-0.5 rounded-full border border-white/10">{lang}</span>
              ))}
            </div>
          </div>
        </div>
      </Link>

      <Link to={`/movie/${movie.id}`}>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full mt-2 bg-[#e63946] hover:bg-[#c1121f] text-white py-2 rounded-lg text-sm font-semibold transition-colors"
        >
          Book Tickets
        </motion.button>
      </Link>
    </motion.div>
  );
}
