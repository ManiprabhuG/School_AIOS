'use client';

import React, { useState } from 'react';
import { initialStaff } from '@/lib/mock-data';
import { Staff } from '@/types';
import { UserCheck, School, Bus, BookOpen, Check, Save } from 'lucide-react';

export default function StaffAllocationPage() {
  const [allocations, setAllocations] = useState(
    initialStaff.map((s) => ({
      id: s.id,
      name: s.name,
      role: s.role,
      department: s.department,
      allocatedClass: s.allocatedClass || '10th A',
      subjects: s.subjects ? s.subjects.join(', ') : 'Physics, Science',
      busRouteHandled: s.busRouteHandled || 'Route 1 - Model Town Circuit',
    }))
  );

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Staff Allocation Matrix</h1>
            <p className="text-xs text-slate-500">Assign Teachers to Classes & Subjects, Drivers to Bus Routes, Lab Staff</p>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition-all active:scale-95"
        >
          {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? 'Allocations Saved!' : 'Save All Allocations'}
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-4">Staff Name & Role</th>
                <th className="p-4">Department</th>
                <th className="p-4">Assigned Class & Section</th>
                <th className="p-4">Assigned Subjects</th>
                <th className="p-4">Assigned Bus Route</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {allocations.map((item, idx) => (
                <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 font-bold text-slate-800 dark:text-slate-100">
                    {item.name}
                    <span className="block text-[11px] font-normal text-slate-400">{item.role}</span>
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-400">{item.department}</td>
                  <td className="p-4">
                    <select
                      value={item.allocatedClass}
                      onChange={(e) => {
                        const copy = [...allocations];
                        copy[idx].allocatedClass = e.target.value;
                        setAllocations(copy);
                      }}
                      className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl px-3 py-1.5 font-semibold focus:outline-none"
                    >
                      {['LKG A', 'UKG A', '5th C', '10th A', '10th B', '12th A', '12th B'].map((cls) => (
                        <option key={cls} value={cls}>{cls}</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-4">
                    <input
                      type="text"
                      value={item.subjects}
                      onChange={(e) => {
                        const copy = [...allocations];
                        copy[idx].subjects = e.target.value;
                        setAllocations(copy);
                      }}
                      className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl px-3 py-1.5 w-48 focus:outline-none"
                    />
                  </td>
                  <td className="p-4">
                    <select
                      value={item.busRouteHandled}
                      onChange={(e) => {
                        const copy = [...allocations];
                        copy[idx].busRouteHandled = e.target.value;
                        setAllocations(copy);
                      }}
                      className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl px-3 py-1.5 focus:outline-none"
                    >
                      <option value="None">None (N/A)</option>
                      <option value="Route 1 - Model Town Circuit">Route 1 - Model Town Circuit</option>
                      <option value="Route 2 - South Extension">Route 2 - South Extension</option>
                      <option value="Route 4 - Dwarka Express">Route 4 - Dwarka Express</option>
                    </select>
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
