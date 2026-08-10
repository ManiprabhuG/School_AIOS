import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  Student,
  Staff,
  Supplier,
  PurchaseOrder,
  SalesItem,
  InventoryItem,
  BusRoute,
  Announcement,
  FeePayment,
  FeeStructure,
  Exam,
  ExamMark,
  FinancialTransaction,
  SystemNotification,
  AuditLog,
  User,
  RolePermission,
  ClassEntity,
  SubjectEntity,
  SectionEntity,
  FinancialAccount,
  AccountTransaction,
  AccountAdjustment,
  PaymentMethodConfig,
} from '@/types';
import {
  initialStudents,
  initialStaff,
  initialSuppliers,
  initialPurchases,
  initialSales,
  initialInventory,
  initialBuses,
  initialAnnouncements,
  initialFeePayments,
  feeStructures,
  initialExams,
  examMarks,
  initialFinancials,
  initialNotifications,
  currentUser,
} from '@/lib/mock-data';

export type EntityName =
  | 'students'
  | 'staff'
  | 'suppliers'
  | 'purchases'
  | 'sales'
  | 'inventory'
  | 'buses'
  | 'announcements'
  | 'feePayments'
  | 'feeStructures'
  | 'exams'
  | 'examMarks'
  | 'financials'
  | 'notifications'
  | 'classes'
  | 'subjects'
  | 'sections'
  | 'admins'
  | 'rolePermissions'
  | 'financialAccounts'
  | 'accountTransactions'
  | 'accountAdjustments';

export interface CrudState {
  students: Student[];
  staff: Staff[];
  suppliers: Supplier[];
  purchases: PurchaseOrder[];
  sales: SalesItem[];
  inventory: InventoryItem[];
  buses: BusRoute[];
  announcements: Announcement[];
  feePayments: FeePayment[];
  feeStructures: FeeStructure[];
  exams: Exam[];
  examMarks: ExamMark[];
  financials: FinancialTransaction[];
  notifications: SystemNotification[];
  auditLogs: AuditLog[];
  classes: ClassEntity[];
  subjects: SubjectEntity[];
  sections: SectionEntity[];
  admins: User[];
  rolePermissions: RolePermission[];
  financialAccounts: FinancialAccount[];
  accountTransactions: AccountTransaction[];
  accountAdjustments: AccountAdjustment[];
  pmConfig: PaymentMethodConfig;

  // Account Operations
  seedDefaultAccounts: () => void;
  addFinancialAccount: (account: Partial<FinancialAccount>) => void;
  updateFinancialAccount: (id: string, updates: Partial<FinancialAccount>) => void;
  recordAccountTransaction: (tx: Omit<AccountTransaction, 'id' | 'runningBalance'>) => AccountTransaction | null;
  adjustAccountBalance: (accountId: string, type: 'CREDIT' | 'DEBIT', amount: number, reason: string, user: string) => void;
  transferFunds: (fromAccountId: string, toAccountId: string, amount: number, description: string, user: string) => boolean;
  setPmConfig: (config: Partial<PaymentMethodConfig>) => void;
  updateFinancialTransaction: (id: string, updates: Partial<FinancialTransaction>, targetAccountId?: string) => void;
  deleteFinancialTransaction: (id: string) => void;
  updateAccountLedgerEntry: (id: string, updates: Partial<AccountTransaction>) => void;
  deleteAccountLedgerEntry: (id: string) => void;



  // Generic Operations
  addRecord: (entity: EntityName, item: any) => void;
  updateRecord: (entity: EntityName, id: string, updates: Record<string, any>) => void;
  softDeleteRecord: (entity: EntityName, id: string) => void;
  restoreRecord: (entity: EntityName, id: string) => void;
  permanentDeleteRecord: (entity: EntityName, id: string) => void;
  bulkDeleteRecords: (entity: EntityName, ids: string[], soft?: boolean) => void;
  bulkUpdateStatus: (entity: EntityName, ids: string[], statusField: string, statusValue: string) => void;
  importRecords: <T extends { id?: string }>(entity: EntityName, items: T[]) => void;
  logAudit: (log: Omit<AuditLog, 'id' | 'timestamp'>) => void;
  resetToDefaultData: () => void;
}


const initialClasses: ClassEntity[] = [];
const initialSubjects: SubjectEntity[] = [];
const initialSections: SectionEntity[] = [];

const initialAdmins: User[] = [currentUser];

