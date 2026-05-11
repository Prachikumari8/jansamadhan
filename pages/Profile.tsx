
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
  Briefcase,
  Calendar,
  Hash
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
    CITIZEN: { label: 'Citizen', gradient: 'from-sky-500 to-cyan-500' },
    ADMIN: { label: 'Admin', gradient: 'from-amber-500 to-orange-500' },
    STAFF: { label: 'Staff', gradient: 'from-emerald-500 to-teal-500' },
  }[currentUser.role] || { label: 'User', gradient: 'from-slate-500 to-slate-600' };

  const initials = currentUser.name
    ? currentUser.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const joinDate = currentUser.joinedAt
    ? new Date(currentUser.joinedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  // Detail rows data
  const details = [
    { icon: Mail, iconColor: 'text-indigo-500', iconBg: 'bg-indigo-500/10', label: 'Email Address', value: currentUser.email },
    { icon: Smartphone, iconColor: 'text-emerald-500', iconBg: 'bg-emerald-500/10', label: 'Phone Number', value: currentUser.phone || 'Not provided' },
    { icon: Shield, iconColor: 'text-violet-500', iconBg: 'bg-violet-500/10', label: 'Account Role', value: roleBadge.label },
    { icon: Calendar, iconColor: 'text-blue-500', iconBg: 'bg-blue-500/10', label: 'Member Since', value: joinDate },
    { icon: Hash, iconColor: 'text-slate-400', iconBg: 'bg-slate-500/10', label: 'User ID', value: currentUser.id },
    ...(currentUser.role === 'STAFF' && currentUser.staffCategory
      ? [{ icon: Briefcase, iconColor: 'text-amber-500', iconBg: 'bg-amber-500/10', label: 'Department', value: currentUser.staffCategory }]
      : []),
  ];

  return (
    <div
      className="no-scrollbar"
      style={{
        height: 'calc(100vh - 64px)',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 40%, #ede9fe 100%)',
      }}
    >
      <div className="h-full flex flex-col items-center justify-center px-4">

        {/* ─── Avatar ─── */}
        <div className="relative mb-6 group">
          <div
            className="w-32 h-32 sm:w-36 sm:h-36 rounded-full p-[4px] shadow-xl"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7)' }}
          >
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
              {currentUser.avatar
                ? <img src={currentUser.avatar} className="w-full h-full object-cover" alt="Avatar" />
                : (
                  <span
                    className="text-4xl sm:text-5xl font-extrabold"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                  >
                    {initials}
                  </span>
                )
              }
            </div>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-1 right-1 w-10 h-10 bg-indigo-600 text-white rounded-full border-[3px] border-white shadow-lg flex items-center justify-center hover:bg-indigo-700 transition-all active:scale-90 hover:scale-110"
          >
            <Camera className="w-4.5 h-4.5" />
          </button>
          <input ref={fileInputRef} type="file" hidden accept="image/*" onChange={handleAvatarChange} />
        </div>

        {/* ─── Name ─── */}
        <div className="flex items-center gap-2 mb-1">
          {isEditingName ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="text-2xl font-bold text-slate-900 border-b-2 border-indigo-500 outline-none bg-transparent text-center py-0.5 max-w-[240px]"
                autoFocus
                onBlur={handleUpdateName}
                onKeyDown={(e) => e.key === 'Enter' && handleUpdateName()}
              />
              <button onClick={handleUpdateName} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-full">
                <Check className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setIsEditingName(true)}>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{currentUser.name}</h1>
              <button className="p-1.5 text-slate-300 hover:text-indigo-600 transition-colors opacity-0 group-hover:opacity-100">
                <Pencil className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* ─── Email subtitle ─── */}
        <p className="text-sm text-slate-400 font-medium mb-3">{currentUser.email}</p>

        {/* ─── Badges ─── */}
        <div className="flex items-center gap-2 mb-8">
          <span
            className="inline-flex items-center text-xs font-bold text-white px-3.5 py-1.5 rounded-full shadow-sm"
            style={{
              background:
                currentUser.role === 'ADMIN' ? 'linear-gradient(135deg, #f59e0b, #f97316)'
                  : currentUser.role === 'STAFF' ? 'linear-gradient(135deg, #10b981, #14b8a6)'
                  : 'linear-gradient(135deg, #0ea5e9, #06b6d4)'
            }}
          >
            {roleBadge.label}
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 px-3.5 py-1.5 rounded-full border border-indigo-100">
            <BadgeCheck className="w-3.5 h-3.5" />
            Verified
          </span>
        </div>

        {/* ─── Details Grid ─── */}
        <div className="w-full max-w-md">
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.7)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(226,232,240,0.6)',
            }}
          >
            {details.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-white/60"
                style={idx < details.length - 1 ? { borderBottom: '1px solid rgba(241,245,249,0.8)' } : {}}
              >
                <div className={`w-9 h-9 rounded-xl ${item.iconBg} flex items-center justify-center flex-shrink-0`}>
                  <item.icon className={`w-[17px] h-[17px] ${item.iconColor}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">{item.label}</p>
                  <p className="text-[13px] font-semibold text-slate-700 truncate mt-0.5">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ─── Logout ─── */}
          <button
            onClick={handleLogout}
            className="mt-4 w-full flex items-center justify-center gap-2.5 py-3 rounded-2xl text-rose-500 font-semibold text-sm transition-all hover:bg-rose-50 active:scale-[0.98]"
            style={{
              background: 'rgba(255,255,255,0.5)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(244,63,94,0.15)',
            }}
          >
            <LogOut className="w-4 h-4" />
            Log Out
          </button>
        </div>

      </div>
    </div>
  );
};
