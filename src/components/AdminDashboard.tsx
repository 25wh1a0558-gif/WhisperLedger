import React, { useState } from 'react';
import { Shield, Clock, CheckCircle2, ShieldAlert, BarChart3, TrendingUp, Users, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { Complaint, User, SystemAlert } from '../types';
import { ComplaintCard } from './ComplaintCard';

interface AdminDashboardProps {
  currentUser: User;
  complaints: Complaint[];
  systemAlerts: SystemAlert[];
  onSupport: (id: number) => void;
  onOpenDetails: (complaint: Complaint) => void;
  onTriggerAiClustering: () => Promise<void>;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  complaints,
  systemAlerts,
  onSupport,
  onOpenDetails,
  onTriggerAiClustering,
}) => {
  const [filterDepartment, setFilterDepartment] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Stats
  const total = complaints.length;
  const open = complaints.filter((c) => c.status === 'SUBMITTED').length;
  const underReview = complaints.filter((c) => c.status === 'UNDER_REVIEW' || c.status === 'IN_PROGRESS').length;
  const escalated = complaints.filter((c) => c.status === 'ESCALATED').length;
  const resolved = complaints.filter((c) => c.status === 'RESOLVED' || c.status === 'CLOSED').length;
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 1000) / 10 : 0;

  // Department counts
  const deptCounts: Record<string, number> = {};
  complaints.forEach((c) => {
    deptCounts[c.department] = (deptCounts[c.department] || 0) + 1;
  });

  // Category counts
  const catCounts: Record<string, number> = {};
  complaints.forEach((c) => {
    catCounts[c.category] = (catCounts[c.category] || 0) + 1;
  });

  // Filtered grievances
  const filteredComplaints = complaints.filter((c) => {
    if (filterDepartment !== 'ALL' && c.department !== filterDepartment) return false;
    if (filterStatus !== 'ALL' && c.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-[#1E3A8A] to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-800/80 text-blue-200 border border-blue-700 mb-2">
              <Shield className="w-3.5 h-3.5 text-blue-400" />
              Administrative Command Center • {currentUser.role}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Institutional Redressal Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-blue-200 mt-1">
              Logged in as: <strong>{currentUser.name}</strong> • Jurisdiction: {currentUser.department}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto bg-blue-900/60 p-3 rounded-2xl border border-blue-700/60 text-xs">
            <div>
              <span className="text-blue-300 block text-[10px]">CAMPUS RESOLUTION RATE</span>
              <span className="text-xl font-bold font-mono text-emerald-400">{resolutionRate}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Core Admin KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Complaints */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Total Grievances
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono mt-2">
            {total}
          </div>
          <span className="text-[11px] text-slate-400 block mt-1">Cryptographically tracked</span>
        </div>

        {/* Open Complaints */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">
            Open / Pending Intake
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 font-mono mt-2">
            {open}
          </div>
          <span className="text-[11px] text-amber-600 font-medium block mt-1">Requires acknowledgement</span>
        </div>

        {/* Escalated Complaints */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-red-600">
            Escalated Grievances
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-red-600 font-mono mt-2 animate-pulse">
            {escalated}
          </div>
          <span className="text-[11px] text-red-600 font-medium block mt-1">High-priority intervention</span>
        </div>

        {/* Resolved Complaints */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
            Resolved & Verified
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 font-mono mt-2">
            {resolved}
          </div>
          <span className="text-[11px] text-emerald-600 font-medium block mt-1">
            {resolutionRate}% success rate
          </span>
        </div>
      </div>

      {/* Visual Analytics & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department-wise Distribution */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              Department-wise Issue Distribution
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">TOTAL: {total}</span>
          </div>

          <div className="space-y-3">
            {Object.entries(deptCounts).map(([dept, count]) => {
              const pct = Math.round((count / total) * 100);
              return (
                <div key={dept} className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-700 font-medium">
                    <span>Department of {dept}</span>
                    <span className="font-mono text-slate-900">{count} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full"
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              Grievance Category Breakdown
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">{Object.keys(catCounts).length} Categories</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {Object.entries(catCounts).map(([cat, count]) => (
              <div key={cat} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                <span className="text-slate-500 block text-[11px] truncate">{cat}</span>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-base font-bold text-slate-900 font-mono">{count}</span>
                  <span className="text-[10px] text-blue-600 font-semibold">
                    {Math.round((count / total) * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grievance Management Filter & List */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Institutional Action Queue ({filteredComplaints.length})
            </h3>
            <p className="text-xs text-slate-500">Click any card to review audit history or send official response.</p>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 text-xs">
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800"
            >
              <option value="ALL">All Departments</option>
              {Object.keys(deptCounts).map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUBMITTED">SUBMITTED</option>
              <option value="UNDER_REVIEW">UNDER REVIEW</option>
              <option value="IN_PROGRESS">IN PROGRESS</option>
              <option value="ESCALATED">ESCALATED</option>
              <option value="RESOLVED">RESOLVED</option>
            </select>
          </div>
        </div>

        {/* Complaints Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredComplaints.map((c) => (
            <ComplaintCard
              key={c.id}
              complaint={c}
              onSupport={onSupport}
              onOpenDetails={onOpenDetails}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
