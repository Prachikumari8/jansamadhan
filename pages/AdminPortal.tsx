
import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from '../store/useStore.ts';
import { IssueStatus, IssueCategory, Issue } from '../types.ts';
import { IssueMap } from '../components/IssueMap.tsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useNavigate } from 'react-router-dom';
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
  ChevronDown
} from 'lucide-react';
import { CATEGORY_CONFIG, DEPARTMENTS, SLA_HOURS, CATEGORY_STAFF, ISSUE_PROGRESS_STAGES } from '../constants.tsx';
import { generateCityBriefing } from '../services/geminiService.ts';

export const AdminPortal: React.FC = () => {
  const { issues, updateIssueProgress } = useStore();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<'MAP' | 'QUEUE' | 'ANALYTICS'>('MAP');
  const [filterDept, setFilterDept] = useState<string>('All Departments');
  const [aiBriefing, setAiBriefing] = useState<string | null>(null);
  const [loadingBriefing, setLoadingBriefing] = useState(false);
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
      const deadline = new Date(issue.reportedAt.getTime() + slaLimit * 60 * 60 * 1000);
      const now = new Date();
      const hoursRemaining = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
      const slaConsumed = Math.min(100, Math.max(0, (1 - hoursRemaining / slaLimit) * 100));
      const latestProgress = issue.progressUpdates?.[issue.progressUpdates.length - 1];
      
      return {
        ...issue,
        department: DEPARTMENTS[issue.category],
        hoursRemaining,
        slaConsumed,
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

  const stats = useMemo(() => {
    const total = enrichedIssues.length;
    const resolved = enrichedIssues.filter(i => i.status === IssueStatus.RESOLVED).length;
    const active = total - resolved;
    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

    const breakdown = Object.values(IssueCategory).map(cat => {
      const count = enrichedIssues.filter(i => i.category === cat).length;
      return {
        category: cat,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0
      };
    }).sort((a, b) => b.count - a.count);

    return { total, resolved, active, resolutionRate, breakdown };
  }, [enrichedIssues]);

  const departmentSummary = useMemo(() => {
    return Object.values(IssueCategory).map(category => {
      const categoryIssues = enrichedIssues.filter(issue => issue.category === category);
      return {
        category,
        department: DEPARTMENTS[category],
        count: categoryIssues.length,
        staff: CATEGORY_STAFF[category]
      };
    });
  }, [enrichedIssues]);

  const updateProgress = (issue: Issue, percent: number, stage: typeof ISSUE_PROGRESS_STAGES[number], note: string) => {
    updateIssueProgress(issue.id, {
      stage,
      percent,
      note,
      updatedBy: issue.assignedStaff?.name || CATEGORY_STAFF[issue.category][0].name,
      assignedStaff: issue.assignedStaff || CATEGORY_STAFF[issue.category][0]
    });
    setProgressDrafts(drafts => ({ ...drafts, [issue.id]: '' }));
    setSelectedStageByIssue(stages => {
      const next = { ...stages };
      delete next[issue.id];
      return next;
    });
  };

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

  const handleGetBriefing = async () => {
    setLoadingBriefing(true);
    const summary = issues.reduce((acc, i) => {
      acc[i.category] = (acc[i.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const summaryStr = Object.entries(summary).map(([k, v]) => `${k}: ${v} reports`).join(', ');
    const briefing = await generateCityBriefing(summaryStr);
    if (briefing) setAiBriefing(briefing);
    setLoadingBriefing(false);
  };

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
            <div className="bg-slate-100 p-1 rounded-xl flex">
              <button 
                onClick={() => setActiveView('MAP')}
                className={`px-5 py-2 rounded-lg text-[10px] font-semibold uppercase tracking-widest transition-all ${activeView === 'MAP' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
              >
                Ops Map
              </button>
              <button 
                onClick={() => setActiveView('QUEUE')}
                className={`px-5 py-2 rounded-lg text-[10px] font-semibold uppercase tracking-widest transition-all ${activeView === 'QUEUE' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
              >
                Queue
              </button>
              <button 
                onClick={() => setActiveView('ANALYTICS')}
                className={`px-5 py-2 rounded-lg text-[10px] font-semibold uppercase tracking-widest transition-all ${activeView === 'ANALYTICS' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
              >
                Stats
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-[1600px] mx-auto w-full px-6 py-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-9 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {departmentSummary.map((item) => (
                <div key={item.category} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">{item.department}</p>
                      <h3 className="text-sm font-semibold text-slate-900">{item.category}</h3>
                    </div>
                    <span className="text-lg font-semibold text-slate-900">{item.count}</span>
                  </div>
                  <div className="space-y-2">
                    {item.staff.slice(0, 2).map((staff) => (
                      <div key={staff.email} className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2">
                        <p className="text-xs font-semibold text-slate-900">{staff.name}</p>
                        <p className="text-[10px] uppercase tracking-widest text-slate-500">{staff.title} • {staff.shift}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { label: 'Total Reports', value: stats.total, color: 'text-blue-600', icon: <FileText className="w-4 h-4" /> },
                { label: 'Resolved', value: stats.resolved, color: 'text-emerald-600', icon: <CheckCircle2 className="w-4 h-4" /> },
                { label: 'Active', value: stats.active, color: 'text-amber-600', icon: <AlertCircle className="w-4 h-4" /> },
                { label: 'Resolution Rate', value: `${stats.resolutionRate}%`, color: 'text-blue-600', icon: <TrendingUp className="w-4 h-4" /> },
              ].map((kpi, idx) => (
                <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="p-2 bg-slate-50 rounded-lg text-slate-400">{kpi.icon}</div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">{kpi.label}</span>
                  </div>
                  <p className={`text-2xl font-semibold text-slate-900`}>{kpi.value}</p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden min-h-[600px] flex flex-col">
              {activeView === 'MAP' && (
                <div className="relative h-[620px] w-full">
                  <IssueMap key={`admin-map-${filterDept}-${filteredIssues.length}`} issues={filteredIssues} />
                </div>
              )}

              {activeView === 'QUEUE' && (
                <div className="space-y-4">
                  {filteredIssues.map((issue) => {
                    const currentProgress = issue.latestProgress || {
                      stage: issue.status === IssueStatus.RESOLVED ? 'Resolved' : issue.status === IssueStatus.IN_PROGRESS ? 'In Progress' : 'Reported',
                      percent: issue.status === IssueStatus.RESOLVED ? 100 : issue.status === IssueStatus.IN_PROGRESS ? 60 : 20,
                      note: 'No manual progress update yet.',
                      updatedAt: issue.reportedAt,
                      updatedBy: issue.reportedBy
                    };
                    const selectedStage = selectedStageByIssue[issue.id];
                    const canReopen = issue.status === IssueStatus.RESOLVED || currentProgress.stage === 'Resolved';
                    const canMarkInProgress = !!selectedStage && selectedStage !== 'Resolved';

                    return (
                      <div key={issue.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-5">
                        <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-4">
                          <div className="space-y-2 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-widest">{issue.category}</span>
                              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">{issue.department}</span>
                              <span className={`text-[10px] font-semibold uppercase tracking-widest ${issue.isBreached ? 'text-rose-500' : 'text-slate-500'}`}>
                                {issue.isBreached ? 'SLA Breached' : `${issue.hoursRemaining.toFixed(1)}h left`}
                              </span>
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 leading-tight">{issue.description}</h3>
                            <p className="text-xs text-slate-500">Reported by {issue.reportedBy} • {issue.location.address || 'No address provided'}</p>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full xl:max-w-[460px]">
                            <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">Assigned Staff</p>
                              <p className="text-sm font-semibold text-slate-900">{issue.staff.name}</p>
                              <p className="text-xs text-slate-500">{issue.staff.title}</p>
                              <p className="text-[10px] text-slate-400 mt-2">{issue.staff.phone}</p>
                              <p className="text-[10px] text-slate-400">{issue.staff.email}</p>
                            </div>

                            <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Progress</p>
                                <span className="text-xs font-semibold text-slate-900">{currentProgress.percent}%</span>
                              </div>
                              <div className="h-2 rounded-full bg-slate-200 overflow-hidden mb-3">
                                <div className="h-full rounded-full bg-blue-600" style={{ width: `${currentProgress.percent}%` }} />
                              </div>
                              <p className="text-xs font-semibold text-slate-900">{currentProgress.stage}</p>
                              <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">{currentProgress.note}</p>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                          <div className="lg:col-span-2 rounded-2xl bg-slate-50 border border-slate-100 p-4">
                            <div className="flex items-center justify-between mb-3">
                              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Progress Tracking</p>
                              <span className="text-[10px] text-slate-500">Last update {new Date(currentProgress.updatedAt).toLocaleString()}</span>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-3">
                              {ISSUE_PROGRESS_STAGES.map((stage) => (
                                <button
                                  key={stage}
                                  onClick={() => setSelectedStageByIssue((prev) => ({ ...prev, [issue.id]: stage }))}
                                  className={`px-3 py-2 rounded-xl text-[10px] font-semibold uppercase tracking-widest border transition-all ${selectedStage === stage ? 'bg-slate-900 text-white border-slate-900' : currentProgress.stage === stage ? 'bg-slate-100 text-slate-700 border-slate-300' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600'}`}
                                >
                                  {stage}
                                </button>
                              ))}
                            </div>
                            <textarea
                              value={progressDrafts[issue.id] || ''}
                              onChange={(e) => setProgressDrafts(drafts => ({ ...drafts, [issue.id]: e.target.value }))}
                              placeholder="Add a short work note before saving the next update..."
                              className="w-full min-h-[88px] rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-100"
                            />
                          </div>

                          <div className="rounded-2xl border border-slate-100 bg-white p-4 space-y-3">
                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Quick Actions</p>
                            <button
                              onClick={() => {
                                if (!selectedStage || selectedStage === 'Resolved') return;
                                updateProgress(
                                  issue,
                                  getStagePercent(selectedStage),
                                  selectedStage,
                                  progressDrafts[issue.id] || `Moved to ${selectedStage.toLowerCase()} by admin.`
                                );
                              }}
                              disabled={!canMarkInProgress}
                              className="w-full rounded-xl bg-blue-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-4 py-3 text-xs font-semibold uppercase tracking-widest hover:bg-blue-500 transition-colors"
                            >
                              {canMarkInProgress ? 'Mark In Progress' : 'Select Stage First'}
                            </button>
                            <button
                              onClick={() => updateProgress(issue, 100, 'Resolved', progressDrafts[issue.id] || 'Report resolved and closed by admin review.')}
                              className="w-full rounded-xl bg-emerald-600 text-white px-4 py-3 text-xs font-semibold uppercase tracking-widest hover:bg-emerald-500 transition-colors"
                            >
                              Close Report
                            </button>
                            <button
                              onClick={() => {
                                if (!canReopen) return;
                                updateProgress(issue, 20, 'Reported', progressDrafts[issue.id] || 'Report reopened by admin for additional work.');
                              }}
                              disabled={!canReopen}
                              className="w-full rounded-xl bg-slate-100 disabled:bg-slate-100/70 disabled:text-slate-400 disabled:cursor-not-allowed text-slate-700 px-4 py-3 text-xs font-semibold uppercase tracking-widest hover:bg-slate-200 transition-colors"
                            >
                              Reopen
                            </button>
                            <button
                              onClick={() => navigate('/dashboard')}
                              className="w-full rounded-xl bg-white border border-slate-200 text-slate-700 px-4 py-3 text-xs font-semibold uppercase tracking-widest hover:border-blue-300 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
                            >
                              <Eye className="w-4 h-4" /> View in Dashboard
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {activeView === 'ANALYTICS' && (
                <div className="flex-1 p-8 space-y-12 overflow-y-auto">
                   <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                      {stats.breakdown.map((item, idx) => (
                         <div key={idx} className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                            <div className="flex justify-between items-end mb-4">
                               <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">{item.category}</p>
                               <span className="text-xs font-semibold text-slate-900">{item.count}</span>
                            </div>
                            <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                               <div className="h-full bg-blue-500" style={{ width: `${item.percentage}%` }} />
                            </div>
                         </div>
                      ))}
                   </div>

                   <div className="h-[400px] w-full bg-slate-50 rounded-2xl p-6 border border-slate-100">
                      <ResponsiveContainer width="100%" height="100%">
                         <AreaChart data={[{n: 'M', v: 40}, {n: 'T', v: 30}, {n: 'W', v: 45}, {n: 'T', v: 25}, {n: 'F', v: 60}, {n: 'S', v: 55}, {n: 'S', v: 70}]}>
                           <Area type="monotone" dataKey="v" stroke="#2563eb" fill="#2563eb10" strokeWidth={2} />
                         </AreaChart>
                      </ResponsiveContainer>
                   </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-3 space-y-6 lg:sticky lg:top-24">
            <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl">
              <h4 className="text-[10px] font-semibold uppercase tracking-widest text-blue-400 mb-6">Strategy Engine</h4>
              {aiBriefing ? (
                <div className="animate-in fade-in zoom-in duration-300">
                  <p className="text-xs text-slate-300 leading-relaxed italic">"{aiBriefing}"</p>
                  <button 
                    onClick={() => setAiBriefing(null)} 
                    className="mt-6 text-[9px] font-bold text-blue-400 uppercase tracking-widest hover:text-white transition-colors"
                  >
                    Clear Strategy
                  </button>
                </div>
              ) : (
                <button 
                  onClick={handleGetBriefing}
                  disabled={loadingBriefing}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 rounded-xl font-semibold text-[11px] uppercase tracking-widest transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {loadingBriefing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  <span>{loadingBriefing ? 'Analyzing...' : 'Generate Insight'}</span>
                </button>
              )}
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-600/10 blur-3xl rounded-full"></div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <h4 className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-4">Quick Links</h4>
              <div className="space-y-2">
                <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-50 text-xs font-semibold text-slate-700 flex justify-between items-center group transition-all">
                  <span>Export JSON Report</span>
                  <Download className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-500" />
                </button>
                <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-50 text-xs font-semibold text-slate-700 flex justify-between items-center group transition-all">
                  <span>Contact Field Ops</span>
                  <Navigation className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-500" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
