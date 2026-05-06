import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, User, Mail, Smartphone, ArrowRight, Check, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useStore } from '../store/useStore';

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
  
  const { signup } = useStore();
  const navigate = useNavigate();
  
  const staffCategories = ['Pothole', 'Streetlight', 'Drainage', 'Garbage', 'Water Supply', 'Electricity', 'Road Damage', 'Other'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError("Please fill in all required fields.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match. Please try again.");
      return;
    }

    signup(formData.name, formData.email, formData.phone, role as any, role === 'STAFF' ? staffCategory : undefined);
    if (role === 'ADMIN' || role === 'STAFF') {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col lg:flex-row">
      {/* Form Side */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white lg:order-2">
        <div className="w-full max-w-md space-y-10">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Join Your Community</h1>
            <p className="text-slate-500 font-medium mt-2">Help us build a smarter city by joining JanSamadhan.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center space-x-3 text-rose-600 animate-in fade-in zoom-in duration-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p className="text-[11px] font-bold uppercase tracking-wider">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                  placeholder="Alex Johnson" 
                  className="w-full h-14 pl-12 pr-4 bg-slate-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl outline-none transition-all font-medium"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                  placeholder="name@example.com" 
                  className="w-full h-14 pl-12 pr-4 bg-slate-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl outline-none transition-all font-medium"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Mobile Number</label>
              <div className="relative">
                <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="tel" 
                  value={formData.phone}
                  onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))}
                  placeholder="+91 00000 00000" 
                  className="w-full h-14 pl-12 pr-4 bg-slate-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl outline-none transition-all font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Create Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    value={formData.password}
                    onChange={(e) => setFormData(p => ({ ...p, password: e.target.value }))}
                    placeholder="••••••••" 
                    className="w-full h-14 pl-11 pr-11 bg-slate-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl outline-none transition-all font-medium text-sm"
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type={showConfirmPassword ? 'text' : 'password'} 
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(p => ({ ...p, confirmPassword: e.target.value }))}
                    placeholder="••••••••" 
                    className={`w-full h-14 pl-11 pr-11 bg-slate-50 border-2 rounded-2xl outline-none transition-all font-medium text-sm ${
                      formData.confirmPassword && formData.password !== formData.confirmPassword 
                      ? 'border-rose-100 focus:border-rose-300' 
                      : 'border-transparent focus:border-blue-600 focus:bg-white'
                    }`}
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-blue-600 rounded-lg flex items-center justify-center shrink-0 shadow-sm shadow-blue-200">
                   <ShieldCheck className="w-3.5 h-3.5 text-white" />
                </div>
                <p className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">
                  Choose your role below
                </p>
              </div>
              <div className="flex items-center gap-4 flex-wrap">
                <label className="inline-flex items-center gap-3 px-4 py-2 rounded-xl border-2 cursor-pointer transition-all" style={{
                  borderColor: role === 'CITIZEN' ? '#2563eb' : '#e2e8f0',
                  backgroundColor: role === 'CITIZEN' ? '#dbeafe' : '#ffffff'
                }}>
                  <input
                    type="radio"
                    name="role_signup"
                    value="CITIZEN"
                    checked={role === 'CITIZEN'}
                    onChange={() => setRole('CITIZEN')}
                    className="accent-blue-600 w-4 h-4"
                  />
                  <span className="text-sm font-semibold text-slate-700">Citizen</span>
                </label>
                <label className="inline-flex items-center gap-3 px-4 py-2 rounded-xl border-2 cursor-pointer transition-all" style={{
                  borderColor: role === 'STAFF' ? '#2563eb' : '#e2e8f0',
                  backgroundColor: role === 'STAFF' ? '#dbeafe' : '#ffffff'
                }}>
                  <input
                    type="radio"
                    name="role_signup"
                    value="STAFF"
                    checked={role === 'STAFF'}
                    onChange={() => setRole('STAFF')}
                    className="accent-blue-600 w-4 h-4"
                  />
                  <span className="text-sm font-semibold text-slate-700">Staff</span>
                </label>
                <label className="inline-flex items-center gap-3 px-4 py-2 rounded-xl border-2 cursor-pointer transition-all" style={{
                  borderColor: role === 'ADMIN' ? '#2563eb' : '#e2e8f0',
                  backgroundColor: role === 'ADMIN' ? '#dbeafe' : '#ffffff'
                }}>
                  <input
                    type="radio"
                    name="role_signup"
                    value="ADMIN"
                    checked={role === 'ADMIN'}
                    onChange={() => setRole('ADMIN')}
                    className="accent-blue-600 w-4 h-4"
                  />
                  <span className="text-sm font-semibold text-slate-700">Admin</span>
                </label>
              </div>
            </div>

            {role === 'STAFF' && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Work Category</label>
                <select
                  value={staffCategory}
                  onChange={(e) => setStaffCategory(e.target.value)}
                  className="w-full h-14 px-4 bg-slate-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl outline-none transition-all font-medium"
                >
                  {staffCategories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-500">You will appear in this category's staff directory on the Ops Map.</p>
              </div>
            )}

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-start space-x-3">
              <div className="w-5 h-5 bg-blue-600 rounded-lg flex items-center justify-center shrink-0 mt-0.5 shadow-sm shadow-blue-200">
                 <Check className="w-3.5 h-3.5 text-white" />
              </div>
              <p className="text-[10px] font-medium text-slate-500 leading-normal">
                I agree to the <a href="#" className="text-blue-600 font-bold">Privacy Policy</a>. JanSamadhan will only use your data to verify reports and send operational alerts.
              </p>
            </div>

            <button 
              type="submit"
              className="w-full h-14 bg-slate-900 text-white font-black rounded-2xl hover:bg-blue-600 transition-all shadow-xl flex items-center justify-center space-x-3 active:scale-[0.98]"
            >
              <span>Create Secure Account</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
          
          <p className="text-center text-sm font-medium text-slate-500">
            Already have an account? <Link to="/login" className="text-blue-600 font-black hover:underline">Log in</Link>
          </p>
        </div>
      </div>

      {/* Visual Side */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 p-20 flex-col justify-between relative overflow-hidden lg:order-1">
        <div className="relative z-10">
          <Link to="/" className="flex items-center space-x-3 mb-20">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <span className="text-2xl font-black tracking-tight text-white uppercase">JanSamadhan</span>
          </Link>
          <div className="space-y-6">
            <h2 className="text-5xl font-black text-white leading-tight">Be the change <br/>your city <span className="text-emerald-400">needs.</span></h2>
            <div className="space-y-4 pt-4">
               {[
                 'Fast 30-second issue reporting',
                 'Real-time status tracking via Dashboard',
                 'AI-verified community safety alerts',
                 'Connect directly with local authorities'
               ].map((item, idx) => (
                 <div key={idx} className="flex items-center space-x-3">
                    <div className="w-5 h-5 bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-500/30">
                       <Check className="w-3 h-3 text-blue-400" />
                    </div>
                    <span className="text-slate-300 font-medium">{item}</span>
                 </div>
               ))}
            </div>
          </div>
        </div>

        <div className="absolute -bottom-20 -left-20 w-[600px] h-[600px] bg-emerald-600/10 blur-[150px] rounded-full"></div>
      </div>
    </div>
  );
};