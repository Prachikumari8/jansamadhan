const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'pages/AdminPortal.tsx');
let content = fs.readFileSync(filePath, 'utf-8');
const lines = content.split('\n');

// Update only line 399 (the one in the closed tab - closed section starts earlier)
// We need to find the first occurrence and change only that one in the closed context
let inClosedSection = false;
let foundFirstReopen = false;

for (let i = 0; i < lines.length; i++) {
  // Check if we're entering the closed tab section
  if (lines[i].includes("reportedIssuesTab === 'closed'")) {
    inClosedSection = true;
  }
  
  // First occurrence of updateProgress with 'Reported' in the closed section
  if (inClosedSection && !foundFirstReopen && lines[i].includes("updateProgress(issue, 20, 'Reported',")) {
    lines[i] = lines[i].replace(
      "updateProgress(issue, 20, 'Reported',",
      "updateProgress(issue, 40, 'In Progress',"
    );
    foundFirstReopen = true;
    // Don't continue searching after this
    break;
  }
}

const updatedContent = lines.join('\n');
fs.writeFileSync(filePath, updatedContent, 'utf-8');
console.log('Successfully updated the Reopen button in closed tab!');
