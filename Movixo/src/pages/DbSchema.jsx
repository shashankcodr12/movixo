import { useState } from 'react';
import { motion } from 'framer-motion';
import { Database, Table2, Key, Link2, Copy, Check, ChevronDown, ChevronRight } from 'lucide-react';

const tables = [
  { name: 'users', color: 'blue', description: 'Registered users / customers',
    columns: [
      { name: 'id', type: 'BIGINT', note: 'PK, AUTO_INCREMENT' },
      { name: 'name', type: 'VARCHAR(100)', note: 'NOT NULL' },
      { name: 'email', type: 'VARCHAR(150)', note: 'UNIQUE, NOT NULL' },
      { name: 'phone', type: 'VARCHAR(15)', note: 'UNIQUE, NOT NULL' },
      { name: 'password_hash', type: 'VARCHAR(255)', note: 'NOT NULL' },
      { name: 'role', type: "ENUM('USER','ADMIN')", note: "DEFAULT 'USER'" },
      { name: 'is_active', type: 'BOOLEAN', note: 'DEFAULT TRUE' },
      { name: 'created_at', type: 'TIMESTAMP', note: 'DEFAULT NOW()' },
    ]
  },
  { name: 'movies', color: 'red', description: 'Movie catalogue',
    columns: [
      { name: 'id', type: 'BIGINT', note: 'PK, AUTO_INCREMENT' },
      { name: 'title', type: 'VARCHAR(200)', note: 'NOT NULL' },
      { name: 'description', type: 'TEXT', note: '' },
      { name: 'director', type: 'VARCHAR(100)', note: '' },
      { name: 'duration_minutes', type: 'INT', note: 'NOT NULL' },
      { name: 'release_date', type: 'DATE', note: 'NOT NULL' },
      { name: 'certificate', type: "ENUM('U','UA','A','S')", note: 'NOT NULL' },
      { name: 'rating', type: 'DECIMAL(3,1)', note: 'DEFAULT 0.0' },
      { name: 'votes', type: 'INT', note: 'DEFAULT 0' },
      { name: 'poster_url', type: 'VARCHAR(500)', note: '' },
      { name: 'banner_url', type: 'VARCHAR(500)', note: '' },
      { name: 'is_upcoming', type: 'BOOLEAN', note: 'DEFAULT FALSE' },
    ]
  },
  { name: 'movie_genres', color: 'purple', description: 'Many-to-many: movies ↔ genres',
    columns: [
      { name: 'movie_id', type: 'BIGINT', note: 'FK → movies.id' },
      { name: 'genre', type: "ENUM('Action','Romance','Sci-Fi','Thriller','Comedy','Drama','Horror','Superhero')", note: 'NOT NULL' },
    ]
  },
  { name: 'movie_languages', color: 'purple', description: 'Languages per movie',
    columns: [
      { name: 'movie_id', type: 'BIGINT', note: 'FK → movies.id' },
      { name: 'language', type: 'VARCHAR(50)', note: 'NOT NULL' },
    ]
  },
  { name: 'movie_formats', color: 'purple', description: 'Formats: 2D, 3D, IMAX, 4DX',
    columns: [
      { name: 'movie_id', type: 'BIGINT', note: 'FK → movies.id' },
      { name: 'format', type: "ENUM('2D','3D','IMAX','4DX')", note: 'NOT NULL' },
    ]
  },
  { name: 'cast_members', color: 'yellow', description: 'Cast & crew per movie',
    columns: [
      { name: 'id', type: 'BIGINT', note: 'PK, AUTO_INCREMENT' },
      { name: 'movie_id', type: 'BIGINT', note: 'FK → movies.id' },
      { name: 'name', type: 'VARCHAR(100)', note: 'NOT NULL' },
      { name: 'role', type: 'VARCHAR(100)', note: '' },
      { name: 'photo_url', type: 'VARCHAR(500)', note: '' },
    ]
  },
  { name: 'theatres', color: 'green', description: 'Cinema halls / multiplexes',
    columns: [
      { name: 'id', type: 'BIGINT', note: 'PK, AUTO_INCREMENT' },
      { name: 'name', type: 'VARCHAR(200)', note: 'NOT NULL' },
      { name: 'address', type: 'TEXT', note: 'NOT NULL' },
      { name: 'city', type: 'VARCHAR(100)', note: 'NOT NULL' },
      { name: 'latitude', type: 'DECIMAL(9,6)', note: '' },
      { name: 'longitude', type: 'DECIMAL(9,6)', note: '' },
      { name: 'is_active', type: 'BOOLEAN', note: 'DEFAULT TRUE' },
    ]
  },
  { name: 'screens', color: 'orange', description: 'Individual screens inside a theatre',
    columns: [
      { name: 'id', type: 'BIGINT', note: 'PK, AUTO_INCREMENT' },
      { name: 'theatre_id', type: 'BIGINT', note: 'FK → theatres.id' },
      { name: 'screen_name', type: 'VARCHAR(50)', note: 'NOT NULL' },
      { name: 'total_seats', type: 'INT', note: 'NOT NULL' },
      { name: 'screen_type', type: "ENUM('2D','3D','IMAX','4DX')", note: '' },
    ]
  },
  { name: 'seats', color: 'orange', description: 'Physical seat layout per screen',
    columns: [
      { name: 'id', type: 'BIGINT', note: 'PK, AUTO_INCREMENT' },
      { name: 'screen_id', type: 'BIGINT', note: 'FK → screens.id' },
      { name: 'seat_label', type: 'VARCHAR(10)', note: 'e.g. A1, B12' },
      { name: 'row_letter', type: 'CHAR(2)', note: 'NOT NULL' },
      { name: 'seat_number', type: 'INT', note: 'NOT NULL' },
      { name: 'category', type: "ENUM('SILVER','GOLD','PLATINUM')", note: 'NOT NULL' },
    ]
  },
  { name: 'shows', color: 'pink', description: 'A specific screening of a movie',
    columns: [
      { name: 'id', type: 'BIGINT', note: 'PK, AUTO_INCREMENT' },
      { name: 'movie_id', type: 'BIGINT', note: 'FK → movies.id' },
      { name: 'screen_id', type: 'BIGINT', note: 'FK → screens.id' },
      { name: 'show_date', type: 'DATE', note: 'NOT NULL' },
      { name: 'show_time', type: 'TIME', note: 'NOT NULL' },
      { name: 'format', type: "ENUM('2D','3D','IMAX','4DX')", note: 'NOT NULL' },
      { name: 'language', type: 'VARCHAR(50)', note: 'NOT NULL' },
      { name: 'silver_price', type: 'DECIMAL(8,2)', note: 'NOT NULL' },
      { name: 'gold_price', type: 'DECIMAL(8,2)', note: 'NOT NULL' },
      { name: 'platinum_price', type: 'DECIMAL(8,2)', note: 'NOT NULL' },
      { name: 'available_seats', type: 'INT', note: 'NOT NULL' },
      { name: 'status', type: "ENUM('ACTIVE','CANCELLED','COMPLETED')", note: "DEFAULT 'ACTIVE'" },
    ]
  },
  { name: 'show_seats', color: 'pink', description: 'Live seat status per show',
    columns: [
      { name: 'id', type: 'BIGINT', note: 'PK, AUTO_INCREMENT' },
      { name: 'show_id', type: 'BIGINT', note: 'FK → shows.id' },
      { name: 'seat_id', type: 'BIGINT', note: 'FK → seats.id' },
      { name: 'status', type: "ENUM('AVAILABLE','BLOCKED','BOOKED')", note: "DEFAULT 'AVAILABLE'" },
      { name: 'price', type: 'DECIMAL(8,2)', note: 'NOT NULL' },
      { name: 'blocked_at', type: 'TIMESTAMP', note: 'NULL (10-min hold)' },
      { name: 'blocked_by_user', type: 'BIGINT', note: 'FK → users.id, NULL' },
    ]
  },
  { name: 'bookings', color: 'teal', description: 'Confirmed ticket bookings',
    columns: [
      { name: 'id', type: 'BIGINT', note: 'PK, AUTO_INCREMENT' },
      { name: 'booking_ref', type: 'VARCHAR(20)', note: 'UNIQUE, NOT NULL' },
      { name: 'user_id', type: 'BIGINT', note: 'FK → users.id' },
      { name: 'show_id', type: 'BIGINT', note: 'FK → shows.id' },
      { name: 'total_amount', type: 'DECIMAL(10,2)', note: 'NOT NULL' },
      { name: 'convenience_fee', type: 'DECIMAL(8,2)', note: 'DEFAULT 0' },
      { name: 'discount', type: 'DECIMAL(8,2)', note: 'DEFAULT 0' },
      { name: 'grand_total', type: 'DECIMAL(10,2)', note: 'NOT NULL' },
      { name: 'payment_method', type: "ENUM('UPI','CARD','NETBANKING','WALLET')", note: '' },
      { name: 'payment_status', type: "ENUM('PENDING','SUCCESS','FAILED','REFUNDED')", note: "DEFAULT 'PENDING'" },
      { name: 'booking_status', type: "ENUM('CONFIRMED','CANCELLED','PENDING')", note: "DEFAULT 'CONFIRMED'" },
      { name: 'promo_code', type: 'VARCHAR(30)', note: 'NULL' },
      { name: 'booked_at', type: 'TIMESTAMP', note: 'DEFAULT NOW()' },
    ]
  },
  { name: 'booking_seats', color: 'teal', description: 'Seats per booking',
    columns: [
      { name: 'id', type: 'BIGINT', note: 'PK, AUTO_INCREMENT' },
      { name: 'booking_id', type: 'BIGINT', note: 'FK → bookings.id' },
      { name: 'show_seat_id', type: 'BIGINT', note: 'FK → show_seats.id' },
      { name: 'seat_label', type: 'VARCHAR(10)', note: 'snapshot' },
      { name: 'category', type: "ENUM('SILVER','GOLD','PLATINUM')", note: '' },
      { name: 'price', type: 'DECIMAL(8,2)', note: '' },
    ]
  },
  { name: 'reviews', color: 'indigo', description: 'User reviews for movies',
    columns: [
      { name: 'id', type: 'BIGINT', note: 'PK, AUTO_INCREMENT' },
      { name: 'user_id', type: 'BIGINT', note: 'FK → users.id' },
      { name: 'movie_id', type: 'BIGINT', note: 'FK → movies.id' },
      { name: 'rating', type: 'TINYINT', note: 'CHECK (1-10)' },
      { name: 'comment', type: 'TEXT', note: '' },
      { name: 'created_at', type: 'TIMESTAMP', note: 'DEFAULT NOW()' },
    ]
  },
  { name: 'promo_codes', color: 'lime', description: 'Discount / promo codes',
    columns: [
      { name: 'id', type: 'BIGINT', note: 'PK, AUTO_INCREMENT' },
      { name: 'code', type: 'VARCHAR(30)', note: 'UNIQUE, NOT NULL' },
      { name: 'discount_type', type: "ENUM('PERCENT','FLAT')", note: 'NOT NULL' },
      { name: 'discount_value', type: 'DECIMAL(8,2)', note: 'NOT NULL' },
      { name: 'min_order_amount', type: 'DECIMAL(8,2)', note: 'DEFAULT 0' },
      { name: 'usage_limit', type: 'INT', note: 'NULL = unlimited' },
      { name: 'valid_from', type: 'DATE', note: '' },
      { name: 'valid_until', type: 'DATE', note: '' },
      { name: 'is_active', type: 'BOOLEAN', note: 'DEFAULT TRUE' },
    ]
  },
];

