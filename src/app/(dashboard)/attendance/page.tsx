'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useCrudStore } from '@/store/crud-store';
import { AttendanceRecord } from '@/types';
import { DataTable, Column } from '@/components/crud/DataTable';
import { CrudModal, FieldConfig } from '@/components/crud/CrudModal';
import { ImportModal } from '@/components/crud/ImportModal';
import { AuditLogViewer } from '@/components/crud/AuditLogViewer';
import { ConfirmDialog } from '@/components/crud/ConfirmDialog';
import { CalendarCheck, Calendar as CalendarIcon, Table as TableIcon, ChevronLeft, ChevronRight, Plus, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';

import { useAuthStore } from '@/store/auth-store';

export default function AttendancePage() {
  const router = useRouter();
  const {
    students,
    staff,
    auditLogs,
  } = useCrudStore();
  const { activeRole, user } = useAuthStore();

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const isExecutive = useMemo(() => {
    return ['Super Admin', 'Admin', 'Principal', 'Vice Principal'].includes(activeRole);
  }, [activeRole]);

  // Match logged-in teacher's allocated class dynamically from Staff Allocation Matrix
  const teacherAllocatedClass = useMemo(() => {
    if (isExecutive) return null;

    const uId = (user?.id || '').trim().toLowerCase();
    const uEmail = (user?.email || '').trim().toLowerCase();
    const uName = (user?.name || '').trim().toLowerCase();
    const uUsername = (user?.username || '').trim().toLowerCase();

    const matchedStaff = staff.find((s) => {
      const sId = (s.id || '').trim().toLowerCase();
      const sEmail = (s.email || '').trim().toLowerCase();
      const sName = (s.name || '').trim().toLowerCase();
      const sUsername = (s.username || s.empId || (s as any).employeeId || '').trim().toLowerCase();

      if (uId && sId === uId) return true;
      if (uEmail && sEmail === uEmail) return true;
      if (uName && sName === uName) return true;
      if (uUsername && (sUsername === uUsername || (sEmail && sEmail.includes(uUsername)))) return true;
      return false;
    });

    const directClass = (user as any)?.allocatedClass || (user as any)?.assignedClass;
    const rawClass = directClass || matchedStaff?.allocatedClass || (matchedStaff as any)?.assignedClass;
    const teacherName = matchedStaff?.name || user?.name || 'Teacher';

    if (!rawClass || rawClass === 'None' || rawClass === 'null') {
      return {
        full: 'None',
        className: 'None',
        section: 'None',
        teacherName,
        hasAllocation: false,
      };
    }

    const cleanRaw = rawClass.trim();
    let cls = '';
    let sec = '';

    if (cleanRaw.includes('-')) {
      const parts = cleanRaw.split('-');
      cls = parts[0].trim();
      sec = parts[1].trim();
    } else if (cleanRaw.includes(' ')) {
      const parts = cleanRaw.split(' ');
      cls = parts[0].trim();
      sec = parts[1].trim();
    } else {
      cls = cleanRaw;
      sec = 'None';
    }

    return {
      full: rawClass,
      className: cls,
      section: sec,
      teacherName,
      hasAllocation: true,
    };
  }, [isExecutive, staff, user]);

  const visibleAttendanceRecords = useMemo(() => {
    const targetDate = selectedDate || new Date().toISOString().split('T')[0];

    let targetCls = '';
    let targetSec = '';

    if (!isExecutive) {
      if (teacherAllocatedClass && teacherAllocatedClass.hasAllocation) {
        targetCls = teacherAllocatedClass.className.toLowerCase();
        targetSec = teacherAllocatedClass.section.toLowerCase();
      } else {
        return [];
      }
    }

    // Filter students belonging to the target class and section
    const matchingStudents = students.filter((s) => {
      if ((s.status as string) === 'Inactive' || s.status === 'Transferred') return false;
      if (!targetCls) return true;

      let sCls = (s.className || '').trim().toLowerCase();
      let sSec = (s.section || '').trim().toLowerCase();

      if (!sSec && sCls.includes('-')) {
        const parts = sCls.split('-');
        sCls = parts[0].trim();
        sSec = parts[1].trim();
      } else if (!sSec && sCls.includes(' ')) {
        const parts = sCls.split(' ');
        sCls = parts[0].trim();
        sSec = parts[1].trim();
      }

      const classMatches = sCls === targetCls || sCls.includes(targetCls) || targetCls.includes(sCls);
      const sectionMatches = !targetSec || targetSec === 'none' || sSec === targetSec;

      return classMatches && sectionMatches;
    });

    // Map of saved records from DB: key = `${entityId}_${date}` or `${name}_${date}`
    const dbRecordMap = new Map<string, AttendanceRecord>();
    attendanceRecords.forEach((rec) => {
      if (rec.entityId) dbRecordMap.set(`${rec.entityId}_${rec.date}`, rec);
      if (rec.name && rec.date) dbRecordMap.set(`${rec.name.trim().toLowerCase()}_${rec.date}`, rec);
    });

    // Build complete student roster for the attendance register
    const studentRows: AttendanceRecord[] = matchingStudents.map((std) => {
      const saved =
        dbRecordMap.get(`${std.id}_${targetDate}`) ||
        dbRecordMap.get(`${std.name.trim().toLowerCase()}_${targetDate}`);

      if (saved) return saved;

      return {
        id: `att-std-${std.id}-${targetDate}`,
        date: targetDate,
        entityId: std.id,
        entityType: 'Student',
        name: std.name,
        className: std.className || '10th',
        section: std.section || 'A',
        status: 'Present',
        remarks: 'Present in class',
      };
    });

    // Extra saved records (e.g. staff attendance or entries not matching student list)
    const extraRecords = attendanceRecords.filter((rec) => {
      if (rec.entityType === 'Staff') return isExecutive;
      if (rec.date !== targetDate) return false;

      const alreadyIncluded = studentRows.some(
        (sr) => sr.id === rec.id || sr.entityId === rec.entityId || sr.name.trim().toLowerCase() === rec.name.trim().toLowerCase()
      );
      if (alreadyIncluded) return false;

      if (targetCls) {
        const rCls = (rec.className || '').toLowerCase();
        const rSec = (rec.section || '').toLowerCase();
        const classMatches = rCls === targetCls || rCls.includes(targetCls) || targetCls.includes(rCls);
        const sectionMatches = !targetSec || targetSec === 'none' || rSec === targetSec;
        return classMatches && sectionMatches;
      }
      return true;
    });

    return [...studentRows, ...extraRecords];
  }, [attendanceRecords, isExecutive, teacherAllocatedClass, students, selectedDate]);

  const parseClassAndSection = (rawClass?: string | null, rawSection?: string | null) => {
    let cls = (rawClass || '').trim();
    let sec = (rawSection || '').trim();

    if (cls.includes('-')) {
      const parts = cls.split('-');
      cls = parts[0].trim();
      if (!sec) sec = parts[1].trim();
    }

    return {
      className: cls || '10th',
      section: sec || 'A',
    };
  };

  React.useEffect(() => {
    fetch('/api/students', { cache: 'no-store' })
      .then((res) => res.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          useCrudStore.setState({ students: res.data });
        }
      })
      .catch((err) => console.error('Failed to fetch live students:', err));

    fetch('/api/staff', { cache: 'no-store' })
      .then((res) => res.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          useCrudStore.setState({ staff: res.data });
        }
      })
      .catch((err) => console.error('Failed to fetch live staff allocation:', err));

    fetch('/api/attendance', { cache: 'no-store' })
      .then((res) => res.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          const normalized = res.data.map((rec: any) => {
            const parsed = parseClassAndSection(rec.className, rec.section);
            return {
              ...rec,
              className: rec.entityType === 'Staff' ? (rec.className || rec.department || 'Staff') : parsed.className,
              section: rec.entityType === 'Staff' ? (rec.section || 'A') : parsed.section,
            };
          });
          setAttendanceRecords(normalized);
        }
      })
      .catch((err) => console.error('Failed to load attendance from DB:', err));
  }, []);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAtt, setEditingAtt] = useState<AttendanceRecord | null>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string; permanent: boolean } | null>(null);

  const [currentEntityTypeFilter, setCurrentEntityTypeFilter] = useState<string>('Student');

  // Calendar View State
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table');
  const [calendarDate, setCalendarDate] = useState<Date>(new Date());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null);

  const attendanceFields: FieldConfig[] = [
    {
      name: 'date',
      label: 'Attendance Date *',
      type: 'date',
      defaultValue: new Date().toISOString().split('T')[0],
      colSpan: 2,
    },
    {
      name: 'entityType',
      label: 'Person Category *',
      type: 'select',
      options: [
        { label: 'Student', value: 'Student' },
        { label: 'Staff', value: 'Staff' },
      ],
    },
    {
      name: 'staffType',
      label: 'Staff Type *',
      type: 'select',
      options: [
        { label: 'Teaching', value: 'Teaching' },
        { label: 'Non-Teaching', value: 'Non-Teaching' },
      ],
      hidden: (formData) => formData.entityType !== 'Staff',
    },
    {
      name: 'department',
      label: 'Department * (Teaching Staff)',
      type: 'select',
      options: [
        { label: 'Mathematics', value: 'Mathematics' },
        { label: 'Science & Physics', value: 'Science & Physics' },
        { label: 'English & Literature', value: 'English & Literature' },
        { label: 'Computer Science & IT', value: 'Computer Science & IT' },
        { label: 'Languages & Tamil/Hindi', value: 'Languages & Tamil/Hindi' },
        { label: 'Social Studies & History', value: 'Social Studies & History' },
        { label: 'Physical Education & Sports', value: 'Physical Education & Sports' },
        { label: 'Arts & Music', value: 'Arts & Music' },
      ],
      hidden: (formData) => formData.entityType !== 'Staff' || formData.staffType !== 'Teaching',
    },
    {
      name: 'name',
      label: 'Full Name *',
      type: 'text',
      placeholder: 'Click cursor to select or type name...',
      colSpan: 2,
    },
    {
      name: 'className',
      label: 'Class (Students)',
      type: 'select',
      options: ['LKG', 'UKG', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'].map(
        (c) => ({ label: `Class ${c}`, value: c })
      ),
      hidden: (formData) => formData.entityType === 'Staff',
    },
    {
      name: 'section',
      label: 'Section (Students)',
      type: 'select',
      options: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].map((s) => ({ label: `Section ${s}`, value: s })),
      hidden: (formData) => formData.entityType === 'Staff',
    },
    {
      name: 'status',
      label: 'Attendance Status *',
      type: 'select',
      options: [
        { label: 'Present', value: 'Present' },
        { label: 'Absent', value: 'Absent' },
        { label: 'Late', value: 'Late' },
        { label: 'Half Day', value: 'Half Day' },
        { label: 'Leave', value: 'Leave' },
      ],
    },
    {
      name: 'remarks',
      label: 'Attendance Remarks',
      type: 'textarea',
      colSpan: 2,
      placeholder: 'e.g. Present in campus / Approved Leave / Parent informed',
    },
  ];

  const columns: Column<AttendanceRecord>[] = [
    {
      key: 'date',
      header: 'Date',
      sortable: true,
      render: (a) => (
        <span className="font-mono font-bold text-slate-800 dark:text-slate-100">
          {a.date || new Date().toISOString().split('T')[0]}
        </span>
      ),
    },
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      render: (a) => (
        <div>
          <p className="font-extrabold text-slate-900 dark:text-slate-100">{a.name}</p>
          <span className="text-[10px] text-blue-600 font-semibold">{a.entityType}</span>
        </div>
      ),
    },
    {
      key: 'className',
      header: 'Class & Section / Department',
      sortable: true,
      render: (a) => (
        <div className="text-xs">
          {a.entityType === 'Staff' ? (
            <div>
              <span className="font-bold text-slate-900 dark:text-slate-100">{a.staffType || 'Staff'}</span>
              {a.department && <span className="text-slate-500 block text-[11px]">Dept: {a.department}</span>}
            </div>
          ) : (
            <span className="font-bold text-slate-800 dark:text-slate-200">
              Class {a.className || '10th'} - {a.section || 'A'}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Attendance Status',
      sortable: true,
      render: (a) => (
        <span
          className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold ${
            a.status === 'Present'
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
              : a.status === 'Absent'
              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
              : a.status === 'Late'
              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
              : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
          }`}
        >
          {a.status}
        </span>
      ),
    },
    { key: 'remarks', header: 'Remarks' },
  ];

  const dynamicFilterOptions = useMemo(() => {
    const personTypeFilterOption = {
      key: 'entityType',
      label: 'Person Type',
      options: [
        { label: 'Student', value: 'Student' },
        { label: 'Staff', value: 'Staff' },
      ],
    };

    const statusFilterOption = {
      key: 'status',
      label: 'Status',
      options: [
        { label: 'Present', value: 'Present' },
        { label: 'Absent', value: 'Absent' },
        { label: 'Late', value: 'Late' },
        { label: 'Half Day', value: 'Half Day' },
        { label: 'Leave', value: 'Leave' },
      ],
    };

    if (currentEntityTypeFilter === 'Staff') {
      return [
        personTypeFilterOption,
        {
          key: 'department',
          label: 'Department',
          options: [
            { label: 'Science & Physics', value: 'Science & Physics' },
            { label: 'Mathematics', value: 'Mathematics' },
            { label: 'English & Literature', value: 'English & Literature' },
            { label: 'Computer Science & IT', value: 'Computer Science & IT' },
            { label: 'Languages & Tamil/Hindi', value: 'Languages & Tamil/Hindi' },
            { label: 'Social Studies & History', value: 'Social Studies & History' },
            { label: 'Physical Education & Sports', value: 'Physical Education & Sports' },
            { label: 'Arts & Music', value: 'Arts & Music' },
          ],
        },
        statusFilterOption,
      ];
    }

    return [
      personTypeFilterOption,
      {
        key: 'className',
        label: 'Class Filter',
        options: ['LKG', 'UKG', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'].map(
          (c) => ({ label: `Class ${c}`, value: c })
        ),
      },
      {
        key: 'section',
        label: 'Section Filter',
        options: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].map((s) => ({ label: `Section ${s}`, value: s })),
      },
      statusFilterOption,
    ];
  }, [currentEntityTypeFilter]);

  const handleFilterChange = (filters: Record<string, string>) => {
    if (filters.entityType !== undefined && filters.entityType !== currentEntityTypeFilter) {
      setCurrentEntityTypeFilter(filters.entityType || 'Student');
    }
  };

  const handleSaveAttendance = async (data: Record<string, any>, saveAndNew?: boolean) => {
    if (editingAtt) {
      const updatedItem = { ...editingAtt, ...data };
      setAttendanceRecords((prev) =>
        prev.map((item) => (item.id === editingAtt.id ? updatedItem : item))
      );
      try {
        await fetch('/api/attendance', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingAtt.id, ...data }),
        });
      } catch (err) {
        console.error('Failed to update attendance in DB:', err);
      }
      setEditingAtt(null);
    } else {
      const newAtt: AttendanceRecord = {
        id: `att-${Date.now()}`,
        date: data.date || new Date().toISOString().split('T')[0],
        entityId: data.entityId || `ent-${Date.now()}`,
        entityType: data.entityType || 'Student',
        staffType: data.staffType || undefined,
        department: data.department || undefined,
        name: data.name,
        className: data.className || '10th',
        section: data.section || 'A',
        status: data.status || 'Present',
        remarks: data.remarks || '',
      };
      setAttendanceRecords([newAtt, ...attendanceRecords]);
      try {
        const res = await fetch('/api/attendance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newAtt),
        });
        const resJson = await res.json();
        if (resJson.success && resJson.data) {
          setAttendanceRecords((prev) =>
            prev.map((item) => (item.id === newAtt.id ? { ...item, ...resJson.data } : item))
          );
        }
      } catch (err) {
        console.error('Failed to save attendance to DB:', err);
      }
      if (!saveAndNew) setIsAddModalOpen(false);
    }
  };

  // Calendar Grid Calculations
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = calendarDate.toLocaleString('en-IN', { month: 'long', year: 'numeric' });

  const prevMonth = () => setCalendarDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCalendarDate(new Date(year, month + 1, 1));
  const todayMonth = () => setCalendarDate(new Date());

  const calendarDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const recs = visibleAttendanceRecords.filter((r) => r.date === dateStr && !r.isDeleted);
      const presentCount = recs.filter((r) => r.status === 'Present').length;
      const absentCount = recs.filter((r) => r.status === 'Absent').length;
      const lateLeaveCount = recs.filter((r) => r.status === 'Late' || r.status === 'Leave' || r.status === 'Half Day').length;

      days.push({
        dayNumber: d,
        dateStr,
        records: recs,
        presentCount,
        absentCount,
        lateLeaveCount,
      });
    }
    return days;
  }, [year, month, firstDay, totalDaysInMonth, visibleAttendanceRecords]);

  return (
    <div className="space-y-6">
      {/* Mode Switcher Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 font-extrabold">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                Attendance Register & Monthly Calendar
              </h2>
              {!isExecutive && teacherAllocatedClass ? (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 text-[11px] font-extrabold">
                  Class In-Charge: {teacherAllocatedClass.className}-{teacherAllocatedClass.section} ({teacherAllocatedClass.teacherName})
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800 text-[11px] font-extrabold">
                  {activeRole} (Full School Access)
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              {!isExecutive && teacherAllocatedClass
                ? `Showing attendance records & calendar for Class ${teacherAllocatedClass.className}-${teacherAllocatedClass.section} only`
                : 'Real-time attendance tracking for Students & Staff across all classes'}
            </p>
          </div>
        </div>

        {/* View Switcher Toggle & Date Selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-xs font-bold text-slate-500">Date:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-xs font-extrabold text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <TableIcon className="w-4 h-4" /> Table Register
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
                viewMode === 'calendar'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <CalendarIcon className="w-4 h-4" /> Interactive Calendar View
            </button>
          </div>
        </div>
      </div>

      {!isExecutive && teacherAllocatedClass && !teacherAllocatedClass.hasAllocation && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0" />
          <div>
            <h4 className="text-sm font-extrabold text-amber-900 dark:text-amber-200">No Class Allocated</h4>
            <p className="text-xs text-amber-700 dark:text-amber-400">
              No class is currently allocated to your teacher account ({teacherAllocatedClass.teacherName}). Please ask an Administrator to assign your class in the Staff Allocation Matrix.
            </p>
          </div>
        </div>
      )}

      {viewMode === 'table' ? (
        <DataTable
          title="Student & Staff Attendance Register"
          subtitle={
            !isExecutive && teacherAllocatedClass
              ? `Daily Attendance Register for Class ${teacherAllocatedClass.className}-${teacherAllocatedClass.section}`
              : 'Daily Attendance Marking, Late Check-Ins, Leave Submissions & Muster Roll'
          }
          icon={<CalendarCheck className="w-6 h-6" />}
          columns={columns}
          data={visibleAttendanceRecords}
          addLabel="Mark Attendance Entry"
          exportFilename="ABS_Attendance_Register"
          filterOptions={dynamicFilterOptions}
          onFilterChange={handleFilterChange}
          statusUpdateOptions={{
            field: 'status',
            label: 'Attendance Status',
            values: ['Present', 'Absent', 'Late', 'Half Day', 'Leave'],
          }}
          onAddClick={() => setIsAddModalOpen(true)}
          onEditClick={(a) => setEditingAtt(a)}
          onSoftDeleteClick={(a) =>
            setAttendanceRecords((prev) => prev.map((item) => (item.id === a.id ? { ...item, isDeleted: true } : item)))
          }
          onRestoreClick={(a) =>
            setAttendanceRecords((prev) => prev.map((item) => (item.id === a.id ? { ...item, isDeleted: false } : item)))
          }
          onPermanentDeleteClick={(a) => setConfirmDelete({ id: a.id, name: a.name, permanent: true })}
          onBulkDelete={(ids, soft) => {
            if (soft) {
              setAttendanceRecords((prev) =>
                prev.map((item) => (ids.includes(item.id) ? { ...item, isDeleted: true } : item))
              );
            } else {
              setAttendanceRecords((prev) => prev.filter((item) => !ids.includes(item.id)));
            }
          }}
          onBulkStatusUpdate={(ids, field, val) => {
            setAttendanceRecords((prev) =>
              prev.map((item) => (ids.includes(item.id) ? { ...item, [field]: val } : item))
            );
          }}
          onImportClick={() => setIsImportOpen(true)}
          onAuditLogsClick={() => setIsAuditOpen(true)}
        />
      ) : (
        /* Calendar View Section */
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          {/* Calendar Header Navigation */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white capitalize">{monthName}</h3>
              <button
                onClick={todayMonth}
                className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-bold text-xs hover:bg-blue-100"
              >
                Today
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={prevMonth}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextMonth}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="ml-2 px-3 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center gap-1.5 hover:bg-blue-700 shadow-sm"
              >
                <Plus className="w-4 h-4" /> Mark Attendance
              </button>
            </div>
          </div>

          {/* Legend Bar */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500" /> Present</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-rose-500" /> Absent</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-500" /> Late / Leave</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2 text-center">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="py-2 font-extrabold text-xs text-slate-400 uppercase tracking-wider">
                {d}
              </div>
            ))}

            {calendarDays.map((cd, index) => {
              if (!cd) {
                return <div key={`empty-${index}`} className="h-24 rounded-2xl bg-slate-50/40 dark:bg-slate-800/20" />;
              }

              const isToday = cd.dateStr === new Date().toISOString().split('T')[0];

              return (
                <div
                  key={cd.dateStr}
                  onClick={() => {
                    setSelectedCalendarDate(cd.dateStr);
                    setEditingAtt({
                      id: '',
                      date: cd.dateStr,
                      entityId: '',
                      entityType: 'Student',
                      name: '',
                      status: 'Present',
                    });
                    setIsAddModalOpen(true);
                  }}
                  className={`h-24 p-2 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between hover:shadow-md ${
                    isToday
                      ? 'border-blue-500 bg-blue-50/30 dark:bg-blue-950/20 ring-2 ring-blue-500/20'
                      : 'border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-black w-6 h-6 rounded-full flex items-center justify-center ${
                        isToday ? 'bg-blue-600 text-white' : 'text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      {cd.dayNumber}
                    </span>
                    {cd.records.length > 0 && (
                      <span className="text-[10px] font-bold text-slate-400">{cd.records.length} recs</span>
                    )}
                  </div>

                  <div className="space-y-1 mt-1 text-[10px]">
                    {cd.presentCount > 0 && (
                      <div className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-extrabold flex justify-between">
                        <span>P</span>
                        <span>{cd.presentCount}</span>
                      </div>
                    )}
                    {cd.absentCount > 0 && (
                      <div className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-extrabold flex justify-between">
                        <span>A</span>
                        <span>{cd.absentCount}</span>
                      </div>
                    )}
                    {cd.lateLeaveCount > 0 && (
                      <div className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-extrabold flex justify-between">
                        <span>L</span>
                        <span>{cd.lateLeaveCount}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      <CrudModal
        isOpen={isAddModalOpen || Boolean(editingAtt)}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingAtt(null);
        }}
        title="Attendance Record"
        fields={attendanceFields}
        initialData={
          editingAtt
            ? { ...editingAtt }
            : !isExecutive && teacherAllocatedClass
            ? {
                entityType: 'Student',
                className: teacherAllocatedClass.className,
                section: teacherAllocatedClass.section,
                date: new Date().toISOString().split('T')[0],
                status: 'Present',
              }
            : null
        }
        onSave={handleSaveAttendance}
      />

      {/* Import Modal */}
      <ImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        title="Attendance"
        onImport={(rows) => {
          const formatted = rows.map((r, i) => ({
            id: `att-${Date.now()}-${i}`,
            date: r.date || new Date().toISOString().split('T')[0],
            entityId: `ent-${i}`,
            entityType: r.entityType || 'Student',
            name: r.name || 'Imported User',
            className: r.className || '',
            status: r.status || 'Present',
            timeIn: r.timeIn || '08:00 AM',
            timeOut: r.timeOut || '02:30 PM',
          }));
          setAttendanceRecords([...formatted, ...attendanceRecords]);
        }}
      />

      {/* Audit Log Modal */}
      <AuditLogViewer
        isOpen={isAuditOpen}
        onClose={() => setIsAuditOpen(false)}
        moduleName="attendance"
        auditLogs={auditLogs}
      />

      {/* Delete Confirm */}
      {confirmDelete && (
        <ConfirmDialog
          isOpen={Boolean(confirmDelete)}
          onClose={() => setConfirmDelete(null)}
          title="Permanently Delete Attendance Entry"
          message={`Are you sure you want to permanently delete attendance record for ${confirmDelete.name}?`}
          confirmLabel="Permanent Delete"
          onConfirm={async () => {
            const deleteId = confirmDelete.id;
            setAttendanceRecords((prev) => prev.filter((item) => item.id !== deleteId));
            try {
              await fetch(`/api/attendance?id=${deleteId}`, { method: 'DELETE' });
              router.refresh();
            } catch (err) {
              console.error('Failed to delete attendance from DB:', err);
            }
          }}
        />
      )}
    </div>
  );
}

