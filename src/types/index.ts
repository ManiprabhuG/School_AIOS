export type UserRole =
  | 'Super Admin'
  | 'Principal'
  | 'Vice Principal'
  | 'Admin'
  | 'Accountant'
  | 'Teacher'
  | 'HR'
  | 'Receptionist'
  | 'Librarian'
  | 'Transport Manager'
  | 'Inventory Manager'
  | 'Parent'
  | 'Student';

export interface BaseAuditEntity {
  isDeleted?: boolean;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface User extends BaseAuditEntity {
  id: string;
  username?: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  phone?: string;
  status: 'Active' | 'Inactive';
  lastLogin?: string;
  passwordHash?: string;
  failedAttempts?: number;
  isLocked?: boolean;
  lockedUntil?: string;
}

export interface LoginAuditRecord {
  id: string;
  userId: string;
  username: string;
  timestamp: string;
  status: 'SUCCESS' | 'FAILED_PASSWORD' | 'ACCOUNT_LOCKED' | 'INACTIVE_ACCOUNT' | 'USER_NOT_FOUND';
  ipAddress: string;
  userAgent: string;
}

export type ClassName =
  | 'LKG' | 'UKG'
  | '1st' | '2nd' | '3rd' | '4th' | '5th'
  | '6th' | '7th' | '8th' | '9th' | '10th'
  | '11th' | '12th';

export type Section = 'A' | 'B' | 'C' | 'D';

export interface Student extends BaseAuditEntity {
  id: string;
  admissionNo: string;
  rollNo: string;
  firstName: string;
  lastName: string;
  name: string;
  className: ClassName;
  section: Section;
  course?: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup: string;
  photo: string;
  fatherName: string;
  motherName: string;
  parentName?: string;
  parentPhone: string;
  parentEmail: string;
  address: string;
  busRoute?: string;
  feeStatus: 'Paid' | 'Partial' | 'Pending';
  totalFees: number;
  paidFees: number;
  dueFees: number;
  attendancePercent: number;
  medicalInfo?: string;
  joiningDate: string;
  status: 'Active' | 'Transferred' | 'Alumni';
}

export interface Staff extends BaseAuditEntity {
  id: string;
  empId: string;
  firstName: string;
  lastName: string;
  name: string;
  role: UserRole;
  department: string;
  designation: string;
  email: string;
  phone: string;
  joiningDate: string;
  qualification: string;
  experienceYears: number;
  salary: number;
  photo: string;
  status: 'Active' | 'On Leave' | 'Resigned';
  subjects?: string[];
  allocatedClass?: string;
  busRouteHandled?: string;
}

export interface AttendanceRecord extends BaseAuditEntity {
  id: string;
  date: string;
  entityId: string; // studentId or staffId
  entityType: 'Student' | 'Staff';
  name: string;
  className?: string;
  section?: string;
  staffType?: 'Teaching' | 'Non-Teaching';
  department?: string;
  status: 'Present' | 'Absent' | 'Late' | 'Half Day' | 'Leave';
  timeIn?: string;
  timeOut?: string;
  remarks?: string;
}

export interface FeeStructure extends BaseAuditEntity {
  id: string;
  className: ClassName;
  tuitionFee: number;
  admissionFee: number;
  transportFee: number;
  uniformFee: number;
  labFee: number;
  totalAnnualFee: number;
  dueDate: string;
}

export interface FeePayment extends BaseAuditEntity {
  id: string;
  receiptNo: string;
  studentId: string;
  studentName: string;
  className: ClassName;
  amount: number;
  totalAmount?: number;
  dueAmount?: number;
  paymentMode: 'Cash' | 'Card' | 'UPI' | 'Bank Transfer' | 'Cheque';
  paymentDate: string;
  feeCategory: 'Tuition' | 'Transport' | 'Exam' | 'Uniform' | 'Books' | 'Admission' | 'Lab' | 'Other' | string;
  status: 'Success' | 'Pending' | 'Failed';
  collectedBy: string;
}

export interface Exam extends BaseAuditEntity {
  id: string;
  name: string;
  examType: 'Unit Test' | 'Mid Term' | 'Quarterly' | 'Half Yearly' | 'Annual';
  className: ClassName;
  startDate: string;
  endDate: string;
  totalMarks: number;
  passingMarks: number;
  status: 'Upcoming' | 'Ongoing' | 'Completed';
}

export interface ExamMark extends BaseAuditEntity {
  id: string;
  examId: string;
  examName: string;
  studentId: string;
  studentName: string;
  rollNo: string;
  className: ClassName;
  subject: string;
  marksObtained: number;
  maxMarks: number;
  grade: string;
  remarks: string;
}

export interface Supplier extends BaseAuditEntity {
  id: string;
  supplierCode: string;
  name: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  gstNo: string;
  category: string;
  outstandingBalance: number;
  address: string;
  status: 'Active' | 'Inactive';
}

export interface PurchaseOrder extends BaseAuditEntity {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  orderDate: string;
  deliveryDate: string;
  totalAmount: number;
  status: 'Draft' | 'Sent' | 'Goods Received' | 'Paid' | 'Cancelled';
  itemsCount: number;
}

export interface SalesItem extends BaseAuditEntity {
  id: string;
  invoiceNo: string;
  customerName: string;
  customerType: 'Student' | 'Staff' | 'Guest';
  itemCategory: 'Uniform' | 'ID Card' | 'Books' | 'Stationery' | 'Accessories';
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  discount: number;
  netAmount: number;
  date: string;
  paymentMethod: 'Cash' | 'UPI' | 'Card';
}

export interface InventoryItem extends BaseAuditEntity {
  id: string;
  itemCode: string;
  name: string;
  category: 'Uniforms' | 'Books' | 'Stationery' | 'Furniture' | 'Computers' | 'Electronics' | 'Laboratory' | 'Sports' | 'Office';
  quantityInStock: number;
  minReorderLevel: number;
  unitPrice: number;
  supplierName: string;
  warehouseLocation: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
}

export interface BusRoute extends BaseAuditEntity {
  id: string;
  routeNo: string;
  routeName: string;
  busNo: string;
  driverName: string;
  driverPhone: string;
  conductorName: string;
  capacity: number;
  assignedStudentsCount: number;
  feePerTerm: number;
  status: 'Operational' | 'Maintenance' | 'Idle';
}

export interface Announcement extends BaseAuditEntity {
  id: string;
  title: string;
  content: string;
  targetAudience: ('Students' | 'Parents' | 'Teachers' | 'Staff')[];
  priority: 'Normal' | 'Important' | 'Urgent';
  author: string;
  date: string;
  scheduledFor?: string;
  status: 'Published' | 'Scheduled' | 'Draft';
}

export interface FinancialTransaction extends BaseAuditEntity {
  id: string;
  transactionNo: string;
  type: 'Income' | 'Expense';
  category: string;
  amount: number;
  date: string;
  description: string;
  paymentMode: string;
  referenceNo?: string;
  approvedBy: string;
}

export interface SystemNotification extends BaseAuditEntity {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  timestamp: string;
  read: boolean;
  category: 'Fee Due' | 'Birthday' | 'Attendance' | 'Exam' | 'Inventory' | 'Purchase' | 'Announcement';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'SOFT_DELETE' | 'RESTORE' | 'BULK_DELETE' | 'BULK_UPDATE' | 'IMPORT';
  module: string;
  recordId: string;
  details: string;
}

export interface RolePermission {
  role: UserRole;
  description: string;
  permissions: {
    module: string;
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
    export: boolean;
  }[];
}

export interface ClassEntity extends BaseAuditEntity {
  id: string;
  className: ClassName;
  classTeacher: string;
  capacity: number;
  totalStudents: number;
  roomNo: string;
}

export interface SubjectEntity extends BaseAuditEntity {
  id: string;
  code: string;
  name: string;
  className: ClassName;
  teacherName: string;
  credits: number;
  type: 'Core' | 'Elective' | 'Lab';
}

export interface SectionEntity extends BaseAuditEntity {
  id: string;
  className: ClassName;
  section: Section;
  capacity: number;
  classTeacher: string;
}
