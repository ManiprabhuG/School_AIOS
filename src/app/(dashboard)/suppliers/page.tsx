'use client';

import React from 'react';
import { initialSuppliers } from '@/lib/mock-data';
import { formatCurrency } from '@/lib/utils';
import { Truck, Phone, Mail, MapPin } from 'lucide-react';

export default function SuppliersPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Supplier Directory</h1>
            <p className="text-xs text-slate-500">Uniform Manufacturers, Publishers, IT Suppliers & GST Records</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {initialSuppliers.map((sp) => (
          <div key={sp.id} className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">{sp.name}</h3>
                <span className="text-xs text-teal-600 font-semibold">{sp.companyName}</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                {sp.supplierCode}
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              <p>Contact: <strong>{sp.contactPerson}</strong></p>
              <p className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-teal-500" /> {sp.phone}</p>
              <p className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-teal-500" /> {sp.email}</p>
              <p>GSTIN: <span className="font-mono">{sp.gstNo}</span></p>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-400">Outstanding Balance:</span>
              <strong className="text-slate-800 dark:text-slate-100 font-bold">{formatCurrency(sp.outstandingBalance)}</strong>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
