import {
  StudentRecord,
  StaffMember,
  ExpenseRecord,
  FeeStatus,
  FinancialSummary,
  FeeStructureItem,
} from '../types/finance';

export function calculateStudentPendingAmount(student: Pick<StudentRecord, 'totalFee' | 'scholarshipAmount' | 'paidAmount'>): number {
  const netPayable = Math.max(0, student.totalFee - student.scholarshipAmount);
  return Math.max(0, netPayable - student.paidAmount);
}

export function deriveStudentFeeStatus(
  totalFee: number,
  scholarshipAmount: number,
  paidAmount: number,
  dueDate: string,
  referenceDate = '2026-10-28'
): FeeStatus {
  const netPayable = Math.max(0, totalFee - scholarshipAmount);
  const pending = Math.max(0, netPayable - paidAmount);
  if (pending === 0) {
    return 'Paid';
  }
  if (dueDate < referenceDate && paidAmount === 0) {
    return 'Overdue';
  }
  if (paidAmount > 0) {
    return 'Partial';
  }
  return 'Pending';
}

export function calculateNetStaffSalary(
  staff: Pick<StaffMember, 'basicSalary' | 'hraAllowance' | 'daAllowance' | 'pfDeduction' | 'taxDeduction'>
): number {
  const gross = staff.basicSalary + staff.hraAllowance + staff.daAllowance;
  const deductions = staff.pfDeduction + staff.taxDeduction;
  return Math.max(0, gross - deductions);
}

export function calculateGrossStaffSalary(
  staff: Pick<StaffMember, 'basicSalary' | 'hraAllowance' | 'daAllowance'>
): number {
  return staff.basicSalary + staff.hraAllowance + staff.daAllowance;
}

export function calculateCourseTotalFee(structure: Pick<FeeStructureItem, 'tuitionFee' | 'laboratoryFee' | 'libraryAndExamFee' | 'developmentFee'>): number {
  return (
    structure.tuitionFee +
    structure.laboratoryFee +
    structure.libraryAndExamFee +
    structure.developmentFee
  );
}

export function computeFinancialSummary(
  students: StudentRecord[],
  staff: StaffMember[],
  expenses: ExpenseRecord[]
): FinancialSummary {
  let totalExpectedTuition = 0;
  let totalScholarships = 0;
  let totalFeeCollected = 0;
  let totalPendingFee = 0;

  for (const s of students) {
    totalExpectedTuition += s.totalFee;
    totalScholarships += s.scholarshipAmount;
    totalFeeCollected += s.paidAmount;
    totalPendingFee += calculateStudentPendingAmount(s);
  }

  const totalNetReceivable = Math.max(0, totalExpectedTuition - totalScholarships);
  const collectionRatePercent =
    totalNetReceivable > 0
      ? Math.round((totalFeeCollected / totalNetReceivable) * 1000) / 10
      : 0;

  let totalApprovedExpenses = 0;
  let totalPendingExpenses = 0;

  for (const e of expenses) {
    if (e.approvalStatus === 'Approved') {
      totalApprovedExpenses += e.amount;
    } else if (e.approvalStatus === 'Pending Approval') {
      totalPendingExpenses += e.amount;
    }
  }

  let totalSalaryDisbursed = 0;
  let totalSalaryPending = 0;

  for (const member of staff) {
    const netSalary = calculateNetStaffSalary(member);
    if (member.status === 'Disbursed') {
      totalSalaryDisbursed += netSalary;
    } else {
      totalSalaryPending += netSalary;
    }
  }

  const netTreasuryBalance =
    totalFeeCollected - (totalApprovedExpenses + totalSalaryDisbursed);

  return {
    totalExpectedTuition,
    totalScholarships,
    totalNetReceivable,
    totalFeeCollected,
    totalPendingFee,
    collectionRatePercent,
    totalApprovedExpenses,
    totalPendingExpenses,
    totalSalaryDisbursed,
    totalSalaryPending,
    netTreasuryBalance,
  };
}

export function formatINR(amount: number): string {
  const isNegative = amount < 0;
  const absAmount = Math.abs(Math.round(amount));
  const formatted = absAmount.toLocaleString('en-IN');
  return `${isNegative ? '-₹' : '₹'}${formatted}`;
}

export function validatePaymentInput(amount: number, maxAllowed: number): string | null {
  if (!Number.isFinite(amount) || amount <= 0) {
    return 'Please enter a valid payment amount greater than ₹0.';
  }
  if (amount > maxAllowed) {
    return `Payment amount cannot exceed pending balance of ${formatINR(maxAllowed)}.`;
  }
  return null;
}