export const initialRolePermissions: RolePermission[] = [
  {
    role: 'Super Admin',
    description: 'Full unmitigated access to all ERP modules, configuration and settings',
    permissions: [
      { module: 'Students', create: true, read: true, update: true, delete: true, export: true },
      { module: 'Staff', create: true, read: true, update: true, delete: true, export: true },
      { module: 'Fees', create: true, read: true, update: true, delete: true, export: true },
      { module: 'Examinations', create: true, read: true, update: true, delete: true, export: true },
      { module: 'Attendance', create: true, read: true, update: true, delete: true, export: true },
      { module: 'Finance', create: true, read: true, update: true, delete: true, export: true },
      { module: 'Inventory', create: true, read: true, update: true, delete: true, export: true },
      { module: 'Purchases', create: true, read: true, update: true, delete: true, export: true },
      { module: 'Sales', create: true, read: true, update: true, delete: true, export: true },
      { module: 'Bus & Transport', create: true, read: true, update: true, delete: true, export: true },
      { module: 'Announcements', create: true, read: true, update: true, delete: true, export: true },
      { module: 'Settings', create: true, read: true, update: true, delete: true, export: true },
    ],
  },
  {
    role: 'Principal',
    description: 'Executive academic & administrative oversight across all school departments',
    permissions: [
      { module: 'Students', create: true, read: true, update: true, delete: false, export: true },
      { module: 'Staff', create: true, read: true, update: true, delete: false, export: true },
      { module: 'Fees', create: false, read: true, update: false, delete: false, export: true },
      { module: 'Examinations', create: true, read: true, update: true, delete: false, export: true },
      { module: 'Attendance', create: true, read: true, update: true, delete: false, export: true },
      { module: 'Finance', create: false, read: true, update: false, delete: false, export: true },
      { module: 'Announcements', create: true, read: true, update: true, delete: false, export: true },
    ],
  },
  {
    role: 'Accountant',
    description: 'Access to Fee collections, Financial transactions, Purchasing & Sales',
    permissions: [
      { module: 'Fees', create: true, read: true, update: true, delete: false, export: true },
      { module: 'Finance', create: true, read: true, update: true, delete: false, export: true },
      { module: 'Purchases', create: true, read: true, update: true, delete: false, export: true },
      { module: 'Sales', create: true, read: true, update: true, delete: false, export: true },
      { module: 'Students', create: false, read: true, update: false, delete: false, export: true },
    ],
  },
  {
    role: 'Teacher',
    description: 'Access to Student roster, Marks entry, and Attendance management',
    permissions: [
      { module: 'Students', create: false, read: true, update: false, delete: false, export: true },
      { module: 'Examinations', create: true, read: true, update: true, delete: false, export: true },
      { module: 'Attendance', create: true, read: true, update: true, delete: false, export: true },
      { module: 'Announcements', create: false, read: true, update: false, delete: false, export: false },
    ],
  },
  {
    role: 'HR',
    description: 'Staff onboarding, payroll setup, performance tracking and attendance',
    permissions: [
      { module: 'Staff', create: true, read: true, update: true, delete: false, export: true },
      { module: 'Attendance', create: true, read: true, update: true, delete: false, export: true },
      { module: 'Announcements', create: true, read: true, update: true, delete: false, export: true },
    ],
  },
  {
    role: 'Inventory Manager',
    description: 'Stock management, asset tracking, purchase requests, and store sales',
    permissions: [
      { module: 'Inventory', create: true, read: true, update: true, delete: true, export: true },
      { module: 'Purchases', create: true, read: true, update: true, delete: false, export: true },
      { module: 'Sales', create: true, read: true, update: true, delete: false, export: true },
    ],
  },
  {
    role: 'Transport Manager',
    description: 'School bus routes, vehicle maintenance, driver assignments, and student transport',
    permissions: [
      { module: 'Bus & Transport', create: true, read: true, update: true, delete: true, export: true },
      { module: 'Students', create: false, read: true, update: false, delete: false, export: true },
    ],
  },
];

const initialAuditLogs: AuditLog[] = [];

const dummyStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

const notifyUserActivity = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('app-user-activity'));
  }
};

export const initialStaffList: Staff[] = [
  {
    id: 'stf-101',
    empId: 'EMP-2026-101',
    firstName: 'Abi',
    lastName: 'Sundar',
    name: 'Abi Sundar',
    role: 'Teacher',
    designation: 'Senior PGT Mathematics Teacher',
    department: 'Mathematics',
    email: 'abi@absschool.edu.in',
    phone: '9876543210',
    joiningDate: '2022-06-01',
    qualification: 'M.Sc., B.Ed',
    experienceYears: 6,
    salary: 52000,
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    status: 'Active',
    allocatedClass: '10th A',
    subjects: ['Mathematics', 'Algebra'],
    username: 'abi',
    password: 'abi123',
  },
  {
    id: 'stf-102',
    empId: 'EMP-2026-102',
    firstName: 'Rajesh',
    lastName: 'Kumar',
    name: 'Rajesh Kumar',
    role: 'Teacher',
    designation: 'Senior Physics Faculty',
    department: 'Science',
    email: 'rajesh@absschool.edu.in',
    phone: '9876543211',
    joiningDate: '2023-01-15',
    qualification: 'M.Sc Physics, B.Ed',
    experienceYears: 5,
    salary: 48000,
    photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    status: 'Active',
    allocatedClass: '9th B',
    subjects: ['Physics', 'Science'],
    username: 'rajesh',
    password: 'rajesh123',
  },
  {
    id: 'stf-103',
    empId: 'EMP-2026-103',
    firstName: 'Kavitha',
    lastName: 'Raman',
    name: 'Kavitha Raman',
    role: 'Teacher',
    designation: 'Senior Chemistry Faculty',
    department: 'Science',
    email: 'kavitha@absschool.edu.in',
    phone: '9876543212',
    joiningDate: '2021-08-10',
    qualification: 'M.Sc Chemistry, M.Ed',
    experienceYears: 8,
    salary: 50000,
    photo: 'https://images.unsplash.com/photo-1580894732413-840ed97c88b7?w=150&auto=format&fit=crop&q=80',
    status: 'Active',
    allocatedClass: '12th C',
    subjects: ['Chemistry'],
    username: 'kavitha',
    password: 'kavitha123',
  },
  {
    id: 'stf-104',
    empId: 'EMP-2026-104',
    firstName: 'Dr. Ramesh',
    lastName: 'Sharma',
    name: 'Dr. Ramesh Sharma',
    role: 'Principal',
    designation: 'School Principal & Academic Director',
    department: 'Administration',
    email: 'principal@absschool.edu.in',
    phone: '9876543200',
    joiningDate: '2018-04-01',
    qualification: 'Ph.D., M.Ed',
    experienceYears: 15,
    salary: 95000,
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    status: 'Active',
    allocatedClass: 'None',
    username: 'principal',
    password: 'principal123',
  },
  {
    id: 'stf-105',
    empId: 'EMP-2026-105',
    firstName: 'Priya',
    lastName: 'Verma',
    name: 'Priya Verma',
    role: 'Vice Principal',
    designation: 'Vice Principal & Head of Curriculum',
    department: 'Academics',
    email: 'vice@absschool.edu.in',
    phone: '9876543201',
    joiningDate: '2019-07-15',
    qualification: 'M.A. English, B.Ed',
    experienceYears: 11,
    salary: 75000,
    photo: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80',
    status: 'Active',
    allocatedClass: 'None',
    username: 'vice',
    password: 'vice123',
  },
  {
    id: 'stf-106',
    empId: 'EMP-2026-106',
    firstName: 'Suresh',
    lastName: 'Mehta',
    name: 'Suresh Mehta',
    role: 'Accountant',
    designation: 'Chief Accountant',
    department: 'Administration',
    email: 'accountant@absschool.edu.in',
    phone: '9876543202',
    joiningDate: '2020-11-01',
    qualification: 'M.Com, CA Inter',
    experienceYears: 7,
    salary: 55000,
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    status: 'Active',
    allocatedClass: 'None',
    username: 'accountant',
    password: 'accountant123',
  },
];

