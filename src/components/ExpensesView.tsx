import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  X,
  Trash2,
} from 'lucide-react';
import {
  ExpenseRecord,
  ExpenseCategory,
  ExpenseApprovalStatus,
} from '../types/finance';
import { formatINR } from '../utils/financeLogic';

interface ExpensesViewProps {
  expenses: ExpenseRecord[];
  onAddExpense: (newExpense: Omit<ExpenseRecord, 'id' | 'voucherNo'>) => void;
  onUpdateExpenseStatus: (expenseId: string, status: ExpenseApprovalStatus) => void;
  onClearExpenses: () => void;
}

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Infrastructure & Lab',
  'Campus Utilities',
  'Library & Research',
  'Maintenance & Operations',
  'Academic Events',
  'Software & ERP',
];

export const ExpensesView: React.FC<ExpensesViewProps> = ({
  expenses,
  onAddExpense,
  onUpdateExpenseStatus,
  onClearExpenses,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'All' | ExpenseCategory>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | ExpenseApprovalStatus>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Add Expense Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Infrastructure & Lab');
  const [department, setDepartment] = useState('Computer Science & Engg.');
  const [vendorName, setVendorName] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('2026-10-28');
  const [paymentMethod, setPaymentMethod] =
    useState<ExpenseRecord['paymentMethod']>('NEFT / RTGS');
  const [requestedBy, setRequestedBy] = useState('Prof. Arvind Joshi');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const categoryTotals = useMemo(() => {
    const map = new Map<ExpenseCategory, number>();
    for (const c of EXPENSE_CATEGORIES) {
      map.set(c, 0);
    }
    for (const exp of expenses) {
      if (exp.approvalStatus !== 'Rejected') {
        map.set(exp.category, (map.get(exp.category) || 0) + exp.amount);
      }
    }
    return Array.from(map.entries());
  }, [expenses]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const matchesCat = selectedCategory === 'All' || e.category === selectedCategory;
      const matchesStatus = statusFilter === 'All' || e.approvalStatus === statusFilter;
      const q = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        e.title.toLowerCase().includes(q) ||
        e.voucherNo.toLowerCase().includes(q) ||
        e.vendorName.toLowerCase().includes(q) ||
        e.department.toLowerCase().includes(q);
      return matchesCat && matchesStatus && matchesQuery;
    });
  }, [expenses, selectedCategory, statusFilter, searchQuery]);

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = Number(amount);
    if (!title.trim() || !vendorName.trim() || !department.trim()) {
      setFormError('Expense title, vendor name, and department are required.');
      return;
    }
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setFormError('Please enter a valid expense amount greater than ₹0.');
      return;
    }

    onAddExpense({
      title: title.trim(),
      category,
      department: department.trim(),
      vendorName: vendorName.trim(),
      amount: numericAmount,
      date: date || '2026-10-28',
      paymentMethod,
      approvalStatus: 'Approved',
      requestedBy: requestedBy.trim() || 'Finance Office',
      notes: notes.trim() || undefined,
    });

    setShowAddModal(false);
    setTitle('');
    setVendorName('');
    setAmount('');
    setNotes('');
    setFormError(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 tracking-tight">
            Institutional Expenses &amp; Voucher Ledger
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Track capital expenditure, lab equipment purchases, campus utilities, and vendor disbursements
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {expenses.length > 0 && (
            <button
              type="button"
              onClick={onClearExpenses}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Expense History</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setFormError(null);
              setShowAddModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Log Expense Voucher</span>
          </button>
        </div>
      </div>

      {/* Category Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {categoryTotals.map(([cat, total]) => (
          <button
            key={cat}
            type="button"
            onClick={() =>
              setSelectedCategory(selectedCategory === cat ? 'All' : cat)
            }
            className={`text-left p-3.5 rounded-xl border transition-colors cursor-pointer ${
              selectedCategory === cat
                ? 'bg-blue-50/70 border-blue-600'
                : 'bg-white border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div className="text-[11px] text-slate-500 truncate">{cat}</div>
            <div className="font-mono tabular-nums text-base font-bold text-slate-900 mt-1">
              {formatINR(total)}
            </div>
          </button>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            {(['All', 'Approved', 'Pending Approval', 'Rejected'] as const).map(
              (st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    statusFilter === st
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {st}
                </button>
              )
            )}
          </div>

          <select
            aria-label="Filter by expense category"
            value={selectedCategory}
            onChange={(e) =>
              setSelectedCategory(e.target.value as 'All' | ExpenseCategory)
            }
            className="px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:border-blue-600"
          >
            <option value="All">All Expense Categories</option>
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            aria-label="Search expense vouchers"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search voucher, vendor, title..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600"
          />
        </div>
      </div>

      {/* Expense Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold text-slate-500">
                <th className="py-3 px-4">Voucher No</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Expense Particulars &amp; Vendor</th>
                <th className="py-3 px-4">Category &amp; Dept</th>
                <th className="py-3 px-4 text-right">Amount (INR)</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="max-w-sm mx-auto space-y-3">
                      <div className="text-sm font-semibold text-slate-800">
                        No Expense History Recorded
                      </div>
                      <p className="text-xs text-slate-500">
                        All institutional expense records have been cleared. Click below to record a new departmental expenditure or vendor voucher.
                      </p>
                      <div>
                        <button
                          type="button"
                          onClick={() => {
                            setFormError(null);
                            setShowAddModal(true);
                          }}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Log First Expense Voucher</span>
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono tabular-nums font-semibold text-slate-800 whitespace-nowrap">
                      {exp.voucherNo}
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-slate-600 whitespace-nowrap">
                      {exp.date}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-900">{exp.title}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Vendor: {exp.vendorName} · Req. by {exp.requestedBy}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <div className="font-medium text-slate-800">{exp.category}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {exp.department} · {exp.paymentMethod}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums font-semibold text-right text-slate-900 whitespace-nowrap">
                      {formatINR(exp.amount)}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5 font-medium">
                        {exp.approvalStatus === 'Approved' && (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700">Approved</span>
                          </>
                        )}
                        {exp.approvalStatus === 'Pending Approval' && (
                          <>
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            <span className="text-amber-700">Pending Approval</span>
                          </>
                        )}
                        {exp.approvalStatus === 'Rejected' && (
                          <>
                            <XCircle className="w-3.5 h-3.5 text-red-600" />
                            <span className="text-red-700">Rejected</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      {exp.approvalStatus === 'Pending Approval' ? (
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onUpdateExpenseStatus(exp.id, 'Approved')}
                            className="px-2.5 py-1 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-md cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => onUpdateExpenseStatus(exp.id, 'Rejected')}
                            className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400">Recorded</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Log New Expense Voucher */}
      {showAddModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-expense-modal-title"
          className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4"
        >
          <div className="bg-white border border-slate-200 rounded-xl max-w-lg w-full p-6 space-y-5 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <h2
                  id="add-expense-modal-title"
                  className="font-display text-lg font-bold text-slate-900"
                >
                  Log Institutional Expense Voucher
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Record a new vendor bill or departmental expenditure into the cashbook
                </p>
              </div>
              <button
                type="button"
                aria-label="Close expense modal"
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div
                role="alert"
                className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700"
              >
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateExpense} className="space-y-4">
              <div>
                <label
                  htmlFor="exp-title"
                  className="block text-xs font-medium text-slate-700 mb-1"
                >
                  Expense Particulars / Title
                </label>
                <input
                  id="exp-title"
                  type="text"
                  placeholder="e.g. Chemistry Analytical Lab Glassware & Reagents"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="exp-category"
                    className="block text-xs font-medium text-slate-700 mb-1"
                  >
                    Expense Category
                  </label>
                  <select
                    id="exp-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
                  >
                    {EXPENSE_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="exp-dept"
                    className="block text-xs font-medium text-slate-700 mb-1"
                  >
                    Department / Cost Center
                  </label>
                  <input
                    id="exp-dept"
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="exp-vendor"
                    className="block text-xs font-medium text-slate-700 mb-1"
                  >
                    Payee / Vendor Name
                  </label>
                  <input
                    id="exp-vendor"
                    type="text"
                    placeholder="e.g. Merck Life Science Pvt. Ltd."
                    value={vendorName}
                    onChange={(e) => setVendorName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="exp-amount"
                    className="block text-xs font-medium text-slate-700 mb-1"
                  >
                    Amount (INR ₹)
                  </label>
                  <input
                    id="exp-amount"
                    type="number"
                    placeholder="45000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label
                    htmlFor="exp-date"
                    className="block text-xs font-medium text-slate-700 mb-1"
                  >
                    Voucher Date
                  </label>
                  <input
                    id="exp-date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label
                    htmlFor="exp-mode"
                    className="block text-xs font-medium text-slate-700 mb-1"
                  >
                    Payment Method
                  </label>
                  <select
                    id="exp-mode"
                    value={paymentMethod}
                    onChange={(e) =>
                      setPaymentMethod(e.target.value as ExpenseRecord['paymentMethod'])
                    }
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
                  >
                    <option value="NEFT / RTGS">NEFT / RTGS</option>
                    <option value="Cheque">Cheque</option>
                    <option value="UPI Institutional">UPI Institutional</option>
                    <option value="Corporate Card">Corporate Card</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="exp-req"
                    className="block text-xs font-medium text-slate-700 mb-1"
                  >
                    Requested By
                  </label>
                  <input
                    id="exp-req"
                    type="text"
                    value={requestedBy}
                    onChange={(e) => setRequestedBy(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer"
                >
                  Save &amp; Post Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
