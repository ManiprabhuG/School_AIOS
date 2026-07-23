'use client';

import React from 'react';
import { initialNotifications } from '@/lib/mock-data';
import { Bell, CheckCircle2, AlertTriangle, AlertCircle, Info } from 'lucide-react';

export default function NotificationsPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Notification Center</h1>
            <p className="text-xs text-slate-500">System Broadcasts, Fee Reminders, Low Stock Alerts & Examination Flags</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {initialNotifications.map((n) => (
          <div key={n.id} className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-4">
            <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 mt-1">
              <Bell className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">{n.title}</h3>
                <span className="text-xs text-slate-400">{n.timestamp}</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{n.message}</p>
              <span className="inline-block mt-2 text-[10px] font-bold text-slate-500 uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                {n.category}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
