const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'pages/AdminPortal.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// Replace the specific line with the correct stage
const oldLine = "                                    updateProgress(issue, 20, 'Reported', progressDrafts[issue.id] || 'Report reopened by admin for additional work.');";
const newLine = "                                    updateProgress(issue, 40, 'In Progress', progressDrafts[issue.id] || 'Report reopened by admin for additional work.');";

// Only replace the first occurrence (in the closed tab)
const index = content.indexOf(oldLine);
if (index !== -1) {
  content = content.substring(0, index) + newLine + content.substring(index + oldLine.length);
  console.log('Reopen button updated successfully!');
} else {
  console.log('Could not find the exact line to update');
}

fs.writeFileSync(filePath, content, 'utf-8');
