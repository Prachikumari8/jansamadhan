import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, ArrowRight, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useStore } from '../store/useStore';
import { translations } from '../services/i18n.ts';
import { useGoogleLogin } from '@react-oauth/google';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'CITIZEN' | 'ADMIN' | 'STAFF'>('CITIZEN');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const { login, signup, currentLanguage } = useStore();
  const copy = translations[currentLanguage];
  const navigate = useNavigate();

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        const res = await fetch('http://localhost:5000/api/auth/google-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken: tokenResponse.access_token }),
        });
        const data = await res.json();
        if (data.success) {
          localStorage.setItem('jansamadhan_token', data.token); // Save Token
          const user = data.data.user;
          if (user.role === 'STAFF' && user.staffCategory) {
            signup(user.name || user.email.split('@')[0], user.email, user.phone || '', user.role, user.staffCategory);
          } else {
            login(user.email, user.role);
          }
          navigate(user.role === 'CITIZEN' ? '/dashboard' : '/admin');
        } else {
          setError(data.message || "Google login failed.");
        }
      } catch (err) {
        setError("Connection failed.");
      } finally {
        setLoading(false);
      }
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (data.success) {
        localStorage.setItem('jansamadhan_token', data.token); // Save Token
        const user = data.data.user;
        if (user.role === 'STAFF' && user.staffCategory) {
          signup(user.name || user.email.split('@')[0], user.email, user.phone || '', user.role, user.staffCategory);
        } else {
          login(user.email, user.role);
        }
        navigate(user.role === 'CITIZEN' ? '/dashboard' : '/admin');
      } else {
        setError(data.message || "Invalid email or password.");
      }
    } catch (err) {
      setError("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-56px)] flex flex-col lg:flex-row">
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 p-12 xl:p-16 flex-col justify-between relative overflow-hidden">
        <div className="relative z-10">
          <Link to="/" className="flex items-center space-x-3 mb-14">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-xl font-black tracking-tight text-white uppercase">JanSamadhan</span>
          </Link>
          <div className="space-y-4 text-white">
            <h2 className="text-3xl xl:text-4xl font-black leading-tight">{copy.login_hero_title}</h2>
            <p className="text-slate-400 text-base max-w-md">{copy.login_hero_subtitle}</p>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full"></div>
      </div>

      <div className="flex-1 flex items-center justify-center p-5 sm:p-8 bg-white">
        <div className="w-full max-w-sm sm:max-w-md space-y-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{copy.login_title}</h1>
            <p className="text-slate-500 font-medium mt-1.5 text-sm">{copy.login_subtitle}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg flex items-center space-x-3 text-rose-600">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p className="text-[11px] font-bold uppercase tracking-wider">{error}</p>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Email</label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com" 
                  className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-transparent focus:border-blue-600 rounded-lg outline-none text-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600" />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 pl-10 pr-10 bg-slate-50 border border-transparent focus:border-blue-600 rounded-lg outline-none text-sm"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-slate-900 text-white font-bold rounded-lg hover:bg-blue-600 shadow-lg disabled:opacity-50 transition-all text-sm"
            >
              {loading ? "Signing in..." : copy.login_submit}
            </button>
          </form>

          <div className="space-y-5">
            <div className="relative py-3">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
              <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest"><span className="bg-white px-4 text-slate-400">{copy.login_or_continue}</span></div>
            </div>

            <button 
              type="button"
              onClick={() => handleGoogleLogin()}
              className="w-full h-11 border border-slate-200 rounded-lg flex items-center justify-center space-x-3 hover:bg-slate-50 active:scale-95 transition-all"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-4 h-4" alt="Google" />
              <span className="text-xs font-bold text-slate-600">Continue with Google</span>
            </button>

            <p className="text-center text-sm font-medium text-slate-500">
              {copy.login_new_user} <Link to="/signup" className="text-blue-600 font-bold hover:underline">{copy.login_create_account}</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};