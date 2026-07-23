'use client';

import React, { useState } from 'react';
import { initialExams, examMarks } from '@/lib/mock-data';
import { Exam, ExamMark } from '@/types';
import { formatDate } from '@/lib/utils';
import { BookOpen, Award, Plus, Calendar, FileText, CheckCircle2 } from 'lucide-react';

export default function ExaminationManagementPage() {
  const [exams, setExams] = useState<Exam[]>(initialExams);
  const [marks, setMarks] = useState<ExamMark[]>(examMarks);
  const [activeTab, setActiveTab] = useState<'schedule' | 'marks'>('schedule');

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Examination Management</h1>
            <p className="text-xs text-slate-500">Unit Tests, Mid Terms, Annual Exams, Marks Entry & Report Cards</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('schedule')}
          className={`px-5 py-3 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'schedule'
              ? 'border-purple-600 text-purple-600 dark:text-purple-400'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Exam Timetables & Schedules ({exams.length})
        </button>
        <button
          onClick={() => setActiveTab('marks')}
          className={`px-5 py-3 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'marks'
              ? 'border-purple-600 text-purple-600 dark:text-purple-400'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Marksheet & Report Cards ({marks.length})
        </button>
      </div>

      {activeTab === 'schedule' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {exams.map((ex) => (
            <div key={ex.id} className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <span className="font-extrabold text-slate-900 dark:text-white text-base">{ex.name}</span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-600">
                  {ex.className}
                </span>
              </div>
              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-purple-500" />
                  <span>{formatDate(ex.startDate)} – {formatDate(ex.endDate)}</span>
                </div>
                <p>Type: <strong>{ex.examType}</strong></p>
                <p>Total Marks: <strong>{ex.totalMarks}</strong> | Passing Marks: <strong>{ex.passingMarks}</strong></p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-4">Student</th>
                  <th className="p-4">Exam Name</th>
                  <th className="p-4">Subject</th>
                  <th className="p-4">Marks Obtained</th>
                  <th className="p-4">Grade</th>
                  <th className="p-4">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {marks.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="p-4 font-bold text-slate-800 dark:text-slate-100">
                      {m.studentName} <span className="text-[11px] font-normal text-slate-400">({m.className})</span>
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-400">{m.examName}</td>
                    <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">{m.subject}</td>
                    <td className="p-4 font-extrabold text-purple-600 dark:text-purple-400">{m.marksObtained}/{m.maxMarks}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">
                        {m.grade}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500">{m.remarks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
