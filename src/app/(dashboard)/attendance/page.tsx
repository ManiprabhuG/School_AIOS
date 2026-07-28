'use client';

import React, { useState, useMemo } from 'react';
import { useCrudStore } from '@/store/crud-store';
import { AttendanceRecord } from '@/types';
import { DataTable, Column } from '@/components/crud/DataTable';
import { CrudModal, FieldConfig } from '@/components/crud/CrudModal';
import { ImportModal } from '@/components/crud/ImportModal';
import { AuditLogViewer } from '@/components/crud/AuditLogViewer';
import { ConfirmDialog } from '@/components/crud/ConfirmDialog';
import { CalendarCheck } from 'lucide-react';

export default function AttendancePage() {
  const {
    students,
    staff,
    auditLogs,
  } = useCrudStore();

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);

  React.useEffect(() => {
    fetch('/api/attendance')
      .then((res) => res.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          setAttendanceRecords(res.data);
        } else {
          const today = new Date().toISOString().split('T')[0];
          const stdAtt: AttendanceRecord[] = students.map((s, idx) => ({
            id: `att-std-${s.id}`,
            date: today,
            entityId: s.id,
            entityType: 'Student',
            name: s.name,
            className: `${s.className}-${s.section}`,
            status: idx % 4 === 0 ? 'Absent' : idx % 5 === 0 ? 'Late' : 'Present',
            remarks: idx % 4 === 0 ? 'Parent informed via SMS' : 'Present in class',
          }));
          const stfAtt: AttendanceRecord[] = staff.map((st, idx) => ({
            id: `att-stf-${st.id}`,
            date: today,
            entityId: st.id,
            entityType: 'Staff',
            staffType: idx % 2 === 0 ? 'Teaching' : 'Non-Teaching',
            department: st.department || 'Mathematics',
            name: st.name,
            className: st.department,
            status: idx === 1 ? 'Leave' : 'Present',
            remarks: idx === 1 ? 'Casual Leave Approved' : 'Present in school campus',
          }));
          setAttendanceRecords([...stdAtt, ...stfAtt]);
        }
      })
      .catch((err) => console.error('Failed to load attendance from DB:', err));
  }, [students, staff]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAtt, setEditingAtt] = useState<AttendanceRecord | null>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string; permanent: boolean } | null>(null);

  const [currentEntityTypeFilter, setCurrentEntityTypeFilter] = useState<string>('Student');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('All');
  const [selectedSectionFilter, setSelectedSectionFilter] = useState<string>('All');

  const classSectionsMap: Record<string, string[]> = {
    LKG: ['A', 'B', 'C'],
    UKG: ['A', 'B', 'C'],
    '1st': ['A', 'B', 'C', 'D'],
    '2nd': ['A', 'B', 'C', 'D'],
    '3rd': ['A', 'B', 'C', 'D', 'E'],
    '4th': ['A', 'B', 'C', 'D', 'E'],
    '5th': ['A', 'B', 'C', 'D', 'E', 'F'],
    '6th': ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
    '7th': ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
    '8th': ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
    '9th': ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
    '10th': ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
    '11th': ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'],
    '12th': ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'],
  };

  const attendanceFields: FieldConfig[] = [
    {
      name: 'date',
      label: 'Attendance Date *',
      type: 'date',
      defaultValue: new Date().toISOString().split('T')[0],
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
      // Department is ONLY shown when Person Category is Staff AND Staff Type is Teaching!
      hidden: (formData) => formData.entityType !== 'Staff' || formData.staffType !== 'Teaching',
    },
    {
      name: 'name',
      label: 'Full Name *',
      type: 'text',
      placeholder: 'Click cursor to select or type name...',
    },
    {
      name: 'className',
      label: 'Class & Section (Students)',
      type: 'select',
      options: ['LKG-A', 'UKG-A', '1st-A', '2nd-A', '3rd-A', '4th-A', '5th-A', '6th-A', '7th-A', '8th-A', '9th-A', '10th-A', '11th-A', '12th-A'].map(
        (c) => ({ label: `Class ${c}`, value: c })
      ),
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
      header: 'Class / Staff Details',
      sortable: true,
      render: (a) => (
        <div className="text-xs">
          {a.entityType === 'Staff' ? (
            <div>
              <span className="font-bold text-slate-900 dark:text-slate-100">{a.staffType || 'Staff'}</span>
              {a.department && <span className="text-slate-500 block text-[11px]">Dept: {a.department}</span>}
            </div>
          ) : (
            <span className="font-semibold text-slate-700 dark:text-slate-300">{a.className}</span>
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

  const getDynamicSections = (cls: string) => {
    if (cls && cls !== 'All' && classSectionsMap[cls]) {
      return classSectionsMap[cls];
    }
    return ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  };

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
        key: 'classOnly',
        label: 'Class Filter',
        options: ['LKG', 'UKG', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'].map(
          (c) => ({ label: `Class ${c}`, value: c })
        ),
      },
      {
        key: 'sectionOnly',
        label: 'Section Filter',
        options: getDynamicSections(selectedClassFilter).map((s) => ({ label: `Section ${s}`, value: s })),
      },
      statusFilterOption,
    ];
  }, [currentEntityTypeFilter, selectedClassFilter]);

  // Filtered records considering dependent filters
  const filteredAttendanceRecords = useMemo(() => {
    return attendanceRecords.filter((rec) => {
      if (currentEntityTypeFilter && currentEntityTypeFilter !== 'All') {
        if (rec.entityType !== currentEntityTypeFilter) return false;
      }

      if (currentEntityTypeFilter === 'Student') {
        const clsName = rec.className || '';
        if (selectedClassFilter && selectedClassFilter !== 'All') {
          if (!clsName.toLowerCase().includes(selectedClassFilter.toLowerCase())) return false;
        }
        if (selectedSectionFilter && selectedSectionFilter !== 'All') {
          if (!clsName.toLowerCase().includes(selectedSectionFilter.toLowerCase())) return false;
        }
      }

      return true;
    });
  }, [attendanceRecords, currentEntityTypeFilter, selectedClassFilter, selectedSectionFilter]);

  const handleFilterChange = (filters: Record<string, string>) => {
    if (filters.entityType !== undefined && filters.entityType !== currentEntityTypeFilter) {
      setCurrentEntityTypeFilter(filters.entityType || 'Student');
    }
    if (filters.classOnly !== undefined) {
      setSelectedClassFilter(filters.classOnly || 'All');
    }
    if (filters.sectionOnly !== undefined) {
      setSelectedSectionFilter(filters.sectionOnly || 'All');
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
        className: data.className || '',
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

  return (
    <div className="space-y-6">
      <DataTable
        title="Student & Staff Attendance Register"
        subtitle="Daily Attendance Marking, Late Check-Ins, Leave Submissions & Muster Roll"
        icon={<CalendarCheck className="w-6 h-6" />}
        columns={columns}
        data={filteredAttendanceRecords}
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

      {/* Add / Edit Modal */}
      <CrudModal
        isOpen={isAddModalOpen || Boolean(editingAtt)}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingAtt(null);
        }}
        title="Attendance Record"
        fields={attendanceFields}
        initialData={editingAtt ? { ...editingAtt } : null}
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
            } catch (err) {
              console.error('Failed to delete attendance from DB:', err);
            }
          }}
        />
      )}
    </div>
  );
}

