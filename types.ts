
export enum IssueCategory {
  POTHOLE = 'Pothole',
  STREETLIGHT = 'Streetlight',
  DRAINAGE = 'Drainage',
  GARBAGE = 'Garbage',
  WATER_SUPPLY = 'Water Supply',
  ELECTRICITY = 'Electricity',
  ROAD_DAMAGE = 'Road Damage',
  OTHER = 'Other'
}

export enum IssueStatus {
  REPORTED = 'Reported',
  IN_PROGRESS = 'In Progress',
  RESOLVED = 'Resolved'
}

export interface AddressDetails {
  area?: string;
  city?: string;
  district?: string;
  state?: string;
  pincode?: string;
  fullAddress?: string;
}

export interface Location {
  lat: number;
  lng: number;
  address?: string;
  details?: AddressDetails;
}

export interface LegalNotice {
  id: string;
  dateSubmitted: Date;
  status: 'Draft' | 'Submitted';
  sender: {
    name: string;
    mobile: string;
    email?: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  receiver: {
    name: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  info: {
    type: 'Payment Recovery' | 'Legal Warning' | 'Breach of Contract' | 'Defamation' | 'Other';
    subject: string;
    dateOfIncident: string;
    placeOfIncident: string;
  };
  content: {
    description: string;
    reliefDemanded: string;
    responseTime: '7 days' | '15 days' | '30 days';
  };
  attachments: string[]; // base64 strings
}

export interface StaffMember {
  name: string;
  title: string;
  phone: string;
  email: string;
  shift: string;
  area?: string;
  pincode?: string;
  city?: string;
  district?: string;
  state?: string;
}

export interface IssueProgressUpdate {
  id: string;
  stage: 'Reported' | 'Surveyed' | 'Assigned' | 'In Progress' | 'Verification' | 'Resolved';
  note: string;
  percent: number;
  updatedAt: Date;
  updatedBy: string;
}

export interface Issue {
  id: string;
  category: IssueCategory;
  description: string;
  aiAnalysis?: string;
  location: Location;
  photoUrl?: string;
  status: IssueStatus;
  reportedAt: Date;
  reportedBy: string;
  priority: 'Low' | 'Medium' | 'High';
  legalNotices?: LegalNotice[];
  assignedStaff?: StaffMember;
  progressUpdates?: IssueProgressUpdate[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'CITIZEN' | 'ADMIN' | 'STAFF';
  avatar?: string;
  phone?: string;
  staffCategory?: string; // Category for STAFF role (e.g., 'Pothole', 'Streetlight', etc.)
  staffArea?: string; // Assigned work area for STAFF role
  staffPincode?: string;
  staffCity?: string;
  staffDistrict?: string;
  staffState?: string;
  adminLocation?: {
    state: string;
    district: string;
    city: string;
    pincodes: string[];
    wards: string[];
  };
  joinedAt?: string; // ISO date string of when the user joined
}
