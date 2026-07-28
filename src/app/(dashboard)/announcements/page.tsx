'use client';

import React, { useState } from 'react';
import { useCrudStore } from '@/store/crud-store';
import { Announcement } from '@/types';
import { DataTable, Column } from '@/components/crud/DataTable';
import { CrudModal, FieldConfig } from '@/components/crud/CrudModal';
import { ImportModal } from '@/components/crud/ImportModal';
import { AuditLogViewer } from '@/components/crud/AuditLogViewer';
import { ConfirmDialog } from '@/components/crud/ConfirmDialog';
import { Megaphone, AlertCircle, Calendar, UserCheck } from 'lucide-react';

export default function AnnouncementsPage() {
  const {
    announcements,
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
  const [editingAnn, setEditingAnn] = useState<Announcement | null>(null);
  const [viewingAnn, setViewingAnn] = useState<Announcement | null>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string; permanent: boolean } | null>(null);

  React.useEffect(() => {
    fetch('/api/announcements')
      .then((res) => res.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          useCrudStore.setState({ announcements: res.data });
        }
      })
      .catch((err) => console.error('Failed to load announcements from DB:', err));
  }, []);

  const announcementFields: FieldConfig[] = [
    { name: 'title', label: 'Announcement Title', type: 'text', colSpan: 2 },
    { name: 'content', label: 'Full Announcement Content Body', type: 'textarea', colSpan: 2 },
    {
      name: 'priority',
      label: 'Urgency Priority',
      type: 'select',
      options: [
        { label: 'Normal', value: 'Normal' },
        { label: 'Important', value: 'Important' },
        { label: 'Urgent', value: 'Urgent' },
      ],
    },
    { name: 'author', label: 'Author Department / Office', type: 'text' },
    { name: 'date', label: 'Publication Date', type: 'date' },
    { name: 'scheduledFor', label: 'Scheduled Date (Optional)', type: 'date' },
    {
      name: 'status',
      label: 'Publication Status',
      type: 'select',
      options: [
        { label: 'Published', value: 'Published' },
        { label: 'Scheduled', value: 'Scheduled' },
        { label: 'Draft', value: 'Draft' },
      ],
    },
  ];

  const columns: Column<Announcement>[] = [
    {
      key: 'title',
      header: 'Announcement Title',
      sortable: true,
      render: (a) => (
        <div>
          <p className="font-extrabold text-slate-800 dark:text-slate-100">{a.title}</p>
          <p className="text-[11px] text-slate-400 truncate max-w-md">{a.content}</p>
        </div>
      ),
    },
    {
      key: 'priority',
      header: 'Priority',
      sortable: true,
      render: (a) => (
        <span
          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
            a.priority === 'Urgent'
              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
              : a.priority === 'Important'
              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
              : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
          }`}
        >
          {a.priority}
        </span>
      ),
    },
    { key: 'author', header: 'Author Office', sortable: true },
    { key: 'date', header: 'Date', sortable: true },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (a) => (
        <span
          className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
            a.status === 'Published'
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
              : a.status === 'Scheduled'
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          {a.status}
        </span>
      ),
    },
  ];

  const handleSaveAnnouncement = async (data: Record<string, any>, saveAndNew?: boolean) => {
    if (editingAnn) {
      updateRecord('announcements', editingAnn.id, data);
      try {
        await fetch('/api/announcements', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingAnn.id, ...data }),
        });
      } catch (err) {
        console.error('Failed to update announcement in DB:', err);
      }
      setEditingAnn(null);
    } else {
      const newAnn: Announcement = {
        id: `ann-${Date.now()}`,
        title: data.title,
        content: data.content,
        targetAudience: ['Students', 'Parents', 'Teachers', 'Staff'],
        priority: data.priority || 'Normal',
        author: data.author || 'Principal Office',
        date: data.date || new Date().toISOString().split('T')[0],
        scheduledFor: data.scheduledFor || undefined,
        status: data.status || 'Published',
      };
      addRecord('announcements', newAnn);

      try {
        await fetch('/api/announcements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: newAnn.id,
            title: newAnn.title,
            content: newAnn.content,
            category: newAnn.priority,
            targetAudience: 'All',
            postedBy: newAnn.author,
            date: newAnn.date,
            status: newAnn.status,
          }),
        });
      } catch (err) {
        console.error('Failed to save announcement to DB:', err);
      }

      if (!saveAndNew) setIsAddModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <DataTable
        title="Announcements & Broadcast Circulars"
        subtitle="School Directives, Event Circulars, Urgent Alerts & Scheduled Broadcasts"
        icon={<Megaphone className="w-6 h-6" />}
        columns={columns}
        data={announcements}
        addLabel="Create Announcement"
        exportFilename="ABS_Announcements"
        filterOptions={[
          {
            key: 'priority',
            label: 'Priority',
            options: [
              { label: 'Normal', value: 'Normal' },
              { label: 'Important', value: 'Important' },
              { label: 'Urgent', value: 'Urgent' },
            ],
          },
          {
            key: 'status',
            label: 'Status',
            options: [
              { label: 'Published', value: 'Published' },
              { label: 'Scheduled', value: 'Scheduled' },
              { label: 'Draft', value: 'Draft' },
            ],
          },
        ]}
        statusUpdateOptions={{
          field: 'status',
          label: 'Status',
          values: ['Published', 'Scheduled', 'Draft'],
        }}
        onAddClick={() => setIsAddModalOpen(true)}
        onEditClick={(a) => setEditingAnn(a)}
        onViewClick={(a) => setViewingAnn(a)}
        onSoftDeleteClick={(a) => setConfirmDelete({ id: a.id, name: a.title, permanent: false })}
        onRestoreClick={(a) => restoreRecord('announcements', a.id)}
        onPermanentDeleteClick={(a) => setConfirmDelete({ id: a.id, name: a.title, permanent: true })}
        onBulkDelete={(ids, soft) => bulkDeleteRecords('announcements', ids, soft)}
        onBulkStatusUpdate={(ids, field, val) => bulkUpdateStatus('announcements', ids, field, val)}
        onImportClick={() => setIsImportOpen(true)}
        onAuditLogsClick={() => setIsAuditOpen(true)}
      />

      {/* Add / Edit Modal */}
      <CrudModal
        isOpen={isAddModalOpen || Boolean(editingAnn)}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingAnn(null);
        }}
        title="Announcement Circular"
        fields={announcementFields}
        initialData={editingAnn ? { ...editingAnn } : null}
        onSave={handleSaveAnnouncement}
      />

      {/* Import Modal */}
      <ImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        title="Announcements"
        onImport={(rows) => importRecords('announcements', rows)}
      />

      {/* Audit Log Modal */}
      <AuditLogViewer
        isOpen={isAuditOpen}
        onClose={() => setIsAuditOpen(false)}
        moduleName="announcements"
        auditLogs={auditLogs}
      />

      {/* Delete Confirm */}
      {confirmDelete && (
        <ConfirmDialog
          isOpen={Boolean(confirmDelete)}
          onClose={() => setConfirmDelete(null)}
          title={confirmDelete.permanent ? 'Permanently Delete Announcement' : 'Move Announcement to Trash'}
          message={`Are you sure you want to ${
            confirmDelete.permanent ? 'permanently delete' : 'soft delete'
          } ${confirmDelete.name}?`}
          confirmLabel={confirmDelete.permanent ? 'Permanent Delete' : 'Move to Trash'}
          onConfirm={async () => {
            if (confirmDelete.permanent) {
              permanentDeleteRecord('announcements', confirmDelete.id);
              try {
                await fetch(`/api/announcements?id=${confirmDelete.id}`, { method: 'DELETE' });
              } catch (err) {
                console.error('Failed to delete announcement from DB:', err);
              }
            } else {
              softDeleteRecord('announcements', confirmDelete.id);
            }
          }}
        />
      )}

      {/* View Announcement Modal */}
      {viewingAnn && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-blue-600" /> Announcement Details
              </h3>
              <button onClick={() => setViewingAnn(null)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-start bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl">
                <div>
                  <strong className="text-base font-extrabold text-slate-900 dark:text-white block">{viewingAnn.title}</strong>
                  <span className="text-slate-400 text-[11px]">Author: {viewingAnn.author} • Date: {viewingAnn.date}</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold text-[10px]">
                  {viewingAnn.priority}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl space-y-1">
                <span className="font-bold text-slate-700 dark:text-slate-300 block">Content Body:</span>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">{viewingAnn.content}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
