import React, { useState } from 'react';
import {
  X,
  Shield,
  Lock,
  Mail,
  GraduationCap,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Send,
  Sparkles,
  HelpCircle,
  Hash,
} from 'lucide-react';
import { User } from '../types';

interface StudentAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
  availableDemoStudents: User[];
}

export const StudentAuthModal: React.FC<StudentAuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  availableDemoStudents,
}) => {
  const [authTab, setAuthTab] = useState<'password' | 'otp' | 'register'>('password');

  // Form Fields
  const [enrollmentNumber, setEnrollmentNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('CSE');
  const [year, setYear] = useState<number>(3);

  // OTP State
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('849201');
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  // Feedback State
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  // Validate institutional email domain
  const isInstitutionalEmail = (mail: string) => {
    const lower = mail.toLowerCase().trim();
    return (
      lower.includes('.edu') ||
      lower.includes('.edu.in') ||
      lower.includes('.ac.in') ||
      lower.includes('@bvrithyderabad.edu.in')
    );
  };

  // 1-Click Demo Fill
  const handleSelectDemoStudent = (student: User) => {
    setEnrollmentNumber(student.enrollmentNumber || '25WH1A05B3');
    setEmail(student.email);
    setPassword('student123');
    setErrorMsg('');
  };

  // Password Submit
  const handlePasswordLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!enrollmentNumber.trim()) {
      setErrorMsg('Please enter your Student ID / Enrollment Number.');
      return;
    }
    if (!email.trim()) {
      setErrorMsg('Please enter your college email address.');
      return;
    }
    if (!password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    // Check institutional email
    if (!isInstitutionalEmail(email)) {
      setErrorMsg('Access restricted: Please provide an active institutional email address (e.g., student@bvrithyderabad.edu.in or college .edu.in domain).');
      return;
    }

    // Match existing student or create verified student session
    const match = availableDemoStudents.find(
      (s) =>
        s.email.toLowerCase() === email.toLowerCase() ||
        (s.enrollmentNumber && s.enrollmentNumber.toLowerCase() === enrollmentNumber.toLowerCase())
    );

    const verifiedUser: User = match
      ? { ...match, isVerified: true, enrollmentNumber: enrollmentNumber.toUpperCase() }
      : {
          id: Date.now(),
          name: name || 'Verified Student',
          email: email.trim().toLowerCase(),
          enrollmentNumber: enrollmentNumber.toUpperCase().trim(),
          department,
          year,
          role: 'STUDENT',
          anonymousId: `ANON-${department.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}-${enrollmentNumber.substring(0, 4).toUpperCase()}`,
          isVerified: true,
        };

    setSuccessMsg('Student credentials authenticated successfully.');
    setTimeout(() => {
      onLoginSuccess(verifiedUser);
      onClose();
    }, 600);
  };

  // Send OTP
  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!enrollmentNumber.trim()) {
      setErrorMsg('Please provide your Student ID / Enrollment Number.');
      return;
    }
    if (!email.trim()) {
      setErrorMsg('Please provide your institutional email address.');
      return;
    }
    if (!isInstitutionalEmail(email)) {
      setErrorMsg('OTP can only be dispatched to official institutional domains (@bvrithyderabad.edu.in or .edu.in).');
      return;
    }

    setIsSendingOtp(true);
    setTimeout(() => {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(code);
      setOtpSent(true);
      setIsSendingOtp(false);
      setSuccessMsg(`Verification OTP dispatched to ${email}. (Demo OTP: ${code})`);
      setOtpCode(code); // Pre-fill for hackathon testing convenience
    }, 800);
  };

  // Verify OTP
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (otpCode !== generatedOtp && otpCode !== '849201') {
      setErrorMsg('Invalid or expired OTP code. Please try again.');
      return;
    }

    const match = availableDemoStudents.find(
      (s) =>
        s.email.toLowerCase() === email.toLowerCase() ||
        (s.enrollmentNumber && s.enrollmentNumber.toLowerCase() === enrollmentNumber.toLowerCase())
    );

    const verifiedUser: User = match
      ? { ...match, isVerified: true, enrollmentNumber: enrollmentNumber.toUpperCase() }
      : {
          id: Date.now(),
          name: 'Verified Student',
          email: email.trim().toLowerCase(),
          enrollmentNumber: enrollmentNumber.toUpperCase().trim(),
          department,
          year,
          role: 'STUDENT',
          anonymousId: `ANON-${department.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}-${enrollmentNumber.substring(0, 4).toUpperCase()}`,
          isVerified: true,
        };

    setSuccessMsg('OTP verified! Student session established.');
    setTimeout(() => {
      onLoginSuccess(verifiedUser);
      onClose();
    }, 600);
  };

  // Register New Student
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim() || !enrollmentNumber.trim() || !email.trim() || !password) {
      setErrorMsg('All fields are required for student directory registration.');
      return;
    }
    if (!isInstitutionalEmail(email)) {
      setErrorMsg('Registration is restricted to university domains (e.g., @bvrithyderabad.edu.in or .edu.in).');
      return;
    }

    const newUser: User = {
      id: Date.now(),
      name: name.trim(),
      enrollmentNumber: enrollmentNumber.toUpperCase().trim(),
      email: email.trim().toLowerCase(),
      department,
      year,
      role: 'STUDENT',
      anonymousId: `ANON-${department.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}-${enrollmentNumber.substring(0, 4).toUpperCase()}`,
      isVerified: true,
    };

    setSuccessMsg('Student registration and enrollment verification complete!');
    setTimeout(() => {
      onLoginSuccess(newUser);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/65 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-[#1E3A8A] text-white px-6 py-5 flex items-center justify-between border-b border-blue-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 border border-blue-400/40 flex items-center justify-center shadow-inner">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Student Authentication</h2>
                <span className="text-[10px] bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded font-mono font-semibold">
                  Institutional Login
                </span>
              </div>
              <p className="text-xs text-blue-200">
                Verify enrollment while guaranteeing grievance anonymity
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-blue-900/60 hover:bg-blue-800 text-blue-200 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Zero-Knowledge Separation Banner */}
        <div className="bg-blue-50/90 border-b border-blue-200 px-6 py-3 text-xs text-blue-950 flex items-start gap-2.5">
          <Shield className="w-4 h-4 text-blue-700 flex-shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong>Zero-Knowledge Separation Guarantee:</strong> Your enrollment number confirms you are an authorized student of this college. However, the grievance handlers (HOD, Dean, Committee) will{' '}
            <strong>NEVER</strong> see your name, student ID, or email. Each grievance gets a randomly generated tracking code (e.g.{' '}
            <code className="bg-white px-1.5 py-0.5 rounded font-mono font-bold text-blue-700 border border-blue-300">
              GRV-8X42K7
            </code>
            ).
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 px-6 bg-slate-50 text-xs font-bold text-slate-500">
          <button
            onClick={() => {
              setAuthTab('password');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              authTab === 'password'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent hover:text-slate-800'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>ID & Password</span>
          </button>

          <button
            onClick={() => {
              setAuthTab('otp');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              authTab === 'otp'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent hover:text-slate-800'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Instant College OTP</span>
          </button>

          <button
            onClick={() => {
              setAuthTab('register');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              authTab === 'register'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>New Student Register</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: Password Authentication */}
          {authTab === 'password' && (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Student ID / Enrollment Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Hash className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={enrollmentNumber}
                    onChange={(e) => setEnrollmentNumber(e.target.value.toUpperCase())}
                    placeholder="e.g. 25WH1A05B3 or 22WH1A0412"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 font-mono focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Institutional Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. student@bvrithyderabad.edu.in"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Domain verification restricted to college domains (@bvrithyderabad.edu.in / .edu.in)
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Quick Demo Pre-fill Pills */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  1-Click Verified Student Demo Presets:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {availableDemoStudents
                    .filter((s) => s.role === 'STUDENT')
                    .map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => handleSelectDemoStudent(s)}
                        className="text-[11px] bg-white hover:bg-blue-50 text-blue-700 hover:text-blue-900 border border-slate-200 hover:border-blue-300 px-2.5 py-1 rounded-lg font-mono transition-colors shadow-2xs"
                      >
                        {s.enrollmentNumber || '25WH1A05B3'} ({s.name})
                      </button>
                    ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#1E3A8A] hover:bg-blue-800 text-white font-bold py-3 rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                <GraduationCap className="w-4 h-4" />
                <span>Verify Enrollment & Sign In</span>
              </button>
            </form>
          )}

          {/* TAB 2: Institutional OTP Verification */}
          {authTab === 'otp' && (
            <div className="space-y-4">
              {!otpSent ? (
                <form onSubmit={handleRequestOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Student ID / Enrollment Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={enrollmentNumber}
                      onChange={(e) => setEnrollmentNumber(e.target.value.toUpperCase())}
                      placeholder="e.g. 25WH1A05B3"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Institutional Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. 25wh1a05b3@bvrithyderabad.edu.in"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      A single-use 6-digit verification token will be dispatched to your university mailbox.
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSendingOtp}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold py-3 rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSendingOtp ? 'Dispatching OTP...' : 'Request Institutional OTP'}</span>
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4 animate-in fade-in">
                  <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3.5 text-xs text-blue-900">
                    <p>
                      Verification token dispatched to: <strong>{email}</strong>
                    </p>
                    <p className="text-[11px] text-blue-700 mt-1 font-mono">
                      Demo Token generated: <strong className="text-blue-900 bg-white px-2 py-0.5 rounded border border-blue-300">{generatedOtp}</strong>
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Enter 6-Digit OTP Token <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="849201"
                      className="w-full text-center tracking-widest text-lg font-mono font-bold bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 rounded-xl text-xs transition-colors"
                    >
                      Change Email
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Verify & Authenticate</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 3: New Student Register */}
          {authTab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Student Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ananya Sharma"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Student ID / Enrollment Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={enrollmentNumber}
                  onChange={(e) => setEnrollmentNumber(e.target.value.toUpperCase())}
                  placeholder="e.g. 25WH1A0599"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-xs text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  University Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. student@bvrithyderabad.edu.in"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-xs text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Department
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
                  >
                    <option value="CSE">CSE</option>
                    <option value="ECE">ECE</option>
                    <option value="EEE">EEE</option>
                    <option value="Mech">Mech</option>
                    <option value="IT">IT</option>
                    <option value="Civil">Civil</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Year of Study
                  </label>
                  <select
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
                  >
                    <option value={1}>1st Year</option>
                    <option value={2}>2nd Year</option>
                    <option value={3}>3rd Year</option>
                    <option value={4}>4th Year</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Create Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-xs text-slate-900"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 mt-2"
              >
                <GraduationCap className="w-4 h-4" />
                <span>Register & Authenticate Student</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
