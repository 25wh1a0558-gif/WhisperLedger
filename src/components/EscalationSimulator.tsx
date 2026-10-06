import React, { useState } from 'react';
import { Activity, FastForward, ShieldAlert, Clock, ArrowRight, Play, CheckCircle2, RefreshCw } from 'lucide-react';
import { EscalationLog, Complaint } from '../types';

interface EscalationSimulatorProps {
  escalationLogs: EscalationLog[];
  complaints: Complaint[];
  onTriggerEscalation: (advanceDays: number, targetComplaintId?: number) => Promise<any>;
  onSelectComplaint: (complaint: Complaint) => void;
}

export const EscalationSimulator: React.FC<EscalationSimulatorProps> = ({
  escalationLogs,
  complaints,
  onTriggerEscalation,
  onSelectComplaint,
}) => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleRunSimulation = async (days: number) => {
    setIsSimulating(true);
    setFeedback(null);
    try {
      const res = await onTriggerEscalation(days);
      setFeedback(`Simulation successful! Evaluated all complaints aged +${days} days. ${res.escalatedCount} grievances breached SLA and were auto-escalated.`);
    } catch (err: any) {
      setFeedback('Simulation trigger encountered an issue.');
    } finally {
      setIsSimulating(false);
    }
  };

  const pendingComplaints = complaints.filter(
    (c) => c.status !== 'RESOLVED' && c.status !== 'CLOSED'
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-950 text-white rounded-3xl p-6 sm:p-8 shadow-md">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 mb-3">
            <Activity className="w-3.5 h-3.5 text-amber-400" />
            Deterministic Accountability Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Automated Tier-Based Escalation Engine
          </h1>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            Whisper Ledger guarantees institutions cannot bury or ignore student grievances. If a complaint is left unaddressed, the protocol cryptographically auto-escalates jurisdiction up the administrative hierarchy.
          </p>
        </div>
      </div>

      {/* Escalation Rules Visual Guide */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tier 1 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="w-1.5 bg-blue-600 absolute left-0 top-0 bottom-0"></div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
              Tier 1 • SLA 7 Days
            </span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Head of Department (HOD)</h3>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            Triggered when complaint remains pending past <strong>7 days</strong> without department response.
          </p>
        </div>

        {/* Tier 2 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="w-1.5 bg-orange-500 absolute left-0 top-0 bottom-0"></div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
              Tier 2 • SLA 14 Days
            </span>
            <Clock className="w-4 h-4 text-orange-500" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Dean of Student Affairs</h3>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            Triggered when complaint remains pending past <strong>14 days</strong> without HOD resolution.
          </p>
        </div>

        {/* Tier 3 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="w-1.5 bg-red-600 absolute left-0 top-0 bottom-0"></div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-50 px-2 py-0.5 rounded">
              Tier 3 • SLA 21 Days
            </span>
            <ShieldAlert className="w-4 h-4 text-red-600" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Central Grievance Committee</h3>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            Highest campus authority escalation past <strong>21 days</strong>. Mandatory disciplinary review mandated.
          </p>
        </div>
      </div>

      {/* Simulator Control Box */}
      <div className="bg-blue-50/70 border border-blue-200 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-blue-950 flex items-center gap-2">
              <FastForward className="w-5 h-5 text-blue-700" />
              Hackathon Evaluation: Fast-Forward Time Simulator
            </h2>
            <p className="text-xs text-blue-800 mt-1">
              Simulate the passage of time on live grievances to witness automated state transitions and audit logging.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleRunSimulation(7)}
              disabled={isSimulating}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Fast-Forward +7 Days</span>
            </button>
            <button
              onClick={() => handleRunSimulation(14)}
              disabled={isSimulating}
              className="bg-orange-600 hover:bg-orange-700 disabled:bg-slate-300 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Fast-Forward +14 Days</span>
            </button>
            <button
              onClick={() => handleRunSimulation(0)}
              disabled={isSimulating}
              className="bg-slate-800 hover:bg-slate-900 disabled:bg-slate-300 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
              <span>Evaluate SLA Rules Now</span>
            </button>
          </div>
        </div>

        {feedback && (
          <div className="mt-4 p-3 bg-white border border-blue-200 rounded-xl text-xs font-medium text-blue-900 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{feedback}</span>
          </div>
        )}
      </div>

      {/* Two columns: Pending candidate queue vs Escalation Log stream */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Candidate Complaints Queue */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900">
              Active Grievances & Age Tracker ({pendingComplaints.length})
            </h3>
            <span className="text-xs text-slate-400">Chronological Queue</span>
          </div>

          <div className="space-y-3 max-h-[420px] overflow-y-auto">
            {pendingComplaints.map((c) => {
              const nextTier =
                c.ageDays < 7
                  ? `HOD in ${7 - c.ageDays}d`
                  : c.ageDays < 14
                  ? `Dean in ${14 - c.ageDays}d`
                  : c.ageDays < 21
                  ? `Committee in ${21 - c.ageDays}d`
                  : 'Highest Tier';

              return (
                <div
                  key={c.id}
                  onClick={() => onSelectComplaint(c)}
                  className="p-3.5 rounded-2xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/20 transition-all cursor-pointer flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-bold">
                        {c.anonymousId}
                      </span>
                      <span className="font-bold text-slate-900 line-clamp-1">{c.title}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
                      <span>Age: <strong className="text-slate-800">{c.ageDays} days</strong></span>
                      <span>•</span>
                      <span>Status: <strong className="text-blue-700">{c.status}</strong></span>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded block">
                      Next: {nextTier}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Real-time Escalation Audit Log */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900">
              Escalation Audit Trail ({escalationLogs.length})
            </h3>
            <span className="text-[10px] font-mono bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded">
              IMMUTABLE
            </span>
          </div>

          <div className="space-y-3 max-h-[420px] overflow-y-auto">
            {escalationLogs.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No escalation events recorded. Use the time travel simulator above to trigger an escalation!
              </div>
            ) : (
              escalationLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 rounded-2xl bg-red-50/60 border border-red-200/90 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between text-red-950 font-bold">
                    <span className="flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-red-600" />
                      Escalated to: {log.escalatedTo}
                    </span>
                    <span className="text-[10px] font-mono text-red-600 bg-red-100 px-1.5 py-0.2 rounded font-bold">
                      {log.currentLevel}
                    </span>
                  </div>
                  <div className="text-slate-800 font-medium">{log.complaintTitle}</div>
                  <p className="text-red-800 text-[11px]">{log.reason}</p>
                  <span className="text-[10px] text-slate-400 block pt-1">
                    Logged: {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
