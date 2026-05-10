
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Camera, 
  LogOut, 
  Check, 
  Mail,
  Smartphone,
  BadgeCheck,
  Pencil,
  Shield,
  ChevronRight
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
          <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <User className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900">Login Required</h2>
          <p className="text-sm text-slate-500">Please sign in to view your profile</p>
          <button onClick={() => navigate('/login')} className="px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
            Sign In
          </button>
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

  const roleBadge = {
    CITIZEN: { label: 'Citizen', color: 'bg-sky-50 text-sky-700' },
    ADMIN: { label: 'Admin', color: 'bg-amber-50 text-amber-700' },
    STAFF: { label: 'Staff', color: 'bg-emerald-50 text-emerald-700' },
  }[currentUser.role] || { label: 'User', color: 'bg-slate-50 text-slate-600' };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-50 no-scrollbar">
      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">

        {/* Avatar + Identity Card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Subtle gradient strip */}
          <div className="h-16 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.15),transparent)]" />
          </div>

          <div className="px-5 pb-5 -mt-8">
            {/* Avatar */}
            <div className="relative inline-block">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white border-[3px] border-white shadow-md flex items-center justify-center overflow-hidden">
                {currentUser.avatar 
                  ? <img src={currentUser.avatar} className="w-full h-full object-cover" alt="Avatar" /> 
                  : <User className="w-7 h-7 sm:w-8 sm:h-8 text-indigo-400" />
                }
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()} 
                className="absolute -bottom-1 -right-1 w-7 h-7 bg-indigo-600 text-white rounded-lg border-2 border-white shadow-sm flex items-center justify-center hover:bg-indigo-700 transition-all active:scale-90"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
              <input ref={fileInputRef} type="file" hidden accept="image/*" onChange={handleAvatarChange} />
            </div>

            {/* Name + Email */}
            <div className="mt-3 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                {isEditingName ? (
                  <div className="flex items-center gap-2 w-full">
                    <input 
                      type="text" 
                      value={newName} 
                      onChange={(e) => setNewName(e.target.value)} 
                      className="text-lg font-bold text-slate-900 border-b-2 border-indigo-500 outline-none bg-transparent flex-1 min-w-0 py-0.5" 
                      autoFocus 
                      onBlur={handleUpdateName}
                      onKeyDown={(e) => e.key === 'Enter' && handleUpdateName()}
                    />
                    <button onClick={handleUpdateName} className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-md flex-shrink-0">
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 group">
                    <h1 className="text-lg sm:text-xl font-bold text-slate-900">{currentUser.name}</h1>
                    <button 
                      onClick={() => setIsEditingName(true)} 
                      className="p-1 text-slate-300 hover:text-indigo-600 transition-colors opacity-0 group-hover:opacity-100 sm:opacity-0 active:opacity-100"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
              <p className="text-sm text-slate-500 truncate">{currentUser.email}</p>
              <div className="flex items-center gap-2 pt-1">
                <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${roleBadge.color}`}>
                  {roleBadge.label}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                  <BadgeCheck className="w-3 h-3" />
                  Verified
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Details */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="px-5 py-3.5 border-b border-slate-50">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact Details</h3>
          </div>
          <div className="divide-y divide-slate-50">
            <div className="px-5 py-3 flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Mail className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Email</p>
                <p className="text-sm font-medium text-slate-800 truncate">{currentUser.email}</p>
              </div>
            </div>
            <div className="px-5 py-3 flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Smartphone className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Phone</p>
                <p className="text-sm font-medium text-slate-800">{currentUser.phone || 'Not provided'}</p>
              </div>
            </div>
            {currentUser.role === 'STAFF' && currentUser.staffCategory && (
              <div className="px-5 py-3 flex items-center gap-3">
                <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-4 h-4 text-amber-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Department</p>
                  <p className="text-sm font-medium text-slate-800">{currentUser.staffCategory}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Account Security */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="px-5 py-3.5 border-b border-slate-50 flex items-center justify-between">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Account</h3>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              Secure
            </span>
          </div>
          <div className="p-3">
            <button 
              onClick={handleLogout} 
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-semibold">Log Out</span>
              </div>
              <ChevronRight className="w-4 h-4 text-rose-300 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* Bottom spacing for mobile nav */}
        <div className="h-4" />
      </div>
    </div>
  );
};
