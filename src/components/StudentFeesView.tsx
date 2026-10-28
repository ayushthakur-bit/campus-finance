import React, { useState, useMemo } from 'react';
import {
  Search,
  UserPlus,
  CreditCard,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  Printer,
} from 'lucide-react';
import { StudentRecord, FeeStatus } from '../types/finance';
import {
  calculateStudentPendingAmount,
  formatINR,
  validatePaymentInput,
} from '../utils/financeLogic';

interface StudentFeesViewProps {
  students: StudentRecord[];
  onRecordPayment: (
    studentId: string,
    amount: number,
    paymentMode: string,
    remarks: string
  ) => void;
  onAddStudent: (newStudent: Omit<StudentRecord, 'id' | 'status'>) => void;
  onClearStudents: () => void;
}

export const StudentFeesView: React.FC<StudentFeesViewProps> = ({
  students,
  onRecordPayment,
  onAddStudent,
  onClearStudents,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | FeeStatus>('All');
  const [departmentFilter, setDepartmentFilter] = useState<string>('All');

  // Payment Modal State
  const [selectedStudentForPayment, setSelectedStudentForPayment] =
    useState<StudentRecord | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentMode, setPaymentMode] = useState<string>('UPI Institutional');
  const [paymentRemarks, setPaymentRemarks] = useState<string>('Semester Tuition & Lab Installment');
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Receipt Modal State
  const [selectedStudentForReceipt, setSelectedStudentForReceipt] =
    useState<StudentRecord | null>(null);

  // Add Student Modal State
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [newRollNo, setNewRollNo] = useState('');
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newCourse, setNewCourse] = useState('B.Tech Computer Science');
  const [newDepartment, setNewDepartment] = useState('Computer Science & Engg.');
  const [newSemester, setNewSemester] = useState('1');
  const [newTotalFee, setNewTotalFee] = useState('145000');
  const [newScholarship, setNewScholarship] = useState('0');
  const [newPaidAmount, setNewPaidAmount] = useState('0');
  const [newDueDate, setNewDueDate] = useState('2026-11-30');
  const [addStudentError, setAddStudentError] = useState<string | null>(null);

  const departments = useMemo(() => {
    const set = new Set<string>(students.map((s) => s.department));
    return ['All', ...Array.from(set)];
  }, [students]);

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesStatus = statusFilter === 'All' || s.status === statusFilter;
      const matchesDept =
        departmentFilter === 'All' || s.department === departmentFilter;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.rollNo.toLowerCase().includes(q) ||
        s.course.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q);
      return matchesStatus && matchesDept && matchesSearch;
    });
  }, [students, statusFilter, departmentFilter, searchQuery]);

  const openPaymentModal = (student: StudentRecord) => {
    const pending = calculateStudentPendingAmount(student);
    setSelectedStudentForPayment(student);
    setPaymentAmount(String(pending));
    setPaymentMode('UPI Institutional');
    setPaymentRemarks(`Semester ${student.semester} Fee Installment`);
    setPaymentError(null);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentForPayment) return;

    const pending = calculateStudentPendingAmount(selectedStudentForPayment);
    const numericAmount = Number(paymentAmount);
    const validationErr = validatePaymentInput(numericAmount, pending);

    if (validationErr) {
      setPaymentError(validationErr);
      return;
    }

    onRecordPayment(
      selectedStudentForPayment.id,
      numericAmount,
      paymentMode,
      paymentRemarks.trim() || `Semester ${selectedStudentForPayment.semester} Fee Receipt`
    );
    setSelectedStudentForPayment(null);
  };

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRollNo.trim() || !newName.trim() || !newEmail.trim()) {
      setAddStudentError('Roll Number, Student Name, and Institutional Email are required.');
      return;
    }

    const totalFeeNum = Number(newTotalFee);
    const scholarshipNum = Number(newScholarship);
    const paidNum = Number(newPaidAmount);

    if (
      !Number.isFinite(totalFeeNum) ||
      totalFeeNum <= 0 ||
      !Number.isFinite(scholarshipNum) ||
      scholarshipNum < 0 ||
      !Number.isFinite(paidNum) ||
      paidNum < 0
    ) {
      setAddStudentError('Please enter valid numeric fee, scholarship, and paid amounts.');
      return;
    }

    if (scholarshipNum + paidNum > totalFeeNum) {
      setAddStudentError('Scholarship + Initial Paid Amount cannot exceed Total Course Fee.');
      return;
    }

    onAddStudent({
      rollNo: newRollNo.trim().toUpperCase(),
      name: newName.trim(),
      email: newEmail.trim(),
      phone: newPhone.trim() || '+91 98000 00000',
      course: newCourse.trim(),
      department: newDepartment.trim(),
      semester: Number(newSemester) || 1,
      academicYear: '2026-27',
      totalFee: totalFeeNum,
      scholarshipAmount: scholarshipNum,
      paidAmount: paidNum,
      dueDate: newDueDate || '2026-11-30',
      lastPaymentDate: paidNum > 0 ? '2026-10-28' : undefined,
    });

    setShowAddStudentModal(false);
    setNewRollNo('');
    setNewName('');
    setNewEmail('');
    setNewPhone('');
    setAddStudentError(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 tracking-tight">
            Student Fee Ledger &amp; Accounts
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Track individual student tuition assessments, scholarships, installment collections, and fee receipts
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {students.length > 0 && (
            <button
              type="button"
              onClick={onClearStudents}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>Clear Student History</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setAddStudentError(null);
              setShowAddStudentModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Enroll Student Account</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            {(['All', 'Paid', 'Partial', 'Pending', 'Overdue'] as const).map(
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
            aria-label="Filter by department"
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:border-blue-600"
          >
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept === 'All' ? 'All Departments' : dept}
              </option>
            ))}
          </select>
        </div>

        <div className="relative min-w-[260px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            aria-label="Search students by name or roll number"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search roll no, student name, course..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600"
          />
        </div>
      </div>

      {/* Student Fee Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold text-slate-500">
                <th className="py-3 px-4">Roll No</th>
                <th className="py-3 px-4">Student Details</th>
                <th className="py-3 px-4">Program &amp; Sem</th>
                <th className="py-3 px-4 text-right">Gross Fee</th>
                <th className="py-3 px-4 text-right">Scholarship</th>
                <th className="py-3 px-4 text-right">Paid Amount</th>
                <th className="py-3 px-4 text-right">Pending Due</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center">
                    <div className="max-w-sm mx-auto space-y-3">
                      <div className="text-sm font-semibold text-slate-800">
                        No Student Fee History Recorded
                      </div>
                      <p className="text-xs text-slate-500">
                        All student fee records are currently cleared. Click below to enroll a new student account and track fee installments.
                      </p>
                      <div>
                        <button
                          type="button"
                          onClick={() => {
                            setAddStudentError(null);
                            setShowAddStudentModal(true);
                          }}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Enroll First Student Account</span>
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const pending = calculateStudentPendingAmount(student);
                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono tabular-nums font-semibold text-slate-800 whitespace-nowrap">
                        {student.rollNo}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-900">
                          {student.name}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {student.email} · {student.phone}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        <div className="font-medium">{student.course}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {student.department} · Sem {student.semester}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono tabular-nums text-right text-slate-700 whitespace-nowrap">
                        {formatINR(student.totalFee)}
                      </td>
                      <td className="py-3 px-4 font-mono tabular-nums text-right text-slate-600 whitespace-nowrap">
                        {student.scholarshipAmount > 0
                          ? `-${formatINR(student.scholarshipAmount)}`
                          : '₹0'}
                      </td>
                      <td className="py-3 px-4 font-mono tabular-nums font-medium text-right text-emerald-700 whitespace-nowrap">
                        {formatINR(student.paidAmount)}
                      </td>
                      <td className="py-3 px-4 font-mono tabular-nums font-semibold text-right text-slate-900 whitespace-nowrap">
                        {formatINR(pending)}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 font-medium">
                          {student.status === 'Paid' && (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-700">Paid</span>
                            </>
                          )}
                          {student.status === 'Partial' && (
                            <>
                              <Clock className="w-3.5 h-3.5 text-blue-600" />
                              <span className="text-blue-700">Partial</span>
                            </>
                          )}
                          {student.status === 'Pending' && (
                            <>
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              <span className="text-amber-700">Pending</span>
                            </>
                          )}
                          {student.status === 'Overdue' && (
                            <>
                              <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                              <span className="text-red-700">Overdue</span>
                            </>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono tabular-nums mt-0.5">
                          Due {student.dueDate}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-2">
                          {pending > 0 && (
                            <button
                              type="button"
                              onClick={() => openPaymentModal(student)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              <span>Collect Fee</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setSelectedStudentForReceipt(student)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Statement</span>
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

      {/* Modal 1: Record Fee Payment */}
      {selectedStudentForPayment && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="payment-modal-title"
          className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4"
        >
          <div className="bg-white border border-slate-200 rounded-xl max-w-md w-full p-6 space-y-5 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="payment-modal-title"
                  className="font-display text-lg font-bold text-slate-900"
                >
                  Record Student Fee Receipt
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedStudentForPayment.name} · {selectedStudentForPayment.rollNo}
                </p>
              </div>
              <button
                type="button"
                aria-label="Close payment modal"
                onClick={() => setSelectedStudentForPayment(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Net Semester Fee Payable:</span>
                <span className="font-mono tabular-nums font-medium text-slate-900">
                  {formatINR(
                    selectedStudentForPayment.totalFee -
                      selectedStudentForPayment.scholarshipAmount
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Already Paid:</span>
                <span className="font-mono tabular-nums font-medium text-emerald-700">
                  {formatINR(selectedStudentForPayment.paidAmount)}
                </span>
              </div>
              <div className="flex justify-between pt-1.5 border-t border-slate-200">
                <span className="font-medium text-slate-700">Current Pending Balance:</span>
                <span className="font-mono tabular-nums font-bold text-amber-700">
                  {formatINR(calculateStudentPendingAmount(selectedStudentForPayment))}
                </span>
              </div>
            </div>

            {paymentError && (
              <div
                role="alert"
                className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700"
              >
                {paymentError}
              </div>
            )}

            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="payment-amount-input"
                  className="block text-xs font-medium text-slate-700 mb-1"
                >
                  Amount Being Received (INR ₹)
                </label>
                <input
                  id="payment-amount-input"
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => {
                    setPaymentAmount(e.target.value);
                    setPaymentError(null);
                  }}
                  className="w-full px-3 py-2 text-sm font-mono tabular-nums bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="payment-mode-select"
                  className="block text-xs font-medium text-slate-700 mb-1"
                >
                  Payment Mode
                </label>
                <select
                  id="payment-mode-select"
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
                >
                  <option value="UPI Institutional">UPI Institutional</option>
                  <option value="NEFT / RTGS">NEFT / RTGS</option>
                  <option value="Demand Draft / Cheque">Demand Draft / Cheque</option>
                  <option value="Debit / Credit Card">Debit / Credit Card</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="payment-remarks-input"
                  className="block text-xs font-medium text-slate-700 mb-1"
                >
                  Receipt Description / Remarks
                </label>
                <input
                  id="payment-remarks-input"
                  type="text"
                  value={paymentRemarks}
                  onChange={(e) => setPaymentRemarks(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedStudentForPayment(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer"
                >
                  Confirm &amp; Issue Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Student Fee Statement / Receipt */}
      {selectedStudentForReceipt && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="receipt-modal-title"
          className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4"
        >
          <div className="bg-white border border-slate-200 rounded-xl max-w-lg w-full p-6 space-y-5 shadow-xl">
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div>
                <div className="text-[11px] font-semibold text-blue-600">
                  ST. XAVIER&apos;S INSTITUTE OF TECHNOLOGY &amp; MANAGEMENT
                </div>
                <h2
                  id="receipt-modal-title"
                  className="font-display text-lg font-bold text-slate-900 mt-0.5"
                >
                  Official Student Fee Statement
                </h2>
                <p className="text-xs text-slate-500">
                  Academic Session {selectedStudentForReceipt.academicYear} · Semester{' '}
                  {selectedStudentForReceipt.semester}
                </p>
              </div>
              <button
                type="button"
                aria-label="Close statement modal"
                onClick={() => setSelectedStudentForReceipt(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <div className="text-slate-400">Student Name</div>
                <div className="font-semibold text-slate-900 mt-0.5">
                  {selectedStudentForReceipt.name}
                </div>
              </div>
              <div>
                <div className="text-slate-400">Roll Number</div>
                <div className="font-mono tabular-nums font-semibold text-slate-900 mt-0.5">
                  {selectedStudentForReceipt.rollNo}
                </div>
              </div>
              <div>
                <div className="text-slate-400">Program &amp; Department</div>
                <div className="font-medium text-slate-800 mt-0.5">
                  {selectedStudentForReceipt.course} ({selectedStudentForReceipt.department})
                </div>
              </div>
              <div>
                <div className="text-slate-400">Account Status</div>
                <div className="font-semibold text-slate-900 mt-0.5">
                  {selectedStudentForReceipt.status}
                </div>
              </div>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-xs">
                <tbody className="divide-y divide-slate-200">
                  <tr className="bg-slate-50/60">
                    <td className="py-2.5 px-4 text-slate-600">
                      Gross Semester Tuition, Lab &amp; Development Fee
                    </td>
                    <td className="py-2.5 px-4 font-mono tabular-nums text-right font-medium text-slate-900">
                      {formatINR(selectedStudentForReceipt.totalFee)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 text-slate-600">
                      Less: Institutional Merit Scholarship / Waiver
                    </td>
                    <td className="py-2.5 px-4 font-mono tabular-nums text-right text-slate-700">
                      -{formatINR(selectedStudentForReceipt.scholarshipAmount)}
                    </td>
                  </tr>
                  <tr className="bg-slate-50/60">
                    <td className="py-2.5 px-4 font-medium text-slate-800">
                      Net Payable Fee
                    </td>
                    <td className="py-2.5 px-4 font-mono tabular-nums text-right font-semibold text-slate-900">
                      {formatINR(
                        selectedStudentForReceipt.totalFee -
                          selectedStudentForReceipt.scholarshipAmount
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 text-emerald-700 font-medium">
                      Total Amount Received to Date
                    </td>
                    <td className="py-2.5 px-4 font-mono tabular-nums text-right font-semibold text-emerald-700">
                      {formatINR(selectedStudentForReceipt.paidAmount)}
                    </td>
                  </tr>
                  <tr className="bg-slate-100/80">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      Closing Balance Due
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-right font-bold text-slate-900">
                      {formatINR(calculateStudentPendingAmount(selectedStudentForReceipt))}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-400">
                Computer generated statement · Authorized by Finance Office
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedStudentForReceipt(null)}
                  className="px-4 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Enroll New Student */}
      {showAddStudentModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="enroll-modal-title"
          className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4"
        >
          <div className="bg-white border border-slate-200 rounded-xl max-w-lg w-full p-6 space-y-5 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <h2
                  id="enroll-modal-title"
                  className="font-display text-lg font-bold text-slate-900"
                >
                  Enroll Student Fee Account
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Create a new student fee ledger record for Academic Session 2026–27
                </p>
              </div>
              <button
                type="button"
                aria-label="Close enroll student modal"
                onClick={() => setShowAddStudentModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {addStudentError && (
              <div
                role="alert"
                className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700"
              >
                {addStudentError}
              </div>
            )}

            <form onSubmit={handleCreateStudent} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="student-roll"
                    className="block text-xs font-medium text-slate-700 mb-1"
                  >
                    Roll Number
                  </label>
                  <input
                    id="student-roll"
                    type="text"
                    placeholder="e.g. CSE/26/105"
                    value={newRollNo}
                    onChange={(e) => setNewRollNo(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="student-name"
                    className="block text-xs font-medium text-slate-700 mb-1"
                  >
                    Full Name
                  </label>
                  <input
                    id="student-name"
                    type="text"
                    placeholder="e.g. Siddharth Verma"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="student-email"
                    className="block text-xs font-medium text-slate-700 mb-1"
                  >
                    Institutional Email
                  </label>
                  <input
                    id="student-email"
                    type="email"
                    placeholder="student@stxaviers-inst.edu.in"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="student-phone"
                    className="block text-xs font-medium text-slate-700 mb-1"
                  >
                    Contact Phone
                  </label>
                  <input
                    id="student-phone"
                    type="text"
                    placeholder="+91 98200 11223"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label
                    htmlFor="student-course"
                    className="block text-xs font-medium text-slate-700 mb-1"
                  >
                    Course / Program
                  </label>
                  <input
                    id="student-course"
                    type="text"
                    value={newCourse}
                    onChange={(e) => setNewCourse(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label
                    htmlFor="student-dept"
                    className="block text-xs font-medium text-slate-700 mb-1"
                  >
                    Department
                  </label>
                  <input
                    id="student-dept"
                    type="text"
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label
                    htmlFor="student-sem"
                    className="block text-xs font-medium text-slate-700 mb-1"
                  >
                    Semester
                  </label>
                  <select
                    id="student-sem"
                    value={newSemester}
                    onChange={(e) => setNewSemester(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                      <option key={sem} value={sem}>
                        Semester {sem}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label
                    htmlFor="student-total-fee"
                    className="block text-xs font-medium text-slate-700 mb-1"
                  >
                    Gross Fee (₹)
                  </label>
                  <input
                    id="student-total-fee"
                    type="number"
                    value={newTotalFee}
                    onChange={(e) => setNewTotalFee(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label
                    htmlFor="student-scholarship"
                    className="block text-xs font-medium text-slate-700 mb-1"
                  >
                    Scholarship (₹)
                  </label>
                  <input
                    id="student-scholarship"
                    type="number"
                    value={newScholarship}
                    onChange={(e) => setNewScholarship(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label
                    htmlFor="student-initial-paid"
                    className="block text-xs font-medium text-slate-700 mb-1"
                  >
                    Initial Deposit (₹)
                  </label>
                  <input
                    id="student-initial-paid"
                    type="number"
                    value={newPaidAmount}
                    onChange={(e) => setNewPaidAmount(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="student-due-date"
                  className="block text-xs font-medium text-slate-700 mb-1"
                >
                  Installment Due Date
                </label>
                <input
                  id="student-due-date"
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer"
                >
                  Save Student Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
