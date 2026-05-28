export interface Movie {
  id: number;
  title: string;
  genre: string[];
  language: string[];
  duration: number; // minutes
  rating: number;
  votes: number;
  releaseDate: string;
  description: string;
  cast: CastMember[];
  director: string;
  image: string;
  banner: string;
  certificate: string; // U, UA, A
  format: string[]; // 2D, 3D, IMAX
}

export interface CastMember {
  name: string;
  role: string;
  image: string;
}

export interface Theatre {
  id: number;
  name: string;
  location: string;
  distance: string;
  amenities: string[];
  shows: Show[];
}

export interface Show {
  id: number;
  time: string;
  format: string;
  language: string;
  price: {
    silver: number;
    gold: number;
    platinum: number;
  };
  availableSeats: number;
  totalSeats: number;
}

export interface Seat {
  id: string;
  row: string;
  number: number;
  category: 'silver' | 'gold' | 'platinum';
  status: 'available' | 'booked' | 'selected' | 'unavailable';
  price: number;
}

export interface BookingDetails {
  movie: Movie;
  theatre: Theatre;
  show: Show;
  date: string;
  seats: Seat[];
  totalAmount: number;
  convenienceFee: number;
  bookingId?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
}
