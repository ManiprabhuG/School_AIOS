'use client';

import React from 'react';
import { initialBuses } from '@/lib/mock-data';
import { formatCurrency } from '@/lib/utils';
import { Bus, Phone, Users, MapPin, CheckCircle2 } from 'lucide-react';

export default function BusManagementPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
            <Bus className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Bus Transportation Management</h1>
            <p className="text-xs text-slate-500">School Bus Fleet, Driver Allocation, Route Pickups & Student Occupancy</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {initialBuses.map((bus) => (
          <div key={bus.id} className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">{bus.routeNo}</h3>
                <span className="text-xs text-amber-600 font-semibold">{bus.routeName}</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold">
                {bus.busNo}
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              <p>Driver: <strong>{bus.driverName}</strong> ({bus.driverPhone})</p>
              <p>Conductor: <strong>{bus.conductorName}</strong></p>
              <p>Occupancy: <strong>{bus.assignedStudentsCount} / {bus.capacity} Students</strong></p>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-400">Term Fee:</span>
              <strong className="text-slate-800 dark:text-slate-100 font-bold">{formatCurrency(bus.feePerTerm)}</strong>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
