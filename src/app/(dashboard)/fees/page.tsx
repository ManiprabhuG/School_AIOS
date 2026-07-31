'use client';

import React, { useState } from 'react';
import { useCrudStore } from '@/store/crud-store';
import { FeePayment, FeeStructure, ClassName } from '@/types';
import { DataTable, Column } from '@/components/crud/DataTable';
import { CrudModal, FieldConfig } from '@/components/crud/CrudModal';
import { ImportModal } from '@/components/crud/ImportModal';
import { AuditLogViewer } from '@/components/crud/AuditLogViewer';
import { ConfirmDialog } from '@/components/crud/ConfirmDialog';
import { formatCurrency } from '@/lib/utils';
import { exportToPDF } from '@/lib/export-utils';
import PrintModal from '@/components/print/PrintModal';
import { ReceiptData } from '@/components/print/ReceiptTemplate';
import { CreditCard, DollarSign, Receipt, Plus, FileText, CheckCircle2 } from 'lucide-react';

export default function FeesPage() {
  const {
    feePayments,
    feeStructures,
    students,
    financialAccounts,
    recordAccountTransaction,
    auditLogs,
    addRecord,
    updateRecord,

    softDeleteRecord,
    restoreRecord,
    permanentDeleteRecord,
    bulkDeleteRecords,
    bulkUpdateStatus,
    importRecords,
  } = useCrudStore();

  const [activeTab, setActiveTab] = useState<'collections' | 'structures'>('collections');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddStructureModalOpen, setIsAddStructureModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<FeePayment | null>(null);
  const [editingStructure, setEditingStructure] = useState<FeeStructure | null>(null);
  const [viewingPayment, setViewingPayment] = useState<FeePayment | null>(null);
  const [printReceiptData, setPrintReceiptData] = useState<ReceiptData | null>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string; permanent: boolean; isStructure?: boolean } | null>(null);

  React.useEffect(() => {
    fetch('/api/fees')
      .then((res) => res.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          useCrudStore.setState({ feePayments: res.data });
        }
      })
      .catch((err) => console.error('Failed to load fees from DB:', err));

    fetch('/api/fee-structures')
      .then((res) => res.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          useCrudStore.setState({ feeStructures: res.data });
        }
      })
      .catch((err) => console.error('Failed to load fee structures from DB:', err));
  }, []);

  const studentOptions = students.map((s) => ({ label: `${s.name} (${s.className}-${s.section})`, value: s.name }));

  const paymentFields: FieldConfig[] = [
    { name: 'receiptNo', label: 'Receipt Number', type: 'text', readOnly: true },
    {
      name: 'studentName',
      label: 'Student Name',
      type: 'select',
      options: studentOptions.length > 0 ? studentOptions : [{ label: 'Aarav Verma (10th-A)', value: 'Aarav Verma' }],
    },
    {
      name: 'accountId',
      label: 'Target School Account *',
      type: 'select',
      options:
        financialAccounts.length > 0
          ? financialAccounts.map((a) => ({
              label: `${a.accountName} (${a.accountType === 'Cash Fund Account' || a.accountType === 'CASH' ? 'Cash' : 'Bank'}) - ₹${a.currentBalance.toLocaleString('en-IN')}`,
              value: a.id,
            }))
          : [{ label: 'Main School Account', value: 'acc-main-001' }],
    },
    {
      name: 'className',
      label: 'Class',
      type: 'select',
      options: ['LKG', 'UKG', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'].map(
        (c) => ({ label: c, value: c })
      ),
    },

    { name: 'amount', label: 'Collected Amount (₹)', type: 'number', placeholder: '0' },
    {
      name: 'feeCategory',
      label: 'Fee Category',
      type: 'select',
      options: [
        { label: 'Tuition', value: 'Tuition' },
        { label: 'Transport', value: 'Transport' },
        { label: 'Exam', value: 'Exam' },
        { label: 'Uniform', value: 'Uniform' },
        { label: 'Books', value: 'Books' },
        { label: 'Other', value: 'Other' },
      ],
    },
    {
      name: 'paymentMode',
      label: 'Payment Mode',
      type: 'select',
      options: [
        { label: 'UPI', value: 'UPI' },
        { label: 'Cash', value: 'Cash' },
        { label: 'Card', value: 'Card' },
        { label: 'Bank Transfer', value: 'Bank Transfer' },
        { label: 'Cheque', value: 'Cheque' },
      ],
    },
    { name: 'paymentDate', label: 'Payment Date', type: 'date' },
    { name: 'collectedBy', label: 'Collected By (Staff)', type: 'text' },
    {
      name: 'status',
      label: 'Receipt Status',
      type: 'select',
      options: [
        { label: 'Success', value: 'Success' },
        { label: 'Pending', value: 'Pending' },
        { label: 'Failed', value: 'Failed' },
      ],
    },
  ];

  const structureFields: FieldConfig[] = [
    {
      name: 'className',
      label: 'Academic Class',
      type: 'select',
      options: ['LKG', 'UKG', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'].map(
        (c) => ({ label: `Class ${c}`, value: c })
      ),
    },
    { name: 'tuitionFee', label: 'Tuition Fee (₹)', type: 'number', placeholder: '0' },
    { name: 'admissionFee', label: 'Admission Fee (₹)', type: 'number', placeholder: '0' },
    { name: 'transportFee', label: 'Transport Fee (₹)', type: 'number', placeholder: '0' },
    { name: 'uniformFee', label: 'Uniform Fee (₹)', type: 'number', placeholder: '0' },
    { name: 'labFee', label: 'Laboratory Fee (₹)', type: 'number', placeholder: '0' },
    { name: 'dueDate', label: 'Fee Payment Due Date', type: 'date' },
  ];

  const getPaymentDueInfo = (p: FeePayment) => {
    const std = students.find(
      (s) =>
        s.id === p.studentId ||
        s.name?.trim().toLowerCase() === p.studentName?.trim().toLowerCase() ||
        (s.name && p.studentName && s.name.toLowerCase().includes(p.studentName.toLowerCase()))
    );

    const fs = feeStructures.find((f) => f.className === p.className);
    const category: string = String(p.feeCategory || 'Tuition');
    let defaultCategoryFee = 60000;
    if (fs) {
      if (category === 'Tuition') defaultCategoryFee = fs.tuitionFee;
      else if (category === 'Admission') defaultCategoryFee = fs.admissionFee;
      else if (category === 'Transport') defaultCategoryFee = fs.transportFee;
      else if (category === 'Uniform') defaultCategoryFee = fs.uniformFee;
      else if (category === 'Lab' || category === 'Books') defaultCategoryFee = fs.labFee;
      else defaultCategoryFee = fs.totalAnnualFee;
    }

    const totalFee = p.totalAmount || (std?.dueFees ? p.amount + std.dueFees : defaultCategoryFee);

    let dueAmt = 0;
    if (p.dueAmount !== undefined && p.dueAmount > 0) {
      dueAmt = p.dueAmount;
    } else if (totalFee > p.amount) {
      dueAmt = totalFee - p.amount;
    } else if (std?.dueFees && std.dueFees > 0) {
      dueAmt = std.dueFees;
    }

    return { totalFee, dueAmt, std };
  };

  const paymentColumns: Column<FeePayment>[] = [
    {
      key: 'receiptNo',
      header: 'Receipt No',
      sortable: true,
      render: (p) => <span className="font-mono font-bold text-slate-800 dark:text-slate-100">{p.receiptNo}</span>,
    },
    {
      key: 'studentName',
      header: 'Student Name',
      sortable: true,
      render: (p) => (
        <div>
          <p className="font-bold text-slate-800 dark:text-slate-100">{p.studentName}</p>
          <span className="text-[10px] text-blue-600 font-semibold">{p.className}</span>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Amount Paid & Due Status',
      sortable: true,
      render: (p) => {
        const { dueAmt } = getPaymentDueInfo(p);

        return (
          <div className="space-y-0.5">
            <span className="font-extrabold text-emerald-600 dark:text-emerald-400 block">
              {formatCurrency(p.amount)}
            </span>
            {dueAmt > 0 ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                Due Pending: {formatCurrency(dueAmt)}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Fully Paid
              </span>
            )}
          </div>
        );
      },
    },
    { key: 'feeCategory', header: 'Category', sortable: true },
    { key: 'paymentMode', header: 'Mode', sortable: true },
    { key: 'paymentDate', header: 'Date', sortable: true },
    { key: 'collectedBy', header: 'Collected By' },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (p) => (
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            p.status === 'Success'
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
              : p.status === 'Pending'
              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
              : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
          }`}
        >
          {p.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Print',
      render: (p) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            const { totalFee, dueAmt, std } = getPaymentDueInfo(p);

            setPrintReceiptData({
              receiptNumber: p.receiptNo || `RCP-${p.id}`,
              title: 'OFFICIAL SCHOOL FEE RECEIPT',
              studentName: p.studentName,
              admissionNo: std?.admissionNo || p.studentId || 'ADM-2026-101',
              className: p.className || '10th',
              section: std?.section || 'A',
              parentName: std?.fatherName || std?.parentName || 'Parent / Guardian',
              paymentDate: p.paymentDate || new Date().toISOString().split('T')[0],
              paymentMethod: p.paymentMode || 'Cash/UPI',
              cashierName: p.collectedBy || 'Finance Cashier',
              items: [
                { name: `${p.feeCategory} Fee Payment`, amount: p.amount },
              ],
              subtotal: totalFee,
              totalAmount: p.amount,
              remainingBalance: dueAmt,
              notes:
                dueAmt > 0
                  ? `Partial payment collected. Pending due amount of ${formatCurrency(dueAmt)} remaining to be cleared.`
                  : 'Full payment received with thanks.',
            });
          }}
          className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] flex items-center gap-1 shadow-sm active:scale-95"
        >
          <FileText className="w-3 h-3" /> Print Receipt
        </button>
      ),
    },
  ];

  const handleSavePayment = async (data: Record<string, any>, saveAndNew?: boolean) => {
    const selectedStd = students.find((s) => s.name === data.studentName);
    const collectedAmt = Number(data.amount) || 0;

    // Determine expected total amount for category/class
    const category: string = String(data.feeCategory || 'Tuition');
    const fs = feeStructures.find((f) => f.className === data.className);
    let expectedAmt = collectedAmt;
    if (fs) {
      if (category === 'Tuition') expectedAmt = fs.tuitionFee;
      else if (category === 'Admission') expectedAmt = fs.admissionFee;
      else if (category === 'Transport') expectedAmt = fs.transportFee;
      else if (category === 'Uniform') expectedAmt = fs.uniformFee;
      else if (category === 'Lab' || category === 'Books') expectedAmt = fs.labFee;
      else expectedAmt = fs.totalAnnualFee;
    } else if (selectedStd?.dueFees) {
      expectedAmt = Math.max(collectedAmt, selectedStd.dueFees);
    }
    const dueAmt = expectedAmt > collectedAmt ? expectedAmt - collectedAmt : 0;

    const payload = {
      ...data,
      totalAmount: expectedAmt,
      dueAmount: dueAmt,
    };

    if (editingPayment) {
      updateRecord('feePayments', editingPayment.id, payload);
      try {
        await fetch('/api/fees', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingPayment.id, ...payload }),
        });
      } catch (err) {
        console.error('Failed to update fee payment in DB:', err);
      }
      setEditingPayment(null);
    } else {
      const newPay: FeePayment = {
        id: `pay-${Date.now()}`,
        receiptNo: data.receiptNo || `RCP-2026-0${feePayments.length + 10}`,
        studentId: selectedStd?.id || 'std-101',
        studentName: data.studentName || 'Student',
        className: (data.className || '10th') as ClassName,
        amount: collectedAmt,
        totalAmount: expectedAmt,
        dueAmount: dueAmt,
        paymentMode: data.paymentMode || 'UPI',
        paymentDate: data.paymentDate || new Date().toISOString().split('T')[0],
        feeCategory: data.feeCategory || 'Tuition',
        status: data.status || 'Success',
        collectedBy: data.collectedBy || 'Accounts Desk',
      };
      addRecord('feePayments', newPay);

      // Record Central Account Transaction
      recordAccountTransaction({
        txnNumber: `TXN-FEE-${newPay.receiptNo}`,
        accountId: data.accountId || '',
        accountName: '',
        date: newPay.paymentDate,
        referenceNo: newPay.receiptNo,
        module: 'FEES',
        transactionType: 'INCOME',
        description: `Fee Collection: ${newPay.studentName} (${newPay.className}) - ${newPay.feeCategory}`,
        paymentMethod: newPay.paymentMode,
        credit: newPay.amount,
        debit: 0,
        createdBy: newPay.collectedBy,
      });

      try {
        await fetch('/api/fees', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: newPay.id,
            accountId: data.accountId,
            receiptNo: newPay.receiptNo,
            studentId: newPay.studentId,
            studentName: newPay.studentName,
            admissionNo: selectedStd?.admissionNo || 'ADM-2026-001',
            className: newPay.className,
            section: selectedStd?.section || 'A',
            feeType: newPay.feeCategory,
            amountPaid: newPay.amount,
            totalAmount: newPay.totalAmount,
            dueAmount: newPay.dueAmount,
            paymentDate: newPay.paymentDate,
            paymentMode: newPay.paymentMode,
            cashier: newPay.collectedBy,
            status: newPay.status,
          }),
        });
      } catch (err) {
        console.error('Failed to save fee payment to DB:', err);
      }

      if (!saveAndNew) setIsAddModalOpen(false);
    }
  };


  const handleSaveStructure = (data: Record<string, any>, saveAndNew?: boolean) => {
    const tuition = Number(data.tuitionFee) || 0;
    const admission = Number(data.admissionFee) || 0;
    const transport = Number(data.transportFee) || 0;
    const uniform = Number(data.uniformFee) || 0;
    const lab = Number(data.labFee) || 0;
    const total = tuition + admission + transport + uniform + lab;

    if (editingStructure) {
      updateRecord('feeStructures', editingStructure.id, {
        ...data,
        tuitionFee: tuition,
        admissionFee: admission,
        transportFee: transport,
        uniformFee: uniform,
        labFee: lab,
        totalAnnualFee: total,
      });
      setEditingStructure(null);
    } else {
      const newFs: FeeStructure = {
        id: `fs-${Date.now()}`,
        className: (data.className || '10th') as ClassName,
        tuitionFee: tuition,
        admissionFee: admission,
        transportFee: transport,
        uniformFee: uniform,
        labFee: lab,
        totalAnnualFee: total,
        dueDate: data.dueDate || '2026-08-31',
      };
      addRecord('feeStructures', newFs);
      if (!saveAndNew) setIsAddStructureModalOpen(false);
    }
  };

  const handlePrintReceipt = (p: FeePayment) => {
    const { totalFee, dueAmt, std } = getPaymentDueInfo(p);

    exportToPDF(
      `Fee_Receipt_${p.receiptNo}`,
      `FEE RECEIPT — ${p.receiptNo}`,
      [
        { header: 'Field', dataKey: 'field' },
        { header: 'Details', dataKey: 'value' },
      ],
      [
        { field: 'Receipt Number', value: p.receiptNo },
        { field: 'Student Name', value: p.studentName },
        { field: 'Class', value: p.className },
        { field: 'Total Standard Fee', value: formatCurrency(totalFee) },
        { field: 'Amount Collected', value: formatCurrency(p.amount) },
        { field: 'Remaining Pending Due', value: dueAmt > 0 ? formatCurrency(dueAmt) : 'Nil (Fully Paid)' },
        { field: 'Fee Category', value: p.feeCategory },
        { field: 'Payment Mode', value: p.paymentMode },
        { field: 'Payment Date', value: p.paymentDate },
        { field: 'Collected By', value: p.collectedBy },
        { field: 'Status', value: p.status },
      ]
    );
  };

  const handlePaymentFormChange = (currentData: Record<string, any>, changedField: string, newValue: any) => {
    const updates: Record<string, any> = {};

    let targetClass = currentData.className;
    if (changedField === 'studentName' && newValue) {
      const std = students.find((s) => s.name === newValue);
      if (std?.className) {
        targetClass = std.className;
        updates.className = std.className;
      }
    } else if (changedField === 'className' && newValue) {
      targetClass = newValue;
    }

    const category: string = String(currentData.feeCategory || 'Tuition');
    const fs = feeStructures.find((f) => f.className === targetClass || f.className === updates.className);

    if (fs) {
      if (category === 'Tuition') updates.amount = fs.tuitionFee;
      else if (category === 'Admission') updates.amount = fs.admissionFee;
      else if (category === 'Transport') updates.amount = fs.transportFee;
      else if (category === 'Uniform') updates.amount = fs.uniformFee;
      else if (category === 'Lab' || category === 'Books') updates.amount = fs.labFee;
      else updates.amount = fs.totalAnnualFee;
    }

    return updates;
  };

  return (
    <div className="space-y-6">
      <div className="no-print space-y-6">
        {/* Tab Selector */}
        <div className="flex gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl w-fit text-xs font-bold">
        <button
          onClick={() => setActiveTab('collections')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'collections'
              ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Fee Collections & Receipts
        </button>
        <button
          onClick={() => setActiveTab('structures')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'structures'
              ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Fee Structure Matrix
        </button>
      </div>

      {activeTab === 'collections' ? (
        <DataTable
          title="Fee Collections & Payment Receipts"
          subtitle="Tuition, Transport, Exam & Books Fee Receipts Management"
          icon={<CreditCard className="w-6 h-6" />}
          columns={paymentColumns}
          data={feePayments}
          addLabel="Collect Fee Payment"
          exportFilename="ABS_Fee_Collections"
          filterOptions={[
            {
              key: 'feeCategory',
              label: 'Category',
              options: [
                { label: 'Tuition', value: 'Tuition' },
                { label: 'Transport', value: 'Transport' },
                { label: 'Exam', value: 'Exam' },
                { label: 'Uniform', value: 'Uniform' },
              ],
            },
            {
              key: 'paymentMode',
              label: 'Payment Mode',
              options: [
                { label: 'UPI', value: 'UPI' },
                { label: 'Cash', value: 'Cash' },
                { label: 'Card', value: 'Card' },
                { label: 'Bank Transfer', value: 'Bank Transfer' },
              ],
            },
          ]}
          statusUpdateOptions={{
            field: 'status',
            label: 'Payment Status',
            values: ['Success', 'Pending', 'Failed'],
          }}
          onAddClick={() => setIsAddModalOpen(true)}
          onEditClick={(p) => setEditingPayment(p)}
          onViewClick={(p) => setViewingPayment(p)}
          onSoftDeleteClick={(p) => setConfirmDelete({ id: p.id, name: p.receiptNo, permanent: false })}
          onRestoreClick={(p) => restoreRecord('feePayments', p.id)}
          onPermanentDeleteClick={(p) => setConfirmDelete({ id: p.id, name: p.receiptNo, permanent: true })}
          onBulkDelete={(ids, soft) => bulkDeleteRecords('feePayments', ids, soft)}
          onBulkStatusUpdate={(ids, field, val) => bulkUpdateStatus('feePayments', ids, field, val)}
          onImportClick={() => setIsImportOpen(true)}
          onAuditLogsClick={() => setIsAuditOpen(true)}
        />
      ) : (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white mb-1">Class-wise Annual Fee Structure Matrix</h2>
                <p className="text-xs text-slate-500">Configure Tuition, Admission, Transport, Exam & Laboratory Fee Schedules per Class</p>
              </div>

              <button
                onClick={() => setIsAddStructureModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md self-start md:self-auto active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" /> Add Fee Structure
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold uppercase border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3">Class</th>
                    <th className="p-3">Tuition Fee</th>
                    <th className="p-3">Admission Fee</th>
                    <th className="p-3">Transport Fee</th>
                    <th className="p-3">Uniform Fee</th>
                    <th className="p-3">Lab Fee</th>
                    <th className="p-3">Total Annual Fee</th>
                    <th className="p-3">Due Date</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {feeStructures.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-400 italic">
                        No Fee Structures Configured Yet. Click &quot;Add Fee Structure&quot; to create one.
                      </td>
                    </tr>
                  ) : (
                    feeStructures.map((fs) => (
                      <tr key={fs.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 font-medium">
                        <td className="p-3 font-bold text-blue-600">{fs.className}</td>
                        <td className="p-3">{formatCurrency(fs.tuitionFee)}</td>
                        <td className="p-3">{formatCurrency(fs.admissionFee)}</td>
                        <td className="p-3">{formatCurrency(fs.transportFee)}</td>
                        <td className="p-3">{formatCurrency(fs.uniformFee)}</td>
                        <td className="p-3">{formatCurrency(fs.labFee)}</td>
                        <td className="p-3 font-black text-slate-900 dark:text-white">{formatCurrency(fs.totalAnnualFee)}</td>
                        <td className="p-3 text-slate-500">{fs.dueDate}</td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setEditingStructure(fs)}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 text-blue-600 font-bold text-[11px] transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setConfirmDelete({ id: fs.id, name: `Class ${fs.className} Fee Structure`, permanent: true, isStructure: true })}
                              className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 font-bold text-[11px] transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Fee Payment Receipt Modal */}
      <CrudModal
        isOpen={isAddModalOpen || Boolean(editingPayment)}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingPayment(null);
        }}
        title="Fee Payment Receipt"
        fields={paymentFields}
        initialData={editingPayment ? { ...editingPayment } : null}
        onSave={handleSavePayment}
        onFormChange={handlePaymentFormChange}
      />

      {/* Add / Edit Fee Structure Modal */}
      <CrudModal
        isOpen={isAddStructureModalOpen || Boolean(editingStructure)}
        onClose={() => {
          setIsAddStructureModalOpen(false);
          setEditingStructure(null);
        }}
        title="Fee Structure Schedule"
        fields={structureFields}
        initialData={editingStructure ? { ...editingStructure } : null}
        onSave={handleSaveStructure}
      />

      {/* Import Modal */}
      <ImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        title="Fee Payments"
        onImport={(rows) => importRecords('feePayments', rows)}
      />

      {/* Audit Log Modal */}
      <AuditLogViewer
        isOpen={isAuditOpen}
        onClose={() => setIsAuditOpen(false)}
        moduleName="feePayments"
        auditLogs={auditLogs}
      />

      {/* Delete Confirm */}
      {confirmDelete && (
        <ConfirmDialog
          isOpen={Boolean(confirmDelete)}
          onClose={() => setConfirmDelete(null)}
          title={confirmDelete.isStructure ? 'Delete Fee Structure' : confirmDelete.permanent ? 'Permanently Purge Receipt' : 'Move Receipt to Trash'}
          message={`Are you sure you want to delete ${confirmDelete.name}?`}
          confirmLabel="Delete Record"
          onConfirm={async () => {
            if (confirmDelete.isStructure) {
              permanentDeleteRecord('feeStructures', confirmDelete.id);
              try {
                await fetch(`/api/fee-structures?id=${confirmDelete.id}`, { method: 'DELETE' });
              } catch (err) {
                console.error('Failed to delete fee structure from DB:', err);
              }
            } else if (confirmDelete.permanent) {
              permanentDeleteRecord('feePayments', confirmDelete.id);
              try {
                await fetch(`/api/fees?id=${confirmDelete.id}`, { method: 'DELETE' });
              } catch (err) {
                console.error('Failed to delete fee payment from DB:', err);
              }
            } else {
              softDeleteRecord('feePayments', confirmDelete.id);
            }
          }}

        />
      )}

      {/* View & PDF Receipt Modal */}
      {viewingPayment && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Receipt className="w-5 h-5 text-blue-600" /> Fee Payment Receipt
              </h3>
              <button onClick={() => setViewingPayment(null)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl space-y-1">
                <span className="text-slate-400 block text-[11px]">Official ABS School ERP Receipt</span>
                <strong className="text-lg font-black font-mono text-slate-900 dark:text-white">{viewingPayment.receiptNo}</strong>
                <p className="text-2xl font-black text-emerald-600 pt-1">{formatCurrency(viewingPayment.amount)}</p>
              </div>

              <div className="space-y-1.5 pt-1">
                <p>Student: <strong>{viewingPayment.studentName}</strong> ({viewingPayment.className})</p>
                <p>Fee Category: <strong>{viewingPayment.feeCategory}</strong></p>
                <p>Payment Mode: {viewingPayment.paymentMode}</p>
                <p>Date: {viewingPayment.paymentDate}</p>
                <p>Collected By: {viewingPayment.collectedBy}</p>
              </div>

              <button
                onClick={() => {
                  const p = viewingPayment;
                  setViewingPayment(null);
                  setPrintReceiptData({
                    receiptNumber: p.receiptNo || `RCP-${p.id}`,
                    title: 'OFFICIAL SCHOOL FEE RECEIPT',
                    studentName: p.studentName,
                    admissionNo: p.studentId || 'ADM-2026-101',
                    className: p.className || '10th',
                    section: 'A',
                    parentName: 'Parent / Guardian',
                    paymentDate: p.paymentDate || new Date().toISOString().split('T')[0],
                    paymentMethod: p.paymentMode || 'Cash/UPI',
                    cashierName: p.collectedBy || 'Finance Cashier',
                    items: [
                      { name: `${p.feeCategory} Fee Payment`, amount: p.amount },
                    ],
                    subtotal: p.amount,
                    totalAmount: p.amount,
                    remainingBalance: 0,
                    notes: 'Payment received with thanks.',
                  });
                }}
                className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center gap-1.5 shadow-md hover:bg-blue-500"
              >
                <FileText className="w-4 h-4" /> Print / Export Official Receipt
              </button>
            </div>
          </div>
        </div>
      )}
      </div>

      {/* Fee Receipt Print Modal */}
      {printReceiptData && (
        <PrintModal
          isOpen={!!printReceiptData}
          onClose={() => setPrintReceiptData(null)}
          title={`Print Fee Receipt - ${printReceiptData.receiptNumber}`}
          receiptData={printReceiptData}
        />
      )}
    </div>
  );
}
