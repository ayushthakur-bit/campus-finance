import React, { useState } from 'react';
import {
  ShieldCheck,
  RotateCcw,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  Edit3,
  Save,
  X,
} from 'lucide-react';
import {
  FeeStructureItem,
  ExpenseRecord,
  ExpenseApprovalStatus,
  UserSession,
} from '../types/finance';
import {
  calculateCourseTotalFee,
  formatINR,
} from '../utils/financeLogic';

interface AdminPanelViewProps {
  currentUser: UserSession;
  feeStructures: FeeStructureItem[];
  expenses: ExpenseRecord[];
  onUpdateFeeStructure: (updated: FeeStructureItem) => void;
  onUpdateExpenseStatus: (expenseId: string, status: ExpenseApprovalStatus) => void;
  onResetDemoData: () => void;
  onExportLedgerCSV: () => void;
}

export const AdminPanelView: React.FC<AdminPanelViewProps> = ({
  currentUser,
  feeStructures,
  expenses,
  onUpdateFeeStructure,
  onUpdateExpenseStatus,
  onResetDemoData,
  onExportLedgerCSV,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTuition, setEditTuition] = useState<string>('');
  const [editLab, setEditLab] = useState<string>('');
  const [editLib, setEditLib] = useState<string>('');
  const [editDev, setEditDev] = useState<string>('');
  const [statusBanner, setStatusBanner] = useState<string | null>(null);

  const pendingExpenses = expenses.filter(
    (e) => e.approvalStatus === 'Pending Approval'
  );

  const startEditing = (item: FeeStructureItem) => {
    setEditingId(item.id);
    setEditTuition(String(item.tuitionFee));
    setEditLab(String(item.laboratoryFee));
    setEditLib(String(item.libraryAndExamFee));
    setEditDev(String(item.developmentFee));
  };

  const saveFeeStructure = (item: FeeStructureItem) => {
    const tuition = Math.max(0, Number(editTuition) || 0);
    const lab = Math.max(0, Number(editLab) || 0);
    const lib = Math.max(0, Number(editLib) || 0);
    const dev = Math.max(0, Number(editDev) || 0);

    onUpdateFeeStructure({
      ...item,
      tuitionFee: tuition,
      laboratoryFee: lab,
      libraryAndExamFee: lib,
      developmentFee: dev,
    });
    setEditingId(null);
    setStatusBanner(`Updated master fee schedule for ${item.course} (Semester ${item.semester}).`);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 tracking-tight">
            Administrative Governance &amp; Master Controls
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Configure academic fee schedules, sanction departmental expenditure vouchers, and manage ledger data
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onExportLedgerCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-slate-500" />
            <span>Export Full Audit CSV</span>
          </button>
          <button
            type="button"
            onClick={() => {
              onResetDemoData();
              setStatusBanner('All institutional records restored to default FY 2026–27 baseline.');
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset Demo Ledger</span>
          </button>
        </div>
      </div>

      {statusBanner && (
        <div
          role="status"
          className="flex items-center justify-between gap-4 p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900"
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
            <span>{statusBanner}</span>
          </div>
          <button
            type="button"
            aria-label="Dismiss status message"
            onClick={() => setStatusBanner(null)}
            className="text-blue-600 hover:text-blue-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Section 1: Pending Voucher Sanction Queue */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="font-display text-base font-semibold text-slate-900">
              01. Departmental Expense Sanction Queue
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Vouchers submitted by Department Heads awaiting Bursar / Admin approval before treasury release
            </p>
          </div>
          <span className="text-xs font-mono tabular-nums font-medium text-slate-600">
            {pendingExpenses.length} Pending
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold text-slate-500">
                <th className="py-3 px-4">Voucher No</th>
                <th className="py-3 px-4">Requisition Details</th>
                <th className="py-3 px-4">Department &amp; Vendor</th>
                <th className="py-3 px-4 text-right">Sanction Amount</th>
                <th className="py-3 px-4 text-right">Bursar Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {pendingExpenses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    All submitted expense vouchers have been reviewed and processed.
                  </td>
                </tr>
              ) : (
                pendingExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono tabular-nums font-semibold text-slate-800 whitespace-nowrap">
                      {exp.voucherNo}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-900">{exp.title}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Requested by {exp.requestedBy} · {exp.date}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <div className="font-medium text-slate-800">{exp.department}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {exp.vendorName} · {exp.paymentMethod}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums font-bold text-right text-slate-900 whitespace-nowrap">
                      {formatINR(exp.amount)}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            onUpdateExpenseStatus(exp.id, 'Approved');
                            setStatusBanner(`Approved voucher ${exp.voucherNo} for ${formatINR(exp.amount)}.`);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-md cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Sanction</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onUpdateExpenseStatus(exp.id, 'Rejected');
                            setStatusBanner(`Rejected voucher ${exp.voucherNo}.`);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 2: Master Academic Fee Structure */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-slate-200">
          <h2 className="font-display text-base font-semibold text-slate-900">
            02. Master Course Fee Schedule (Academic Year 2026–27)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure standard semester tuition, laboratory, library, and development fee components by program
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold text-slate-500">
                <th className="py-3 px-4">Program &amp; Department</th>
                <th className="py-3 px-4">Sem</th>
                <th className="py-3 px-4 text-right">Tuition Fee</th>
                <th className="py-3 px-4 text-right">Lab Fee</th>
                <th className="py-3 px-4 text-right">Library &amp; Exam</th>
                <th className="py-3 px-4 text-right">Development</th>
                <th className="py-3 px-4 text-right">Total Course Fee</th>
                <th className="py-3 px-4 text-right">Modify</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {feeStructures.map((fs) => {
                const isEditing = editingId === fs.id;
                const total = calculateCourseTotalFee(fs);
                return (
                  <tr key={fs.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-900">{fs.course}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {fs.department}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-slate-700">
                      Sem {fs.semester}
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-right">
                      {isEditing ? (
                        <input
                          type="number"
                          aria-label="Edit tuition fee"
                          value={editTuition}
                          onChange={(e) => setEditTuition(e.target.value)}
                          className="w-24 px-2 py-1 text-right bg-white border border-blue-500 rounded"
                        />
                      ) : (
                        formatINR(fs.tuitionFee)
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-right">
                      {isEditing ? (
                        <input
                          type="number"
                          aria-label="Edit lab fee"
                          value={editLab}
                          onChange={(e) => setEditLab(e.target.value)}
                          className="w-24 px-2 py-1 text-right bg-white border border-blue-500 rounded"
                        />
                      ) : (
                        formatINR(fs.laboratoryFee)
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-right">
                      {isEditing ? (
                        <input
                          type="number"
                          aria-label="Edit library fee"
                          value={editLib}
                          onChange={(e) => setEditLib(e.target.value)}
                          className="w-24 px-2 py-1 text-right bg-white border border-blue-500 rounded"
                        />
                      ) : (
                        formatINR(fs.libraryAndExamFee)
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-right">
                      {isEditing ? (
                        <input
                          type="number"
                          aria-label="Edit development fee"
                          value={editDev}
                          onChange={(e) => setEditDev(e.target.value)}
                          className="w-24 px-2 py-1 text-right bg-white border border-blue-500 rounded"
                        />
                      ) : (
                        formatINR(fs.developmentFee)
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums font-bold text-right text-slate-900">
                      {formatINR(total)}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      {isEditing ? (
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => saveFeeStructure(fs)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md cursor-pointer"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>Save</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="px-2 py-1 text-xs text-slate-600 hover:text-slate-900 cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => startEditing(fs)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit Fee</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 3: Active Operator Session & Role Governance */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
        <div className="space-y-1">
          <div className="font-semibold text-slate-900">
            Active Session Operator: {currentUser.name} ({currentUser.title})
          </div>
          <div className="text-slate-500">
            Email: {currentUser.email} · Department: {currentUser.department} · Role Access Level:{' '}
            <span className="uppercase font-mono font-semibold text-blue-700">
              {currentUser.role}
            </span>
          </div>
        </div>
        <div className="text-slate-500 font-mono tabular-nums">
          All mutations automatically persisted to local institutional store
        </div>
      </div>
    </div>
  );
};
