import React, { useState } from 'react';
import { Send, Clock, CheckCircle2, ShieldAlert, ThumbsUp, PlusCircle, Filter } from 'lucide-react';
import { Complaint, User } from '../types';
import { ComplaintCard } from './ComplaintCard';

interface StudentDashboardProps {
  currentUser: User;
  complaints: Complaint[];
  onSupport: (id: number) => void;
  onOpenDetails: (complaint: Complaint) => void;
  onOpenSubmitModal: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  currentUser,
  complaints,
  onSupport,
  onOpenDetails,
  onOpenSubmitModal,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'my' | 'supported'>('all');

  // Filter complaints based on student ownership or endorsement
  const myComplaints = complaints.filter((c) => c.anonymousId === currentUser.anonymousId);
  const supportedComplaints = complaints.filter((c) => c.hasSupported);

  const displayedComplaints =
    filterMode === 'my'
      ? myComplaints
      : filterMode === 'supported'
      ? supportedComplaints
      : complaints;

  // KPI calculations
  const totalSubmitted = complaints.filter((c) => c.status === 'SUBMITTED').length;
  const underReview = complaints.filter((c) => c.status === 'UNDER_REVIEW' || c.status === 'IN_PROGRESS').length;
  const escalated = complaints.filter((c) => c.status === 'ESCALATED').length;
  const resolved = complaints.filter((c) => c.status === 'RESOLVED' || c.status === 'CLOSED').length;

  return (
    <div className="space-y-6">
      {/* Student Welcome & Profile Pill */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-3xl p-6 sm:p-8 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Verified Active Student Enrollment ({currentUser.enrollmentNumber || '25WH1A05B3'})
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome, {currentUser.name}
            </h1>
            <p className="text-xs sm:text-sm text-blue-200 mt-1">
              Enrollment ID: <strong className="font-mono text-white">{currentUser.enrollmentNumber || '25WH1A05B3'}</strong> • Department: {currentUser.department} • Year {currentUser.year}
            </p>
            <div className="mt-3 bg-blue-950/70 border border-blue-700/60 rounded-xl p-2.5 text-xs text-blue-200/90 max-w-2xl leading-relaxed">
              🔒 <strong>Anonymity Preserved:</strong> While the institution verified your enrollment ({currentUser.enrollmentNumber || '25WH1A05B3'}), the committee and staff handling your grievances only see your generated <strong>Complaint ID (e.g. GRV-8X42K7)</strong>. Your name, email, and ID are completely redacted.
            </div>
          </div>

          <button
            onClick={onOpenSubmitModal}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold shadow-lg flex items-center gap-2 self-start sm:self-auto transition-transform hover:scale-105 active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Submit New Grievance</span>
          </button>
        </div>
      </div>

      {/* 4 Dashboard Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Submitted */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Submitted
            </span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
            {totalSubmitted}
          </div>
          <span className="text-[11px] text-slate-400 block mt-1">Awaiting staff intake</span>
        </div>

        {/* Card 2: Under Review */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">
              Under Review
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
            {underReview}
          </div>
          <span className="text-[11px] text-amber-600 font-medium block mt-1">Active investigation</span>
        </div>

        {/* Card 3: Escalated */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-red-600">
              Escalated
            </span>
            <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-red-600 font-mono">
            {escalated}
          </div>
          <span className="text-[11px] text-red-600 font-medium block mt-1">Sent to Dean/Committee</span>
        </div>

        {/* Card 4: Resolved */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
              Resolved
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 font-mono">
            {resolved}
          </div>
          <span className="text-[11px] text-emerald-600 font-medium block mt-1">Action confirmed</span>
        </div>
      </div>

      {/* Filter Tabs: All, My Complaints, Supported by Me */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterMode === 'all'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All Campus Grievances ({complaints.length})
            </button>
            <button
              onClick={() => setFilterMode('my')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterMode === 'my'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              My Filed Complaints ({myComplaints.length})
            </button>
            <button
              onClick={() => setFilterMode('supported')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterMode === 'supported'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Supported ("Me Too") ({supportedComplaints.length})
            </button>
          </div>

          <span className="text-xs text-slate-400">
            Showing {displayedComplaints.length} records
          </span>
        </div>

        {/* Complaints Grid */}
        {displayedComplaints.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No complaints found in this category. Submit your first anonymous grievance above!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayedComplaints.map((c) => (
              <ComplaintCard
                key={c.id}
                complaint={c}
                onSupport={onSupport}
                onOpenDetails={onOpenDetails}
                isCurrentStudentOwner={c.anonymousId === currentUser.anonymousId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
