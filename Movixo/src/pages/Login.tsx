import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Phone, User, Ticket, ArrowLeft, AlertCircle } from 'lucide-react';
import { authApi, setToken } from '../lib/api';
import { useAppContext } from '../lib/store';

export default function Login() {
  const navigate = useNavigate();
  const { setUser, setIsLoggedIn } = useAppContext();
  const [mode, setMode] = useState<'login' | 'register' | 'otp'>('login');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', otp: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await authApi.login({ email: form.email, password: form.password });
      setToken(res.token);
      setUser({ id: res.user.id, name: res.user.name, email: res.user.email, phone: res.user.phone });
      setIsLoggedIn(true);
      navigate(-1);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // First send OTP
      await authApi.sendOtp(form.phone);
      setMode('otp');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not send OTP. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await authApi.verifyOtp(form.phone, form.otp);
      setToken(res.token);
      setUser({ id: res.user.id, name: res.user.name, email: res.user.email, phone: res.user.phone });
      setIsLoggedIn(true);
      navigate(-1);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center px-4">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <img src="/images/hero-bg.jpg" alt="" className="w-full h-full object-cover opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f0f1a] via-[#0f0f1a]/90 to-[#1a1a2e]" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#16213e] border border-white/10 rounded-2xl p-8 shadow-2xl"
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-[#e63946] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#e63946]/30">
              <Ticket className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-white text-2xl font-black">
              book<span className="text-[#e63946]">my</span>show
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              {mode === 'login' ? 'Sign in to your account' : mode === 'register' ? 'Create a new account' : 'Verify your number'}
            </p>
          </div>

          {/* Tabs */}
          {mode !== 'otp' && (
            <div className="flex bg-white/5 p-1 rounded-xl mb-6">
              <button
                onClick={() => { setMode('login'); setError(''); }}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                  mode === 'login' ? 'bg-[#e63946] text-white shadow' : 'text-gray-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setMode('register'); setError(''); }}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                  mode === 'register' ? 'bg-[#e63946] text-white shadow' : 'text-gray-400 hover:text-white'
                }`}
              >
                Register
              </button>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-4">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Login Form */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-gray-400 text-xs mb-1.5 block">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="w-full bg-white/10 border border-white/20 text-white placeholder-gray-500 pl-10 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#e63946]"
                  />
                </div>
              </div>
              <div>
                <label className="text-gray-400 text-xs mb-1.5 block">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    name="password"
                    type={showPass ? 'text' : 'password'}
                    placeholder="Enter password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    className="w-full bg-white/10 border border-white/20 text-white placeholder-gray-500 pl-10 pr-12 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#e63946]"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="flex justify-end">
                <button type="button" className="text-[#e63946] text-xs hover:underline">Forgot Password?</button>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#e63946] hover:bg-[#c1121f] disabled:opacity-70 text-white py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
              >
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Sign In'}
              </button>
            </form>
          )}

          {/* Register Form */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="text-gray-400 text-xs mb-1.5 block">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input name="name" type="text" placeholder="Your full name" value={form.name} onChange={handleChange} required
                    className="w-full bg-white/10 border border-white/20 text-white placeholder-gray-500 pl-10 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#e63946]" />
                </div>
              </div>
              <div>
                <label className="text-gray-400 text-xs mb-1.5 block">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input name="phone" type="tel" placeholder="10-digit mobile number" value={form.phone} onChange={handleChange} required
                    className="w-full bg-white/10 border border-white/20 text-white placeholder-gray-500 pl-10 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#e63946]" />
                </div>
              </div>
              <div>
                <label className="text-gray-400 text-xs mb-1.5 block">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input name="email" type="email" placeholder="your@email.com" value={form.email} onChange={handleChange} required
                    className="w-full bg-white/10 border border-white/20 text-white placeholder-gray-500 pl-10 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#e63946]" />
                </div>
              </div>
              <div>
                <label className="text-gray-400 text-xs mb-1.5 block">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input name="password" type={showPass ? 'text' : 'password'} placeholder="Create a password" value={form.password} onChange={handleChange} required
                    className="w-full bg-white/10 border border-white/20 text-white placeholder-gray-500 pl-10 pr-12 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#e63946]" />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-[#e63946] hover:bg-[#c1121f] disabled:opacity-70 text-white py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2">
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Send OTP'}
              </button>
            </form>
          )}

          {/* OTP Form */}
          {mode === 'otp' && (
            <div className="space-y-4">
              <p className="text-gray-400 text-sm text-center">
                OTP sent to <span className="text-white font-semibold">{form.phone}</span>
              </p>
              <div>
                <label className="text-gray-400 text-xs mb-1.5 block">Enter OTP</label>
                <input
                  name="otp"
                  type="text"
                  placeholder="6-digit OTP"
                  value={form.otp}
                  onChange={handleChange}
                  maxLength={6}
                  className="w-full bg-white/10 border border-white/20 text-white placeholder-gray-500 px-4 py-3 rounded-xl text-sm text-center tracking-widest text-lg font-mono focus:outline-none focus:ring-2 focus:ring-[#e63946]"
                />
              </div>
              <button onClick={handleVerifyOtp} disabled={loading}
                className="w-full bg-[#e63946] hover:bg-[#c1121f] disabled:opacity-70 text-white py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2">
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Verify & Continue'}
              </button>
              <button onClick={() => { setMode('register'); setError(''); }} className="w-full text-gray-400 text-sm hover:text-white transition-colors">
                ← Change number
              </button>
            </div>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-gray-500 text-xs">or continue with</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white py-2.5 rounded-xl text-sm transition-all">
              <span className="text-lg font-bold text-blue-400">G</span>
              Google
            </button>
            <button className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white py-2.5 rounded-xl text-sm transition-all">
              <span className="text-lg font-bold text-blue-600">f</span>
              Facebook
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
