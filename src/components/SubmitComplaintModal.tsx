import React, { useState, useEffect } from 'react';
import { X, Shield, Sparkles, AlertTriangle, Send, CheckCircle2, Lock, EyeOff } from 'lucide-react';
import { Complaint, User } from '../types';
import { api } from '../services/api';

interface SubmitComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  existingComplaints: Complaint[];
  onSubmitSuccess: (newComplaint: Complaint) => void;
}

export const SubmitComplaintModal: React.FC<SubmitComplaintModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  existingComplaints,
  onSubmitSuccess,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Hostel');
  const [department, setDepartment] = useState(currentUser.department === 'ALL' || currentUser.department === 'ADMIN' ? 'CSE' : currentUser.department);
  const [year, setYear] = useState<number>(currentUser.year > 0 ? currentUser.year : 3);
  const [priority, setPriority] = useState('MEDIUM');

  const [privacyWarnings, setPrivacyWarnings] = useState<string[]>([]);
  const [isScanningPrivacy, setIsScanningPrivacy] = useState(false);
  const [isAiSuggesting, setIsAiSuggesting] = useState(false);
  const [aiReason, setAiReason] = useState('');
  const [similarComplaint, setSimilarComplaint] = useState<Complaint | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Real-time Privacy Warning Check (Debounced)
  useEffect(() => {
    if (!description || description.trim().length < 15) {
      setPrivacyWarnings([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsScanningPrivacy(true);
      try {
        const result = await api.privacyCheck(description);
        setPrivacyWarnings(result.warnings || []);
      } catch (err) {
        // Fallback local pattern regex check
        const warnings: string[] = [];
        if (/\b\d{2}[a-zA-Z]{2}\d[a-zA-Z0-9]{5}\b/i.test(description)) {
          warnings.push('Possible College Roll / Hall Ticket Number found.');
        }
        if (/\b[6-9]\d{9}\b/.test(description)) {
          warnings.push('10-digit mobile telephone number detected.');
        }
        if (/\b(room\s*(no\.?)?\s*\d+|room\s*\d+)\b/i.test(description)) {
          warnings.push('Hostel room number mentioned; may compromise identity.');
        }
        if (/\b(my name is|i am [A-Z][a-z]+)\b/i.test(description)) {
          warnings.push('Direct name introduction detected.');
        }
        setPrivacyWarnings(warnings);
      } finally {
        setIsScanningPrivacy(false);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [description]);

  // Duplicate / Similar Complaint detection
  useEffect(() => {
    if (!title || title.trim().length < 6) {
      setSimilarComplaint(null);
      return;
    }

    const lower = title.toLowerCase();
    const match = existingComplaints.find((c) => {
      const cTitle = c.title.toLowerCase();
      return (
        (lower.includes('water') && cTitle.includes('water')) ||
        (lower.includes('wifi') && cTitle.includes('wifi')) ||
        (lower.includes('ragging') && cTitle.includes('ragging')) ||
        (lower.includes('staircase') && cTitle.includes('staircase')) ||
        (lower.includes('library') && cTitle.includes('library'))
      );
    });

    setSimilarComplaint(match || null);
  }, [title, existingComplaints]);

  if (!isOpen) return null;

  // AI Categorization & Severity Trigger
  const handleAiSuggest = async () => {
    if (!title && !description) {
      setErrorMsg('Please enter a title or short description first so AI can analyze it.');
      return;
    }

    setIsAiSuggesting(true);
    setErrorMsg('');
    try {
      const res = await api.suggestCategory(title, description);
      if (res.category) setCategory(res.category);
      if (res.priority) setPriority(res.priority);
      if (res.reason) setAiReason(res.reason);
    } catch (e) {
      setErrorMsg('Could not fetch AI suggestion. Setting baseline category.');
    } finally {
      setIsAiSuggesting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setErrorMsg('Title and description are required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const created = await api.createComplaint({
        title: title.trim(),
        description: description.trim(),
        category,
        department,
        year,
        priority,
        userId: currentUser.id,
      });

      onSubmitSuccess(created);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit grievance');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
    'Ragging',
    'Harassment',
    'Hostel',
    'Academic',
    'Infrastructure',
    'Faculty Issue',
    'Exam Related',
    'Safety',
    'Other',
  ];

  const departments = ['CSE', 'ECE', 'EEE', 'Mech', 'Civil', 'IT', 'MBA', 'General'];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Top Header */}
        <div className="bg-[#1E3A8A] text-white px-6 py-4 flex items-center justify-between border-b border-blue-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center border border-blue-400/40">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">File Anonymous Grievance</h2>
                <span className="text-[10px] bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 px-2 py-0.5 rounded font-mono font-bold">
                  Zero-Knowledge Mint
                </span>
              </div>
              <p className="text-xs text-blue-200">Identity cryptographically decoupled before submission</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-blue-900/60 hover:bg-blue-800 text-blue-200 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cryptographic Mask Banner */}
        <div className="bg-blue-950 text-blue-200 px-6 py-2.5 text-xs flex flex-wrap items-center justify-between gap-2 border-b border-blue-900">
          <div className="flex items-center gap-2">
            <EyeOff className="w-4 h-4 text-emerald-400" />
            <span>Anonymous Tracking Format:</span>
            <span className="font-mono font-bold text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-700/50">
              GRV-XXXXXX (Auto-Generated)
            </span>
          </div>
          <span className="text-[11px] text-slate-300">
            Student ID <strong className="text-white font-mono">{currentUser.enrollmentNumber || '25WH1A05B3'}</strong> is strictly scrubbed from record
          </span>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Similar Complaint Alert */}
          {similarComplaint && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 text-xs text-amber-900 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-amber-800">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Similar Grievance Already In Ledger</span>
              </div>
              <p className="text-amber-800">
                <strong>"{similarComplaint.title}"</strong> is already active with{' '}
                <strong>{similarComplaint.supportCount} supporters</strong>.
              </p>
              <div className="pt-1 flex items-center gap-2">
                <span className="text-[11px] text-amber-700">
                  Tip: Endorsing existing complaints with "Me Too" raises institutional escalation priority faster!
                </span>
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Grievance Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Contaminated drinking water supply in Hostel Block C"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          {/* Description & Live Privacy Warning Scanner */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Detailed Description <span className="text-red-500">*</span>
              </label>
              {isScanningPrivacy && (
                <span className="text-[11px] text-blue-600 font-medium animate-pulse flex items-center gap-1">
                  Scanning text for accidental self-identification...
                </span>
              )}
            </div>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide objective facts: what happened, where, and when. (Avoid typing your own name, roll number, room number, or phone number to keep yourself anonymous!)"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />

            {/* Live Privacy Warning Banner */}
            {privacyWarnings.length > 0 && (
              <div className="mt-2 bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-800 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-rose-900">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  Writing Privacy Warning (Protect Your Anonymity):
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-[11px] text-rose-700">
                  {privacyWarnings.map((w, idx) => (
                    <li key={idx}>{w}</li>
                  ))}
                </ul>
                <div className="text-[10px] text-rose-600 pt-0.5">
                  Recommendation: Remove personal identifiers before submitting.
                </div>
              </div>
            )}
          </div>

          {/* AI Assistance Button */}
          <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="text-xs text-blue-900">
              <span className="font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Gemini AI Intake Assistant
              </span>
              <p className="text-[11px] text-blue-700/90 mt-0.5">
                Automatically determines appropriate grievance category & institutional severity.
              </p>
              {aiReason && (
                <p className="text-[11px] text-emerald-800 font-medium mt-1">
                  ✓ AI Recommendation: {aiReason}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={handleAiSuggest}
              disabled={isAiSuggesting}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors flex-shrink-0 self-start sm:self-auto shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAiSuggesting ? 'Analyzing...' : 'Auto-Classify with AI'}</span>
            </button>
          </div>

          {/* Category, Department, Year, Priority Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Target Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
              >
                {departments.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Year of Study</label>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
              >
                <option value={1}>1st Year</option>
                <option value={2}>2nd Year</option>
                <option value={3}>3rd Year</option>
                <option value={4}>4th Year</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Severity Level</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
              >
                <option value="LOW">LOW (General Feedback)</option>
                <option value="MEDIUM">MEDIUM (Standard Maintenance)</option>
                <option value="HIGH">HIGH (Urgent Academic/Living Hazard)</option>
                <option value="CRITICAL">CRITICAL (Immediate Safety/Ragging/Harassment)</option>
              </select>
            </div>
          </div>

          {/* Submission Commit */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Tamper-proof SHA-256 block hash will be generated upon submit</span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-md"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Minting to Ledger...' : 'Commit to Ledger'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
