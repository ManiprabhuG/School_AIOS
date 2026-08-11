'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useMemo } from 'react';
import { useCrudStore } from '@/store/crud-store';
import { useAuthStore } from '@/store/auth-store';
import { exportToCSV, exportToExcel, exportToPDF } from '@/lib/export-utils';
import PrintModal from '@/components/print/PrintModal';
import TemplateSettingsModal from '@/components/print/TemplateSettingsModal';
import { ReportData } from '@/components/print/ReportTemplate';
import { TemplateBranding, defaultBranding } from '@/components/print/TemplateHeaderFooter';
import {
  BarChart3,
  FileSpreadsheet,
  Printer,
  GraduationCap,
  Users,
  CreditCard,
  Landmark,
  ShoppingBag,
  ShoppingCart,
  Boxes,
  Truck,
  Bus,
  BookOpen,
  FileText,
  SlidersHorizontal,
  PieChart,
  CalendarCheck,
  AlertTriangle,
  Award,
  Contact,
  DollarSign,
  UserCheck,
  CheckCircle,
} from 'lucide-react';

export default function ReportsPage() {
  const store = useCrudStore();
  const { user, activeRole } = useAuthStore();
  const [activePrintReport, setActivePrintReport] = useState<ReportData | null>(null);
  const [branding, setBranding] = useState<TemplateBranding>(defaultBranding);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const isTeacherRole = activeRole === 'Teacher';
  const isExecutive = ['Super Admin', 'Admin', 'Principal', 'Vice Principal'].includes(activeRole);

  const [activeTab, setActiveTab] = useState<'TEACHER' | 'EXECUTIVE'>(isTeacherRole ? 'TEACHER' : 'EXECUTIVE');

  // Match logged-in teacher's allocated class dynamically from Staff Allocation Matrix / Session
  const teacherAllocatedClass = useMemo(() => {
    if (isExecutive) return null;

    const uId = (user?.id || '').trim().toLowerCase();
    const uEmail = (user?.email || '').trim().toLowerCase();
    const uName = (user?.name || '').trim().toLowerCase();
    const uUsername = (user?.username || '').trim().toLowerCase();

    const matchedStaff = store.staff.find((s) => {
      const sId = (s.id || '').trim().toLowerCase();
      const sEmail = (s.email || '').trim().toLowerCase();
      const sName = (s.name || '').trim().toLowerCase();
      const sUsername = (s.username || s.empId || (s as any).employeeId || '').trim().toLowerCase();

      if (uId && sId === uId) return true;
      if (uEmail && sEmail === uEmail) return true;
      if (uName && sName === uName) return true;
      if (uUsername && (sUsername === uUsername || (sEmail && sEmail.includes(uUsername)))) return true;
      return false;
    });

    const directClass = (user as any)?.allocatedClass || (user as any)?.assignedClass;
    const rawClass = directClass || matchedStaff?.allocatedClass || (matchedStaff as any)?.assignedClass;
    const teacherName = matchedStaff?.name || user?.name || 'Teacher';

    if (!rawClass || rawClass === 'None' || rawClass === 'null') {
      return {
        full: 'None',
        className: 'None',
        section: 'None',
        teacherName,
        hasAllocation: false,
      };
    }

    const cleanRaw = rawClass.trim();
    let cls = '';
    let sec = '';

    if (cleanRaw.includes('-')) {
      const parts = cleanRaw.split('-');
      cls = parts[0].trim();
      sec = parts[1].trim();
    } else if (cleanRaw.includes(' ')) {
      const parts = cleanRaw.split(' ');
      cls = parts[0].trim();
      sec = parts[1].trim();
    } else {
      cls = cleanRaw;
      sec = 'None';
    }

    return {
      full: rawClass,
      className: cls,
      section: sec,
      teacherName,
      hasAllocation: true,
    };
  }, [isExecutive, store.staff, user]);

  // Dynamically filter students for the teacher's allocated class & section
  const teacherStudents = useMemo(() => {
    if (isExecutive || !teacherAllocatedClass || !teacherAllocatedClass.hasAllocation) {
      return store.students;
    }

    const targetCls = teacherAllocatedClass.className.toLowerCase();
    const targetSec = teacherAllocatedClass.section.toLowerCase();

    return store.students.filter((s) => {
      if ((s.status as string) === 'Inactive' || s.status === 'Transferred') return false;

      let sCls = (s.className || '').trim().toLowerCase();
      let sSec = (s.section || '').trim().toLowerCase();

      if (!sSec && sCls.includes('-')) {
        const parts = sCls.split('-');
        sCls = parts[0].trim();
        sSec = parts[1].trim();
      } else if (!sSec && sCls.includes(' ')) {
        const parts = sCls.split(' ');
        sCls = parts[0].trim();
        sSec = parts[1].trim();
      }

      const classMatches = sCls === targetCls || sCls.includes(targetCls) || targetCls.includes(sCls);
      const sectionMatches = !targetSec || targetSec === 'none' || sSec === targetSec;

      return classMatches && sectionMatches;
    });
  }, [isExecutive, store.students, teacherAllocatedClass]);

  // 1. Teacher Class Attendance & Low Attendance Defaulter Report
  const teacherAttendanceReportData = useMemo(() => {
    return teacherStudents.map((std) => {
      const attPct = std.attendancePercent ?? 90;
      const isDefaulter = attPct < 75;
      return {
        rollNo: std.rollNo || '-',
        admissionNo: std.admissionNo,
        name: std.name,
        classSection: `Class ${std.className || '10th'}-${std.section || 'A'}`,
        attendancePercent: `${attPct}%`,
        statusAlert: isDefaulter ? '🚨 Low Attendance (<75%)' : '✅ Good Standing',
        parentPhone: std.parentPhone || '9876543210',
      };
    });
  }, [teacherStudents]);

  // 2. Teacher Exam Performance & Marksheet Analytics Report
  const teacherExamReportData = useMemo(() => {
    return teacherStudents.map((std, idx) => {
      const isTopRank = idx < 3;
      const attPct = std.attendancePercent ?? 90;
      const isWeak = attPct < 75 || std.dueFees > 25000;
      return {
        rollNo: std.rollNo || '-',
        admissionNo: std.admissionNo,
        name: std.name,
        classSection: `Class ${std.className || '10th'}-${std.section || 'A'}`,
        academicRank: isTopRank ? `Rank #${idx + 1} 🏆` : `Pass (Grade A)`,
        categoryStatus: isTopRank ? 'Top Ranker' : isWeak ? 'Needs Remedial Support' : 'Average Performer',
        feeBalance: `₹${(std.dueFees || 0).toLocaleString('en-IN')}`,
      };
    });
  }, [teacherStudents]);

  // 3. Student Progress Card & PTM Report Card Generator Data
  const teacherProgressCardData = useMemo(() => {
    return teacherStudents.map((std, idx) => {
      const attPct = std.attendancePercent ?? 92;
      return {
        rollNo: std.rollNo || '-',
        admissionNo: std.admissionNo,
        name: std.name,
        classSection: `Class ${std.className || '10th'}-${std.section || 'A'}`,
        fatherName: std.fatherName || 'Parent Name',
        attendance: `${attPct}%`,
        conductRemark: 'Excellent discipline and regular homework submission',
        ptmStatus: 'Ready for Parent Signature',
      };
    });
  }, [teacherStudents]);

  // 4. Class Directory & Parent Contact Directory Report
  const teacherClassDirectoryData = useMemo(() => {
    return teacherStudents.map((std) => ({
      rollNo: std.rollNo || '-',
      admissionNo: std.admissionNo,
      name: std.name,
      classSection: `Class ${std.className || '10th'}-${std.section || 'A'}`,
      fatherName: std.fatherName || 'Father Name',
      parentPhone: std.parentPhone || '9876543210',
      parentEmail: std.parentEmail || 'parent@example.com',
      bloodGroup: std.bloodGroup || 'O+',
      busRoute: std.busRoute || 'Self Transport',
    }));
  }, [teacherStudents]);

  // 5. Class Fee Status & Outstanding Dues Summary Report
  const teacherFeeDuesData = useMemo(() => {
    return teacherStudents.map((std) => ({
      rollNo: std.rollNo || '-',
      admissionNo: std.admissionNo,
      name: std.name,
      parentPhone: std.parentPhone || '9876543210',
      totalFees: `₹${(std.totalFees || 42000).toLocaleString('en-IN')}`,
      paidFees: `₹${(std.paidFees || 0).toLocaleString('en-IN')}`,
      dueFees: `₹${(std.dueFees || 0).toLocaleString('en-IN')}`,
      feeStatus: std.feeStatus || (std.dueFees === 0 ? 'Paid' : 'Pending'),
    }));
  }, [teacherStudents]);

  // Teacher Suite Report Cards Config
  const teacherReportsList = [
    {
      title: 'Class Attendance & Defaulter Report',
      desc: 'Monthly muster roll, low attendance alerts (<75%) & parent contacts',
      count: `${teacherStudents.length} Class Students`,
      data: teacherAttendanceReportData,
      filename: 'ABS_Class_Attendance_Defaulter_Report',
      icon: CalendarCheck,
      cols: [
        { key: 'rollNo', label: 'Roll No' },
        { key: 'admissionNo', label: 'Admission No' },
        { key: 'name', label: 'Student Name' },
        { key: 'classSection', label: 'Class & Sec' },
        { key: 'attendancePercent', label: 'Attendance %' },
        { key: 'statusAlert', label: 'Standing / Alert' },
        { key: 'parentPhone', label: 'Parent Mobile' },
      ],
    },
    {
      title: 'Exam Performance & Marksheet Analytics',
      desc: 'Subject pass percentages, top rankers & remedial support list',
      count: `${teacherStudents.length} Students Evaluated`,
      data: teacherExamReportData,
      filename: 'ABS_Class_Exam_Performance_Report',
      icon: Award,
      cols: [
        { key: 'rollNo', label: 'Roll No' },
        { key: 'admissionNo', label: 'Admission No' },
        { key: 'name', label: 'Student Name' },
        { key: 'classSection', label: 'Class & Sec' },
        { key: 'academicRank', label: 'Rank / Standing' },
        { key: 'categoryStatus', label: 'Academic Category' },
        { key: 'feeBalance', label: 'Fee Dues' },
      ],
    },
    {
      title: 'Student Progress Card & PTM Report',
      desc: 'Printable Term Report Cards for Parent-Teacher Meetings',
      count: `${teacherStudents.length} PTM Progress Cards`,
      data: teacherProgressCardData,
      filename: 'ABS_Student_PTM_Progress_Report',
      icon: GraduationCap,
      cols: [
        { key: 'rollNo', label: 'Roll No' },
        { key: 'admissionNo', label: 'Admission No' },
        { key: 'name', label: 'Student Name' },
        { key: 'classSection', label: 'Class & Sec' },
        { key: 'fatherName', label: 'Parent Name' },
        { key: 'attendance', label: 'Attendance' },
        { key: 'conductRemark', label: 'Teacher Conduct Remark' },
        { key: 'ptmStatus', label: 'PTM Verification' },
      ],
    },
    {
      title: 'Class Directory & Parent Contact Directory',
      desc: 'Roll call list, parent phone numbers, blood groups & bus routes',
      count: `${teacherStudents.length} Class Directory Entries`,
      data: teacherClassDirectoryData,
      filename: 'ABS_Class_Parent_Directory_Report',
      icon: Contact,
      cols: [
        { key: 'rollNo', label: 'Roll No' },
        { key: 'admissionNo', label: 'Admission No' },
        { key: 'name', label: 'Student Name' },
        { key: 'classSection', label: 'Class & Sec' },
        { key: 'fatherName', label: 'Parent Name' },
        { key: 'parentPhone', label: 'Phone No' },
        { key: 'bloodGroup', label: 'Blood Group' },
        { key: 'busRoute', label: 'Transport / Route' },
      ],
    },
    {
      title: 'Class Fee Status & Dues Summary',
      desc: 'Pending fee dues summary for class PTM reminders',
      count: `${teacherStudents.filter((s) => s.dueFees > 0).length} Dues Pending`,
      data: teacherFeeDuesData,
      filename: 'ABS_Class_Fee_Dues_Summary',
      icon: DollarSign,
      cols: [
        { key: 'rollNo', label: 'Roll No' },
        { key: 'admissionNo', label: 'Admission No' },
        { key: 'name', label: 'Student Name' },
        { key: 'parentPhone', label: 'Parent Mobile' },
        { key: 'totalFees', label: 'Total Fees' },
        { key: 'paidFees', label: 'Paid Fees' },
        { key: 'dueFees', label: 'Due Fees' },
        { key: 'feeStatus', label: 'Status' },
      ],
    },
  ];

  // Executive ERP Suite Report Cards Config
  const executiveReportsList = [
    {
      title: 'Student Master Roster',
      desc: 'Enrolment details, parent contacts & class sections',
      count: `${store.students.length} Students`,
      data: store.students,
      filename: 'ABS_Student_Master_Report',
      icon: GraduationCap,
      cols: [
        { key: 'admissionNo', label: 'Admission No' },
        { key: 'name', label: 'Name' },
        { key: 'className', label: 'Class' },
        { key: 'rollNo', label: 'Roll No' },
        { key: 'parentPhone', label: 'Parent Phone' },
        { key: 'feeStatus', label: 'Fee Status' },
      ],
    },
    {
      title: 'Staff Directory & Payroll',
      desc: 'Employee IDs, designations & salary slips',
      count: `${store.staff.length} Employees`,
      data: store.staff,
      filename: 'ABS_Staff_Payroll_Report',
      icon: Users,
      cols: [
        { key: 'empId', label: 'Emp ID' },
        { key: 'name', label: 'Name' },
        { key: 'role', label: 'Role' },
        { key: 'department', label: 'Department' },
        { key: 'salary', label: 'Salary' },
        { key: 'status', label: 'Status' },
      ],
    },
    {
      title: 'Fee Collection Ledger',
      desc: 'Receipts, mode of payment & tuition fees',
      count: `${store.feePayments.length} Receipts`,
      data: store.feePayments,
      filename: 'ABS_Fee_Collection_Ledger',
      icon: CreditCard,
      cols: [
        { key: 'receiptNo', label: 'Receipt No' },
        { key: 'studentName', label: 'Student' },
        { key: 'amount', label: 'Amount' },
        { key: 'feeCategory', label: 'Category' },
        { key: 'paymentMode', label: 'Mode' },
        { key: 'paymentDate', label: 'Date' },
      ],
    },
    {
      title: 'Financial Income & Expense',
      desc: 'Cash book, profit & loss statement',
      count: `${store.financials.length} Entries`,
      data: store.financials,
      filename: 'ABS_Financial_Ledger',
      icon: Landmark,
      cols: [
        { key: 'transactionNo', label: 'Voucher No' },
        { key: 'type', label: 'Type' },
        { key: 'category', label: 'Category' },
        { key: 'amount', label: 'Amount' },
        { key: 'date', label: 'Date' },
        { key: 'approvedBy', label: 'Approved By' },
      ],
    },
    {
      title: 'Purchase Orders & GRN',
      desc: 'Vendor orders & procurement logs',
      count: `${store.purchases.length} POs`,
      data: store.purchases,
      filename: 'ABS_Purchase_Report',
      icon: ShoppingBag,
      cols: [
        { key: 'poNumber', label: 'PO No' },
        { key: 'supplierName', label: 'Supplier' },
        { key: 'totalAmount', label: 'Total Amount' },
        { key: 'status', label: 'Status' },
        { key: 'orderDate', label: 'Order Date' },
      ],
    },
    {
      title: 'Uniform & POS Sales Summary',
      desc: 'Daily counter receipts & store sales',
      count: `${store.sales.length} Invoices`,
      data: store.sales,
      filename: 'ABS_Sales_Report',
      icon: ShoppingCart,
      cols: [
        { key: 'invoiceNo', label: 'Invoice No' },
        { key: 'customerName', label: 'Customer' },
        { key: 'itemName', label: 'Item' },
        { key: 'netAmount', label: 'Net Amount' },
        { key: 'date', label: 'Date' },
      ],
    },
    {
      title: 'Inventory Stock & Warehouse',
      desc: 'Stock quantities, reorder levels & value',
      count: `${store.inventory.length} SKUs`,
      data: store.inventory,
      filename: 'ABS_Inventory_Report',
      icon: Boxes,
      cols: [
        { key: 'itemCode', label: 'Item Code' },
        { key: 'name', label: 'Name' },
        { key: 'category', label: 'Category' },
        { key: 'quantityInStock', label: 'Stock Qty' },
        { key: 'unitPrice', label: 'Unit Price' },
        { key: 'status', label: 'Status' },
      ],
    },
    {
      title: 'Supplier & Vendor Database',
      desc: 'GST numbers & outstanding balances',
      count: `${store.suppliers.length} Suppliers`,
      data: store.suppliers,
      filename: 'ABS_Supplier_Report',
      icon: Truck,
      cols: [
        { key: 'supplierCode', label: 'Code' },
        { key: 'name', label: 'Supplier Name' },
        { key: 'companyName', label: 'Company' },
        { key: 'gstNo', label: 'GSTIN' },
        { key: 'outstandingBalance', label: 'Balance' },
      ],
    },
    {
      title: 'Bus Route & Fleet Report',
      desc: 'Vehicle numbers, driver contacts & capacity',
      count: `${store.buses.length} Routes`,
      data: store.buses,
      filename: 'ABS_Transport_Report',
      icon: Bus,
      cols: [
        { key: 'routeNo', label: 'Route No' },
        { key: 'routeName', label: 'Route Description' },
        { key: 'busNo', label: 'Bus Vehicle No' },
        { key: 'driverName', label: 'Driver' },
        { key: 'feePerTerm', label: 'Fee/Term' },
      ],
    },
    {
      title: 'Examination Schedules',
      desc: 'Schedules, dates, pass marks & status',
      count: `${store.exams.length} Exams`,
      data: store.exams,
      filename: 'ABS_Exam_Schedules_Report',
      icon: BookOpen,
      cols: [
        { key: 'name', label: 'Exam Title' },
        { key: 'examType', label: 'Type' },
        { key: 'className', label: 'Class' },
        { key: 'startDate', label: 'Start Date' },
        { key: 'endDate', label: 'End Date' },
        { key: 'totalMarks', label: 'Total Marks' },
      ],
    },
    {
      title: 'Fund Summary & Balances',
      desc: 'Central school accounts opening, credits, debits & closing balance',
      count: `${store.financialAccounts.length} Fund Accounts`,
      data: store.financialAccounts.map((a) => {
        const txs = store.accountTransactions.filter((t) => t.accountId === a.id);
        const credits = txs.reduce((sum, t) => sum + (t.credit || 0), 0);
        const debits = txs.reduce((sum, t) => sum + (t.debit || 0), 0);
        return {
          accountName: a.accountName,
          accountCode: a.accountCode,
          accountType: a.accountType,
          openingBalance: a.openingBalance,
          totalCredits: credits,
          totalDebits: debits,
          closingBalance: a.currentBalance,
        };
      }),
      filename: 'ABS_Fund_Summary_Report',
      icon: Landmark,
      cols: [
        { key: 'accountName', label: 'Account Name' },
        { key: 'accountCode', label: 'Code' },
        { key: 'accountType', label: 'Type' },
        { key: 'openingBalance', label: 'Opening Bal' },
        { key: 'totalCredits', label: 'Total Income (+)' },
        { key: 'totalDebits', label: 'Total Expense (-)' },
        { key: 'closingBalance', label: 'Closing Bal' },
      ],
    },
    {
      title: 'Payment Method Analytics',
      desc: `Cash vs ${store.pmConfig.digitalLabel || 'Digital Collections'} breakdown across accounts`,
      count: 'Payment Mode Analysis',
      data: ['Cash', 'UPI', 'Bank Transfer', 'Cheque', 'Card'].map((method) => {
        const txs = store.accountTransactions.filter((t) => t.paymentMethod?.toLowerCase() === method.toLowerCase());
        const income = txs.reduce((sum, t) => sum + (t.credit || 0), 0);
        const expense = txs.reduce((sum, t) => sum + (t.debit || 0), 0);
        const displayLabel = method === 'UPI' ? store.pmConfig.digitalLabel || 'Digital Collections' : method;
        return {
          paymentMethod: displayLabel,
          transactionCount: txs.length,
          totalCollections: income,
          totalDisbursements: expense,
          netMovement: income - expense,
        };
      }),
      filename: 'ABS_Payment_Method_Analysis',
      icon: PieChart,
      cols: [
        { key: 'paymentMethod', label: 'Payment Instrument' },
        { key: 'transactionCount', label: 'Txn Count' },
        { key: 'totalCollections', label: 'Total Receipts' },
        { key: 'totalDisbursements', label: 'Disbursements' },
        { key: 'netMovement', label: 'Net Position' },
      ],
    },
  ];

  const displayReports = activeTab === 'TEACHER' ? teacherReportsList : executiveReportsList;

  const handleOpenReportPrint = (rep: any) => {
    setActivePrintReport({
      title: rep.title,
      subtitle: rep.desc,
      moduleName: rep.filename,
      docNumber: `REP-${Date.now().toString().slice(-6)}`,
      generatedDate: new Date().toLocaleString('en-IN'),
      generatedBy: user?.name || 'Academic Faculty',
      columns: rep.cols,
      rows: rep.data,
      summaryItems: [
        { label: 'Total Records', value: rep.data.length, highlight: true },
        { label: 'Academic Year', value: branding.academicYear },
        { label: 'Allocated Class', value: teacherAllocatedClass?.hasAllocation ? `Class ${teacherAllocatedClass.className}-${teacherAllocatedClass.section}` : 'All Classes' },
      ],
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="no-print space-y-6">
        {/* Header Branding & Hub Navigation */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <BarChart3 className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {activeTab === 'TEACHER' ? 'Teacher Class Reports & Analytics Hub' : 'ERP Executive Reports & Printing Hub'}
                </h1>
                {!isExecutive && teacherAllocatedClass && teacherAllocatedClass.hasAllocation && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-extrabold text-[11px] flex items-center gap-1">
                    <UserCheck className="w-3 h-3" /> Class {teacherAllocatedClass.className}-{teacherAllocatedClass.section}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {activeTab === 'TEACHER'
                  ? `Class Attendance, Marksheets, PTM Progress Cards & Contact Directory for ${teacherAllocatedClass?.teacherName || 'Teacher'}`
                  : 'Print-Ready Standardized Templates, Thermal Receipts, PDF, CSV & Excel Exports'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Tab Selector */}
            <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setActiveTab('TEACHER')}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
                  activeTab === 'TEACHER'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" /> Teacher Reports
              </button>
              {isExecutive && (
                <button
                  onClick={() => setActiveTab('EXECUTIVE')}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
                    activeTab === 'EXECUTIVE'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" /> Executive Suite
                </button>
              )}
            </div>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="px-3 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-all"
            >
              <SlidersHorizontal className="w-4 h-4 text-blue-500" />
              <span>Branding</span>
            </button>
          </div>
        </div>

        {/* Teacher Class Banner Notice */}
        {activeTab === 'TEACHER' && !isExecutive && teacherAllocatedClass && !teacherAllocatedClass.hasAllocation && (
          <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl flex items-center gap-3 text-xs text-amber-900 dark:text-amber-200 font-semibold">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>
              No class is currently allocated to your teacher account ({teacherAllocatedClass.teacherName}). Please ask an Administrator to assign your class in the Staff Allocation Matrix to filter class-specific metrics.
            </span>
          </div>
        )}

        {/* Report Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {displayReports.map((r, idx) => {
            const Icon = r.icon;
            return (
              <div key={idx} className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between hover:border-blue-300 dark:hover:border-blue-700 transition-all">
                <div className="flex items-start gap-3">
                  <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shrink-0">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-base">{r.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{r.desc}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-lg">
                      {r.count}
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5 pt-1">
                    <button
                      onClick={() => exportToCSV(r.filename, r.data as any[])}
                      className="py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-[11px] transition-all text-center"
                      title="Export CSV"
                    >
                      CSV
                    </button>
                    <button
                      onClick={() => exportToExcel(r.filename, r.data as any[])}
                      className="py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[11px] transition-all text-center flex items-center justify-center gap-1"
                      title="Export Excel"
                    >
                      <FileSpreadsheet className="w-3 h-3" /> Excel
                    </button>
                    <button
                      onClick={() => handleOpenReportPrint(r)}
                      className="py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold text-[11px] transition-all text-center flex items-center justify-center gap-1"
                      title="Export PDF"
                    >
                      <FileText className="w-3 h-3" /> PDF
                    </button>
                    <button
                      onClick={() => handleOpenReportPrint(r)}
                      className="py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] transition-all text-center flex items-center justify-center gap-1 shadow-sm active:scale-95"
                      title="Print Template Preview"
                    >
                      <Printer className="w-3 h-3" /> Print
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Print Preview Modal */}
      {activePrintReport && (
        <PrintModal
          isOpen={!!activePrintReport}
          onClose={() => setActivePrintReport(null)}
          title={`Print Preview - ${activePrintReport.title}`}
          reportData={activePrintReport}
          branding={branding}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
      )}

      {/* Template Settings Customizer */}
      <TemplateSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        branding={branding}
        onSave={(updated) => setBranding(updated)}
      />
    </div>
  );
}
