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
  | 'rolePermissions';

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
      classes: [],
      subjects: [],
      sections: [],
      admins: initialAdmins,
      rolePermissions: initialRolePermissions,

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
