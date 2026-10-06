import React from 'react';
import { Shield, Lock, Bell, Terminal, Activity, MapPin, Layers, Send, RefreshCw, UserCheck, GraduationCap } from 'lucide-react';
import { User, UserRole } from '../types';

interface NavbarProps {
  currentUser: User;
  onSelectUser: (user: User) => void;
  availableUsers: User[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenSubmitModal: () => void;
  onOpenStudentAuthModal: () => void;
  onOpenTrackModal: () => void;
  onLogout?: () => void;
  systemAlertCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onSelectUser,
  availableUsers,
  activeTab,
  setActiveTab,
  onOpenSubmitModal,
  onOpenStudentAuthModal,
  onOpenTrackModal,
  onLogout,
  systemAlertCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#1E3A8A] text-white border-b border-blue-900 shadow-md">
      {/* Top micro bar for privacy & audit reassurance */}
      <div className="bg-[#0f172a] text-xs text-blue-200/80 px-4 py-1 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Zero-Knowledge Blind Cryptographic Ledger Active</span>
          <span className="hidden sm:inline text-slate-500">|</span>
          <span className="hidden sm:inline text-slate-400 font-mono">SHA-256 Chain Intact</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-slate-400">Current Mask:</span>
          <span className="font-mono text-emerald-300 font-medium bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
            {currentUser.anonymousId}
          </span>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Identity */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('feed')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg border border-blue-400/30">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-white">WHISPER LEDGER</span>
                <span className="text-[10px] uppercase font-semibold bg-blue-500/30 text-blue-200 border border-blue-400/30 px-1.5 py-0.5 rounded">
                  v1.0 LTS
                </span>
              </div>
              <p className="text-xs text-blue-200/80 hidden sm:block">
                Anonymous for Students, Accountable for Institutions
              </p>
            </div>
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('feed')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'feed'
                  ? 'bg-blue-800/80 text-white shadow-inner'
                  : 'text-blue-100 hover:bg-blue-800/40 hover:text-white'
              }`}
            >
              Public Ledger
            </button>

            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-blue-800/80 text-white shadow-inner'
                  : 'text-blue-100 hover:bg-blue-800/40 hover:text-white'
              }`}
            >
              {currentUser.role === 'STUDENT' ? 'Student Hub' : 'Admin Center'}
            </button>

            <button
              onClick={() => setActiveTab('heatmap')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'heatmap'
                  ? 'bg-blue-800/80 text-white shadow-inner'
                  : 'text-blue-100 hover:bg-blue-800/40 hover:text-white'
              }`}
            >
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>Campus Heatmap</span>
            </button>

            <button
              onClick={() => setActiveTab('escalator')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'escalator'
                  ? 'bg-blue-800/80 text-white shadow-inner'
                  : 'text-blue-100 hover:bg-blue-800/40 hover:text-white'
              }`}
            >
              <Activity className="w-4 h-4 text-amber-400" />
              <span>Auto-Escalation</span>
            </button>

            <button
              onClick={() => setActiveTab('ledger')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'ledger'
                  ? 'bg-blue-800/80 text-white shadow-inner'
                  : 'text-blue-100 hover:bg-blue-800/40 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4 text-blue-300" />
              <span>Audit Chain</span>
            </button>

            <button
              onClick={() => setActiveTab('backend-docs')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'backend-docs'
                  ? 'bg-blue-800/80 text-white shadow-inner'
                  : 'text-blue-100 hover:bg-blue-800/40 hover:text-white'
              }`}
            >
              <Terminal className="w-4 h-4 text-purple-300" />
              <span>Spring Boot 3</span>
            </button>
          </nav>

          {/* Action Area: Submit button, Student Login & Role Selector */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Track Grievance by ID button */}
            <button
              onClick={onOpenTrackModal}
              className="bg-blue-900/80 hover:bg-blue-800 text-blue-100 border border-blue-600/40 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
              title="Track grievance by Anonymous Complaint ID"
            >
              <Lock className="w-3.5 h-3.5 text-blue-300" />
              <span className="hidden sm:inline">Track</span>
              <span className="font-mono text-emerald-300 text-[11px]">GRV-ID</span>
            </button>

            {/* Clear Student Login button */}
            <button
              onClick={onOpenStudentAuthModal}
              className="bg-amber-400 hover:bg-amber-300 text-blue-950 px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
            >
              <GraduationCap className="w-4 h-4 text-blue-950" />
              <span>Student Login</span>
            </button>

            {currentUser.role === 'STUDENT' && (
              <button
                onClick={onOpenSubmitModal}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold shadow-md flex items-center gap-1.5 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Grievance</span>
              </button>
            )}

            {/* Current Identity & Persona Switcher */}
            <div className="relative group">
              <div className="flex items-center gap-2 bg-blue-950/70 border border-blue-700/60 rounded-xl px-2.5 py-1.5 cursor-pointer hover:border-blue-400 transition-all">
                <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-xs font-bold text-white">
                  {currentUser.role.substring(0, 2)}
                </div>
                <div className="hidden lg:block text-left text-xs leading-tight">
                  <div className="font-semibold text-white truncate max-w-[120px]">{currentUser.name}</div>
                  <div className="text-blue-300 font-mono text-[10px]">
                    {currentUser.role === 'STUDENT' ? (currentUser.enrollmentNumber || '25WH1A05B3') : currentUser.role}
                  </div>
                </div>
                <UserCheck className="w-4 h-4 text-blue-300 ml-1" />
              </div>

              {/* Persona Switcher Dropdown */}
              <div className="absolute right-0 mt-2 w-72 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-200 p-2 hidden group-hover:block transition-all z-50">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                  1-Click Role Switcher (Hackathon Demo)
                </div>
                <div className="space-y-1">
                  {availableUsers.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => onSelectUser(u)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                        currentUser.id === u.id ? 'bg-blue-50 text-blue-900 font-semibold border border-blue-200' : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <div>
                        <div className="font-medium">{u.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {u.role === 'STUDENT' ? (u.enrollmentNumber || '25WH1A05B3') : u.role} {u.department !== 'ALL' && u.department !== 'ADMIN' ? `(${u.department})` : ''}
                        </div>
                      </div>
                      <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-mono">
                        {u.role.substring(0, 4)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Tab Navigation */}
      <div className="md:hidden flex overflow-x-auto px-4 py-2 bg-blue-950/60 border-t border-blue-800/40 gap-1 text-xs">
        <button
          onClick={() => setActiveTab('feed')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${activeTab === 'feed' ? 'bg-blue-600 text-white' : 'text-blue-200'}`}
        >
          Public Ledger
        </button>
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'text-blue-200'}`}
        >
          {currentUser.role === 'STUDENT' ? 'My Hub' : 'Admin'}
        </button>
        <button
          onClick={() => setActiveTab('heatmap')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${activeTab === 'heatmap' ? 'bg-blue-600 text-white' : 'text-blue-200'}`}
        >
          Heatmap
        </button>
        <button
          onClick={() => setActiveTab('escalator')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${activeTab === 'escalator' ? 'bg-blue-600 text-white' : 'text-blue-200'}`}
        >
          Escalations
        </button>
        <button
          onClick={() => setActiveTab('ledger')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${activeTab === 'ledger' ? 'bg-blue-600 text-white' : 'text-blue-200'}`}
        >
          Audit Chain
        </button>
        <button
          onClick={() => setActiveTab('backend-docs')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${activeTab === 'backend-docs' ? 'bg-blue-600 text-white' : 'text-blue-200'}`}
        >
          Spring Boot
        </button>
      </div>
    </header>
  );
};
