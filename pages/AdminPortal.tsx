import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from '../store/useStore.ts';
import { IssueStatus, IssueCategory, Issue, User } from '../types.ts';
import { IssueMap } from '../components/IssueMap.tsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import {
  Filter,
  Download,
  Search,
  CheckCircle2,
  MoreVertical,
  Map as MapIcon,
  Table as TableIcon,
  AlertTriangle,
  Clock,
  Users,
  Activity,
  LayoutGrid,
  Sparkles,
  Loader2,
  Navigation,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Building2,
  Calendar,
  RefreshCw,
  Eye,
  Check,
  AlertCircle,
  FileText,
  PieChart,
  Home,
  Menu,
  ChevronDown,
  UserCheck,
  Trash2,
  PlusCircle
} from 'lucide-react';
import { CATEGORY_CONFIG, DEPARTMENTS, SLA_HOURS, CATEGORY_STAFF, ISSUE_PROGRESS_STAGES } from '../constants.tsx';
import { generateCityBriefing } from '../services/geminiService.ts';
import { getTranslation } from '../services/i18n';

const UserCard: React.FC<{ user: User; issues: Issue[]; updateAnyUser: any; removeUser: any; removeStaff: any }> = ({ user, issues, updateAnyUser, removeUser, removeStaff }) => (
  <div className="group/user bg-slate-50/50 rounded-2xl border border-slate-100 p-4 hover:border-blue-200 hover:bg-white hover:shadow-xl transition-all duration-300 flex flex-col h-full">
    <div className="flex items-start justify-between mb-4">
      <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 shadow-sm group-hover/user:bg-blue-600 group-hover/user:text-white transition-all duration-300">
        {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover rounded-xl" /> : <Users className="w-6 h-6" />}
      </div>
      <div className="flex flex-col items-end gap-1.5">
        <select
          value={user.role}
          onChange={(e) => updateAnyUser(user.id, { role: e.target.value as any })}
          className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded border outline-none transition-all ${user.role === 'ADMIN' ? 'bg-rose-50 text-rose-600 border-rose-200' :
              user.role === 'STAFF' ? 'bg-indigo-50 text-indigo-600 border-indigo-200' :
                'bg-emerald-50 text-emerald-600 border-emerald-200'
            }`}
        >
          <option value="CITIZEN">Citizen</option>
          <option value="STAFF">Staff</option>
          <option value="ADMIN">Admin</option>
        </select>
        <button
          onClick={() => {
            if (window.confirm(`Permanently delete account for ${user.name}? This action cannot be undone.`)) {
              removeUser(user.id);
              if (user.role === 'STAFF') {
                removeStaff(user.email);
              }
            }
          }}
          className="p-1 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded transition-all"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>

    <div className="space-y-1 mb-4 flex-1">
      <input
        type="text"
        value={user.name}
        onChange={(e) => updateAnyUser(user.id, { name: e.target.value })}
        className="w-full bg-transparent border-none p-0 text-sm font-bold text-slate-800 outline-none focus:text-blue-600 transition-colors"
      />
      <p className="text-[10px] text-slate-400 font-medium truncate mb-2">{user.email}</p>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-[10px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold">{user.phone || 'No phone provided'}</span>
        </div>
        
        <div className="flex items-start gap-2 text-[10px] text-slate-500">
          <MapIcon className="w-3.5 h-3.5 text-slate-400 mt-0.5" />
          <div className="flex flex-col gap-0.5">
            <span className="font-bold text-slate-700">
              {user.role === 'STAFF' ? `${user.city || 'City'}, ${user.district || 'District'}` :
                user.role === 'ADMIN' ? `${user.adminLocation?.city || 'City'}, ${user.adminLocation?.district || 'District'}` :
                  'Andhra Pradesh, India'}
            </span>
            <span className="text-[9px] text-slate-400">
              {user.role === 'STAFF' ? `${user.area || 'No Area'}, PIN: ${user.pincode || 'N/A'}` :

                user.role === 'ADMIN' ? `${user.adminLocation?.state || 'State'} • ${user.adminLocation?.wards?.length || 0} Wards` :
                  'Citizen Account'}
            </span>
          </div>
        </div>

        {user.role === 'ADMIN' && user.adminLocation?.pincodes && (
          <div className="flex items-center gap-2 pt-1">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[9px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
              Zones: {user.adminLocation.pincodes.join(', ')}
            </span>
          </div>
        )}

        {user.role === 'STAFF' && (
          <div className="flex items-center gap-2 pt-1">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <div className="flex-1">
              <select
                value={user.staffCategory || ''}
                onChange={(e) => updateAnyUser(user.id, { staffCategory: e.target.value })}
                className="w-full text-[9px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded px-2 py-1 outline-none hover:border-indigo-400 transition-all cursor-pointer"
              >
                <option value="">No Department</option>
                {Object.values(IssueCategory).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>
    </div>

    <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
      <div className="flex flex-col">
        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Joined</span>
        <span className="text-[10px] font-semibold text-slate-600">
          {user.joinedAt ? new Date(user.joinedAt).toLocaleDateString() : 'N/A'}
        </span>
      </div>
      <div className="flex flex-col items-end">
        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
          {user.role === 'STAFF' ? 'Tasks' : 'Reports'}
        </span>
        <span className="text-[10px] font-black text-slate-900">
          {user.role === 'STAFF' 
            ? issues.filter(i => i.assignedStaff?.name === user.name || i.assignedStaff?.email === user.email).length
            : issues.filter(i => i.reportedBy === user.name || i.reportedBy === user.email).length
          }
        </span>
      </div>
    </div>
  </div>
);

export const AdminPortal: React.FC = () => {
  const {
    issues,
    users,
    currentUser,
    updateIssueProgress,
    getRegisteredStaffByCategory,
    getNextStaffForCategory,
    getStaffRotationState,
    currentLanguage,
    removeStaff,
    updateStaffCategory,
    updateAnyUser,
    removeUser,
    refreshUsers
  } = useStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Redirect if not authorized
  useEffect(() => {
    if (!currentUser || (currentUser.role !== 'ADMIN' && currentUser.role !== 'STAFF')) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const [activeView, setActiveView] = useState<'MAP' | 'QUEUE' | 'ANALYTICS'>(
    (searchParams.get('view') as any) || 'MAP'
  );

  useEffect(() => {
    const view = searchParams.get('view');
    if (view === 'MAP' || view === 'QUEUE' || view === 'ANALYTICS') {
      setActiveView(view);
    }
  }, [searchParams]);

  const [reportedIssuesTab, setReportedIssuesTab] = useState<'24hours' | 'inProgress' | 'closed'>('24hours');
  const [filterDept, setFilterDept] = useState<string>('All Departments');
  const [staffSearchQuery, setStaffSearchQuery] = useState('');
  const [citizenSearchQuery, setCitizenSearchQuery] = useState('');
  const [adminSearchQuery, setAdminSearchQuery] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [progressDrafts, setProgressDrafts] = useState<Record<string, string>>({});
  const [selectedStageByIssue, setSelectedStageByIssue] = useState<Record<string, typeof ISSUE_PROGRESS_STAGES[number]>>({});

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const enrichedIssues = useMemo(() => {
    return issues.map(issue => {
      const slaLimit = SLA_HOURS[issue.category] || 24;
      const reportedTime = typeof issue.reportedAt === 'string' ? new Date(issue.reportedAt).getTime() : issue.reportedAt.getTime();
      const deadline = new Date(reportedTime + slaLimit * 60 * 60 * 1000);
      const now = new Date();
      const hoursRemaining = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
      const latestProgress = issue.progressUpdates?.[issue.progressUpdates.length - 1];

      return {
        ...issue,
        department: DEPARTMENTS[issue.category],
        hoursRemaining,
        isAtRisk: hoursRemaining > 0 && hoursRemaining < 4 && issue.status !== IssueStatus.RESOLVED,
        isBreached: hoursRemaining <= 0 && issue.status !== IssueStatus.RESOLVED,
        latestProgress,
        staff: issue.assignedStaff || CATEGORY_STAFF[issue.category][0]
      };
    });
  }, [issues]);

  const filteredIssues = useMemo(() => {
    let result = enrichedIssues;
    if (filterDept !== 'All Departments') {
      result = result.filter(i => i.department === filterDept);
    }
    return result;
  }, [enrichedIssues, filterDept]);

  const reportedIssuesByTab = useMemo(() => {
    const now = new Date().getTime();
    const last24h = now - (24 * 60 * 60 * 1000);

    if (reportedIssuesTab === '24hours') {
      return filteredIssues.filter(i => {
        const reportedTime = typeof i.reportedAt === 'string' ? new Date(i.reportedAt).getTime() : i.reportedAt.getTime();
        return reportedTime >= last24h;
      });
    } else if (reportedIssuesTab === 'inProgress') {
      return filteredIssues.filter(i => i.status === IssueStatus.IN_PROGRESS || i.status === IssueStatus.REPORTED);
    } else {
      return filteredIssues.filter(i => i.status === IssueStatus.RESOLVED);
    }
  }, [filteredIssues, reportedIssuesTab]);

  const updateProgress = (issue: Issue, percent: number, stage: typeof ISSUE_PROGRESS_STAGES[number], note: string) => {
    updateIssueProgress(issue.id, {
      stage,
      percent,
      note,
      updatedBy: currentUser?.name || 'Admin',
      assignedStaff: issue.assignedStaff || CATEGORY_STAFF[issue.category][0]
    });
    setProgressDrafts(drafts => ({ ...drafts, [issue.id]: '' }));
    setSelectedStageByIssue(stages => {
      const next = { ...stages };
      delete next[issue.id];
      return next;
    });
  };

  const filteredCitizens = useMemo(() => {
    return users.filter(u => {
      const isCitizen = u.role === 'CITIZEN';
      const matchesSearch = u.name.toLowerCase().includes(citizenSearchQuery.toLowerCase()) || 
                          u.email.toLowerCase().includes(citizenSearchQuery.toLowerCase());
      return isCitizen && matchesSearch;
    });
  }, [users, citizenSearchQuery]);

  const filteredAdmins = useMemo(() => {
    return users.filter(u => {
      const isAdmin = u.role === 'ADMIN';
      const matchesSearch = u.name.toLowerCase().includes(adminSearchQuery.toLowerCase()) || 
                          u.email.toLowerCase().includes(adminSearchQuery.toLowerCase());
      return isAdmin && matchesSearch;
    });
  }, [users, adminSearchQuery]);

  const staff = useMemo(() => users.filter(u => u.role === 'STAFF'), [users]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-[100] shadow-sm backdrop-blur-md bg-white/90">
        <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-11 h-11 bg-slate-900 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-semibold text-slate-900 tracking-tight">Command Center</h1>
                <span className="bg-blue-600 text-[9px] text-white font-semibold px-1.5 py-0.5 rounded tracking-widest uppercase">Official</span>
              </div>
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mt-0.5">
                {currentTime.toLocaleTimeString('en-IN', { hour12: false })} • System Online
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => refreshUsers()}
              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
              title="Refresh users from database"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Jurisdiction</span>
              <span className="text-xs font-bold text-slate-900">{currentUser?.adminLocation?.city}, {currentUser?.adminLocation?.district}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-[1600px] mx-auto w-full px-4 sm:px-6 py-5 sm:py-6 pb-16">
        <div className="space-y-8">
          {activeView === 'MAP' && (
            <div className="space-y-12">
              <section className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-5 rounded-3xl border border-slate-800 shadow-2xl shadow-emerald-900/10 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white tracking-tight">Citizen Registry</h2>
                      <p className="text-xs font-medium text-emerald-400/80 uppercase tracking-wider">Public Accounts & Profiles</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 relative z-10">
                    <div className="relative">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        placeholder="Search citizens..."
                        value={citizenSearchQuery}
                        onChange={(e) => setCitizenSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-2xl text-xs text-white placeholder:text-slate-500 outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all w-full sm:w-72 shadow-inner"
                      />
                    </div>
                    <div className="px-4 py-2 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-900/20 border border-emerald-400/20">
                      {filteredCitizens.length} REGISTERED
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredCitizens.map(user => (
                    <UserCard key={user.id} user={user} issues={issues} updateAnyUser={updateAnyUser} removeUser={removeUser} removeStaff={removeStaff} />
                  ))}
                </div>
              </section>

              <section className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-5 rounded-3xl border border-slate-800 shadow-2xl shadow-rose-900/10 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-rose-500" />
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white tracking-tight">Administrative Board</h2>
                      <p className="text-xs font-medium text-rose-400/80 uppercase tracking-wider">System Controllers & Governance</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 relative z-10">
                    <div className="relative">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        placeholder="Search admins..."
                        value={adminSearchQuery}
                        onChange={(e) => setAdminSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-2xl text-xs text-white placeholder:text-slate-500 outline-none focus:ring-4 focus:ring-rose-500/20 focus:border-rose-500/50 transition-all w-full sm:w-72 shadow-inner"
                      />
                    </div>
                    <div className="px-4 py-2 bg-rose-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-rose-900/20 border border-rose-400/20">
                      {filteredAdmins.length} ADMINS
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredAdmins.map(user => (
                    <UserCard key={user.id} user={user} issues={issues} updateAnyUser={updateAnyUser} removeUser={removeUser} removeStaff={removeStaff} />
                  ))}
                </div>
              </section>

              <section className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-5 rounded-3xl border border-slate-800 shadow-2xl shadow-indigo-900/10 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                      <Activity className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white tracking-tight">Staff Directory</h2>
                      <p className="text-xs font-medium text-indigo-400/80 uppercase tracking-wider">Departmental Resolution Teams</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 relative z-10">
                    <div className="relative">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        placeholder="Search staff by name or email..."
                        value={staffSearchQuery}
                        onChange={(e) => setStaffSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-2xl text-xs text-white placeholder:text-slate-500 outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all w-full sm:w-72 shadow-inner"
                      />
                    </div>
                    <div className="px-4 py-2 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-900/20 border border-indigo-400/20">
                      {staff.length} ACTIVE
                    </div>
                  </div>
                </div>

                <div className="space-y-8 mt-6">
                  {Object.values(IssueCategory).map(category => {
                    const staffInCat = staff.filter(s => {
                      const matchesCat = s.staffCategory === category;
                      const matchesSearch = s.name.toLowerCase().includes(staffSearchQuery.toLowerCase()) || 
                                          s.email.toLowerCase().includes(staffSearchQuery.toLowerCase());
                      return matchesCat && matchesSearch;
                    });
                    
                    if (staffInCat.length === 0) return null;

                    return (
                      <div key={category} className="space-y-4">
                        <div className="flex items-center gap-4">
                          <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest shrink-0">
                            {category} Department
                          </h3>
                          <div className="h-px bg-slate-100 flex-1" />
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">
                            {staffInCat.length} Members
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                          {staffInCat.map(user => (
                            <UserCard key={user.id} user={user} issues={issues} updateAnyUser={updateAnyUser} removeUser={removeUser} removeStaff={removeStaff} />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>
          )}

          {activeView === 'QUEUE' && (
            <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 shadow-lg overflow-hidden flex flex-col">
              <div className="space-y-4 p-6">
                <div className="flex gap-3 border-b border-slate-200 pb-4">
                  {(['24hours', 'inProgress', 'closed'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setReportedIssuesTab(tab)}
                      className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-widest transition-all ${reportedIssuesTab === tab ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                    >
                      {tab === '24hours' ? 'Last 24 Hours' : tab === 'inProgress' ? 'In Progress' : 'Closed/Resolved'}
                    </button>
                  ))}
                </div>
                
                <div className="space-y-4">
                  {reportedIssuesByTab.length > 0 ? (
                    reportedIssuesByTab.map((issue) => {
                      const currentProgress = issue.latestProgress || {
                        stage: issue.status === IssueStatus.RESOLVED ? 'Resolved' : issue.status === IssueStatus.IN_PROGRESS ? 'In Progress' : 'Reported',
                        percent: issue.status === IssueStatus.RESOLVED ? 100 : issue.status === IssueStatus.IN_PROGRESS ? 60 : 20,
                        note: 'No manual progress update yet.',
                        updatedAt: issue.reportedAt,
                        updatedBy: 'Admin'
                      };
                      const selectedStage = selectedStageByIssue[issue.id];
                      const canReopen = issue.status === IssueStatus.RESOLVED || currentProgress.stage === 'Resolved';

                      return (
                        <div key={issue.id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 sm:p-5 space-y-4">
                          <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-4">
                            <div className="space-y-2 min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-widest">
                                  {getTranslation(currentLanguage, `category_${issue.category.toLowerCase().replace(' ', '_')}`)}
                                </span>
                                <span className="text-slate-300">•</span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">#{issue.id.slice(-6)}</span>
                              </div>
                              <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{issue.description}</h4>
                              <div className="flex items-center gap-3 text-[10px] text-slate-500 font-medium">
                                <span className="flex items-center gap-1"><MapIcon className="w-3 h-3" /> {issue.location.details?.city || 'Unknown'}</span>
                                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(issue.reportedAt).toLocaleDateString()}</span>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 shrink-0">
                              <div className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border ${
                                issue.status === IssueStatus.RESOLVED ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                issue.status === IssueStatus.IN_PROGRESS ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                'bg-rose-50 text-rose-600 border-rose-100'
                              }`}>
                                {issue.status}
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-widest text-slate-400">
                              <span>Resolution Progress</span>
                              <span>{currentProgress.percent}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className={`h-full transition-all duration-700 ${
                                  issue.status === IssueStatus.RESOLVED ? 'bg-emerald-500' : 
                                  issue.status === IssueStatus.IN_PROGRESS ? 'bg-amber-500' : 'bg-rose-500'
                                }`}
                                style={{ width: `${currentProgress.percent}%` }}
                              />
                            </div>
                          </div>

                          <div className="pt-4 border-t border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                                <Activity className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Current Stage</p>
                                <p className="text-xs font-semibold text-slate-700">{currentProgress.stage}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {issue.status !== IssueStatus.RESOLVED && (
                                <div className="flex items-center gap-2">
                                  <select
                                    value={selectedStage || ''}
                                    onChange={(e) => setSelectedStageByIssue(prev => ({ ...prev, [issue.id]: e.target.value as any }))}
                                    className="bg-slate-50 border border-slate-200 text-slate-700 text-[10px] font-bold uppercase tracking-widest rounded-lg px-3 py-2 outline-none focus:border-blue-400 transition-all"
                                  >
                                    <option value="">Update Status</option>
                                    {ISSUE_PROGRESS_STAGES.map(stage => (
                                      <option key={stage} value={stage}>{stage}</option>
                                    ))}
                                  </select>
                                  
                                  <button
                                    disabled={!selectedStage}
                                    onClick={() => {
                                      const stage = selectedStage!;
                                      const stageMap: Record<typeof ISSUE_PROGRESS_STAGES[number], number> = {
                                        Reported: 20, Surveyed: 35, Assigned: 50, 'In Progress': 70, Verification: 85, Resolved: 100
                                      };
                                      updateProgress(issue, stageMap[stage], stage, progressDrafts[issue.id] || `Issue moved to ${stage} stage.`);
                                    }}
                                    className="bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg px-4 py-2 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                  >
                                    Update
                                  </button>
                                </div>
                              )}

                              {issue.status === IssueStatus.RESOLVED && (
                                <>
                                  <button
                                    onClick={() => updateProgress(issue, 100, 'Resolved', progressDrafts[issue.id] || 'Report resolved and closed by admin review.')}
                                    className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-500 transition-colors"
                                  >
                                    Close Report
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (!canReopen) return;
                                      updateProgress(issue, 20, 'Reported', progressDrafts[issue.id] || 'Report reopened by admin for additional work.');
                                    }}
                                    className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-200 transition-colors"
                                  >
                                    Reopen
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => navigate('/dashboard')}
                                className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 text-[10px] font-bold uppercase tracking-widest hover:border-blue-300 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
                              >
                                <Eye className="w-4 h-4" /> View
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-12 text-center">
                      <p className="text-slate-500 text-sm font-medium">No issues found in this category</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
