'use client';

import React, { useState } from 'react';
import { ShieldAlert, Users, Key, History, Smartphone, Check, Lock } from 'lucide-react';
import { UserRole } from '@/types';

export default function AdminRoleMatrixPage() {
  const roles: UserRole[] = [
    'Super Admin',
    'Principal',
    'Vice Principal',
    'Admin',
    'Accountant',
    'Teacher',
    'HR',
    'Receptionist',
    'Librarian',
    'Transport Manager',
    'Inventory Manager',
    'Parent',
    'Student',
  ];

  const modules = [
    'Student Admissions',
    'Staff Payroll',
    'Fee Counter',
    'Exams & Marks',
    'Purchases & GRN',
    'POS Sales',
    'Inventory Stock',
    'Finance Ledger',
    'Bus Routes',
    'Announcements',
    'Settings & System',
  ];

  const [auditLogs] = useState([
    { id: 1, user: 'Dr. Rajesh Sharma (Super Admin)', action: 'Updated Fee Structure for Class 10th', time: '10 mins ago', ip: '192.168.1.45' },
    { id: 2, user: 'Mr. Amit Tiwari (Accountant)', action: 'Generated Receipt #RCP-2026-0891', time: '1 hour ago', ip: '192.168.1.12' },
    { id: 3, user: 'Mrs. Sunita Rao (Teacher)', action: 'Entered physics marks for Unit Test 1', time: '3 hours ago', ip: '192.168.1.88' },
  ]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Admin & Role Permission Matrix</h1>
            <p className="text-xs text-slate-500">RBAC Access Matrix, Audit Trail & Enterprise Security Policies</p>
          </div>
        </div>
      </div>

      {/* Permission Matrix Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800">
          <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Module Access Matrix across 13 Roles</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-4">ERP Module</th>
                {roles.slice(0, 7).map((r) => (
                  <th key={r} className="p-4 text-center">{r}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {modules.map((m, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="p-4 font-bold text-slate-800 dark:text-slate-100">{m}</td>
                  {roles.slice(0, 7).map((r) => (
                    <td key={r} className="p-4 text-center">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 inline-flex items-center justify-center font-bold">
                        ✓
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Logs */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
        <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
          <History className="w-5 h-5 text-blue-600" /> Real-time System Audit Logs
        </h3>
        <div className="space-y-3">
          {auditLogs.map((log) => (
            <div key={log.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs">
              <div>
                <strong className="text-slate-900 dark:text-white block font-bold">{log.user}</strong>
                <span className="text-slate-600 dark:text-slate-300">{log.action}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block">{log.time}</span>
                <span className="font-mono text-[11px] text-slate-500">IP: {log.ip}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
