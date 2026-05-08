import React, { useState, useMemo } from 'react';
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
  UserCheck
} from 'lucide-react';
import { IssueStatus, Issue, IssueCategory } from '../types.ts';
import { DEPARTMENTS, SLA_HOURS, CATEGORY_STAFF, ISSUE_PROGRESS_STAGES } from '../constants.tsx';
import { getTranslation } from '../services/i18n';

const StatusBadge: React.FC<{ status: IssueStatus }> = ({ status }) => {
  const styles = {
    [IssueStatus.REPORTED]: 'bg-slate-100 text-slate-700 border-slate-200',
    [IssueStatus.IN_PROGRESS]: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    [IssueStatus.RESOLVED]: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${styles[status]}`}>
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
  const { issues = [], currentUser, currentLanguage } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  const stats = useMemo(() => {
    const total = issues.length;
    const resolved = issues.filter(i => i.status === IssueStatus.RESOLVED).length;
    const pending = total - resolved;
    return { total, resolved, pending };
  }, [issues]);

  const filteredIssues = useMemo(() => {
    return issues.filter(issue => {
      const matchesSearch = issue.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           issue.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'ALL' || issue.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [issues, searchTerm, filterCategory]);

  return (
    <div className="min-h-screen bg-slate-50 no-scrollbar">
      <div className="bg-slate-900 pt-10 pb-12 border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Operations Center</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tight leading-none mb-3">Community Dashboard</h1>
              <p className="text-slate-400 font-medium text-sm lg:text-base max-w-xl leading-relaxed opacity-80">
                Strategic overview of urban maintenance requests. Real-time data visualization of civic infrastructure health.
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="bg-indigo-600 pl-4 pr-6 py-3 rounded-2xl shadow-2xl shadow-indigo-950/20 flex items-center space-x-3 border border-indigo-500/20">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white backdrop-blur-sm">
                  <Clock3 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-indigo-100 uppercase tracking-widest leading-none mb-1 opacity-70">Pending</p>
                  <p className="text-2xl font-black text-white leading-none">{stats.pending}</p>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-sm px-5 py-3 rounded-2xl border border-white/10 flex flex-col items-center min-w-[80px]">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Resolved</p>
                <p className="text-2xl font-black text-emerald-400 leading-none">{stats.resolved}</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm px-5 py-3 rounded-2xl border border-white/10 flex flex-col items-center min-w-[80px]">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Total</p>
                <p className="text-2xl font-black text-slate-300 leading-none">{stats.total}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-center bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search detailed reports..." 
              className="w-full h-12 pl-10 pr-4 bg-slate-50 rounded-xl outline-none text-sm font-medium focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="h-12 px-4 bg-slate-50 border-none rounded-xl text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer hover:bg-slate-100 transition-colors"
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

        <div className="flex flex-col space-y-3 pb-24">
          {filteredIssues.map((issue) => (
            <div 
              key={issue.id} 
              className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer"
              onClick={() => setSelectedIssue(issue)}
            >
              <div className="flex flex-row items-stretch">
                <div className="w-24 sm:w-44 shrink-0 bg-slate-50 relative overflow-hidden border-r border-slate-50">
                  {issue.photoUrl ? (
                    <img src={issue.photoUrl} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="Evidence" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                  )}
                  <div className="absolute top-2 left-2">
                    <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest text-white shadow-lg ${issue.priority === 'High' ? 'bg-rose-500' : 'bg-indigo-500'}`}>
                      {issue.priority}
                    </span>
                  </div>
                </div>

                <div className="flex-1 p-4 sm:p-6 flex flex-col justify-between min-w-0">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                          {getTranslation(currentLanguage, `category_${issue.category.toLowerCase().replace(' ', '_')}`)}
                        </span>
                        <StatusBadge status={issue.status} />
                      </div>
                      <span className="hidden sm:inline-block text-[10px] font-mono text-slate-300 font-bold uppercase tracking-widest">
                        Case No: #{issue.id.substr(0, 8)}
                      </span>
                    </div>
                    
                    <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-tight group-hover:text-indigo-600 transition-colors truncate mt-1">
                      {issue.location.address?.split(',')[0] || 'Local Incident'}
                    </h3>

                    <p className="text-xs sm:text-sm font-medium text-slate-500 leading-relaxed line-clamp-2 opacity-80 mt-1">
                      {issue.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-50">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                        <MapPin className="w-3 h-3 mr-1 text-indigo-400" />
                        <span className="truncate max-w-[120px] sm:max-w-[200px]">{issue.location.address?.split(',').slice(1,3).join(', ') || 'General Area'}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Details</span>
                      <ArrowUpRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-600 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedIssue && (
        <div className="fixed inset-0 z-[2000] bg-slate-900/80 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto no-scrollbar">
          <div className="bg-white w-full max-w-3xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20 animate-in zoom-in-95 duration-300 my-auto">
            <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verified Case ID</p>
                  <p className="text-sm font-black text-slate-900">#{selectedIssue.id.toUpperCase()}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedIssue(null)} 
                className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400 hover:text-rose-500"
              >
                <X className="w-5 h-5" />
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
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 space-y-3">
                    <ImageIcon className="w-16 h-16" />
                    <span className="text-[10px] font-black uppercase tracking-widest">No Visual Evidence Provided</span>
                  </div>
                )}
                <div className="absolute bottom-6 right-6 flex items-center space-x-2">
                   <div className="px-4 py-2 bg-slate-900/90 backdrop-blur text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center shadow-2xl border border-white/10">
                      <ImageIcon className="w-4 h-4 mr-2 text-indigo-400" />
                      Digital Evidence Archive
                   </div>
                </div>
              </div>

              <div className="p-8 sm:p-10">
                <div className="space-y-8">
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <StatusBadge status={selectedIssue.status} />
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-sm ${selectedIssue.priority === 'High' ? 'bg-rose-600' : 'bg-indigo-600'}`}>
                        {selectedIssue.priority} Priority Level
                      </span>
                      <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-600 bg-slate-100 border border-slate-200">
                        {getTranslation(currentLanguage, `category_${selectedIssue.category.toLowerCase().replace(' ', '_')}`)}
                      </span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight tracking-tight">
                      {selectedIssue.description}
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 pt-6 border-t border-slate-100">
                    <div className="space-y-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0 border border-indigo-100 shadow-sm">
                          <MapPin className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Geographical Location</p>
                          <p className="text-sm font-bold text-slate-700 leading-relaxed">{selectedIssue.location.address}</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0 border border-indigo-100 shadow-sm">
                          <Clock className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Timestamp</p>
                          <p className="text-sm font-bold text-slate-700">{selectedIssue.reportedAt.toLocaleString([], { dateStyle: 'full', timeStyle: 'short' })}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100 shadow-sm">
                          <UserCheck className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Authenticated Reporter</p>
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-black text-slate-900">{selectedIssue.reportedBy || 'Authorized Citizen'}</p>
                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                            <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Verified Log</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200 shadow-sm">
                          <Building2 className="w-5 h-5 text-slate-600" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Assigned Department</p>
                          <p className="text-sm font-bold text-slate-700">{DEPARTMENTS[selectedIssue.category] || 'General Municipal Council'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100 space-y-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Work Progress Tracking</p>
                        <p className="text-sm font-bold text-slate-700">Current case workflow for this report</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Current Stage</p>
                        <p className="text-sm font-black text-slate-900">{getProgressState(selectedIssue.status).label}</p>
                      </div>
                    </div>

                    <div className="space-y-3 rounded-3xl bg-slate-50 border border-slate-100 p-5">
                      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <span>Progress</span>
                        <span>{getProgressState(selectedIssue.status).percent}%</span>
                      </div>
                      <div className="h-3 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${getProgressState(selectedIssue.status).tone}`}
                          style={{ width: `${getProgressState(selectedIssue.status).percent}%` }}
                        />
                      </div>
                      <div className="grid grid-cols-4 gap-2 pt-1">
                        {['Reported', 'Review', 'In Progress', 'Resolved'].map((stage, index) => {
                          const stageActive = getProgressState(selectedIssue.status).stages[index];
                          return (
                            <div key={stage} className="flex flex-col items-center text-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${stageActive ? 'bg-indigo-600' : 'bg-slate-300'}`} />
                              <span className={`text-[9px] font-black uppercase tracking-widest leading-tight ${stageActive ? 'text-slate-900' : 'text-slate-400'}`}>{stage}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">SLA Target</p>
                        <p className="text-lg font-black text-slate-900">{SLA_HOURS[selectedIssue.category]} hours</p>
                        <p className="text-xs font-medium text-slate-500 mt-1">Guided by category-specific service expectations.</p>
                      </div>
                      <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tracking Status</p>
                        <p className="text-lg font-black text-slate-900 capitalize">{selectedIssue.status.toLowerCase()}</p>
                        <p className="text-xs font-medium text-slate-500 mt-1">Updated from the latest report lifecycle event.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Assigned Staff</p>
                        {selectedIssue.assignedStaff ? (
                          <div className="space-y-1">
                            <p className="text-base font-black text-slate-900">{selectedIssue.assignedStaff.name}</p>
                            <p className="text-sm font-medium text-slate-600">{selectedIssue.assignedStaff.title}</p>
                            <p className="text-xs text-slate-500">{selectedIssue.assignedStaff.phone}</p>
                            <p className="text-xs text-slate-500">{selectedIssue.assignedStaff.email}</p>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <p className="text-sm font-semibold text-slate-700">{CATEGORY_STAFF[selectedIssue.category][0].name}</p>
                            <p className="text-xs text-slate-500">{CATEGORY_STAFF[selectedIssue.category][0].title}</p>
                            <p className="text-xs text-slate-500">{CATEGORY_STAFF[selectedIssue.category][0].phone}</p>
                          </div>
                        )}
                      </div>

                      <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Progress Timeline</p>
                        <div className="space-y-3">
                          {(selectedIssue.progressUpdates && selectedIssue.progressUpdates.length > 0 ? selectedIssue.progressUpdates : [getIssueProgress(selectedIssue)]).slice(-4).map((update, index) => (
                            <div key={`${update.id}-${index}`} className="flex items-start gap-3">
                              <div className={`mt-1 w-2.5 h-2.5 rounded-full ${update.stage === 'Resolved' ? 'bg-emerald-500' : update.stage === 'In Progress' ? 'bg-indigo-500' : 'bg-slate-400'}`} />
                              <div className="min-w-0">
                                <p className="text-sm font-black text-slate-900">{update.stage} - {update.percent}%</p>
                                <p className="text-xs text-slate-500">{update.note}</p>
                                <p className="text-[10px] uppercase tracking-widest text-slate-400 mt-1">{update.updatedBy} • {new Date(update.updatedAt).toLocaleString()}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-3">The latest admin update appears here automatically.</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button 
                      onClick={() => setSelectedIssue(null)}
                      className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-blue-600 transition-all active:scale-[0.98] border-b-4 border-slate-800 hover:border-blue-800"
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