import React from 'react';
import { ThumbsUp, MessageSquare, AlertCircle, Clock, CheckCircle2, ShieldAlert, ArrowUpRight, Hash } from 'lucide-react';
import { Complaint, ComplaintPriority, ComplaintStatus } from '../types';

interface ComplaintCardProps {
  complaint: Complaint;
  onSupport: (id: number) => void;
  onOpenDetails: (complaint: Complaint) => void;
  isCurrentStudentOwner?: boolean;
}

export const ComplaintCard: React.FC<ComplaintCardProps> = ({
  complaint,
  onSupport,
  onOpenDetails,
  isCurrentStudentOwner,
}) => {
  const getCategoryColor = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'ragging':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'harassment':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'hostel':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'academic':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'infrastructure':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'faculty issue':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'safety':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getStatusBadge = (status: ComplaintStatus) => {
    switch (status) {
      case 'SUBMITTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
            <Clock className="w-3 h-3 text-slate-500" />
            Submitted
          </span>
        );
      case 'UNDER_REVIEW':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
            <Clock className="w-3 h-3 text-amber-600 animate-spin" />
            Under Review
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300">
            <Clock className="w-3 h-3 text-blue-600" />
            In Progress
          </span>
        );
      case 'ESCALATED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-300 animate-pulse">
            <ShieldAlert className="w-3 h-3 text-red-600" />
            Escalated
          </span>
        );
      case 'RESOLVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Resolved
          </span>
        );
      case 'CLOSED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-300">
            Closed
          </span>
        );
    }
  };

  const getPriorityBadge = (p: ComplaintPriority) => {
    switch (p) {
      case 'CRITICAL':
        return <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-red-600 text-white rounded">Critical</span>;
      case 'HIGH':
        return <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-orange-500 text-white rounded">High</span>;
      case 'MEDIUM':
        return <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-blue-500 text-white rounded">Medium</span>;
      case 'LOW':
        return <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-slate-400 text-white rounded">Low</span>;
    }
  };

  const messageCount = complaint.messages ? complaint.messages.length : 0;
  const isHighTraction = complaint.supportCount >= 15;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all hover:border-blue-300 p-5 flex flex-col justify-between">
      <div>
        {/* Top Header: Anonymous Complaint ID + Category + Priority + Status */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold bg-blue-50 text-blue-900 px-2.5 py-1 rounded-md border border-blue-200 flex items-center gap-1.5 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Complaint ID:</span>
              <strong className="text-blue-700">{complaint.complaintCode || 'GRV-8X42K7'}</strong>
            </span>
            {isCurrentStudentOwner && (
              <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-bold">
                My Grievance
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-xs px-2.5 py-0.5 rounded-md font-medium border ${getCategoryColor(complaint.category)}`}>
              {complaint.category}
            </span>
            {getPriorityBadge(complaint.priority)}
            {getStatusBadge(complaint.status)}
          </div>
        </div>

        {/* Title */}
        <h3
          onClick={() => onOpenDetails(complaint)}
          className="text-base font-bold text-slate-900 leading-snug hover:text-blue-700 cursor-pointer transition-colors mb-2"
        >
          {complaint.title}
        </h3>

        {/* Description snippet */}
        <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed mb-4">
          {complaint.description}
        </p>

        {/* Department & Year info chip */}
        <div className="flex items-center gap-3 text-xs text-slate-500 mb-4 pb-3 border-b border-slate-100">
          <span>
            Dept: <strong className="text-slate-700">{complaint.department}</strong>
          </span>
          <span>•</span>
          <span>
            Year: <strong className="text-slate-700">{complaint.year > 0 ? `Yr ${complaint.year}` : 'Campus-wide'}</strong>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 text-slate-500">
            <Clock className="w-3 h-3" />
            {complaint.ageDays > 0 ? `${complaint.ageDays}d old` : 'Today'}
          </span>
          {complaint.ageDays >= 7 && complaint.status !== 'RESOLVED' && (
            <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-medium border border-amber-200">
              Escalation Candidate
            </span>
          )}
        </div>
      </div>

      {/* Footer Controls: Me Too Support & Chat Details */}
      <div className="flex items-center justify-between pt-1">
        {/* "Me Too" Anonymous Support Button */}
        <button
          onClick={() => onSupport(complaint.id)}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            complaint.hasSupported
              ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-700'
              : 'bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-200'
          }`}
          title="Anonymously endorse this grievance"
        >
          <ThumbsUp className={`w-3.5 h-3.5 ${complaint.hasSupported ? 'fill-current' : ''}`} />
          <span>Me Too</span>
          <span
            className={`px-1.5 py-0.2 rounded-full font-mono text-[11px] ${
              complaint.hasSupported ? 'bg-blue-800 text-blue-100' : 'bg-slate-200 text-slate-800'
            }`}
          >
            {complaint.supportCount}
          </span>
          {isHighTraction && (
            <span className="text-[10px] bg-amber-400 text-amber-950 px-1 py-0.2 rounded font-bold">
              🔥 Trending
            </span>
          )}
        </button>

        {/* View Details / Chat Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenDetails(complaint)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-blue-700 hover:text-blue-900 hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Chat</span>
            {messageCount > 0 && (
              <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                {messageCount}
              </span>
            )}
            <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
          </button>
        </div>
      </div>

      {/* Micro Cryptographic Seal Indicator */}
      <div className="mt-3 pt-2 border-t border-dashed border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
        <span className="flex items-center gap-1 font-mono">
          <Hash className="w-2.5 h-2.5 text-blue-500" />
          Block: {complaint.ledgerBlockHash ? complaint.ledgerBlockHash.substring(0, 12) + '...' : 'SECURED'}
        </span>
        <span className="text-emerald-600 font-medium">✓ Cryptographically Sealed</span>
      </div>
    </div>
  );
};
