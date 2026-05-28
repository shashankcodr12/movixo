/**
 * Movixo API Service
 * Base URL: http://localhost:8080/api  (your Spring Boot backend)
 * No JWT auth for now — add later when you implement it.
 */

export const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api';

// ── Core fetch wrapper ────────────────────────────────────────────────────────
async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers ?? {}),
  };

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: `HTTP ${res.status}: ${res.statusText}` }));
    throw new Error(err.message ?? res.statusText);
  }
  if (res.status === 204) return undefined;
  return res.json();
}

// ── Movies ────────────────────────────────────────────────────────────────────
// YOUR ENDPOINT: GET http://localhost:8080/api/movies
export const moviesApi = {

  /** GET /api/movies  — returns all movies */
  getAll: () => request('/movies'),

  /** GET /api/movies/:id  — single movie by id */
  getById: (id) => request(`/movies/${id}`),

  /** GET /api/movies/upcoming  — upcoming movies (add this to your backend later) */
  getUpcoming: () => request('/movies/upcoming'),

  /** GET /api/movies/:id/reviews */
  getReviews: (movieId) => request(`/movies/${movieId}/reviews`),

  /** POST /api/movies/:id/reviews */
  postReview: (movieId, body) =>
    request(`/movies/${movieId}/reviews`, { method: 'POST', body: JSON.stringify(body) }),
};

// ── Shows / Theatres ──────────────────────────────────────────────────────────
export const showsApi = {
  /** GET /api/shows?movieId=1&date=2025-06-20 */
  getByMovieAndDate: (movieId, date) =>
    request(`/shows?movieId=${movieId}&date=${date}`),

  /** GET /api/shows/:showId/seats */
  getSeats: (showId) => request(`/shows/${showId}/seats`),
};

// ── Bookings ──────────────────────────────────────────────────────────────────
export const bookingsApi = {
  /** POST /api/bookings */
  create: (body) =>
    request('/bookings', { method: 'POST', body: JSON.stringify(body) }),

  /** GET /api/bookings/:bookingId */
  getById: (bookingId) => request(`/bookings/${bookingId}`),

  /** GET /api/bookings/my */
  getMine: () => request('/bookings/my'),

  /** DELETE /api/bookings/:bookingId */
  cancel: (bookingId) =>
    request(`/bookings/${bookingId}`, { method: 'DELETE' }),
};

// ── Auth (no JWT yet — add later) ─────────────────────────────────────────────
export const authApi = {
  /** POST /api/auth/login */
  login: (body) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),

  /** POST /api/auth/register */
  register: (body) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),

  /** POST /api/auth/send-otp */
  sendOtp: (phone) =>
    request('/auth/send-otp', { method: 'POST', body: JSON.stringify({ phone }) }),

  /** POST /api/auth/verify-otp */
  verifyOtp: (phone, otp) =>
    request('/auth/verify-otp', { method: 'POST', body: JSON.stringify({ phone, otp }) }),
};

// ── Promo Codes ───────────────────────────────────────────────────────────────
export const promoApi = {
  /** POST /api/promo/validate */
  validate: (code, amount) =>
    request('/promo/validate', { method: 'POST', body: JSON.stringify({ code, amount }) }),
};

// ── Token helpers (for when you add JWT later) ────────────────────────────────
export function getToken()   { return localStorage.getItem('mvx_token'); }
export function setToken(t)  { localStorage.setItem('mvx_token', t); }
export function clearToken() { localStorage.removeItem('mvx_token'); }
