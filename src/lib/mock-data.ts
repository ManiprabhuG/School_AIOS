import {
  Student,
  Staff,
  AttendanceRecord,
  FeePayment,
  FeeStructure,
  Exam,
  ExamMark,
  Supplier,
  PurchaseOrder,
  SalesItem,
  InventoryItem,
  BusRoute,
  Announcement,
  FinancialTransaction,
  SystemNotification,
  User,
} from '@/types';

export const currentUser: User = {
  id: 'usr-1',
  name: 'Dr. Rajesh Sharma',
  email: 'admin@absschool.edu.in',
  role: 'Super Admin',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  phone: '+91 98765 43210',
  status: 'Active',
  lastLogin: '2026-07-23 09:15 AM',
};

// All business arrays start EMPTY in production real database mode
export const initialStudents: Student[] = [];
export const initialStaff: Staff[] = [];
export const initialFeePayments: FeePayment[] = [];
export const feeStructures: FeeStructure[] = [];
export const initialExams: Exam[] = [];
export const examMarks: ExamMark[] = [];
export const initialSuppliers: Supplier[] = [];
export const initialPurchases: PurchaseOrder[] = [];
export const initialSales: SalesItem[] = [];
export const initialInventory: InventoryItem[] = [];
export const initialBuses: BusRoute[] = [];
export const initialAnnouncements: Announcement[] = [];
export const initialFinancials: FinancialTransaction[] = [];
export const initialNotifications: SystemNotification[] = [];
