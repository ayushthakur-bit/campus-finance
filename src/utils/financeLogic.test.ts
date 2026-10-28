import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateStudentPendingAmount,
  deriveStudentFeeStatus,
  calculateNetStaffSalary,
  calculateCourseTotalFee,
  computeFinancialSummary,
  validatePaymentInput,
} from './financeLogic';
import { StudentRecord, StaffMember, ExpenseRecord } from '../types/finance';

test('calculateStudentPendingAmount computes net payable minus paid amount', () => {
  assert.equal(
    calculateStudentPendingAmount({
      totalFee: 120000,
      scholarshipAmount: 20000,
      paidAmount: 65000,
    }),
    35000
  );
  assert.equal(
    calculateStudentPendingAmount({
      totalFee: 90000,
      scholarshipAmount: 10000,
      paidAmount: 80000,
    }),
    0
  );
});

test('deriveStudentFeeStatus returns Paid, Partial, Overdue, and Pending accurately', () => {
  assert.equal(deriveStudentFeeStatus(100000, 10000, 90000, '2026-10-15', '2026-10-28'), 'Paid');
  assert.equal(deriveStudentFeeStatus(100000, 0, 45000, '2026-10-15', '2026-10-28'), 'Partial');
  assert.equal(deriveStudentFeeStatus(100000, 0, 0, '2026-10-01', '2026-10-28'), 'Overdue');
  assert.equal(deriveStudentFeeStatus(100000, 0, 0, '2026-11-15', '2026-10-28'), 'Pending');
});

test('calculateNetStaffSalary computes gross minus deductions accurately', () => {
  assert.equal(
    calculateNetStaffSalary({
      basicSalary: 85000,
      hraAllowance: 18000,
      daAllowance: 12000,
      pfDeduction: 9500,
      taxDeduction: 7500,
    }),
    98000
  );
});

test('calculateCourseTotalFee sums tuition, lab, library, and development fees', () => {
  assert.equal(
    calculateCourseTotalFee({
      tuitionFee: 75000,
      laboratoryFee: 15000,
      libraryAndExamFee: 8000,
      developmentFee: 12000,
    }),
    110000
  );
});

test('computeFinancialSummary aggregates student fees, staff payroll, and expenses', () => {
  const students: StudentRecord[] = [
    {
      id: 's1',
      rollNo: 'CSE-2026-001',
      name: 'Aarav Sharma',
      email: 'aarav@college.edu',
      phone: '9876543210',
      course: 'B.Tech CSE',
      department: 'Computer Science',
      semester: 5,
      academicYear: '2026-27',
      totalFee: 120000,
      scholarshipAmount: 20000,
      paidAmount: 100000,
      dueDate: '2026-10-15',
      status: 'Paid',
    },
    {
      id: 's2',
      rollNo: 'ECE-2026-014',
      name: 'Priya Nair',
      email: 'priya@college.edu',
      phone: '9876543211',
      course: 'B.Tech ECE',
      department: 'Electronics',
      semester: 3,
      academicYear: '2026-27',
      totalFee: 100000,
      scholarshipAmount: 0,
      paidAmount: 50000,
      dueDate: '2026-11-10',
      status: 'Partial',
    },
  ];

  const staff: StaffMember[] = [
    {
      id: 'st1',
      employeeId: 'EMP-101',
      name: 'Dr. R. K. Verma',
      designation: 'Professor',
      department: 'Computer Science',
      roleType: 'Faculty',
      basicSalary: 90000,
      hraAllowance: 20000,
      daAllowance: 10000,
      pfDeduction: 10000,
      taxDeduction: 10000,
      paymentMonth: 'October 2026',
      status: 'Disbursed',
      bankAccountLast4: '4821',
    },
  ];

  const expenses: ExpenseRecord[] = [
    {
      id: 'ex1',
      voucherNo: 'VCH-2026-01',
      title: 'GPU Server Upgrade',
      category: 'Infrastructure & Lab',
      department: 'Computer Science',
      vendorName: 'TechNova Systems',
      amount: 25000,
      date: '2026-10-12',
      paymentMethod: 'NEFT / RTGS',
      approvalStatus: 'Approved',
      requestedBy: 'Dr. R. K. Verma',
    },
  ];

  const summary = computeFinancialSummary(students, staff, expenses);
  assert.equal(summary.totalExpectedTuition, 220000);
  assert.equal(summary.totalScholarships, 20000);
  assert.equal(summary.totalNetReceivable, 200000);
  assert.equal(summary.totalFeeCollected, 150000);
  assert.equal(summary.totalPendingFee, 50000);
  assert.equal(summary.collectionRatePercent, 75);
  assert.equal(summary.totalSalaryDisbursed, 100000);
  assert.equal(summary.totalApprovedExpenses, 25000);
  assert.equal(summary.netTreasuryBalance, 25000);
});

test('validatePaymentInput validates bounds properly', () => {
  assert.notEqual(validatePaymentInput(0, 50000), null);
  assert.notEqual(validatePaymentInput(60000, 50000), null);
  assert.equal(validatePaymentInput(25000, 50000), null);
});
