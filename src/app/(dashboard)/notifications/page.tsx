'use client';

export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCrudStore } from '@/store/crud-store';
import { SystemNotification } from '@/types';
import { DataTable, Column } from '@/components/crud/DataTable';
import { CrudModal, FieldConfig } from '@/components/crud/CrudModal';
import { ImportModal } from '@/components/crud/ImportModal';
import { AuditLogViewer } from '@/components/crud/AuditLogViewer';
import { ConfirmDialog } from '@/components/crud/ConfirmDialog';
import { Bell, Info, AlertTriangle, CheckCircle, AlertOctagon, Check, Send } from 'lucide-react';

export default function NotificationsPage() {
  const router = useRouter();
  const {
    notifications,
    auditLogs,
    addRecord,
    updateRecord,
    softDeleteRecord,
    restoreRecord,
    permanentDeleteRecord,
    bulkDeleteRecords,
    importRecords,
  } = useCrudStore();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingNotif, setEditingNotif] = useState<SystemNotification | null>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string; permanent: boolean } | null>(null);

  React.useEffect(() => {
    fetch('/api/notifications', { cache: 'no-store' })
      .then((res) => res.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          useCrudStore.setState({ notifications: res.data });
        }
      })
      .catch((err) => console.error('Failed to load notifications from DB:', err));
  }, []);

  const notifFields: FieldConfig[] = [
    { name: 'title', label: 'Notification Headline Title', type: 'text' },
    { name: 'message', label: 'Broadcast Message Details', type: 'textarea', colSpan: 2 },
    {
      name: 'category',
      label: 'Notification Category',
      type: 'select',
      options: [
        { label: 'Fee Due', value: 'Fee Due' },
        { label: 'Birthday', value: 'Birthday' },
        { label: 'Attendance', value: 'Attendance' },
        { label: 'Exam', value: 'Exam' },
        { label: 'Inventory', value: 'Inventory' },
        { label: 'Purchase', value: 'Purchase' },
        { label: 'Announcement', value: 'Announcement' },
      ],
    },
    {
      name: 'type',
      label: 'Notification Alert Type',
      type: 'select',
      options: [
        { label: 'Information (Info)', value: 'info' },
        { label: 'Warning Alert', value: 'warning' },
        { label: 'Success Banner', value: 'success' },
        { label: 'Critical Error', value: 'error' },
      ],
    },
  ];

  const columns: Column<SystemNotification>[] = [
    {
      key: 'title',
      header: 'Title & Message',
      sortable: true,
      render: (n) => (
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5">
            {n.type === 'warning' ? (
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            ) : n.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-500" />
            ) : n.type === 'error' ? (
              <AlertOctagon className="w-4 h-4 text-rose-500" />
            ) : (
              <Info className="w-4 h-4 text-blue-500" />
            )}
          </div>
          <div>
            <p className="font-extrabold text-slate-800 dark:text-slate-100">{n.title}</p>
            <p className="text-[11px] text-slate-500 max-w-lg">{n.message}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      sortable: true,
      render: (n) => (
        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-bold text-xs text-slate-700 dark:text-slate-300">
          {n.category}
        </span>
      ),
    },
    { key: 'timestamp', header: 'Timestamp', sortable: true },
    {
      key: 'read',
      header: 'Read Status',
      sortable: true,
      render: (n) => (
        <button
          onClick={() => updateRecord('notifications', n.id, { read: !n.read })}
          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
            n.read
              ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
              : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
          }`}
        >
          {n.read ? 'Read' : 'Unread (Click to toggle)'}
        </button>
      ),
    },
  ];

  const handleSaveNotif = async (data: Record<string, any>, saveAndNew?: boolean) => {
    if (editingNotif) {
      updateRecord('notifications', editingNotif.id, data);
      try {
        await fetch('/api/notifications', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingNotif.id, ...data }),
        });
      } catch (err) {
        console.error('Failed to update notification in DB:', err);
      }
      setEditingNotif(null);
    } else {
      const newN: SystemNotification = {
        id: `nt-${Date.now()}`,
        title: data.title,
        message: data.message,
        type: data.type || 'info',
        timestamp: 'Just now',
        read: false,
        category: data.category || 'Announcement',
      };
      addRecord('notifications', newN);

      try {
        await fetch('/api/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: newN.id,
            title: newN.title,
            message: newN.message,
            type: newN.type,
            target: 'All',
            read: newN.read,
            timestamp: newN.timestamp,
          }),
        });
      } catch (err) {
        console.error('Failed to save notification to DB:', err);
      }

      if (!saveAndNew) setIsAddModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <DataTable
        title="System Notifications & Broadcast Alerts"
        subtitle="SMS, Email & In-App Notification Logs & Automated System Alerts"
        icon={<Bell className="w-6 h-6" />}
        columns={columns}
        data={notifications}
        addLabel="Broadcast Notification"
        exportFilename="ABS_Notifications"
        filterOptions={[
          {
            key: 'category',
            label: 'Category',
            options: [
              { label: 'Fee Due', value: 'Fee Due' },
              { label: 'Attendance', value: 'Attendance' },
              { label: 'Exam', value: 'Exam' },
              { label: 'Inventory', value: 'Inventory' },
              { label: 'Announcement', value: 'Announcement' },
            ],
          },
          {
            key: 'type',
            label: 'Type',
            options: [
              { label: 'info', value: 'info' },
              { label: 'warning', value: 'warning' },
              { label: 'success', value: 'success' },
              { label: 'error', value: 'error' },
            ],
          },
        ]}
        onAddClick={() => setIsAddModalOpen(true)}
        onEditClick={(n) => setEditingNotif(n)}
        onSoftDeleteClick={(n) => setConfirmDelete({ id: n.id, name: n.title, permanent: false })}
        onRestoreClick={(n) => restoreRecord('notifications', n.id)}
        onPermanentDeleteClick={(n) => setConfirmDelete({ id: n.id, name: n.title, permanent: true })}
        onBulkDelete={(ids, soft) => bulkDeleteRecords('notifications', ids, soft)}
        onImportClick={() => setIsImportOpen(true)}
        onAuditLogsClick={() => setIsAuditOpen(true)}
      />

      {/* Add / Edit Modal */}
      <CrudModal
        isOpen={isAddModalOpen || Boolean(editingNotif)}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingNotif(null);
        }}
        title="Notification Broadcast"
        fields={notifFields}
        initialData={editingNotif ? { ...editingNotif } : null}
        onSave={handleSaveNotif}
      />

      {/* Import Modal */}
      <ImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        title="Notifications"
        onImport={(rows) => importRecords('notifications', rows)}
      />

      {/* Audit Log Modal */}
      <AuditLogViewer
        isOpen={isAuditOpen}
        onClose={() => setIsAuditOpen(false)}
        moduleName="notifications"
        auditLogs={auditLogs}
      />

      {/* Delete Confirm */}
      {confirmDelete && (
        <ConfirmDialog
          isOpen={Boolean(confirmDelete)}
          onClose={() => setConfirmDelete(null)}
          title={confirmDelete.permanent ? 'Permanently Purge Notification' : 'Move Notification to Trash'}
          message={`Are you sure you want to ${
            confirmDelete.permanent ? 'permanently delete' : 'soft delete'
          } notification ${confirmDelete.name}?`}
          confirmLabel={confirmDelete.permanent ? 'Permanent Delete' : 'Move to Trash'}
          onConfirm={async () => {
            if (confirmDelete.permanent) {
              permanentDeleteRecord('notifications', confirmDelete.id);
              try {
                await fetch(`/api/notifications?id=${confirmDelete.id}`, { method: 'DELETE' });
                router.refresh();
              } catch (err) {
                console.error('Failed to delete notification from DB:', err);
              }
            } else {
              softDeleteRecord('notifications', confirmDelete.id);
            }
          }}
        />
      )}
    </div>
  );
}
