/**
 * WHISPER LEDGER: "Anonymous for Students, Accountable for Institutions"
 * Complete Full-Stack Privacy-First Campus Grievance Platform
 */

import React, { useState, useEffect } from 'react';
import {
  Shield,
  Search,
  Filter,
  PlusCircle,
  Activity,
  Layers,
  Sparkles,
  Lock,
  ThumbsUp,
  MapPin,
  RefreshCw,
  Send,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

import { User, Complaint, SystemAlert, EscalationLog, LedgerBlock, AnalyticsData } from './types';
import { api } from './services/api';
import { Navbar } from './components/Navbar';
import { ComplaintCard } from './components/ComplaintCard';
import { ComplaintDetailModal } from './components/ComplaintDetailModal';
import { SubmitComplaintModal } from './components/SubmitComplaintModal';
import { CampusHeatmap } from './components/CampusHeatmap';
import { EscalationSimulator } from './components/EscalationSimulator';
import { LedgerInspector } from './components/LedgerInspector';
import { AiClusteringPanel } from './components/AiClusteringPanel';
import { StudentDashboard } from './components/StudentDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { SpringBootViewer } from './components/SpringBootViewer';

import { StudentAuthModal } from './components/StudentAuthModal';
import { TrackComplaintModal } from './components/TrackComplaintModal';

// Predefined Demo Personas for Instant Hackathon Testing
const DEMO_USERS: User[] = [
  {
    id: 1,
    name: 'Ananya Sharma',
    email: 'ananya.s@bvrithyderabad.edu.in',
    enrollmentNumber: '25WH1A05B3',
    department: 'CSE',
    year: 3,
    role: 'STUDENT',
    anonymousId: 'ANON-CSE-8942-7F3A',
    isVerified: true,
  },
  {
    id: 2,
    name: 'Rohan Varma',
    email: 'rohan.v@bvrithyderabad.edu.in',
    enrollmentNumber: '22WH1A0412',
    department: 'ECE',
    year: 2,
    role: 'STUDENT',
    anonymousId: 'ANON-ECE-3419-BC90',
    isVerified: true,
  },
  {
    id: 3,
    name: 'Dr. K. Srinivas',
    email: 'hod.cse@bvrithyderabad.edu.in',
    enrollmentNumber: 'FAC-CSE-01',
    department: 'CSE',
    year: 0,
    role: 'HOD',
    anonymousId: 'STAFF-HOD-CSE',
  },
  {
    id: 4,
    name: 'Prof. Radhika Rao',
    email: 'dean.students@bvrithyderabad.edu.in',
    enrollmentNumber: 'FAC-DEAN-01',
    department: 'ALL',
    year: 0,
    role: 'DEAN',
    anonymousId: 'STAFF-DEAN',
  },
  {
    id: 5,
    name: 'Committee Chair G. Nair',
    email: 'grievance.chair@bvrithyderabad.edu.in',
    enrollmentNumber: 'FAC-GRV-01',
    department: 'ALL',
    year: 0,
    role: 'GRIEVANCE_COMMITTEE',
    anonymousId: 'STAFF-COMMITTEE',
  },
  {
    id: 6,
    name: 'Campus Admin',
    email: 'admin@bvrithyderabad.edu.in',
    enrollmentNumber: 'ADMIN-01',
    department: 'ADMIN',
    year: 0,
    role: 'ADMIN',
    anonymousId: 'STAFF-ADMIN',
  },
];

export default function App() {
  const [currentUser, setCurrentUser] = useState<User>(DEMO_USERS[0]);
  const [activeTab, setActiveTab] = useState<string>('feed'); // 'feed' | 'dashboard' | 'heatmap' | 'escalator' | 'ledger' | 'backend-docs'

  // Data Store State
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([]);
  const [escalationLogs, setEscalationLogs] = useState<EscalationLog[]>([]);
  const [ledgerBlocks, setLedgerBlocks] = useState<LedgerBlock[]>([]);
  const [isChainValid, setIsChainValid] = useState<boolean>(true);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  // Filter & Search State for Feed
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedDepartment, setSelectedDepartment] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [isStudentAuthModalOpen, setIsStudentAuthModalOpen] = useState(false);
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [quickTrackInput, setQuickTrackInput] = useState('');

  // Load all data from API
  const loadData = async () => {
    try {
      const [complaintsData, alertsData, logsData, ledgerData, analyticsData] = await Promise.all([
        api.getComplaints(currentUser.id),
        api.getAlerts(),
        api.getEscalations(),
        api.getLedgerBlocks(),
        api.getAnalytics(),
      ]);

      setComplaints(complaintsData);
      setSystemAlerts(alertsData);
      setEscalationLogs(logsData);
      setLedgerBlocks(ledgerData.blocks);
      setIsChainValid(ledgerData.isChainValid);
      setAnalytics(analyticsData);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser.id]);

  // Support Toggle ("Me Too")
  const handleSupport = async (complaintId: number) => {
    try {
      const updated = await api.toggleSupport(complaintId, currentUser.id);
      setComplaints((prev) =>
        prev.map((c) => (c.id === complaintId ? { ...c, ...updated } : c))
      );
      if (selectedComplaint && selectedComplaint.id === complaintId) {
        setSelectedComplaint((prev: Complaint | null) => (prev ? { ...prev, ...updated } : null));
      }
      // Refresh ledger blocks to reflect new endorsement block
      const ledgerData = await api.getLedgerBlocks();
      setLedgerBlocks(ledgerData.blocks);
    } catch (err) {
      console.error('Failed to toggle support:', err);
    }
  };

  // Status Update (HOD, Dean, Committee, Admin)
  const handleUpdateStatus = async (complaintId: number, newStatus: string, remarks: string) => {
    try {
      const updated = await api.updateStatus(complaintId, newStatus, remarks, currentUser.role);
      setComplaints((prev) =>
        prev.map((c) => (c.id === complaintId ? { ...c, ...updated } : c))
      );
      setSelectedComplaint((prev: Complaint | null) => (prev ? { ...prev, ...updated } : null));
      // Refresh analytics & ledger
      const [ledgerData, analyticsData] = await Promise.all([
        api.getLedgerBlocks(),
        api.getAnalytics(),
      ]);
      setLedgerBlocks(ledgerData.blocks);
      setAnalytics(analyticsData);
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  // Send Chat Message
  const handleSendMessage = async (complaintId: number, messageText: string) => {
    try {
      const newMsg = await api.sendMessage({
        complaintId,
        senderRole: currentUser.role,
        userLabel:
          currentUser.role === 'STUDENT'
            ? `Student (${currentUser.anonymousId})`
            : `${currentUser.role} (${currentUser.name})`,
        message: messageText,
      });

      setComplaints((prev) =>
        prev.map((c) => {
          if (c.id === complaintId) {
            return {
              ...c,
              messages: [...(c.messages || []), newMsg],
            };
          }
          return c;
        })
      );

      if (selectedComplaint && selectedComplaint.id === complaintId) {
        setSelectedComplaint((prev: Complaint | null) =>
          prev ? { ...prev, messages: [...(prev.messages || []), newMsg] } : null
        );
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  // Trigger Escalation Engine
  const handleTriggerEscalation = async (advanceDays: number, targetComplaintId?: number) => {
    const res = await api.triggerEscalation(advanceDays, targetComplaintId);
    // Reload updated complaints and escalation logs
    await loadData();
    return res;
  };

  // Trigger AI Clustering
  const handleTriggerClustering = async () => {
    const res = await api.triggerAiClustering();
    setSystemAlerts(res.alerts);
  };

  // Submission success callback
  const handleComplaintCreated = (newComplaint: Complaint) => {
    setComplaints((prev) => [newComplaint, ...prev]);
    loadData();
    setSelectedComplaint(newComplaint);
  };

  // Filter complaints in Public Ledger
  const filteredFeed = complaints.filter((c) => {
    if (selectedCategory !== 'ALL' && c.category !== selectedCategory) return false;
    if (selectedDepartment !== 'ALL' && c.department !== selectedDepartment) return false;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchTitle = c.title.toLowerCase().includes(query);
      const matchDesc = c.description.toLowerCase().includes(query);
      const matchAnon = c.anonymousId.toLowerCase().includes(query);
      return matchTitle || matchDesc || matchAnon;
    }
    return true;
  });

  const categories = [
    'ALL',
    'Ragging',
    'Harassment',
    'Hostel',
    'Academic',
    'Infrastructure',
    'Faculty Issue',
    'Safety',
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Universal Navigation Header with Role Switcher */}
      <Navbar
        currentUser={currentUser}
        onSelectUser={(u) => setCurrentUser(u)}
        availableUsers={DEMO_USERS}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSubmitModal={() => setIsSubmitModalOpen(true)}
        onOpenStudentAuthModal={() => setIsStudentAuthModalOpen(true)}
        onOpenTrackModal={() => setIsTrackModalOpen(true)}
        systemAlertCount={systemAlerts.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* VIEW 1: Public Transparent Feed */}
        {activeTab === 'feed' && (
          <div className="space-y-6">
            {/* Hero Banner */}
            <div className="bg-gradient-to-r from-[#1E3A8A] via-blue-800 to-indigo-900 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
              <div className="relative z-10 max-w-3xl">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-700/60 text-blue-200 border border-blue-500/40 mb-3">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  Institutional Student Authentication & Zero-Knowledge Anonymity
                </div>
                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                  Transparent Campus Grievance Ledger
                </h1>
                <p className="text-sm sm:text-base text-blue-100 mt-2 leading-relaxed">
                  Submit grievances with verified student enrollment without exposing your identity. Complaint handlers (HOD, Dean, Committee) only see randomized tracking IDs (e.g.{' '}
                  <strong className="font-mono bg-blue-900/60 px-1.5 py-0.5 rounded text-emerald-300">
                    GRV-8X42K7
                  </strong>
                  ).
                </p>

                {/* Primary Action Buttons: Student Login, Submit Grievance, Track */}
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setIsStudentAuthModalOpen(true)}
                    className="bg-amber-400 hover:bg-amber-300 text-blue-950 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold shadow-lg flex items-center gap-2 transition-transform hover:scale-105 active:scale-95"
                  >
                    <Lock className="w-4 h-4 text-blue-950" />
                    <span>Student Login (Verify Enrollment)</span>
                  </button>

                  {currentUser.role === 'STUDENT' ? (
                    <button
                      onClick={() => setIsSubmitModalOpen(true)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold shadow-lg flex items-center gap-2 transition-transform hover:scale-105 active:scale-95"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Submit Anonymous Grievance</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setActiveTab('dashboard')}
                      className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold shadow-lg flex items-center gap-2"
                    >
                      <span>Open Redressal Action Center ({currentUser.role})</span>
                    </button>
                  )}

                  <button
                    onClick={() => setIsTrackModalOpen(true)}
                    className="bg-blue-950/80 hover:bg-blue-950 text-blue-200 border border-blue-600/50 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5"
                  >
                    <Search className="w-4 h-4 text-emerald-400" />
                    <span>Track by Complaint ID (e.g. GRV-8X42K7)</span>
                  </button>
                </div>

                {/* Quick Tracking Search Bar */}
                <div className="mt-6 pt-4 border-t border-blue-700/60 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 max-w-xl">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-blue-300 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={quickTrackInput}
                      onChange={(e) => setQuickTrackInput(e.target.value.toUpperCase())}
                      placeholder="Enter Complaint Tracking ID (e.g. GRV-8X42K7)..."
                      className="w-full bg-blue-950/90 text-white text-xs font-mono font-bold tracking-wider placeholder:text-blue-300/60 pl-9 pr-3 py-2 rounded-xl border border-blue-500/60 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>
                  <button
                    onClick={async () => {
                      if (!quickTrackInput.trim()) {
                        setIsTrackModalOpen(true);
                        return;
                      }
                      const found = await api.getComplaintByCode(quickTrackInput.trim());
                      if (found) {
                        setSelectedComplaint(found);
                      } else {
                        setIsTrackModalOpen(true);
                      }
                    }}
                    className="bg-blue-700 hover:bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors shadow-2xs whitespace-nowrap"
                  >
                    Instant Track
                  </button>
                </div>
              </div>
            </div>

            {/* AI Synthesized Cluster Alerts Banner */}
            {systemAlerts.length > 0 && (
              <AiClusteringPanel
                alerts={systemAlerts}
                onTriggerClustering={handleTriggerClustering}
              />
            )}

            {/* Filter and Search Bar */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by keywords, campus issues, or anonymous ID (e.g. 'water', 'ANON-CSE')..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Category Pills / Select */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 text-xs">
                  <span className="text-slate-400 font-semibold text-[11px] whitespace-nowrap">Category:</span>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c === 'ALL' ? 'All Categories' : c}
                      </option>
                    ))}
                  </select>

                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800"
                  >
                    <option value="ALL">All Departments</option>
                    <option value="CSE">CSE</option>
                    <option value="ECE">ECE</option>
                    <option value="EEE">EEE</option>
                    <option value="Mech">Mech</option>
                    <option value="IT">IT</option>
                  </select>
                </div>
              </div>

              <div className="text-xs text-slate-500 flex items-center justify-between pt-2 border-t border-slate-100">
                <span>
                  Showing <strong>{filteredFeed.length}</strong> complaints in immutable ledger
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  SHA-256 Blockchain Verified
                </span>
              </div>
            </div>

            {/* Complaints Cards Grid */}
            {isLoading ? (
              <div className="text-center py-16 text-slate-400 text-sm">
                Synchronizing with Whisper Ledger Block Network...
              </div>
            ) : filteredFeed.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center text-slate-500 border border-slate-200">
                No grievances match your search criteria. Try a different filter or file a new grievance.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredFeed.map((complaint) => (
                  <ComplaintCard
                    key={complaint.id}
                    complaint={complaint}
                    onSupport={handleSupport}
                    onOpenDetails={(c) => setSelectedComplaint(c)}
                    isCurrentStudentOwner={complaint.anonymousId === currentUser.anonymousId}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: Dashboard (Student Hub vs Institutional Admin based on role) */}
        {activeTab === 'dashboard' && (
          <div>
            {currentUser.role === 'STUDENT' ? (
              <StudentDashboard
                currentUser={currentUser}
                complaints={complaints}
                onSupport={handleSupport}
                onOpenDetails={(c) => setSelectedComplaint(c)}
                onOpenSubmitModal={() => setIsSubmitModalOpen(true)}
              />
            ) : (
              <AdminDashboard
                currentUser={currentUser}
                complaints={complaints}
                systemAlerts={systemAlerts}
                onSupport={handleSupport}
                onOpenDetails={(c) => setSelectedComplaint(c)}
                onTriggerAiClustering={handleTriggerClustering}
              />
            )}
          </div>
        )}

        {/* VIEW 3: Campus Grievance Heatmap */}
        {activeTab === 'heatmap' && (
          <CampusHeatmap
            analytics={analytics}
            complaints={complaints}
            onSelectComplaint={(c) => setSelectedComplaint(c)}
          />
        )}

        {/* VIEW 4: Auto-Escalation Engine & Simulator */}
        {activeTab === 'escalator' && (
          <EscalationSimulator
            escalationLogs={escalationLogs}
            complaints={complaints}
            onTriggerEscalation={handleTriggerEscalation}
            onSelectComplaint={(c) => setSelectedComplaint(c)}
          />
        )}

        {/* VIEW 5: Cryptographic Block Audit Inspector */}
        {activeTab === 'ledger' && (
          <LedgerInspector
            blocks={ledgerBlocks}
            isChainValid={isChainValid}
            onRefresh={loadData}
          />
        )}

        {/* VIEW 6: Spring Boot 3 & MySQL Architecture Viewer */}
        {activeTab === 'backend-docs' && <SpringBootViewer />}
      </main>

      {/* MODAL 1: Submit Grievance Form */}
      <SubmitComplaintModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        currentUser={currentUser}
        existingComplaints={complaints}
        onSubmitSuccess={handleComplaintCreated}
      />

      {/* MODAL 2: Full Grievance Detail & Anonymous Two-Way Chat */}
      <ComplaintDetailModal
        complaint={selectedComplaint}
        onClose={() => setSelectedComplaint(null)}
        currentUser={currentUser}
        onSendMessage={handleSendMessage}
        onUpdateStatus={handleUpdateStatus}
        onSupport={handleSupport}
      />

      {/* MODAL 3: Institutional Student Authentication & Enrollment Verification */}
      <StudentAuthModal
        isOpen={isStudentAuthModalOpen}
        onClose={() => setIsStudentAuthModalOpen(false)}
        onLoginSuccess={(verifiedUser) => {
          setCurrentUser(verifiedUser);
          setActiveTab('dashboard');
        }}
        availableDemoStudents={DEMO_USERS}
      />

      {/* MODAL 4: Track Complaint by Anonymous ID (e.g. GRV-8X42K7) */}
      <TrackComplaintModal
        isOpen={isTrackModalOpen}
        onClose={() => setIsTrackModalOpen(false)}
        onSelectComplaint={(c) => setSelectedComplaint(c)}
      />

      {/* Bottom Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-700" />
            <strong className="text-slate-800">Whisper Ledger</strong>
            <span>• Privacy-First Campus Grievance & Redressal Protocol</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
            <span>Spring Boot 3 + MySQL + React 19 + Gemini AI</span>
            <span>•</span>
            <span className="text-emerald-600 font-bold">100% Cryptographic Ledger Integrity</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
