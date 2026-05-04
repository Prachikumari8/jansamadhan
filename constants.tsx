
import React from 'react';
import { 
  Hammer,
  Lightbulb,
  Waves,
  Trash2,
  Droplet,
  Zap,
  Cone,
  Plus
} from 'lucide-react';
import { IssueCategory, IssueStatus, StaffMember } from './types.ts';

export const DEPARTMENTS: Record<IssueCategory, string> = {
  [IssueCategory.POTHOLE]: 'Public Works (Roads)',
  [IssueCategory.STREETLIGHT]: 'Electrical Dept',
  [IssueCategory.DRAINAGE]: 'Sanitation & Drainage',
  [IssueCategory.GARBAGE]: 'Waste Management',
  [IssueCategory.WATER_SUPPLY]: 'Water Board',
  [IssueCategory.ELECTRICITY]: 'Power Grid',
  [IssueCategory.ROAD_DAMAGE]: 'Highways Authority',
  [IssueCategory.OTHER]: 'General Administration',
};

export const SLA_HOURS: Record<IssueCategory, number> = {
  [IssueCategory.POTHOLE]: 48,
  [IssueCategory.STREETLIGHT]: 24,
  [IssueCategory.DRAINAGE]: 12,
  [IssueCategory.GARBAGE]: 8,
  [IssueCategory.WATER_SUPPLY]: 12,
  [IssueCategory.ELECTRICITY]: 4,
  [IssueCategory.ROAD_DAMAGE]: 72,
  [IssueCategory.OTHER]: 72,
};

export interface CategoryTheme {
  symbol: React.ReactNode; 
  color: string;           
  bgIcon: string;          
  bgLight: string;         
  border: string;          
  subLabel: string;    
}

export const CATEGORY_CONFIG: Record<IssueCategory, CategoryTheme> = {
  [IssueCategory.POTHOLE]: { 
    symbol: <Hammer strokeWidth={2} className="w-5 h-5" />, 
    color: 'text-indigo-600',
    bgIcon: 'bg-slate-100',
    bgLight: 'bg-indigo-50/40',
    border: 'border-indigo-500',
    subLabel: 'Infrastructure'
  },
  [IssueCategory.STREETLIGHT]: { 
    symbol: <Lightbulb strokeWidth={2} className="w-5 h-5" />, 
    color: 'text-indigo-600',
    bgIcon: 'bg-slate-100',
    bgLight: 'bg-indigo-50/40',
    border: 'border-indigo-500',
    subLabel: 'Public Safety'
  },
  [IssueCategory.DRAINAGE]: { 
    symbol: <Waves strokeWidth={2} className="w-5 h-5" />, 
    color: 'text-indigo-600',
    bgIcon: 'bg-slate-100',
    bgLight: 'bg-indigo-50/40',
    border: 'border-indigo-500',
    subLabel: 'Sanitation'
  },
  [IssueCategory.GARBAGE]: { 
    symbol: <Trash2 strokeWidth={2} className="w-5 h-5" />, 
    color: 'text-indigo-600',
    bgIcon: 'bg-slate-100',
    bgLight: 'bg-indigo-50/40',
    border: 'border-indigo-500',
    subLabel: 'Environment'
  },
  [IssueCategory.WATER_SUPPLY]: { 
    symbol: <Droplet strokeWidth={2} className="w-5 h-5" />, 
    color: 'text-indigo-600',
    bgIcon: 'bg-slate-100',
    bgLight: 'bg-indigo-50/40',
    border: 'border-indigo-500',
    subLabel: 'Utilities'
  },
  [IssueCategory.ELECTRICITY]: { 
    symbol: <Zap strokeWidth={2} className="w-5 h-5" />, 
    color: 'text-indigo-600',
    bgIcon: 'bg-slate-100',
    bgLight: 'bg-indigo-50/40',
    border: 'border-indigo-500',
    subLabel: 'Utilities'
  },
  [IssueCategory.ROAD_DAMAGE]: { 
    symbol: <Cone strokeWidth={2} className="w-5 h-5" />, 
    color: 'text-indigo-600',
    bgIcon: 'bg-slate-100',
    bgLight: 'bg-indigo-50/40',
    border: 'border-indigo-500',
    subLabel: 'Traffic'
  },
  [IssueCategory.OTHER]: { 
    symbol: <Plus strokeWidth={2} className="w-5 h-5" />, 
    color: 'text-indigo-600',
    bgIcon: 'bg-slate-100',
    bgLight: 'bg-indigo-50/40',
    border: 'border-indigo-500',
    subLabel: 'General'
  },
};

