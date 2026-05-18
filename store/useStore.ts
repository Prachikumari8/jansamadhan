import { useState, useEffect } from 'react';
import { Issue, IssueStatus, User, IssueCategory, LegalNotice, IssueProgressUpdate, StaffMember } from '../types.ts';

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
let globalUsers: User[] = [];
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
    localStorage.setItem('jan_samadhan_v2_users', JSON.stringify(globalUsers));
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

    const savedUsers = localStorage.getItem('jan_samadhan_v2_users');
    globalUsers = savedUsers ? JSON.parse(savedUsers) : [];

    const savedUser = localStorage.getItem('jan_samadhan_v2_user');
    globalUser = savedUser ? JSON.parse(savedUser) : null;

    // DATA MIGRATION: If globalUsers is empty but we have staff or a current user, populate it
    if (globalUsers.length === 0) {
      const uniqueUsers = new Map<string, User>();
      
      // Add current user if exists
      if (globalUser) {
        uniqueUsers.set(globalUser.email, globalUser);
      }
      
      // Add all staff members
      globalStaffMembers.forEach(staff => {
        if (!uniqueUsers.has(staff.email)) {
          uniqueUsers.set(staff.email, {
            id: staff.userId || ('u_' + Math.random().toString(36).substr(2, 5)),
            name: staff.name,
            email: staff.email,
            phone: staff.phone,
            role: 'STAFF',
            staffCategory: staff.category,
            area: staff.area,
            pincode: staff.pincode,
            city: staff.city,
            district: staff.district,
            state: staff.state,
            joinedAt: new Date().toISOString()
          });
        }
      });

      // NEW: Scan issues for unique reporters to recover citizens
      globalIssues.forEach(issue => {
        const reporter = issue.reportedBy || 'Unknown';
        // Check if reporter is an email or just a name
        const email = reporter.includes('@') ? reporter : `${reporter.toLowerCase().replace(/\s+/g, '.')}@example.com`;
        
        if (!uniqueUsers.has(email)) {
          uniqueUsers.set(email, {
            id: 'u_' + Math.random().toString(36).substr(2, 5),
            name: reporter,
            email: email,
            role: 'CITIZEN',
            joinedAt: issue.reportedAt ? issue.reportedAt.toISOString() : new Date().toISOString()
          });
        }
      });

      globalUsers = Array.from(uniqueUsers.values());
      if (globalUsers.length > 0) {
        localStorage.setItem('jan_samadhan_v2_users', JSON.stringify(globalUsers));
      }
    }

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

const MAX_ACTIVE_ISSUES = 3;

