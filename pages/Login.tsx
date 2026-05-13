import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, ArrowRight, Eye, EyeOff, AlertCircle, Sparkles, Building2, UserCircle } from 'lucide-react';
import { useStore } from '../store/useStore';
import { translations } from '../services/i18n.ts';
import { useGoogleLogin } from '@react-oauth/google';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
          localStorage.setItem('jansamadhan_token', data.token);
          const user = data.data.user;
          if (user.role === 'STAFF' && user.staffCategory) {
            signup(user.name || user.email.split('@')[0], user.email, user.phone || '', user.role, user.staffCategory);
          } else {
            login(user.email, user.role);
          }
          navigate(user.role === 'ADMIN' ? '/admin' : '/dashboard');
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
        localStorage.setItem('jansamadhan_token', data.token);
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
    <div className="min-h-screen flex items-stretch bg-white selection:bg-blue-100 selection:text-blue-900">
      {/* Left: Artistic Hero Section */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-slate-950">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/C:/Users/prach/.gemini/antigravity/brain/894efa3e-fdb9-4d40-8674-e4770b81495c/login_hero_civic_modern_1778697243559.png" 
            alt="Civic Modern Art" 
            className="w-full h-full object-cover opacity-60 mix-blend-luminosity scale-105 animate-[pulse_8s_ease-in-out_infinite]"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-950/80 to-blue-900/40"></div>
        </div>

        {/* Decorative Blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-600/20 blur-[120px] rounded-full animate-blob"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-600/20 blur-[120px] rounded-full animate-blob animation-delay-2000"></div>

        <div className="relative z-10 w-full p-16 flex flex-col justify-between">
          <Link to="/" className="flex items-center space-x-3 group w-fit">
            <div className="w-11 h-11 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center text-white shadow-2xl group-hover:bg-blue-600 group-hover:border-blue-500 transition-all duration-500">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tighter text-white uppercase leading-none">JanSamadhan</span>
              <span className="text-[9px] font-black tracking-[0.3em] text-blue-400 uppercase mt-1">Official Portal</span>
            </div>
          </Link>

          <div className="max-w-xl space-y-8">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-[10px] font-black text-blue-300 uppercase tracking-widest">Next-Gen Governance</span>
            </div>
            
            <h2 className="text-5xl xl:text-6xl font-black text-white leading-[1.05] tracking-tight">
              Empowering <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Communities</span> <br />
              through Tech.
            </h2>
            
            <p className="text-lg text-slate-400 font-medium leading-relaxed max-w-md">
              {copy.login_hero_subtitle}
            </p>

            <div className="pt-8 flex items-center space-x-12">
              <div className="flex flex-col">
                <span className="text-3xl font-black text-white">10k+</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Active Users</span>
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-black text-white">98%</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Resolution Rate</span>
              </div>
            </div>
          </div>

          <div className="text-slate-500 text-xs font-medium">
            © 2024 JanSamadhan Governance Initiative. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right: Login Form Section */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 xl:p-24 bg-white relative">
        <div className="w-full max-w-md space-y-10 animate-in fade-in slide-in-from-right-10 duration-1000">
          <div>
            <div className="lg:hidden flex items-center space-x-3 mb-12">
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-lg font-black tracking-tight text-slate-900 uppercase">JanSamadhan</span>
            </div>
            
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">{copy.login_title}</h1>
            <p className="text-slate-500 font-semibold mt-2 leading-relaxed">{copy.login_subtitle}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start space-x-3 text-rose-600 animate-in zoom-in-95 duration-300">
                <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest">Login Error</span>
                  <p className="text-xs font-bold mt-0.5">{error}</p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Email Identification</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@official.gov" 
                  className="w-full h-14 pl-12 pr-4 bg-slate-50/50 border border-slate-100 focus:border-blue-600 focus:bg-white rounded-2xl outline-none text-sm font-semibold transition-all shadow-inner"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Secret Password</label>
                <Link to="/forgot-password" size="sm" className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-700">Forgot Password?</Link>
              </div>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <Lock className="w-4 h-4" />
                </div>
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-14 pl-12 pr-12 bg-slate-50/50 border border-slate-100 focus:border-blue-600 focus:bg-white rounded-2xl outline-none text-sm font-semibold transition-all shadow-inner"
                  required
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="group w-full h-14 bg-slate-950 text-white font-black rounded-2xl hover:bg-blue-600 shadow-2xl shadow-slate-900/20 disabled:opacity-50 transition-all duration-500 active:scale-95 flex items-center justify-center space-x-3"
            >
              <span className="uppercase tracking-widest text-xs">
                {loading ? "Decrypting Session..." : copy.login_submit}
              </span>
              {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <div className="space-y-8">
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
              <div className="relative flex justify-center text-[9px] font-black uppercase tracking-[0.3em]"><span className="bg-white px-6 text-slate-300">{copy.login_or_continue}</span></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button 
                type="button"
                onClick={() => handleGoogleLogin()}
                className="h-14 border border-slate-100 bg-slate-50/50 rounded-2xl flex items-center justify-center space-x-3 hover:bg-white hover:border-slate-200 active:scale-95 transition-all shadow-sm group"
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5 group-hover:scale-110 transition-transform" alt="Google" />
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Google Account</span>
              </button>
              
              <button 
                type="button"
                className="h-14 border border-slate-100 bg-slate-50/50 rounded-2xl flex items-center justify-center space-x-3 hover:bg-white hover:border-slate-200 active:scale-95 transition-all shadow-sm group"
              >
                <UserCircle className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Digital ID</span>
              </button>
            </div>

            <div className="pt-4 text-center">
              <p className="text-sm font-semibold text-slate-500">
                {copy.login_new_user} 
                <Link to="/signup" className="ml-2 text-blue-600 font-black uppercase tracking-widest text-[10px] hover:text-blue-700 underline decoration-2 underline-offset-4 decoration-blue-600/20">
                  {copy.login_create_account}
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Floating Decorative Elements */}
        <div className="absolute top-10 right-10 w-24 h-24 bg-blue-50 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-10 left-10 w-32 h-32 bg-emerald-50 rounded-full blur-3xl -z-10"></div>
      </div>
    </div>
  );
};