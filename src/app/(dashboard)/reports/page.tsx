'use client';

import React from 'react';
import { exportToCSV } from '@/lib/utils';
import {
  initialStudents,
  initialStaff,
  initialFeePayments,
  initialPurchases,
  initialSuppliers,
  initialInventory,
  initialSales,
  initialExams,
  initialFinancials,
  initialBuses,
} from '@/lib/mock-data';
import { BarChart3, FileSpreadsheet, Download, Printer, GraduationCap, Users, CalendarCheck, CreditCard, Landmark, ShoppingBag, ShoppingCart, Boxes, Truck, Bus, BookOpen } from 'lucide-react';

export default function ReportsPage() {
  const reportsList = [
    { title: 'Student Master Roster', desc: 'Enrolment details, parent contacts & class sections', count: `${initialStudents.length} Students`, data: initialStudents, filename: 'ABS_Student_Master_Report', icon: GraduationCap },
    { title: 'Staff Directory & Payroll', desc: 'Employee IDs, designations & salary slips', count: `${initialStaff.length} Employees`, data: initialStaff, filename: 'ABS_Staff_Payroll_Report', icon: Users },
    { title: 'Fee Collection Ledger', desc: 'Receipts, mode of payment & tuition fees', count: `${initialFeePayments.length} Receipts`, data: initialFeePayments, filename: 'ABS_Fee_Collection_Ledger', icon: CreditCard },
    { title: 'Financial Income & Expense', desc: 'Cash book, profit & loss statement', count: `${initialFinancials.length} Entries`, data: initialFinancials, filename: 'ABS_Financial_Ledger', icon: Landmark },
    { title: 'Purchase Orders & GRN', desc: 'Vendor orders & procurement logs', count: `${initialPurchases.length} POs`, data: initialPurchases, filename: 'ABS_Purchase_Report', icon: ShoppingBag },
    { title: 'Uniform & POS Sales Summary', desc: 'Daily counter receipts & sales', count: `${initialSales.length} Invoices`, data: initialSales, filename: 'ABS_Sales_Report', icon: ShoppingCart },
    { title: 'Inventory Stock & Warehouse', desc: 'Stock quantities, reorder levels & value', count: `${initialInventory.length} SKUs`, data: initialInventory, filename: 'ABS_Inventory_Report', icon: Boxes },
    { title: 'Supplier & Vendor Database', desc: 'GST numbers & outstanding balances', count: `${initialSuppliers.length} Suppliers`, data: initialSuppliers, filename: 'ABS_Supplier_Report', icon: Truck },
    { title: 'Bus Route & Fleet Report', desc: 'Vehicle numbers, driver contacts & capacity', count: `${initialBuses.length} Routes`, data: initialBuses, filename: 'ABS_Transport_Report', icon: Bus },
    { title: 'Examination Results & Marks', desc: 'Grade cards, pass percentage & ranks', count: `${initialExams.length} Exams`, data: initialExams, filename: 'ABS_Exam_Report', icon: BookOpen },
  ];

  const handleDownload = (filename: string, data: object[]) => {
    exportToCSV(filename, data);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">ERP Executive Reports Module</h1>
            <p className="text-xs text-slate-500">Download Official CSV & Excel Audits across all 11 ERP Modules</p>
          </div>
        </div>
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

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-400">{r.count}</span>
                <button
                  onClick={() => handleDownload(r.filename, r.data)}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md hover:bg-blue-500 transition-all active:scale-95"
                >
                  <Download className="w-4 h-4" /> Download CSV
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
