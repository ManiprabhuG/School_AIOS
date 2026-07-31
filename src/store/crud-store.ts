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
      { module: 'Finance', create: true, read: true, update: true, delete: true, export: true },
      { module: 'Settings', create: true, read: true, update: true, delete: true, export: true },
    ],
  },
  {
    role: 'Accountant',
    description: 'Access to Fee collections, Financial transactions, Purchasing & Sales',
    permissions: [
      { module: 'Fees', create: true, read: true, update: true, delete: false, export: true },
      { module: 'Finance', create: true, read: true, update: true, delete: false, export: true },
      { module: 'Purchases', create: true, read: true, update: true, delete: false, export: true },
    ],
  },
  {
    role: 'Teacher',
    description: 'Access to Student roster, Marks entry, and Attendance management',
    permissions: [
      { module: 'Students', create: false, read: true, update: false, delete: false, export: true },
      { module: 'Examinations', create: true, read: true, update: true, delete: false, export: true },
      { module: 'Attendance', create: true, read: true, update: true, delete: false, export: true },
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

export const useCrudStore = create<CrudState>()(
  persist(
    (set, get) => ({
      students: [],
      staff: [],
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
        if (state.financialAccounts.length > 0) return;
        const now = new Date().toISOString().split('T')[0];
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
        get().logAudit({
          userId: currentUser.id,
          userName: currentUser.name,
          userRole: currentUser.role,
          action: 'CREATE',
          module: 'financialAccounts',
          recordId: 'seed-default-accounts',
          details: 'Seeded default financial accounts: Main School Account & Cash In Hand',
        });
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

        let targetAccount = accounts.find((a) => a.id === txData.accountId);
        if (!targetAccount && accounts.length > 0) {
          targetAccount = txData.paymentMethod?.toLowerCase().includes('cash')
            ? accounts.find((a) => a.accountType === 'Cash Fund Account' || a.accountName.toLowerCase().includes('cash')) || accounts[0]
            : accounts.find((a) => a.accountType === 'School Bank Account' || a.accountName.toLowerCase().includes('main')) || accounts[0];
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
        set({
          students: [],
          staff: [],
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
          classes: [],
          subjects: [],
          sections: [],
          financialAccounts: [],
          accountTransactions: [],
          accountAdjustments: [],
          pmConfig: { digitalLabel: 'Digital Collections', preventNegativeBal: false },
          admins: [currentUser],
          rolePermissions: initialRolePermissions,
        });
      },

    }),
    {
      name: 'abs_school_erp_crud_store_v1',
      storage: createJSONStorage(() => (typeof window !== 'undefined' && window.localStorage ? window.localStorage : dummyStorage)),
    }
  )
);
