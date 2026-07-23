'use client';

import React from 'react';
import { initialFinancials } from '@/lib/mock-data';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Landmark, ArrowDownRight, ArrowUpRight } from 'lucide-react';

export default function FinancePage() {
  const totalIncome = initialFinancials.filter((t) => t.type === 'Income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = initialFinancials.filter((t) => t.type === 'Expense').reduce((sum, t) => sum + t.amount, 0);
  const netProfit = totalIncome - totalExpense;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
            <Landmark className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Finance & Accounting</h1>
            <p className="text-xs text-slate-500">Income, Expense Ledger, Profit & Loss, Salary Disbursement & Cash Book</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 rounded-3xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900">
          <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">Total Income Collected</span>
          <h3 className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400 mt-1">{formatCurrency(totalIncome)}</h3>
        </div>

        <div className="p-5 rounded-3xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900">
          <span className="text-xs font-semibold text-rose-800 dark:text-rose-300">Total Expenses Incurred</span>
          <h3 className="text-2xl font-extrabold text-rose-700 dark:text-rose-400 mt-1">{formatCurrency(totalExpense)}</h3>
        </div>

        <div className="p-5 rounded-3xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900">
          <span className="text-xs font-semibold text-blue-800 dark:text-blue-300">Net Surplus / Profit</span>
          <h3 className="text-2xl font-extrabold text-blue-700 dark:text-blue-400 mt-1">{formatCurrency(netProfit)}</h3>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-4">Txn #</th>
                <th className="p-4">Type</th>
                <th className="p-4">Category</th>
                <th className="p-4">Description</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Date</th>
                <th className="p-4">Approved By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {initialFinancials.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="p-4 font-mono font-bold text-slate-700 dark:text-slate-300">{tx.transactionNo}</td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        tx.type === 'Income'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                      }`}
                    >
                      {tx.type}
                    </span>
                  </td>
                  <td className="p-4 font-semibold text-slate-800 dark:text-slate-200">{tx.category}</td>
                  <td className="p-4 text-slate-600 dark:text-slate-400">{tx.description}</td>
                  <td className="p-4 font-extrabold">{formatCurrency(tx.amount)}</td>
                  <td className="p-4 text-slate-500">{formatDate(tx.date)}</td>
                  <td className="p-4 text-slate-500">{tx.approvedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
