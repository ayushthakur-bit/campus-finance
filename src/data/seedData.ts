import {
  StudentRecord,
  StaffMember,
  ExpenseRecord,
  FeeStructureItem,
  LedgerTransaction,
  UserSession,
} from '../types/finance';

export const DEMO_USERS: Record<string, UserSession & { password: string }> = {
  admin: {
    id: 'usr-admin-01',
    name: 'Dr. Rajendra Prasad',
    email: 'admin@stxaviers-inst.edu.in',
    password: 'admin123',
    role: 'admin',
    title: 'Chief Bursar & Finance Controller',
    department: 'Central Treasury & Administration',
  },
  accountant: {
    id: 'usr-acc-02',
    name: 'Meenakshi Iyer',
    email: 'accounts@stxaviers-inst.edu.in',
    password: 'acc123',
    role: 'accountant',
    title: 'Senior Accounts Officer',
    department: 'Fee & Payroll Section',
  },
  auditor: {
    id: 'usr-aud-03',
    name: 'Vikramaditya Sen',
    email: 'audit@stxaviers-inst.edu.in',
    password: 'audit123',
    role: 'auditor',
    title: 'Internal Financial Auditor',
    department: 'Compliance & Statutory Audit',
  },
};

export const INITIAL_STUDENTS: StudentRecord[] = [];

export const INITIAL_STAFF: StaffMember[] = [];

export const INITIAL_EXPENSES: ExpenseRecord[] = [];

export const INITIAL_FEE_STRUCTURES: FeeStructureItem[] = [
  {
    id: 'fs-01',
    course: 'B.Tech Computer Science',
    department: 'Computer Science & Engg.',
    semester: 5,
    tuitionFee: 98000,
    laboratoryFee: 22000,
    libraryAndExamFee: 10000,
    developmentFee: 15000,
    hostelFeeOptional: 48000,
  },
  {
    id: 'fs-02',
    course: 'B.Tech Electronics',
    department: 'Electronics & Comm.',
    semester: 5,
    tuitionFee: 92000,
    laboratoryFee: 20000,
    libraryAndExamFee: 10000,
    developmentFee: 13000,
    hostelFeeOptional: 48000,
  },
  {
    id: 'fs-03',
    course: 'MBA Finance & Strategy',
    department: 'Management Studies',
    semester: 3,
    tuitionFee: 140000,
    laboratoryFee: 10000,
    libraryAndExamFee: 15000,
    developmentFee: 20000,
    hostelFeeOptional: 55000,
  },
  {
    id: 'fs-04',
    course: 'B.Tech Mechanical',
    department: 'Mechanical Engineering',
    semester: 5,
    tuitionFee: 88000,
    laboratoryFee: 18000,
    libraryAndExamFee: 10000,
    developmentFee: 12000,
    hostelFeeOptional: 48000,
  },
  {
    id: 'fs-05',
    course: 'BBA Honours',
    department: 'Management Studies',
    semester: 3,
    tuitionFee: 68000,
    laboratoryFee: 6000,
    libraryAndExamFee: 9000,
    developmentFee: 12000,
    hostelFeeOptional: 48000,
  },
];

export const INITIAL_LEDGER: LedgerTransaction[] = [];
