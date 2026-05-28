import { createContext, useContext } from 'react';
import type { BookingDetails, User } from './types';

export interface AppState {
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  currentBooking: Partial<BookingDetails> | null;
  setCurrentBooking: (booking: Partial<BookingDetails> | null) => void;
  user: User | null;
  setUser: (user: User | null) => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (v: boolean) => void;
}

export const AppContext = createContext<AppState>({
  selectedCity: 'Mumbai',
  setSelectedCity: () => {},
  currentBooking: null,
  setCurrentBooking: () => {},
  user: null,
  setUser: () => {},
  isLoggedIn: false,
  setIsLoggedIn: () => {},
});

export const useAppContext = () => useContext(AppContext);
