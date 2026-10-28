import React, { useState, useMemo } from 'react';
import {
  Search,
  UserPlus,
  CheckCircle2,
  Clock,
  Send,
  FileText,
  X,
  Printer,
} from 'lucide-react';
import { StaffMember, SalaryStatus } from '../types/finance';
import {
  calculateGrossStaffSalary,
  calculateNetStaffSalary,
  formatINR,
} from '../utils/financeLogic';

interface StaffSalaryViewProps {
  staff: StaffMember[];
  onDisburseSalary: (staffId: string) => void;
  onDisburseAllPending: () => void;
  onAddStaff: (newStaff: Omit<StaffMember, 'id'>) => void;
  onClearStaff: () => void;
}

export const StaffSalaryView: React.FC<StaffSalaryViewProps> = ({
  staff,
  onDisburseSalary,
  onDisburseAllPending,
  onAddStaff,
  onClearStaff,
}) => {
  const [roleFilter, setRoleFilter] = useState<'All' | StaffMember['roleType']>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | SalaryStatus>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Salary Slip Modal
  const [selectedStaffSlip, setSelectedStaffSlip] = useState<StaffMember | null>(null);

  // Add Staff Modal
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [empId, setEmpId] = useState('');
  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('Assistant Professor');
  const [department, setDepartment] = useState('Computer Science & Engg.');
  const [roleType, setRoleType] = useState<StaffMember['roleType']>('Faculty');
  const [basicSalary, setBasicSalary] = useState('75000');
  const [hraAllowance, setHraAllowance] = useState('18000');
  const [daAllowance, setDaAllowance] = useState('12000');
  const [pfDeduction, setPfDeduction] = useState('9000');
  const [taxDeduction, setTaxDeduction] = useState('7500');
  const [bankLast4, setBankLast4] = useState('4210');
  const [formError, setFormError] = useState<string | null>(null);

  const pendingStaff = useMemo(
    () => staff.filter((m) => m.status === 'Pending'),
    [staff]
  );

  const totalPendingAmount = useMemo(
    () => pendingStaff.reduce((acc, m) => acc + calculateNetStaffSalary(m), 0),
    [pendingStaff]
  );

  const totalDisbursedAmount = useMemo(
    () =>
      staff
        .filter((m) => m.status === 'Disbursed')
        .reduce((acc, m) => acc + calculateNetStaffSalary(m), 0),
    [staff]
  );

  const filteredStaff = useMemo(() => {
    return staff.filter((m) => {
      const matchesRole = roleFilter === 'All' || m.roleType === roleFilter;
      const matchesStatus = statusFilter === 'All' || m.status === statusFilter;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.employeeId.toLowerCase().includes(q) ||
        m.designation.toLowerCase().includes(q) ||
        m.department.toLowerCase().includes(q);
      return matchesRole && matchesStatus && matchesSearch;
    });
  }, [staff, roleFilter, statusFilter, searchQuery]);

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empId.trim() || !name.trim() || !designation.trim()) {
      setFormError('Employee ID, Full Name, and Designation are required.');
      return;
    }

    const basic = Number(basicSalary);
    const hra = Number(hraAllowance);
    const da = Number(daAllowance);
    const pf = Number(pfDeduction);
    const tax = Number(taxDeduction);

    if (
      !Number.isFinite(basic) ||
      basic <= 0 ||
      !Number.isFinite(hra) ||
      hra < 0 ||
      !Number.isFinite(da) ||
      da < 0 ||
      !Number.isFinite(pf) ||
      pf < 0 ||
      !Number.isFinite(tax) ||
      tax < 0
    ) {
      setFormError('Please enter valid salary and deduction amounts.');
      return;
    }

    onAddStaff({
      employeeId: empId.trim().toUpperCase(),
      name: name.trim(),
      designation: designation.trim(),
      department: department.trim(),
      roleType,
      basicSalary: basic,
      hraAllowance: hra,
      daAllowance: da,
      pfDeduction: pf,
      taxDeduction: tax,
      paymentMonth: 'October 2026',
      status: 'Pending',
      bankAccountLast4: bankLast4.trim().slice(-4) || '0000',
    });

    setShowAddStaffModal(false);
    setEmpId('');
    setName('');
    setFormError(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 tracking-tight">
            Faculty &amp; Staff Salary Payroll
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Manage monthly pay scales, allowances, statutory PF/TDS deductions, and salary disbursements
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {staff.length > 0 && (
            <button
              type="button"
              onClick={onClearStaff}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>Clear Staff History</span>
            </button>
          )}
          {pendingStaff.length > 0 && (
            <button
              type="button"
              onClick={onDisburseAllPending}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-300 rounded-lg hover:bg-emerald-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>
                Disburse All Pending ({pendingStaff.length} · {formatINR(totalPendingAmount)})
              </span>
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setFormError(null);
              setShowAddStaffModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Staff Member</span>
          </button>
        </div>
      </div>

      {/* Payroll Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-500">Total Active Payroll Strength</div>
          <div className="font-mono tabular-nums text-2xl font-bold text-slate-900 mt-1">
            {staff.length} Staff Members
          </div>
          <div className="text-xs text-slate-500 mt-1">
             Payroll Cycle: October 2026
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-500">Disbursed Net Payroll</div>
          <div className="font-mono tabular-nums text-2xl font-bold text-emerald-700 mt-1">
            {formatINR(totalDisbursedAmount)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {staff.length - pendingStaff.length} accounts settled via NEFT
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-500">Pending Salary Disbursement</div>
          <div className="font-mono tabular-nums text-2xl font-bold text-amber-700 mt-1">
            {formatINR(totalPendingAmount)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {pendingStaff.length} staff members awaiting release
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            {(['All', 'Faculty', 'Administrative', 'Technical'] as const).map(
              (r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRoleFilter(r)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    roleFilter === r
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {r}
                </button>
              )
            )}
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            {(['All', 'Disbursed', 'Pending'] as const).map((st) => (
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
            ))}
          </div>
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            aria-label="Search staff payroll records"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search employee ID, name, dept..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600"
          />
        </div>
      </div>

      {/* Staff Salary Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold text-slate-500">
                <th className="py-3 px-4">Emp ID</th>
                <th className="py-3 px-4">Staff Member &amp; Designation</th>
                <th className="py-3 px-4">Department &amp; Cadre</th>
                <th className="py-3 px-4 text-right">Basic Pay</th>
                <th className="py-3 px-4 text-right">HRA + DA</th>
                <th className="py-3 px-4 text-right">PF + TDS</th>
                <th className="py-3 px-4 text-right">Net Payable</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center">
                    <div className="max-w-sm mx-auto space-y-3">
                      <div className="text-sm font-semibold text-slate-800">
                        No Staff Salary History Recorded
                      </div>
                      <p className="text-xs text-slate-500">
                        All faculty and staff payroll records have been cleared. Click below to add a staff member and process salary disbursement.
                      </p>
                      <div>
                        <button
                          type="button"
                          onClick={() => {
                            setFormError(null);
                            setShowAddStaffModal(true);
                          }}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Add First Staff Member</span>
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStaff.map((member) => {
                  const allowances = member.hraAllowance + member.daAllowance;
                  const deductions = member.pfDeduction + member.taxDeduction;
                  const netPay = calculateNetStaffSalary(member);
                  return (
                    <tr
                      key={member.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono tabular-nums font-semibold text-slate-800 whitespace-nowrap">
                        {member.employeeId}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-900">
                          {member.name}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {member.designation} · A/C •••• {member.bankAccountLast4}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <div className="font-medium text-slate-800">
                          {member.department}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {member.roleType} · {member.paymentMonth}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono tabular-nums text-right text-slate-700 whitespace-nowrap">
                        {formatINR(member.basicSalary)}
                      </td>
                      <td className="py-3 px-4 font-mono tabular-nums text-right text-emerald-700 whitespace-nowrap">
                        +{formatINR(allowances)}
                      </td>
                      <td className="py-3 px-4 font-mono tabular-nums text-right text-red-700 whitespace-nowrap">
                        -{formatINR(deductions)}
                      </td>
                      <td className="py-3 px-4 font-mono tabular-nums font-bold text-right text-slate-900 whitespace-nowrap">
                        {formatINR(netPay)}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 font-medium">
                          {member.status === 'Disbursed' ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-700">Disbursed</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              <span className="text-amber-700">Pending</span>
                            </>
                          )}
                        </div>
                        {member.lastDisbursedDate && (
                          <div className="text-[11px] text-slate-400 font-mono tabular-nums mt-0.5">
                            Paid {member.lastDisbursedDate}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-2">
                          {member.status !== 'Disbursed' && (
                            <button
                              type="button"
                              onClick={() => onDisburseSalary(member.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                            >
                              <Send className="w-3 h-3" />
                              <span>Disburse</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setSelectedStaffSlip(member)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Payslip</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payslip Modal */}
      {selectedStaffSlip && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="payslip-modal-title"
          className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4"
        >
          <div className="bg-white border border-slate-200 rounded-xl max-w-lg w-full p-6 space-y-5 shadow-xl">
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div>
                <div className="text-[11px] font-semibold text-blue-600">
                  ST. XAVIER&apos;S INSTITUTE OF TECHNOLOGY &amp; MANAGEMENT
                </div>
                <h2
                  id="payslip-modal-title"
                  className="font-display text-lg font-bold text-slate-900 mt-0.5"
                >
                  Monthly Salary Payslip · {selectedStaffSlip.paymentMonth}
                </h2>
                <p className="text-xs text-slate-500">
                  {selectedStaffSlip.name} ({selectedStaffSlip.employeeId}) ·{' '}
                  {selectedStaffSlip.designation}
                </p>
              </div>
              <button
                type="button"
                aria-label="Close payslip modal"
                onClick={() => setSelectedStaffSlip(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-xs">
                <tbody className="divide-y divide-slate-200">
                  <tr className="bg-slate-50/60">
                    <td className="py-2.5 px-4 text-slate-600">Basic Pay</td>
                    <td className="py-2.5 px-4 font-mono tabular-nums text-right font-medium text-slate-900">
                      {formatINR(selectedStaffSlip.basicSalary)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 text-slate-600">
                      House Rent Allowance (HRA)
                    </td>
                    <td className="py-2.5 px-4 font-mono tabular-nums text-right text-emerald-700">
                      +{formatINR(selectedStaffSlip.hraAllowance)}
                    </td>
                  </tr>
                  <tr className="bg-slate-50/60">
                    <td className="py-2.5 px-4 text-slate-600">
                      Dearness &amp; Academic Allowance (DA)
                    </td>
                    <td className="py-2.5 px-4 font-mono tabular-nums text-right text-emerald-700">
                      +{formatINR(selectedStaffSlip.daAllowance)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-semibold text-slate-800">
                      Gross Monthly Earnings
                    </td>
                    <td className="py-2.5 px-4 font-mono tabular-nums text-right font-semibold text-slate-900">
                      {formatINR(calculateGrossStaffSalary(selectedStaffSlip))}
                    </td>
                  </tr>
                  <tr className="bg-slate-50/60">
                    <td className="py-2.5 px-4 text-slate-600">
                      Less: Provident Fund (EPF Contribution)
                    </td>
                    <td className="py-2.5 px-4 font-mono tabular-nums text-right text-red-700">
                      -{formatINR(selectedStaffSlip.pfDeduction)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 text-slate-600">
                      Less: Income Tax (TDS) Deduction
                    </td>
                    <td className="py-2.5 px-4 font-mono tabular-nums text-right text-red-700">
                      -{formatINR(selectedStaffSlip.taxDeduction)}
                    </td>
                  </tr>
                  <tr className="bg-slate-100/80">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      Net Take-Home Salary ({selectedStaffSlip.status})
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-right font-bold text-slate-900">
                      {formatINR(calculateNetStaffSalary(selectedStaffSlip))}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-400">
                Bank A/C Ending •••• {selectedStaffSlip.bankAccountLast4}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Slip</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedStaffSlip(null)}
                  className="px-4 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Staff Modal */}
      {showAddStaffModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-staff-modal-title"
          className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4"
        >
          <div className="bg-white border border-slate-200 rounded-xl max-w-lg w-full p-6 space-y-5 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <h2
                  id="add-staff-modal-title"
                  className="font-display text-lg font-bold text-slate-900"
                >
                  Add Faculty / Staff Payroll Record
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Register a new employee into the institutional salary register
                </p>
              </div>
              <button
                type="button"
                aria-label="Close add staff modal"
                onClick={() => setShowAddStaffModal(false)}
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

            <form onSubmit={handleCreateStaff} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="staff-emp-id"
                    className="block text-xs font-medium text-slate-700 mb-1"
                  >
                    Employee ID
                  </label>
                  <input
                    id="staff-emp-id"
                    type="text"
                    placeholder="e.g. FAC-1085"
                    value={empId}
                    onChange={(e) => setEmpId(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="staff-name"
                    className="block text-xs font-medium text-slate-700 mb-1"
                  >
                    Full Name
                  </label>
                  <input
                    id="staff-name"
                    type="text"
                    placeholder="e.g. Dr. Meera Krishnan"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label
                    htmlFor="staff-desig"
                    className="block text-xs font-medium text-slate-700 mb-1"
                  >
                    Designation
                  </label>
                  <input
                    id="staff-desig"
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="staff-dept"
                    className="block text-xs font-medium text-slate-700 mb-1"
                  >
                    Department
                  </label>
                  <input
                    id="staff-dept"
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label
                    htmlFor="staff-role-type"
                    className="block text-xs font-medium text-slate-700 mb-1"
                  >
                    Cadre
                  </label>
                  <select
                    id="staff-role-type"
                    value={roleType}
                    onChange={(e) =>
                      setRoleType(e.target.value as StaffMember['roleType'])
                    }
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
                  >
                    <option value="Faculty">Faculty</option>
                    <option value="Administrative">Administrative</option>
                    <option value="Technical">Technical</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <label
                    htmlFor="staff-basic"
                    className="block text-xs font-medium text-slate-700 mb-1"
                  >
                    Basic Pay (₹)
                  </label>
                  <input
                    id="staff-basic"
                    type="number"
                    value={basicSalary}
                    onChange={(e) => setBasicSalary(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label
                    htmlFor="staff-hra"
                    className="block text-xs font-medium text-slate-700 mb-1"
                  >
                    HRA (₹)
                  </label>
                  <input
                    id="staff-hra"
                    type="number"
                    value={hraAllowance}
                    onChange={(e) => setHraAllowance(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label
                    htmlFor="staff-da"
                    className="block text-xs font-medium text-slate-700 mb-1"
                  >
                    DA Allowance (₹)
                  </label>
                  <input
                    id="staff-da"
                    type="number"
                    value={daAllowance}
                    onChange={(e) => setDaAllowance(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label
                    htmlFor="staff-pf"
                    className="block text-xs font-medium text-slate-700 mb-1"
                  >
                    PF Deduction (₹)
                  </label>
                  <input
                    id="staff-pf"
                    type="number"
                    value={pfDeduction}
                    onChange={(e) => setPfDeduction(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label
                    htmlFor="staff-tax"
                    className="block text-xs font-medium text-slate-700 mb-1"
                  >
                    TDS Tax (₹)
                  </label>
                  <input
                    id="staff-tax"
                    type="number"
                    value={taxDeduction}
                    onChange={(e) => setTaxDeduction(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label
                    htmlFor="staff-bank"
                    className="block text-xs font-medium text-slate-700 mb-1"
                  >
                    Bank Last 4 Digits
                  </label>
                  <input
                    id="staff-bank"
                    type="text"
                    maxLength={4}
                    value={bankLast4}
                    onChange={(e) => setBankLast4(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddStaffModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer"
                >
                  Save Staff Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
