import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, ChevronDown, User, Menu, X, Ticket, Film, Music, Gamepad2, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../lib/store.js';
import { cities } from '../lib/mockData.js';

export default function Navbar() {
  const { selectedCity, setSelectedCity, isLoggedIn, user } = useAppContext();
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const navLinks = [
    { label: 'Movies', icon: Film, path: '/' },
    { label: 'Events', icon: Music, path: '/' },
    { label: 'Sports', icon: Gamepad2, path: '/' },
    { label: 'DB Schema', icon: Database, path: '/db-schema' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-[#1a1a2e] border-b border-white/10 shadow-xl">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-[#e63946] rounded-lg flex items-center justify-center">
              <Ticket className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">
              Movi<span className="text-[#e63946]">xo</span>
            </span>
          </Link>

          {/* Search */}
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search for Movies, Events, Sports..."
                className="w-full bg-white/10 text-white placeholder-gray-400 pl-10 pr-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#e63946] transition-all"
              />
            </div>
          </div>

          {/* Nav Links */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.label}
                to={link.path}
                className="flex items-center gap-1.5 px-3 py-2 text-gray-300 hover:text-white text-sm font-medium rounded-lg hover:bg-white/10 transition-all"
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {/* City Selector */}
            <div className="relative">
              <button
                onClick={() => setShowCityDropdown(!showCityDropdown)}
                className="flex items-center gap-1.5 px-3 py-2 text-gray-300 hover:text-white text-sm font-medium rounded-lg hover:bg-white/10 transition-all"
              >
                <MapPin className="w-4 h-4 text-[#e63946]" />
                <span className="hidden sm:block">{selectedCity}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${showCityDropdown ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {showCityDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 top-full mt-1 w-48 bg-[#1a1a2e] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50"
                  >
                    {cities.map(city => (
                      <button
                        key={city}
                        onClick={() => { setSelectedCity(city); setShowCityDropdown(false); }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                          selectedCity === city ? 'bg-[#e63946]/20 text-[#e63946]' : 'text-gray-300 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {city}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User */}
            {isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-all"
                >
                  <div className="w-7 h-7 rounded-full bg-[#e63946] flex items-center justify-center text-white text-xs font-bold">
                    {user?.name?.[0] ?? 'U'}
                  </div>
                  <span className="text-sm text-gray-300 hidden sm:block">{user?.name}</span>
                </button>
                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 top-full mt-1 w-48 bg-[#1a1a2e] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50"
                    >
                      <hr className="border-white/10" />
                      <button className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-white/10 transition-colors">Sign Out</button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="flex items-center gap-2 bg-[#e63946] hover:bg-[#c1121f] text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
              >
                <User className="w-4 h-4" />
                Sign In
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 text-gray-300 hover:text-white rounded-lg hover:bg-white/10 transition-all"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search Movies, Events..."
              className="w-full bg-white/10 text-white placeholder-gray-400 pl-10 pr-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#e63946]" />
          </div>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden overflow-hidden border-t border-white/10 py-2"
            >
              {navLinks.map(link => (
                <Link
                  key={link.label}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                >
                  <link.icon className="w-5 h-5" />
                  {link.label}
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
