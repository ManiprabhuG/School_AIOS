'use client';

import React, { useState } from 'react';
import { initialSales } from '@/lib/mock-data';
import { SalesItem } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ShoppingCart, Plus, Printer, CheckCircle2 } from 'lucide-react';

export default function SalesPage() {
  const [sales, setSales] = useState<SalesItem[]>(initialSales);

  const totalSales = sales.reduce((sum, s) => sum + s.netAmount, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">School Uniform & POS Sales</h1>
            <p className="text-xs text-slate-500">Counter Billing for Uniforms, Smart ID Cards, Books & Accessories</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-4">Invoice #</th>
                <th className="p-4">Customer Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Item Name</th>
                <th className="p-4">Qty</th>
                <th className="p-4">Total Amount</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {sales.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="p-4 font-mono font-bold text-sky-600 dark:text-sky-400">{s.invoiceNo}</td>
                  <td className="p-4 font-bold text-slate-800 dark:text-slate-100">{s.customerName}</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded bg-sky-50 dark:bg-sky-950 text-sky-600 font-bold">
                      {s.itemCategory}
                    </span>
                  </td>
                  <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">{s.itemName}</td>
                  <td className="p-4 font-bold">{s.quantity}</td>
                  <td className="p-4 font-extrabold text-emerald-600 dark:text-emerald-400">{formatCurrency(s.netAmount)}</td>
                  <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">{s.paymentMethod}</td>
                  <td className="p-4 text-slate-500">{formatDate(s.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