export const useCrudStore = create<CrudState>()(
  persist(
    (set, get) => ({
      students: [],
      staff: initialStaffList,
      suppliers: [],
      purchases: [],
      sales: [],
      inventory: [],
      buses: [],
      announcements: [],
      feePayments: [],
      feeStructures: [],
      exams: [],
      examMarks: [],
      financials: [],
      notifications: [],
      auditLogs: [],
      classes: initialClasses,
      subjects: initialSubjects,
      sections: initialSections,
      admins: initialAdmins,
      rolePermissions: initialRolePermissions,
      financialAccounts: [],
      accountTransactions: [],
      accountAdjustments: [],
      pmConfig: {
        digitalLabel: 'Digital Collections',
        preventNegativeBal: false,
      },


      seedDefaultAccounts: () => {
        const state = get();
        const now = new Date().toISOString().split('T')[0];

        if (state.financialAccounts.length === 0) {
          const mainAcc: FinancialAccount = {
            id: 'acc-main-001',
            accountName: 'Main School Account',
            accountCode: 'ACC-MAIN-001',
            accountType: 'School Bank Account',
            bankName: 'State Bank of India',
            branch: 'Main Branch, Knowledge City',
            accountNumber: '30129844001',
            ifscCode: 'SBIN0004012',
            openingBalance: 500000,
            currentBalance: 500000,
            openingDate: '2026-04-01',
            status: 'ACTIVE',
            description: 'Central operational bank account for fee receipts and direct disbursements.',
            createdAt: now,
            updatedAt: now,
          };
          const cashAcc: FinancialAccount = {
            id: 'acc-cash-001',
            accountName: 'Cash In Hand',
            accountCode: 'ACC-CASH-001',
            accountType: 'Cash Fund Account',
            openingBalance: 50000,
            currentBalance: 50000,
            openingDate: '2026-04-01',
            status: 'ACTIVE',
            description: 'Main cash fund account for physical cash collected and office cash expenses.',
            createdAt: now,
            updatedAt: now,
          };
          set({ financialAccounts: [mainAcc, cashAcc] });
        }
      },



      addFinancialAccount: (accountData) => {
        notifyUserActivity();
        const now = new Date().toISOString().split('T')[0];
        const newAcc: FinancialAccount = {
          id: accountData.id || `acc-${Date.now()}`,
          accountName: accountData.accountName || 'New Account',
          accountCode: accountData.accountCode || `ACC-${Math.floor(100 + Math.random() * 900)}`,
          accountType: accountData.accountType || 'School Bank Account',
          bankName: accountData.bankName || '',
          branch: accountData.branch || '',
          accountNumber: accountData.accountNumber || '',
          ifscCode: accountData.ifscCode || '',
          openingBalance: Number(accountData.openingBalance) || 0,
          currentBalance: Number(accountData.openingBalance) || 0,
          openingDate: accountData.openingDate || now,
          status: accountData.status || 'ACTIVE',
          description: accountData.description || '',
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ financialAccounts: [newAcc, ...state.financialAccounts] }));
        get().logAudit({
          userId: currentUser.id,
          userName: currentUser.name,
          userRole: currentUser.role,
          action: 'CREATE',
          module: 'financialAccounts',
          recordId: newAcc.id,
          details: `Created new financial account: ${newAcc.accountName} (${newAcc.accountCode})`,
        });
      },

      updateFinancialAccount: (id, updates) => {
        notifyUserActivity();
        const now = new Date().toISOString().split('T')[0];
        set((state) => ({
          financialAccounts: state.financialAccounts.map((acc) =>
            acc.id === id ? { ...acc, ...updates, updatedAt: now } : acc
          ),
        }));
        get().logAudit({
          userId: currentUser.id,
          userName: currentUser.name,
          userRole: currentUser.role,
          action: 'UPDATE',
          module: 'financialAccounts',
          recordId: id,
          details: `Updated financial account (ID: ${id})`,
        });
      },

      recordAccountTransaction: (txData) => {
        notifyUserActivity();
        const state = get();
        const accounts = state.financialAccounts;

        // Duplicate Check (Required Change 9)
        if (txData.referenceNo && txData.referenceNo.trim() !== '') {
          const existingTx = state.accountTransactions.find(
            (t) =>
              t.referenceNo === txData.referenceNo &&
              t.module === (txData.module || 'FINANCE') &&
              t.transactionType === (txData.transactionType || 'INCOME')
          );
          if (existingTx) {
            console.log('Duplicate transaction prevented for reference:', txData.referenceNo);
            return existingTx;
          }
        }

        // Account Routing Logic (Required Change 5)
        let targetAccount: FinancialAccount | undefined;
        const pMethod = (txData.paymentMethod || '').toLowerCase();
        
        if (txData.accountId) {
          targetAccount = accounts.find((a) => a.id === txData.accountId);
        }

        if (!targetAccount && accounts.length > 0) {
          if (pMethod.includes('cash')) {
            targetAccount =
              accounts.find(
                (a) =>
                  a.accountType === 'Cash Fund Account' ||
                  a.accountType === 'CASH' ||
                  a.accountName.toLowerCase().includes('cash')
              ) || accounts[0];
          } else {
            // UPI, QR Payment, Online Payment, Digital Collection, Electronic Transfer, Card, Bank Transfer, Cheque, NEFT, RTGS, IMPS -> School Bank Account
            targetAccount =
              accounts.find(
                (a) =>
                  a.accountType === 'School Bank Account' ||
                  a.accountType === 'BANK' ||
                  a.accountName.toLowerCase().includes('main') ||
                  a.accountName.toLowerCase().includes('bank')
              ) || accounts[0];
          }
        }

        if (!targetAccount) return null;

        const isCredit = txData.transactionType === 'INCOME' || (txData.credit && txData.credit > 0);
        const amount = isCredit ? Number(txData.credit || 0) : Number(txData.debit || 0);

        if (!isCredit && state.pmConfig.preventNegativeBal && targetAccount.currentBalance < amount) {
          alert(`Transaction Blocked: Insufficient funds in ${targetAccount.accountName}. Current balance: ₹${targetAccount.currentBalance}`);
          return null;
        }

        const newBalance = isCredit
          ? targetAccount.currentBalance + amount
          : targetAccount.currentBalance - amount;

        const now = new Date().toISOString().split('T')[0];
        const newTx: AccountTransaction = {
          id: `atx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          txnNumber: txData.txnNumber || `LATX-${Date.now().toString().slice(-6)}`,
          accountId: targetAccount.id,
          accountName: targetAccount.accountName,
          date: txData.date || now,
          referenceNo: txData.referenceNo || '',
          module: txData.module || 'FINANCE',
          transactionType: isCredit ? 'INCOME' : 'EXPENSE',
          description: txData.description || 'Account Movement',
          paymentMethod: txData.paymentMethod || 'Cash',
          debit: isCredit ? 0 : amount,
          credit: isCredit ? amount : 0,
          runningBalance: newBalance,
          createdBy: txData.createdBy || currentUser.name,
          createdAt: new Date().toISOString(),
        };

        set((prev) => ({
          financialAccounts: prev.financialAccounts.map((acc) =>
            acc.id === targetAccount!.id ? { ...acc, currentBalance: newBalance, updatedAt: now } : acc
          ),
          accountTransactions: [newTx, ...prev.accountTransactions],
        }));

        if (typeof window !== 'undefined') {
          fetch('/api/account-transactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newTx),
          }).catch((err) => console.error('Failed to sync account transaction to API:', err));
        }

        get().logAudit({
          userId: currentUser.id,
          userName: currentUser.name,
          userRole: currentUser.role,
          action: isCredit ? 'CREDIT' : 'DEBIT',
          module: 'accountTransactions',
          recordId: newTx.id,
          details: `${isCredit ? 'Credited' : 'Debited'} ₹${amount} to ${targetAccount.accountName}. New Balance: ₹${newBalance}`,
        });

        return newTx;
      },

      adjustAccountBalance: (accountId, type, amount, reason, user) => {
        notifyUserActivity();
        const state = get();
        const account = state.financialAccounts.find((a) => a.id === accountId);
        if (!account) return;

        const newBalance = type === 'CREDIT' ? account.currentBalance + amount : account.currentBalance - amount;
        const now = new Date().toISOString().split('T')[0];

        const adj: AccountAdjustment = {
          id: `adj-${Date.now()}`,
          accountId,
          accountName: account.accountName,
          type,
          amount,
          reason,
          adjustedBy: user,
          date: now,
          createdAt: new Date().toISOString(),
        };

        const tx: AccountTransaction = {
          id: `atx-adj-${Date.now()}`,
          txnNumber: `ADJ-${Date.now().toString().slice(-6)}`,
          accountId,
          accountName: account.accountName,
          date: now,
          module: 'ADJUSTMENT',
          transactionType: 'ADJUSTMENT',
          description: `Balance Adjustment: ${reason}`,
          paymentMethod: 'Internal Adjustment',
          debit: type === 'DEBIT' ? amount : 0,
          credit: type === 'CREDIT' ? amount : 0,
          runningBalance: newBalance,
          createdBy: user,
          createdAt: new Date().toISOString(),
        };

        set((prev) => ({
          financialAccounts: prev.financialAccounts.map((a) =>
            a.id === accountId ? { ...a, currentBalance: newBalance, updatedAt: now } : a
          ),
          accountAdjustments: [adj, ...prev.accountAdjustments],
          accountTransactions: [tx, ...prev.accountTransactions],
        }));

        get().logAudit({
          userId: currentUser.id,
          userName: currentUser.name,
          userRole: currentUser.role,
          action: 'ADJUSTMENT',
          module: 'financialAccounts',
          recordId: accountId,
          details: `Manual balance adjustment (${type}) of ₹${amount} for ${account.accountName}. Reason: ${reason}`,
        });
      },

      transferFunds: (fromAccountId, toAccountId, amount, description, user) => {
        notifyUserActivity();
        const state = get();
        const fromAcc = state.financialAccounts.find((a) => a.id === fromAccountId);
        const toAcc = state.financialAccounts.find((a) => a.id === toAccountId);

        if (!fromAcc || !toAcc || fromAccountId === toAccountId) {
          alert('Invalid source or destination account for transfer.');
          return false;
        }

        if (state.pmConfig.preventNegativeBal && fromAcc.currentBalance < amount) {
          alert(`Transfer Blocked: Source account ${fromAcc.accountName} has insufficient balance (₹${fromAcc.currentBalance}).`);
          return false;
        }

        const now = new Date().toISOString().split('T')[0];
        const fromBal = fromAcc.currentBalance - amount;
        const toBal = toAcc.currentBalance + amount;

        const outTx: AccountTransaction = {
          id: `atx-tr-out-${Date.now()}`,
          txnNumber: `TR-OUT-${Date.now().toString().slice(-6)}`,
          accountId: fromAccountId,
          accountName: fromAcc.accountName,
          date: now,
          module: 'TRANSFER',
          transactionType: 'TRANSFER',
          description: `Transfer Out to ${toAcc.accountName}: ${description}`,
          paymentMethod: 'Bank Transfer',
          debit: amount,
          credit: 0,
          runningBalance: fromBal,
          createdBy: user,
          createdAt: new Date().toISOString(),
        };

        const inTx: AccountTransaction = {
          id: `atx-tr-in-${Date.now()}`,
          txnNumber: `TR-IN-${Date.now().toString().slice(-6)}`,
          accountId: toAccountId,
          accountName: toAcc.accountName,
          date: now,
          module: 'TRANSFER',
          transactionType: 'TRANSFER',
          description: `Transfer In from ${fromAcc.accountName}: ${description}`,
          paymentMethod: 'Bank Transfer',
          debit: 0,
          credit: amount,
          runningBalance: toBal,
          createdBy: user,
          createdAt: new Date().toISOString(),
        };

        set((prev) => ({
          financialAccounts: prev.financialAccounts.map((a) => {
            if (a.id === fromAccountId) return { ...a, currentBalance: fromBal, updatedAt: now };
            if (a.id === toAccountId) return { ...a, currentBalance: toBal, updatedAt: now };
            return a;
          }),
          accountTransactions: [inTx, outTx, ...prev.accountTransactions],
        }));

        get().logAudit({
          userId: currentUser.id,
          userName: currentUser.name,
          userRole: currentUser.role,
          action: 'TRANSFER',
          module: 'financialAccounts',
          recordId: `${fromAccountId}->${toAccountId}`,
          details: `Transferred ₹${amount} from ${fromAcc.accountName} to ${toAcc.accountName}. Remarks: ${description}`,
        });

        return true;
      },

      setPmConfig: (config) => {
        notifyUserActivity();
        set((state) => ({
          pmConfig: { ...state.pmConfig, ...config },
        }));
      },

      updateFinancialTransaction: (id, updates, targetAccountId) => {
        notifyUserActivity();
        const state = get();
        const oldTx = state.financials.find((f) => f.id === id);
        if (!oldTx) return;

        const now = new Date().toISOString().split('T')[0];
        const accId = targetAccountId || state.financialAccounts[0]?.id || '';
        const account = state.financialAccounts.find((a) => a.id === accId) || state.financialAccounts[0];

        if (account) {
          // Revert old transaction balance effect
          let bal = account.currentBalance;
          if (oldTx.type === 'Income') {
            bal -= oldTx.amount;
          } else if (oldTx.type === 'Expense') {
            bal += oldTx.amount;
          }

          // Apply new transaction balance effect
          const newType = updates.type || oldTx.type;
          const newAmount = Number(updates.amount !== undefined ? updates.amount : oldTx.amount) || 0;
          if (newType === 'Income') {
            bal += newAmount;
          } else {
            bal -= newAmount;
          }

          const atxNumber = `ATX-${oldTx.transactionNo}`;
          const newCategory = updates.category || oldTx.category;
          const newPayee = updates.payeeName || oldTx.payeeName || 'General';
          const newDesc = updates.description || oldTx.description;
          const newMethod = updates.paymentMode || oldTx.paymentMode;

          const updatedAtxs = state.accountTransactions.map((t) => {
            if (t.txnNumber === atxNumber || t.referenceNo === oldTx.transactionNo) {
              return {
                ...t,
                transactionType: newType === 'Income' ? ('INCOME' as const) : ('EXPENSE' as const),
                description: `Voucher (${newCategory} - ${newPayee}): ${newDesc}`,
                paymentMethod: newMethod,
                credit: newType === 'Income' ? newAmount : 0,
                debit: newType === 'Income' ? 0 : newAmount,
                runningBalance: bal,
                date: updates.date || oldTx.date,
              };
            }
            return t;
          });

          set((prev) => ({
            financialAccounts: prev.financialAccounts.map((a) => (a.id === account.id ? { ...a, currentBalance: bal, updatedAt: now } : a)),
            accountTransactions: updatedAtxs,
            financials: prev.financials.map((f) => (f.id === id ? { ...f, ...updates, updatedAt: now } : f)),
          }));
        } else {
          set((prev) => ({
            financials: prev.financials.map((f) => (f.id === id ? { ...f, ...updates, updatedAt: now } : f)),
          }));
        }
      },

      deleteFinancialTransaction: (id) => {
        notifyUserActivity();
        const state = get();
        const oldTx = state.financials.find((f) => f.id === id);
        if (!oldTx) return;

        const now = new Date().toISOString().split('T')[0];
        const account = state.financialAccounts[0];

        if (account) {
          let bal = account.currentBalance;
          if (oldTx.type === 'Income') {
            bal -= oldTx.amount;
          } else if (oldTx.type === 'Expense') {
            bal += oldTx.amount;
          }

          const atxNumber = `ATX-${oldTx.transactionNo}`;

          set((prev) => ({
            financialAccounts: prev.financialAccounts.map((a) => (a.id === account.id ? { ...a, currentBalance: bal, updatedAt: now } : a)),
            accountTransactions: prev.accountTransactions.filter((t) => t.txnNumber !== atxNumber && t.referenceNo !== oldTx.transactionNo),
            financials: prev.financials.filter((f) => f.id !== id),
          }));
        } else {
          set((prev) => ({
            financials: prev.financials.filter((f) => f.id !== id),
          }));
        }
      },

      updateAccountLedgerEntry: (id, updates) => {
        notifyUserActivity();
        const state = get();
        const oldTx = state.accountTransactions.find((t) => t.id === id);
        if (!oldTx) return;

        const now = new Date().toISOString().split('T')[0];
        const targetAccountId = updates.accountId || oldTx.accountId;
        const account = state.financialAccounts.find((a) => a.id === targetAccountId) || state.financialAccounts[0];

        const isCredit = updates.transactionType === 'INCOME' || (updates.credit !== undefined ? Number(updates.credit) > 0 : (oldTx.credit && oldTx.credit > 0));
        const creditAmt = isCredit ? Number(updates.credit !== undefined ? updates.credit : oldTx.credit) : 0;
        const debitAmt = !isCredit ? Number(updates.debit !== undefined ? updates.debit : oldTx.debit) : 0;
        const newAmt = isCredit ? creditAmt : debitAmt;
        const newDate = updates.date || oldTx.date;
        const newMethod = updates.paymentMethod || oldTx.paymentMethod;
        const newDesc = updates.description || oldTx.description;
        const refNo = oldTx.referenceNo || oldTx.txnNumber;

        // Sync with mother module in store
        const mod = (oldTx.module || '').toUpperCase();
        let updatedFeePayments = state.feePayments;
        let updatedPurchases = state.purchases;
        let updatedSales = state.sales;
        let updatedFinancials = state.financials;

        if (mod === 'FEES' || refNo.includes('RCP') || refNo.includes('FEE')) {
          updatedFeePayments = state.feePayments.map((p) =>
            p.receiptNo === refNo || p.id === refNo
              ? { ...p, amount: newAmt, paymentMode: newMethod as any, paymentDate: newDate }
              : p
          );
        } else if (mod === 'PURCHASE' || refNo.includes('PO')) {
          updatedPurchases = state.purchases.map((p) =>
            p.poNumber === refNo || p.id === refNo
              ? { ...p, totalAmount: newAmt, orderDate: newDate }
              : p
          );
        } else if (mod === 'SALES' || refNo.includes('INV') || refNo.includes('SL')) {
          updatedSales = state.sales.map((s) =>
            s.invoiceNo === refNo || s.id === refNo
              ? { ...s, totalAmount: newAmt, netAmount: newAmt, date: newDate, paymentMethod: newMethod as any }
              : s
          );
        } else if (mod === 'FINANCE' || refNo.includes('TXN')) {
          updatedFinancials = state.financials.map((f) =>
            f.transactionNo === refNo || (f as any).txnNumber === refNo || f.id === refNo
              ? { ...f, amount: newAmt, date: newDate, paymentMode: newMethod as any, description: newDesc }
              : f
          );
        }

        if (account) {
          let bal = account.currentBalance;
          if (oldTx.transactionType === 'INCOME' || (oldTx.credit && oldTx.credit > 0)) {
            bal -= oldTx.credit || 0;
          } else {
            bal += oldTx.debit || 0;
          }

          if (isCredit) {
            bal += creditAmt;
          } else {
            bal -= debitAmt;
          }

          set((prev) => ({
            financialAccounts: prev.financialAccounts.map((a) => (a.id === account.id ? { ...a, currentBalance: bal, updatedAt: now } : a)),
            accountTransactions: prev.accountTransactions.map((t) =>
              t.id === id
                ? {
                    ...t,
                    ...updates,
                    accountId: account.id,
                    accountName: account.accountName,
                    transactionType: isCredit ? ('INCOME' as const) : ('EXPENSE' as const),
                    credit: creditAmt,
                    debit: debitAmt,
                    runningBalance: bal,
                  }
                : t
            ),
            feePayments: updatedFeePayments,
            purchases: updatedPurchases,
            sales: updatedSales,
            financials: updatedFinancials,
          }));
        } else {
          set((prev) => ({
            accountTransactions: prev.accountTransactions.map((t) => (t.id === id ? { ...t, ...updates } : t)),
            feePayments: updatedFeePayments,
            purchases: updatedPurchases,
            sales: updatedSales,
            financials: updatedFinancials,
          }));
        }

        if (typeof window !== 'undefined') {
          fetch('/api/account-transactions', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, ...updates }),
          }).catch((err) => console.error('Failed to sync updated account transaction to API:', err));
        }
      },

      deleteAccountLedgerEntry: (id) => {
        notifyUserActivity();
        const state = get();
        const oldTx = state.accountTransactions.find((t) => t.id === id);
        if (!oldTx) return;

        const now = new Date().toISOString().split('T')[0];
        const account = state.financialAccounts.find((a) => a.id === oldTx.accountId) || state.financialAccounts[0];
        const refNo = oldTx.referenceNo || oldTx.txnNumber;
        const mod = (oldTx.module || '').toUpperCase();

        // Cascade delete from mother modules in store
        const updatedFeePayments = state.feePayments.filter((p) => p.receiptNo !== refNo && p.id !== refNo);
        const updatedPurchases = state.purchases.filter((p) => p.poNumber !== refNo && p.id !== refNo);
        const updatedSales = state.sales.filter((s) => s.invoiceNo !== refNo && s.id !== refNo);
        const updatedFinancials = state.financials.filter((f) => f.transactionNo !== refNo && (f as any).txnNumber !== refNo && f.id !== refNo);

        if (account) {
          let bal = account.currentBalance;
          if (oldTx.transactionType === 'INCOME' || (oldTx.credit && oldTx.credit > 0)) {
            bal -= oldTx.credit || 0;
          } else {
            bal += oldTx.debit || 0;
          }

          set((prev) => ({
            financialAccounts: prev.financialAccounts.map((a) => (a.id === account.id ? { ...a, currentBalance: bal, updatedAt: now } : a)),
            accountTransactions: prev.accountTransactions.filter((t) => t.id !== id),
            feePayments: mod === 'FEES' || refNo.includes('RCP') ? updatedFeePayments : prev.feePayments,
            purchases: mod === 'PURCHASE' || refNo.includes('PO') ? updatedPurchases : prev.purchases,
            sales: mod === 'SALES' || refNo.includes('INV') ? updatedSales : prev.sales,
            financials: mod === 'FINANCE' || refNo.includes('TXN') ? updatedFinancials : prev.financials,
          }));
        } else {
          set((prev) => ({
            accountTransactions: prev.accountTransactions.filter((t) => t.id !== id),
            feePayments: mod === 'FEES' || refNo.includes('RCP') ? updatedFeePayments : prev.feePayments,
            purchases: mod === 'PURCHASE' || refNo.includes('PO') ? updatedPurchases : prev.purchases,
            sales: mod === 'SALES' || refNo.includes('INV') ? updatedSales : prev.sales,
            financials: mod === 'FINANCE' || refNo.includes('TXN') ? updatedFinancials : prev.financials,
          }));
        }

        if (typeof window !== 'undefined') {
          fetch(`/api/account-transactions?id=${id}`, {
            method: 'DELETE',
          }).catch((err) => console.error('Failed to sync deleted account transaction to API:', err));
        }
      },


      logAudit: (log) => {
        notifyUserActivity();
        const newLog: AuditLog = {
          ...log,
          id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          timestamp: new Date().toLocaleString(),
        };
        set((state) => ({ auditLogs: [newLog, ...state.auditLogs] }));
      },


      addRecord: (entity, item) => {
        notifyUserActivity();
        const now = new Date().toISOString().split('T')[0];
        const record = {
          ...item,
          createdAt: now,
          createdBy: currentUser.name,
          updatedAt: now,
          updatedBy: currentUser.name,
          isDeleted: false,
        };
        set((state) => ({
          [entity]: [record, ...(state[entity] as any[])],
        }));

        if (entity === 'admins' || entity === 'staff') {
          try {
            const authStore = require('@/store/auth-store').useAuthStore;
            authStore.getState().addUserAccount({
              id: item.id,
              username: item.username || item.email?.split('@')[0] || item.id,
              name: item.name || `${item.firstName || ''} ${item.lastName || ''}`.trim(),
              email: item.email || `${item.username}@absschool.edu.in`,
              role: item.role || 'Teacher',
              avatar: item.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
              phone: item.phone,
              status: item.status || 'Active',
              passwordHash: item.password || item.passwordHash || `${item.username || 'user'}123`,
            });
          } catch (err) {
            // Ignore if SSR
          }
        }

        get().logAudit({
          userId: currentUser.id,
          userName: currentUser.name,
          userRole: currentUser.role,
          action: 'CREATE',
          module: entity,
          recordId: item.id,
          details: `Created new record in ${entity} (ID: ${item.id})`,
        });
      },

      updateRecord: (entity, id, updates) => {
        notifyUserActivity();
        const now = new Date().toISOString().split('T')[0];
        set((state) => ({
          [entity]: (state[entity] as any[]).map((item) =>
            item.id === id
              ? {
                  ...item,
                  ...updates,
                  updatedAt: now,
                  updatedBy: currentUser.name,
                }
              : item
          ),
        }));
        get().logAudit({
          userId: currentUser.id,
          userName: currentUser.name,
          userRole: currentUser.role,
          action: 'UPDATE',
          module: entity,
          recordId: id,
          details: `Updated record in ${entity} (ID: ${id})`,
        });
      },

      softDeleteRecord: (entity, id) => {
        set((state) => ({
          [entity]: (state[entity] as any[]).map((item) =>
            item.id === id ? { ...item, isDeleted: true, updatedAt: new Date().toISOString().split('T')[0] } : item
          ),
        }));
        get().logAudit({
          userId: currentUser.id,
          userName: currentUser.name,
          userRole: currentUser.role,
          action: 'SOFT_DELETE',
          module: entity,
          recordId: id,
          details: `Soft deleted record in ${entity} (ID: ${id})`,
        });
      },

      restoreRecord: (entity, id) => {
        set((state) => ({
          [entity]: (state[entity] as any[]).map((item) =>
            item.id === id ? { ...item, isDeleted: false, updatedAt: new Date().toISOString().split('T')[0] } : item
          ),
        }));
        get().logAudit({
          userId: currentUser.id,
          userName: currentUser.name,
          userRole: currentUser.role,
          action: 'RESTORE',
          module: entity,
          recordId: id,
          details: `Restored soft-deleted record in ${entity} (ID: ${id})`,
        });
      },

      permanentDeleteRecord: (entity, id) => {
        set((state) => ({
          [entity]: (state[entity] as any[]).filter((item) => item.id !== id),
        }));
        get().logAudit({
          userId: currentUser.id,
          userName: currentUser.name,
          userRole: currentUser.role,
          action: 'DELETE',
          module: entity,
          recordId: id,
          details: `Permanently deleted record in ${entity} (ID: ${id})`,
        });
      },

      bulkDeleteRecords: (entity, ids, soft = true) => {
        if (soft) {
          set((state) => ({
            [entity]: (state[entity] as any[]).map((item) =>
              ids.includes(item.id) ? { ...item, isDeleted: true } : item
            ),
          }));
        } else {
          set((state) => ({
            [entity]: (state[entity] as any[]).filter((item) => !ids.includes(item.id)),
          }));
        }
        get().logAudit({
          userId: currentUser.id,
          userName: currentUser.name,
          userRole: currentUser.role,
          action: 'BULK_DELETE',
          module: entity,
          recordId: ids.join(','),
          details: `Bulk ${soft ? 'soft-deleted' : 'permanently deleted'} ${ids.length} records in ${entity}`,
        });
      },

      bulkUpdateStatus: (entity, ids, statusField, statusValue) => {
        set((state) => ({
          [entity]: (state[entity] as any[]).map((item) =>
            ids.includes(item.id) ? { ...item, [statusField]: statusValue } : item
          ),
        }));
        get().logAudit({
          userId: currentUser.id,
          userName: currentUser.name,
          userRole: currentUser.role,
          action: 'BULK_UPDATE',
          module: entity,
          recordId: ids.join(','),
          details: `Bulk updated ${statusField} to "${statusValue}" for ${ids.length} records in ${entity}`,
        });
      },

      importRecords: (entity, items) => {
        const now = new Date().toISOString().split('T')[0];
        const formatted = items.map((item, idx) => ({
          ...item,
          id: item.id || `${entity}-${Date.now()}-${idx}`,
          createdAt: now,
          createdBy: currentUser.name,
          updatedAt: now,
          updatedBy: currentUser.name,
          isDeleted: false,
        }));
        set((state) => ({
          [entity]: [...formatted, ...(state[entity] as any[])],
        }));
        get().logAudit({
          userId: currentUser.id,
          userName: currentUser.name,
          userRole: currentUser.role,
          action: 'IMPORT',
          module: entity,
          recordId: `count-${items.length}`,
          details: `Imported ${items.length} records into ${entity}`,
        });
      },

      resetToDefaultData: () => {
        set((prev) => ({
          // PRESERVED (UNCHANGED):
          students: prev.students,
          staff: prev.staff,
          classes: prev.classes,
          subjects: prev.subjects,
          sections: prev.sections,
          feeStructures: prev.feeStructures,
          suppliers: prev.suppliers,
          admins: prev.admins,
          rolePermissions: prev.rolePermissions,

          // CLEARED & RESET TO ZERO:
          purchases: [],
          sales: [],
          inventory: [],
          buses: [],
          announcements: [],
          feePayments: [],
          exams: [],
          examMarks: [],
          financials: [],
          notifications: [],
          auditLogs: [],
          accountTransactions: [],
          accountAdjustments: [],
          financialAccounts: prev.financialAccounts.map((a) => ({
            ...a,
            currentBalance: a.openingBalance || 0,
          })),
          pmConfig: { digitalLabel: 'Digital Collections', preventNegativeBal: false },
        }));
      },


    }),
    {
      name: 'abs_school_erp_crud_store_v1',
      storage: createJSONStorage(() => (typeof window !== 'undefined' && window.localStorage ? window.localStorage : dummyStorage)),
    }
  )
);
