export type UserRole = 'admin' | 'accountant' | 'auditor';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  title: string;
  department: string;
}

export type FeeStatus = 'Paid' | 'Partial' | 'Pending' | 'Overdue';

export interface StudentRecord {
  id: string;
  rollNo: string;
  name: string;
  email: string;
  phone: string;
  course: string;
  department: string;
  semester: number;
  academicYear: string;
  totalFee: number;
  scholarshipAmount: number;
  paidAmount: number;
  dueDate: string;
  lastPaymentDate?: string;
  status: FeeStatus;
}

export type SalaryStatus = 'Disbursed' | 'Pending' | 'Processing';

export interface StaffMember {
  id: string;
  employeeId: string;
  name: string;
  designation: string;
  department: string;
  roleType: 'Faculty' | 'Administrative' | 'Technical';
  basicSalary: number;
  hraAllowance: number;
  daAllowance: number;
  pfDeduction: number;
  taxDeduction: number;
  paymentMonth: string;
  status: SalaryStatus;
  lastDisbursedDate?: string;
  bankAccountLast4: string;
}

export type ExpenseCategory =
  | 'Infrastructure & Lab'
  | 'Campus Utilities'
  | 'Library & Research'
  | 'Maintenance & Operations'
  | 'Academic Events'
  | 'Software & ERP';

export type ExpenseApprovalStatus = 'Approved' | 'Pending Approval' | 'Rejected';

export interface ExpenseRecord {
  id: string;
  voucherNo: string;
  title: string;
  category: ExpenseCategory;
  department: string;
  vendorName: string;
  amount: number;
  date: string;
  paymentMethod: 'NEFT / RTGS' | 'Cheque' | 'UPI Institutional' | 'Corporate Card';
  approvalStatus: ExpenseApprovalStatus;
  requestedBy: string;
  notes?: string;
}

export interface FeeStructureItem {
  id: string;
  course: string;
  department: string;
  semester: number;
  tuitionFee: number;
  laboratoryFee: number;
  libraryAndExamFee: number;
  developmentFee: number;
  hostelFeeOptional: number;
}

export interface LedgerTransaction {
  id: string;
  referenceNo: string;
  date: string;
  type: 'Credit (Fee)' | 'Debit (Expense)' | 'Debit (Salary)';
  partyName: string;
  department: string;
  description: string;
  amount: number;
  paymentMode: string;
}

export interface FinancialSummary {
  totalExpectedTuition: number;
  totalScholarships: number;
  totalNetReceivable: number;
  totalFeeCollected: number;
  totalPendingFee: number;
  collectionRatePercent: number;
  totalApprovedExpenses: number;
  totalPendingExpenses: number;
  totalSalaryDisbursed: number;
  totalSalaryPending: number;
  netTreasuryBalance: number;
}
