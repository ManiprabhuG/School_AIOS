'use client';

import React, { useState } from 'react';
import { initialPurchases } from '@/lib/mock-data';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ShoppingBag, Plus, Truck, CheckCircle2 } from 'lucide-react';

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState(initialPurchases);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Purchase Management</h1>
            <p className="text-xs text-slate-500">Purchase Orders, Goods Received Notes (GRN), Vendor Invoices</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-4">PO Number</th>
                <th className="p-4">Supplier Name</th>
                <th className="p-4">Order Date</th>
                <th className="p-4">Items Count</th>
                <th className="p-4">Total Amount</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {purchases.map((po) => (
                <tr key={po.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="p-4 font-mono font-bold text-violet-600 dark:text-violet-400">{po.poNumber}</td>
                  <td className="p-4 font-bold text-slate-800 dark:text-slate-100">{po.supplierName}</td>
                  <td className="p-4 text-slate-500">{formatDate(po.orderDate)}</td>
                  <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">{po.itemsCount} Units</td>
                  <td className="p-4 font-extrabold text-violet-600 dark:text-violet-400">{formatCurrency(po.totalAmount)}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                      {po.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
