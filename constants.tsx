
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
