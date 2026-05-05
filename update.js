const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'pages/AdminPortal.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// Replace the updateProgress call in the Reopen button
content = content.replace(
  "updateProgress(issue, 20, 'Reported',",
  "updateProgress(issue, 40, 'In Progress',"
);

// Replace the conditional wrapper for Progress Tracking
content = content.replace(
  '<div className="grid grid-cols-1 lg:grid-cols-3 gap-3">\n                          <div className="lg:col-span-2 rounded-2xl bg-slate-50 border border-slate-100 p-4">',
  '<div className="grid grid-cols-1 lg:grid-cols-3 gap-3">\n                          {reportedIssuesTab !== \'closed\' && (\n                            <div className="lg:col-span-2 rounded-2xl bg-slate-50 border border-slate-100 p-4">'
);

// Close the conditional wrapper
content = content.replace(
  '</textarea>\n                          </div>\n\n                          <div className="rounded-2xl border border-slate-100 bg-white p-4 space-y-3">',
  '</textarea>\n                            </div>\n                          )}\n\n                          <div className="rounded-2xl border border-slate-100 bg-white p-4 space-y-3">'
);

fs.writeFileSync(filePath, content, 'utf-8');
console.log('AdminPortal.tsx updated successfully!');
