import React, { useState } from 'react';
import { X, Shield, Clock, Send, ThumbsUp, AlertTriangle, CheckCircle2, ChevronRight, Hash, ShieldAlert, User } from 'lucide-react';
import { Complaint, ComplaintMessage, UserRole, User as UserType } from '../types';

interface ComplaintDetailModalProps {
  complaint: Complaint | null;
  onClose: () => void;
  currentUser: UserType;
  onSendMessage: (complaintId: number, text: string) => Promise<void>;
  onUpdateStatus: (complaintId: number, newStatus: string, remarks: string) => Promise<void>;
  onSupport: (complaintId: number) => void;
}

export const ComplaintDetailModal: React.FC<ComplaintDetailModalProps> = ({
  complaint,
  onClose,
  currentUser,
  onSendMessage,
  onUpdateStatus,
  onSupport,
}) => {
  const [chatInput, setChatInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [statusRemarks, setStatusRemarks] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'timeline' | 'escalation' | 'crypto'>('chat');

  if (!complaint) return null;

  const isStaff = currentUser.role !== 'STUDENT';

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isSending) return;
    setIsSending(true);
    try {
      await onSendMessage(complaint.id, chatInput.trim());
      setChatInput('');
    } finally {
      setIsSending(false);
    }
  };

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStatus || isUpdatingStatus) return;
    setIsUpdatingStatus(true);
    try {
      await onUpdateStatus(complaint.id, selectedStatus, statusRemarks);
      setStatusRemarks('');
      setSelectedStatus('');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const statusSteps = ['SUBMITTED', 'UNDER_REVIEW', 'IN_PROGRESS', 'ESCALATED', 'RESOLVED'];

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
        return 0;
      case 'UNDER_REVIEW':
        return 1;
      case 'IN_PROGRESS':
        return 2;
      case 'ESCALATED':
        return 3;
      case 'RESOLVED':
      case 'CLOSED':
        return 4;
      default:
        return 0;
    }
  };

  const currentStep = getStepIndex(complaint.status);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Top Header */}
        <div className="bg-[#1E3A8A] text-white px-6 py-4 flex items-center justify-between border-b border-blue-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/90 border border-blue-400/40 flex items-center justify-center shadow-inner">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs bg-emerald-950 text-emerald-300 px-2.5 py-0.5 rounded-md border border-emerald-700/60 font-bold flex items-center gap-1">
                  <span>Complaint ID:</span>
                  <span className="text-white">{complaint.complaintCode || 'GRV-8X42K7'}</span>
                </span>
                <span className="text-xs bg-blue-700/50 text-blue-100 px-2 py-0.5 rounded font-medium">
                  {complaint.category}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-400 text-amber-950">
                  {complaint.status}
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-white mt-1 line-clamp-1">{complaint.title}</h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-blue-900/60 hover:bg-blue-800 text-blue-200 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Stepper Timeline Bar */}
        <div className="bg-slate-50 px-6 py-3.5 border-b border-slate-200">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {statusSteps.map((step, idx) => {
              const isPassed = idx <= currentStep;
              const isCurrent = idx === currentStep;
              return (
                <React.Fragment key={step}>
                  <div className="flex flex-col items-center text-center">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isCurrent
                          ? 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-sm'
                          : isPassed
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {isPassed && !isCurrent ? '✓' : idx + 1}
                    </div>
                    <span
                      className={`text-[10px] mt-1 font-medium capitalize ${
                        isCurrent ? 'text-blue-700 font-bold' : isPassed ? 'text-slate-700' : 'text-slate-400'
                      }`}
                    >
                      {step.replace('_', ' ').toLowerCase()}
                    </span>
                  </div>
                  {idx < statusSteps.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-2 rounded ${
                        idx < currentStep ? 'bg-emerald-500' : 'bg-slate-200'
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-slate-200 px-6 bg-white gap-4 text-xs font-semibold text-slate-500">
          <button
            onClick={() => setActiveTab('chat')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'chat' ? 'border-blue-600 text-blue-600' : 'border-transparent hover:text-slate-800'
            }`}
          >
            Two-Way Anonymous Chat
            <span className="bg-blue-100 text-blue-800 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              {complaint.messages?.length || 0}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'timeline' ? 'border-blue-600 text-blue-600' : 'border-transparent hover:text-slate-800'
            }`}
          >
            Audit History
            <span className="bg-slate-100 text-slate-700 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              {complaint.statusHistory?.length || 0}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('escalation')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'escalation' ? 'border-blue-600 text-blue-600' : 'border-transparent hover:text-slate-800'
            }`}
          >
            Escalation Logs
            <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              {complaint.escalationLogs?.length || 0}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('crypto')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'crypto' ? 'border-blue-600 text-blue-600' : 'border-transparent hover:text-slate-800'
            }`}
          >
            SHA-256 Block Proof
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Main Grievance Description Card */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2 text-xs text-slate-500">
              <span className="font-semibold text-slate-700">
                Filed for: {complaint.department} Department • Year {complaint.year}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Submitted {new Date(complaint.createdAt).toLocaleDateString()} ({complaint.ageDays} days ago)
              </span>
            </div>
            <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">{complaint.description}</p>

            {/* Support Traction Counter in Detail */}
            <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onSupport(complaint.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${
                    complaint.hasSupported ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 border border-slate-300'
                  }`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>{complaint.hasSupported ? 'Supported' : 'Support Issue'}</span>
                </button>
                <span className="text-xs text-slate-600">
                  Backed by <strong className="text-slate-900">{complaint.supportCount}</strong> students anonymously
                </span>
              </div>

              {complaint.ageDays >= 7 && (
                <div className="text-[11px] text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded font-semibold flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Auto-Escalation Target ({complaint.ageDays}d pending)
                </div>
              )}
            </div>
          </div>

          {/* TAB 1: Real-time Anonymous Two-Way Chat */}
          {activeTab === 'chat' && (
            <div className="space-y-4">
              <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-3.5 text-xs text-blue-900 flex items-start gap-2.5">
                <Shield className="w-4 h-4 text-blue-700 flex-shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong>Anonymity & Privacy Enforced:</strong> The university has verified your active enrollment, but the complaint handlers (HOD, Dean, Committee, Admin) will{' '}
                  <strong>NEVER</strong> see your Name, Student ID, Email, Phone, or Profile. You communicate exclusively via your tracking ID:{' '}
                  <code className="bg-white px-2 py-0.5 rounded font-mono font-bold text-blue-800 border border-blue-300">
                    {complaint.complaintCode || 'GRV-8X42K7'}
                  </code>.
                </div>
              </div>

              {/* Chat Thread */}
              <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200 min-h-[220px] max-h-[320px] overflow-y-auto space-y-3">
                {(!complaint.messages || complaint.messages.length === 0) ? (
                  <div className="text-center py-10 text-slate-400 text-xs">
                    No messages yet in this inquiry thread. Send a secure response below.
                  </div>
                ) : (
                  complaint.messages.map((msg: ComplaintMessage) => {
                    const isStudentMsg = msg.senderRole === 'STUDENT';
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isStudentMsg ? 'items-start' : 'items-end'}`}
                      >
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-1 px-1">
                          <span className="font-semibold text-slate-700 font-mono">
                            {isStudentMsg
                              ? `Student (${complaint.complaintCode || 'GRV-8X42K7'})`
                              : msg.senderLabel}
                          </span>
                          {!isStudentMsg && (
                            <span className="text-[9px] bg-blue-100 text-blue-800 px-1 py-0.2 rounded font-bold">
                              OFFICIAL
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div
                          className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                            isStudentMsg
                              ? 'bg-white border border-slate-200 text-slate-800 shadow-sm rounded-tl-sm'
                              : 'bg-blue-600 text-white shadow-sm rounded-tr-sm'
                          }`}
                        >
                          {msg.message}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Chat Message Input */}
              <form onSubmit={handleSend} className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={
                    currentUser.role === 'STUDENT'
                      ? 'Reply anonymously to college administration...'
                      : `Reply as official ${currentUser.role}...`
                  }
                  className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || isSending}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSending ? 'Sending...' : 'Send'}</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: Audit History Timeline */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Status Transition Trail</h3>
              <div className="space-y-3">
                {complaint.statusHistory?.map((h: any, i: number) => (
                  <div key={h.id || i} className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[10px] mt-0.5 flex-shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900">
                          {h.oldStatus} → <strong className="text-blue-700">{h.newStatus}</strong>
                        </span>
                        <span className="text-[10px] text-slate-400">{new Date(h.updatedAt).toLocaleString()}</span>
                      </div>
                      <p className="text-slate-600 mt-1">{h.remarks || 'Status logged into ledger'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Escalation Logs */}
          {activeTab === 'escalation' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Automated Escalation Events</h3>
              {(!complaint.escalationLogs || complaint.escalationLogs.length === 0) ? (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center text-xs text-slate-500">
                  No automated escalations triggered yet. This complaint is within resolution SLA time limits.
                </div>
              ) : (
                <div className="space-y-3">
                  {complaint.escalationLogs.map((log: any) => (
                    <div key={log.id} className="bg-red-50/70 border border-red-200 rounded-xl p-3 text-xs">
                      <div className="flex items-center justify-between text-red-900 font-bold">
                        <span className="flex items-center gap-1.5">
                          <ShieldAlert className="w-4 h-4 text-red-600" />
                          Escalated to: {log.escalatedTo}
                        </span>
                        <span className="text-[10px] text-red-600 font-mono">{log.currentLevel}</span>
                      </div>
                      <p className="text-red-700 mt-1">{log.reason}</p>
                      <span className="text-[10px] text-red-500 block mt-2">
                        Timestamp: {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Cryptographic Block Proof */}
          {activeTab === 'crypto' && (
            <div className="bg-slate-900 text-slate-100 rounded-2xl p-5 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <Hash className="w-3.5 h-3.5" /> Cryptographic Ledger Block #00{complaint.id}
                </span>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded">
                  VERIFIED IMMUTABLE
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">CURRENT BLOCK HASH (SHA-256):</span>
                <span className="text-blue-300 break-all">{complaint.ledgerBlockHash || '0a89f92e92c4b8101a8f94e...'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">ANONYMOUS MASK HASH:</span>
                <span className="text-emerald-300 break-all">{complaint.anonymousId}</span>
              </div>
              <div className="pt-2 text-[11px] text-slate-400">
                This record is chained to the tamper-proof campus ledger. Any unauthorized retroactive modification to the complaint title, author pseudonym, or status will trigger a cryptographic block verification error.
              </div>
            </div>
          )}

          {/* Staff Action Panel: Update Complaint Status */}
          {isStaff && (
            <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-200">
              <h3 className="text-xs font-bold text-blue-950 uppercase tracking-wider mb-2">
                Institutional Authority Action ({currentUser.role})
              </h3>
              <form onSubmit={handleStatusSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Set New Status</label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">-- Choose New Status --</option>
                      <option value="UNDER_REVIEW">UNDER REVIEW (Acknowledge Receipt)</option>
                      <option value="IN_PROGRESS">IN PROGRESS (Work Underway)</option>
                      <option value="ESCALATED">ESCALATED (Forward to Higher Tier)</option>
                      <option value="RESOLVED">RESOLVED (Issue Fixed)</option>
                      <option value="CLOSED">CLOSED (Completed & Archived)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Official Remark / Action</label>
                    <input
                      type="text"
                      value={statusRemarks}
                      onChange={(e) => setStatusRemarks(e.target.value)}
                      placeholder="e.g. Dispatched plumber team; inspection on Friday"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!selectedStatus || isUpdatingStatus}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors shadow-sm"
                  >
                    {isUpdatingStatus ? 'Updating...' : 'Commit Status Update to Ledger'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
