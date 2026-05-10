import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, User, Mail, Smartphone, ArrowRight, Check, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useGoogleLogin } from '@react-oauth/google';

export const Signup: React.FC = () => {
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    phone: '', 
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<'CITIZEN' | 'ADMIN' | 'STAFF'>('CITIZEN');
  const [staffCategory, setStaffCategory] = useState<string>('Pothole');
  
  // OTP State
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, signup } = useStore();
  const navigate = useNavigate();
  
  const staffCategories = ['Pothole', 'Streetlight', 'Drainage', 'Garbage', 'Water Supply', 'Electricity', 'Road Damage', 'Other'];

  const handleGoogleSignup = useGoogleLogin({
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
          // Use signup() to register staff in local directory, login() for others
          if (data.data.user.role === 'STAFF') {
            signup(data.data.user.name || data.data.user.email.split('@')[0], data.data.user.email, '', data.data.user.role, data.data.user.staffCategory);
          } else {
            login(data.data.user.email, data.data.user.role);
          }
          navigate(data.data.user.role === 'CITIZEN' ? '/dashboard' : '/admin');
        } else {
          setError(data.message || "Google login failed.");
        }
      } catch (error) {
        setError("Failed to connect to backend.");
      } finally {
        setLoading(false);
      }
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError("Please fill in all required fields.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          role: role,
          staffCategory: role === 'STAFF' ? staffCategory : undefined
        }),
      });

      const data = await res.json();
      if (data.success) {
        setShowOtpScreen(true);
      } else {
        setError(data.message || "Signup failed.");
      }
    } catch (err) {
      setError("Server connection error.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          otp: otp
        }),
      });

      const data = await res.json();
      if (data.success) {
        localStorage.setItem('jansamadhan_token', data.token); // Save Token
        // Use signup() to register staff in local staff directory
        if (role === 'STAFF') {
          signup(formData.name, formData.email, formData.phone, role, staffCategory);
        } else {
          login(data.data.user.email, data.data.user.role);
        }
        navigate(role === 'CITIZEN' ? '/dashboard' : '/admin');
      } else {
        setError(data.message || "Invalid OTP.");
      }
    } catch (err) {
      setError("Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  if (showOtpScreen) {
    return (
      <div className="min-h-[calc(100vh-56px)] flex items-center justify-center p-5 sm:p-8 bg-slate-50">
        <div className="w-full max-w-sm sm:max-w-md bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-slate-100 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-blue-200">
               <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Verify Your Email</h1>
            <p className="text-slate-500 font-medium text-sm">Enter the code sent to <br/><span className="text-slate-900 font-bold">{formData.email}</span></p>
          </div>

          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div className="space-y-2">
              <input 
                type="text" 
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="OTP Code" 
                className="w-full h-14 text-center text-2xl font-black tracking-[0.5em] bg-slate-50 border border-transparent focus:border-blue-600 focus:bg-white rounded-xl outline-none transition-all"
                required
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-slate-900 text-white font-bold rounded-lg hover:bg-blue-600 transition-all shadow-lg flex items-center justify-center space-x-3 active:scale-[0.98] disabled:opacity-50 text-sm"
            >
              {loading ? <span>Verifying...</span> : (
                <>
                  <span>Activate Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {error && <p className="text-rose-500 text-center text-xs font-bold">{error}</p>}
          
          <button 
            onClick={() => setShowOtpScreen(false)}
            className="w-full text-center text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-56px)] flex flex-col lg:flex-row">
      <div className="flex-1 flex items-center justify-center p-5 sm:p-8 bg-white lg:order-2">
        <div className="w-full max-w-sm sm:max-w-md space-y-7">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Join Your Community</h1>
            <p className="text-slate-500 font-medium mt-1.5 text-sm">Help us build a smarter city by joining JanSamadhan.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg flex items-center space-x-3 text-rose-600">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p className="text-[11px] font-bold uppercase tracking-wider">{error}</p>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                  placeholder="Alex Johnson" 
                  className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-transparent focus:border-blue-600 focus:bg-white rounded-lg outline-none transition-all text-sm font-medium"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                  placeholder="name@example.com" 
                  className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-transparent focus:border-blue-600 focus:bg-white rounded-lg outline-none transition-all text-sm font-medium"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Mobile Number</label>
              <div className="relative">
                <Smartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="tel" 
                  value={formData.phone}
                  onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))}
                  placeholder="+91 00000 00000" 
                  className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-transparent focus:border-blue-600 focus:bg-white rounded-lg outline-none transition-all text-sm font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    value={formData.password}
                    onChange={(e) => setFormData(p => ({ ...p, password: e.target.value }))}
                    className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-transparent focus:border-blue-600 rounded-lg outline-none transition-all text-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Confirm</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type={showConfirmPassword ? 'text' : 'password'} 
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(p => ({ ...p, confirmPassword: e.target.value }))}
                    className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-transparent focus:border-blue-600 rounded-lg outline-none transition-all text-sm"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
               <div className="flex items-center gap-3 flex-wrap">
                <label className={`px-3 py-1.5 rounded-lg border cursor-pointer transition-all text-xs font-bold ${role === 'CITIZEN' ? 'border-blue-600 bg-blue-50' : 'border-slate-100'}`}>
                  <input type="radio" value="CITIZEN" checked={role === 'CITIZEN'} onChange={() => setRole('CITIZEN')} className="hidden" />
                  <span>Citizen</span>
                </label>
                <label className={`px-3 py-1.5 rounded-lg border cursor-pointer transition-all text-xs font-bold ${role === 'STAFF' ? 'border-blue-600 bg-blue-50' : 'border-slate-100'}`}>
                  <input type="radio" value="STAFF" checked={role === 'STAFF'} onChange={() => setRole('STAFF')} className="hidden" />
                  <span>Staff</span>
                </label>
                <label className={`px-3 py-1.5 rounded-lg border cursor-pointer transition-all text-xs font-bold ${role === 'ADMIN' ? 'border-blue-600 bg-blue-50' : 'border-slate-100'}`}>
                  <input type="radio" value="ADMIN" checked={role === 'ADMIN'} onChange={() => setRole('ADMIN')} className="hidden" />
                  <span>Admin</span>
                </label>
              </div>
            </div>

            {role === 'STAFF' && (
              <select
                value={staffCategory}
                onChange={(e) => setStaffCategory(e.target.value)}
                className="w-full h-11 px-4 bg-slate-50 border border-transparent focus:border-blue-600 rounded-lg outline-none transition-all text-sm"
              >
                {staffCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-slate-900 text-white font-bold rounded-lg hover:bg-blue-600 transition-all shadow-lg flex items-center justify-center space-x-3 active:scale-[0.98] disabled:opacity-50 text-sm"
            >
              {loading ? <span>Connecting...</span> : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="relative py-3">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
              <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest"><span className="bg-white px-4 text-slate-400">Or Join With</span></div>
            </div>

            <button 
              type="button"
              onClick={() => handleGoogleSignup()}
              className="w-full h-11 border border-slate-200 rounded-lg flex items-center justify-center space-x-3 hover:bg-slate-50 transition-all active:scale-95"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-4 h-4" alt="Google" />
              <span className="text-xs font-bold text-slate-600">Continue with Google</span>
            </button>
          </form>
          
          <p className="text-center text-sm font-medium text-slate-500">
            Already have an account? <Link to="/login" className="text-blue-600 font-bold hover:underline">Log in</Link>
          </p>
        </div>
      </div>

      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 p-12 xl:p-16 flex-col justify-between relative overflow-hidden lg:order-1">
        <div className="relative z-10">
          <Link to="/" className="flex items-center space-x-3 mb-14">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-xl font-black tracking-tight text-white uppercase">JanSamadhan</span>
          </Link>
          <div className="space-y-4 text-white">
            <h2 className="text-3xl xl:text-4xl font-black leading-tight">Be the change <br/>your city <span className="text-emerald-400">needs.</span></h2>
            <p className="text-slate-400 text-base">Connect directly with local authorities and solve community issues faster.</p>
          </div>
        </div>
        <div className="absolute -bottom-20 -left-20 w-[600px] h-[600px] bg-emerald-600/10 blur-[150px] rounded-full"></div>
      </div>
    </div>
  );
};