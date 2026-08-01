'use client';

export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { useCrudStore } from '@/store/crud-store';
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
} from 'lucide-react';


export default function ReportsPage() {
  const store = useCrudStore();
  const [activePrintReport, setActivePrintReport] = useState<ReportData | null>(null);
  const [branding, setBranding] = useState<TemplateBranding>(defaultBranding);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const reportsList = [
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
      title: 'Account-Wise Central Ledger',
      desc: 'Full audit history of all fund account credits and debits',
      count: `${store.accountTransactions.length} Ledger Entries`,
      data: store.accountTransactions,
      filename: 'ABS_Account_Wise_Ledger',
      icon: FileText,
      cols: [
        { key: 'date', label: 'Date' },
        { key: 'txnNumber', label: 'Voucher No' },
        { key: 'accountName', label: 'Account Name' },
        { key: 'module', label: 'Module' },
        { key: 'description', label: 'Description' },
        { key: 'paymentMethod', label: 'Payment Method' },
        { key: 'credit', label: 'Credit (+)' },
        { key: 'debit', label: 'Debit (-)' },
        { key: 'runningBalance', label: 'Balance' },
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

  const handleOpenReportPrint = (rep: typeof reportsList[0]) => {
    setActivePrintReport({
      title: rep.title,
      subtitle: rep.desc,
      moduleName: rep.filename,
      docNumber: `REP-${Date.now().toString().slice(-6)}`,
      generatedDate: new Date().toLocaleString('en-IN'),
      generatedBy: 'Administrator',
      columns: rep.cols,
      rows: rep.data,
      summaryItems: [
        { label: 'Total Records', value: rep.data.length, highlight: true },
        { label: 'Academic Year', value: branding.academicYear },
        { label: 'Status', value: 'Verified Audit' },
      ],
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="no-print space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">ERP Executive Reports & Printing Hub</h1>
              <p className="text-xs text-slate-500">Print-Ready Standardized Templates, Thermal Receipts, PDF, CSV & Excel Exports</p>
            </div>
          </div>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-2 transition-all"
          >
            <SlidersHorizontal className="w-4 h-4 text-blue-500" />
            <span>Template Branding Settings</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {reportsList.map((r, idx) => {
            const Icon = r.icon;
            return (
              <div key={idx} className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
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
                    <span className="font-mono font-bold text-slate-400">{r.count}</span>
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
