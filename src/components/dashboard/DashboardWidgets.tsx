'use client';

import React from 'react';
import {
  Clock,
  BookOpen,
  CreditCard,
  Cake,
  Calendar as CalendarIcon,
  CheckCircle2,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { initialFeePayments, initialExams } from '@/lib/mock-data';
import { formatCurrency, formatDate } from '@/lib/utils';
import Link from 'next/link';

export default function DashboardWidgets() {
  const timetable = [
    { period: 'Period 1', time: '08:30 - 09:15', subject: 'Physics (Theory)', class: 'Class 10th A', teacher: 'Mrs. Sunita Rao', room: 'Lab 101' },
    { period: 'Period 2', time: '09:15 - 10:00', subject: 'Mathematics', class: 'Class 12th B', teacher: 'Mr. R. K. Sharma', room: 'Room 304' },
    { period: 'Period 3', time: '10:15 - 11:00', subject: 'Chemistry Lab', class: 'Class 11th A', teacher: 'Dr. V. Patel', room: 'Chem Lab' },
    { period: 'Period 4', time: '11:00 - 11:45', subject: 'English Literature', class: 'Class 9th C', teacher: 'Mrs. Anjali Roy', room: 'Room 202' },
  ];

  const birthdays = [
    { name: 'Ananya Sharma', class: 'Class 10th A', role: 'Student', age: '16 Yrs Today', photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80' },
    { name: 'Mr. Amit Tiwari', dept: 'Accounts', role: 'Chief Accountant', photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80' },
  ];

  const calendarEvents = [
    { date: '25 Jul', title: 'Parent-Teacher Meeting (Classes 9th-12th)', type: 'Academic' },
    { date: '05 Aug', title: 'First Unit Test Commences', type: 'Exam' },
    { date: '15 Aug', title: 'Independence Day Celebrations', type: 'Holiday & Event' },
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
          {initialExams.map((ex) => (
            <div key={ex.id} className="p-3 rounded-xl bg-purple-50/40 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-900/60">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{ex.name}</span>
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300">
                  {ex.className}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {formatDate(ex.startDate)} – {formatDate(ex.endDate)}
              </p>
              <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 mt-2 pt-2 border-t border-purple-100 dark:border-purple-900/40">
                <span>Passing: {ex.passingMarks}/{ex.totalMarks}</span>
                <span className="text-purple-600 dark:text-purple-400 font-semibold">{ex.examType}</span>
              </div>
            </div>
          ))}
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
          {initialFeePayments.map((pay) => (
            <div key={pay.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{pay.studentName}</p>
                <p className="text-[11px] text-slate-500">{pay.receiptNo} • {pay.paymentMode}</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">{formatCurrency(pay.amount)}</span>
                <span className="block text-[10px] text-slate-400">{formatDate(pay.paymentDate)}</span>
              </div>
            </div>
          ))}
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
          <div className="space-y-2">
            {birthdays.map((b, idx) => (
              <div key={idx} className="flex items-center gap-3 p-2.5 rounded-xl bg-pink-50/50 dark:bg-pink-950/20 border border-pink-200/60 dark:border-pink-900/60">
                <img src={b.photo} alt={b.name} className="w-8 h-8 rounded-full object-cover ring-2 ring-pink-400" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{b.name}</p>
                  <p className="text-[10px] text-pink-600 dark:text-pink-400 font-semibold">{b.class || b.dept}</p>
                </div>
                <Sparkles className="w-4 h-4 text-pink-500 animate-bounce" />
              </div>
            ))}
          </div>
        </div>

        {/* School Calendar Quick View */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Upcoming Calendar Events</h3>
          </div>
          <div className="space-y-2">
            {calendarEvents.map((ev, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                <span className="font-bold text-blue-600 dark:text-blue-400 w-14 shrink-0">{ev.date}</span>
                <span className="text-slate-700 dark:text-slate-300 font-medium truncate flex-1">{ev.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
