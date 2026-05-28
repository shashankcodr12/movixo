import { useState } from 'react';
import { motion } from 'framer-motion';
import { Database, Table2, Key, Link2, Copy, Check, ChevronDown, ChevronRight } from 'lucide-react';

const tables = [
  {
    name: 'users',
    color: 'blue',
    description: 'Registered users / customers',
    columns: [
      { name: 'id', type: 'BIGINT', constraints: 'PK, AUTO_INCREMENT' },
      { name: 'name', type: 'VARCHAR(100)', constraints: 'NOT NULL' },
      { name: 'email', type: 'VARCHAR(150)', constraints: 'UNIQUE, NOT NULL' },
      { name: 'phone', type: 'VARCHAR(15)', constraints: 'UNIQUE, NOT NULL' },
      { name: 'password_hash', type: 'VARCHAR(255)', constraints: 'NOT NULL' },
      { name: 'role', type: "ENUM('USER','ADMIN')", constraints: "DEFAULT 'USER'" },
      { name: 'is_active', type: 'BOOLEAN', constraints: 'DEFAULT TRUE' },
      { name: 'created_at', type: 'TIMESTAMP', constraints: 'DEFAULT NOW()' },
      { name: 'updated_at', type: 'TIMESTAMP', constraints: 'ON UPDATE NOW()' },
    ],
  },
  {
    name: 'movies',
    color: 'red',
    description: 'Movie catalogue',
    columns: [
      { name: 'id', type: 'BIGINT', constraints: 'PK, AUTO_INCREMENT' },
      { name: 'title', type: 'VARCHAR(200)', constraints: 'NOT NULL' },
      { name: 'description', type: 'TEXT', constraints: '' },
      { name: 'director', type: 'VARCHAR(100)', constraints: '' },
      { name: 'duration_minutes', type: 'INT', constraints: 'NOT NULL' },
      { name: 'release_date', type: 'DATE', constraints: 'NOT NULL' },
      { name: 'certificate', type: "ENUM('U','UA','A','S')", constraints: 'NOT NULL' },
      { name: 'rating', type: 'DECIMAL(3,1)', constraints: 'DEFAULT 0.0' },
      { name: 'votes', type: 'INT', constraints: 'DEFAULT 0' },
      { name: 'poster_url', type: 'VARCHAR(500)', constraints: '' },
      { name: 'banner_url', type: 'VARCHAR(500)', constraints: '' },
      { name: 'trailer_url', type: 'VARCHAR(500)', constraints: '' },
      { name: 'is_upcoming', type: 'BOOLEAN', constraints: 'DEFAULT FALSE' },
      { name: 'created_at', type: 'TIMESTAMP', constraints: 'DEFAULT NOW()' },
    ],
  },
  {
    name: 'movie_genres',
    color: 'purple',
    description: 'Many-to-many: movies ↔ genres',
    columns: [
      { name: 'movie_id', type: 'BIGINT', constraints: 'FK → movies.id' },
      { name: 'genre', type: "ENUM('Action','Romance','Sci-Fi','Thriller','Comedy','Drama','Horror','Superhero')", constraints: 'NOT NULL' },
    ],
  },
  {
    name: 'movie_languages',
    color: 'purple',
    description: 'Languages a movie is available in',
    columns: [
      { name: 'movie_id', type: 'BIGINT', constraints: 'FK → movies.id' },
      { name: 'language', type: 'VARCHAR(50)', constraints: 'NOT NULL' },
    ],
  },
  {
    name: 'movie_formats',
    color: 'purple',
    description: 'Formats: 2D, 3D, IMAX, 4DX',
    columns: [
      { name: 'movie_id', type: 'BIGINT', constraints: 'FK → movies.id' },
      { name: 'format', type: "ENUM('2D','3D','IMAX','4DX')", constraints: 'NOT NULL' },
    ],
  },
  {
    name: 'cast_members',
    color: 'yellow',
    description: 'Cast & crew for each movie',
    columns: [
      { name: 'id', type: 'BIGINT', constraints: 'PK, AUTO_INCREMENT' },
      { name: 'movie_id', type: 'BIGINT', constraints: 'FK → movies.id' },
      { name: 'name', type: 'VARCHAR(100)', constraints: 'NOT NULL' },
      { name: 'role', type: 'VARCHAR(100)', constraints: '' },
      { name: 'photo_url', type: 'VARCHAR(500)', constraints: '' },
    ],
  },
  {
    name: 'theatres',
    color: 'green',
    description: 'Cinema halls / multiplexes',
    columns: [
      { name: 'id', type: 'BIGINT', constraints: 'PK, AUTO_INCREMENT' },
      { name: 'name', type: 'VARCHAR(200)', constraints: 'NOT NULL' },
      { name: 'address', type: 'TEXT', constraints: 'NOT NULL' },
      { name: 'city', type: 'VARCHAR(100)', constraints: 'NOT NULL' },
      { name: 'state', type: 'VARCHAR(100)', constraints: '' },
      { name: 'pincode', type: 'VARCHAR(10)', constraints: '' },
      { name: 'latitude', type: 'DECIMAL(9,6)', constraints: '' },
      { name: 'longitude', type: 'DECIMAL(9,6)', constraints: '' },
      { name: 'is_active', type: 'BOOLEAN', constraints: 'DEFAULT TRUE' },
    ],
  },
  {
    name: 'theatre_amenities',
    color: 'green',
    description: 'Amenities per theatre',
    columns: [
      { name: 'theatre_id', type: 'BIGINT', constraints: 'FK → theatres.id' },
      { name: 'amenity', type: 'VARCHAR(100)', constraints: 'NOT NULL' },
    ],
  },
  {
    name: 'screens',
    color: 'orange',
    description: 'Individual screens inside a theatre',
    columns: [
      { name: 'id', type: 'BIGINT', constraints: 'PK, AUTO_INCREMENT' },
      { name: 'theatre_id', type: 'BIGINT', constraints: 'FK → theatres.id' },
      { name: 'screen_name', type: 'VARCHAR(50)', constraints: 'NOT NULL' },
      { name: 'total_seats', type: 'INT', constraints: 'NOT NULL' },
      { name: 'screen_type', type: "ENUM('2D','3D','IMAX','4DX')", constraints: '' },
    ],
  },
  {
    name: 'seats',
    color: 'orange',
    description: 'Physical seat layout per screen',
    columns: [
      { name: 'id', type: 'BIGINT', constraints: 'PK, AUTO_INCREMENT' },
      { name: 'screen_id', type: 'BIGINT', constraints: 'FK → screens.id' },
      { name: 'seat_label', type: 'VARCHAR(10)', constraints: 'NOT NULL  e.g. A1, B12' },
      { name: 'row_letter', type: 'CHAR(2)', constraints: 'NOT NULL' },
      { name: 'seat_number', type: 'INT', constraints: 'NOT NULL' },
      { name: 'category', type: "ENUM('SILVER','GOLD','PLATINUM')", constraints: 'NOT NULL' },
      { name: 'is_active', type: 'BOOLEAN', constraints: 'DEFAULT TRUE' },
    ],
  },
  {
    name: 'shows',
    color: 'pink',
    description: 'A specific screening of a movie',
    columns: [
      { name: 'id', type: 'BIGINT', constraints: 'PK, AUTO_INCREMENT' },
      { name: 'movie_id', type: 'BIGINT', constraints: 'FK → movies.id' },
      { name: 'screen_id', type: 'BIGINT', constraints: 'FK → screens.id' },
      { name: 'show_date', type: 'DATE', constraints: 'NOT NULL' },
      { name: 'show_time', type: 'TIME', constraints: 'NOT NULL' },
      { name: 'format', type: "ENUM('2D','3D','IMAX','4DX')", constraints: 'NOT NULL' },
      { name: 'language', type: 'VARCHAR(50)', constraints: 'NOT NULL' },
      { name: 'silver_price', type: 'DECIMAL(8,2)', constraints: 'NOT NULL' },
      { name: 'gold_price', type: 'DECIMAL(8,2)', constraints: 'NOT NULL' },
      { name: 'platinum_price', type: 'DECIMAL(8,2)', constraints: 'NOT NULL' },
      { name: 'available_seats', type: 'INT', constraints: 'NOT NULL  (denormalized counter)' },
      { name: 'status', type: "ENUM('ACTIVE','CANCELLED','COMPLETED')", constraints: "DEFAULT 'ACTIVE'" },
      { name: 'created_at', type: 'TIMESTAMP', constraints: 'DEFAULT NOW()' },
    ],
  },
  {
    name: 'show_seats',
    color: 'pink',
    description: 'Live seat status per show (join table)',
    columns: [
      { name: 'id', type: 'BIGINT', constraints: 'PK, AUTO_INCREMENT' },
      { name: 'show_id', type: 'BIGINT', constraints: 'FK → shows.id' },
      { name: 'seat_id', type: 'BIGINT', constraints: 'FK → seats.id' },
      { name: 'status', type: "ENUM('AVAILABLE','BLOCKED','BOOKED')", constraints: "DEFAULT 'AVAILABLE'" },
      { name: 'price', type: 'DECIMAL(8,2)', constraints: 'NOT NULL  (snapshot at booking time)' },
      { name: 'blocked_at', type: 'TIMESTAMP', constraints: 'NULL  (for 10-min hold timer)' },
      { name: 'blocked_by_user', type: 'BIGINT', constraints: 'FK → users.id, NULL' },
    ],
  },
  {
    name: 'bookings',
    color: 'teal',
    description: 'Confirmed ticket bookings',
    columns: [
      { name: 'id', type: 'BIGINT', constraints: 'PK, AUTO_INCREMENT' },
      { name: 'booking_ref', type: 'VARCHAR(20)', constraints: 'UNIQUE, NOT NULL  e.g. BMS3X9KA' },
      { name: 'user_id', type: 'BIGINT', constraints: 'FK → users.id' },
      { name: 'show_id', type: 'BIGINT', constraints: 'FK → shows.id' },
      { name: 'total_amount', type: 'DECIMAL(10,2)', constraints: 'NOT NULL' },
      { name: 'convenience_fee', type: 'DECIMAL(8,2)', constraints: 'DEFAULT 0' },
      { name: 'discount', type: 'DECIMAL(8,2)', constraints: 'DEFAULT 0' },
      { name: 'grand_total', type: 'DECIMAL(10,2)', constraints: 'NOT NULL' },
      { name: 'payment_method', type: "ENUM('UPI','CARD','NETBANKING','WALLET')", constraints: '' },
      { name: 'payment_status', type: "ENUM('PENDING','SUCCESS','FAILED','REFUNDED')", constraints: "DEFAULT 'PENDING'" },
      { name: 'booking_status', type: "ENUM('CONFIRMED','CANCELLED','PENDING')", constraints: "DEFAULT 'CONFIRMED'" },
      { name: 'promo_code', type: 'VARCHAR(30)', constraints: 'NULL' },
      { name: 'booked_at', type: 'TIMESTAMP', constraints: 'DEFAULT NOW()' },
    ],
  },
  {
    name: 'booking_seats',
    color: 'teal',
    description: 'Which seats belong to a booking',
    columns: [
      { name: 'id', type: 'BIGINT', constraints: 'PK, AUTO_INCREMENT' },
      { name: 'booking_id', type: 'BIGINT', constraints: 'FK → bookings.id' },
      { name: 'show_seat_id', type: 'BIGINT', constraints: 'FK → show_seats.id' },
      { name: 'seat_label', type: 'VARCHAR(10)', constraints: 'NOT NULL  (snapshot)' },
      { name: 'category', type: "ENUM('SILVER','GOLD','PLATINUM')", constraints: '' },
      { name: 'price', type: 'DECIMAL(8,2)', constraints: '' },
    ],
  },
  {
    name: 'reviews',
    color: 'indigo',
    description: 'User reviews for movies',
    columns: [
      { name: 'id', type: 'BIGINT', constraints: 'PK, AUTO_INCREMENT' },
      { name: 'user_id', type: 'BIGINT', constraints: 'FK → users.id' },
      { name: 'movie_id', type: 'BIGINT', constraints: 'FK → movies.id' },
      { name: 'rating', type: 'TINYINT', constraints: 'CHECK (1-10)' },
      { name: 'comment', type: 'TEXT', constraints: '' },
      { name: 'created_at', type: 'TIMESTAMP', constraints: 'DEFAULT NOW()' },
    ],
  },
  {
    name: 'promo_codes',
    color: 'lime',
    description: 'Discount / promotional codes',
    columns: [
      { name: 'id', type: 'BIGINT', constraints: 'PK, AUTO_INCREMENT' },
      { name: 'code', type: 'VARCHAR(30)', constraints: 'UNIQUE, NOT NULL' },
      { name: 'discount_type', type: "ENUM('PERCENT','FLAT')", constraints: 'NOT NULL' },
      { name: 'discount_value', type: 'DECIMAL(8,2)', constraints: 'NOT NULL' },
      { name: 'min_order_amount', type: 'DECIMAL(8,2)', constraints: 'DEFAULT 0' },
      { name: 'max_discount', type: 'DECIMAL(8,2)', constraints: 'NULL' },
      { name: 'usage_limit', type: 'INT', constraints: 'NULL  (null = unlimited)' },
      { name: 'used_count', type: 'INT', constraints: 'DEFAULT 0' },
      { name: 'valid_from', type: 'DATE', constraints: '' },
      { name: 'valid_until', type: 'DATE', constraints: '' },
      { name: 'is_active', type: 'BOOLEAN', constraints: 'DEFAULT TRUE' },
    ],
  },
];

