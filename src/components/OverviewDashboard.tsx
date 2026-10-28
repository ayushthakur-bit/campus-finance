import React, { useState, useMemo } from 'react';
import {
  ArrowUpRight,
  ArrowDownRight,
  Search,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
  Plus,
} from 'lucide-react';
import {
  StudentRecord,
  StaffMember,
  ExpenseRecord,
  LedgerTransaction,
  FinancialSummary,
} from '../types/finance';
import {
  formatINR,
  calculateStudentPendingAmount,
} from '../utils/financeLogic';

interface OverviewDashboardProps {
  summary: FinancialSummary;
  students: StudentRecord[];
  staff: StaffMember[];
  expenses: ExpenseRecord[];
  ledger: LedgerTransaction[];
  onNavigate: (tab: 'dashboard' | 'students' | 'expenses' | 'staff' | 'admin') => void;
  onExportLedgerCSV: () => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  summary,
  students,
  staff,
  expenses,
  ledger,
  onNavigate,
  onExportLedgerCSV,
}) => {
  const [ledgerFilter, setLedgerFilter] = useState<'all' | 'Credit (Fee)' | 'Debit (Expense)' | 'Debit (Salary)'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Department-wise fee collection aggregation
  const departmentBreakdown = useMemo(() => {
    const map = new Map<
      string,
      { department: string; count: number; netReceivable: number; collected: number; pending: number }
    >();

    for (const s of students) {
      const existing = map.get(s.department) || {
        department: s.department,
        count: 0,
        netReceivable: 0,
        collected: 0,
        pending: 0,
      };
      const net = Math.max(0, s.totalFee - s.scholarshipAmount);
      const pending = calculateStudentPendingAmount(s);
      existing.count += 1;
      existing.netReceivable += net;
      existing.collected += s.paidAmount;
      existing.pending += pending;
      map.set(s.department, existing);
    }
    return Array.from(map.values()).sort((a, b) => b.netReceivable - a.netReceivable);
  }, [students]);

  // Filtered ledger transactions
  const filteredLedger = useMemo(() => {
    return ledger.filter((item) => {
      const matchesType = ledgerFilter === 'all' || item.type === ledgerFilter;
      const q = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        item.partyName.toLowerCase().includes(q) ||
        item.referenceNo.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.department.toLowerCase().includes(q);
      return matchesType && matchesQuery;
    });
  }, [ledger, ledgerFilter, searchQuery]);

  const overdueStudentsCount = students.filter((s) => s.status === 'Overdue' || s.status === 'Partial').length;
  const pendingExpensesCount = expenses.filter((e) => e.approvalStatus === 'Pending Approval').length;
  const pendingStaffCount = staff.filter((m) => m.status === 'Pending').length;

  return (
    <div className="space-y-8">
      {/* Action Header */}
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onNavigate('students')}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Record Fee Receipt</span>
          </button>
        </div>
      </div>

      {/* 4-Column Executive KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Fee Collected */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Total Fee Collected</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="font-mono tabular-nums text-2xl font-bold text-slate-900">
            {formatINR(summary.totalFeeCollected)}
          </div>
          <div className="text-xs text-slate-600 flex items-center gap-1.5">
            <span className="font-mono tabular-nums font-medium text-emerald-700">
              {summary.collectionRatePercent}%
            </span>
            <span aria-hidden="true">·</span>
            <span>of {formatINR(summary.totalNetReceivable)} net receivable</span>
          </div>
        </div>

        {/* Card 2: Pending Student Dues */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Outstanding Fee Dues</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="font-mono tabular-nums text-2xl font-bold text-amber-700">
            {formatINR(summary.totalPendingFee)}
          </div>
          <div className="text-xs text-slate-600 flex items-center gap-1.5">
            <span>Scholarships granted:</span>
            <span className="font-mono tabular-nums font-medium text-slate-800">
              {formatINR(summary.totalScholarships)}
            </span>
          </div>
        </div>

        {/* Card 3: Total Outflows (Expenses + Disbursed Salary) */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Total Disbursed Outflow</span>
            <ArrowDownRight className="w-4 h-4 text-red-600" />
          </div>
          <div className="font-mono tabular-nums text-2xl font-bold text-slate-900">
            {formatINR(summary.totalApprovedExpenses + summary.totalSalaryDisbursed)}
          </div>
          <div className="text-xs text-slate-600 flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
            <span className="whitespace-nowrap">
              Expenses: <strong className="font-mono tabular-nums font-medium text-slate-800">{formatINR(summary.totalApprovedExpenses)}</strong>
            </span>
            <span aria-hidden="true">·</span>
            <span className="whitespace-nowrap">
              Payroll: <strong className="font-mono tabular-nums font-medium text-slate-800">{formatINR(summary.totalSalaryDisbursed)}</strong>
            </span>
          </div>
        </div>

        {/* Card 4: Net Treasury Surplus */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Net Treasury Balance</span>
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
          </div>
          <div
            className={`font-mono tabular-nums text-2xl font-bold ${
              summary.netTreasuryBalance >= 0 ? 'text-blue-700' : 'text-red-700'
            }`}
          >
            {formatINR(summary.netTreasuryBalance)}
          </div>
          <div className="text-xs text-slate-600 flex items-center gap-1.5">
            <span>Pending payroll:</span>
            <span className="font-mono tabular-nums font-medium text-slate-800">
              {formatINR(summary.totalSalaryPending)}
            </span>
          </div>
        </div>
      </div>

      {/* Department-Wise Fee Realization */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-12 bg-white border border-slate-200 rounded-xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-base font-semibold text-slate-900">
                Department-Wise Fee Realization
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Collected tuition vs net receivable across academic departments
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('students')}
              className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline whitespace-nowrap shrink-0 cursor-pointer"
            >
              Manage Student Dues
            </button>
          </div>

          <div className="space-y-4">
            {departmentBreakdown.length === 0 ? (
              <div className="py-8 text-center border border-dashed border-slate-200 rounded-lg space-y-2.5">
                <div className="text-xs font-semibold text-slate-800">
                  No Student Fee Records Enrolled
                </div>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Department-wise fee collection metrics will appear here once student accounts are added.
                </p>
                <div>
                  <button
                    type="button"
                    onClick={() => onNavigate('students')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Enroll First Student</span>
                  </button>
                </div>
              </div>
            ) : (
              departmentBreakdown.map((dept) => {
                const pct =
                  dept.netReceivable > 0
                    ? Math.min(100, Math.round((dept.collected / dept.netReceivable) * 100))
                    : 0;
                return (
                  <div key={dept.department} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="font-medium text-slate-800">
                        {dept.department}{' '}
                        <span className="text-slate-500 font-normal">
                          · {dept.count} {dept.count === 1 ? 'student' : 'students'}
                        </span>
                      </div>
                      <div className="font-mono tabular-nums text-slate-700">
                        <span className="font-semibold text-slate-900">{formatINR(dept.collected)}</span>
                        <span className="text-slate-400"> / </span>
                        <span>{formatINR(dept.netReceivable)}</span>
                        <span className="ml-2 text-blue-700 font-medium">({pct}%)</span>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all duration-200"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Unified Financial Ledger Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-base font-semibold text-slate-900">
              Unified Institutional Cashbook &amp; Ledger
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Chronological audit trail of student fee receipts, vendor payments, and salary disbursements
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Segmented Filter Controls */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto">
              {(
                [
                  { id: 'all', label: 'All Entries' },
                  { id: 'Credit (Fee)', label: 'Fee Credits' },
                  { id: 'Debit (Expense)', label: 'Expenses' },
                  { id: 'Debit (Salary)', label: 'Salary Payroll' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setLedgerFilter(tab.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    ledgerFilter === tab.id
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative min-w-[220px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                aria-label="Search ledger entries"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ref, party, dept..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold text-slate-500">
                <th className="py-3 px-4">Ref / Voucher No</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Party / Account Name</th>
                <th className="py-3 px-4">Particulars &amp; Department</th>
                <th className="py-3 px-4">Entry Type</th>
                <th className="py-3 px-4 text-right">Amount (INR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {filteredLedger.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-500">
                    No ledger transactions match your current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredLedger.map((txn) => {
                  const isCredit = txn.type === 'Credit (Fee)';
                  return (
                    <tr key={txn.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono tabular-nums font-medium text-slate-800 whitespace-nowrap">
                        {txn.referenceNo}
                      </td>
                      <td className="py-3 px-4 font-mono tabular-nums text-slate-600 whitespace-nowrap">
                        {txn.date}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900">
                        {txn.partyName}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <div>{txn.description}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {txn.department} · {txn.paymentMode}
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`font-medium ${
                            isCredit
                              ? 'text-emerald-700'
                              : txn.type === 'Debit (Salary)'
                              ? 'text-blue-700'
                              : 'text-amber-700'
                          }`}
                        >
                          {txn.type}
                        </span>
                      </td>
                      <td
                        className={`py-3 px-4 font-mono tabular-nums font-semibold text-right whitespace-nowrap ${
                          isCredit ? 'text-emerald-700' : 'text-slate-900'
                        }`}
                      >
                        {isCredit ? '+' : '-'}
                        {formatINR(txn.amount)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
