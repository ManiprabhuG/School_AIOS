'use client';

import React, { useState } from 'react';
import { initialStaff } from '@/lib/mock-data';
import { Staff } from '@/types';
import { formatCurrency, exportToCSV } from '@/lib/utils';
import { Users, Search, Plus, Download, Mail, Phone, Briefcase, Award, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function StaffManagementPage() {
  const [staffList, setStaffList] = useState<Staff[]>(initialStaff);
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('All');

  const filteredStaff = staffList.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.empId.toLowerCase().includes(search.toLowerCase()) ||
      s.department.toLowerCase().includes(search.toLowerCase());
    const matchesRole = selectedRole === 'All' || s.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const handleExport = () => {
    exportToCSV(
      'ABS_Staff_Directory',
      filteredStaff.map((s) => ({
        EmpID: s.empId,
        Name: s.name,
        Role: s.role,
        Department: s.department,
        Designation: s.designation,
        Email: s.email,
        Phone: s.phone,
        Salary: s.salary,
        Qualification: s.qualification,
        JoiningDate: s.joiningDate,
      }))
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Staff Management</h1>
            <p className="text-xs text-slate-500">Teachers, Office Staff, Transport Drivers, Security & Personnel</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search staff by name, EmpID, department..."
            className="w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Role Filter:</span>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium focus:outline-none"
          >
            <option value="All">All Roles</option>
            <option value="Teacher">Teacher</option>
            <option value="Accountant">Accountant</option>
            <option value="Transport Manager">Transport Manager</option>
            <option value="Librarian">Librarian</option>
          </select>
        </div>
      </div>

      {/* Staff Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredStaff.map((staff) => (
          <div
            key={staff.id}
            className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all space-y-4"
          >
            <div className="flex items-start gap-4">
              <img src={staff.photo} alt={staff.name} className="w-14 h-14 rounded-2xl object-cover ring-2 ring-purple-500/20" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base truncate">{staff.name}</h3>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                    {staff.empId}
                  </span>
                </div>
                <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 mt-0.5">{staff.designation}</p>
                <span className="inline-block mt-1 text-[10px] font-bold text-slate-500 uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                  {staff.department}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Mail className="w-3.5 h-3.5 text-purple-500" /> {staff.email}
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Phone className="w-3.5 h-3.5 text-purple-500" /> {staff.phone}
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Award className="w-3.5 h-3.5 text-purple-500" /> {staff.qualification} ({staff.experienceYears} Yrs Exp)
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Monthly Payroll</span>
                <strong className="text-slate-800 dark:text-slate-100 font-bold">{formatCurrency(staff.salary)}</strong>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-[11px] flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> {staff.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
