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
  const { issues, updateIssueProgress, getRegisteredStaffByCategory } = useStore();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<'MAP' | 'QUEUE' | 'ANALYTICS'>('MAP');
  const [reportedIssuesTab, setReportedIssuesTab] = useState<'24hours' | 'inProgress' | 'closed'>('24hours');
  const [openCategories, setOpenCategories] = useState<Record<IssueCategory, boolean>>(() => {
    const init = {} as Record<IssueCategory, boolean>;
    Object.values(IssueCategory).forEach((c) => (init[c] = false));
    return init;
  });
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
      const reportedTime = typeof issue.reportedAt === 'string' ? new Date(issue.reportedAt).getTime() : issue.reportedAt.getTime();
      const deadline = new Date(reportedTime + slaLimit * 60 * 60 * 1000);
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
                Reported Issues
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-[1600px] mx-auto w-full px-6 py-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-9 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {activeView === 'MAP' && (
              <div className="md:col-span-2 xl:col-span-4 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 min-h-[680px] h-full">
                <h3 className="text-sm font-semibold text-slate-900 mb-4">Staff Directory</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {Object.values(IssueCategory).map((category) => {
                    const isOpen = openCategories[category];
                    const registeredStaff = getRegisteredStaffByCategory(category);
                    const defaultStaff = CATEGORY_STAFF[category];
                    const allStaff = [...registeredStaff, ...defaultStaff];
                    return (
                      <div key={category} className="rounded-lg overflow-hidden border border-slate-100">
                        <div className="flex items-center justify-between bg-slate-50 p-4">
                          <div className="min-w-0">
                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">{DEPARTMENTS[category]}</p>
                            <h4 className="text-sm font-bold text-slate-900 truncate">{category}</h4>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="inline-flex items-center justify-center w-8 h-8 bg-white text-slate-900 rounded-md border border-slate-100 font-semibold">{allStaff.length}</div>
                            <button
                              aria-expanded={isOpen}
                              onClick={() => setOpenCategories(prev => ({ ...prev, [category]: !prev[category] }))}
                              className={`flex items-center justify-center w-9 h-9 rounded-md shadow-sm transition ${isOpen ? 'bg-white text-slate-700 border border-slate-200' : 'bg-violet-600 text-white'}`}
                            >
                              <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                            </button>
                          </div>
                        </div>

                        {isOpen && (
                          <div className="bg-white p-3 max-h-[280px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-50 space-y-2" style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 #f8fafc' }}>
                            {allStaff.map((staff) => (
                              <div key={staff.email} className="flex items-center gap-3 rounded-lg p-3 border border-slate-100 hover:shadow-sm">
                                <div className="w-10 h-10 rounded-md bg-slate-100 flex items-center justify-center text-sm font-semibold text-slate-700">{staff.name.split(' ').map(n=>n[0]).slice(0,2).join('')}</div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-semibold text-slate-800 truncate">{staff.name}</p>
                                  <p className="text-xs text-slate-500 truncate">{staff.title} • <span className="font-medium">{staff.shift}</span></p>
                                  <p className="text-xs text-slate-400">{staff.phone}</p>
                                </div>
                                {'userId' in staff && <span className="text-[9px] bg-blue-100 text-blue-700 px-2 py-1 rounded whitespace-nowrap font-semibold">NEW</span>}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
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
                <div className="space-y-4 p-6">
                  <div className="flex gap-3 border-b border-slate-200 pb-4">
                    <button
                      onClick={() => setReportedIssuesTab('24hours')}
                      className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-widest transition-all ${reportedIssuesTab === '24hours' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                    >
                      Last 24 Hours
                    </button>
                    <button
                      onClick={() => setReportedIssuesTab('inProgress')}
                      className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-widest transition-all ${reportedIssuesTab === 'inProgress' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                    >
                      In Progress
                    </button>
                    <button
                      onClick={() => setReportedIssuesTab('closed')}
                      className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-widest transition-all ${reportedIssuesTab === 'closed' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                    >
                      Closed/Resolved
                    </button>
                  </div>
                  {reportedIssuesByTab.length > 0 ? (
                    reportedIssuesByTab.map((issue) => {
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
                          {reportedIssuesTab !== 'closed' && (
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
                          )}

                          <div className="rounded-2xl border border-slate-100 bg-white p-4 space-y-3">
                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Quick Actions</p>
                            {reportedIssuesTab === 'closed' ? (
                              <>
                                <button
                                  onClick={() => {
                                    if (!canReopen) return;
                                    updateProgress(issue, 40, 'In Progress', progressDrafts[issue.id] || 'Report reopened by admin for additional work.');
                                  }}
                                  disabled={false}
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
                              </>
                            ) : (
                              <>
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
                                  disabled={false}
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
                              </>
                            )}
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
              )}

                {/* Analytics view removed */}
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
