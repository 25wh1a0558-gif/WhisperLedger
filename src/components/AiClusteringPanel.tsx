import React, { useState } from 'react';
import { Sparkles, AlertTriangle, ShieldAlert, Info, RefreshCw, CheckCircle2, Users, ArrowRight } from 'lucide-react';
import { SystemAlert } from '../types';

interface AiClusteringPanelProps {
  alerts: SystemAlert[];
  onTriggerClustering: () => Promise<void>;
}

export const AiClusteringPanel: React.FC<AiClusteringPanelProps> = ({
  alerts,
  onTriggerClustering,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleRun = async () => {
    setIsRunning(true);
    setSuccessMessage(null);
    try {
      await onTriggerClustering();
      setSuccessMessage('AI Clustering completed! Recalculated recurring complaints and synthesized root causes.');
    } finally {
      setIsRunning(false);
    }
  };

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return {
          badge: 'bg-red-100 text-red-800 border-red-300',
          icon: <ShieldAlert className="w-4 h-4 text-red-600" />,
          card: 'border-red-200 bg-red-50/40',
        };
      case 'WARNING':
        return {
          badge: 'bg-amber-100 text-amber-800 border-amber-300',
          icon: <AlertTriangle className="w-4 h-4 text-amber-600" />,
          card: 'border-amber-200 bg-amber-50/40',
        };
      default:
        return {
          badge: 'bg-blue-100 text-blue-800 border-blue-300',
          icon: <Info className="w-4 h-4 text-blue-600" />,
          card: 'border-blue-200 bg-blue-50/40',
        };
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full mb-1">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            Gemini AI Incident Clustering Engine
          </div>
          <h2 className="text-base font-bold text-slate-900">
            Automated System Alerts & Pattern Syntheses ({alerts.length})
          </h2>
          <p className="text-xs text-slate-500">
            Uncovers hidden correlations across separate anonymous reports to preempt systemic failures.
          </p>
        </div>

        <button
          onClick={handleRun}
          disabled={isRunning}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 self-start sm:self-auto flex-shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
          <span>{isRunning ? 'Analyzing Patterns...' : 'Run AI Cluster Synthesis'}</span>
        </button>
      </div>

      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Alerts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {alerts.map((alert) => {
          const style = getSeverityStyle(alert.severity);
          return (
            <div
              key={alert.id}
              className={`rounded-2xl p-4.5 border ${style.card} flex flex-col justify-between space-y-3`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border flex items-center gap-1 ${style.badge}`}>
                    {style.icon}
                    {alert.severity}
                  </span>
                  <span className="text-[11px] font-bold text-slate-700 bg-white/80 border border-slate-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Users className="w-3 h-3 text-slate-500" />
                    {alert.affectedCount} Affected
                  </span>
                </div>

                <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">{alert.title}</h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{alert.description}</p>
              </div>

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500">
                <span>Dept: <strong className="text-slate-700">{alert.department}</strong></span>
                <span>{new Date(alert.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