export const useStore = () => {
  const [issues, setIssues] = useState<Issue[]>(globalIssues);
  const [users, setUsers] = useState<User[]>(globalUsers);
  const [currentUser, setCurrentUser] = useState<User | null>(globalUser);
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>(globalLanguage);

  useEffect(() => {
    const handleChange = () => {
      setIssues([...globalIssues]);
      setUsers([...globalUsers]);
      setCurrentUser(globalUser ? { ...globalUser } : null);
      setCurrentLanguage(globalLanguage);
    };
    listeners.push(handleChange);
    
    // Initial fetch of users if admin
    if (globalUser?.role === 'ADMIN') {
      refreshUsers();
    }

    return () => { listeners = listeners.filter(l => l !== handleChange); };
  }, []);

  const refreshUsers = async () => {
    try {
      const token = localStorage.getItem('jansamadhan_token');
      if (!token) return;

      const res = await fetch('http://localhost:5000/api/auth/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        globalUsers = data.data.users || [];
        saveToStorage();
        notify();
      }
    } catch (err) {
      console.error("Failed to fetch users from database", err);
    }
  };

  const autoAssignStaff = (issue: Issue): Issue => {
    const potentialStaff = globalStaffMembers.filter(m => {
      if (m.category !== issue.category) return false;
      
      const issueDetails = issue.location.details || {};
      const issueArea = issueDetails.area || "";
      const issuePincode = issueDetails.pincode || "";
      const issueCity = issueDetails.city || "";
      const issueDistrict = issueDetails.district || "";
      const fullAddress = (issue.location.address || "").toLowerCase();
      
      const safeMatch = (staffVal: string | undefined, issueVal: string | undefined) => {
         if (!staffVal || !issueVal) return false;
         const a = staffVal.toLowerCase().replace(/(city|town|rural area|district|county)/g, '').trim();
         const b = issueVal.toLowerCase().replace(/(city|town|rural area|district|county)/g, '').trim();
         if (a.length < 3 || b.length < 3) return false;
         return a.includes(b) || b.includes(a);
      };
      
      const matchAddressStr = (staffVal: string | undefined) => {
         if (!staffVal) return false;
         const clean = staffVal.toLowerCase().replace(/(city|town|rural area|district|county)/g, '').trim();
         if (clean.length < 3) return false;
         return fullAddress.includes(clean);
      };

      // Strict matching for area allocation
      const matchPincode = (m.pincode && issuePincode && m.pincode === issuePincode) || matchAddressStr(m.pincode);
      const matchArea = safeMatch(m.area, issueArea) || matchAddressStr(m.area);
      const matchCity = safeMatch(m.city, issueCity) || matchAddressStr(m.city);
      const matchDistrict = safeMatch(m.district, issueDistrict) || matchAddressStr(m.district);
                         
      return matchPincode || matchArea || matchCity || matchDistrict;
    });

    for (const staff of potentialStaff) {
      const activeWorkload = globalIssues.filter(i => 
        i.assignedStaff?.email === staff.email && 
        i.status !== IssueStatus.RESOLVED
      ).length;

      if (activeWorkload < MAX_ACTIVE_ISSUES) {
        return {
          ...issue,
          status: IssueStatus.IN_PROGRESS,
          assignedStaff: { ...staff },
          progressUpdates: [
            ...(issue.progressUpdates || []),
            {
              id: 'prog_' + Math.random().toString(36).substr(2, 7),
              stage: 'Assigned',
              note: `Automatically assigned to ${staff.name} (${staff.area || staff.city || 'Local'} Division)`,
              percent: 50,
              updatedAt: new Date(),
              updatedBy: 'System AI'
            }
          ]
        };
      }
    }

    // Keep as REPORTED and unassigned if no exact area staff is found or all are busy
    return issue;
  };

  const addIssue = (issue: Omit<Issue, 'id' | 'reportedAt' | 'status'>) => {
    let newIssue: Issue = {
      ...issue,
      id: Math.random().toString(36).substr(2, 9),
      reportedAt: new Date(),
      status: IssueStatus.REPORTED,
      legalNotices: []
    };

    // Try auto-assignment
    newIssue = autoAssignStaff(newIssue);

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
      globalUsers = globalUsers.map(u => u.id === globalUser?.id ? { ...u, ...data } : u);
      saveToStorage();
      notify();
    }
  };

  const updateAnyUser = (userId: string, data: Partial<User>) => {
    globalUsers = globalUsers.map(u => u.id === userId ? { ...u, ...data } : u);
    if (globalUser?.id === userId) {
      globalUser = { ...globalUser, ...data };
    }
    saveToStorage();
    notify();
  };

  const setUser = (user: User | null) => {
    globalUser = user;
    if (user && !globalUsers.some(u => u.id === user.id)) {
      globalUsers = [...globalUsers, user];
    }
    saveToStorage();
    notify();
  };

  const setLanguage = (language: LanguageCode) => {
    globalLanguage = language;
    saveToStorage();
    notify();
  };

  const login = (email: string, role?: User['role']) => {
    const existingUser = globalUsers.find(u => u.email === email);
    if (existingUser) {
      setUser(existingUser);
      return existingUser;
    }

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

  const signup = (
    name: string, 
    email: string, 
    phone?: string, 
    role?: User['role'], 
    staffCategory?: string, 
    staffArea?: string,
    staffPincode?: string,
    staffCity?: string,
    staffDistrict?: string,
    staffState?: string,
    adminLocation?: User['adminLocation']
  ) => {
    const resolvedRole: User['role'] = role || (email.includes('admin') ? 'ADMIN' : 'CITIZEN');
    const user: User = {
      id: 'u_' + Math.random().toString(36).substr(2, 5),
      name,
      email,
      phone,
      role: resolvedRole,
      staffCategory: resolvedRole === 'STAFF' ? staffCategory : undefined,
      area: resolvedRole === 'STAFF' ? staffArea : undefined,
      pincode: resolvedRole === 'STAFF' ? staffPincode : undefined,
      city: resolvedRole === 'STAFF' ? staffCity : undefined,
      district: resolvedRole === 'STAFF' ? staffDistrict : undefined,
      state: resolvedRole === 'STAFF' ? staffState : undefined,
      adminLocation: resolvedRole === 'ADMIN' ? adminLocation : undefined,
      joinedAt: new Date().toISOString()
    };

    setUser(user);
    
    // Add to staff directory if they signed up as STAFF
    if (resolvedRole === 'STAFF' && staffCategory) {
      // Check for duplicate — don't add if this email is already in the staff directory
      const alreadyRegistered = globalStaffMembers.some(m => m.email === email);
      if (!alreadyRegistered) {
        const staffMember: StaffMember & { userId: string; category: string; area: string } = {
          name,
          title: 'Field Staff',
          phone: phone || '+91 00000 00000',
          email,
          shift: 'Morning',
          userId: user.id,
          category: staffCategory,
          area: staffArea || 'Central',
          pincode: staffPincode,
          city: staffCity,
          district: staffDistrict,
          state: staffState
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

  const removeStaff = (email: string) => {
    globalStaffMembers = globalStaffMembers.filter(m => m.email !== email);
    saveToStorage();
    notify();
  };

  const updateStaffCategory = (email: string, newCategory: string) => {
    globalStaffMembers = globalStaffMembers.map(m => 
      m.email === email ? { ...m, category: newCategory } : m
    );
    saveToStorage();
    notify();
  };

  /**
   * Get next staff member in round-robin sequence for a category.
   * Cycles through available staff based on assignment history.
   */
  const getNextStaffForCategory = (category: IssueCategory): StaffMember => {
    const availableStaff = globalStaffMembers.filter(m => m.category === category);
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
    const totalStaff = globalStaffMembers.filter(m => m.category === category).length;
    return { currentIndex, totalStaff };
  };

  const removeUser = (userId: string) => {
    globalUsers = globalUsers.filter(u => u.id !== userId);
    if (globalUser?.id === userId) {
      globalUser = null;
    }
    saveToStorage();
    notify();
  };

  // Attach to window for the admin delete button to access easily
  if (typeof window !== 'undefined') {
    (window as any).removeUserFromSystem = removeUser;
  }

  return { 
    issues, 
    users,
    currentUser, 
    currentLanguage,
    updateUser,
    updateAnyUser,
    removeUser,
    addIssue, 
    updateIssueStatus,
    updateIssueProgress,
    findNearbyDuplicate,
    addLegalNoticeToIssue,
    setCurrentUser: setUser, 
    login, 
    signup,
    getRegisteredStaffByCategory,
    removeStaff,
    updateStaffCategory,
    getNextStaffForCategory,
    getStaffRotationState,
    setLanguage,
    refreshUsers
  };
};