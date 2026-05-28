import { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AppContext } from './lib/store.js';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import MovieDetail from './pages/MovieDetail.jsx';
import SeatSelection from './pages/SeatSelection.jsx';
import Checkout from './pages/Checkout.jsx';
import Confirmation from './pages/Confirmation.jsx';
import Login from './pages/Login.jsx';
import DbSchema from './pages/DbSchema.jsx';

export default function App() {
  const [selectedCity, setSelectedCity] = useState('Mumbai');
  const [currentBooking, setCurrentBooking] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <AppContext.Provider
      value={{
        selectedCity, setSelectedCity,
        currentBooking, setCurrentBooking,
        user, setUser,
        isLoggedIn, setIsLoggedIn,
      }}
    >
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppContext.Provider>
  );
}

function AppRoutes() {
  const location = useLocation();
  const hideNav = ['/login', '/confirmation'].some(p => location.pathname.startsWith(p));

  return (
    <div className="min-h-screen bg-[#0f0f1a] flex flex-col">
      {!hideNav && <Navbar />}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movie/:id" element={<MovieDetail />} />
          <Route path="/seat-selection" element={<SeatSelection />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/confirmation" element={<Confirmation />} />
          <Route path="/login" element={<Login />} />
          <Route path="/db-schema" element={<DbSchema />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      {!hideNav && <Footer />}
    </div>
  );
}
