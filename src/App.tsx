/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Building2,
  LayoutDashboard,
  GraduationCap,
  Receipt,
  Users,
  ShieldAlert,
  LogOut,
  Plus,
} from 'lucide-react';
import {
  UserSession,
  StudentRecord,
  StaffMember,
  ExpenseRecord,
  FeeStructureItem,
  LedgerTransaction,
  ExpenseApprovalStatus,
} from './types/finance';
import {
  DEMO_USERS,
  INITIAL_STUDENTS,
  INITIAL_STAFF,
  INITIAL_EXPENSES,
  INITIAL_FEE_STRUCTURES,
  INITIAL_LEDGER,
} from './data/seedData';
import {
  computeFinancialSummary,
  deriveStudentFeeStatus,
  calculateNetStaffSalary,
} from './utils/financeLogic';
import { LoginScreen } from './components/LoginScreen';
import { OverviewDashboard } from './components/OverviewDashboard';
import { StudentFeesView } from './components/StudentFeesView';
import { ExpensesView } from './components/ExpensesView';
import { StaffSalaryView } from './components/StaffSalaryView';
import { AdminPanelView } from './components/AdminPanelView';

type ActiveTab = 'dashboard' | 'students' | 'expenses' | 'staff' | 'admin';

const STORAGE_KEY = 'eduledger_college_finance_state_v3';
const THEME_STORAGE_KEY = 'eduledger_theme_mode_v1';

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === 'dark' || saved === 'light') {
        return saved;
      }
    }
    return 'light';
  });

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Support ?autostart=1 for automated browser verification or direct demo launch
  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('autostart') === '1') {
        const { password: _, ...adminSession } = DEMO_USERS.admin;
        return adminSession;
      }
      const savedUser = sessionStorage.getItem('eduledger_active_user');
      if (savedUser) {
        try {
          return JSON.parse(savedUser);
        } catch {
          return null;
        }
      }
    }
    return null;
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  const [students, setStudents] = useState<StudentRecord[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.students)) return parsed.students;
      }
    } catch {
      // ignore storage errors
    }
    return INITIAL_STUDENTS;
  });

  const [staff, setStaff] = useState<StaffMember[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.staff)) return parsed.staff;
      }
    } catch {
      // ignore
    }
    return INITIAL_STAFF;
  });

  const [expenses, setExpenses] = useState<ExpenseRecord[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.expenses)) return parsed.expenses;
      }
    } catch {
      // ignore
    }
    return INITIAL_EXPENSES;
  });

  const [feeStructures, setFeeStructures] = useState<FeeStructureItem[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.feeStructures)) return parsed.feeStructures;
      }
    } catch {
      // ignore
    }
    return INITIAL_FEE_STRUCTURES;
  });

  const [ledger, setLedger] = useState<LedgerTransaction[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.ledger)) return parsed.ledger;
      }
    } catch {
      // ignore
    }
    return INITIAL_LEDGER;
  });

  // Persist changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          students,
          staff,
          expenses,
          feeStructures,
          ledger,
        })
      );
    } catch {
      // ignore quota errors
    }
  }, [students, staff, expenses, feeStructures, ledger]);

  const handleLogin = (user: UserSession) => {
    setCurrentUser(user);
    try {
      sessionStorage.setItem('eduledger_active_user', JSON.stringify(user));
    } catch {
      // ignore
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('dashboard');
    try {
      sessionStorage.removeItem('eduledger_active_user');
    } catch {
      // ignore
    }
  };

  const financialSummary = useMemo(
    () => computeFinancialSummary(students, staff, expenses),
    [students, staff, expenses]
  );

  // Action 1: Record Student Fee Payment
  const handleRecordStudentPayment = (
    studentId: string,
    amount: number,
    paymentMode: string,
    remarks: string
  ) => {
    const target = students.find((s) => s.id === studentId);
    if (!target) return;

    const updatedPaid = target.paidAmount + amount;
    const updatedStatus = deriveStudentFeeStatus(
      target.totalFee,
      target.scholarshipAmount,
      updatedPaid,
      target.dueDate
    );

    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId
          ? {
              ...s,
              paidAmount: updatedPaid,
              status: updatedStatus,
              lastPaymentDate: '2026-10-28',
            }
          : s
      )
    );

    const newTxn: LedgerTransaction = {
      id: `txn-${Date.now()}`,
      referenceNo: `FEE/2026/${Math.floor(4500 + Math.random() * 5000)}`,
      date: '2026-10-28',
      type: 'Credit (Fee)',
      partyName: `${target.name} (${target.rollNo})`,
      department: target.department,
      description: remarks,
      amount,
      paymentMode,
    };

    setLedger((prev) => [newTxn, ...prev]);
  };

  // Action 2: Enroll New Student
  const handleAddStudent = (newStudentData: Omit<StudentRecord, 'id' | 'status'>) => {
    const status = deriveStudentFeeStatus(
      newStudentData.totalFee,
      newStudentData.scholarshipAmount,
      newStudentData.paidAmount,
      newStudentData.dueDate
    );

    const created: StudentRecord = {
      ...newStudentData,
      id: `stu-${Date.now()}`,
      status,
    };

    setStudents((prev) => [created, ...prev]);

    if (created.paidAmount > 0) {
      const newTxn: LedgerTransaction = {
        id: `txn-${Date.now()}`,
        referenceNo: `FEE/2026/${Math.floor(4500 + Math.random() * 5000)}`,
        date: '2026-10-28',
        type: 'Credit (Fee)',
        partyName: `${created.name} (${created.rollNo})`,
        department: created.department,
        description: `Initial Enrollment Fee Deposit (Sem ${created.semester})`,
        amount: created.paidAmount,
        paymentMode: 'UPI Institutional',
      };
      setLedger((prev) => [newTxn, ...prev]);
    }
  };

  // Action 3: Add Institutional Expense
  const handleAddExpense = (newExp: Omit<ExpenseRecord, 'id' | 'voucherNo'>) => {
    const voucherNo = `VCH/26-27/${Math.floor(130 + Math.random() * 850)}`;
    const created: ExpenseRecord = {
      ...newExp,
      id: `exp-${Date.now()}`,
      voucherNo,
    };

    setExpenses((prev) => [created, ...prev]);

    if (created.approvalStatus === 'Approved') {
      const newTxn: LedgerTransaction = {
        id: `txn-${Date.now()}`,
        referenceNo: voucherNo,
        date: created.date,
        type: 'Debit (Expense)',
        partyName: created.vendorName,
        department: created.department,
        description: created.title,
        amount: created.amount,
        paymentMode: created.paymentMethod,
      };
      setLedger((prev) => [newTxn, ...prev]);
    }
  };

  // Action 4: Update Expense Approval Status
  const handleUpdateExpenseStatus = (
    expenseId: string,
    status: ExpenseApprovalStatus
  ) => {
    const target = expenses.find((e) => e.id === expenseId);
    if (!target) return;

    setExpenses((prev) =>
      prev.map((e) =>
        e.id === expenseId ? { ...e, approvalStatus: status } : e
      )
    );

    if (status === 'Approved' && target.approvalStatus !== 'Approved') {
      const newTxn: LedgerTransaction = {
        id: `txn-${Date.now()}`,
        referenceNo: target.voucherNo,
        date: '2026-10-28',
        type: 'Debit (Expense)',
        partyName: target.vendorName,
        department: target.department,
        description: `${target.title} (Sanctioned by Bursar)`,
        amount: target.amount,
        paymentMode: target.paymentMethod,
      };
      setLedger((prev) => [newTxn, ...prev]);
    }
  };

  // Action 5: Disburse Single Staff Salary
  const handleDisburseSalary = (staffId: string) => {
    const target = staff.find((m) => m.id === staffId);
    if (!target || target.status === 'Disbursed') return;

    const netPay = calculateNetStaffSalary(target);

    setStaff((prev) =>
      prev.map((m) =>
        m.id === staffId
          ? { ...m, status: 'Disbursed', lastDisbursedDate: '2026-10-28' }
          : m
      )
    );

    const newTxn: LedgerTransaction = {
      id: `txn-${Date.now()}`,
      referenceNo: `PAY/2026/${Math.floor(1000 + Math.random() * 8999)}`,
      date: '2026-10-28',
      type: 'Debit (Salary)',
      partyName: `${target.name} (${target.employeeId})`,
      department: target.department,
      description: `${target.paymentMonth} Salary Disbursement`,
      amount: netPay,
      paymentMode: 'NEFT Salary Transfer',
    };
    setLedger((prev) => [newTxn, ...prev]);
  };

  // Action 6: Disburse All Pending Salaries
  const handleDisburseAllPending = () => {
    const pendingList = staff.filter((m) => m.status !== 'Disbursed');
    if (pendingList.length === 0) return;

    const totalBatchNet = pendingList.reduce(
      (sum, m) => sum + calculateNetStaffSalary(m),
      0
    );

    setStaff((prev) =>
      prev.map((m) =>
        m.status !== 'Disbursed'
          ? { ...m, status: 'Disbursed', lastDisbursedDate: '2026-10-28' }
          : m
      )
    );

    const newTxn: LedgerTransaction = {
      id: `txn-${Date.now()}`,
      referenceNo: `PAY/2026/BATCH-${Math.floor(100 + Math.random() * 899)}`,
      date: '2026-10-28',
      type: 'Debit (Salary)',
      partyName: `Batch Payroll (${pendingList.length} Staff Members)`,
      department: 'Central Treasury Payroll',
      description: 'October 2026 Bulk Staff Salary Settlement',
      amount: totalBatchNet,
      paymentMode: 'NEFT Salary Batch',
    };
    setLedger((prev) => [newTxn, ...prev]);
  };

  // Action 7: Add New Staff Member
  const handleAddStaff = (newStaffData: Omit<StaffMember, 'id'>) => {
    const created: StaffMember = {
      ...newStaffData,
      id: `stf-${Date.now()}`,
    };
    setStaff((prev) => [created, ...prev]);
  };

  // Action 8: Update Master Fee Structure and sync matching students
  const handleUpdateFeeStructure = (updated: FeeStructureItem) => {
    setFeeStructures((prev) =>
      prev.map((fs) => (fs.id === updated.id ? updated : fs))
    );
    const newTotal =
      updated.tuitionFee +
      updated.laboratoryFee +
      updated.libraryAndExamFee +
      updated.developmentFee;

    setStudents((prev) =>
      prev.map((s) => {
        if (s.course === updated.course && s.semester === updated.semester) {
          const newStatus = deriveStudentFeeStatus(
            newTotal,
            s.scholarshipAmount,
            s.paidAmount,
            s.dueDate
          );
          return {
            ...s,
            totalFee: newTotal,
            status: newStatus,
          };
        }
        return s;
      })
    );
  };

  // Action 9: Reset Demo Data
  const handleResetDemoData = () => {
    setStudents(INITIAL_STUDENTS);
    setStaff(INITIAL_STAFF);
    setExpenses(INITIAL_EXPENSES);
    setFeeStructures(INITIAL_FEE_STRUCTURES);
    setLedger(INITIAL_LEDGER);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  // Action 10: Export Ledger CSV
  const handleExportLedgerCSV = () => {
    const headers = [
      'Reference No',
      'Date',
      'Transaction Type',
      'Party Name',
      'Department',
      'Description',
      'Payment Mode',
      'Amount (INR)',
    ];
    const rows = ledger.map((t) => [
      `"${t.referenceNo}"`,
      `"${t.date}"`,
      `"${t.type}"`,
      `"${t.partyName.replace(/"/g, '""')}"`,
      `"${t.department.replace(/"/g, '""')}"`,
      `"${t.description.replace(/"/g, '""')}"`,
      `"${t.paymentMode}"`,
      t.amount,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'eduledger_college_finance_report_2026.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!currentUser) {
    return (
      <LoginScreen
        onLogin={handleLogin}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />
    );
  }

  const navItems: { id: ActiveTab; label: string; shortLabel: string; icon: React.ReactNode }[] = [
    {
      id: 'dashboard',
      label: 'Overview Dashboard',
      shortLabel: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'students',
      label: 'Student Details & Fees',
      shortLabel: 'Student Fees',
      icon: <GraduationCap className="w-4 h-4" />,
    },
    {
      id: 'expenses',
      label: 'Institutional Expenses',
      shortLabel: 'Expenses',
      icon: <Receipt className="w-4 h-4" />,
    },
    {
      id: 'staff',
      label: 'Staff Salary Payroll',
      shortLabel: 'Staff Salary',
      icon: <Users className="w-4 h-4" />,
    },
    {
      id: 'admin',
      label: 'Admin Control Panel',
      shortLabel: 'Admin Panel',
      icon: <ShieldAlert className="w-4 h-4" />,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Bar Contract: [Brand title, one line] — [4–5 nav links, single-line] — [1 primary action] */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-8 px-6 py-3.5 bg-white border-b border-slate-200">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#dashboard"
          onClick={(e) => {
            e.preventDefault();
            setActiveTab('dashboard');
          }}
          className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
        >
          EduLedger ERP
        </a>

        {/* Zone 2: 5 concise single-line text navigation links */}
        <nav
          aria-label="Primary Navigation"
          className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600"
        >
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === item.id
                  ? 'text-blue-600 font-semibold underline underline-offset-8 decoration-2'
                  : 'hover:text-slate-900'
              }`}
            >
              {item.shortLabel}
            </button>
          ))}
        </nav>

        {/* Zone 3 */}
        <div className="flex items-center gap-3 shrink-0" />
      </header>

      {/* Main Workspace Container: Sidebar + Content Viewport */}
      <div className="flex-1 flex">
        {/* Left Sidebar Navigation (Desktop) */}
        <aside className="hidden lg:flex w-64 shrink-0 flex-col justify-between bg-white border-r border-slate-200 p-4">
          <div className="space-y-6">
            <nav aria-label="Workspace Modules" className="space-y-1">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 font-semibold'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Sign Out */}
          <div className="pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Mobile Module Switcher */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between gap-2 overflow-x-auto">
            <div className="flex items-center gap-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap shrink-0 cursor-pointer ${
                    activeTab === item.id
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {item.shortLabel}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 rounded-md whitespace-nowrap shrink-0 cursor-pointer"
            >
              Sign Out
            </button>
          </div>

          {/* Active Module Viewport */}
          <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {activeTab === 'dashboard' && (
              <OverviewDashboard
                summary={financialSummary}
                students={students}
                staff={staff}
                expenses={expenses}
                ledger={ledger}
                onNavigate={setActiveTab}
                onExportLedgerCSV={handleExportLedgerCSV}
              />
            )}

            {activeTab === 'students' && (
              <StudentFeesView
                students={students}
                onRecordPayment={handleRecordStudentPayment}
                onAddStudent={handleAddStudent}
                onClearStudents={() => {
                  setStudents([]);
                  setLedger((prev) =>
                    prev.filter((txn) => txn.type !== 'Credit (Fee)')
                  );
                }}
              />
            )}

            {activeTab === 'expenses' && (
              <ExpensesView
                expenses={expenses}
                onAddExpense={handleAddExpense}
                onUpdateExpenseStatus={handleUpdateExpenseStatus}
                onClearExpenses={() => {
                  setExpenses([]);
                  setLedger((prev) =>
                    prev.filter((txn) => txn.type !== 'Debit (Expense)')
                  );
                }}
              />
            )}

            {activeTab === 'staff' && (
              <StaffSalaryView
                staff={staff}
                onDisburseSalary={handleDisburseSalary}
                onDisburseAllPending={handleDisburseAllPending}
                onAddStaff={handleAddStaff}
                onClearStaff={() => {
                  setStaff([]);
                  setLedger((prev) =>
                    prev.filter((txn) => txn.type !== 'Debit (Salary)')
                  );
                }}
              />
            )}

            {activeTab === 'admin' && (
              <AdminPanelView
                currentUser={currentUser}
                feeStructures={feeStructures}
                expenses={expenses}
                onUpdateFeeStructure={handleUpdateFeeStructure}
                onUpdateExpenseStatus={handleUpdateExpenseStatus}
                onResetDemoData={handleResetDemoData}
                onExportLedgerCSV={handleExportLedgerCSV}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
