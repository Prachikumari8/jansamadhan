from pathlib import Path

path = Path(r'c:\Users\prach\OneDrive\Desktop\Projects\jansamadhan\pages\AdminPortal.tsx')
text = path.read_text(encoding='utf-8')

old_block = """                        <div className=\"grid grid-cols-1 lg:grid-cols-3 gap-3\">\n                          <div className=\"lg:col-span-2 rounded-2xl bg-slate-50 border border-slate-100 p-4\">\n                            <div className=\"flex items-center justify-between mb-3\">\n                              <p className=\"text-[10px] font-semibold text-slate-400 uppercase tracking-widest\">Progress Tracking</p>\n                              <span className=\"text-[10px] text-slate-500\">Last update {new Date(currentProgress.updatedAt).toLocaleString()}</span>\n                            </div>\n                            <div className=\"flex flex-wrap gap-2 mb-3\">\n                              {ISSUE_PROGRESS_STAGES.map((stage) => (\n                                <button\n                                  key={stage}\n                                  onClick={() => setSelectedStageByIssue((prev) => ({ ...prev, [issue.id]: stage }))}\n                                  className={`px-3 py-2 rounded-xl text-[10px] font-semibold uppercase tracking-widest border transition-all ${selectedStage === stage ? 'bg-slate-900 text-white border-slate-900' : currentProgress.stage === stage ? 'bg-slate-100 text-slate-700 border-slate-300' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600'}`}\n                                >\n                                  {stage}\n                                </button>\n                              ))}\n                            </div>\n                            <textarea\n                              value={progressDrafts[issue.id] || ''}\n                              onChange={(e) => setProgressDrafts(drafts => ({ ...drafts, [issue.id]: e.target.value }))}\n                              placeholder=\"Add a short work note before saving the next update...\"\n                              className=\"w-full min-h-[88px] rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-100\"\n                            />\n                          </div>\n\n                          <div className=\"rounded-2xl border border-slate-100 bg-white p-4 space-y-3\">\n"""

new_block = """                        <div className=\"grid grid-cols-1 lg:grid-cols-3 gap-3\">\n                          {reportedIssuesTab !== 'closed' && (\n                            <div className=\"lg:col-span-2 rounded-2xl bg-slate-50 border border-slate-100 p-4\">\n                              <div className=\"flex items-center justify-between mb-3\">\n                                <p className=\"text-[10px] font-semibold text-slate-400 uppercase tracking-widest\">Progress Tracking</p>\n                                <span className=\"text-[10px] text-slate-500\">Last update {new Date(currentProgress.updatedAt).toLocaleString()}</span>\n                              </div>\n                              <div className=\"flex flex-wrap gap-2 mb-3\">\n                                {ISSUE_PROGRESS_STAGES.map((stage) => (\n                                  <button\n                                    key={stage}\n                                    onClick={() => setSelectedStageByIssue((prev) => ({ ...prev, [issue.id]: stage }))}\n                                    className={`px-3 py-2 rounded-xl text-[10px] font-semibold uppercase tracking-widest border transition-all ${selectedStage === stage ? 'bg-slate-900 text-white border-slate-900' : currentProgress.stage === stage ? 'bg-slate-100 text-slate-700 border-slate-300' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600'}`}\n                                  >\n                                    {stage}\n                                  </button>\n                                ))}\n                              </div>\n                              <textarea\n                                value={progressDrafts[issue.id] || ''}\n                                onChange={(e) => setProgressDrafts(drafts => ({ ...drafts, [issue.id]: e.target.value }))}\n                                placeholder=\"Add a short work note before saving the next update...\"\n                                className=\"w-full min-h-[88px] rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-100\"\n                              />\n                            </div>\n                          )}\n\n                          <div className=\"rounded-2xl border border-slate-100 bg-white p-4 space-y-3\">\n"""

if old_block not in text:
    raise SystemExit('Progress block not found')
text = text.replace(old_block, new_block, 1)

old_reopen = """                                  onClick={() => {
                                    if (!canReopen) return;
                                    updateProgress(issue, 20, 'Reported', progressDrafts[issue.id] || 'Report reopened by admin for additional work.');
                                  }}
"""
new_reopen = """                                  onClick={() => {
                                    if (!canReopen) return;
                                    updateProgress(issue, 40, 'In Progress', progressDrafts[issue.id] || 'Report reopened by admin for additional work.');
                                  }}
"""

if old_reopen not in text:
    raise SystemExit('Reopen handler not found')
text = text.replace(old_reopen, new_reopen, 1)

path.write_text(text, encoding='utf-8')
print('AdminPortal updated')
