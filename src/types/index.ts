export type UserRole = 'STUDENT' | 'HOD' | 'DEAN' | 'GRIEVANCE_COMMITTEE' | 'ADMIN';

export type ComplaintStatus = 'SUBMITTED' | 'UNDER_REVIEW' | 'IN_PROGRESS' | 'ESCALATED' | 'RESOLVED' | 'CLOSED';

export type ComplaintPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface User {
  id: number;
  name: string;
  email: string;
  department: string;
  year: number;
  role: UserRole;
  anonymousId: string;
  enrollmentNumber?: string;
  isVerified?: boolean;
}

export interface ComplaintMessage {
  id: number;
  complaintId: number;
  senderRole: string;
  senderLabel: string;
  message: string;
  createdAt: string;
}

export interface ComplaintStatusHistory {
  id: number;
  complaintId: number;
  oldStatus: string;
  newStatus: string;
  remarks: string;
  updatedAt: string;
}

export interface EscalationLog {
  id: number;
  complaintId: number;
  complaintTitle: string;
  currentLevel: string;
  escalatedTo: string;
  reason: string;
  timestamp: string;
}

export interface Complaint {
  id: number;
  complaintCode: string; // e.g. GRV-8X42K7
  title: string;
  description: string;
  category: string;
  department: string;
  year: number;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  anonymousId: string;
  supportCount: number;
  hasSupported?: boolean;
  supporters?: number[];
  createdAt: string;
  updatedAt: string;
  ageDays: number;
  ledgerBlockHash: string;
  statusHistory?: ComplaintStatusHistory[];
  messages?: ComplaintMessage[];
  escalationLogs?: EscalationLog[];
}

export interface SystemAlert {
  id: number;
  title: string;
  description: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  affectedCount: number;
  category: string;
  department: string;
  createdAt: string;
}

export interface LedgerBlock {
  blockIndex: number;
  complaintId: number;
  action: string;
  dataHash: string;
  prevHash: string;
  blockHash: string;
  timestamp: string;
}

export interface CampusZone {
  zone: string;
  category: string;
  activeGrievances: number;
  supporterTraction: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  coordinates: { x: number; y: number };
}

export interface AnalyticsData {
  departmentStats: Record<string, number>;
  categoryStats: Record<string, number>;
  statusStats: Record<string, number>;
  campusZones: CampusZone[];
  totalRecords: number;
}
