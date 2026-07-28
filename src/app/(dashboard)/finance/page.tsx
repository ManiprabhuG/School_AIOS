'use client';

import React, { useState } from 'react';
import { useCrudStore } from '@/store/crud-store';
import { FinancialTransaction } from '@/types';
import { DataTable, Column } from '@/components/crud/DataTable';
import { CrudModal, FieldConfig } from '@/components/crud/CrudModal';
import { ImportModal } from '@/components/crud/ImportModal';
import { AuditLogViewer } from '@/components/crud/AuditLogViewer';
import { ConfirmDialog } from '@/components/crud/ConfirmDialog';
import { formatCurrency } from '@/lib/utils';
import { Landmark, ArrowUpRight, ArrowDownRight, Wallet, PieChart } from 'lucide-react';

export default function FinancePage() {
  const {
    financials,
    auditLogs,
    addRecord,
    updateRecord,
    softDeleteRecord,
    restoreRecord,
    permanentDeleteRecord,
    bulkDeleteRecords,
    importRecords,
  } = useCrudStore();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<FinancialTransaction | null>(null);
  const [viewingTx, setViewingTx] = useState<FinancialTransaction | null>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string; permanent: boolean } | null>(null);

  React.useEffect(() => {
    fetch('/api/finance')
      .then((res) => res.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          useCrudStore.setState({ financials: res.data });
        }
      })
      .catch((err) => console.error('Failed to load finance from DB:', err));
  }, []);

  const totalIncome = financials
    .filter((f) => !f.isDeleted && f.type === 'Income')
    .reduce((sum, f) => sum + f.amount, 0);

  const totalExpense = financials
    .filter((f) => !f.isDeleted && f.type === 'Expense')
    .reduce((sum, f) => sum + f.amount, 0);

  const netBalance = totalIncome - totalExpense;

  const financeFields: FieldConfig[] = [
    { name: 'transactionNo', label: 'Transaction Voucher No (e.g. TXN-8805)', type: 'text' },
    {
      name: 'type',
      label: 'Transaction Type',
      type: 'select',
      options: [
        { label: 'Income', value: 'Income' },
        { label: 'Expense', value: 'Expense' },
      ],
    },
    {
      name: 'category',
      label: 'Account Head Category',
      type: 'select',
      options: [
        { label: 'School Fees', value: 'School Fees' },
        { label: 'Salary', value: 'Salary' },
        { label: 'Uniform Sales', value: 'Uniform Sales' },
        { label: 'Electricity & Utilities', value: 'Electricity' },
        { label: 'Building Maintenance', value: 'Maintenance' },
        { label: 'Transport & Fuel', value: 'Fuel' },
        { label: 'Stationery & Supplies', value: 'Supplies' },
      ],
    },
    { name: 'amount', label: 'Amount (₹)', type: 'number' },
    { name: 'date', label: 'Transaction Date', type: 'date' },
    { name: 'description', label: 'Particulars Description', type: 'textarea', colSpan: 2 },
    {
      name: 'paymentMode',
      label: 'Payment Method / Instrument',
      type: 'select',
      options: [
        { label: 'Bank Transfer', value: 'Bank Transfer' },
        { label: 'UPI', value: 'UPI' },
        { label: 'Cash', value: 'Cash' },
        { label: 'Cheque', value: 'Cheque' },
      ],
    },
    { name: 'referenceNo', label: 'Bank Ref / UTR Number', type: 'text' },
    { name: 'approvedBy', label: 'Approving Officer', type: 'text' },
  ];

  const columns: Column<FinancialTransaction>[] = [
    {
      key: 'transactionNo',
      header: 'Voucher No',
      sortable: true,
      render: (tx) => <span className="font-mono font-bold text-slate-800 dark:text-slate-100">{tx.transactionNo}</span>,
    },
    {
      key: 'type',
      header: 'Type',
      sortable: true,
      render: (tx) => (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
            tx.type === 'Income'
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
              : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
          }`}
        >
          {tx.type === 'Income' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {tx.type}
        </span>
      ),
    },
    { key: 'category', header: 'Category Head', sortable: true },
    {
      key: 'amount',
      header: 'Amount',
      sortable: true,
      render: (tx) => (
        <span className={`font-black ${tx.type === 'Income' ? 'text-emerald-600' : 'text-rose-600'}`}>
          {tx.type === 'Income' ? '+' : '-'} {formatCurrency(tx.amount)}
        </span>
      ),
    },
    { key: 'date', header: 'Date', sortable: true },
    { key: 'description', header: 'Description' },
    { key: 'paymentMode', header: 'Payment Mode' },
    { key: 'approvedBy', header: 'Approved By' },
  ];

  const handleSaveFinance = async (data: Record<string, any>, saveAndNew?: boolean) => {
    if (editingTx) {
      updateRecord('financials', editingTx.id, data);
      try {
        await fetch('/api/finance', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingTx.id, ...data }),
        });
      } catch (err) {
        console.error('Failed to update finance in DB:', err);
      }
      setEditingTx(null);
    } else {
      const newTx: FinancialTransaction = {
        id: `tx-${Date.now()}`,
        transactionNo: data.transactionNo || `TXN-${Math.floor(8800 + Math.random() * 1000)}`,
        type: data.type || 'Income',
        category: data.category || 'School Fees',
        amount: Number(data.amount) || 0,
        date: data.date || new Date().toISOString().split('T')[0],
        description: data.description,
        paymentMode: data.paymentMode || 'UPI',
        referenceNo: data.referenceNo || '',
        approvedBy: data.approvedBy || 'Dr. Rajesh Sharma',
      };
      addRecord('financials', newTx);

      try {
        await fetch('/api/finance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: newTx.id,
            txnNumber: newTx.transactionNo,
            type: newTx.type,
            category: newTx.category,
            amount: newTx.amount,
            date: newTx.date,
            description: newTx.description || 'Financial Transaction',
            paymentMethod: newTx.paymentMode,
            referenceNo: newTx.referenceNo,
            handledBy: newTx.approvedBy,
          }),
        });
      } catch (err) {
        console.error('Failed to save finance transaction to DB:', err);
      }

      if (!saveAndNew) setIsAddModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Finance KPI Summary Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400">Total Income Collections</span>
            <p className="text-xl font-black text-emerald-600 tracking-tight">{formatCurrency(totalIncome)}</p>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
            <ArrowUpRight className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400">Total Expenses Disbursed</span>
            <p className="text-xl font-black text-rose-600 tracking-tight">{formatCurrency(totalExpense)}</p>
          </div>
          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950 text-rose-600">
            <ArrowDownRight className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400">Net Surplus Balance</span>
            <p className={`text-xl font-black tracking-tight ${netBalance >= 0 ? 'text-blue-600' : 'text-rose-600'}`}>
              {formatCurrency(netBalance)}
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600">
            <Wallet className="w-6 h-6" />
          </div>
        </div>
      </div>

      <DataTable
        title="Finance, Cash Book & Voucher Management"
        subtitle="Income Collections, Expense Disbursement, Cash Book Ledger & Financial Audit"
        icon={<Landmark className="w-6 h-6" />}
        columns={columns}
        data={financials}
        addLabel="Create Financial Voucher"
        exportFilename="ABS_Financial_Ledger"
        filterOptions={[
          {
            key: 'type',
            label: 'Type',
            options: [
              { label: 'Income', value: 'Income' },
              { label: 'Expense', value: 'Expense' },
            ],
          },
          {
            key: 'paymentMode',
            label: 'Payment Mode',
            options: [
              { label: 'Bank Transfer', value: 'Bank Transfer' },
              { label: 'UPI', value: 'UPI' },
              { label: 'Cash', value: 'Cash' },
            ],
          },
        ]}
        onAddClick={() => setIsAddModalOpen(true)}
        onEditClick={(tx) => setEditingTx(tx)}
        onViewClick={(tx) => setViewingTx(tx)}
        onSoftDeleteClick={(tx) => setConfirmDelete({ id: tx.id, name: tx.transactionNo, permanent: false })}
        onRestoreClick={(tx) => restoreRecord('financials', tx.id)}
        onPermanentDeleteClick={(tx) => setConfirmDelete({ id: tx.id, name: tx.transactionNo, permanent: true })}
        onBulkDelete={(ids, soft) => bulkDeleteRecords('financials', ids, soft)}
        onImportClick={() => setIsImportOpen(true)}
        onAuditLogsClick={() => setIsAuditOpen(true)}
      />

      {/* Add / Edit Modal */}
      <CrudModal
        isOpen={isAddModalOpen || Boolean(editingTx)}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingTx(null);
        }}
        title="Financial Voucher"
        fields={financeFields}
        initialData={editingTx ? { ...editingTx } : null}
        onSave={handleSaveFinance}
      />

      {/* Import Modal */}
      <ImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        title="Financial Transactions"
        onImport={(rows) => importRecords('financials', rows)}
      />

      {/* Audit Log Modal */}
      <AuditLogViewer
        isOpen={isAuditOpen}
        onClose={() => setIsAuditOpen(false)}
        moduleName="financials"
        auditLogs={auditLogs}
      />

      {/* Delete Confirm */}
      {confirmDelete && (
        <ConfirmDialog
          isOpen={Boolean(confirmDelete)}
          onClose={() => setConfirmDelete(null)}
          title={confirmDelete.permanent ? 'Permanently Delete Financial Voucher' : 'Move Voucher to Trash'}
          message={`Are you sure you want to ${
            confirmDelete.permanent ? 'permanently delete' : 'soft delete'
          } transaction ${confirmDelete.name}?`}
          confirmLabel={confirmDelete.permanent ? 'Permanent Delete' : 'Move to Trash'}
          onConfirm={async () => {
            if (confirmDelete.permanent) {
              permanentDeleteRecord('financials', confirmDelete.id);
              try {
                await fetch(`/api/finance?id=${confirmDelete.id}`, { method: 'DELETE' });
              } catch (err) {
                console.error('Failed to delete finance transaction from DB:', err);
              }
            } else {
              softDeleteRecord('financials', confirmDelete.id);
            }
          }}
        />
      )}

      {/* View Voucher Modal */}
      {viewingTx && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Landmark className="w-5 h-5 text-blue-600" /> Voucher Details
              </h3>
              <button onClick={() => setViewingTx(null)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl">
                <div>
                  <span className="text-slate-400 block font-mono">Voucher #{viewingTx.transactionNo}</span>
                  <strong className="text-lg font-black text-slate-900 dark:text-white">{viewingTx.category}</strong>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    viewingTx.type === 'Income' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  {viewingTx.type}
                </span>
              </div>

              <div className="space-y-1">
                <p>Particulars: <strong>{viewingTx.description}</strong></p>
                <p>Payment Mode: {viewingTx.paymentMode}</p>
                <p>Ref UTR: {viewingTx.referenceNo || 'N/A'}</p>
                <p>Date: {viewingTx.date}</p>
                <p>Approved By: {viewingTx.approvedBy}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-sm font-black">
                <span>Voucher Amount:</span>
                <span className={viewingTx.type === 'Income' ? 'text-emerald-600' : 'text-rose-600'}>
                  {formatCurrency(viewingTx.amount)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
