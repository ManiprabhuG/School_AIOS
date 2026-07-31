'use client';

import React, { useState, useEffect } from 'react';
import { useCrudStore } from '@/store/crud-store';
import { FinancialTransaction, AccountTransaction, FinancialAccount } from '@/types';
import { DataTable, Column } from '@/components/crud/DataTable';
import { CrudModal, FieldConfig } from '@/components/crud/CrudModal';
import { ImportModal } from '@/components/crud/ImportModal';
import { AuditLogViewer } from '@/components/crud/AuditLogViewer';
import { ConfirmDialog } from '@/components/crud/ConfirmDialog';
import { formatCurrency } from '@/lib/utils';
import { exportToCSV } from '@/lib/export-utils';
import {
  Landmark,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  ArrowRightLeft,
  BookOpen,
  FileSpreadsheet,
  Building2,
  DollarSign,
  Filter,
  RefreshCw,
  Search,
} from 'lucide-react';

export default function FinancePage() {
  const {
    financials,
    financialAccounts,
    accountTransactions,
    seedDefaultAccounts,
    transferFunds,
    auditLogs,
    addRecord,
    updateRecord,
    softDeleteRecord,
    restoreRecord,
    permanentDeleteRecord,
    bulkDeleteRecords,
    importRecords,
    recordAccountTransaction,
  } = useCrudStore();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<FinancialTransaction | null>(null);
  const [viewingTx, setViewingTx] = useState<FinancialTransaction | null>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string; permanent: boolean } | null>(null);

  // Ledger Viewer Modal State
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [selectedLedgerAccountId, setSelectedLedgerAccountId] = useState<string>('ALL');
  const [ledgerModuleFilter, setLedgerModuleFilter] = useState<string>('ALL');
  const [ledgerMethodFilter, setLedgerMethodFilter] = useState<string>('ALL');
  const [ledgerSearchTerm, setLedgerSearchTerm] = useState<string>('');

  // Transfer Modal State
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [transferFromId, setTransferFromId] = useState<string>('');
  const [transferToId, setTransferToId] = useState<string>('');
  const [transferAmount, setTransferAmount] = useState<number>(0);
  const [transferRemark, setTransferRemark] = useState<string>('');

  useEffect(() => {
    fetch('/api/finance')
      .then((res) => res.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          useCrudStore.setState({ financials: res.data });
        }
      })
      .catch((err) => console.error('Failed to load finance from DB:', err));

    fetch('/api/financial-accounts')
      .then((res) => res.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          if (res.data.length === 0) {
            seedDefaultAccounts();
          } else {
            useCrudStore.setState({ financialAccounts: res.data });
          }
        }
      })
      .catch(() => seedDefaultAccounts());

    fetch('/api/account-transactions')
      .then((res) => res.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          useCrudStore.setState({ accountTransactions: res.data });
        }
      })
      .catch((err) => console.error('Failed to load account transactions:', err));
  }, []);

  const totalIncome = financials
    .filter((f) => !f.isDeleted && f.type === 'Income')
    .reduce((sum, f) => sum + f.amount, 0);

  const totalExpense = financials
    .filter((f) => !f.isDeleted && f.type === 'Expense')
    .reduce((sum, f) => sum + f.amount, 0);

  const totalCentralFunds = financialAccounts.reduce((sum, a) => sum + a.currentBalance, 0);

  const accountOptions = financialAccounts.map((a) => ({
    label: `${a.accountName} (${a.accountType === 'Cash Fund Account' || a.accountType === 'CASH' ? 'Cash' : a.bankName || 'Bank'}) - ₹${a.currentBalance.toLocaleString('en-IN')}`,
    value: a.id,
  }));

  const defaultAccId = financialAccounts[0]?.id || '';

  const financeFields: FieldConfig[] = [
    { name: 'transactionNo', label: 'Transaction Voucher No (e.g. TXN-8805)', type: 'text' },
    {
      name: 'accountId',
      label: 'Affected School Fund Account *',
      type: 'select',
      options: accountOptions.length > 0 ? accountOptions : [{ label: 'Main School Account', value: 'acc-main-001' }],
    },
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
        { label: 'Salary Payment', value: 'Salary' },
        { label: 'Uniform Sales', value: 'Uniform Sales' },
        { label: 'Books & Supplies Sales', value: 'Book Sales' },
        { label: 'Donations & Endowments', value: 'Donation' },
        { label: 'Other Income', value: 'Other Income' },
        { label: 'Electricity & Utilities', value: 'Electricity' },
        { label: 'Building Maintenance', value: 'Maintenance' },
        { label: 'Transport & Fuel', value: 'Fuel' },
        { label: 'Stationery & Supplies', value: 'Supplies' },
        { label: 'Refund', value: 'Refund' },
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
        { label: 'Cash', value: 'Cash' },
        { label: 'UPI', value: 'UPI' },
        { label: 'Bank Transfer', value: 'Bank Transfer' },
        { label: 'Cheque', value: 'Cheque' },
        { label: 'Card', value: 'Card' },
        { label: 'Online Payment', value: 'Online Payment' },
      ],
    },
    { name: 'referenceNo', label: 'Bank Ref / UTR / Cheque Number', type: 'text' },
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
    const targetAccountId = data.accountId || defaultAccId;

    if (editingTx) {
      updateRecord('financials', editingTx.id, data);
      try {
        await fetch('/api/finance', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingTx.id, accountId: targetAccountId, ...data }),
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
        description: data.description || 'Financial Voucher',
        paymentMode: data.paymentMode || 'Cash',
        referenceNo: data.referenceNo || '',
        approvedBy: data.approvedBy || 'Dr. Rajesh Sharma',
      };
      addRecord('financials', newTx);

      // Record Account Ledger transaction
      recordAccountTransaction({
        txnNumber: `ATX-${newTx.transactionNo}`,
        accountId: targetAccountId,
        accountName: '',
        date: newTx.date,
        referenceNo: newTx.referenceNo || newTx.transactionNo,
        module: 'FINANCE',
        transactionType: newTx.type === 'Income' ? 'INCOME' : 'EXPENSE',
        description: `Voucher (${newTx.category}): ${newTx.description}`,
        paymentMethod: newTx.paymentMode,
        credit: newTx.type === 'Income' ? newTx.amount : 0,
        debit: newTx.type === 'Income' ? 0 : newTx.amount,
        createdBy: newTx.approvedBy,
      });

      try {
        await fetch('/api/finance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: newTx.id,
            accountId: targetAccountId,
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

  const handleTransferSubmit = async () => {
    if (!transferFromId || !transferToId || transferFromId === transferToId) {
      alert('Please select valid distinct source and destination accounts.');
      return;
    }
    if (transferAmount <= 0) {
      alert('Please enter a valid transfer amount.');
      return;
    }

    const success = transferFunds(
      transferFromId,
      transferToId,
      transferAmount,
      transferRemark || 'Inter-Account Transfer',
      'Dr. Rajesh Sharma'
    );

    if (success) {
      setIsTransferOpen(false);
      setTransferFromId('');
      setTransferToId('');
      setTransferAmount(0);
      setTransferRemark('');
    }
  };

  // Filtered Ledger Entries for Ledger Viewer
  const filteredLedger = accountTransactions.filter((tx) => {
    if (selectedLedgerAccountId !== 'ALL' && tx.accountId !== selectedLedgerAccountId) return false;
    if (ledgerModuleFilter !== 'ALL' && tx.module !== ledgerModuleFilter) return false;
    if (ledgerMethodFilter !== 'ALL' && tx.paymentMethod !== ledgerMethodFilter) return false;
    if (ledgerSearchTerm) {
      const term = ledgerSearchTerm.toLowerCase();
      return (
        tx.txnNumber.toLowerCase().includes(term) ||
        tx.description.toLowerCase().includes(term) ||
        (tx.referenceNo && tx.referenceNo.toLowerCase().includes(term)) ||
        tx.accountName.toLowerCase().includes(term)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Finance KPI Summary Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400">Total Central School Funds</span>
            <p className="text-xl font-black text-blue-600 tracking-tight">{formatCurrency(totalCentralFunds)}</p>
          </div>
          <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600">
            <Landmark className="w-6 h-6" />
          </div>
        </div>

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
            <span className="text-xs font-bold text-slate-400">School Fund Accounts</span>
            <p className="text-xl font-black text-purple-600 tracking-tight">{financialAccounts.length} Accounts</p>
          </div>
          <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950 text-purple-600">
            <Wallet className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Action Buttons Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsLedgerOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
          >
            <BookOpen className="w-4 h-4" /> View Account Ledger
          </button>
          <button
            onClick={() => setIsTransferOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
          >
            <ArrowRightLeft className="w-4 h-4" /> Inter-Account Fund Transfer
          </button>
        </div>

        <span className="text-xs text-slate-500 font-medium">
          Central Fund Account Balance System Active
        </span>
      </div>

      {/* Main Data Table */}
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
              { label: 'Cheque', value: 'Cheque' },
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

      {/* Add / Edit Voucher Modal */}
      <CrudModal
        isOpen={isAddModalOpen || Boolean(editingTx)}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingTx(null);
        }}
        title="Financial Voucher"
        fields={financeFields}
        initialData={editingTx ? { ...editingTx } : { accountId: defaultAccId }}
        onSave={handleSaveFinance}
      />

      {/* CENTRAL ACCOUNT LEDGER VIEWER MODAL */}
      {isLedgerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-5xl p-6 space-y-4 shadow-2xl animate-in zoom-in-95 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Central Financial Account Transaction Ledger
                  </h3>
                  <p className="text-xs text-slate-500">Real-time debit, credit & running balances per account</p>
                </div>
              </div>
              <button onClick={() => setIsLedgerOpen(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            {/* Filters Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs shrink-0">
              <div>
                <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Target Account</label>
                <select
                  value={selectedLedgerAccountId}
                  onChange={(e) => setSelectedLedgerAccountId(e.target.value)}
                  className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                >
                  <option value="ALL">All School Accounts</option>
                  {financialAccounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.accountName} (Balance: ₹{a.currentBalance.toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Module Source</label>
                <select
                  value={ledgerModuleFilter}
                  onChange={(e) => setLedgerModuleFilter(e.target.value)}
                  className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                >
                  <option value="ALL">All Modules</option>
                  <option value="FEES">Fees Collection</option>
                  <option value="FINANCE">Finance Vouchers</option>
                  <option value="PURCHASE">Purchases ERP</option>
                  <option value="SALES">POS / Sales</option>
                  <option value="PAYROLL">Payroll / Salary</option>
                  <option value="TRANSFER">Inter-Account Transfers</option>
                  <option value="ADJUSTMENT">Manual Adjustments</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Payment Method</label>
                <select
                  value={ledgerMethodFilter}
                  onChange={(e) => setLedgerMethodFilter(e.target.value)}
                  className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                >
                  <option value="ALL">All Methods</option>
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Card">Card</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Search Txn / Ref</label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={ledgerSearchTerm}
                    onChange={(e) => setLedgerSearchTerm(e.target.value)}
                    placeholder="Ref No, particular..."
                    className="w-full pl-8 pr-2 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>
            </div>

            {/* Ledger Entries Table */}
            <div className="overflow-y-auto flex-1 border border-slate-200 dark:border-slate-800 rounded-2xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase font-extrabold tracking-wider border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-3">Date</th>
                    <th className="p-3">Ref / Txn No</th>
                    <th className="p-3">Account</th>
                    <th className="p-3">Module</th>
                    <th className="p-3">Particulars Description</th>
                    <th className="p-3">Method</th>
                    <th className="p-3 text-right text-rose-600">Debit (-)</th>
                    <th className="p-3 text-right text-emerald-600">Credit (+)</th>
                    <th className="p-3 text-right font-black">Running Balance</th>
                    <th className="p-3">User</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {filteredLedger.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-mono text-[11px] whitespace-nowrap">{tx.date}</td>
                      <td className="p-3 font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                        {tx.txnNumber}
                        {tx.referenceNo && <span className="block text-[9px] text-slate-400">Ref: {tx.referenceNo}</span>}
                      </td>
                      <td className="p-3 font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">{tx.accountName}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {tx.module}
                        </span>
                      </td>
                      <td className="p-3 max-w-xs truncate">{tx.description}</td>
                      <td className="p-3">{tx.paymentMethod}</td>
                      <td className="p-3 text-right font-mono font-bold text-rose-600">
                        {tx.debit > 0 ? formatCurrency(tx.debit) : '-'}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-emerald-600">
                        {tx.credit > 0 ? formatCurrency(tx.credit) : '-'}
                      </td>
                      <td className="p-3 text-right font-mono font-black text-slate-900 dark:text-white">
                        {formatCurrency(tx.runningBalance)}
                      </td>
                      <td className="p-3 text-[11px] text-slate-400 whitespace-nowrap">{tx.createdBy}</td>
                    </tr>
                  ))}

                  {filteredLedger.length === 0 && (
                    <tr>
                      <td colSpan={10} className="p-8 text-center text-slate-400 italic">
                        No ledger transactions found matching the selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="pt-2 flex justify-between items-center shrink-0">
              <span className="text-xs text-slate-500 font-bold">
                Showing {filteredLedger.length} of {accountTransactions.length} total ledger records
              </span>
              <button
                onClick={() => exportToCSV('ABS_Central_Account_Ledger', filteredLedger as any[])}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" /> Export Ledger CSV
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INTER-ACCOUNT FUND TRANSFER MODAL */}
      {isTransferOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-purple-600" /> Inter-Account Fund Transfer
              </h3>
              <button onClick={() => setIsTransferOpen(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Source Account (Debit From) *</label>
                <select
                  value={transferFromId}
                  onChange={(e) => setTransferFromId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                >
                  <option value="">-- Select Source Account --</option>
                  {financialAccounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.accountName} (Available: ₹{a.currentBalance.toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Destination Account (Credit To) *</label>
                <select
                  value={transferToId}
                  onChange={(e) => setTransferToId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                >
                  <option value="">-- Select Destination Account --</option>
                  {financialAccounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.accountName} (Available: ₹{a.currentBalance.toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Transfer Amount (₹) *</label>
                <input
                  type="number"
                  value={transferAmount || ''}
                  onChange={(e) => setTransferAmount(Number(e.target.value))}
                  placeholder="e.g. 25000"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-sm"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Transfer Purpose / Remarks</label>
                <input
                  type="text"
                  value={transferRemark}
                  onChange={(e) => setTransferRemark(e.target.value)}
                  placeholder="e.g. Cash deposit into SBI bank account"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => setIsTransferOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleTransferSubmit}
                className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md"
              >
                Execute Transfer
              </button>
            </div>
          </div>
        </div>
      )}

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
