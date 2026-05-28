/**
 * BookMyShow API Service
 * All calls go to your Java Spring Boot backend.
 * Set VITE_API_BASE_URL in .env to point to your server.
 * Default: http://localhost:8080/api
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api';

// ─── Auth token helpers ─────────────────────────────────────────────────────
function getToken(): string | null {
  return localStorage.getItem('bms_token');
}
export function setToken(token: string) {
  localStorage.setItem('bms_token', token);
}
export function clearToken() {
  localStorage.removeItem('bms_token');
}

// ─── Core fetch wrapper ──────────────────────────────────────────────────────
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({ message: res.statusText }));
    throw new ApiError(res.status, errBody.message ?? res.statusText);
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

// ─── Types (mirror your Java DTOs) ──────────────────────────────────────────
export interface MovieDTO {
  id: number;
  title: string;
  description: string;
  director: string;
  durationMinutes: number;
  releaseDate: string;       // ISO date: "2025-06-20"
  certificate: string;       // U | UA | A
  rating: number;
  votes: number;
  posterUrl: string;
  bannerUrl: string;
  genres: string[];
  languages: string[];
  formats: string[];         // 2D | 3D | IMAX | 4DX
  cast: CastMemberDTO[];
}

export interface CastMemberDTO {
  name: string;
  role: string;
  photoUrl: string;
}

export interface TheatreDTO {
  id: number;
  name: string;
  address: string;
  city: string;
  distanceKm: number;
  amenities: string[];
}

export interface ShowDTO {
  id: number;
  movieId: number;
  theatreId: number;
  showDate: string;          // ISO date
  showTime: string;          // "09:30"
  format: string;
  language: string;
  silverPrice: number;
  goldPrice: number;
  platinumPrice: number;
  totalSeats: number;
  availableSeats: number;
}

export interface SeatDTO {
  id: number;
  seatLabel: string;         // e.g. "A1"
  row: string;
  seatNumber: number;
  category: 'SILVER' | 'GOLD' | 'PLATINUM';
  status: 'AVAILABLE' | 'BOOKED' | 'BLOCKED';
  price: number;
}

export interface BookingRequestDTO {
  showId: number;
  seatIds: number[];
  paymentMethod: string;
  promoCode?: string;
}

export interface BookingResponseDTO {
  bookingId: string;
  status: string;            // CONFIRMED | PENDING | FAILED
  totalAmount: number;
  convenienceFee: number;
  discount: number;
  grandTotal: number;
  seats: SeatDTO[];
  show: ShowDTO;
  movie: MovieDTO;
  theatre: TheatreDTO;
  bookedAt: string;
}

export interface LoginRequestDTO {
  email: string;
  password: string;
}

export interface RegisterRequestDTO {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface AuthResponseDTO {
  token: string;
  user: UserDTO;
}

export interface UserDTO {
  id: number;
  name: string;
  email: string;
  phone: string;
}

export interface ReviewDTO {
  id: number;
  userId: number;
  userName: string;
  movieId: number;
  rating: number;
  comment: string;
  createdAt: string;
}

// ─── Movies ──────────────────────────────────────────────────────────────────
export const moviesApi = {
  /** GET /api/movies?city=Mumbai&genre=Action&language=Hindi&format=3D */
  getAll: (params?: {
    city?: string;
    genre?: string;
    language?: string;
    format?: string;
    search?: string;
  }) => {
    const q = new URLSearchParams();
    if (params?.city)     q.set('city', params.city);
    if (params?.genre)    q.set('genre', params.genre);
    if (params?.language) q.set('language', params.language);
    if (params?.format)   q.set('format', params.format);
    if (params?.search)   q.set('search', params.search);
    return request<MovieDTO[]>(`/movies${q.toString() ? '?' + q : ''}`);
  },

  /** GET /api/movies/:id */
  getById: (id: number) => request<MovieDTO>(`/movies/${id}`),

  /** GET /api/movies/upcoming */
  getUpcoming: () => request<MovieDTO[]>('/movies/upcoming'),

  /** GET /api/movies/:id/reviews */
  getReviews: (movieId: number) => request<ReviewDTO[]>(`/movies/${movieId}/reviews`),

  /** POST /api/movies/:id/reviews  (auth required) */
  postReview: (movieId: number, body: { rating: number; comment: string }) =>
    request<ReviewDTO>(`/movies/${movieId}/reviews`, { method: 'POST', body: JSON.stringify(body) }),
};

// ─── Shows / Theatres ─────────────────────────────────────────────────────────
export const showsApi = {
  /**
   * GET /api/shows?movieId=1&date=2025-06-20&city=Mumbai
   * Returns theatres with their shows for that movie+date+city
   */
  getByMovieAndDate: (movieId: number, date: string, city: string) =>
    request<{ theatre: TheatreDTO; shows: ShowDTO[] }[]>(
      `/shows?movieId=${movieId}&date=${date}&city=${encodeURIComponent(city)}`
    ),

  /** GET /api/shows/:showId/seats  — returns all seats with live status */
  getSeats: (showId: number) => request<SeatDTO[]>(`/shows/${showId}/seats`),
};

// ─── Bookings ────────────────────────────────────────────────────────────────
export const bookingsApi = {
  /** POST /api/bookings  (auth required) */
  create: (body: BookingRequestDTO) =>
    request<BookingResponseDTO>('/bookings', { method: 'POST', body: JSON.stringify(body) }),

  /** GET /api/bookings/:bookingId */
  getById: (bookingId: string) => request<BookingResponseDTO>(`/bookings/${bookingId}`),

  /** GET /api/bookings/my  (auth required) — current user's bookings */
  getMine: () => request<BookingResponseDTO[]>('/bookings/my'),

  /** DELETE /api/bookings/:bookingId  (auth required, cancellation) */
  cancel: (bookingId: string) =>
    request<{ message: string }>(`/bookings/${bookingId}`, { method: 'DELETE' }),
};

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  /** POST /api/auth/login */
  login: (body: LoginRequestDTO) =>
    request<AuthResponseDTO>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),

  /** POST /api/auth/register */
  register: (body: RegisterRequestDTO) =>
    request<AuthResponseDTO>('/auth/register', { method: 'POST', body: JSON.stringify(body) }),

  /** POST /api/auth/send-otp */
  sendOtp: (phone: string) =>
    request<{ message: string }>('/auth/send-otp', { method: 'POST', body: JSON.stringify({ phone }) }),

  /** POST /api/auth/verify-otp */
  verifyOtp: (phone: string, otp: string) =>
    request<AuthResponseDTO>('/auth/verify-otp', { method: 'POST', body: JSON.stringify({ phone, otp }) }),

  /** GET /api/auth/me  (auth required) */
  me: () => request<UserDTO>('/auth/me'),
};

// ─── Promo Codes ─────────────────────────────────────────────────────────────
export const promoApi = {
  /** POST /api/promo/validate */
  validate: (code: string, amount: number) =>
    request<{ valid: boolean; discount: number; message: string }>(
      '/promo/validate', { method: 'POST', body: JSON.stringify({ code, amount }) }
    ),
};
