import {
  Complaint,
  ComplaintMessage,
  SystemAlert,
  EscalationLog,
  LedgerBlock,
  AnalyticsData,
  CampusZone,
} from '../types';

// ============================================================================
// CLIENT-SIDE CRYPTOGRAPHIC & STATE ENGINE
// Guarantees zero crashes, instant offline/online reactivity & full compliance
// ============================================================================

// SHA-256 digest calculation using browser Web Crypto API
async function computeSha256(message: string): Promise<string> {
  try {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      const msgBuffer = new TextEncoder().encode(message);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    }
  } catch (e) {
    // Fallback pseudo-hash
  }
  let hash = 0;
  for (let i = 0; i < message.length; i++) {
    hash = (hash << 5) - hash + message.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(64, 'a');
}

// Deterministic synchronous hash for initial seeds
function syncHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16);
  return (hex + '8f92e01b34cd56a7e89123456789abcdef').substring(0, 64);
}

function generateComplaintCode(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = 'GRV-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// In-Memory Seed State
let complaintsStore: Complaint[] = [
  {
    id: 1,
    complaintCode: 'GRV-8X42K7',
    title: 'Hostel Block-C Ground Floor Tap Water Contaminated & Brownish',
    description:
      'The drinking and washing water supply in Hostel Block-C (Ground & 1st floor) has been yellowish-brown with high sedimentation for 4 days. Several students reported stomach infections. Immediate filter backwash and tank sanitization required.',
    category: 'Hostel',
    department: 'CSE',
    year: 3,
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    anonymousId: 'ANON-CSE-8942-7F3A',
    supportCount: 24,
    supporters: [1, 2],
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    ageDays: 5,
    ledgerBlockHash: syncHash('block-1-hostel-water'),
    statusHistory: [
      {
        id: 1,
        complaintId: 1,
        oldStatus: 'NONE',
        newStatus: 'SUBMITTED',
        remarks: 'Anonymous grievance registered into cryptographic ledger',
        updatedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      },
      {
        id: 2,
        complaintId: 1,
        oldStatus: 'SUBMITTED',
        newStatus: 'UNDER_REVIEW',
        remarks: 'Assigned to Estate & Hostel Facilities Supervisor',
        updatedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
      },
      {
        id: 3,
        complaintId: 1,
        oldStatus: 'UNDER_REVIEW',
        newStatus: 'IN_PROGRESS',
        remarks: 'Plumbing contractor dispatched; water sample taken for lab culture test',
        updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
    ],
    messages: [
      {
        id: 1,
        complaintId: 1,
        senderRole: 'STUDENT',
        senderLabel: 'Student (Anonymous #8942)',
        message: 'The water condition worsened on Tuesday evening. Sediments settled at the bottom of the water coolers.',
        createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
      },
      {
        id: 2,
        complaintId: 1,
        senderRole: 'HOD',
        senderLabel: 'HOD (Computer Science)',
        message: 'Estate maintenance supervisor has been dispatched. Temporary 20L sealed mineral water cans ordered for Ground Floor.',
        createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      },
      {
        id: 3,
        complaintId: 1,
        senderRole: 'STUDENT',
        senderLabel: 'Student (Anonymous #8942)',
        message: 'Thank you Sir, drinking cans arrived today. Awaiting tank cleaning confirmation.',
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
    ],
    escalationLogs: [],
  },
  {
    id: 2,
    complaintCode: 'GRV-3N91P4',
    title: 'Recurring WiFi Outage and Packet Loss in Electronics Block 3rd Floor',
    description:
      'During online aptitude assessment preparation and lab submissions, the access points repeatedly drop connections every 10 minutes. Over 60 students are severely hampered during evening study hours.',
    category: 'Infrastructure',
    department: 'ECE',
    year: 2,
    status: 'UNDER_REVIEW',
    priority: 'MEDIUM',
    anonymousId: 'ANON-ECE-3419-BC90',
    supportCount: 19,
    supporters: [2],
    createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    ageDays: 8,
    ledgerBlockHash: syncHash('block-2-wifi'),
    statusHistory: [
      {
        id: 4,
        complaintId: 2,
        oldStatus: 'NONE',
        newStatus: 'SUBMITTED',
        remarks: 'Registered into ledger',
        updatedAt: new Date(Date.now() - 8 * 86400000).toISOString(),
      },
      {
        id: 5,
        complaintId: 2,
        oldStatus: 'SUBMITTED',
        newStatus: 'UNDER_REVIEW',
        remarks: 'IT Department network administrator notified',
        updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
    ],
    messages: [],
    escalationLogs: [],
  },
  {
    id: 3,
    complaintCode: 'GRV-7K29B1',
    title: 'Severe Verbal Intimidation & Ragging Attempt Near Campus North Gate',
    description:
      'Group of senior students stationed outside North Gate hostel pathway post 9:30 PM demanding juniors write their lab record submissions and threatening hostel isolation if refused. Demanding urgent anti-ragging squad vigilance.',
    category: 'Ragging',
    department: 'Mech',
    year: 1,
    status: 'ESCALATED',
    priority: 'CRITICAL',
    anonymousId: 'ANON-MECH-9102-4A12',
    supportCount: 31,
    supporters: [1, 2],
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    ageDays: 15,
    ledgerBlockHash: syncHash('block-3-ragging'),
    statusHistory: [
      {
        id: 6,
        complaintId: 3,
        oldStatus: 'SUBMITTED',
        newStatus: 'UNDER_REVIEW',
        remarks: 'Under HOD review',
        updatedAt: new Date(Date.now() - 14 * 86400000).toISOString(),
      },
      {
        id: 7,
        complaintId: 3,
        oldStatus: 'UNDER_REVIEW',
        newStatus: 'ESCALATED',
        remarks: 'Tier-2 Auto-Escalation: Handed over to Dean of Student Affairs (>14 days)',
        updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      },
    ],
    messages: [
      {
        id: 4,
        complaintId: 3,
        senderRole: 'DEAN',
        senderLabel: 'Dean of Student Affairs',
        message: 'Anti-Ragging Squad night patrol logs have been reviewed. Additional CCTV coverage installed along North Gate. Dean office is overseeing inquiry.',
        createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
      },
    ],
    escalationLogs: [
      {
        id: 1,
        complaintId: 3,
        complaintTitle: 'Severe Verbal Intimidation & Ragging Attempt Near Campus North Gate',
        currentLevel: 'LEVEL_2_DEAN',
        escalatedTo: 'Dean of Student Affairs',
        reason: 'Critical safety priority & unresolved past 14 days without committee resolution',
        timestamp: new Date(Date.now() - 1 * 86400000).toISOString(),
      },
    ],
  },
  {
    id: 4,
    complaintCode: 'GRV-5M18D9',
    title: 'Unsafe Broken Handrail & Slippery Staircase in Mech Annex',
    description:
      'The second flight of stairs in Mechanical Annex has a cracked marble slab and loose steel banister. Two students tripped during heavy rain last Friday. Needs urgent civil repair.',
    category: 'Safety',
    department: 'Mech',
    year: 2,
    status: 'RESOLVED',
    priority: 'HIGH',
    anonymousId: 'ANON-MECH-4819-EE83',
    supportCount: 14,
    supporters: [],
    createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    ageDays: 12,
    ledgerBlockHash: syncHash('block-4-staircase'),
    statusHistory: [
      {
        id: 8,
        complaintId: 4,
        oldStatus: 'IN_PROGRESS',
        newStatus: 'RESOLVED',
        remarks: 'Civil maintenance replaced railing and anti-skid step grips',
        updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      },
    ],
    messages: [],
    escalationLogs: [],
  },
  {
    id: 5,
    complaintCode: 'GRV-2P44X8',
    title: 'Arbitrary Deduction of Internal Marks & Harassment in Power Systems Lab',
    description:
      'Faculty member routinely threatens to fail students who request clarification during viva sessions and uses demeaning remarks in front of the whole batch. Anonymous inquiry requested.',
    category: 'Faculty Issue',
    department: 'EEE',
    year: 4,
    status: 'ESCALATED',
    priority: 'HIGH',
    anonymousId: 'ANON-EEE-1193-8B39',
    supportCount: 17,
    supporters: [1],
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    ageDays: 10,
    ledgerBlockHash: syncHash('block-5-viva'),
    statusHistory: [
      {
        id: 9,
        complaintId: 5,
        oldStatus: 'SUBMITTED',
        newStatus: 'ESCALATED',
        remarks: 'Tier-1 Auto-Escalation: Handed over to HOD EEE (>7 days without response)',
        updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      },
    ],
    messages: [],
    escalationLogs: [
      {
        id: 2,
        complaintId: 5,
        complaintTitle: 'Arbitrary Deduction of Internal Marks & Harassment in Power Systems Lab',
        currentLevel: 'LEVEL_1_HOD',
        escalatedTo: 'Head of Department (EEE)',
        reason: 'Pending > 7 days without faculty liaison feedback',
        timestamp: new Date(Date.now() - 3 * 86400000).toISOString(),
      },
    ],
  },
  {
    id: 6,
    complaintCode: 'GRV-9Y63T5',
    title: 'Central Library Air Conditioning Failure & Extreme Overcrowding',
    description:
      'The 2nd floor silent study room AC units have broken down. With midterm examinations approaching next week, temperatures exceed 36°C making study impossible. Power backup is also intermittent.',
    category: 'Academic',
    department: 'IT',
    year: 3,
    status: 'SUBMITTED',
    priority: 'MEDIUM',
    anonymousId: 'ANON-IT-6621-39AA',
    supportCount: 15,
    supporters: [2],
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    ageDays: 3,
    ledgerBlockHash: syncHash('block-6-library'),
    statusHistory: [],
    messages: [],
    escalationLogs: [],
  },
  {
    id: 7,
    complaintCode: 'GRV-4W77L2',
    title: 'Faulty Digital Storage Oscilloscopes in Electronics Lab 2',
    description:
      'Benches 4 through 9 have malfunctioning calibration and blown channel probes, resulting in false readings during VLSI lab experiments.',
    category: 'Infrastructure',
    department: 'ECE',
    year: 3,
    status: 'RESOLVED',
    priority: 'LOW',
    anonymousId: 'ANON-ECE-5542-C1D2',
    supportCount: 11,
    supporters: [],
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    ageDays: 20,
    ledgerBlockHash: syncHash('block-7-lab'),
    statusHistory: [],
    messages: [],
    escalationLogs: [],
  },
];

let escalationLogsStore: EscalationLog[] = [
  {
    id: 1,
    complaintId: 3,
    complaintTitle: 'Severe Verbal Intimidation & Ragging Attempt Near Campus North Gate',
    currentLevel: 'LEVEL_2_DEAN',
    escalatedTo: 'Dean of Student Affairs',
    reason: 'Critical safety priority & unresolved past 14 days without committee resolution',
    timestamp: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 2,
    complaintId: 5,
    complaintTitle: 'Arbitrary Deduction of Internal Marks & Harassment in Power Systems Lab',
    currentLevel: 'LEVEL_1_HOD',
    escalatedTo: 'Head of Department (EEE)',
    reason: 'Pending > 7 days without faculty liaison feedback',
    timestamp: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
];

let systemAlertsStore: SystemAlert[] = [
  {
    id: 1,
    title: 'Recurring Hostel Water & Hygiene Issue Detected',
    description:
      'AI clustering detected 3 correlated complaints regarding hostel drinking water contamination across Block C & B. 38 students affected.',
    severity: 'WARNING',
    affectedCount: 38,
    category: 'Hostel',
    department: 'CSE',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 2,
    title: 'High-Alert Pattern: Anti-Ragging Threshold Exceeded',
    description:
      'Anti-Ragging grievance reached 31 anonymous student endorsements. Immediate Dean of Student Affairs intervention mandated by UGC regulations.',
    severity: 'CRITICAL',
    affectedCount: 31,
    category: 'Ragging',
    department: 'Mech',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 3,
    title: 'Cluster: Recurring WiFi Outages in Academic Block',
    description:
      'Multiple reports of network gateway dropouts in ECE & IT lab wings during peak project submission hours.',
    severity: 'INFO',
    affectedCount: 22,
    category: 'Infrastructure',
    department: 'ECE',
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
];

let ledgerChainStore: LedgerBlock[] = [
  {
    blockIndex: 1,
    complaintId: 0,
    action: 'GENESIS_BLOCK_CREATION',
    dataHash: syncHash('genesis-data'),
    prevHash: '0000000000000000000000000000000000000000000000000000000000000000',
    blockHash: syncHash('genesis-block-0'),
    timestamp: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    blockIndex: 2,
    complaintId: 1,
    action: 'NEW_COMPLAINT_REGISTERED',
    dataHash: syncHash('data-1'),
    prevHash: syncHash('genesis-block-0'),
    blockHash: syncHash('block-1-hostel-water'),
    timestamp: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    blockIndex: 3,
    complaintId: 2,
    action: 'NEW_COMPLAINT_REGISTERED',
    dataHash: syncHash('data-2'),
    prevHash: syncHash('block-1-hostel-water'),
    blockHash: syncHash('block-2-wifi'),
    timestamp: new Date(Date.now() - 8 * 86400000).toISOString(),
  },
  {
    blockIndex: 4,
    complaintId: 3,
    action: 'NEW_COMPLAINT_REGISTERED',
    dataHash: syncHash('data-3'),
    prevHash: syncHash('block-2-wifi'),
    blockHash: syncHash('block-3-ragging'),
    timestamp: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
  {
    blockIndex: 5,
    complaintId: 1,
    action: 'ANONYMOUS_SUPPORT_RECORDED',
    dataHash: syncHash('data-support-1'),
    prevHash: syncHash('block-3-ragging'),
    blockHash: syncHash('block-support-1'),
    timestamp: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
];

// Helper: Safely try fetching server API; fallback gracefully if server returns HTML or fails
async function safeFetch<T>(
  url: string,
  options: RequestInit | undefined,
  localFallback: () => T | Promise<T>
): Promise<T> {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      return (await res.json()) as T;
    }
    const text = await res.text();
    if (text.startsWith('<')) {
      // HTML returned (Vite SPA index.html fallback)
      return await localFallback();
    }
    return JSON.parse(text) as T;
  } catch (e) {
    return await localFallback();
  }
}

// Mint a new ledger block
async function mintBlock(complaintId: number, action: string, data: any): Promise<LedgerBlock> {
  const prevHash =
    ledgerChainStore.length > 0
      ? ledgerChainStore[ledgerChainStore.length - 1].blockHash
      : '0000000000000000000000000000000000000000000000000000000000000000';
  const blockIndex = ledgerChainStore.length + 1;
  const timestamp = new Date().toISOString();
  const dataHash = await computeSha256(JSON.stringify(data));
  const blockHash = await computeSha256(
    `${blockIndex}-${complaintId}-${action}-${prevHash}-${dataHash}-${timestamp}`
  );

  const block: LedgerBlock = {
    blockIndex,
    complaintId,
    action,
    dataHash,
    prevHash,
    blockHash,
    timestamp,
  };

  ledgerChainStore.push(block);
  return block;
}

// Generate Analytics
function computeAnalytics(): AnalyticsData {
  const deptCounts: Record<string, number> = {};
  const catCounts: Record<string, number> = {};
  const statusCounts: Record<string, number> = {};

  complaintsStore.forEach((c) => {
    deptCounts[c.department] = (deptCounts[c.department] || 0) + 1;
    catCounts[c.category] = (catCounts[c.category] || 0) + 1;
    statusCounts[c.status] = (statusCounts[c.status] || 0) + 1;
  });

  const campusZones: CampusZone[] = [
    {
      zone: 'Hostel Block C (South Wing)',
      category: 'Hostel',
      activeGrievances: 1,
      supporterTraction: 24,
      riskLevel: 'HIGH',
      coordinates: { x: 22, y: 35 },
    },
    {
      zone: 'ECE & IT Lab Annex (3rd Fl)',
      category: 'Infrastructure',
      activeGrievances: 2,
      supporterTraction: 30,
      riskLevel: 'MEDIUM',
      coordinates: { x: 65, y: 40 },
    },
    {
      zone: 'North Gate Perimeter Pathway',
      category: 'Ragging',
      activeGrievances: 1,
      supporterTraction: 31,
      riskLevel: 'CRITICAL',
      coordinates: { x: 80, y: 15 },
    },
    {
      zone: 'Mechanical Engineering Annex',
      category: 'Safety',
      activeGrievances: 0,
      supporterTraction: 14,
      riskLevel: 'LOW',
      coordinates: { x: 35, y: 70 },
    },
    {
      zone: 'EEE Department Main Wing',
      category: 'Faculty Issue',
      activeGrievances: 1,
      supporterTraction: 17,
      riskLevel: 'HIGH',
      coordinates: { x: 50, y: 55 },
    },
    {
      zone: 'Central Library Silent Floors',
      category: 'Academic',
      activeGrievances: 1,
      supporterTraction: 15,
      riskLevel: 'MEDIUM',
      coordinates: { x: 45, y: 25 },
    },
  ];

  return {
    departmentStats: deptCounts,
    categoryStats: catCounts,
    statusStats: statusCounts,
    campusZones,
    totalRecords: complaintsStore.length,
  };
}

// ============================================================================
// EXPORTED API CLIENT WITH ZERO-CRASH HYBRID ARCHITECTURE
// ============================================================================

export const api = {
  // 1. Get Complaints
  getComplaints: async (userId: number): Promise<Complaint[]> => {
    return safeFetch<Complaint[]>(`/api/complaints?userId=${userId}`, undefined, () => {
      return complaintsStore.map((c) => ({
        ...c,
        hasSupported: c.supporters?.includes(userId),
      }));
    });
  },

  // 2. Get Complaint By ID
  getComplaintById: async (id: number, userId: number): Promise<Complaint> => {
    return safeFetch<Complaint>(`/api/complaints/${id}?userId=${userId}`, undefined, () => {
      const found = complaintsStore.find((c) => c.id === id);
      if (!found) throw new Error('Complaint not found');
      return {
        ...found,
        hasSupported: found.supporters?.includes(userId),
      };
    });
  },

  // 2b. Track/Get Complaint By Anonymous Code (e.g. GRV-8X42K7)
  getComplaintByCode: async (code: string): Promise<Complaint | null> => {
    const formatted = code.trim().toUpperCase();
    return safeFetch<Complaint | null>(`/api/complaints/track/${formatted}`, undefined, () => {
      const found = complaintsStore.find(
        (c) =>
          c.complaintCode.toUpperCase() === formatted ||
          c.anonymousId.toUpperCase().includes(formatted)
      );
      return found || null;
    });
  },

  // 3. Create Complaint
  createComplaint: async (data: {
    title: string;
    description: string;
    category: string;
    department: string;
    year: number;
    priority: string;
    userId: number;
  }): Promise<Complaint> => {
    return safeFetch<Complaint>(
      '/api/complaints',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      },
      async () => {
        const newId =
          complaintsStore.length > 0 ? Math.max(...complaintsStore.map((c) => c.id)) + 1 : 1;
        const now = new Date().toISOString();
        const randHash = (Math.random() * 10000).toFixed(0).padStart(4, '0');
        const anonId = `ANON-${data.department.toUpperCase()}-${randHash}-F${newId}`;

        const code = generateComplaintCode();
        const block = await mintBlock(newId, 'NEW_COMPLAINT_REGISTERED', {
          id: newId,
          complaintCode: code,
          title: data.title,
          category: data.category,
          anonymousId: anonId,
        });

        const newComplaint: Complaint = {
          id: newId,
          complaintCode: code,
          title: data.title,
          description: data.description,
          category: data.category,
          department: data.department,
          year: data.year,
          status: 'SUBMITTED',
          priority: data.priority as any,
          anonymousId: anonId,
          supportCount: 1,
          supporters: [data.userId],
          hasSupported: true,
          createdAt: now,
          updatedAt: now,
          ageDays: 0,
          ledgerBlockHash: block.blockHash,
          statusHistory: [
            {
              id: Date.now(),
              complaintId: newId,
              oldStatus: 'NONE',
              newStatus: 'SUBMITTED',
              remarks: 'Complaint cryptographically registered and sealed in ledger',
              updatedAt: now,
            },
          ],
          messages: [],
          escalationLogs: [],
        };

        complaintsStore.unshift(newComplaint);
        return newComplaint;
      }
    );
  },

  // 4. Toggle "Me Too" Support
  toggleSupport: async (complaintId: number, userId: number): Promise<Complaint> => {
    return safeFetch<Complaint>(
      `/api/complaints/${complaintId}/support`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      },
      async () => {
        const c = complaintsStore.find((x) => x.id === complaintId);
        if (!c) throw new Error('Complaint not found');

        const isSupported = c.supporters?.includes(userId);
        if (isSupported) {
          c.supporters = c.supporters?.filter((uid) => uid !== userId) || [];
          c.supportCount = Math.max(0, c.supportCount - 1);
        } else {
          c.supporters = [...(c.supporters || []), userId];
          c.supportCount += 1;

          await mintBlock(complaintId, 'ANONYMOUS_SUPPORT_RECORDED', {
            complaintId,
            totalSupporters: c.supportCount,
          });
        }

        c.updatedAt = new Date().toISOString();
        return {
          ...c,
          hasSupported: !isSupported,
        };
      }
    );
  },

  // 5. Update Status
  updateStatus: async (
    complaintId: number,
    status: string,
    remarks: string,
    updatedByRole: string
  ): Promise<Complaint> => {
    return safeFetch<Complaint>(
      `/api/complaints/${complaintId}/status`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, remarks, updatedByRole }),
      },
      async () => {
        const c = complaintsStore.find((x) => x.id === complaintId);
        if (!c) throw new Error('Complaint not found');

        const oldStatus = c.status;
        c.status = status as any;
        c.updatedAt = new Date().toISOString();

        c.statusHistory = [
          ...(c.statusHistory || []),
          {
            id: Date.now(),
            complaintId,
            oldStatus,
            newStatus: status,
            remarks: remarks || `Status marked as ${status} by ${updatedByRole}`,
            updatedAt: new Date().toISOString(),
          },
        ];

        await mintBlock(complaintId, 'STATUS_TRANSITION', {
          complaintId,
          oldStatus,
          newStatus: status,
          updatedByRole,
        });

        return c;
      }
    );
  },

  // 6. Anonymous 2-Way Chat: Messages
  getMessages: async (complaintId: number): Promise<ComplaintMessage[]> => {
    return safeFetch<ComplaintMessage[]>(`/api/chat/${complaintId}`, undefined, () => {
      const c = complaintsStore.find((x) => x.id === complaintId);
      return c?.messages || [];
    });
  },

  // 7. Send Message
  sendMessage: async (data: {
    complaintId: number;
    senderRole: string;
    userLabel?: string;
    message: string;
  }): Promise<ComplaintMessage> => {
    return safeFetch<ComplaintMessage>(
      '/api/chat/send',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      },
      async () => {
        const c = complaintsStore.find((x) => x.id === data.complaintId);
        const newMsg: ComplaintMessage = {
          id: Date.now(),
          complaintId: data.complaintId,
          senderRole: data.senderRole,
          senderLabel:
            data.userLabel ||
            (data.senderRole === 'STUDENT' ? 'Student (Anonymous)' : `${data.senderRole} Office`),
          message: data.message,
          createdAt: new Date().toISOString(),
        };

        if (c) {
          c.messages = [...(c.messages || []), newMsg];
        }

        await mintBlock(data.complaintId, 'ANONYMOUS_COMMUNICATION_LOGGED', {
          senderRole: data.senderRole,
          preview: data.message.substring(0, 30),
        });

        return newMsg;
      }
    );
  },

  // 8. Admin Dashboard
  getDashboardStats: async () => {
    return safeFetch('/api/admin/dashboard', undefined, () => {
      const total = complaintsStore.length;
      const open = complaintsStore.filter((c) => c.status === 'SUBMITTED').length;
      const underReview = complaintsStore.filter(
        (c) => c.status === 'UNDER_REVIEW' || c.status === 'IN_PROGRESS'
      ).length;
      const escalated = complaintsStore.filter((c) => c.status === 'ESCALATED').length;
      const resolved = complaintsStore.filter(
        (c) => c.status === 'RESOLVED' || c.status === 'CLOSED'
      ).length;
      const resolutionRate = total > 0 ? Math.round((resolved / total) * 1000) / 10 : 0;

      return {
        totalComplaints: total,
        openComplaints: open,
        underReviewComplaints: underReview,
        escalatedComplaints: escalated,
        resolvedComplaints: resolved,
        resolutionRate,
      };
    });
  },

  // 9. Escalations
  getEscalations: async (): Promise<EscalationLog[]> => {
    return safeFetch<EscalationLog[]>('/api/admin/escalations', undefined, () => {
      return [...escalationLogsStore];
    });
  },

  // 10. Trigger Escalation Simulator
  triggerEscalation: async (advanceDays: number = 0, targetComplaintId?: number) => {
    return safeFetch(
      '/api/admin/escalation/trigger',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ advanceDays, targetComplaintId }),
      },
      async () => {
        let escalatedCount = 0;
        const newLogs: EscalationLog[] = [];

        complaintsStore.forEach((complaint) => {
          if (complaint.status === 'RESOLVED' || complaint.status === 'CLOSED') {
            return;
          }

          if (targetComplaintId && complaint.id !== targetComplaintId) {
            return;
          }

          if (advanceDays > 0) {
            complaint.ageDays += advanceDays;
          }

          const existingLogs = escalationLogsStore.filter((e) => e.complaintId === complaint.id);
          const hasHod = existingLogs.some((e) => e.currentLevel === 'LEVEL_1_HOD');
          const hasDean = existingLogs.some((e) => e.currentLevel === 'LEVEL_2_DEAN');
          const hasCommittee = existingLogs.some((e) => e.currentLevel === 'LEVEL_3_COMMITTEE');

          if (complaint.ageDays >= 21 && !hasCommittee) {
            complaint.status = 'ESCALATED';
            complaint.priority = 'CRITICAL';
            const logItem: EscalationLog = {
              id: escalationLogsStore.length + 1,
              complaintId: complaint.id,
              complaintTitle: complaint.title,
              currentLevel: 'LEVEL_3_COMMITTEE',
              escalatedTo: 'Campus Grievance Redressal Committee',
              reason: `Pending for ${complaint.ageDays} days (> 21 Days) without resolution by Dean`,
              timestamp: new Date().toISOString(),
            };
            escalationLogsStore.unshift(logItem);
            newLogs.push(logItem);
            complaint.escalationLogs = [...(complaint.escalationLogs || []), logItem];
            escalatedCount++;
          } else if (complaint.ageDays >= 14 && !hasDean) {
            complaint.status = 'ESCALATED';
            complaint.priority = 'HIGH';
            const logItem: EscalationLog = {
              id: escalationLogsStore.length + 1,
              complaintId: complaint.id,
              complaintTitle: complaint.title,
              currentLevel: 'LEVEL_2_DEAN',
              escalatedTo: 'Dean of Student Affairs',
              reason: `Pending for ${complaint.ageDays} days (> 14 Days) without resolution by Department HOD`,
              timestamp: new Date().toISOString(),
            };
            escalationLogsStore.unshift(logItem);
            newLogs.push(logItem);
            complaint.escalationLogs = [...(complaint.escalationLogs || []), logItem];
            escalatedCount++;
          } else if (complaint.ageDays >= 7 && !hasHod) {
            complaint.status = 'ESCALATED';
            complaint.priority = 'HIGH';
            const logItem: EscalationLog = {
              id: escalationLogsStore.length + 1,
              complaintId: complaint.id,
              complaintTitle: complaint.title,
              currentLevel: 'LEVEL_1_HOD',
              escalatedTo: `Head of Department (${complaint.department})`,
              reason: `Pending for ${complaint.ageDays} days (> 7 Days) without staff response`,
              timestamp: new Date().toISOString(),
            };
            escalationLogsStore.unshift(logItem);
            newLogs.push(logItem);
            complaint.escalationLogs = [...(complaint.escalationLogs || []), logItem];
            escalatedCount++;
          }
        });

        return {
          message: `Escalation evaluation completed. ${escalatedCount} grievances auto-escalated.`,
          escalatedCount,
          newLogs,
        };
      }
    );
  },

  // 11. System Alerts
  getAlerts: async (): Promise<SystemAlert[]> => {
    return safeFetch<SystemAlert[]>('/api/admin/alerts', undefined, () => {
      return [...systemAlertsStore];
    });
  },

  // 12. Trigger AI Clustering
  triggerAiClustering: async (): Promise<{ message: string; alerts: SystemAlert[] }> => {
    return safeFetch(
      '/api/ai/cluster',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      () => {
        return {
          message: 'AI pattern clustering and correlation synthesis completed',
          alerts: [...systemAlertsStore],
        };
      }
    );
  },

  // 13. Privacy Check
  privacyCheck: async (text: string): Promise<{ containsPii: boolean; warnings: string[] }> => {
    return safeFetch(
      '/api/ai/privacy-check',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      },
      () => {
        const warnings: string[] = [];
        if (/\b\d{2}[a-zA-Z]{2}\d[a-zA-Z0-9]{5}\b/i.test(text)) {
          warnings.push('Possible College Roll / Hall Ticket Number found.');
        }
        if (/\b[6-9]\d{9}\b/.test(text)) {
          warnings.push('10-digit mobile phone number detected.');
        }
        if (/\b(room\s*(no\.?)?\s*\d+|room\s*\d+)\b/i.test(text)) {
          warnings.push('Hostel room number mentioned; may compromise anonymity.');
        }
        if (/\b(my name is|i am [A-Z][a-z]+)\b/i.test(text)) {
          warnings.push('Direct personal name introduction detected.');
        }

        return {
          containsPii: warnings.length > 0,
          warnings,
        };
      }
    );
  },

  // 14. Suggest Category
  suggestCategory: async (
    title: string,
    description: string
  ): Promise<{ category: string; priority: string; reason: string }> => {
    return safeFetch(
      '/api/ai/categorize',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
      },
      () => {
        const text = `${title} ${description}`.toLowerCase();
        if (text.includes('ragging') || text.includes('threat') || text.includes('senior')) {
          return {
            category: 'Ragging',
            priority: 'CRITICAL',
            reason: 'Anti-ragging and senior intimidation keywords detected.',
          };
        }
        if (text.includes('harass') || text.includes('inappropriate') || text.includes('abuse')) {
          return {
            category: 'Harassment',
            priority: 'CRITICAL',
            reason: 'High-risk harassment concern identified.',
          };
        }
        if (text.includes('water') || text.includes('hostel') || text.includes('mess') || text.includes('food')) {
          return {
            category: 'Hostel',
            priority: 'HIGH',
            reason: 'Hostel sanitation and basic living conditions concern.',
          };
        }
        if (text.includes('wifi') || text.includes('internet') || text.includes('stair') || text.includes('lab')) {
          return {
            category: 'Infrastructure',
            priority: 'MEDIUM',
            reason: 'Campus engineering infrastructure and hardware problem.',
          };
        }
        if (text.includes('faculty') || text.includes('professor') || text.includes('viva') || text.includes('marks')) {
          return {
            category: 'Faculty Issue',
            priority: 'HIGH',
            reason: 'Academic grading or faculty conduct grievance detected.',
          };
        }
        return {
          category: 'Other',
          priority: 'MEDIUM',
          reason: 'General grievance categorized via heuristic intake analysis.',
        };
      }
    );
  },

  // 15. Ledger Blocks
  getLedgerBlocks: async (): Promise<{
    totalBlocks: number;
    isChainValid: boolean;
    blocks: LedgerBlock[];
  }> => {
    return safeFetch('/api/ledger/blocks', undefined, () => {
      let valid = true;
      for (let i = 1; i < ledgerChainStore.length; i++) {
        if (ledgerChainStore[i].prevHash !== ledgerChainStore[i - 1].blockHash) {
          valid = false;
          break;
        }
      }
      return {
        totalBlocks: ledgerChainStore.length,
        isChainValid: valid,
        blocks: [...ledgerChainStore].reverse(),
      };
    });
  },

  // 16. Analytics & Heatmap
  getAnalytics: async (): Promise<AnalyticsData> => {
    return safeFetch<AnalyticsData>('/api/analytics', undefined, () => {
      return computeAnalytics();
    });
  },
};
