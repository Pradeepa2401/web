import React, { useState, useEffect } from 'react';
import { User } from '../types/store';
import { DEMO_USERS } from '../data/initialCatalog';
import {
  clearRememberedUserCookie,
  getRememberedPreferences,
  rememberUserCredentialsCookie,
} from '../utils/sessionCookieManager';
import { X, UserCheck, ShieldCheck } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onLoginSuccess: (user: User) => void;
  onLogout: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
  onLogout,
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'admin'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [department, setDepartment] = useState('B.E. Computer Science & Engineering');
  const [semester, setSemester] = useState('Semester V');
  const [rememberCookie, setRememberCookie] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const prefs = getRememberedPreferences();
      if (prefs.rememberedEmail) {
        setEmail(prefs.rememberedEmail);
      } else {
        setEmail(DEMO_USERS[0].email);
      }
      if (prefs.rememberedName) {
        setName(prefs.rememberedName);
      }
      setValidationError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const validateAndSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setValidationError('JavaScript Validation: Please enter a valid institutional email address.');
      return;
    }

    if (password.trim().length < 5) {
      setValidationError('JavaScript Validation: Password must be at least 5 characters long.');
      return;
    }

    if (mode === 'register') {
      if (name.trim().length < 3) {
        setValidationError('JavaScript Validation: Full Student Name must be at least 3 characters.');
        return;
      }
      if (rollNumber.trim().length < 4) {
        setValidationError('JavaScript Validation: University Roll Number is required (e.g. 24CS1042).');
        return;
      }

      const newUser: User = {
        id: `usr-${Date.now()}`,
        name: name.trim(),
        rollNumber: rollNumber.trim().toUpperCase(),
        email: email.trim(),
        department,
        semester,
        role: 'student',
      };

      if (rememberCookie) {
        rememberUserCredentialsCookie(newUser.name, newUser.email);
      } else {
        clearRememberedUserCookie();
      }

      onLoginSuccess(newUser);
      onClose();
      return;
    }

    if (mode === 'admin') {
      const adminUser: User = {
        ...DEMO_USERS[1],
        email: email.trim() || DEMO_USERS[1].email,
      };
      if (rememberCookie) {
        rememberUserCredentialsCookie(adminUser.name, adminUser.email);
      }
      onLoginSuccess(adminUser);
      onClose();
      return;
    }

    // Student Login
    const matchedDemo = DEMO_USERS.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase()
    );
    const loggedInUser: User = matchedDemo || {
      id: 'usr-stu-custom',
      name: name.trim() || email.split('@')[0].replace(/[._]/g, ' '),
      rollNumber: '24CS1042',
      email: email.trim(),
      department: 'B.E. Computer Science & Engineering',
      semester: 'Semester V',
      role: 'student',
    };

    if (rememberCookie) {
      rememberUserCredentialsCookie(loggedInUser.name, loggedInUser.email);
    } else {
      clearRememberedUserCookie();
    }

    onLoginSuccess(loggedInUser);
    onClose();
  };

  const handleInstantDemo = (demoUser: User) => {
    if (rememberCookie) {
      rememberUserCredentialsCookie(demoUser.name, demoUser.email);
    }
    onLoginSuccess(demoUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-[#FBFBF9] border border-[#E5E4DF] rounded-lg max-w-md w-full p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-[#E5E4DF] pb-4 mb-5">
          <div>
            <p className="text-[11px] font-mono text-[#52525B]">
              Session & Cookie Authentication
            </p>
            <h2 className="text-xl font-display font-semibold text-[#18181B]">
              {mode === 'register'
                ? 'Student Registration'
                : mode === 'admin'
                ? 'Store Administrator Login'
                : 'Student Portal Sign In'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#52525B] hover:text-[#18181B] rounded-md"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Active Session Status Bar */}
        {currentUser && (
          <div className="mb-5 p-3.5 bg-[#F4F3EF] border border-[#E5E4DF] rounded-md flex items-center justify-between gap-3">
            <div className="text-xs">
              <p className="text-[#52525B]">Current Active Session:</p>
              <p className="font-semibold text-[#18181B]">
                {currentUser.name} · {currentUser.role.toUpperCase()}
              </p>
              <p className="font-mono text-[11px] text-[#52525B]">
                {currentUser.rollNumber} · {currentUser.email}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded transition-colors whitespace-nowrap"
            >
              Logout Session
            </button>
          </div>
        )}

        {/* Mode Switcher Tabs */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-[#F4F3EF] border border-[#E5E4DF] rounded-md mb-5">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setValidationError(null);
            }}
            className={`py-1.5 text-xs font-medium rounded transition-colors ${
              mode === 'login'
                ? 'bg-white text-[#18181B] shadow-xs'
                : 'text-[#52525B] hover:text-[#18181B]'
            }`}
          >
            Student Login
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setValidationError(null);
            }}
            className={`py-1.5 text-xs font-medium rounded transition-colors ${
              mode === 'register'
                ? 'bg-white text-[#18181B] shadow-xs'
                : 'text-[#52525B] hover:text-[#18181B]'
            }`}
          >
            Register
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('admin');
              setEmail(DEMO_USERS[1].email);
              setValidationError(null);
            }}
            className={`py-1.5 text-xs font-medium rounded transition-colors ${
              mode === 'admin'
                ? 'bg-white text-[#18181B] shadow-xs'
                : 'text-[#52525B] hover:text-[#18181B]'
            }`}
          >
            Admin Login
          </button>
        </div>

        {validationError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-xs text-red-800">
            {validationError}
          </div>
        )}

        <form onSubmit={validateAndSubmit} className="space-y-3.5" noValidate>
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-medium text-[#18181B] mb-1">
                  Full Student Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aarav Subramanian"
                  className="w-full px-3 py-2 text-sm bg-white border border-[#D4D3CD] rounded-md"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#18181B] mb-1">
                    Roll Number *
                  </label>
                  <input
                    type="text"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    placeholder="e.g. 24CS1042"
                    className="w-full px-3 py-2 text-sm font-mono bg-white border border-[#D4D3CD] rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#18181B] mb-1">
                    Semester
                  </label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#D4D3CD] rounded-md"
                  >
                    <option value="Semester I">Semester I (1st Year)</option>
                    <option value="Semester II">Semester II (1st Year)</option>
                    <option value="Semester III">Semester III</option>
                    <option value="Semester IV">Semester IV</option>
                    <option value="Semester V">Semester V (Web Tech)</option>
                    <option value="Semester VI">Semester VI</option>
                    <option value="Semester VII">Semester VII</option>
                    <option value="Semester VIII">Semester VIII</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#18181B] mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-[#D4D3CD] rounded-md"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-medium text-[#18181B] mb-1">
              University Email Address *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@cit.edu.in"
              className="w-full px-3 py-2 text-sm bg-white border border-[#D4D3CD] rounded-md"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#18181B] mb-1">
              Password *
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password (min 5 chars)"
              className="w-full px-3 py-2 text-sm bg-white border border-[#D4D3CD] rounded-md"
            />
          </div>

          <label className="flex items-center gap-2 pt-1 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberCookie}
              onChange={(e) => setRememberCookie(e.target.checked)}
              className="rounded border-[#D4D3CD] text-[#1E3A2F] focus:ring-[#1E3A2F]"
            />
            <span className="text-xs text-[#52525B]">
              Remember username &amp; preferences in browser Cookie (<code className="font-mono">document.cookie</code>)
            </span>
          </label>

          <button
            type="submit"
            className="w-full py-2.5 px-4 text-xs font-semibold bg-[#1E3A2F] text-white rounded-md hover:bg-[#14281D] transition-colors"
          >
            {mode === 'register'
              ? 'Complete Registration & Start Session'
              : mode === 'admin'
              ? 'Sign In as Store Administrator'
              : 'Sign In to Student Account'}
          </button>
        </form>

        {/* 1-Click Quick Demo Switchers */}
        <div className="mt-5 pt-4 border-t border-[#E5E4DF]">
          <p className="text-[11px] font-mono text-[#52525B] mb-2.5">
            Instant Project Evaluation Profiles (1-Click):
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleInstantDemo(DEMO_USERS[0])}
              className="px-3 py-2 text-xs font-medium bg-[#F4F3EF] hover:bg-[#E5E4DF] text-[#18181B] rounded-md transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
            >
              <UserCheck className="w-3.5 h-3.5 text-[#1E3A2F]" />
              Demo Student
            </button>
            <button
              type="button"
              onClick={() => handleInstantDemo(DEMO_USERS[1])}
              className="px-3 py-2 text-xs font-medium bg-[#F4F3EF] hover:bg-[#E5E4DF] text-[#18181B] rounded-md transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#1E3A2F]" />
              Demo Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
