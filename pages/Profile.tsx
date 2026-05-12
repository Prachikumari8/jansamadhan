
import React, { useState, useRef, useMemo } from 'react';
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
  ChevronRight,
  Calendar,
  MapPin,
  Award,
  Activity,
  Clock,
  Briefcase,
  ImageIcon
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { IssueStatus } from '../types';

export const Profile: React.FC = () => {
  const { currentUser, setCurrentUser, updateUser, issues } = useStore();
  const navigate = useNavigate();
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(currentUser?.name || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate stats
  const stats = useMemo(() => {
    if (!currentUser) return { total: 0, resolved: 0, pending: 0, reputation: 0, assignedTotal: 0, assignedResolved: 0 };
    
    // Reported issues (Citizen/All)
    const userIssues = issues.filter(i => i.reportedBy === currentUser.name || i.reportedBy === currentUser.email);
    const resolved = userIssues.filter(i => i.status === IssueStatus.RESOLVED).length;
    
    // Assigned issues (Staff)
    const assignedIssues = issues.filter(i => i.assignedStaff?.email === currentUser.email);
    const assignedResolved = assignedIssues.filter(i => i.status === IssueStatus.RESOLVED).length;
    
    return {
      total: userIssues.length,
      resolved,
      pending: userIssues.length - resolved,
      reputation: (userIssues.length * 10) + (resolved * 50) + (assignedResolved * 100),
      assignedTotal: assignedIssues.length,
      assignedResolved
    };
  }, [issues, currentUser]);

  if (!currentUser) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-6 max-w-sm px-6">
          <div className="w-20 h-20 bg-white rounded-3xl shadow-xl shadow-indigo-100 flex items-center justify-center mx-auto text-indigo-500">
            <User className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Access Denied</h2>
            <p className="text-slate-500">Your profile details are private. Please authenticate to continue.</p>
          </div>
          <button 
            onClick={() => navigate('/login')} 
            className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all active:scale-[0.98]"
          >
            Sign In to Account
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

  const roleInfo = {
    CITIZEN: { label: 'Citizen', color: 'text-sky-600', bg: 'bg-sky-50', icon: User },
    ADMIN: { label: 'Administrator', color: 'text-amber-600', bg: 'bg-amber-50', icon: Shield },
    STAFF: { label: 'Field Staff', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: Briefcase },
  }[currentUser.role] || { label: 'User', color: 'text-slate-600', bg: 'bg-slate-50', icon: User };

  const joinDate = currentUser.joinedAt ? new Date(currentUser.joinedAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  }) : 'May 2024';

  return (
    <div className="h-[calc(100vh-3.5rem)] w-full bg-white overflow-hidden flex flex-col lg:flex-row">
      {/* Sidebar - Profile Overview (Responsive: Top on Mobile, Left on Desktop) */}
      <div className="w-full lg:w-[320px] xl:w-[380px] bg-slate-950 flex flex-col shrink-0 lg:h-full border-b lg:border-b-0 lg:border-r border-white/5">
        <div className="flex-1 flex flex-row lg:flex-col items-center justify-center lg:justify-center p-4 sm:p-6 lg:p-8 text-center gap-4 sm:gap-6 lg:gap-0">
          {/* Avatar - Scaled for screens */}
          <div className="relative mb-0 lg:mb-8 group shrink-0">
            <div className="w-20 h-20 sm:w-28 sm:h-28 lg:w-40 lg:h-40 rounded-[20px] sm:rounded-[30px] lg:rounded-[40px] bg-slate-900 shadow-2xl shadow-black/50 p-1 lg:p-2 transform transition-transform duration-500 lg:group-hover:scale-105 border border-white/10">
              <div className="w-full h-full rounded-[16px] sm:rounded-[24px] lg:rounded-[32px] bg-slate-800 flex items-center justify-center overflow-hidden">
                {currentUser.avatar 
                  ? <img src={currentUser.avatar} className="w-full h-full object-cover" alt="Avatar" /> 
                  : <User className="w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 text-slate-600" />
                }
              </div>
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()} 
              className="absolute -bottom-1 -right-1 lg:bottom-2 lg:right-2 w-7 h-7 lg:w-10 lg:h-10 bg-white text-slate-950 rounded-lg lg:rounded-2xl shadow-xl flex items-center justify-center hover:bg-indigo-500 hover:text-white transition-all active:scale-90 z-10"
            >
              <Camera className="w-3 h-3 lg:w-4 lg:h-4" />
            </button>
            <input ref={fileInputRef} type="file" hidden accept="image/*" onChange={handleAvatarChange} />
          </div>

          {/* Identity & Badges */}
          <div className="space-y-1 lg:space-y-3 flex-1 lg:flex-none text-left lg:text-center min-w-0">
            <div className="flex items-center justify-start lg:justify-center gap-2">
              {isEditingName ? (
                <div className="flex items-center gap-2 w-full max-w-[200px] bg-slate-900 rounded-lg px-2 py-1 border border-slate-700">
                  <input 
                    type="text" 
                    value={newName} 
                    onChange={(e) => setNewName(e.target.value)} 
                    className="text-sm sm:text-base font-bold text-white outline-none bg-transparent w-full" 
                    autoFocus 
                    onBlur={handleUpdateName}
                    onKeyDown={(e) => e.key === 'Enter' && handleUpdateName()}
                  />
                </div>
              ) : (
                <div className="group relative flex items-center gap-2 max-w-full">
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-extrabold text-white tracking-tight truncate">{currentUser.name}</h1>
                  <button 
                    onClick={() => setIsEditingName(true)} 
                    className="p-1 text-slate-500 hover:text-indigo-400 transition-colors hidden lg:block lg:opacity-0 lg:group-hover:opacity-100"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
            <p className="text-[10px] sm:text-xs lg:text-sm text-slate-400 font-medium truncate">{currentUser.email}</p>
            
            <div className="pt-1 lg:pt-2 flex flex-wrap justify-start lg:justify-center gap-1.5 sm:gap-2">
              <span className={`inline-flex items-center gap-1 lg:gap-1.5 px-2 lg:px-3 py-0.5 lg:py-1 rounded-full text-[8px] lg:text-[10px] font-bold uppercase tracking-wider border border-white/5 ${roleInfo.bg} ${roleInfo.color}`}>
                <roleInfo.icon className="w-2.5 h-2.5 lg:w-3 lg:h-3" />
                {roleInfo.label}
              </span>
              <span className="inline-flex items-center gap-1 lg:gap-1.5 px-2 lg:px-3 py-0.5 lg:py-1 rounded-full text-[8px] lg:text-[10px] font-bold uppercase tracking-wider bg-indigo-600 text-white border border-indigo-400/20">
                <BadgeCheck className="w-2.5 h-2.5 lg:w-3 lg:h-3" />
                Verified
              </span>
            </div>
          </div>

          {/* Quick Stats - Mobile Horizontal, Desktop Stacked */}
          <div className="hidden sm:flex lg:mt-10 w-auto lg:w-full lg:pt-8 lg:border-t lg:border-white/5 items-center justify-center gap-4 lg:gap-10">
            <div className="text-center">
              <p className="text-sm sm:text-lg lg:text-xl font-black text-white">{stats.reputation}</p>
              <p className="text-[7px] lg:text-[9px] font-bold text-slate-500 uppercase tracking-widest">Reputation</p>
            </div>
            <div className="h-4 lg:h-6 w-px bg-white/5" />
            <div className="text-center">
              <p className="text-sm sm:text-lg lg:text-xl font-black text-white">{stats.total}</p>
              <p className="text-[7px] lg:text-[9px] font-bold text-slate-500 uppercase tracking-widest">Reports</p>
            </div>
          </div>
        </div>

        {/* Logout - Desktop Only (Bottom) / Mobile Integrated in header */}
        <div className="hidden lg:block p-6 border-t border-white/5">
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-rose-500 text-sm font-bold hover:bg-rose-500/10 transition-all group"
          >
            <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content Area - Scrollable internally */}
      <div className="flex-1 h-full overflow-hidden flex flex-col p-4 sm:p-6 lg:p-10 xl:p-12">
        <header className="mb-4 lg:mb-10 flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">Account Details</h2>
            <p className="text-[10px] sm:text-xs lg:text-sm text-slate-400 font-medium mt-0.5">Manage your personal information and track your civic impact.</p>
          </div>
          <button onClick={handleLogout} className="lg:hidden p-2 text-rose-500 hover:bg-rose-50 rounded-lg">
            <LogOut className="w-5 h-5" />
          </button>
        </header>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 xl:gap-12 min-h-0 overflow-y-auto lg:overflow-hidden no-scrollbar pb-10 lg:pb-0">
          {/* Left Column: Information */}
          <div className="space-y-6 lg:space-y-10 lg:overflow-y-auto no-scrollbar">
            <section className="space-y-4 lg:space-y-6">
              <div className="flex items-center gap-3 lg:gap-4">
                <div className="w-7 h-7 lg:w-8 lg:h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                  <User className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-indigo-600" />
                </div>
                <h3 className="text-sm lg:text-base font-bold text-slate-800">Personal Information</h3>
              </div>
              
              <div className="grid gap-4 lg:gap-6 pl-10 lg:pl-12">
                <div className="flex flex-col">
                  <span className="text-[8px] lg:text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Full Name</span>
                  <span className="text-sm lg:text-base font-semibold text-slate-700">{currentUser.name}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] lg:text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Email Address</span>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3 h-3 lg:w-3.5 lg:h-3.5 text-slate-300" />
                    <span className="text-sm lg:text-base font-semibold text-slate-700 truncate">{currentUser.email}</span>
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] lg:text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Mobile Number</span>
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-3 h-3 lg:w-3.5 lg:h-3.5 text-slate-300" />
                    <span className="text-sm lg:text-base font-semibold text-slate-700">{currentUser.phone || '+91 Not provided'}</span>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-4 lg:space-y-6">
              <div className="flex items-center gap-3 lg:gap-4">
                <div className="w-7 h-7 lg:w-8 lg:h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                  <MapPin className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-emerald-600" />
                </div>
                <h3 className="text-sm lg:text-base font-bold text-slate-800">Localization</h3>
              </div>
              <div className="grid gap-4 lg:gap-6 pl-10 lg:pl-12">
                <div className="flex flex-col">
                  <span className="text-[8px] lg:text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Primary Location</span>
                  <span className="text-sm lg:text-base font-semibold text-slate-700">
                    {currentUser.role === 'STAFF' ? `${currentUser.staffCity}, ${currentUser.staffState}` : 
                     currentUser.role === 'ADMIN' ? `${currentUser.adminLocation?.state}, India` : 
                     'Andhra Pradesh, India'}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] lg:text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Active Since</span>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3 lg:w-3.5 lg:h-3.5 text-slate-300" />
                    <span className="text-sm lg:text-base font-semibold text-slate-700">{joinDate}</span>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Platform Activity / Working Details */}
          <div className="space-y-6 lg:space-y-10 lg:overflow-y-auto no-scrollbar">
            {(currentUser.role === 'STAFF' || currentUser.role === 'ADMIN') && (
              <section className="space-y-4 lg:space-y-6 animate-in fade-in slide-in-from-right-2 duration-500">
                <div className="flex items-center gap-3 lg:gap-4">
                  <div className="w-7 h-7 lg:w-8 lg:h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Briefcase className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-blue-600" />
                  </div>
                  <h3 className="text-sm lg:text-base font-bold text-slate-800">
                    {currentUser.role === 'STAFF' ? 'Working Area Details' : 'Administrative Jurisdiction'}
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 pl-10 lg:pl-12">
                  {currentUser.role === 'STAFF' ? (
                    <>
                      <div className="flex flex-col">
                        <span className="text-[8px] lg:text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Work Category</span>
                        <span className="text-xs lg:text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded w-fit">{currentUser.staffCategory || 'General'}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[8px] lg:text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Assigned Area</span>
                        <span className="text-xs lg:text-sm font-semibold text-slate-700">{currentUser.staffArea || 'Main Division'}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[8px] lg:text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Pincode</span>
                        <span className="text-xs lg:text-sm font-semibold text-slate-700 tracking-wider">{currentUser.staffPincode || '522502'}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[8px] lg:text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">District</span>
                        <span className="text-xs lg:text-sm font-semibold text-slate-700">{currentUser.staffDistrict || 'Guntur'}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex flex-col">
                        <span className="text-[8px] lg:text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Governing State</span>
                        <span className="text-xs lg:text-sm font-semibold text-slate-700">{currentUser.adminLocation?.state}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[8px] lg:text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Target District</span>
                        <span className="text-xs lg:text-sm font-semibold text-slate-700">{currentUser.adminLocation?.district}</span>
                      </div>
                      <div className="flex flex-col col-span-2">
                        <span className="text-[8px] lg:text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Managed City</span>
                        <span className="text-xs lg:text-sm font-semibold text-slate-700">{currentUser.adminLocation?.city}</span>
                      </div>
                    </>
                  )}
                </div>
              </section>
            )}

            {currentUser.role === 'STAFF' && (
              <section className="space-y-4 lg:space-y-6 animate-in fade-in slide-in-from-right-2 duration-700 delay-150 border-t border-slate-100 pt-6 mt-6">
                <div className="flex items-center gap-3 lg:gap-4">
                  <div className="w-7 h-7 lg:w-8 lg:h-8 bg-amber-50 rounded-lg flex items-center justify-center">
                    <Activity className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-amber-600" />
                  </div>
                  <h3 className="text-sm lg:text-base font-bold text-slate-800">Performance Metrics</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 pl-10 lg:pl-12">
                   <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/50 space-y-1">
                      <p className="text-xl lg:text-2xl font-black text-emerald-700">{stats.assignedResolved}</p>
                      <p className="text-[8px] lg:text-[9px] font-bold text-emerald-600/70 uppercase tracking-widest">Tasks Completed</p>
                   </div>
                   <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50 space-y-1">
                      <p className="text-xl lg:text-2xl font-black text-blue-700">{stats.assignedTotal - stats.assignedResolved}</p>
                      <p className="text-[8px] lg:text-[9px] font-bold text-blue-600/70 uppercase tracking-widest">Active Workload</p>
                   </div>
                </div>
              </section>
            )}

            {currentUser.role === 'CITIZEN' && (
              <div className="space-y-6 lg:space-y-10 lg:overflow-y-auto no-scrollbar">
                <section className="space-y-4 lg:space-y-6">
                  <div className="flex items-center gap-3 lg:gap-4">
                    <div className="w-7 h-7 lg:w-8 lg:h-8 bg-amber-50 rounded-lg flex items-center justify-center">
                      <Award className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-amber-600" />
                    </div>
                    <h3 className="text-sm lg:text-base font-bold text-slate-800">Impact Stats</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 lg:gap-6 pl-10 lg:pl-12">
                    <div className="p-3 sm:p-4 lg:p-5 bg-slate-50 rounded-xl lg:rounded-2xl space-y-1">
                      <div className="flex items-center gap-2 text-indigo-600 mb-1">
                        <Activity className="w-3 lg:w-3.5 h-3 lg:h-3.5" />
                        <span className="text-[7px] lg:text-[9px] font-black uppercase tracking-widest">Active</span>
                      </div>
                      <p className="text-lg lg:text-2xl font-black text-slate-900">{stats.pending}</p>
                      <p className="text-[8px] lg:text-[10px] font-medium text-slate-500 uppercase tracking-wide">Pending</p>
                    </div>
                    <div className="p-3 sm:p-4 lg:p-5 bg-slate-50 rounded-xl lg:rounded-2xl space-y-1">
                      <div className="flex items-center gap-2 text-emerald-600 mb-1">
                        <Check className="w-3 lg:w-3.5 h-3 lg:h-3.5" />
                        <span className="text-[7px] lg:text-[9px] font-black uppercase tracking-widest">Fixed</span>
                      </div>
                      <p className="text-lg lg:text-2xl font-black text-slate-900">{stats.resolved}</p>
                      <p className="text-[8px] lg:text-[10px] font-medium text-slate-500 uppercase tracking-wide">Resolved</p>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {currentUser.role === 'CITIZEN' && (
              <section className="space-y-4 lg:space-y-6">
                <div className="flex items-center gap-3 lg:gap-4">
                  <div className="w-7 h-7 lg:w-8 lg:h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-slate-600" />
                  </div>
                  <h3 className="text-sm lg:text-base font-bold text-slate-800">Recent Activity</h3>
                </div>
                <div className="pl-10 lg:pl-12 space-y-4 lg:space-y-5">
                  {issues.filter(i => i.reportedBy === currentUser.name || i.reportedBy === currentUser.email).length > 0 ? (
                    <div className="space-y-4 lg:space-y-6">
                      {issues
                        .filter(i => i.reportedBy === currentUser.name || i.reportedBy === currentUser.email)
                        .slice(0, 2)
                        .map((issue) => (
                          <div key={issue.id} className="flex items-center justify-between group cursor-pointer" onClick={() => navigate('/dashboard')}>
                            <div className="flex items-center gap-3 lg:gap-4 min-w-0">
                              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg lg:rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                                {issue.photoUrl ? (
                                  <img src={issue.photoUrl} className="w-full h-full object-cover" alt="" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                                    <ImageIcon className="w-4 h-4 lg:w-5 lg:h-5" />
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-xs lg:text-sm font-bold text-slate-700 truncate group-hover:text-indigo-600 transition-colors">
                                  {issue.status === IssueStatus.RESOLVED ? 'Issue Resolved' : 'Report Submitted'}
                                </span>
                                <span className="text-[9px] lg:text-[11px] text-slate-400 font-medium truncate">{issue.category} • {issue.location.address?.split(',')[0]}</span>
                              </div>
                            </div>
                            <span className="hidden sm:inline-block text-[8px] lg:text-[9px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded shrink-0">
                              {new Date(issue.reportedAt).toLocaleDateString()}
                            </span>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="py-4 lg:py-6 text-center bg-slate-50 rounded-xl lg:rounded-2xl border-2 border-dashed border-slate-200">
                      <p className="text-[10px] lg:text-xs font-medium text-slate-400">No recent activity</p>
                    </div>
                  )}
                  
                  <button 
                    onClick={() => navigate('/dashboard')}
                    className="w-full flex items-center justify-center gap-2 py-3 lg:py-4 text-slate-400 hover:text-indigo-600 transition-colors border-t border-slate-100 mt-2"
                  >
                    <span className="text-[8px] lg:text-[9px] font-black uppercase tracking-widest">Dashboard View</span>
                    <ChevronRight className="w-3 h-3 lg:w-3.5 lg:h-3.5" />
                  </button>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
