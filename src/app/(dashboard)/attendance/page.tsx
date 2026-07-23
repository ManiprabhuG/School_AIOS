'use client';

import React, { useState } from 'react';
import { initialStudents, initialStaff } from '@/lib/mock-data';
import { CalendarCheck, QrCode, Download, CheckCircle2, XCircle, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';
import { exportToCSV } from '@/lib/utils';

export default function AttendanceManagementPage() {
  const [activeTab, setActiveTab] = useState<'students' | 'staff'>('students');
  const [selectedDate, setSelectedDate] = useState('2026-07-23');

  const [studentAttendance, setStudentAttendance] = useState(
    initialStudents.map((s) => ({
      id: s.id,
      name: s.name,
      rollNo: s.rollNo,
      className: s.className,
      section: s.section,
      status: 'Present' as 'Present' | 'Absent' | 'Late' | 'Half Day' | 'Leave',
      timeIn: '08:15 AM',
    }))
  );

  const [staffAttendance, setStaffAttendance] = useState(
    initialStaff.map((st) => ({
      id: st.id,
      empId: st.empId,
      name: st.name,
      department: st.department,
      status: 'Present' as 'Present' | 'Absent' | 'Late' | 'Half Day' | 'Leave',
      timeIn: '08:05 AM',
    }))
  );

  const toggleStudentStatus = (id: string, newStatus: any) => {
    setStudentAttendance((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
  };

  const toggleStaffStatus = (id: string, newStatus: any) => {
    setStaffAttendance((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
  };

  const counts = {
    present: studentAttendance.filter((s) => s.status === 'Present').length,
    absent: studentAttendance.filter((s) => s.status === 'Absent').length,
    late: studentAttendance.filter((s) => s.status === 'Late').length,
    leave: studentAttendance.filter((s) => s.status === 'Leave').length,
  };

  const handleExport = () => {
    if (activeTab === 'students') {
      exportToCSV('ABS_Student_Attendance_' + selectedDate, studentAttendance);
    } else {
      exportToCSV('ABS_Staff_Attendance_' + selectedDate, staffAttendance);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Attendance Management System</h1>
            <p className="text-xs text-slate-500">Daily Attendance, RFID Ready Log, QR Verification & Monthly Audits</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
          />
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Summary KPI Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-900/60 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">Present Today</span>
            <h3 className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400 mt-0.5">{counts.present}</h3>
          </div>
          <CheckCircle2 className="w-8 h-8 text-emerald-500 opacity-80" />
        </div>

        <div className="p-4 rounded-2xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-900/60 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-rose-800 dark:text-rose-300">Absent</span>
            <h3 className="text-2xl font-extrabold text-rose-700 dark:text-rose-400 mt-0.5">{counts.absent}</h3>
          </div>
          <XCircle className="w-8 h-8 text-rose-500 opacity-80" />
        </div>

        <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/60 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-amber-800 dark:text-amber-300">Late Entry</span>
            <h3 className="text-2xl font-extrabold text-amber-700 dark:text-amber-400 mt-0.5">{counts.late}</h3>
          </div>
          <Clock className="w-8 h-8 text-amber-500 opacity-80" />
        </div>

        <div className="p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/60 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-blue-800 dark:text-blue-300">On Leave</span>
            <h3 className="text-2xl font-extrabold text-blue-700 dark:text-blue-400 mt-0.5">{counts.leave}</h3>
          </div>
          <AlertTriangle className="w-8 h-8 text-blue-500 opacity-80" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('students')}
          className={`px-5 py-3 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'students'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Student Daily Attendance ({studentAttendance.length})
        </button>
        <button
          onClick={() => setActiveTab('staff')}
          className={`px-5 py-3 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'staff'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Staff & Faculty Attendance ({staffAttendance.length})
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {activeTab === 'students' ? (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-4">Roll #</th>
                  <th className="p-4">Student Name</th>
                  <th className="p-4">Class</th>
                  <th className="p-4">Time In (RFID)</th>
                  <th className="p-4">Attendance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {studentAttendance.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="p-4 font-mono font-bold">#{s.rollNo}</td>
                    <td className="p-4 font-bold text-slate-800 dark:text-slate-100">{s.name}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-600 font-bold">
                        {s.className}-{s.section}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500 font-mono">{s.timeIn}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        {(['Present', 'Absent', 'Late', 'Leave'] as const).map((st) => (
                          <button
                            key={st}
                            onClick={() => toggleStudentStatus(s.id, st)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                              s.status === st
                                ? st === 'Present'
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : st === 'Absent'
                                  ? 'bg-rose-600 text-white shadow-xs'
                                  : st === 'Late'
                                  ? 'bg-amber-500 text-white shadow-xs'
                                  : 'bg-blue-600 text-white shadow-xs'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-4">Emp ID</th>
                  <th className="p-4">Staff Name</th>
                  <th className="p-4">Department</th>
                  <th className="p-4">Check-In Time</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {staffAttendance.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="p-4 font-mono font-bold">{st.empId}</td>
                    <td className="p-4 font-bold text-slate-800 dark:text-slate-100">{st.name}</td>
                    <td className="p-4 text-slate-600 dark:text-slate-400">{st.department}</td>
                    <td className="p-4 font-mono text-slate-500">{st.timeIn}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        {(['Present', 'Absent', 'Late', 'Leave'] as const).map((s) => (
                          <button
                            key={s}
                            onClick={() => toggleStaffStatus(st.id, s)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                              st.status === s
                                ? s === 'Present'
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : s === 'Absent'
                                  ? 'bg-rose-600 text-white shadow-xs'
                                  : s === 'Late'
                                  ? 'bg-amber-500 text-white shadow-xs'
                                  : 'bg-blue-600 text-white shadow-xs'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
