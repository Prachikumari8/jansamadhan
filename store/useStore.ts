import { useState, useEffect } from 'react';
import { Issue, IssueStatus, User, IssueCategory, LegalNotice, IssueProgressUpdate, StaffMember } from '../types.ts';
import { CATEGORY_STAFF } from '../constants.tsx';
import { defaultLanguage, type LanguageCode } from '../services/i18n.ts';

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
let globalStaffMembers: (StaffMember & { userId: string; category: string })[] = [];
let globalLanguage: LanguageCode = defaultLanguage;
let listeners: (() => void)[] = [];

// Track last assigned staff index per category for round-robin scheduling
let staffAssignmentIndex: Record<IssueCategory, number> = {} as Record<IssueCategory, number>;

const initStaffAssignmentIndex = () => {
  Object.values(IssueCategory).forEach((category) => {
    staffAssignmentIndex[category] = 0;
  });
};

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
    localStorage.setItem('jan_samadhan_v2_staff', JSON.stringify(globalStaffMembers));
    localStorage.setItem('jan_samadhan_v2_assignment_index', JSON.stringify(staffAssignmentIndex));
    localStorage.setItem('jan_samadhan_v2_language', globalLanguage);
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

    const savedStaff = localStorage.getItem('jan_samadhan_v2_staff');
    globalStaffMembers = savedStaff ? JSON.parse(savedStaff) : [];

    const savedUser = localStorage.getItem('jan_samadhan_v2_user');
    globalUser = savedUser ? JSON.parse(savedUser) : null;

    const savedLanguage = localStorage.getItem('jan_samadhan_v2_language') as LanguageCode | null;
    globalLanguage = savedLanguage || defaultLanguage;

    const savedIndex = localStorage.getItem('jan_samadhan_v2_assignment_index');
    staffAssignmentIndex = savedIndex ? JSON.parse(savedIndex) : {};
    initStaffAssignmentIndex();
  } catch (e) {
    globalIssues = [...INITIAL_ISSUES];
    initStaffAssignmentIndex();
  }
};

loadFromStorage();

export const useStore = () => {
  const [issues, setIssues] = useState<Issue[]>(globalIssues);
  const [currentUser, setCurrentUser] = useState<User | null>(globalUser);
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>(globalLanguage);

  useEffect(() => {
    const handleChange = () => {
      setIssues([...globalIssues]);
      setCurrentUser(globalUser ? { ...globalUser } : null);
      setCurrentLanguage(globalLanguage);
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

  const setLanguage = (language: LanguageCode) => {
    globalLanguage = language;
    saveToStorage();
    notify();
  };

  const login = (email: string, role?: User['role']) => {
    const resolvedRole: User['role'] = role || (email.includes('admin') ? 'ADMIN' : 'CITIZEN');
    const user: User = {
      id: 'u_' + Math.random().toString(36).substr(2, 5),
      name: email.split('@')[0],
      email,
      role: resolvedRole,
      joinedAt: new Date().toISOString()
    };
    setUser(user);
    return user;
  };

  const signup = (name: string, email: string, phone?: string, role?: User['role'], staffCategory?: string) => {
    const resolvedRole: User['role'] = role || (email.includes('admin') ? 'ADMIN' : 'CITIZEN');
    const user: User = {
      id: 'u_' + Math.random().toString(36).substr(2, 5),
      name,
      email,
      phone,
      role: resolvedRole,
      staffCategory: resolvedRole === 'STAFF' ? staffCategory : undefined,
      joinedAt: new Date().toISOString()
    };
    setUser(user);
    
    // Add to staff directory if they signed up as STAFF
    if (resolvedRole === 'STAFF' && staffCategory) {
      // Check for duplicate — don't add if this email is already in the staff directory
      const alreadyRegistered = globalStaffMembers.some(m => m.email === email);
      if (!alreadyRegistered) {
        const staffMember: StaffMember & { userId: string; category: string } = {
          name,
          title: 'Field Staff',
          phone: phone || '+91 00000 00000',
          email,
          shift: 'Morning',
          userId: user.id,
          category: staffCategory
        };
        globalStaffMembers = [...globalStaffMembers, staffMember];
        saveToStorage();
      }
    }
    return user;
  };

  const getRegisteredStaffByCategory = (category: string): (StaffMember & { userId: string })[] => {
    return globalStaffMembers.filter(m => m.category === category).map(({ userId, category, ...staff }) => ({ ...staff, userId }));
  };

  /**
   * Get next staff member in round-robin sequence for a category.
   * Cycles through available staff based on assignment history.
   */
  const getNextStaffForCategory = (category: IssueCategory): StaffMember => {
    const availableStaff = CATEGORY_STAFF[category] || [];
    if (availableStaff.length === 0) {
      return { name: 'Unassigned', title: 'N/A', phone: 'N/A', email: 'N/A', shift: 'N/A' };
    }

    // Get current index for this category
    if (!staffAssignmentIndex[category]) {
      staffAssignmentIndex[category] = 0;
    }

    const nextStaff = availableStaff[staffAssignmentIndex[category]];
    
    // Move to next staff for next assignment
    staffAssignmentIndex[category] = (staffAssignmentIndex[category] + 1) % availableStaff.length;
    
    // Persist the updated index
    saveToStorage();
    
    return nextStaff;
  };

  /**
   * Get current staff assignment rotation state (for UI display)
   */
  const getStaffRotationState = (category: IssueCategory) => {
    const currentIndex = staffAssignmentIndex[category] || 0;
    const totalStaff = CATEGORY_STAFF[category]?.length || 0;
    return { currentIndex, totalStaff };
  };

  return { 
    issues, 
    currentUser, 
    currentLanguage,
    updateUser,
    addIssue, 
    updateIssueStatus,
    updateIssueProgress,
    findNearbyDuplicate,
    addLegalNoticeToIssue,
    setCurrentUser: setUser, 
    login, 
    signup,
    getRegisteredStaffByCategory,
    getNextStaffForCategory,
    getStaffRotationState,
    setLanguage
  };
};