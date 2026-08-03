'use client';

import React from 'react';
import {
  Clock,
  BookOpen,
  CreditCard,
  Cake,
  Calendar as CalendarIcon,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useCrudStore } from '@/store/crud-store';
import Link from 'next/link';

export default function DashboardWidgets() {
  const { feePayments, exams } = useCrudStore();

  const activeExams = exams.filter((ex: any) => !ex.isDeleted);
  const activeFeePayments = feePayments.filter((pay: any) => !pay.isDeleted);

  const timetable = [
    { period: 'Period 1', time: '08:30 - 09:15', subject: 'Regular Academic Class', class: 'Main Campus', teacher: 'Assigned Faculty', room: 'Room 101' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {/* 1. Today's Timetable */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Today&apos;s Timetable</h3>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
            Live
          </span>
        </div>
        <div className="space-y-3 flex-1 overflow-y-auto max-h-72 pr-1">
          {timetable.map((t, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-blue-600 dark:text-blue-400">{t.period}</span>
                <span className="text-slate-400 text-[11px]">{t.time}</span>
              </div>
              <p className="font-semibold text-slate-800 dark:text-slate-100 text-xs mt-1">{t.subject}</p>
              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                <span>{t.class}</span>
                <span>{t.room}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Upcoming Exams */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Upcoming Examinations</h3>
          </div>
          <Link href="/examinations" className="text-xs font-semibold text-blue-600 hover:underline flex items-center">
            View All <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="space-y-3 flex-1">
          {activeExams.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500 dark:text-slate-400 italic">
              No Examinations Scheduled Yet
            </div>
          ) : (
            activeExams.map((ex: any) => (
              <div key={ex.id} className="p-3 rounded-xl bg-purple-50/40 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-900/60">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{ex.name || ex.title || 'Exam'}</span>
                  <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300">
                    {ex.className}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {formatDate(ex.startDate || ex.examDate || '')}
                </p>
                <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 mt-2 pt-2 border-t border-purple-100 dark:border-purple-900/40">
                  <span>Passing: {ex.passingMarks}/{ex.totalMarks}</span>
                  <span className="text-purple-600 dark:text-purple-400 font-semibold">{ex.examType || ex.status}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 3. Recent Fee Payments */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Recent Fee Collection</h3>
          </div>
          <Link href="/fees" className="text-xs font-semibold text-blue-600 hover:underline flex items-center">
            Details <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="space-y-3 flex-1">
          {activeFeePayments.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500 dark:text-slate-400 italic">
              No Fee Collections Recorded Yet
            </div>
          ) : (
            activeFeePayments.slice(0, 5).map((pay: any) => (
              <div key={pay.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{pay.studentName}</p>
                  <p className="text-[11px] text-slate-500">{pay.receiptNo} • {pay.paymentMode}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">{formatCurrency(pay.amountPaid || pay.amount || 0)}</span>
                  <span className="block text-[10px] text-slate-400">{formatDate(pay.paymentDate)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 4. Birthday List & School Calendar */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
        {/* Birthdays */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-lg bg-pink-50 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400">
              <Cake className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Today&apos;s Birthdays 🎉</h3>
          </div>
          <div className="p-4 text-center text-xs text-slate-500 dark:text-slate-400 italic bg-pink-50/30 dark:bg-pink-950/10 rounded-xl border border-pink-100 dark:border-pink-950">
            No Birthdays Recorded Today
          </div>
        </div>

        {/* School Calendar Quick View */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Upcoming Events</h3>
          </div>
          <div className="p-3 text-center text-xs text-slate-500 dark:text-slate-400 italic">
            No Events Scheduled
          </div>
        </div>
      </div>
    </div>
  );
}
