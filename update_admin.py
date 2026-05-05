#!/usr/bin/env python3
import os

# Read the file
file_path = r'c:\Users\prach\OneDrive\Desktop\Projects\jansamadhan\pages\AdminPortal.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Wrap Progress Tracking section with conditional - opening
find_str = '''                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                          <div className="lg:col-span-2 rounded-2xl bg-slate-50 border border-slate-100 p-4">'''

replace_str = '''                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                          {reportedIssuesTab !== 'closed' && (
                            <div className="lg:col-span-2 rounded-2xl bg-slate-50 border border-slate-100 p-4">'''

content = content.replace(find_str, replace_str)

# Close the conditional before Quick Actions section - closing
find_str2 = '''                            </textarea>
                          </div>

                          <div className="rounded-2xl border border-slate-100 bg-white p-4 space-y-3">'''

replace_str2 = '''                              </textarea>
                            </div>
                          )}

                          <div className="rounded-2xl border border-slate-100 bg-white p-4 space-y-3">'''

content = content.replace(find_str2, replace_str2)

# Write the file back
with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Updates completed successfully')