const colorMap = {
  blue: 'bg-blue-500/20 border-blue-500/40 text-blue-300',
  red: 'bg-red-500/20 border-red-500/40 text-red-300',
  purple: 'bg-purple-500/20 border-purple-500/40 text-purple-300',
  yellow: 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300',
  green: 'bg-green-500/20 border-green-500/40 text-green-300',
  orange: 'bg-orange-500/20 border-orange-500/40 text-orange-300',
  pink: 'bg-pink-500/20 border-pink-500/40 text-pink-300',
  teal: 'bg-teal-500/20 border-teal-500/40 text-teal-300',
  indigo: 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300',
  lime: 'bg-lime-500/20 border-lime-500/40 text-lime-300',
};
const dotMap = {
  blue:'bg-blue-400', red:'bg-red-400', purple:'bg-purple-400', yellow:'bg-yellow-400',
  green:'bg-green-400', orange:'bg-orange-400', pink:'bg-pink-400', teal:'bg-teal-400',
  indigo:'bg-indigo-400', lime:'bg-lime-400',
};

const SQL = `-- ============================================================
-- Movixo MySQL Schema  |  paste into MySQL Workbench / CLI
-- ============================================================

CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  phone VARCHAR(15) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('USER','ADMIN') DEFAULT 'USER',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE movies (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  director VARCHAR(100),
  duration_minutes INT NOT NULL,
  release_date DATE NOT NULL,
  certificate ENUM('U','UA','A','S') NOT NULL,
  rating DECIMAL(3,1) DEFAULT 0.0,
  votes INT DEFAULT 0,
  poster_url VARCHAR(500),
  banner_url VARCHAR(500),
  trailer_url VARCHAR(500),
  is_upcoming BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE movie_genres (
  movie_id BIGINT NOT NULL,
  genre ENUM('Action','Romance','Sci-Fi','Thriller','Comedy','Drama','Horror','Superhero') NOT NULL,
  FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE
);

CREATE TABLE movie_languages (
  movie_id BIGINT NOT NULL,
  language VARCHAR(50) NOT NULL,
  FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE
);

CREATE TABLE movie_formats (
  movie_id BIGINT NOT NULL,
  format ENUM('2D','3D','IMAX','4DX') NOT NULL,
  FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE
);

CREATE TABLE cast_members (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  movie_id BIGINT NOT NULL,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(100),
  photo_url VARCHAR(500),
  FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE
);

CREATE TABLE theatres (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(200) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100),
  latitude DECIMAL(9,6),
  longitude DECIMAL(9,6),
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE theatre_amenities (
  theatre_id BIGINT NOT NULL,
  amenity VARCHAR(100) NOT NULL,
  FOREIGN KEY (theatre_id) REFERENCES theatres(id) ON DELETE CASCADE
);

CREATE TABLE screens (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  theatre_id BIGINT NOT NULL,
  screen_name VARCHAR(50) NOT NULL,
  total_seats INT NOT NULL,
  screen_type ENUM('2D','3D','IMAX','4DX'),
  FOREIGN KEY (theatre_id) REFERENCES theatres(id)
);

CREATE TABLE seats (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  screen_id BIGINT NOT NULL,
  seat_label VARCHAR(10) NOT NULL,
  row_letter CHAR(2) NOT NULL,
  seat_number INT NOT NULL,
  category ENUM('SILVER','GOLD','PLATINUM') NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (screen_id) REFERENCES screens(id)
);

CREATE TABLE shows (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  movie_id BIGINT NOT NULL,
  screen_id BIGINT NOT NULL,
  show_date DATE NOT NULL,
  show_time TIME NOT NULL,
  format ENUM('2D','3D','IMAX','4DX') NOT NULL,
  language VARCHAR(50) NOT NULL,
  silver_price DECIMAL(8,2) NOT NULL,
  gold_price DECIMAL(8,2) NOT NULL,
  platinum_price DECIMAL(8,2) NOT NULL,
  available_seats INT NOT NULL,
  status ENUM('ACTIVE','CANCELLED','COMPLETED') DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (movie_id) REFERENCES movies(id),
  FOREIGN KEY (screen_id) REFERENCES screens(id)
);

CREATE TABLE show_seats (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  show_id BIGINT NOT NULL,
  seat_id BIGINT NOT NULL,
  status ENUM('AVAILABLE','BLOCKED','BOOKED') DEFAULT 'AVAILABLE',
  price DECIMAL(8,2) NOT NULL,
  blocked_at TIMESTAMP NULL,
  blocked_by_user BIGINT NULL,
  FOREIGN KEY (show_id) REFERENCES shows(id),
  FOREIGN KEY (seat_id) REFERENCES seats(id),
  FOREIGN KEY (blocked_by_user) REFERENCES users(id),
  UNIQUE KEY uq_show_seat (show_id, seat_id)
);

CREATE TABLE bookings (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  booking_ref VARCHAR(20) UNIQUE NOT NULL,
  user_id BIGINT NOT NULL,
  show_id BIGINT NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  convenience_fee DECIMAL(8,2) DEFAULT 0,
  discount DECIMAL(8,2) DEFAULT 0,
  grand_total DECIMAL(10,2) NOT NULL,
  payment_method ENUM('UPI','CARD','NETBANKING','WALLET'),
  payment_status ENUM('PENDING','SUCCESS','FAILED','REFUNDED') DEFAULT 'PENDING',
  booking_status ENUM('CONFIRMED','CANCELLED','PENDING') DEFAULT 'CONFIRMED',
  promo_code VARCHAR(30) NULL,
  booked_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (show_id) REFERENCES shows(id)
);

CREATE TABLE booking_seats (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  booking_id BIGINT NOT NULL,
  show_seat_id BIGINT NOT NULL,
  seat_label VARCHAR(10) NOT NULL,
  category ENUM('SILVER','GOLD','PLATINUM'),
  price DECIMAL(8,2),
  FOREIGN KEY (booking_id) REFERENCES bookings(id),
  FOREIGN KEY (show_seat_id) REFERENCES show_seats(id)
);

CREATE TABLE reviews (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  movie_id BIGINT NOT NULL,
  rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 10),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (movie_id) REFERENCES movies(id),
  UNIQUE KEY uq_user_movie (user_id, movie_id)
);

CREATE TABLE promo_codes (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(30) UNIQUE NOT NULL,
  discount_type ENUM('PERCENT','FLAT') NOT NULL,
  discount_value DECIMAL(8,2) NOT NULL,
  min_order_amount DECIMAL(8,2) DEFAULT 0,
  max_discount DECIMAL(8,2) NULL,
  usage_limit INT NULL,
  used_count INT DEFAULT 0,
  valid_from DATE,
  valid_until DATE,
  is_active BOOLEAN DEFAULT TRUE
);

-- Indexes
CREATE INDEX idx_shows_movie_date ON shows(movie_id, show_date);
CREATE INDEX idx_show_seats_show ON show_seats(show_id);
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_theatres_city ON theatres(city);`;

