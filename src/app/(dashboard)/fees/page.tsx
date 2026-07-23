'use client';

import React, { useState } from 'react';
import { initialFeePayments, feeStructures, initialStudents } from '@/lib/mock-data';
import { FeePayment, ClassName } from '@/types';
import { formatCurrency, formatDate, exportToCSV } from '@/lib/utils';
import { CreditCard, Plus, Download, Printer, CheckCircle2, Search, X, Receipt } from 'lucide-react';

export default function FeesManagementPage() {
  const [payments, setPayments] = useState<FeePayment[]>(initialFeePayments);
  const [activeTab, setActiveTab] = useState<'collection' | 'structure' | 'pending'>('collection');
  const [search, setSearch] = useState('');
  const [isCollectModalOpen, setIsCollectModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<FeePayment | null>(null);

  // New Payment form state
  const [form, setForm] = useState({
    studentId: 'std-101',
    amount: 25000,
    paymentMode: 'UPI' as const,
    feeCategory: 'Tuition' as const,
  });

  const handleCollectFee = (e: React.FormEvent) => {
    e.preventDefault();
    const student = initialStudents.find((s) => s.id === form.studentId);
    const newPayment: FeePayment = {
      id: `pay-${Date.now()}`,
      receiptNo: `RCP-2026-0${payments.length + 894}`,
      studentId: form.studentId,
      studentName: student?.name || 'Selected Student',
      className: student?.className || '10th',
      amount: form.amount,
      paymentMode: form.paymentMode,
      paymentDate: new Date().toISOString().split('T')[0],
      feeCategory: form.feeCategory,
      status: 'Success',
      collectedBy: 'Mr. Amit Tiwari',
    };
    setPayments([newPayment, ...payments]);
    setIsCollectModalOpen(false);
    setSelectedReceipt(newPayment);
  };

  const handleExport = () => {
    exportToCSV('ABS_Fee_Collection_Report', payments);
  };

  const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Fees Management ERP</h1>
            <p className="text-xs text-slate-500">Collection Counter, Fee Structure per Class, Due Reports & Receipts</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button
            onClick={() => setIsCollectModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" /> Collect Fee Now
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('collection')}
          className={`px-5 py-3 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'collection'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Fee Collection History (Total: {formatCurrency(totalCollected)})
        </button>
        <button
          onClick={() => setActiveTab('structure')}
          className={`px-5 py-3 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'structure'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Annual Fee Structure (LKG - 12th)
        </button>
      </div>

      {/* Collection Tab */}
      {activeTab === 'collection' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-4">Receipt #</th>
                  <th className="p-4">Student Name</th>
                  <th className="p-4">Class</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Payment Mode</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="p-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">{p.receiptNo}</td>
                    <td className="p-4 font-bold text-slate-800 dark:text-slate-100">{p.studentName}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-600 font-bold">
                        {p.className}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-400">{p.feeCategory}</td>
                    <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">{p.paymentMode}</td>
                    <td className="p-4 font-extrabold text-emerald-600 dark:text-emerald-400">{formatCurrency(p.amount)}</td>
                    <td className="p-4 text-slate-500">{formatDate(p.paymentDate)}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedReceipt(p)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-800 transition-colors"
                        title="Print / View Receipt"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Structure Tab */}
      {activeTab === 'structure' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {feeStructures.map((fs) => (
            <div key={fs.id} className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <span className="text-lg font-extrabold text-slate-900 dark:text-white">Class {fs.className}</span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  Annual Total: {formatCurrency(fs.totalAnnualFee)}
                </span>
              </div>
              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>Tuition Fee:</span>
                  <strong>{formatCurrency(fs.tuitionFee)}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Admission Fee:</span>
                  <strong>{formatCurrency(fs.admissionFee)}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Transport Fee:</span>
                  <strong>{formatCurrency(fs.transportFee)}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Exam & Lab Fee:</span>
                  <strong>{formatCurrency(fs.examFee + fs.labFee)}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Collect Fee Modal */}
      {isCollectModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Record Fee Payment</h3>
              <button onClick={() => setIsCollectModalOpen(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCollectFee} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">Select Student</label>
                <select
                  value={form.studentId}
                  onChange={(e) => setForm({ ...form, studentId: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                >
                  {initialStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (Class {s.className}-{s.section})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">Amount (₹)</label>
                <input
                  type="number"
                  required
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">Payment Mode</label>
                  <select
                    value={form.paymentMode}
                    onChange={(e) => setForm({ ...form, paymentMode: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    <option value="UPI">UPI / GPay</option>
                    <option value="Cash">Cash Counter</option>
                    <option value="Card">Credit/Debit Card</option>
                    <option value="Bank Transfer">NEFT/RTGS</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">Category</label>
                  <select
                    value={form.feeCategory}
                    onChange={(e) => setForm({ ...form, feeCategory: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    <option value="Tuition">Tuition</option>
                    <option value="Transport">Transport</option>
                    <option value="Exam">Exam</option>
                    <option value="Uniform">Uniform</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md hover:bg-emerald-500 transition-all mt-2"
              >
                Confirm & Generate Receipt
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Printable Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-3xl w-full max-w-lg p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-extrabold">ABS School Official Fee Receipt</h3>
              </div>
              <button onClick={() => setSelectedReceipt(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs font-mono">
              <div className="flex justify-between border-b pb-2">
                <span>RECEIPT NO: <strong>{selectedReceipt.receiptNo}</strong></span>
                <span>DATE: {selectedReceipt.paymentDate}</span>
              </div>
              <div className="space-y-1 text-slate-700">
                <p>STUDENT NAME: <strong>{selectedReceipt.studentName}</strong></p>
                <p>CLASS: Class {selectedReceipt.className}</p>
                <p>FEE HEAD: {selectedReceipt.feeCategory} Fee</p>
                <p>MODE: {selectedReceipt.paymentMode}</p>
                <p>COLLECTED BY: {selectedReceipt.collectedBy}</p>
              </div>
              <div className="pt-2 border-t flex justify-between text-sm font-bold text-emerald-700">
                <span>TOTAL PAID:</span>
                <span>{formatCurrency(selectedReceipt.amount)}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" /> Print Receipt PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
