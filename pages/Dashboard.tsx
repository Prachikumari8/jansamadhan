import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from '../store/useStore.ts';
import { 
  MapPin, 
  Search, 
  Clock, 
  ImageIcon,
  X,
  Filter,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  LayoutDashboard,
  Calendar,
  ArrowUpRight,
  Clock3,
  User,
  Building2,
  ShieldCheck,
  UserCheck,
  Activity,
  Check
} from 'lucide-react';
import { IssueStatus, Issue, IssueCategory } from '../types.ts';
import { DEPARTMENTS, SLA_HOURS, ISSUE_PROGRESS_STAGES } from '../constants.tsx';
import { getTranslation } from '../services/i18n';

const StatusBadge: React.FC<{ status: IssueStatus }> = ({ status }) => {
  const styles = {
    [IssueStatus.REPORTED]: 'bg-slate-100 text-slate-700 border-slate-200',
    [IssueStatus.IN_PROGRESS]: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    [IssueStatus.RESOLVED]: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };
  return (
    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${styles[status]}`}>
      {status}
    </span>
  );
};

const getProgressState = (status: IssueStatus) => {
  if (status === IssueStatus.RESOLVED) {
    return {
      percent: 100,
      label: 'Resolved',
      tone: 'bg-emerald-500',
      stages: [true, true, true, true]
    };
  }

  if (status === IssueStatus.IN_PROGRESS) {
    return {
      percent: 66,
      label: 'In Progress',
      tone: 'bg-indigo-500',
      stages: [true, true, true, false]
    };
  }

  return {
    percent: 25,
    label: 'Reported',
    tone: 'bg-slate-400',
    stages: [true, false, false, false]
  };
};

const getIssueProgress = (issue: Issue) => {
  const latest = issue.progressUpdates?.[issue.progressUpdates.length - 1];
  if (latest) {
    return latest;
  }

  if (issue.status === IssueStatus.RESOLVED) {
    return {
      id: 'derived',
      stage: 'Resolved' as const,
      note: 'Resolved through system status sync.',
      percent: 100,
      updatedAt: issue.reportedAt,
      updatedBy: issue.reportedBy
    };
  }

  if (issue.status === IssueStatus.IN_PROGRESS) {
    return {
      id: 'derived',
      stage: 'In Progress' as const,
      note: 'Work has started on this report.',
      percent: 60,
      updatedAt: issue.reportedAt,
      updatedBy: issue.reportedBy
    };
  }

  return {
    id: 'derived',
    stage: 'Reported' as const,
    note: 'Awaiting first department update.',
    percent: 20,
    updatedAt: issue.reportedAt,
    updatedBy: issue.reportedBy
  };
};

export const Dashboard: React.FC = () => {
  const { issues = [], currentUser, currentLanguage, updateIssueProgress } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Staff Portal State
  const [staffProgressNote, setStaffProgressNote] = useState<string>('');
  const [staffSelectedStage, setStaffSelectedStage] = useState<typeof ISSUE_PROGRESS_STAGES[number] | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const stats = useMemo(() => {
    const total = issues.length;
    const resolved = issues.filter(i => i.status === IssueStatus.RESOLVED).length;
    const pending = total - resolved;
    return { total, resolved, pending };
  }, [issues]);

  const assignedToCurrentStaff = useMemo(() => {
    if (currentUser?.role !== 'STAFF' || !currentUser?.name) return [];
    return issues.filter(issue => issue.assignedStaff?.name === currentUser.name && issue.status !== IssueStatus.RESOLVED);
  }, [issues, currentUser]);

  const getStagePercent = (stage: typeof ISSUE_PROGRESS_STAGES[number]) => {
    const stageMap: Record<typeof ISSUE_PROGRESS_STAGES[number], number> = {
      Reported: 20,
      Surveyed: 35,
      Assigned: 50,
      'In Progress': 70,
      Verification: 85,
      Resolved: 100
    };
    return stageMap[stage];
  };

  const submitStaffProgressUpdate = (issue: Issue, overrideStage?: typeof ISSUE_PROGRESS_STAGES[number]) => {
    const stageToUse = overrideStage || staffSelectedStage;
    if (!stageToUse || !staffProgressNote.trim()) return;
    updateIssueProgress(issue.id, {
      stage: stageToUse,
      percent: getStagePercent(stageToUse),
      note: staffProgressNote,
      updatedBy: currentUser?.name || 'Unknown Staff',
      assignedStaff: issue.assignedStaff
    });
    setStaffProgressNote('');
    setStaffSelectedStage(null);
  };

  const filteredIssues = useMemo(() => {
    return issues.filter(issue => {
      const matchesSearch = issue.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           issue.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'ALL' || issue.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [issues, searchTerm, filterCategory]);

  if (currentUser?.role === 'STAFF') {
    const resolvedCount = issues.filter(i => i.assignedStaff?.name === currentUser.name && i.status === IssueStatus.RESOLVED).length;
    
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
        <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 sticky top-0 z-[100] shadow-sm backdrop-blur-md bg-white/90">
          <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-emerald-600 rounded-lg flex items-center justify-center text-white shrink-0 shadow">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-lg font-semibold text-slate-900 tracking-tight">Staff Workspace</h1>
                  <span className="bg-emerald-600 text-[9px] text-white font-semibold px-1.5 py-0.5 rounded tracking-widest uppercase">Direct Assignment</span>
                </div>
                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mt-0.5">
                  {currentTime.toLocaleTimeString('en-IN', { hour12: false })} • {currentUser?.name}
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-[1400px] mx-auto w-full px-4 sm:px-6 py-5 sm:py-6 pb-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Active Tasks</p>
              <p className="text-2xl font-black text-slate-900">{assignedToCurrentStaff.length}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Work in Progress</p>
              <p className="text-2xl font-black text-indigo-600">{assignedToCurrentStaff.filter(i => i.status === IssueStatus.IN_PROGRESS).length}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Pending Review</p>
              <p className="text-2xl font-black text-amber-600">{assignedToCurrentStaff.filter(i => i.status === IssueStatus.REPORTED).length}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Jobs Completed</p>
              <p className="text-2xl font-black text-emerald-600">{resolvedCount}</p>
            </div>
          </div>

          <div className="space-y-4">
            {assignedToCurrentStaff.length > 0 ? (
              assignedToCurrentStaff.map((issue) => {
                const latestProgress = issue.progressUpdates?.[issue.progressUpdates.length - 1];
                const currentProgress = latestProgress || {
                  stage: issue.status === IssueStatus.IN_PROGRESS ? 'In Progress' : 'Reported',
                  percent: issue.status === IssueStatus.IN_PROGRESS ? 60 : 20,
                  note: 'Work assigned to you',
                  updatedAt: issue.reportedAt,
                  updatedBy: 'Admin'
                };

                return (
                  <div key={issue.id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 sm:p-5 space-y-3">
                    <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-4">
                      <div className="space-y-2 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-widest">{issue.category}</span>
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                            issue.status === IssueStatus.REPORTED ? 'bg-slate-100 text-slate-700 border-slate-200' :
                            issue.status === IssueStatus.IN_PROGRESS ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                            'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}>
                            {issue.status}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900">{issue.description}</h3>
                        <p className="text-xs text-slate-500">{issue.location.address || 'No address provided'}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">Assignment Details</p>
                        <p className="text-sm font-semibold text-slate-900 mb-1">{issue.assignedStaff?.name || currentUser?.name}</p>
                        {(() => {
                          const assignUpdate = issue.progressUpdates?.find(u => u.stage === 'Assigned');
                          return (
                            <p className="text-[10px] text-slate-500">
                              {assignUpdate ? new Date(assignUpdate.updatedAt).toLocaleString() : new Date(issue.reportedAt).toLocaleString()}
                            </p>
                          );
                        })()}
                      </div>
                      <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">Current Progress</p>
                        <p className="text-sm font-semibold text-slate-900 mb-1">{currentProgress.stage}</p>
                        <div className="h-2 rounded-full bg-slate-200 overflow-hidden mb-2">
                          <div className="h-full rounded-full bg-blue-600" style={{ width: `${currentProgress.percent}%` }} />
                        </div>
                        <p className="text-[10px] text-slate-500">{currentProgress.percent}% Complete</p>
                      </div>
                      <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">Last Updated</p>
                        <p className="text-sm font-semibold text-slate-900">{new Date(currentProgress.updatedAt).toLocaleDateString()}</p>
                        <p className="text-xs text-slate-500 mt-1">{currentProgress.note}</p>
                      </div>
                    </div>

                    <div className="rounded-xl bg-blue-50 border border-blue-100 p-3 space-y-2">
                      <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-widest">Update Progress</p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {ISSUE_PROGRESS_STAGES.filter(s => s !== 'Reported' && s !== 'Resolved').map((stage) => (
                          <button
                            key={stage}
                            onClick={() => setStaffSelectedStage(stage)}
                            className={`px-2.5 py-1.5 rounded-lg text-[10px] font-semibold uppercase tracking-widest border transition-all ${
                              staffSelectedStage === stage
                                ? 'bg-slate-900 text-white border-slate-900'
                                : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600'
                            }`}
                          >
                            {stage}
                          </button>
                        ))}
                      </div>
                      <textarea
                        value={staffProgressNote}
                        onChange={(e) => setStaffProgressNote(e.target.value)}
                        placeholder="Add a note about your progress..."
                        className="w-full min-h-[70px] rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100"
                      />
                      <div className="flex flex-col sm:flex-row gap-2 pt-2">
                        <button
                          onClick={() => submitStaffProgressUpdate(issue)}
                          disabled={!staffSelectedStage || staffSelectedStage === 'Resolved' || !staffProgressNote.trim()}
                          className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-3 py-2.5 rounded-lg text-[10px] font-semibold uppercase tracking-widest transition-colors"
                        >
                          <Activity className="w-3 h-3 inline mr-1.5" /> Update Status
                        </button>
                        <button
                          onClick={() => submitStaffProgressUpdate(issue, 'Resolved')}
                          disabled={!staffProgressNote.trim()}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-3 py-2.5 rounded-lg text-[10px] font-semibold uppercase tracking-widest transition-colors"
                        >
                          <CheckCircle2 className="w-3 h-3 inline mr-1.5" /> Complete & Close
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-8 text-center">
                <Activity className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 font-medium">No work assigned to you yet</p>
                <p className="text-slate-500 text-sm mt-2">Check back later for assigned issues</p>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 no-scrollbar">
      <div className="bg-slate-900 pt-6 pb-8 sm:pt-8 sm:pb-10 border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1.5">
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Operations Center</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-none mb-2">Community Dashboard</h1>
              <p className="text-slate-400 font-medium text-xs sm:text-sm max-w-xl leading-relaxed opacity-80">
                Strategic overview of urban maintenance requests. Real-time data visualization of civic infrastructure health.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 pl-3 pr-4 py-2.5 rounded-xl shadow-xl shadow-indigo-950/20 flex items-center space-x-2.5 border border-indigo-500/20">
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-white backdrop-blur-sm">
                  <Clock3 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-indigo-100 uppercase tracking-widest leading-none mb-0.5 opacity-70">Pending</p>
                  <p className="text-xl font-black text-white leading-none">{stats.pending}</p>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-sm px-3 sm:px-4 py-2.5 rounded-xl border border-white/10 flex flex-col items-center min-w-[60px] sm:min-w-[70px]">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Resolved</p>
                <p className="text-xl font-black text-emerald-400 leading-none">{stats.resolved}</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm px-3 sm:px-4 py-2.5 rounded-xl border border-white/10 flex flex-col items-center min-w-[60px] sm:min-w-[70px]">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Total</p>
                <p className="text-xl font-black text-slate-300 leading-none">{stats.total}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-5 sm:mt-6 space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row gap-2 items-center bg-white p-1.5 sm:p-2 rounded-xl border border-slate-200 shadow-sm">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search detailed reports..." 
              className="w-full h-10 sm:h-11 pl-9 pr-4 bg-slate-50 rounded-lg outline-none text-sm font-medium focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="h-10 sm:h-11 px-3 bg-slate-50 border-none rounded-lg text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer hover:bg-slate-100 transition-colors"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="ALL">All Categories</option>
            {Object.values(IssueCategory).map(cat => (
              <option key={cat} value={cat}>
                {getTranslation(currentLanguage, `category_${cat.toLowerCase().replace(' ', '_')}`)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col space-y-2.5 pb-20">
          {filteredIssues.map((issue) => (
            <div 
              key={issue.id} 
              className="group bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer"
              onClick={() => setSelectedIssue(issue)}
            >
              <div className="flex flex-row items-stretch">
                <div className="w-20 sm:w-36 shrink-0 bg-slate-100 relative overflow-hidden border-r border-slate-50 flex items-center justify-center">
                  {issue.photoUrl ? (
                    <>
                      <div className="absolute inset-0 bg-slate-200 animate-pulse" />
                      <img 
                        src={issue.photoUrl} 
                        className="w-full h-full object-cover relative z-10 transition-transform duration-500 group-hover:scale-105" 
                        alt="Evidence"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.parentElement?.querySelector('.fallback-icon')?.classList.remove('hidden');
                        }}
                      />
                      <div className="fallback-icon hidden absolute inset-0 flex items-center justify-center text-slate-300">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                  )}
                  <div className="absolute top-1.5 left-1.5">
                    <span className={`px-1.5 py-0.5 rounded text-[7px] sm:text-[8px] font-black uppercase tracking-widest text-white shadow-lg ${issue.priority === 'High' ? 'bg-rose-500' : 'bg-indigo-500'}`}>
                      {issue.priority}
                    </span>
                  </div>
                </div>

                <div className="flex-1 p-3 sm:p-4 flex flex-col justify-between min-w-0">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center space-x-2 min-w-0">
                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest shrink-0">
                          {getTranslation(currentLanguage, `category_${issue.category.toLowerCase().replace(' ', '_')}`)}
                        </span>
                        <StatusBadge status={issue.status} />
                      </div>
                      <span className="hidden sm:inline-block text-[9px] font-mono text-slate-300 font-bold uppercase tracking-widest shrink-0">
                        #{issue.id.substr(0, 8)}
                      </span>
                    </div>
                    
                    <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight leading-tight group-hover:text-indigo-600 transition-colors truncate">
                      {issue.location.address?.split(',')[0] || 'Local Incident'}
                    </h3>

                    <p className="text-xs font-medium text-slate-500 leading-relaxed line-clamp-1 sm:line-clamp-2 opacity-80">
                      {issue.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-50">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center text-slate-400 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">
                        <MapPin className="w-3 h-3 mr-1 text-indigo-400" />
                        <span className="truncate max-w-[100px] sm:max-w-[180px]">{issue.location.address?.split(',').slice(1,3).join(', ') || 'General Area'}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest hidden sm:inline">Details</span>
                      <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedIssue && (
        <div className="fixed inset-0 z-[2000] bg-slate-900/80 backdrop-blur-xl flex items-center justify-center p-3 sm:p-4 overflow-y-auto no-scrollbar">
          <div className="bg-white w-full max-w-2xl rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden border border-white/20 animate-in zoom-in-95 duration-300 my-auto">
            <div className="px-5 sm:px-6 py-3.5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white shadow">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verified Case ID</p>
                  <p className="text-xs font-black text-slate-900">#{selectedIssue.id.toUpperCase()}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedIssue(null)} 
                className="p-1.5 hover:bg-slate-100 rounded-lg transition-all text-slate-400 hover:text-rose-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-[85vh] overflow-y-auto no-scrollbar">
              <div className="w-full aspect-video bg-slate-100 border-b border-slate-200 relative group">
                {selectedIssue.photoUrl ? (
                  <img 
                    src={selectedIssue.photoUrl} 
                    className="w-full h-full object-cover" 
                    alt="Report Evidence" 
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 space-y-2">
                    <ImageIcon className="w-10 h-10" />
                    <span className="text-[10px] font-black uppercase tracking-widest">No Visual Evidence Provided</span>
                  </div>
                )}
                <div className="absolute bottom-4 right-4 flex items-center space-x-2">
                   <div className="px-3 py-1.5 bg-slate-900/90 backdrop-blur text-white rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center shadow-xl border border-white/10">
                      <ImageIcon className="w-3 h-3 mr-1.5 text-indigo-400" />
                      Digital Evidence Archive
                   </div>
                </div>
              </div>

              <div className="p-5 sm:p-6 lg:p-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-1.5">
                      <StatusBadge status={selectedIssue.status} />
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest text-white shadow-sm ${selectedIssue.priority === 'High' ? 'bg-rose-600' : 'bg-indigo-600'}`}>
                        {selectedIssue.priority} Priority
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest text-slate-600 bg-slate-100 border border-slate-200">
                        {getTranslation(currentLanguage, `category_${selectedIssue.category.toLowerCase().replace(' ', '_')}`)}
                      </span>
                    </div>

                    <h2 className="text-lg sm:text-xl lg:text-2xl font-black text-slate-900 leading-tight tracking-tight">
                      {selectedIssue.description}
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 pt-4 border-t border-slate-100">
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0 border border-indigo-100">
                          <MapPin className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Location</p>
                          <p className="text-xs font-bold text-slate-700 leading-relaxed">{selectedIssue.location.address}</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0 border border-indigo-100">
                          <Clock className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Timestamp</p>
                          <p className="text-xs font-bold text-slate-700">{selectedIssue.reportedAt.toLocaleString([], { dateStyle: 'full', timeStyle: 'short' })}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100">
                          <UserCheck className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Reporter</p>
                          <div className="flex items-center space-x-2">
                            <p className="text-xs font-black text-slate-900">{selectedIssue.reportedBy || 'Authorized Citizen'}</p>
                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                            <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Verified</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
                          <Building2 className="w-4 h-4 text-slate-600" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Department</p>
                          <p className="text-xs font-bold text-slate-700">{DEPARTMENTS[selectedIssue.category] || 'General Municipal Council'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Work Progress</p>
                        <p className="text-xs font-bold text-slate-700">Current case workflow</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Stage</p>
                        <p className="text-xs font-black text-slate-900">{getProgressState(selectedIssue.status).label}</p>
                      </div>
                    </div>

                    <div className="space-y-2.5 rounded-xl bg-slate-50 border border-slate-100 p-4">
                      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <span>Progress</span>
                        <span>{getProgressState(selectedIssue.status).percent}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${getProgressState(selectedIssue.status).tone}`}
                          style={{ width: `${getProgressState(selectedIssue.status).percent}%` }}
                        />
                      </div>
                      <div className="grid grid-cols-4 gap-1.5 pt-1">
                        {['Reported', 'Review', 'In Progress', 'Resolved'].map((stage, index) => {
                          const stageActive = getProgressState(selectedIssue.status).stages[index];
                          return (
                            <div key={stage} className="flex flex-col items-center text-center gap-1.5">
                              <div className={`w-2.5 h-2.5 rounded-full ${stageActive ? 'bg-indigo-600' : 'bg-slate-300'}`} />
                              <span className={`text-[8px] sm:text-[9px] font-black uppercase tracking-widest leading-tight ${stageActive ? 'text-slate-900' : 'text-slate-400'}`}>{stage}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">SLA Target</p>
                        <p className="text-base font-black text-slate-900">{SLA_HOURS[selectedIssue.category]} hours</p>
                        <p className="text-[11px] font-medium text-slate-500 mt-0.5">Category-specific service expectations.</p>
                      </div>
                      <div className="rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Status</p>
                        <p className="text-base font-black text-slate-900 capitalize">{selectedIssue.status.toLowerCase()}</p>
                        <p className="text-[11px] font-medium text-slate-500 mt-0.5">Latest report lifecycle event.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Assigned Staff</p>
                        {selectedIssue.assignedStaff ? (
                          <div className="space-y-0.5">
                            <p className="text-sm font-black text-slate-900">{selectedIssue.assignedStaff.name}</p>
                            <p className="text-xs font-medium text-slate-600">{selectedIssue.assignedStaff.title || 'Staff'}</p>
                            <p className="text-[11px] text-slate-500">{selectedIssue.assignedStaff.phone}</p>
                            <p className="text-[11px] text-slate-500">{selectedIssue.assignedStaff.email}</p>
                          </div>
                        ) : (
                          <div className="space-y-0.5">
                            <p className="text-xs font-semibold text-slate-700">Unassigned</p>
                            <p className="text-[11px] text-slate-500">No registered staff in this location.</p>
                            <p className="text-[11px] text-slate-500">Pending Assignment</p>
                          </div>
                        )}
                      </div>

                      <div className="rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Timeline</p>
                        <div className="space-y-2.5">
                          {(selectedIssue.progressUpdates && selectedIssue.progressUpdates.length > 0 ? selectedIssue.progressUpdates : [getIssueProgress(selectedIssue)]).slice(-4).map((update, index) => (
                            <div key={`${update.id}-${index}`} className="flex items-start gap-2">
                              <div className={`mt-1 w-2 h-2 rounded-full ${update.stage === 'Resolved' ? 'bg-emerald-500' : update.stage === 'In Progress' ? 'bg-indigo-500' : 'bg-slate-400'}`} />
                              <div className="min-w-0">
                                <p className="text-xs font-black text-slate-900">{update.stage} - {update.percent}%</p>
                                <p className="text-[11px] text-slate-500">{update.note}</p>
                                <p className="text-[9px] uppercase tracking-widest text-slate-400 mt-0.5">{update.updatedBy} • {new Date(update.updatedAt).toLocaleString()}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2">Admin updates appear here automatically.</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3">
                    <button 
                      onClick={() => setSelectedIssue(null)}
                      className="w-full py-3 bg-slate-900 text-white font-bold rounded-lg text-xs uppercase tracking-[0.15em] shadow-lg hover:bg-blue-600 transition-all active:scale-[0.98]"
                    >
                      Close Detailed View
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};