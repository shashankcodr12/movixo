import { createContext, useContext } from 'react';

export const AppContext = createContext({
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
