'use client';

import React, { useState } from 'react';
import { initialInventory } from '@/lib/mock-data';
import { InventoryItem } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { Boxes, AlertTriangle, CheckCircle2, ArrowDown, ArrowUp } from 'lucide-react';

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>(initialInventory);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <Boxes className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Inventory & Stock Control</h1>
            <p className="text-xs text-slate-500">Uniforms, Books, Stationery, Furniture, IT Equipment & Warehouse Logs</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-4">Item Code</th>
                <th className="p-4">Item Description</th>
                <th className="p-4">Category</th>
                <th className="p-4">Warehouse Location</th>
                <th className="p-4">Stock Level</th>
                <th className="p-4">Unit Price</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {items.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="p-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">{inv.itemCode}</td>
                  <td className="p-4 font-bold text-slate-800 dark:text-slate-100">{inv.name}</td>
                  <td className="p-4 text-slate-600 dark:text-slate-400">{inv.category}</td>
                  <td className="p-4 font-medium text-slate-700 dark:text-slate-300">{inv.warehouseLocation}</td>
                  <td className="p-4 font-extrabold text-slate-900 dark:text-white">{inv.quantityInStock} Units</td>
                  <td className="p-4 font-extrabold text-indigo-600 dark:text-indigo-400">{formatCurrency(inv.unitPrice)}</td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        inv.status === 'In Stock'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {inv.status}
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
