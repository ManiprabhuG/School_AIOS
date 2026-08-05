'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useCrudStore } from '@/store/crud-store';
import { AccountTransaction, FinancialAccount } from '@/types';
import { AuditLogViewer } from '@/components/crud/AuditLogViewer';
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
  Filter,
  RefreshCw,
  Search,
  CreditCard,
  Receipt,
  FileText,
  PieChart,
  Eye,
  Edit,
  Trash2,
  CheckCircle2,
  Activity,
} from 'lucide-react';

export default function FinancePage() {
  const router = useRouter();
  const {
    financialAccounts,
    accountTransactions,
    seedDefaultAccounts,
    transferFunds,
    auditLogs,
    updateAccountLedgerEntry,
    deleteAccountLedgerEntry,
  } = useCrudStore();

  // Active Tab: 'LEDGER' | 'REPORTS'
  const [activeTab, setActiveTab] = useState<'LEDGER' | 'REPORTS'>('LEDGER');

  // Filters State for Central Ledger Book
  const [selectedAccountId, setSelectedAccountId] = useState<string>('ALL');
  const [selectedModule, setSelectedModule] = useState<string>('ALL');
  const [selectedTxType, setSelectedTxType] = useState<string>('ALL'); // ALL | INCOME | EXPENSE
  const [selectedMethod, setSelectedMethod] = useState<string>('ALL');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Drill Down State
  const [viewingLedgerTx, setViewingLedgerTx] = useState<AccountTransaction | null>(null);

  // Edit Ledger Entry Modal State
  const [editingLedgerTx, setEditingLedgerTx] = useState<AccountTransaction | null>(null);
  const [ledgerForm, setLedgerForm] = useState<{
    accountId: string;
    transactionType: 'INCOME' | 'EXPENSE';
    amount: number;
    date: string;
    description: string;
    paymentMethod: string;
    referenceNo: string;
  }>({
    accountId: '',
    transactionType: 'INCOME',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    description: '',
    paymentMethod: 'Cash',
    referenceNo: '',
  });

  // Inter-Account Transfer State
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [transferFromId, setTransferFromId] = useState<string>('');
  const [transferToId, setTransferToId] = useState<string>('');
  const [transferAmount, setTransferAmount] = useState<number>(0);
  const [transferRemark, setTransferRemark] = useState<string>('');

  // Audit Log Viewer State
  const [isAuditOpen, setIsAuditOpen] = useState(false);

  // Reports State
  const [activeReportType, setActiveReportType] = useState<
    'LEDGER' | 'CASH_BOOK' | 'BANK_BOOK' | 'INCOME_SUMMARY' | 'EXPENSE_SUMMARY' | 'FUND_FLOW' | 'ACCOUNT_STATEMENT' | 'PAYMENT_ANALYSIS'
  >('LEDGER');
  const [reportAccountFilter, setReportAccountFilter] = useState<string>('ALL');

  const refreshFinanceData = () => {
    fetch('/api/financial-accounts', { cache: 'no-store' })
      .then((res) => res.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          useCrudStore.setState({ financialAccounts: res.data });
        }
      })
      .catch((err) => console.error('Failed to load financial accounts from DB:', err));

    fetch('/api/account-transactions', { cache: 'no-store' })
      .then((res) => res.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          useCrudStore.setState((prev) => {
            const serverList = res.data || [];
            const serverKeys = new Set(serverList.map((t: any) => t.id || t.txnNumber));
            const clientOnly = (prev.accountTransactions || []).filter(
              (t: any) =>
                !serverKeys.has(t.id) &&
                !serverKeys.has(t.txnNumber) &&
                (!t.referenceNo || !serverList.some((s: any) => s.referenceNo === t.referenceNo))
            );
            return { accountTransactions: [...serverList, ...clientOnly] };
          });
        }
      })
      .catch((err) => console.error('Failed to load account transactions from DB:', err));
  };

  useEffect(() => {
    seedDefaultAccounts();
    refreshFinanceData();
  }, []);

  // --- ACCOUNT SUMMARY CARDS CALCULATION (Required Change 6) ---
  const cashAccounts = useMemo(() => {
    return financialAccounts.filter(
      (a) => a.accountType === 'Cash Fund Account' || a.accountType === 'CASH' || a.accountName.toLowerCase().includes('cash')
    );
  }, [financialAccounts]);

  const bankAccounts = useMemo(() => {
    return financialAccounts.filter(
      (a) => a.accountType === 'School Bank Account' || a.accountType === 'BANK' || (!a.accountName.toLowerCase().includes('cash') && a.accountType !== 'CASH')
    );
  }, [financialAccounts]);

  const availableCashBalance = useMemo(() => {
    return cashAccounts.reduce((sum, a) => sum + a.currentBalance, 0);
  }, [cashAccounts]);

  const availableBankBalance = useMemo(() => {
    return bankAccounts.reduce((sum, a) => sum + a.currentBalance, 0);
  }, [bankAccounts]);

  const totalCentralFunds = useMemo(() => {
    return availableCashBalance + availableBankBalance;
  }, [availableCashBalance, availableBankBalance]);

  const totalIncomeCollections = useMemo(() => {
    return accountTransactions
      .filter((t) => t.transactionType === 'INCOME' || (t.credit && t.credit > 0))
      .reduce((sum, t) => sum + (t.credit || 0), 0);
  }, [accountTransactions]);

  const totalExpenseDisbursements = useMemo(() => {
    return accountTransactions
      .filter((t) => t.transactionType === 'EXPENSE' || (t.debit && t.debit > 0))
      .reduce((sum, t) => sum + (t.debit || 0), 0);
  }, [accountTransactions]);

  const activeAccountsCount = financialAccounts.filter((a) => a.status === 'ACTIVE').length;

  // --- FILTERED CENTRAL LEDGER ENTRIES (Required Change 7) ---
  const filteredLedger = useMemo(() => {
    return accountTransactions.filter((tx) => {
      if (selectedAccountId !== 'ALL' && tx.accountId !== selectedAccountId) return false;
      if (selectedModule !== 'ALL' && tx.module !== selectedModule) return false;
      if (selectedTxType === 'INCOME' && tx.transactionType !== 'INCOME' && !(tx.credit > 0)) return false;
      if (selectedTxType === 'EXPENSE' && tx.transactionType !== 'EXPENSE' && !(tx.debit > 0)) return false;
      if (selectedMethod !== 'ALL' && tx.paymentMethod !== selectedMethod) return false;
      if (fromDate && tx.date < fromDate) return false;
      if (toDate && tx.date > toDate) return false;
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return (
          tx.txnNumber.toLowerCase().includes(term) ||
          (tx.referenceNo && tx.referenceNo.toLowerCase().includes(term)) ||
          tx.description.toLowerCase().includes(term) ||
          tx.accountName.toLowerCase().includes(term) ||
          tx.createdBy.toLowerCase().includes(term)
        );
      }
      return true;
    });
  }, [accountTransactions, selectedAccountId, selectedModule, selectedTxType, selectedMethod, fromDate, toDate, searchTerm]);

  // --- EDIT LEDGER ENTRY HANDLERS ---
  const handleOpenEditLedger = (tx: AccountTransaction) => {
    const isInc = tx.transactionType === 'INCOME' || (tx.credit && tx.credit > 0);
    const amt = isInc ? tx.credit : tx.debit;
    setEditingLedgerTx(tx);
    setLedgerForm({
      accountId: tx.accountId,
      transactionType: isInc ? 'INCOME' : 'EXPENSE',
      amount: amt || 0,
      date: tx.date,
      description: tx.description,
      paymentMethod: tx.paymentMethod,
      referenceNo: tx.referenceNo || '',
    });
  };

  const handleSaveEditLedger = async () => {
    if (!editingLedgerTx) return;
    const isInc = ledgerForm.transactionType === 'INCOME';
    const updates = {
      accountId: ledgerForm.accountId,
      transactionType: ledgerForm.transactionType,
      credit: isInc ? Number(ledgerForm.amount) : 0,
      debit: isInc ? 0 : Number(ledgerForm.amount),
      date: ledgerForm.date,
      description: ledgerForm.description,
      paymentMethod: ledgerForm.paymentMethod,
      referenceNo: ledgerForm.referenceNo,
    };

    updateAccountLedgerEntry(editingLedgerTx.id, updates as any);

    try {
      await fetch('/api/account-transactions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingLedgerTx.id, ...updates }),
      });
    } catch (err) {
      console.error('Failed to update ledger entry in DB:', err);
    }

    setEditingLedgerTx(null);
    refreshFinanceData();
  };

  const handleDeleteLedgerEntry = async (tx: AccountTransaction) => {
    if (!confirm(`Are you sure you want to delete ledger entry ${tx.txnNumber}? Account balance will be recalculated automatically.`)) {
      return;
    }

    deleteAccountLedgerEntry(tx.id);

    try {
      await fetch(`/api/account-transactions?id=${tx.id}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Failed to delete ledger entry from DB:', err);
    }

    refreshFinanceData();
  };

  // --- INTER-ACCOUNT FUND TRANSFER HANDLER ---
  const handleTransferSubmit = async () => {
    if (!transferFromId || !transferToId || transferFromId === transferToId) {
      alert('Please select valid distinct source and destination accounts.');
      return;
    }
    if (transferAmount <= 0) {
      alert('Please enter a valid transfer amount.');
      return;
    }

    const fromAcc = financialAccounts.find((a) => a.id === transferFromId);
    const toAcc = financialAccounts.find((a) => a.id === transferToId);

    const success = transferFunds(
      transferFromId,
      transferToId,
      transferAmount,
      transferRemark || 'Inter-Account Fund Transfer',
      'Dr. Rajesh Sharma'
    );

    if (success && fromAcc && toAcc) {
      const fromNewBal = fromAcc.currentBalance - transferAmount;
      const toNewBal = toAcc.currentBalance + transferAmount;

      try {
        await Promise.all([
          fetch('/api/financial-accounts', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: fromAcc.id, currentBalance: fromNewBal }),
          }),
          fetch('/api/financial-accounts', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: toAcc.id, currentBalance: toNewBal }),
          }),
          fetch('/api/account-transactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              accountId: fromAcc.id,
              accountName: fromAcc.accountName,
              transactionType: 'EXPENSE',
              module: 'TRANSFER',
              description: `Inter-Account Transfer OUT to ${toAcc.accountName}: ${transferRemark || 'Transfer'}`,
              paymentMethod: 'Internal Transfer',
              debit: transferAmount,
              credit: 0,
              createdBy: 'Dr. Rajesh Sharma',
            }),
          }),
          fetch('/api/account-transactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              accountId: toAcc.id,
              accountName: toAcc.accountName,
              transactionType: 'INCOME',
              module: 'TRANSFER',
              description: `Inter-Account Transfer IN from ${fromAcc.accountName}: ${transferRemark || 'Transfer'}`,
              paymentMethod: 'Internal Transfer',
              credit: transferAmount,
              debit: 0,
              createdBy: 'Dr. Rajesh Sharma',
            }),
          }),
        ]);
      } catch (err) {
        console.error('Failed to sync transfer to DB:', err);
      }

      setIsTransferOpen(false);
      setTransferFromId('');
      setTransferToId('');
      setTransferAmount(0);
      setTransferRemark('');
      refreshFinanceData();
    }
  };

  // --- REPORT GENERATION DATA ---
  const reportData = useMemo(() => {
    let list = accountTransactions;
    if (reportAccountFilter !== 'ALL') {
      list = list.filter((t) => t.accountId === reportAccountFilter);
    }

    if (activeReportType === 'CASH_BOOK') {
      return list.filter((t) => t.paymentMethod.toLowerCase().includes('cash'));
    }
    if (activeReportType === 'BANK_BOOK') {
      return list.filter((t) => !t.paymentMethod.toLowerCase().includes('cash'));
    }
    if (activeReportType === 'INCOME_SUMMARY') {
      return list.filter((t) => t.transactionType === 'INCOME' || t.credit > 0);
    }
    if (activeReportType === 'EXPENSE_SUMMARY') {
      return list.filter((t) => t.transactionType === 'EXPENSE' || t.debit > 0);
    }
    return list;
  }, [accountTransactions, activeReportType, reportAccountFilter]);

  // Payment Method Analysis Breakdown
  const paymentMethodSummary = useMemo(() => {
    const map: Record<string, { count: number; income: number; expense: number }> = {};
    accountTransactions.forEach((t) => {
      const pm = t.paymentMethod || 'Cash';
      if (!map[pm]) map[pm] = { count: 0, income: 0, expense: 0 };
      map[pm].count += 1;
      if (t.transactionType === 'INCOME' || t.credit > 0) {
        map[pm].income += t.credit || 0;
      } else {
        map[pm].expense += t.debit || 0;
      }
    });
    return Object.entries(map).map(([method, data]) => ({ method, ...data }));
  }, [accountTransactions]);

  return (
    <div className="space-y-6">
      {/* Module Title & Tab Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-blue-600 text-white shadow-md">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              Central Ledger Book & Account Monitoring
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Real-time audit ledger, automatic ERP transaction posting & account balance monitoring
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl">
          <button
            onClick={() => setActiveTab('LEDGER')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
              activeTab === 'LEDGER'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" /> Central Ledger Book
          </button>
          <button
            onClick={() => setActiveTab('REPORTS')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
              activeTab === 'REPORTS'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            <PieChart className="w-4 h-4" /> Financial Reports
          </button>
        </div>
      </div>

      {/* 6 ACCOUNT SUMMARY KPI CARDS (Required Change 6) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Card 1: Total School Funds */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-extrabold text-slate-400">Total School Funds</span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600">
              <Landmark className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-lg font-black text-blue-600 tracking-tight">{formatCurrency(totalCentralFunds)}</p>
            <span className="text-[10px] text-slate-400">Cash In Hand + Banks</span>
          </div>
        </div>

        {/* Card 2: Total Income Collections */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-extrabold text-slate-400">Total Income Collections</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-lg font-black text-emerald-600 tracking-tight">{formatCurrency(totalIncomeCollections)}</p>
            <span className="text-[10px] text-slate-400">All Credits Posted</span>
          </div>
        </div>

        {/* Card 3: Total Expense Disbursements */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-extrabold text-slate-400">Total Expenses Disbursed</span>
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-lg font-black text-rose-600 tracking-tight">{formatCurrency(totalExpenseDisbursements)}</p>
            <span className="text-[10px] text-slate-400">All Debits Posted</span>
          </div>
        </div>

        {/* Card 4: Active School Accounts */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-extrabold text-slate-400">Active School Accounts</span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-lg font-black text-purple-600 tracking-tight">{activeAccountsCount} Accounts</p>
            <span className="text-[10px] text-slate-400">{financialAccounts.length} Total Registered</span>
          </div>
        </div>

        {/* Card 5: Available Cash Balance */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-extrabold text-slate-400">Available Cash Balance</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-lg font-black text-amber-600 tracking-tight">{formatCurrency(availableCashBalance)}</p>
            <span className="text-[10px] text-slate-400">Cash In Hand Account</span>
          </div>
        </div>

        {/* Card 6: Available Bank Balance */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-extrabold text-slate-400">Available Bank Balance</span>
            <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-lg font-black text-teal-600 tracking-tight">{formatCurrency(availableBankBalance)}</p>
            <span className="text-[10px] text-slate-400">Combined Bank Accounts</span>
          </div>
        </div>
      </div>

      {activeTab === 'LEDGER' && (
        <div className="space-y-4">
          {/* Actions & Status Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsTransferOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
              >
                <ArrowRightLeft className="w-4 h-4" /> Inter-Account Fund Transfer
              </button>
              <button
                onClick={() => setIsAuditOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs shadow-xs"
              >
                <Activity className="w-4 h-4" /> Account Audit Logs
              </button>
            </div>

            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-3 py-1.5 rounded-full">
                <CheckCircle2 className="w-4 h-4" /> Live Automatic Ledger Posting Active
              </span>
            </div>
          </div>

          {/* COMPREHENSIVE LEDGER FILTERS BAR (Required Change 7) */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-2">
                <Filter className="w-3.5 h-3.5" /> Filter Central Ledger Book
              </h3>
              <button
                onClick={() => {
                  setSelectedAccountId('ALL');
                  setSelectedModule('ALL');
                  setSelectedTxType('ALL');
                  setSelectedMethod('ALL');
                  setFromDate('');
                  setToDate('');
                  setSearchTerm('');
                }}
                className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Reset Filters
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 text-xs">
              {/* Account Filter */}
              <div>
                <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Account</label>
                <select
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                >
                  <option value="ALL">All School Accounts</option>
                  {financialAccounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.accountName} (₹{a.currentBalance.toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>

              {/* Module Filter */}
              <div>
                <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Module</label>
                <select
                  value={selectedModule}
                  onChange={(e) => setSelectedModule(e.target.value)}
                  className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                >
                  <option value="ALL">All ERP Modules</option>
                  <option value="FEES">Fees Management</option>
                  <option value="PURCHASE">Purchase ERP</option>
                  <option value="SALES">Uniform & POS Sales</option>
                  <option value="INVENTORY">Inventory Stock</option>
                  <option value="FINANCE">Finance & Expenses</option>
                  <option value="TRANSPORT">Bus Transportation</option>
                  <option value="OTHER_INCOME">Other Income</option>
                  <option value="TRANSFER">Fund Transfers</option>
                  <option value="ADJUSTMENT">Adjustments</option>
                </select>
              </div>

              {/* Type Filter */}
              <div>
                <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Type</label>
                <select
                  value={selectedTxType}
                  onChange={(e) => setSelectedTxType(e.target.value)}
                  className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                >
                  <option value="ALL">All Types</option>
                  <option value="INCOME">Income / Credit (+)</option>
                  <option value="EXPENSE">Expense / Debit (-)</option>
                </select>
              </div>

              {/* Payment Method Filter */}
              <div>
                <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Payment Method</label>
                <select
                  value={selectedMethod}
                  onChange={(e) => setSelectedMethod(e.target.value)}
                  className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                >
                  <option value="ALL">All Methods</option>
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Card">Card</option>
                  <option value="Online Payment">Online Payment</option>
                </select>
              </div>

              {/* Date From */}
              <div>
                <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">From Date</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                />
              </div>

              {/* Date To */}
              <div>
                <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">To Date</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                />
              </div>

              {/* Search Box */}
              <div>
                <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Search Txn / Ref</label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search Txn, Ref..."
                    className="w-full pl-8 pr-2 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* CENTRAL SCHOOL LEDGER BOOK TABLE (Required Change 3) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Landmark className="w-5 h-5 text-blue-600" /> Central School Ledger Book
                </h2>
                <p className="text-xs text-slate-500">
                  Showing {filteredLedger.length} of {accountTransactions.length} total ledger records
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => exportToCSV('Central_School_Ledger_Book', filteredLedger as any[])}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" /> Export Ledger CSV
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase font-extrabold tracking-wider border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-3">Txn ID</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Module</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Particulars Description</th>
                    <th className="p-3">Ref No</th>
                    <th className="p-3">Payment Method</th>
                    <th className="p-3">Account Affected</th>
                    <th className="p-3 text-right text-rose-600">Debit (-)</th>
                    <th className="p-3 text-right text-emerald-600">Credit (+)</th>
                    <th className="p-3 text-right font-black">Running Balance</th>
                    <th className="p-3">Created By</th>
                    <th className="p-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {filteredLedger.map((tx) => {
                    const isCredit = tx.transactionType === 'INCOME' || (tx.credit && tx.credit > 0);
                    return (
                      <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="p-3 font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                          {tx.txnNumber}
                        </td>
                        <td className="p-3 font-mono text-[11px] whitespace-nowrap">{tx.date}</td>
                        <td className="p-3 whitespace-nowrap">
                          <span className="px-2.5 py-1 rounded-full text-[9px] font-black bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {tx.module}
                          </span>
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                              isCredit
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                            }`}
                          >
                            {isCredit ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            {isCredit ? 'INCOME' : 'EXPENSE'}
                          </span>
                        </td>
                        <td className="p-3 max-w-xs truncate">{tx.description}</td>
                        <td className="p-3 font-mono text-slate-500 whitespace-nowrap">{tx.referenceNo || '-'}</td>
                        <td className="p-3 whitespace-nowrap font-semibold">{tx.paymentMethod}</td>
                        <td className="p-3 font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">{tx.accountName}</td>
                        <td className="p-3 text-right font-mono font-bold text-rose-600 whitespace-nowrap">
                          {tx.debit > 0 ? formatCurrency(tx.debit) : '-'}
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-emerald-600 whitespace-nowrap">
                          {tx.credit > 0 ? formatCurrency(tx.credit) : '-'}
                        </td>
                        <td className="p-3 text-right font-mono font-black text-slate-900 dark:text-white whitespace-nowrap">
                          {formatCurrency(tx.runningBalance)}
                        </td>
                        <td className="p-3 text-[11px] text-slate-400 whitespace-nowrap">{tx.createdBy}</td>
                        <td className="p-3 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1">
                            {/* DRILL DOWN BUTTON (Required Change 8) */}
                            <button
                              onClick={() => setViewingLedgerTx(tx)}
                              className="px-2 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 font-bold text-[10px] flex items-center gap-1"
                              title="Drill Down Details"
                            >
                              <Eye className="w-3 h-3 text-blue-500" /> Details
                            </button>
                            <button
                              onClick={() => handleOpenEditLedger(tx)}
                              className="px-2 py-1 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-400 font-bold text-[10px] flex items-center gap-1"
                              title="Edit Ledger Entry"
                            >
                              <Edit className="w-3 h-3" /> Edit
                            </button>
                            <button
                              onClick={() => handleDeleteLedgerEntry(tx)}
                              className="px-2 py-1 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950 dark:text-rose-400 font-bold text-[10px] flex items-center gap-1"
                              title="Delete Ledger Entry"
                            >
                              <Trash2 className="w-3 h-3" /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredLedger.length === 0 && (
                    <tr>
                      <td colSpan={13} className="p-12 text-center text-slate-400 italic">
                        No ledger transactions found matching the selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* FINANCIAL REPORTS SUITE (Required Change 11) */}
      {activeTab === 'REPORTS' && (
        <div className="space-y-4 animate-in fade-in-50">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <button
                onClick={() => setActiveReportType('LEDGER')}
                className={`px-3 py-2 rounded-xl font-bold transition-all ${
                  activeReportType === 'LEDGER' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                }`}
              >
                Central Ledger Report
              </button>
              <button
                onClick={() => setActiveReportType('CASH_BOOK')}
                className={`px-3 py-2 rounded-xl font-bold transition-all ${
                  activeReportType === 'CASH_BOOK' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                }`}
              >
                Cash Book
              </button>
              <button
                onClick={() => setActiveReportType('BANK_BOOK')}
                className={`px-3 py-2 rounded-xl font-bold transition-all ${
                  activeReportType === 'BANK_BOOK' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                }`}
              >
                Bank Book
              </button>
              <button
                onClick={() => setActiveReportType('INCOME_SUMMARY')}
                className={`px-3 py-2 rounded-xl font-bold transition-all ${
                  activeReportType === 'INCOME_SUMMARY' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                }`}
              >
                Income Summary
              </button>
              <button
                onClick={() => setActiveReportType('EXPENSE_SUMMARY')}
                className={`px-3 py-2 rounded-xl font-bold transition-all ${
                  activeReportType === 'EXPENSE_SUMMARY' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                }`}
              >
                Expense Summary
              </button>
              <button
                onClick={() => setActiveReportType('FUND_FLOW')}
                className={`px-3 py-2 rounded-xl font-bold transition-all ${
                  activeReportType === 'FUND_FLOW' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                }`}
              >
                Fund Flow Statement
              </button>
              <button
                onClick={() => setActiveReportType('PAYMENT_ANALYSIS')}
                className={`px-3 py-2 rounded-xl font-bold transition-all ${
                  activeReportType === 'PAYMENT_ANALYSIS' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                }`}
              >
                Payment Method Analysis
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => exportToCSV(`ABS_${activeReportType}_Report`, reportData as any[])}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" /> Export Report CSV
              </button>
            </div>
          </div>

          {activeReportType === 'PAYMENT_ANALYSIS' ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-600" /> Payment Method Financial Analysis
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {paymentMethodSummary.map((item) => (
                  <div key={item.method} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white">{item.method}</span>
                      <span className="text-xs font-bold text-slate-400">{item.count} txns</span>
                    </div>
                    <div className="text-xs space-y-1">
                      <div className="flex justify-between text-emerald-600 font-bold">
                        <span>Total Income:</span>
                        <span>{formatCurrency(item.income)}</span>
                      </div>
                      <div className="flex justify-between text-rose-600 font-bold">
                        <span>Total Expense:</span>
                        <span>{formatCurrency(item.expense)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 overflow-x-auto shadow-xs">
              <div className="pb-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wide">
                  {activeReportType.replace('_', ' ')}
                </h3>
                <span className="text-xs text-slate-400 font-mono">Total Records: {reportData.length}</span>
              </div>
              <table className="w-full text-left border-collapse text-xs mt-3">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase font-extrabold">
                  <tr>
                    <th className="p-3">Txn ID</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Module</th>
                    <th className="p-3">Description</th>
                    <th className="p-3">Method</th>
                    <th className="p-3">Account</th>
                    <th className="p-3 text-right">Debit (-)</th>
                    <th className="p-3 text-right">Credit (+)</th>
                    <th className="p-3 text-right">Running Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {reportData.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-mono font-bold">{t.txnNumber}</td>
                      <td className="p-3 font-mono">{t.date}</td>
                      <td className="p-3">{t.module}</td>
                      <td className="p-3">{t.description}</td>
                      <td className="p-3">{t.paymentMethod}</td>
                      <td className="p-3 font-bold">{t.accountName}</td>
                      <td className="p-3 text-right font-mono text-rose-600">{t.debit > 0 ? formatCurrency(t.debit) : '-'}</td>
                      <td className="p-3 text-right font-mono text-emerald-600">{t.credit > 0 ? formatCurrency(t.credit) : '-'}</td>
                      <td className="p-3 text-right font-mono font-black">{formatCurrency(t.runningBalance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* DRILL DOWN DETAILS MODAL (Required Change 8) */}
      {viewingLedgerTx && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Ledger Transaction Details
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">ID: {viewingLedgerTx.txnNumber}</p>
                </div>
              </div>
              <button onClick={() => setViewingLedgerTx(null)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 flex justify-between items-center">
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase font-extrabold">Original Module</span>
                  <span className="font-extrabold text-sm text-slate-900 dark:text-white">{viewingLedgerTx.module}</span>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    viewingLedgerTx.transactionType === 'INCOME' || viewingLedgerTx.credit > 0
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  {viewingLedgerTx.transactionType || (viewingLedgerTx.credit > 0 ? 'INCOME' : 'EXPENSE')}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-slate-400 block text-[10px]">Reference Number</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {viewingLedgerTx.referenceNo || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Transaction Date</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{viewingLedgerTx.date}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Payment Method</span>
                  <span className="font-bold text-slate-900 dark:text-white">{viewingLedgerTx.paymentMethod}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Created By User</span>
                  <span className="font-bold text-slate-900 dark:text-white">{viewingLedgerTx.createdBy}</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 space-y-1">
                <span className="text-slate-500 font-extrabold block">Account Impact Details:</span>
                <p>Affected Account: <strong className="text-slate-900 dark:text-white">{viewingLedgerTx.accountName}</strong></p>
                <p>Debit (-): <strong className="text-rose-600">{viewingLedgerTx.debit > 0 ? formatCurrency(viewingLedgerTx.debit) : '₹0'}</strong></p>
                <p>Credit (+): <strong className="text-emerald-600">{viewingLedgerTx.credit > 0 ? formatCurrency(viewingLedgerTx.credit) : '₹0'}</strong></p>
                <p>Post-Transaction Running Balance: <strong className="text-slate-900 dark:text-white">{formatCurrency(viewingLedgerTx.runningBalance)}</strong></p>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] mb-1 font-bold">Particulars / Description</span>
                <p className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                  {viewingLedgerTx.description}
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setViewingLedgerTx(null)}
                className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT LEDGER ENTRY MODAL */}
      {editingLedgerTx && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Edit className="w-5 h-5 text-blue-600" /> Edit Central Ledger Entry ({editingLedgerTx.txnNumber})
              </h3>
              <button onClick={() => setEditingLedgerTx(null)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Target Account *</label>
                <select
                  value={ledgerForm.accountId}
                  onChange={(e) => setLedgerForm({ ...ledgerForm, accountId: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                >
                  {financialAccounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.accountName} (Available: ₹{a.currentBalance.toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Transaction Type *</label>
                <select
                  value={ledgerForm.transactionType}
                  onChange={(e) => setLedgerForm({ ...ledgerForm, transactionType: e.target.value as any })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                >
                  <option value="INCOME">INCOME / CREDIT (+)</option>
                  <option value="EXPENSE">EXPENSE / DEBIT (-)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Transaction Amount (₹) *</label>
                <input
                  type="number"
                  value={ledgerForm.amount || ''}
                  onChange={(e) => setLedgerForm({ ...ledgerForm, amount: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-sm"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Date *</label>
                <input
                  type="date"
                  value={ledgerForm.date}
                  onChange={(e) => setLedgerForm({ ...ledgerForm, date: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Payment Method *</label>
                <select
                  value={ledgerForm.paymentMethod}
                  onChange={(e) => setLedgerForm({ ...ledgerForm, paymentMethod: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                >
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Card">Card</option>
                  <option value="Online Payment">Online Payment</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Reference Number</label>
                <input
                  type="text"
                  value={ledgerForm.referenceNo}
                  onChange={(e) => setLedgerForm({ ...ledgerForm, referenceNo: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                />
              </div>

              <div className="md:col-span-2">
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Particulars Description</label>
                <textarea
                  value={ledgerForm.description}
                  onChange={(e) => setLedgerForm({ ...ledgerForm, description: e.target.value })}
                  rows={2}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => setEditingLedgerTx(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEditLedger}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md"
              >
                Save & Recalculate Balance
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

      {/* Audit Log Modal */}
      <AuditLogViewer
        isOpen={isAuditOpen}
        onClose={() => setIsAuditOpen(false)}
        moduleName="accountTransactions"
        auditLogs={auditLogs}
      />
    </div>
  );
}