export const STATUS_COLORS: Record<IssueStatus, string> = {
  [IssueStatus.REPORTED]: 'bg-slate-100 text-slate-700 border-slate-200',
  [IssueStatus.IN_PROGRESS]: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  [IssueStatus.RESOLVED]: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

export const ISSUE_PROGRESS_STAGES = [
  'Reported',
  'Surveyed',
  'Assigned',
  'In Progress',
  'Verification',
  'Resolved'
] as const;

export const CATEGORY_STAFF: Record<IssueCategory, StaffMember[]> = {
  [IssueCategory.POTHOLE]: [
    { name: 'Ravi Kumar', title: 'Road Inspector', phone: '+91 90000 10001', email: 'ravi.kumar@city.gov', shift: 'Morning' },
    { name: 'Nandini Rao', title: 'Field Supervisor', phone: '+91 90000 10002', email: 'nandini.rao@city.gov', shift: 'Evening' }
  ],
  [IssueCategory.STREETLIGHT]: [
    { name: 'Suresh Babu', title: 'Electrical Supervisor', phone: '+91 90000 20001', email: 'suresh.babu@city.gov', shift: 'Morning' },
    { name: 'Anita George', title: 'Light Crew Lead', phone: '+91 90000 20002', email: 'anita.george@city.gov', shift: 'Night' }
  ],
  [IssueCategory.DRAINAGE]: [
    { name: 'Prakash Singh', title: 'Drainage Engineer', phone: '+91 90000 30001', email: 'prakash.singh@city.gov', shift: 'Morning' },
    { name: 'Meera Das', title: 'Sanitation Inspector', phone: '+91 90000 30002', email: 'meera.das@city.gov', shift: 'Afternoon' }
  ],
  [IssueCategory.GARBAGE]: [
    { name: 'Salim Khan', title: 'Waste Ops Lead', phone: '+91 90000 40001', email: 'salim.khan@city.gov', shift: 'Morning' },
    { name: 'Kavya Menon', title: 'Collection Supervisor', phone: '+91 90000 40002', email: 'kavya.menon@city.gov', shift: 'Evening' }
  ],
  [IssueCategory.WATER_SUPPLY]: [
    { name: 'Arjun Patel', title: 'Water Board Officer', phone: '+91 90000 50001', email: 'arjun.patel@city.gov', shift: 'Morning' },
    { name: 'Shweta Iyer', title: 'Pipeline Technician', phone: '+91 90000 50002', email: 'shweta.iyer@city.gov', shift: 'Afternoon' }
  ],
  [IssueCategory.ELECTRICITY]: [
    { name: 'Deepak Verma', title: 'Grid Supervisor', phone: '+91 90000 60001', email: 'deepak.verma@city.gov', shift: 'Morning' },
    { name: 'Pooja Nair', title: 'Power Response Lead', phone: '+91 90000 60002', email: 'pooja.nair@city.gov', shift: 'Night' }
  ],
  [IssueCategory.ROAD_DAMAGE]: [
    { name: 'Rahul Sen', title: 'Highways Officer', phone: '+91 90000 70001', email: 'rahul.sen@city.gov', shift: 'Morning' },
    { name: 'Asha Khan', title: 'Repair Coordinator', phone: '+91 90000 70002', email: 'asha.khan@city.gov', shift: 'Afternoon' }
  ],
  [IssueCategory.OTHER]: [
    { name: 'Mohan Das', title: 'General Admin Lead', phone: '+91 90000 80001', email: 'mohan.das@city.gov', shift: 'Morning' },
    { name: 'Farah Ali', title: 'Citizen Support Desk', phone: '+91 90000 80002', email: 'farah.ali@city.gov', shift: 'Evening' }
  ]
};