const colorMap: Record<string, string> = {
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

const dotMap: Record<string, string> = {
  blue: 'bg-blue-400', red: 'bg-red-400', purple: 'bg-purple-400',
  yellow: 'bg-yellow-400', green: 'bg-green-400', orange: 'bg-orange-400',
  pink: 'bg-pink-400', teal: 'bg-teal-400', indigo: 'bg-indigo-400', lime: 'bg-lime-400',
};

const SQL_SCHEMA = `-- BookMyShow Database Schema (MySQL / PostgreSQL compatible)
-- Run this in your Java Spring Boot application or via Flyway migration

CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  phone VARCHAR(15) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('USER','ADMIN') DEFAULT 'USER',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP ON UPDATE NOW()
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
  pincode VARCHAR(10),
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
  UNIQUE KEY uq_user_movie_review (user_id, movie_id)
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

-- Indexes for performance
CREATE INDEX idx_shows_movie_date ON shows(movie_id, show_date);
CREATE INDEX idx_shows_screen ON shows(screen_id);
CREATE INDEX idx_show_seats_show ON show_seats(show_id);
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_ref ON bookings(booking_ref);
CREATE INDEX idx_theatres_city ON theatres(city);`;

export default function DbSchema() {
  const [expanded, setExpanded] = useState<string[]>(tables.slice(0, 3).map((t) => t.name));
  const [copied, setCopied] = useState(false);
  const [activeView, setActiveView] = useState<'visual' | 'sql'>('visual');

  const toggle = (name: string) =>
    setExpanded((prev) => prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]);

  const copySQL = () => {
    navigator.clipboard.writeText(SQL_SCHEMA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0f0f1a] py-10">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#e63946]/20 border border-[#e63946]/30 flex items-center justify-center">
              <Database className="w-5 h-5 text-[#e63946]" />
            </div>
            <h1 className="text-white text-3xl font-black">Database Schema</h1>
          </div>
          <p className="text-gray-400 ml-13">Complete MySQL schema for your BookMyShow Java backend — copy and run in your DB.</p>
        </motion.div>

        {/* View Toggle */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex bg-white/5 p-1 rounded-xl">
            <button
              onClick={() => setActiveView('visual')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeView === 'visual' ? 'bg-[#e63946] text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Table2 className="w-4 h-4" />
              Visual Tables
            </button>
            <button
              onClick={() => setActiveView('sql')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeView === 'sql' ? 'bg-[#e63946] text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Database className="w-4 h-4" />
              SQL Script
            </button>
          </div>

          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <span>{tables.length} tables</span>
            <span className="text-gray-600">•</span>
            <span>MySQL / PostgreSQL</span>
          </div>
        </div>

        {/* Relationships Legend */}
        {activeView === 'visual' && (
          <div className="mb-6 p-4 bg-white/5 border border-white/10 rounded-xl flex flex-wrap gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Key className="w-4 h-4 text-yellow-400" /> PK = Primary Key
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Link2 className="w-4 h-4 text-blue-400" /> FK = Foreign Key
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span className="w-4 h-4 rounded border-2 border-[#e63946] inline-block" /> Booking flow tables
            </div>
          </div>
        )}

        {/* Visual Tables */}
        {activeView === 'visual' && (
          <div className="space-y-3">
            {tables.map((table, i) => (
              <motion.div
                key={table.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-white/5 border border-white/10 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => toggle(table.name)}
                  className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${dotMap[table.color]}`} />
                    <span className="text-white font-bold font-mono">{table.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${colorMap[table.color]}`}>
                      {table.columns.length} columns
                    </span>
                    <span className="text-gray-500 text-sm hidden sm:block">{table.description}</span>
                  </div>
                  {expanded.includes(table.name)
                    ? <ChevronDown className="w-4 h-4 text-gray-400" />
                    : <ChevronRight className="w-4 h-4 text-gray-400" />}
                </button>

                {expanded.includes(table.name) && (
                  <div className="border-t border-white/10 overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-white/5">
                          <th className="text-left px-4 py-2.5 text-gray-400 font-medium">Column</th>
                          <th className="text-left px-4 py-2.5 text-gray-400 font-medium">Type</th>
                          <th className="text-left px-4 py-2.5 text-gray-400 font-medium">Constraints / Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {table.columns.map((col, j) => (
                          <tr key={col.name} className={`border-t border-white/5 ${j % 2 === 0 ? '' : 'bg-white/2'}`}>
                            <td className="px-4 py-2.5">
                              <div className="flex items-center gap-2">
                                {col.constraints.includes('PK') && <Key className="w-3 h-3 text-yellow-400 shrink-0" />}
                                {col.constraints.includes('FK') && <Link2 className="w-3 h-3 text-blue-400 shrink-0" />}
                                <span className={`font-mono ${col.constraints.includes('PK') ? 'text-yellow-300' : 'text-white'}`}>
                                  {col.name}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-2.5">
                              <span className="font-mono text-green-400 text-xs">{col.type}</span>
                            </td>
                            <td className="px-4 py-2.5">
                              <span className="text-gray-400 text-xs">{col.constraints}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* SQL View */}
        {activeView === 'sql' && (
          <div className="relative">
            <button
              onClick={copySQL}
              className={`absolute top-4 right-4 z-10 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                copied ? 'bg-green-500/20 border border-green-500/40 text-green-400' : 'bg-white/10 hover:bg-white/20 border border-white/10 text-white'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy SQL'}
            </button>
            <pre className="bg-[#0d1117] border border-white/10 rounded-xl p-6 overflow-x-auto text-xs text-gray-300 leading-relaxed font-mono max-h-[600px] overflow-y-auto">
              {SQL_SCHEMA}
            </pre>
          </div>
        )}

        {/* Java Spring Boot Integration Notes */}
        <div className="mt-10 grid md:grid-cols-2 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <h3 className="text-white font-bold mb-3 flex items-center gap-2">
              <span className="text-2xl">☕</span> Spring Boot Setup
            </h3>
            <div className="space-y-2 text-sm text-gray-400">
              <p>1. Add <code className="text-green-400">spring-boot-starter-data-jpa</code> to pom.xml</p>
              <p>2. Add <code className="text-green-400">mysql-connector-java</code> dependency</p>
              <p>3. Configure <code className="text-green-400">application.properties</code>:</p>
              <pre className="bg-black/30 rounded-lg p-3 text-xs text-green-300 mt-2 overflow-x-auto">{`spring.datasource.url=jdbc:mysql://
  localhost:3306/bookmyshow
spring.datasource.username=root
spring.datasource.password=yourpass
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=true`}</pre>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <h3 className="text-white font-bold mb-3 flex items-center gap-2">
              <span className="text-2xl">🔗</span> Frontend Connection
            </h3>
            <div className="space-y-2 text-sm text-gray-400">
              <p>Create a <code className="text-yellow-400">.env</code> file in the frontend root:</p>
              <pre className="bg-black/30 rounded-lg p-3 text-xs text-yellow-300 mt-2">{`VITE_API_BASE_URL=http://localhost:8080/api`}</pre>
              <p className="mt-3">Enable CORS in your Java backend:</p>
              <pre className="bg-black/30 rounded-lg p-3 text-xs text-blue-300 mt-2 overflow-x-auto">{`@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api")`}</pre>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <h3 className="text-white font-bold mb-3 flex items-center gap-2">
              <span className="text-2xl">🔐</span> JWT Auth (Spring Security)
            </h3>
            <div className="space-y-2 text-sm text-gray-400">
              <p>Add <code className="text-green-400">spring-boot-starter-security</code> + <code className="text-green-400">jjwt</code></p>
              <p>• <code className="text-white">POST /api/auth/login</code> → returns JWT token</p>
              <p>• <code className="text-white">POST /api/auth/register</code> → creates user</p>
              <p>• Frontend stores token in <code className="text-yellow-400">localStorage</code> and sends as <code className="text-yellow-400">Authorization: Bearer &lt;token&gt;</code></p>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <h3 className="text-white font-bold mb-3 flex items-center gap-2">
              <span className="text-2xl">📡</span> Required API Endpoints
            </h3>
            <div className="space-y-1 text-xs font-mono">
              {[
                ['GET', '/api/movies', 'text-blue-400'],
                ['GET', '/api/movies/:id', 'text-blue-400'],
                ['GET', '/api/movies/upcoming', 'text-blue-400'],
                ['GET', '/api/movies/:id/reviews', 'text-blue-400'],
                ['GET', '/api/shows?movieId&date&city', 'text-blue-400'],
                ['GET', '/api/shows/:id/seats', 'text-blue-400'],
                ['POST', '/api/bookings', 'text-green-400'],
                ['GET', '/api/bookings/my', 'text-green-400'],
                ['POST', '/api/auth/login', 'text-yellow-400'],
                ['POST', '/api/auth/register', 'text-yellow-400'],
                ['POST', '/api/promo/validate', 'text-purple-400'],
              ].map(([method, path, color]) => (
                <div key={path} className="flex items-center gap-2">
                  <span className={`${color} w-12 shrink-0`}>{method}</span>
                  <span className="text-gray-300">{path}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
