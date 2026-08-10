'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { useCrudStore } from '@/store/crud-store';
import { UserCheck, Check, Search } from 'lucide-react';

export default function StaffAllocationPage() {
  const { staff, buses, updateRecord } = useCrudStore();
  const [saved, setSaved] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Per-staff state for class & section
  const [allocations, setAllocations] = useState<Record<string, { className: string; section: string }>>({});

  const classesList = ['None', 'LKG', 'UKG', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];

  // Map of available sections per class
  const classSectionsMap: Record<string, string[]> = {
    None: ['None'],
    LKG: ['None', 'A', 'B', 'C'],
    UKG: ['None', 'A', 'B', 'C'],
    '1st': ['None', 'A', 'B', 'C', 'D'],
    '2nd': ['None', 'A', 'B', 'C', 'D'],
    '3rd': ['None', 'A', 'B', 'C', 'D', 'E'],
    '4th': ['None', 'A', 'B', 'C', 'D', 'E'],
    '5th': ['None', 'A', 'B', 'C', 'D', 'E', 'F'],
    '6th': ['None', 'A', 'B', 'C', 'D', 'E', 'F', 'G'],
    '7th': ['None', 'A', 'B', 'C', 'D', 'E', 'F', 'G'],
    '8th': ['None', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
    '9th': ['None', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
    '10th': ['None', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
    '11th': ['None', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'],
    '12th': ['None', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'],
  };

  const isNonTeachingStaff = (stf: any) => {
    if (stf.staffType === 'Non-Teaching') return true;
    if (stf.role) {
      const r = stf.role.toLowerCase();
      if (
        r.includes('driver') ||
        r.includes('accountant') ||
        r.includes('hr') ||
        r.includes('librarian') ||
        r.includes('receptionist') ||
        r.includes('inventory') ||
        r.includes('transport') ||
        r.includes('cleaner') ||
        r.includes('security') ||
        r.includes('peon') ||
        r.includes('lab assistant') ||
        r.includes('non-teaching')
      ) {
        return true;
      }
    }
    return false;
  };

  // Live database sync on mount
  useEffect(() => {
    fetch('/api/buses', { cache: 'no-store' })
      .then((res) => res.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          useCrudStore.setState({ buses: res.data });
        }
      })
      .catch((err) => console.error('Failed to fetch buses live:', err));

    fetch('/api/staff', { cache: 'no-store' })
      .then((res) => res.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          useCrudStore.setState({ staff: res.data });
        }
      })
      .catch((err) => console.error('Failed to fetch staff live:', err));
  }, []);

  // Initialize per-staff class & section state from staff list
  useEffect(() => {
    setAllocations((prev) => {
      const nextAlloc: Record<string, { className: string; section: string }> = { ...prev };
      staff.forEach((stf) => {
        const isNonTeaching = isNonTeachingStaff(stf);
        if (isNonTeaching) {
          nextAlloc[stf.id] = { className: 'None', section: 'None' };
        } else if (!nextAlloc[stf.id]) {
          const rawClass = stf.allocatedClass || (stf as any).assignedClass || '';
          const parts = rawClass ? rawClass.split(' ') : [];
          const cls = parts[0] || '10th';
          const sec = parts[1] || 'A';
          nextAlloc[stf.id] = { className: cls, section: sec };
        }
      });
      return nextAlloc;
    });
  }, [staff]);

  const handleClassChange = (staffId: string, newClass: string) => {
    const availableSecs = classSectionsMap[newClass] || ['None', 'A', 'B', 'C', 'D'];
    const currentSec = allocations[staffId]?.section || 'A';
    const validSec = availableSecs.includes(currentSec) ? currentSec : availableSecs[0];
    setAllocations((prev) => ({
      ...prev,
      [staffId]: { className: newClass, section: validSec },
    }));
  };

  const handleSectionChange = (staffId: string, newSection: string) => {
    setAllocations((prev) => ({
      ...prev,
      [staffId]: { ...prev[staffId], section: newSection },
    }));
  };

  const handleSaveAllocation = (
    staffId: string,
    allocatedClass: string,
    allocatedSection: string,
    subjectsStr: string,
    busRouteHandled: string
  ) => {
    const subjects = subjectsStr ? subjectsStr.split(',').map((s) => s.trim()).filter(Boolean) : [];
    const combinedClass =
      allocatedClass === 'None'
        ? 'None'
        : allocatedSection && allocatedSection !== 'None'
        ? `${allocatedClass} ${allocatedSection}`
        : allocatedClass;

    const payload = {
      id: staffId,
      allocatedClass: combinedClass,
      assignedClass: combinedClass,
      subjects,
      busRouteHandled: busRouteHandled === 'None' ? undefined : busRouteHandled,
    };

    updateRecord('staff', staffId, payload);

    // Call live backend PUT API /api/staff to save directly to MySQL database
    fetch('/api/staff', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch((err) => console.error('Failed to update staff allocation in DB:', err));

    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const filteredStaff = staff.filter((stf) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      stf.name?.toLowerCase().includes(q) ||
      stf.role?.toLowerCase().includes(q) ||
      stf.department?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Staff Allocation Matrix
            </h1>
            <p className="text-xs text-slate-500">
              Assign Teachers to Classes & Sections, Drivers to Bus Routes & Lab Staff
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search staff, role..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {saved && (
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl shrink-0">
              <Check className="w-4 h-4" /> Allocations Saved
            </span>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-800/90 backdrop-blur-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-4">Staff Name & Role</th>
                <th className="p-4">Department</th>
                <th className="p-4">Assigned Class ▼</th>
                <th className="p-4">Assigned Section ▼</th>
                <th className="p-4">Assigned Subjects</th>
                <th className="p-4">Assigned Bus Route (Live Data)</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredStaff.map((stf) => {
                const isNonTeaching = isNonTeachingStaff(stf);
                const currentCls = isNonTeaching ? 'None' : allocations[stf.id]?.className || '10th';
                const currentSec = isNonTeaching ? 'None' : allocations[stf.id]?.section || 'A';
                const availableSections = classSectionsMap[currentCls] || ['None', 'A', 'B', 'C', 'D'];

                return (
                  <tr key={stf.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-bold text-slate-800 dark:text-slate-100">
                      {stf.name}
                      <span className="block text-[11px] font-normal text-slate-400">{stf.role}</span>
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-400">{stf.department}</td>
                    <td className="p-4">
                      <select
                        value={currentCls}
                        disabled={isNonTeaching}
                        onChange={(e) => handleClassChange(stf.id, e.target.value)}
                        className={`bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl px-3 py-1.5 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          isNonTeaching ? 'opacity-60 cursor-not-allowed bg-slate-100 dark:bg-slate-800/50' : 'cursor-pointer'
                        }`}
                      >
                        {classesList.map((cls) => (
                          <option key={cls} value={cls}>
                            {cls === 'None' ? 'None' : `Class ${cls}`}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-4">
                      <select
                        value={currentSec}
                        disabled={isNonTeaching || currentCls === 'None'}
                        onChange={(e) => handleSectionChange(stf.id, e.target.value)}
                        className={`bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl px-3 py-1.5 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          isNonTeaching || currentCls === 'None'
                            ? 'opacity-60 cursor-not-allowed bg-slate-100 dark:bg-slate-800/50'
                            : 'cursor-pointer'
                        }`}
                      >
                        {availableSections.map((sec) => (
                          <option key={sec} value={sec}>
                            {sec === 'None' ? 'None' : `Section ${sec}`}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-4">
                      {isNonTeaching ? (
                        <span className="text-slate-400 dark:text-slate-500 font-semibold italic text-xs">
                          N/A (Non-Teaching)
                        </span>
                      ) : (
                        <input
                          type="text"
                          defaultValue={stf.subjects ? stf.subjects.join(', ') : 'Physics, Science'}
                          id={`sbj-${stf.id}`}
                          className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl px-3 py-1.5 w-40 focus:outline-none font-medium text-xs"
                        />
                      )}
                    </td>
                    <td className="p-4">
                      <select
                        defaultValue={stf.busRouteHandled || 'None'}
                        id={`bus-${stf.id}`}
                        className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                      >
                        <option value="None">None (N/A)</option>
                        {buses.map((b) => {
                          const val = `Route ${b.routeNo} - ${b.routeName}`;
                          return (
                            <option key={b.id} value={val}>
                              Route {b.routeNo} - {b.routeName} ({b.driverName || 'Driver'})
                            </option>
                          );
                        })}
                        {buses.length === 0 && (
                          <>
                            <option value="Route 1 - Model Town Circuit">Route 1 - Model Town Circuit</option>
                            <option value="Route 2 - South Extension">Route 2 - South Extension</option>
                            <option value="Route 4 - Dwarka Express">Route 4 - Dwarka Express</option>
                          </>
                        )}
                      </select>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => {
                          const sbjEl = document.getElementById(`sbj-${stf.id}`) as HTMLInputElement | null;
                          const busEl = document.getElementById(`bus-${stf.id}`) as HTMLSelectElement;
                          handleSaveAllocation(
                            stf.id,
                            currentCls,
                            currentSec,
                            sbjEl ? sbjEl.value : '',
                            busEl.value
                          );
                        }}
                        className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-sm hover:bg-blue-500 transition-all active:scale-95"
                      >
                        Update
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

