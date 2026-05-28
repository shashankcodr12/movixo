/**
 * Adapts Java backend response objects → Movixo frontend format.
 * Matches the EXACT JSON your Spring Boot backend returns.
 */

// Genre → color/emoji mapping for UI
const GENRE_COLORS = {
  Action:    { bg: 'from-red-600 to-orange-500',    banner: '#7f1d1d' },
  Drama:     { bg: 'from-purple-600 to-indigo-500', banner: '#3b0764' },
  Romance:   { bg: 'from-pink-500 to-rose-500',     banner: '#831843' },
  Comedy:    { bg: 'from-yellow-500 to-amber-400',  banner: '#713f12' },
  Thriller:  { bg: 'from-gray-700 to-slate-600',    banner: '#0f172a' },
  Horror:    { bg: 'from-gray-900 to-red-900',      banner: '#1c0505' },
  'Sci-Fi':  { bg: 'from-cyan-600 to-blue-600',     banner: '#0c2340' },
  Superhero: { bg: 'from-blue-600 to-violet-600',   banner: '#1e1b4b' },
};

// Generate a gradient banner color based on genre when no bannerUrl
function getBannerColor(genre) {
  return GENRE_COLORS[genre]?.banner ?? '#1a1a2e';
}

// Generate a poster placeholder when posterUrl is missing or "url"
function getPosterUrl(dto) {
  if (dto.posterUrl && dto.posterUrl !== 'url' && dto.posterUrl.startsWith('http')) {
    return dto.posterUrl;
  }
  // Return a colored placeholder based on genre
  const colors = {
    Action: '7f1d1d/ffffff', Drama: '3b0764/ffffff', Romance: '831843/ffffff',
    Comedy: '713f12/ffffff', Thriller: '0f172a/ffffff', 'Sci-Fi': '0c2340/ffffff',
    Superhero: '1e1b4b/ffffff', Horror: '1c0505/ffffff',
  };
  const c = colors[dto.genre] ?? '1a1a2e/ffffff';
  const title = encodeURIComponent(dto.title ?? 'Movie');
  return `https://placehold.co/300x450/${c}?text=${title}`;
}

/**
 * Adapts a single movie from your Java API response.
 *
 * Your backend returns:
 * { id, title, description, language, genre, durationMins, releaseDate, posterUrl }
 */
export function adaptMovie(dto) {
  return {
    id: dto.id,
    title: dto.title ?? 'Untitled',
    description: dto.description ?? '',
    director: dto.director ?? 'TBA',

    // Your backend uses durationMins (not durationMinutes)
    duration: dto.durationMins ?? dto.durationMinutes ?? 0,

    releaseDate: dto.releaseDate ?? '',
    certificate: dto.certificate ?? 'UA',

    // Your backend returns rating/votes — default to 0 if not present yet
    rating: dto.rating ?? 0,
    votes: dto.votes ?? 0,

    // Poster — handle placeholder "url" string
    image: getPosterUrl(dto),
    banner: (dto.bannerUrl && dto.bannerUrl !== 'url') ? dto.bannerUrl : null,
    bannerColor: getBannerColor(dto.genre),

    // Your backend returns genre & language as STRINGS, not arrays
    // Convert to arrays so the UI works correctly
    genre: dto.genre
      ? (Array.isArray(dto.genre) ? dto.genre : [dto.genre])
      : [],
    language: dto.language
      ? (Array.isArray(dto.language) ? dto.language : [dto.language])
      : [],

    format: dto.formats ?? dto.format
      ? (Array.isArray(dto.format ?? dto.formats) ? (dto.format ?? dto.formats) : [dto.format ?? dto.formats])
      : ['2D'],

    cast: (dto.cast ?? []).map(c => ({
      name: c.name,
      role: c.role,
      image: c.photoUrl ?? '',
    })),
  };
}

export function adaptShow(dto) {
  return {
    id: dto.id,
    time: dto.showTime ?? dto.time,
    format: dto.format ?? '2D',
    language: dto.language ?? 'Hindi',
    price: {
      silver:   dto.silverPrice   ?? dto.price?.silver   ?? 150,
      gold:     dto.goldPrice     ?? dto.price?.gold     ?? 250,
      platinum: dto.platinumPrice ?? dto.price?.platinum ?? 400,
    },
    availableSeats: dto.availableSeats ?? 50,
    totalSeats:     dto.totalSeats     ?? 100,
  };
}

export function adaptTheatreWithShows(theatreDto, showDtos) {
  return {
    id:       theatreDto.id,
    name:     theatreDto.name,
    location: theatreDto.address ?? theatreDto.location ?? '',
    distance: theatreDto.distanceKm ? `${Number(theatreDto.distanceKm).toFixed(1)} km` : '',
    amenities: theatreDto.amenities ?? [],
    shows:    (showDtos ?? []).map(adaptShow),
  };
}

export function adaptSeat(dto) {
  const statusMap = { AVAILABLE: 'available', BOOKED: 'booked', BLOCKED: 'unavailable' };
  return {
    id:       dto.seatLabel ?? `${dto.row}${dto.seatNumber}`,
    row:      dto.row,
    number:   dto.seatNumber,
    category: (dto.category ?? 'silver').toLowerCase(),
    status:   statusMap[dto.status] ?? 'available',
    price:    dto.price ?? 0,
    dbId:     dto.id,
  };
}

export function adaptBookingResponse(dto) {
  return {
    movie:          adaptMovie(dto.movie),
    theatre:        adaptTheatreWithShows(dto.theatre, [dto.show]),
    show:           adaptShow(dto.show),
    date:           dto.show?.showDate ?? dto.date,
    seats:          (dto.seats ?? []).map(adaptSeat),
    totalAmount:    dto.totalAmount    ?? 0,
    convenienceFee: dto.convenienceFee ?? 0,
    bookingId:      dto.bookingId      ?? dto.bookingRef,
  };
}
