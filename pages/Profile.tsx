
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Camera, 
  Globe, 
  LogOut, 
  Check, 
  Settings,
  Mail,
  Smartphone,
  BadgeCheck,
  Lock,
  ArrowLeft
} from 'lucide-react';
import { useStore } from '../store/useStore';

export const Profile: React.FC = () => {
  const { currentUser, setCurrentUser, updateUser } = useStore();
  const navigate = useNavigate();
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(currentUser?.name || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Login Required</h2>
          <button onClick={() => navigate('/login')} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-xl shadow-lg">Login</button>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    setCurrentUser(null);
    navigate('/');
  };

  const handleUpdateName = () => {
    if (newName.trim() && newName !== currentUser.name) updateUser({ name: newName });
    setIsEditingName(false);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => updateUser({ avatar: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 no-scrollbar">
      <div className="h-48 bg-slate-900 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
        <div className="max-w-4xl mx-auto px-6 h-full flex items-center">
           <button onClick={() => navigate(-1)} className="p-2 bg-white/10 text-white hover:bg-white/20 rounded-xl transition-all">
             <ArrowLeft className="w-5 h-5" />
           </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 -mt-20 relative z-10">
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
            <div className="flex flex-col md:flex-row md:items-center gap-8">
              <div className="relative shrink-0">
                <div className="w-32 h-32 rounded-[2.5rem] bg-indigo-50 border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
                  {currentUser.avatar ? <img src={currentUser.avatar} className="w-full h-full object-cover" /> : <User className="w-12 h-12 text-indigo-400" />}
                </div>
                <button onClick={() => fileInputRef.current?.click()} className="absolute -bottom-2 -right-2 w-10 h-10 bg-indigo-600 text-white rounded-2xl border-4 border-white shadow-lg flex items-center justify-center hover:bg-indigo-700 transition-all active:scale-90">
                  <Camera className="w-5 h-5" />
                </button>
                <input ref={fileInputRef} type="file" hidden accept="image/*" onChange={handleAvatarChange} />
              </div>

              <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">Verified Identity</span>
                      <BadgeCheck className="w-3.5 h-3.5 text-indigo-600" />
                    </div>
                    {isEditingName ? (
                      <div className="flex items-center space-x-2">
                        <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} className="text-2xl font-black text-slate-900 border-b-2 border-indigo-600 outline-none w-full" autoFocus onBlur={handleUpdateName} />
                        <button onClick={handleUpdateName} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"><Check className="w-5 h-5" /></button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-3 group">
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">{currentUser.name}</h1>
                        <button onClick={() => setIsEditingName(true)} className="p-1.5 text-slate-300 hover:text-indigo-600 transition-all opacity-0 group-hover:opacity-100"><Settings className="w-4 h-4" /></button>
                      </div>
                    )}
                    <p className="text-slate-500 font-medium text-sm">{currentUser.email}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 space-y-4">
               <div className="flex items-center space-x-3 pb-2 border-b border-slate-50">
                  <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                    <Globe className="w-4 h-4" />
                  </div>
                  <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Contact Info</h3>
               </div>
               <div className="space-y-4">
                  <div className="flex items-start space-x-3 p-3 bg-slate-50 rounded-2xl">
                    <Mail className="w-4 h-4 text-slate-400 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Email</p>
                      <p className="text-xs font-bold text-slate-800 truncate">{currentUser.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 bg-slate-50 rounded-2xl">
                    <Smartphone className="w-4 h-4 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Phone</p>
                      <p className="text-xs font-bold text-slate-800">{currentUser.phone || 'Not Provided'}</p>
                    </div>
                  </div>
               </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 space-y-6">
               <div className="flex items-center justify-between">
                 <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Account Security</h3>
                 <div className="flex items-center space-x-2 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                   <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                   <span>Secure</span>
                 </div>
               </div>
               <button onClick={handleLogout} className="w-full py-5 border-2 border-rose-100 text-rose-600 font-black rounded-2xl text-[11px] uppercase tracking-[0.3em] hover:bg-rose-50 transition-all flex items-center justify-center space-x-3">
                 <LogOut className="w-4 h-4" />
                 <span>Log Out</span>
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
