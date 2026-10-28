import React, { useState } from 'react';
import {
  Building2,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  KeyRound,
  AlertCircle,
  Moon,
  Sun,
} from 'lucide-react';
import { UserSession } from '../types/finance';
import { DEMO_USERS } from '../data/seedData';

interface LoginScreenProps {
  onLogin: (user: UserSession) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLogin,
  theme,
  onToggleTheme,
}) => {
  const [email, setEmail] = useState(DEMO_USERS.admin.email);
  const [password, setPassword] = useState(DEMO_USERS.admin.password);
  const [selectedRoleKey, setSelectedRoleKey] = useState<'admin' | 'accountant' | 'auditor'>('admin');
  const [error, setError] = useState<string | null>(null);

  const handleRolePreset = (roleKey: 'admin' | 'accountant' | 'auditor') => {
    const preset = DEMO_USERS[roleKey];
    setSelectedRoleKey(roleKey);
    setEmail(preset.email);
    setPassword(preset.password);
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setError('Please enter both your institutional email address and password.');
      return;
    }

    const matchedUser = Object.values(DEMO_USERS).find(
      (u) => u.email.toLowerCase() === trimmedEmail && u.password === trimmedPassword
    );

    if (matchedUser) {
      const { password: _, ...sessionData } = matchedUser;
      onLogin(sessionData);
      return;
    }

    setError('Invalid institutional credentials. Select a quick role preset below or verify your password.');
  };

  const isDark = theme === 'dark';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      {/* Top Bar Contract */}
      <header className="flex items-center justify-between gap-8 px-8 py-4 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
          <Building2 className="w-5 h-5 text-blue-600" />
          <span className="font-display text-lg font-bold tracking-tight text-slate-900">
            Shree Swaminarayan Institute of Technology
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm text-slate-500">
          <span className="whitespace-nowrap shrink-0">Academic Session 2026–27</span>
          <span aria-hidden="true">·</span>
          <span className="whitespace-nowrap shrink-0">
            Shree Swaminarayan Institute of Technology
          </span>
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={isDark ? 'Switch website to White Theme' : 'Switch website to Dark Theme'}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 border border-slate-300 rounded-lg hover:bg-slate-200 whitespace-nowrap shrink-0 cursor-pointer"
          >
            {isDark ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span>White Theme</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-slate-700" />
                <span>Dark Theme</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Split Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Institutional Context Column */}
        <div className="lg:col-span-7 space-y-8">
          <div className="space-y-4">
            <p className="text-xs font-medium text-blue-600 tracking-wide">
              Institutional Treasury &amp; Accounts Portal · FY 2026–27
            </p>
            <h1
              className="font-display text-3xl sm:text-5xl font-bold text-slate-900 tracking-tight leading-tight"
              style={{ textWrap: 'balance' }}
            >
              Unified College Finance, Fee Ledger &amp; Payroll Control
            </h1>
            <p className="text-base text-slate-600 max-w-2xl leading-relaxed">
              Manage semester fee collections, scholarship adjustments, departmental expenditure vouchers, and monthly faculty payroll from a single auditable financial ledger.
            </p>
          </div>

          {/* 3-Column Institutional Proof Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-slate-200">
            <div>
              <div className="font-mono tabular-nums text-2xl font-semibold text-slate-900">
                Real-Time
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Semester Fee &amp; Installment Tracking
              </div>
            </div>
            <div>
              <div className="font-mono tabular-nums text-2xl font-semibold text-emerald-700">
                100% Audit
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Voucher-linked Expense &amp; Salary Disbursal
              </div>
            </div>
            <div>
              <div className="font-mono tabular-nums text-2xl font-semibold text-blue-600">
                3 Access Tiers
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Chief Bursar · Accounts Officer · Internal Auditor
              </div>
            </div>
          </div>

          {/* Feature Overview List */}
          <div className="space-y-3 pt-2 text-sm text-slate-600">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-1" />
              <span>
                <strong className="text-slate-900 font-medium">Student Fee Collection:</strong> Track tuition, lab fees, scholarships, partial installments, and generate official receipts.
              </span>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-1" />
              <span>
                <strong className="text-slate-900 font-medium">Institutional Expense Ledger:</strong> Record vendor invoices across labs, library, utilities, and campus maintenance with admin approval workflows.
              </span>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-1" />
              <span>
                <strong className="text-slate-900 font-medium">Faculty &amp; Staff Salary Payroll:</strong> Calculate Basic Pay, HRA, DA, PF, and TDS deductions with one-click monthly disbursement.
              </span>
            </div>
          </div>
        </div>

        {/* Right Login Card */}
        <div className="lg:col-span-5">
          <div className="bg-white border border-slate-200 rounded-xl p-8 space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <h2 className="font-display text-xl font-bold text-slate-900">
                  Sign in to Finance Portal
                </h2>
                <p className="text-xs text-slate-500">
                  Select an authorized role preset or enter your institutional credentials
                </p>
              </div>
              <button
                type="button"
                onClick={onToggleTheme}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 border border-slate-200 rounded-lg hover:bg-slate-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {isDark ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    <span>White Theme</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-slate-700" />
                    <span>Dark Theme</span>
                  </>
                )}
              </button>
            </div>

            {/* Interactive Role Switcher */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-700">
                Select Role Preset (One-Click Auto-Fill)
              </label>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 border border-slate-200 rounded-lg">
                <button
                  type="button"
                  onClick={() => handleRolePreset('admin')}
                  className={`px-3 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    selectedRoleKey === 'admin'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Admin / Bursar
                </button>
                <button
                  type="button"
                  onClick={() => handleRolePreset('accountant')}
                  className={`px-3 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    selectedRoleKey === 'accountant'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Accountant
                </button>
                <button
                  type="button"
                  onClick={() => handleRolePreset('auditor')}
                  className={`px-3 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    selectedRoleKey === 'auditor'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Auditor
                </button>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="flex items-start gap-2.5 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700"
              >
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <label
                  htmlFor="login-email"
                  className="block text-xs font-medium text-slate-700 mb-1.5"
                >
                  Institutional Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError(null);
                    }}
                    placeholder="admin@stxaviers-inst.edu.in"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="login-password"
                  className="block text-xs font-medium text-slate-700 mb-1.5"
                >
                  Security Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError(null);
                    }}
                    placeholder="Enter password"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm rounded-lg transition-colors cursor-pointer"
                >
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Demo Credentials Reference */}
            <div className="pt-4 border-t border-slate-200 space-y-2 text-xs text-slate-500">
              <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                <KeyRound className="w-3.5 h-3.5 text-blue-600" />
                <span>Authorized Demo Credentials</span>
              </div>
              <div className="space-y-1 font-mono text-[11px] text-slate-500">
                <div>Admin: admin@stxaviers-inst.edu.in / admin123</div>
                <div>Accounts: accounts@stxaviers-inst.edu.in / acc123</div>
                <div>Auditor: audit@stxaviers-inst.edu.in / audit123</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Quiet Footer */}
      <footer className="px-8 py-4 border-t border-slate-200 bg-white text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
        <span>EduLedger College Finance Management System · Academic Year 2026–27</span>
        <span>All financial figures denominated in Indian Rupees (INR ₹)</span>
      </footer>
    </div>
  );
};
