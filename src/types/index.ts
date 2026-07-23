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

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  phone?: string;
  status: 'Active' | 'Inactive';
  lastLogin?: string;
}

export type ClassName =
  | 'LKG' | 'UKG'
  | '1st' | '2nd' | '3rd' | '4th' | '5th'
  | '6th' | '7th' | '8th' | '9th' | '10th'
  | '11th' | '12th';

export type Section = 'A' | 'B' | 'C' | 'D';

export interface Student {
  id: string;
  admissionNo: string;
  rollNo: string;
  firstName: string;
  lastName: string;
  name: string;
  className: ClassName;
  section: Section;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup: string;
  photo: string;
  fatherName: string;
  motherName: string;
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

export interface Staff {
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

export interface AttendanceRecord {
  id: string;
  date: string;
  entityId: string; // studentId or staffId
  entityType: 'Student' | 'Staff';
  name: string;
  className?: string;
  status: 'Present' | 'Absent' | 'Late' | 'Half Day' | 'Leave';
  timeIn?: string;
  timeOut?: string;
  remarks?: string;
}

export interface FeeStructure {
  id: string;
  className: ClassName;
  tuitionFee: number;
  admissionFee: number;
  transportFee: number;
  examFee: number;
  labFee: number;
  totalAnnualFee: number;
  dueDate: string;
}

export interface FeePayment {
  id: string;
  receiptNo: string;
  studentId: string;
  studentName: string;
  className: ClassName;
  amount: number;
  paymentMode: 'Cash' | 'Card' | 'UPI' | 'Bank Transfer' | 'Cheque';
  paymentDate: string;
  feeCategory: 'Tuition' | 'Transport' | 'Exam' | 'Uniform' | 'Books' | 'Other';
  status: 'Success' | 'Pending' | 'Failed';
  collectedBy: string;
}

export interface Exam {
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

export interface ExamMark {
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

export interface Supplier {
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

export interface PurchaseOrder {
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

export interface SalesItem {
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

export interface InventoryItem {
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

export interface BusRoute {
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

export interface Announcement {
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

export interface FinancialTransaction {
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

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  timestamp: string;
  read: boolean;
  category: 'Fee Due' | 'Birthday' | 'Attendance' | 'Exam' | 'Inventory' | 'Purchase' | 'Announcement';
}
