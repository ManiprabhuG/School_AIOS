'use client';

import React, { useState } from 'react';
import { X, History, UserCheck, Calendar, Search } from 'lucide-react';
import { AuditLog } from '@/types';

interface AuditLogViewerProps {
  isOpen: boolean;
  onClose: () => void;
  moduleName: string;
  auditLogs: AuditLog[];
}

export function AuditLogViewer({ isOpen, onClose, moduleName, auditLogs }: AuditLogViewerProps) {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const moduleLogs = auditLogs.filter(
    (log) =>
      log.module.toLowerCase() === moduleName.toLowerCase() &&
      (log.details.toLowerCase().includes(search.toLowerCase()) ||
        log.userName.toLowerCase().includes(search.toLowerCase()) ||
        log.action.toLowerCase().includes(search.toLowerCase()))
  );

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'CREATE':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
      case 'UPDATE':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300';
      case 'DELETE':
      case 'SOFT_DELETE':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300';
      case 'RESTORE':
        return 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300';
      default:
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                {moduleName} Audit Activity Trail
              </h2>
              <p className="text-xs text-slate-500">Full immutable audit logging & user action history</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search log history by user, action or details..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
            />
          </div>
        </div>

        {/* Log List */}
        <div className="p-6 space-y-3 overflow-y-auto flex-1 text-xs">
          {moduleLogs.length === 0 ? (
            <p className="text-center text-slate-400 py-8">No audit logs found for {moduleName}.</p>
          ) : (
            moduleLogs.map((log) => (
              <div
                key={log.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${getActionBadge(log.action)}`}>
                      {log.action}
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-blue-500" /> {log.userName} ({log.userRole})
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {log.timestamp}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 font-medium pl-1">{log.details}</p>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button onClick={onClose} className="px-5 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold">
            Close Audit Dossier
          </button>
        </div>
      </div>
    </div>
  );
}
