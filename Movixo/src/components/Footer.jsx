import { Ticket, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-[#0f0f1a] border-t border-white/10 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-[#e63946] rounded-lg flex items-center justify-center">
                <Ticket className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-bold text-xl">Movi<span className="text-[#e63946]">xo</span></span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">Your ultimate movie & entertainment ticketing platform.</p>
            <div className="flex gap-3 mt-4">
              {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
                <button key={i} className="w-9 h-9 rounded-full bg-white/5 hover:bg-[#e63946]/20 border border-white/10 hover:border-[#e63946]/40 flex items-center justify-center text-gray-400 hover:text-[#e63946] transition-all">
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Movies</h4>
            <ul className="space-y-2">
              {['Now Showing', 'Upcoming', 'Top Rated', 'New Releases'].map(item => (
                <li key={item}><Link to="/" className="text-gray-400 hover:text-white text-sm transition-colors">{item}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Help</h4>
            <ul className="space-y-2">
              {['About Us', 'Contact Us', 'FAQs', 'Terms of Service', 'Privacy Policy'].map(item => (
                <li key={item}><Link to="/" className="text-gray-400 hover:text-white text-sm transition-colors">{item}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Download App</h4>
            <div className="space-y-2">
              <button className="w-full flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-3 transition-all">
                <div className="text-left"><div className="text-gray-400 text-xs">Download on the</div><div className="text-white text-sm font-semibold">App Store</div></div>
              </button>
              <button className="w-full flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-3 transition-all">
                <div className="text-left"><div className="text-gray-400 text-xs">Get it on</div><div className="text-white text-sm font-semibold">Google Play</div></div>
              </button>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">© 2025 Movixo. All rights reserved.</p>
          <p className="text-gray-500 text-sm">Made with ❤️ in India</p>
        </div>
      </div>
    </footer>
  );
}
