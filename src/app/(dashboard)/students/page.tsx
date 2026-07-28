'use client';

import React, { useState } from 'react';
import { useCrudStore } from '@/store/crud-store';
import { Student, ClassName, Section } from '@/types';
import { DataTable, Column } from '@/components/crud/DataTable';
import { CrudModal, FieldConfig } from '@/components/crud/CrudModal';
import { ImportModal } from '@/components/crud/ImportModal';
import { AuditLogViewer } from '@/components/crud/AuditLogViewer';
import { ConfirmDialog } from '@/components/crud/ConfirmDialog';
import { formatCurrency } from '@/lib/utils';
import { GraduationCap, Phone, Mail, MapPin, Bus, Eye } from 'lucide-react';

export default function StudentManagementPage() {
  const {
    students,
    auditLogs,
    addRecord,
    updateRecord,
    softDeleteRecord,
    restoreRecord,
    permanentDeleteRecord,
    bulkDeleteRecords,
    bulkUpdateStatus,
    importRecords,
  } = useCrudStore();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string; permanent: boolean } | null>(null);

  React.useEffect(() => {
    fetch('/api/students')
      .then((res) => res.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          useCrudStore.setState((state) => {
            const dbIds = new Set(res.data.map((d: any) => d.id));
            const localOnly = state.students.filter((s) => !dbIds.has(s.id));
            return { students: res.data.length > 0 ? [...res.data, ...localOnly] : state.students };
          });
        }
      })
      .catch((err) => console.error('Failed to load students from DB:', err));
  }, []);

  const [availableSections, setAvailableSections] = useState<string[]>(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']);
  const [isAddSectionModalOpen, setIsAddSectionModalOpen] = useState(false);
  const [newSectionInput, setNewSectionInput] = useState('');

  const handleCreateNewSection = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSection = newSectionInput.trim().toUpperCase();
    if (cleanSection && !availableSections.includes(cleanSection)) {
      setAvailableSections((prev) => [...prev, cleanSection]);
    }
    setNewSectionInput('');
    setIsAddSectionModalOpen(false);
  };

  const studentFields: FieldConfig[] = [
    { name: 'firstName', label: 'First Name', type: 'text' },
    { name: 'lastName', label: 'Last Name', type: 'text' },
    {
      name: 'className',
      label: 'Class',
      type: 'select',
      options: ['LKG', 'UKG', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'].map(
        (c) => ({ label: c, value: c })
      ),
    },
    {
      name: 'section',
      label: 'Section',
      type: 'select',
      options: availableSections.map((s) => ({ label: `Section ${s}`, value: s })),
      addonButton: {
        label: '+',
        onClick: () => setIsAddSectionModalOpen(true),
      },
    },
    {
      name: 'course',
      label: 'Course / Stream (11th & 12th)',
      type: 'select',
      options: [
        { label: 'Bio-Maths', value: 'Bio-Maths' },
        { label: 'Computer Science', value: 'Computer Science' },
        { label: 'Commerce', value: 'Commerce' },
        { label: 'Arts', value: 'Arts' },
        { label: 'Pure Science', value: 'Pure Science' },
        { label: 'Vocational', value: 'Vocational' },
      ],
      hidden: (formData) => formData.className !== '11th' && formData.className !== '12th',
    },
    { name: 'dob', label: 'Date of Birth', type: 'date' },
    {
      name: 'gender',
      label: 'Gender',
      type: 'select',
      options: [
        { label: 'Male', value: 'Male' },
        { label: 'Female', value: 'Female' },
        { label: 'Other', value: 'Other' },
      ],
    },
    {
      name: 'bloodGroup',
      label: 'Blood Group',
      type: 'select',
      options: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((b) => ({ label: b, value: b })),
    },
    { name: 'fatherName', label: 'Father Name', type: 'text' },
    { name: 'motherName', label: 'Mother Name', type: 'text' },
    { name: 'parentPhone', label: 'Parent Phone', type: 'phone' },
    { name: 'parentEmail', label: 'Parent Email', type: 'email' },
    { name: 'address', label: 'Residential Address', type: 'textarea', colSpan: 2 },
    { name: 'busRoute', label: 'Bus Route (Optional)', type: 'text' },
    { name: 'totalFees', label: 'Annual Fee (₹)', type: 'number' },
    { name: 'photo', label: 'Student Photo', type: 'image' },
  ];

  const columns: Column<Student>[] = [
    {
      key: 'name',
      header: 'Student',
      sortable: true,
      render: (s) => (
        <div className="flex items-center gap-3">
          <img
            src={s.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
            alt={s.name}
            className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
          />
          <div>
            <p className="font-bold text-slate-800 dark:text-slate-100">{s.name || `${s.firstName} ${s.lastName}`}</p>
            <p className="text-[11px] text-slate-400">
              {s.gender} • DOB: {s.dob}
            </p>
          </div>
        </div>
      ),
    },
    { key: 'admissionNo', header: 'Admission No', sortable: true },
    {
      key: 'className',
      header: 'Class & Sec',
      sortable: true,
      render: (s) => (
        <div className="flex flex-col gap-0.5 items-start">
          <span className="px-2 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold text-xs">
            {s.className}-{s.section}
          </span>
          {s.course && (s.className === '11th' || s.className === '12th') && (
            <span className="px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 font-bold text-[10px]">
              {s.course}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'rollNo',
      header: 'Roll No',
      sortable: true,
      render: (s) => <span className="font-semibold text-slate-700 dark:text-slate-300">#{s.rollNo}</span>,
    },
    { key: 'parentPhone', header: 'Parent Phone' },
    {
      key: 'attendancePercent',
      header: 'Attendance',
      sortable: true,
      render: (s) => <span className="font-bold text-emerald-600 dark:text-emerald-400">{s.attendancePercent ?? 100}%</span>,
    },
    {
      key: 'feeStatus',
      header: 'Fee Status',
      sortable: true,
      render: (s) => (
        <span
          className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
            s.feeStatus === 'Paid'
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
              : s.feeStatus === 'Partial'
              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
              : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
          }`}
        >
          {s.feeStatus || 'Pending'}
        </span>
      ),
    },
  ];

  const handleSaveStudent = async (data: Record<string, any>, saveAndNew?: boolean) => {
    const isHigherSec = data.className === '11th' || data.className === '12th';
    const courseValue = isHigherSec ? (data.course || 'Bio-Maths') : '';

    if (editingStudent) {
      const updatedData = {
        ...data,
        name: `${data.firstName} ${data.lastName}`,
        course: courseValue,
      };
      updateRecord('students', editingStudent.id, updatedData);
      try {
        await fetch('/api/students', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingStudent.id, ...updatedData }),
        });
      } catch (err) {
        console.error('Failed to update student in database:', err);
      }
      setEditingStudent(null);
    } else {
      const newStudent: Student = {
        id: `std-${Date.now()}`,
        admissionNo: `ABS-2026-${Math.floor(100 + Math.random() * 900)}`,
        rollNo: `${students.length + 101}`,
        firstName: data.firstName,
        lastName: data.lastName,
        name: `${data.firstName} ${data.lastName}`,
        className: data.className,
        section: data.section,
        course: courseValue,
        dob: data.dob,
        gender: data.gender,
        bloodGroup: data.bloodGroup || 'O+',
        photo: data.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        fatherName: data.fatherName,
        motherName: data.motherName,
        parentPhone: data.parentPhone,
        parentEmail: data.parentEmail || '',
        address: data.address || '',
        busRoute: data.busRoute || '',
        feeStatus: 'Pending',
        totalFees: Number(data.totalFees) || 60000,
        paidFees: 0,
        dueFees: Number(data.totalFees) || 60000,
        attendancePercent: 100,
        joiningDate: new Date().toISOString().split('T')[0],
        status: 'Active',
      };
      addRecord('students', newStudent);

      try {
        const res = await fetch('/api/students', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newStudent),
        });
        const resJson = await res.json();
        if (resJson.success && resJson.data) {
          updateRecord('students', newStudent.id, resJson.data);
        }
      } catch (err) {
        console.error('Failed to save student to database:', err);
      }

      if (!saveAndNew) setIsAddModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <DataTable
        title="Student Roster Management"
        subtitle="Full Admissions, Enrolments & Academic History CRUD System"
        icon={<GraduationCap className="w-6 h-6" />}
        columns={columns}
        data={students}
        addLabel="Register New Student"
        exportFilename="ABS_Students_List"
        filterOptions={[
          {
            key: 'className',
            label: 'Class',
            options: ['LKG', 'UKG', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'].map(
              (c) => ({ label: c, value: c })
            ),
          },
          {
            key: 'feeStatus',
            label: 'Fee Status',
            options: [
              { label: 'Paid', value: 'Paid' },
              { label: 'Partial', value: 'Partial' },
              { label: 'Pending', value: 'Pending' },
            ],
          },
        ]}
        statusUpdateOptions={{
          field: 'feeStatus',
          label: 'Fee Status',
          values: ['Paid', 'Partial', 'Pending'],
        }}
        onAddClick={() => setIsAddModalOpen(true)}
        onEditClick={(s) => setEditingStudent(s)}
        onViewClick={(s) => setViewingStudent(s)}
        onSoftDeleteClick={(s) => setConfirmDelete({ id: s.id, name: s.name, permanent: false })}
        onRestoreClick={(s) => restoreRecord('students', s.id)}
        onPermanentDeleteClick={(s) => setConfirmDelete({ id: s.id, name: s.name, permanent: true })}
        onBulkDelete={(ids, soft) => bulkDeleteRecords('students', ids, soft)}
        onBulkStatusUpdate={(ids, field, val) => bulkUpdateStatus('students', ids, field, val)}
        onImportClick={() => setIsImportOpen(true)}
        onAuditLogsClick={() => setIsAuditOpen(true)}
      />

      {/* Add / Edit Modal */}
      <CrudModal
        isOpen={isAddModalOpen || Boolean(editingStudent)}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingStudent(null);
        }}
        title="Student Record"
        fields={studentFields}
        initialData={editingStudent ? { ...editingStudent } : null}
        onSave={handleSaveStudent}
      />

      {/* Import Modal */}
      <ImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        title="Students"
        onImport={(rows) => importRecords('students', rows)}
      />

      {/* Audit Log Modal */}
      <AuditLogViewer
        isOpen={isAuditOpen}
        onClose={() => setIsAuditOpen(false)}
        moduleName="students"
        auditLogs={auditLogs}
      />

      {/* Delete Confirmation */}
      {confirmDelete && (
        <ConfirmDialog
          isOpen={Boolean(confirmDelete)}
          onClose={() => setConfirmDelete(null)}
          title={confirmDelete.permanent ? 'Permanently Delete Student' : 'Move Student to Trash'}
          message={`Are you sure you want to ${
            confirmDelete.permanent ? 'permanently erase' : 'soft delete'
          } ${confirmDelete.name}?`}
          confirmLabel={confirmDelete.permanent ? 'Permanent Delete' : 'Move to Trash'}
          onConfirm={async () => {
            if (confirmDelete.permanent) {
              permanentDeleteRecord('students', confirmDelete.id);
              try {
                await fetch(`/api/students?id=${confirmDelete.id}`, { method: 'DELETE' });
              } catch (err) {
                console.error('Failed to delete student from database:', err);
              }
            } else {
              softDeleteRecord('students', confirmDelete.id);
            }
          }}
        />
      )}

      {/* View Profile Drawer */}
      {viewingStudent && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-600" /> Student Profile & Academic Record
              </h3>
              <button onClick={() => setViewingStudent(null)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center space-y-2 border-r border-slate-100 dark:border-slate-800 pr-4">
                <img
                  src={
                    viewingStudent.photo ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                  }
                  alt={viewingStudent.name}
                  className="w-24 h-24 rounded-full object-cover mx-auto ring-4 ring-blue-500/20"
                />
                <h4 className="font-extrabold text-slate-900 dark:text-white text-base">{viewingStudent.name}</h4>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-600 text-xs font-bold">
                  Class {viewingStudent.className}-{viewingStudent.section}
                </span>
                {viewingStudent.course && (viewingStudent.className === '11th' || viewingStudent.className === '12th') && (
                  <div className="pt-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-xs font-bold">
                      Course: {viewingStudent.course}
                    </span>
                  </div>
                )}
                <p className="text-xs text-slate-400">Roll #{viewingStudent.rollNo}</p>
              </div>

              <div className="col-span-2 space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-400 block">Admission Number</span>
                    <strong className="text-slate-800 dark:text-slate-200 font-mono">{viewingStudent.admissionNo}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Blood Group</span>
                    <strong className="text-slate-800 dark:text-slate-200">{viewingStudent.bloodGroup || 'O+'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Father Name</span>
                    <strong className="text-slate-800 dark:text-slate-200">{viewingStudent.fatherName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Mother Name</span>
                    <strong className="text-slate-800 dark:text-slate-200">{viewingStudent.motherName}</strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Phone className="w-3.5 h-3.5 text-blue-500" /> {viewingStudent.parentPhone}
                  </div>
                  {viewingStudent.parentEmail && (
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Mail className="w-3.5 h-3.5 text-blue-500" /> {viewingStudent.parentEmail}
                    </div>
                  )}
                  {viewingStudent.address && (
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-blue-500" /> {viewingStudent.address}
                    </div>
                  )}
                  {viewingStudent.busRoute && (
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Bus className="w-3.5 h-3.5 text-amber-500" /> {viewingStudent.busRoute}
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between">
                  <div>
                    <span className="text-slate-400 block">Total Annual Fee</span>
                    <strong className="text-slate-800 dark:text-slate-200">{formatCurrency(viewingStudent.totalFees)}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Due Fees</span>
                    <strong className="text-rose-600 font-bold">{formatCurrency(viewingStudent.dueFees)}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Section Quick Modal */}
      {isAddSectionModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Add New Section</h3>
            <form onSubmit={handleCreateNewSection} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Section Name (e.g. A, B, C, D, E, F, G...)
                </label>
                <input
                  type="text"
                  autoFocus
                  value={newSectionInput}
                  onChange={(e) => setNewSectionInput(e.target.value)}
                  placeholder="Enter Section Name"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-bold focus:outline-none"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddSectionModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md"
                >
                  Save Section
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
