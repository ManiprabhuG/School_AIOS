'use client';

export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCrudStore } from '@/store/crud-store';
import { Exam, ExamMark, ClassName } from '@/types';
import { DataTable, Column } from '@/components/crud/DataTable';
import { CrudModal, FieldConfig } from '@/components/crud/CrudModal';
import { ImportModal } from '@/components/crud/ImportModal';
import { AuditLogViewer } from '@/components/crud/AuditLogViewer';
import { ConfirmDialog } from '@/components/crud/ConfirmDialog';
import { exportToPDF } from '@/lib/export-utils';
import { BookOpen, Award, GraduationCap, FileCheck, Plus, Eye, FileText } from 'lucide-react';

export default function ExaminationsPage() {
  const router = useRouter();
  const {
    exams,
    examMarks,
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

  const [activeTab, setActiveTab] = useState<'exams' | 'marks'>('exams');
  const [isAddExamOpen, setIsAddExamOpen] = useState(false);
  const [isAddMarkOpen, setIsAddMarkOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [editingMark, setEditingMark] = useState<ExamMark | null>(null);
  const [viewingMark, setViewingMark] = useState<ExamMark | null>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string; target: 'exams' | 'examMarks'; permanent: boolean } | null>(null);

  React.useEffect(() => {
    fetch('/api/exams', { cache: 'no-store' })
      .then((res) => res.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          useCrudStore.setState({ exams: res.data });
        }
      })
      .catch((err) => console.error('Failed to load exams from DB:', err));
  }, []);

  const examFields: FieldConfig[] = [
    { name: 'name', label: 'Exam Title (e.g. Mid Term Examinations 2026)', type: 'text' },
    {
      name: 'examType',
      label: 'Exam Type',
      type: 'select',
      options: [
        { label: 'Unit Test', value: 'Unit Test' },
        { label: 'Mid Term', value: 'Mid Term' },
        { label: 'Quarterly', value: 'Quarterly' },
        { label: 'Half Yearly', value: 'Half Yearly' },
        { label: 'Annual', value: 'Annual' },
      ],
    },
    {
      name: 'className',
      label: 'Class Target',
      type: 'select',
      options: ['LKG', 'UKG', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'].map(
        (c) => ({ label: c, value: c })
      ),
    },
    { name: 'startDate', label: 'Start Date', type: 'date' },
    { name: 'endDate', label: 'End Date', type: 'date' },
    { name: 'totalMarks', label: 'Max Total Marks', type: 'number' },
    { name: 'passingMarks', label: 'Passing Marks Threshold', type: 'number' },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { label: 'Upcoming', value: 'Upcoming' },
        { label: 'Ongoing', value: 'Ongoing' },
        { label: 'Completed', value: 'Completed' },
      ],
    },
  ];

  const studentOptions = students.map((s) => ({ label: `${s.name} (#${s.rollNo})`, value: s.name }));

  const markFields: FieldConfig[] = [
    {
      name: 'examName',
      label: 'Examination Schedule',
      type: 'select',
      required: true,
      options: exams.map((e) => ({ label: e.name, value: e.name })),
    },
    {
      name: 'studentName',
      label: 'Student',
      type: 'select',
      required: true,
      options: studentOptions.length > 0 ? studentOptions : [{ label: 'Aarav Verma (#101)', value: 'Aarav Verma' }],
    },
    {
      name: 'className',
      label: 'Class',
      type: 'select',
      required: true,
      options: ['LKG', 'UKG', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'].map(
        (c) => ({ label: c, value: c })
      ),
    },
    { name: 'subject', label: 'Subject Name', type: 'text', required: true },
    { name: 'marksObtained', label: 'Marks Obtained', type: 'number', required: true },
    { name: 'maxMarks', label: 'Maximum Marks', type: 'number', required: true },
    { name: 'grade', label: 'Grade (e.g. A1, A2, B1)', type: 'text', required: true },
    { name: 'remarks', label: 'Teacher Evaluation Remarks', type: 'textarea', colSpan: 2 },
  ];

  const examColumns: Column<Exam>[] = [
    { key: 'name', header: 'Exam Title', sortable: true },
    { key: 'examType', header: 'Type', sortable: true },
    {
      key: 'className',
      header: 'Class',
      sortable: true,
      render: (e) => <span className="font-bold text-blue-600">{e.className}</span>,
    },
    { key: 'startDate', header: 'Start Date', sortable: true },
    { key: 'endDate', header: 'End Date', sortable: true },
    {
      key: 'totalMarks',
      header: 'Total / Pass Marks',
      render: (e) => (
        <span className="font-semibold text-slate-700 dark:text-slate-300">
          {e.totalMarks} / <span className="text-rose-600 font-bold">{e.passingMarks}</span>
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (e) => (
        <span
          className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
            e.status === 'Completed'
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
              : e.status === 'Ongoing'
              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
              : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
          }`}
        >
          {e.status}
        </span>
      ),
    },
  ];

  const markColumns: Column<ExamMark>[] = [
    { key: 'studentName', header: 'Student Name', sortable: true },
    { key: 'className', header: 'Class', sortable: true },
    { key: 'examName', header: 'Exam Schedule', sortable: true },
    { key: 'subject', header: 'Subject', sortable: true },
    {
      key: 'marksObtained',
      header: 'Marks Score',
      sortable: true,
      render: (m) => (
        <strong className="font-extrabold text-slate-900 dark:text-white">
          {m.marksObtained} / {m.maxMarks}
        </strong>
      ),
    },
    {
      key: 'grade',
      header: 'Grade',
      sortable: true,
      render: (m) => <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-black">{m.grade}</span>,
    },
    { key: 'remarks', header: 'Remarks' },
  ];

  const handleSaveExam = async (data: Record<string, any>, saveAndNew?: boolean) => {
    if (editingExam) {
      updateRecord('exams', editingExam.id, data);
      try {
        await fetch('/api/exams', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingExam.id, ...data }),
        });
      } catch (err) {
        console.error('Failed to update exam in DB:', err);
      }
      setEditingExam(null);
    } else {
      const newEx: Exam = {
        id: `ex-${Date.now()}`,
        name: data.name,
        examType: data.examType || 'Unit Test',
        className: data.className as ClassName,
        startDate: data.startDate || new Date().toISOString().split('T')[0],
        endDate: data.endDate || new Date().toISOString().split('T')[0],
        totalMarks: Number(data.totalMarks) || 100,
        passingMarks: Number(data.passingMarks) || 35,
        status: data.status || 'Upcoming',
      };
      addRecord('exams', newEx);

      try {
        await fetch('/api/exams', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: newEx.id,
            examCode: `EXM-2026-${Date.now().toString().slice(-4)}`,
            title: newEx.name,
            className: newEx.className,
            section: 'A',
            subject: newEx.examType,
            examDate: newEx.startDate,
            totalMarks: newEx.totalMarks,
            passingMarks: newEx.passingMarks,
            academicYear: '2025-2026',
            status: newEx.status,
          }),
        });
      } catch (err) {
        console.error('Failed to save exam to DB:', err);
      }

      if (!saveAndNew) setIsAddExamOpen(false);
    }
  };

  const handleSaveMark = (data: Record<string, any>, saveAndNew?: boolean) => {
    const selectedStd = students.find((s) => s.name === data.studentName);
    const selectedEx = exams.find((e) => e.name === data.examName);

    if (editingMark) {
      updateRecord('examMarks', editingMark.id, data);
      setEditingMark(null);
    } else {
      const newM: ExamMark = {
        id: `m-${Date.now()}`,
        examId: selectedEx?.id || 'ex-1',
        examName: data.examName || 'Unit Test 2026',
        studentId: selectedStd?.id || 'std-101',
        studentName: data.studentName,
        rollNo: selectedStd?.rollNo || '101',
        className: data.className as ClassName,
        subject: data.subject,
        marksObtained: Number(data.marksObtained) || 0,
        maxMarks: Number(data.maxMarks) || 100,
        grade: data.grade || 'A1',
        remarks: data.remarks || 'Good performance',
      };
      addRecord('examMarks', newM);
      if (!saveAndNew) setIsAddMarkOpen(false);
    }
  };

  const handleGenerateReportCard = (m: ExamMark) => {
    exportToPDF(
      `Report_Card_${m.studentName}_${m.subject}`,
      `ABS ACADEMIC REPORT CARD — ${m.studentName.toUpperCase()}`,
      [
        { header: 'Metric', dataKey: 'metric' },
        { header: 'Details', dataKey: 'val' },
      ],
      [
        { metric: 'Student Name', val: m.studentName },
        { metric: 'Roll Number', val: `#${m.rollNo}` },
        { metric: 'Class & Section', val: m.className },
        { metric: 'Examination', val: m.examName },
        { metric: 'Subject', val: m.subject },
        { metric: 'Marks Obtained', val: `${m.marksObtained} / ${m.maxMarks}` },
        { metric: 'Grade Awarded', val: m.grade },
        { metric: 'Teacher Remarks', val: m.remarks },
      ]
    );
  };

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl w-fit text-xs font-bold">
        <button
          onClick={() => setActiveTab('exams')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'exams' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Exam Timetables & Schedules
        </button>
        <button
          onClick={() => setActiveTab('marks')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'marks' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Marks, Grades & Report Cards
        </button>
      </div>

      {activeTab === 'exams' ? (
        <DataTable
          title="Examinations & Evaluation Schedules"
          subtitle="Unit Tests, Mid Terms, Annual Exams & Marksheet Entry"
          icon={<BookOpen className="w-6 h-6" />}
          columns={examColumns}
          data={exams}
          addLabel="Schedule New Exam"
          exportFilename="ABS_Exams_Schedule"
          filterOptions={[
            {
              key: 'examType',
              label: 'Type',
              options: [
                { label: 'Unit Test', value: 'Unit Test' },
                { label: 'Mid Term', value: 'Mid Term' },
                { label: 'Annual', value: 'Annual' },
              ],
            },
            {
              key: 'status',
              label: 'Status',
              options: [
                { label: 'Upcoming', value: 'Upcoming' },
                { label: 'Ongoing', value: 'Ongoing' },
                { label: 'Completed', value: 'Completed' },
              ],
            },
          ]}
          statusUpdateOptions={{
            field: 'status',
            label: 'Status',
            values: ['Upcoming', 'Ongoing', 'Completed'],
          }}
          onAddClick={() => setIsAddExamOpen(true)}
          onEditClick={(e) => setEditingExam(e)}
          onSoftDeleteClick={(e) => setConfirmDelete({ id: e.id, name: e.name, target: 'exams', permanent: false })}
          onRestoreClick={(e) => restoreRecord('exams', e.id)}
          onPermanentDeleteClick={(e) => setConfirmDelete({ id: e.id, name: e.name, target: 'exams', permanent: true })}
          onBulkDelete={(ids, soft) => bulkDeleteRecords('exams', ids, soft)}
          onBulkStatusUpdate={(ids, field, val) => bulkUpdateStatus('exams', ids, field, val)}
          onImportClick={() => setIsImportOpen(true)}
          onAuditLogsClick={() => setIsAuditOpen(true)}
        />
      ) : (
        <DataTable
          title="Marks, Grades & Report Cards"
          subtitle="Subject-wise Evaluation Scores & Automatic Grade Dossiers"
          icon={<Award className="w-6 h-6" />}
          columns={markColumns}
          data={examMarks}
          addLabel="Enter Exam Marks"
          exportFilename="ABS_Exam_Marks_Grades"
          filterOptions={[
            {
              key: 'className',
              label: 'Class',
              options: ['LKG', 'UKG', '1st', '2nd', '5th', '10th', '12th'].map((c) => ({ label: c, value: c })),
            },
          ]}
          onAddClick={() => setIsAddMarkOpen(true)}
          onEditClick={(m) => setEditingMark(m)}
          onViewClick={(m) => setViewingMark(m)}
          onSoftDeleteClick={(m) => setConfirmDelete({ id: m.id, name: `${m.studentName} - ${m.subject}`, target: 'examMarks', permanent: false })}
          onRestoreClick={(m) => restoreRecord('examMarks', m.id)}
          onPermanentDeleteClick={(m) => setConfirmDelete({ id: m.id, name: `${m.studentName} - ${m.subject}`, target: 'examMarks', permanent: true })}
          onBulkDelete={(ids, soft) => bulkDeleteRecords('examMarks', ids, soft)}
          onImportClick={() => setIsImportOpen(true)}
          onAuditLogsClick={() => setIsAuditOpen(true)}
        />
      )}

      {/* Add / Edit Exam Modal */}
      <CrudModal
        isOpen={isAddExamOpen || Boolean(editingExam)}
        onClose={() => {
          setIsAddExamOpen(false);
          setEditingExam(null);
        }}
        title="Exam Schedule"
        fields={examFields}
        initialData={editingExam ? { ...editingExam } : null}
        onSave={handleSaveExam}
      />

      {/* Add / Edit Marks Modal */}
      <CrudModal
        isOpen={isAddMarkOpen || Boolean(editingMark)}
        onClose={() => {
          setIsAddMarkOpen(false);
          setEditingMark(null);
        }}
        title="Student Exam Marks"
        fields={markFields}
        initialData={editingMark ? { ...editingMark } : null}
        onSave={handleSaveMark}
      />

      {/* Import Modal */}
      <ImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        title={activeTab === 'exams' ? 'Exams' : 'Marks'}
        onImport={(rows) => importRecords(activeTab === 'exams' ? 'exams' : 'examMarks', rows)}
      />

      {/* Audit Log Modal */}
      <AuditLogViewer
        isOpen={isAuditOpen}
        onClose={() => setIsAuditOpen(false)}
        moduleName={activeTab === 'exams' ? 'exams' : 'examMarks'}
        auditLogs={auditLogs}
      />

      {/* Delete Confirm */}
      {confirmDelete && (
        <ConfirmDialog
          isOpen={Boolean(confirmDelete)}
          onClose={() => setConfirmDelete(null)}
          title={confirmDelete.permanent ? 'Permanently Purge Record' : 'Move Record to Trash'}
          message={`Are you sure you want to ${
            confirmDelete.permanent ? 'permanently delete' : 'soft delete'
          } ${confirmDelete.name}?`}
          confirmLabel={confirmDelete.permanent ? 'Permanent Delete' : 'Move to Trash'}
          onConfirm={async () => {
            if (confirmDelete.permanent) {
              permanentDeleteRecord(confirmDelete.target, confirmDelete.id);
              try {
                await fetch(`/api/exams?id=${confirmDelete.id}`, { method: 'DELETE' });
                router.refresh();
              } catch (err) {
                console.error('Failed to delete exam from DB:', err);
              }
            } else {
              softDeleteRecord(confirmDelete.target, confirmDelete.id);
            }
          }}

        />
      )}

      {/* View Marks Dossier & Generate Report Card Modal */}
      {viewingMark && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-600" /> Student Evaluation Dossier
              </h3>
              <button onClick={() => setViewingMark(null)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl space-y-1">
                <span className="text-slate-400 block text-[11px]">{viewingMark.examName}</span>
                <strong className="text-lg font-extrabold text-slate-900 dark:text-white">{viewingMark.studentName}</strong>
                <p className="text-2xl font-black text-emerald-600 pt-1">
                  {viewingMark.marksObtained} / {viewingMark.maxMarks} ({viewingMark.grade})
                </p>
              </div>

              <div className="space-y-1">
                <p>Class: <strong>{viewingMark.className}</strong></p>
                <p>Subject: <strong>{viewingMark.subject}</strong></p>
                <p>Evaluation Remarks: <em>{viewingMark.remarks}</em></p>
              </div>

              <button
                onClick={() => handleGenerateReportCard(viewingMark)}
                className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center gap-1.5 shadow-md hover:bg-blue-500"
              >
                <FileText className="w-4 h-4" /> Download Official PDF Report Card
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
