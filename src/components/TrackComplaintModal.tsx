import React, { useState } from 'react';
import { X, Search, Shield, CheckCircle2, Clock, AlertTriangle, ArrowRight, Hash } from 'lucide-react';
import { Complaint } from '../types';
import { api } from '../services/api';

interface TrackComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectComplaint: (complaint: Complaint) => void;
}

export const TrackComplaintModal: React.FC<TrackComplaintModalProps> = ({
  isOpen,
  onClose,
  onSelectComplaint,
}) => {
  const [trackingId, setTrackingId] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const demoCodes = ['GRV-8X42K7', 'GRV-3N91P4', 'GRV-7K29B1', 'GRV-5M18D9', 'GRV-2P44X8'];

  const handleSearch = async (codeToSearch?: string) => {
    const target = (codeToSearch || trackingId).trim().toUpperCase();
    if (!target) {
      setErrorMsg('Please enter a valid Complaint Tracking ID (e.g., GRV-8X42K7).');
      return;
    }

    setIsSearching(true);
    setErrorMsg('');
    try {
      const found = await api.getComplaintByCode(target);
      if (found) {
        onSelectComplaint(found);
        onClose();
      } else {
        setErrorMsg(`No complaint found with Tracking ID "${target}". Please check the ID and try again.`);
      }
    } catch (e) {
      setErrorMsg('Error searching for complaint. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/65 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-[#1E3A8A] text-white px-6 py-4 flex items-center justify-between border-b border-blue-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center border border-blue-400/40">
              <Search className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Track Grievance by ID</h2>
              <p className="text-xs text-blue-200">Real-time status without logging in</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-blue-900/60 hover:bg-blue-800 text-blue-200 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="text-xs text-slate-600 leading-relaxed">
            Enter the randomized <strong>Anonymous Complaint ID</strong> (e.g.{' '}
            <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono font-bold text-blue-700">
              GRV-8X42K7
            </code>
            ) assigned when your grievance was sealed into the ledger.
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="space-y-3"
          >
            <div className="relative">
              <Hash className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value.toUpperCase())}
                placeholder="e.g. GRV-8X42K7"
                className="w-full uppercase font-mono font-bold tracking-wider bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>

            {errorMsg && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSearching}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold py-3 rounded-xl text-xs sm:text-sm shadow-md transition-colors flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>{isSearching ? 'Querying Ledger...' : 'Find & Track Grievance'}</span>
            </button>
          </form>

          {/* Quick Demo Code Clickers */}
          <div className="pt-2 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Try Demo Complaint Tracking IDs:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {demoCodes.map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => {
                    setTrackingId(code);
                    handleSearch(code);
                  }}
                  className="text-xs bg-slate-100 hover:bg-blue-50 text-blue-700 hover:text-blue-900 border border-slate-200 hover:border-blue-300 px-2.5 py-1 rounded-lg font-mono font-semibold transition-colors"
                >
                  {code}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