export default function DbSchema() {
  const [expanded, setExpanded] = useState(tables.slice(0,3).map(t => t.name));
  const [copied, setCopied] = useState(false);
  const [view, setView] = useState('visual');

  const toggle = name => setExpanded(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]);
  const copySQL = () => { navigator.clipboard.writeText(SQL); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div className="min-h-screen bg-[#0f0f1a] py-10">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#e63946]/20 border border-[#e63946]/30 flex items-center justify-center"><Database className="w-5 h-5 text-[#e63946]" /></div>
            <h1 className="text-white text-3xl font-black">Database Schema</h1>
          </div>
          <p className="text-gray-400">Complete MySQL schema for your Movixo Java Spring Boot backend.</p>
        </motion.div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex bg-white/5 p-1 rounded-xl">
            {[['visual', Table2, 'Visual Tables'], ['sql', Database, 'SQL Script']].map(([id, Icon, label]) => (
              <button key={id} onClick={() => setView(id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${view === id ? 'bg-[#e63946] text-white' : 'text-gray-400 hover:text-white'}`}>
                <Icon className="w-4 h-4" />{label}
              </button>
            ))}
          </div>
          <span className="text-gray-500 text-sm">{tables.length} tables &bull; MySQL</span>
        </div>

        {view === 'visual' && (
          <>
            <div className="mb-4 p-3 bg-white/5 border border-white/10 rounded-xl flex flex-wrap gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-1"><Key className="w-4 h-4 text-yellow-400" /> PK = Primary Key</span>
              <span className="flex items-center gap-1"><Link2 className="w-4 h-4 text-blue-400" /> FK = Foreign Key</span>
            </div>
            <div className="space-y-3">
              {tables.map((table, i) => (
                <motion.div key={table.name} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                  className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                  <button onClick={() => toggle(table.name)} className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-all">
                    <div className="flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full ${dotMap[table.color]}`} />
                      <span className="text-white font-bold font-mono">{table.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${colorMap[table.color]}`}>{table.columns.length} cols</span>
                      <span className="text-gray-500 text-sm hidden sm:block">{table.description}</span>
                    </div>
                    {expanded.includes(table.name) ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                  </button>
                  {expanded.includes(table.name) && (
                    <div className="border-t border-white/10 overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead><tr className="bg-white/5">
                          <th className="text-left px-4 py-2.5 text-gray-400 font-medium">Column</th>
                          <th className="text-left px-4 py-2.5 text-gray-400 font-medium">Type</th>
                          <th className="text-left px-4 py-2.5 text-gray-400 font-medium">Notes</th>
                        </tr></thead>
                        <tbody>
                          {table.columns.map((col, j) => (
                            <tr key={col.name} className={`border-t border-white/5 ${j % 2 === 0 ? '' : 'bg-white/[0.02]'}`}>
                              <td className="px-4 py-2.5">
                                <div className="flex items-center gap-2">
                                  {col.note.includes('PK') && <Key className="w-3 h-3 text-yellow-400 shrink-0" />}
                                  {col.note.includes('FK') && <Link2 className="w-3 h-3 text-blue-400 shrink-0" />}
                                  <span className={`font-mono ${col.note.includes('PK') ? 'text-yellow-300' : 'text-white'}`}>{col.name}</span>
                                </div>
                              </td>
                              <td className="px-4 py-2.5"><span className="font-mono text-green-400 text-xs">{col.type}</span></td>
                              <td className="px-4 py-2.5"><span className="text-gray-400 text-xs">{col.note}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </>
        )}

        {view === 'sql' && (
          <div className="relative">
            <button onClick={copySQL}
              className={`absolute top-4 right-4 z-10 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${copied ? 'bg-green-500/20 border border-green-500/40 text-green-400' : 'bg-white/10 hover:bg-white/20 border border-white/10 text-white'}`}>
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}{copied ? 'Copied!' : 'Copy SQL'}
            </button>
            <pre className="bg-[#0d1117] border border-white/10 rounded-xl p-6 overflow-x-auto text-xs text-gray-300 leading-relaxed font-mono max-h-[600px] overflow-y-auto">{SQL}</pre>
          </div>
        )}

        {/* Integration Cards */}
        <div className="mt-10 grid md:grid-cols-2 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <h3 className="text-white font-bold mb-3">☕ Spring Boot Setup</h3>
            <div className="space-y-2 text-sm text-gray-400">
              <p>1. Add <code className="text-green-400">spring-boot-starter-data-jpa</code></p>
              <p>2. Add <code className="text-green-400">mysql-connector-java</code></p>
              <p>3. <code className="text-green-400">application.properties</code>:</p>
              <pre className="bg-black/30 rounded-lg p-3 text-xs text-green-300 mt-2">{`spring.datasource.url=jdbc:mysql://localhost:3306/movixo
spring.datasource.username=root
spring.datasource.password=yourpass
spring.jpa.hibernate.ddl-auto=validate`}</pre>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <h3 className="text-white font-bold mb-3">🔗 Connect Frontend</h3>
            <p className="text-gray-400 text-sm mb-2">Create <code className="text-yellow-400">.env</code> in the React project root:</p>
            <pre className="bg-black/30 rounded-lg p-3 text-xs text-yellow-300">{`VITE_API_BASE_URL=http://localhost:8080/api`}</pre>
            <p className="text-gray-400 text-sm mt-3 mb-2">Enable CORS in Spring Boot:</p>
            <pre className="bg-black/30 rounded-lg p-3 text-xs text-blue-300">{`@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api")`}</pre>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <h3 className="text-white font-bold mb-3">🔐 JWT Auth</h3>
            <div className="space-y-1 text-sm text-gray-400">
              <p>Add <code className="text-green-400">spring-security</code> + <code className="text-green-400">jjwt</code></p>
              <p className="mt-2">• <code className="text-white">POST /api/auth/login</code> → JWT token</p>
              <p>• <code className="text-white">POST /api/auth/register</code> → create user</p>
              <p>• Frontend sends <code className="text-yellow-400">Authorization: Bearer &lt;token&gt;</code></p>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <h3 className="text-white font-bold mb-3">📡 REST API Endpoints</h3>
            <div className="space-y-1 text-xs font-mono">
              {[['GET','/api/movies','text-blue-400'],['GET','/api/movies/:id','text-blue-400'],['GET','/api/movies/upcoming','text-blue-400'],
                ['GET','/api/shows?movieId&date&city','text-blue-400'],['GET','/api/shows/:id/seats','text-blue-400'],
                ['POST','/api/bookings','text-green-400'],['GET','/api/bookings/my','text-green-400'],
                ['POST','/api/auth/login','text-yellow-400'],['POST','/api/auth/register','text-yellow-400'],
                ['POST','/api/promo/validate','text-purple-400']].map(([m,p,c]) => (
                <div key={p} className="flex items-center gap-2"><span className={`${c} w-12 shrink-0`}>{m}</span><span className="text-gray-300">{p}</span></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
