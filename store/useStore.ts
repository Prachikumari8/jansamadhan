import { useState, useEffect } from 'react';
import { Issue, IssueStatus, User, IssueCategory, LegalNotice, IssueProgressUpdate, StaffMember } from '../types.ts';

const INITIAL_ISSUES: Issue[] = [
  {
    id: 'tphuo3ijl',
    category: IssueCategory.POTHOLE,
    description: 'Severe road degradation with multiple large potholes.',
    location: { lat: 16.444, lng: 80.622, address: 'VADDESWARAM, TADEPALL...' },
    status: IssueStatus.REPORTED,
    reportedAt: new Date('2025-01-08'),
    reportedBy: 'Citizen Admin',
    priority: 'High',
    legalNotices: [],
    assignedStaff: {
      name: 'Ravi Kumar',
      title: 'Road Inspector',
      phone: '+91 90000 10001',
      email: 'ravi.kumar@city.gov',
      shift: 'Morning'
    },
    progressUpdates: [
      {
        id: 'p1',
        stage: 'Surveyed',
        note: 'Initial inspection completed and repair crew requested.',
        percent: 35,
        updatedAt: new Date('2025-01-09T09:30:00'),
        updatedBy: 'Ravi Kumar'
      }
    ]
  }
];

let globalIssues: Issue[] = [];
let globalUser: User | null = null;
let listeners: (() => void)[] = [];

const normalizeIssue = (issue: any): Issue => ({
  ...issue,
  reportedAt: new Date(issue.reportedAt),
  legalNotices: (issue.legalNotices || []).map((ln: any) => ({ ...ln, dateSubmitted: new Date(ln.dateSubmitted) })),
  progressUpdates: (issue.progressUpdates || []).map((update: any) => ({
    ...update,
    updatedAt: new Date(update.updatedAt)
  }))
});

const notify = () => {
  listeners.forEach(l => l());
};

const saveToStorage = () => {
  try {
    localStorage.setItem('jan_samadhan_v2_issues', JSON.stringify(globalIssues));
    if (globalUser) {
      localStorage.setItem('jan_samadhan_v2_user', JSON.stringify(globalUser));
    } else {
      localStorage.removeItem('jan_samadhan_v2_user');
    }
  } catch (e) {
    console.error("Failed to save state.", e);
  }
};

const loadFromStorage = () => {
  try {
    const savedIssues = localStorage.getItem('jan_samadhan_v2_issues');
    globalIssues = savedIssues ? JSON.parse(savedIssues).map((i: any) => normalizeIssue(i)) : [...INITIAL_ISSUES];

    const savedUser = localStorage.getItem('jan_samadhan_v2_user');
    globalUser = savedUser ? JSON.parse(savedUser) : null;
  } catch (e) {
    globalIssues = [...INITIAL_ISSUES];
  }
};

loadFromStorage();

export const useStore = () => {
  const [issues, setIssues] = useState<Issue[]>(globalIssues);
  const [currentUser, setCurrentUser] = useState<User | null>(globalUser);

  useEffect(() => {
    const handleChange = () => {
      setIssues([...globalIssues]);
      setCurrentUser(globalUser ? { ...globalUser } : null);
    };
    listeners.push(handleChange);
    return () => { listeners = listeners.filter(l => l !== handleChange); };
  }, []);

  const addIssue = (issue: Omit<Issue, 'id' | 'reportedAt' | 'status'>) => {
    const newIssue: Issue = {
      ...issue,
      id: Math.random().toString(36).substr(2, 9),
      reportedAt: new Date(),
      status: IssueStatus.REPORTED,
      legalNotices: []
    };
    globalIssues = [newIssue, ...globalIssues];
    saveToStorage();
    notify();
    return newIssue;
  };

  const updateIssueStatus = (issueId: string, status: IssueStatus) => {
    globalIssues = globalIssues.map(i => 
      i.id === issueId ? { ...i, status } : i
    );
    saveToStorage();
    notify();
  };

  const updateIssueProgress = (issueId: string, update: Omit<IssueProgressUpdate, 'id' | 'updatedAt'> & { updatedAt?: Date; assignedStaff?: StaffMember }) => {
    globalIssues = globalIssues.map(issue => {
      if (issue.id !== issueId) {
        return issue;
      }

      const nextProgress: IssueProgressUpdate = {
        id: 'prog_' + Math.random().toString(36).substr(2, 7),
        stage: update.stage,
        note: update.note,
        percent: update.percent,
        updatedAt: update.updatedAt || new Date(),
        updatedBy: update.updatedBy
      };

      return {
        ...issue,
        status: update.stage === 'Resolved' ? IssueStatus.RESOLVED : update.percent >= 40 ? IssueStatus.IN_PROGRESS : issue.status,
        assignedStaff: update.assignedStaff || issue.assignedStaff,
        progressUpdates: [...(issue.progressUpdates || []), nextProgress]
      };
    });
    saveToStorage();
    notify();
  };

  const findNearbyDuplicate = (lat: number, lng: number, category: IssueCategory) => {
    return globalIssues.find(i => 
      i.category === category && 
      Math.abs(i.location.lat - lat) < 0.001 && 
      Math.abs(i.location.lng - lng) < 0.001
    );
  };

  const addLegalNoticeToIssue = (issueId: string, noticeData: any) => {
    const notice: LegalNotice = {
      ...noticeData,
      id: 'LN-' + Math.random().toString(36).substr(2, 5).toUpperCase(),
      dateSubmitted: new Date(),
      status: 'Submitted'
    };
    globalIssues = globalIssues.map(i => 
      i.id === issueId 
        ? { ...i, legalNotices: [...(i.legalNotices || []), notice] }
        : i
    );
    saveToStorage();
    notify();
  };

  const updateUser = (data: Partial<User>) => {
    if (globalUser) {
      globalUser = { ...globalUser, ...data };
      saveToStorage();
      notify();
    }
  };

  const setUser = (user: User | null) => {
    globalUser = user;
    saveToStorage();
    notify();
  };

  const login = (email: string, role?: User['role']) => {
    const resolvedRole: User['role'] = role || (email.includes('admin') ? 'ADMIN' : 'CITIZEN');
    const user: User = {
      id: 'u_' + Math.random().toString(36).substr(2, 5),
      name: email.split('@')[0],
      email,
      role: resolvedRole
    };
    setUser(user);
    return user;
  };

  const signup = (name: string, email: string, phone?: string, role?: User['role']) => {
    const resolvedRole: User['role'] = role || (email.includes('admin') ? 'ADMIN' : 'CITIZEN');
    const user: User = {
      id: 'u_' + Math.random().toString(36).substr(2, 5),
      name,
      email,
      phone,
      role: resolvedRole
    };
    setUser(user);
    return user;
  };

  return { 
    issues, 
    currentUser, 
    updateUser,
    addIssue, 
    updateIssueStatus,
    updateIssueProgress,
    findNearbyDuplicate,
    addLegalNoticeToIssue,
    setCurrentUser: setUser, 
    login, 
    signup 
  };
};