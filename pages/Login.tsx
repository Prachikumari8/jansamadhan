import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useStore } from '../store/useStore';
import { languages, translations } from '../services/i18n.ts';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'CITIZEN' | 'ADMIN' | 'STAFF'>('CITIZEN');
  const [showPassword, setShowPassword] = useState(false);
  const { login, currentLanguage, setLanguage } = useStore();
  const copy = translations[currentLanguage];
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      login(email, role as any);
      if (role === 'ADMIN' || role === 'STAFF') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col lg:flex-row">
      {/* Visual Side */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 p-20 flex-col justify-between relative overflow-hidden">
        <div className="relative z-10">
          <Link to="/" className="flex items-center space-x-3 mb-20">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <span className="text-2xl font-black tracking-tight text-white uppercase">JanSamadhan</span>
          </Link>
          <div className="space-y-6">
            <h2 className="text-5xl font-black text-white leading-tight">{copy.login_hero_title}</h2>
            <p className="text-slate-400 text-lg max-w-md leading-relaxed">
              {copy.login_hero_subtitle}
            </p>
          </div>
        </div>
        
        <div className="relative z-10 bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-3xl max-w-sm">
           <div className="flex items-center space-x-3 mb-4">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span className="text-xs font-bold text-white uppercase tracking-widest">Admin Access</span>
           </div>
           <p className="text-xs text-slate-400 leading-relaxed">
             {copy.login_role_help}
           </p>
          <div className="mt-3">
            <label className="text-[10px] font-black text-white uppercase tracking-widest">{copy.language_label}</label>
            <div className="mt-2 mb-4">
              <select
                value={currentLanguage}
                onChange={(e) => setLanguage(e.target.value as typeof currentLanguage)}
                className="w-full h-11 rounded-xl bg-white/10 border border-white/10 text-white px-3 text-sm outline-none"
              >
                {languages.map((language) => (
                  <option key={language.code} value={language.code} className="text-slate-900">
                    {language.name}
                  </option>
                ))}
              </select>
            </div>
            <label className="text-[10px] font-black text-white uppercase tracking-widest">Sign in as</label>
            <div className="flex items-center gap-4 mt-2">
              <label className="inline-flex items-center gap-2 text-sm text-white">
                <input
                  type="radio"
                  name="role"
                  value="CITIZEN"
                  checked={role === 'CITIZEN'}
                  onChange={() => setRole('CITIZEN')}
                  className="accent-indigo-400 bg-white/5 border-white/20"
                />
                <span className="ml-1">Citizen</span>
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-white">
                <input
                  type="radio"
                  name="role"
                  value="STAFF"
                  checked={role === 'STAFF'}
                  onChange={() => setRole('STAFF')}
                  className="accent-indigo-400 bg-white/5 border-white/20"
                />
                <span className="ml-1">Staff</span>
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-white">
                <input
                  type="radio"
                  name="role"
                  value="ADMIN"
                  checked={role === 'ADMIN'}
                  onChange={() => setRole('ADMIN')}
                  className="accent-indigo-400 bg-white/5 border-white/20"
                />
                <span className="ml-1">Admin</span>
              </label>
            </div>
          </div>
        </div>

        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full"></div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-10">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{copy.login_title}</h1>
            <p className="text-slate-500 font-medium mt-2">{copy.login_subtitle}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com" 
                  className="w-full h-14 pl-12 pr-4 bg-slate-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl outline-none transition-all font-medium"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Password</label>
                <Link to="/forgot-password" className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">Forgot?</Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full h-14 pl-12 pr-12 bg-slate-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl outline-none transition-all font-medium"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full h-14 bg-slate-900 text-white font-black rounded-2xl hover:bg-blue-600 transition-all shadow-xl flex items-center justify-center space-x-3 active:scale-[0.98]"
            >
              <span>{copy.login_submit}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <div className="space-y-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
              <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest"><span className="bg-white px-4 text-slate-400">{copy.login_or_continue}</span></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button className="h-14 border-2 border-slate-100 rounded-2xl flex items-center justify-center space-x-3 hover:bg-slate-50 transition-all active:scale-95">
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                <span className="text-xs font-black uppercase tracking-tight text-slate-600">Google</span>
              </button>
              <button className="h-14 border-2 border-slate-100 rounded-2xl flex items-center justify-center space-x-3 hover:bg-slate-50 transition-all active:scale-95">
                <img src="https://www.svgrepo.com/show/442938/apple-logo.svg" className="w-5 h-5" alt="Apple" />
                <span className="text-xs font-black uppercase tracking-tight text-slate-600">Apple</span>
              </button>
            </div>

            <p className="text-center text-sm font-medium text-slate-500">
              {copy.login_new_user} <Link to="/signup" className="text-blue-600 font-black hover:underline">{copy.login_create_account}</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};