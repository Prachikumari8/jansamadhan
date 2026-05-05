#!/usr/bin/env python3

# Read the file
file_path = r'c:\Users\prach\OneDrive\Desktop\Projects\jansamadhan\pages\AdminPortal.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find and update the line with updateProgress for reopen button
updated_lines = []
for i, line in enumerate(lines):
    if "updateProgress(issue, 20, 'Reported'," in line:
        # Replace with In Progress version
        line = line.replace("updateProgress(issue, 20, 'Reported',", "updateProgress(issue, 40, 'In Progress',")
    updated_lines.append(line)

# Write back
with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(updated_lines)

print('Progress stage updated successfully')
