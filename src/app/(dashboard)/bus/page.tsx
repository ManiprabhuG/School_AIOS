'use client';

export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCrudStore } from '@/store/crud-store';
import { BusRoute } from '@/types';
import { DataTable, Column } from '@/components/crud/DataTable';
import { CrudModal, FieldConfig } from '@/components/crud/CrudModal';
import { ImportModal } from '@/components/crud/ImportModal';
import { AuditLogViewer } from '@/components/crud/AuditLogViewer';
import { ConfirmDialog } from '@/components/crud/ConfirmDialog';
import { formatCurrency } from '@/lib/utils';
import { Bus, Phone, Users, ShieldAlert, Wrench } from 'lucide-react';

export default function BusManagementPage() {
  const router = useRouter();
  const {
    buses,
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
  const [editingBus, setEditingBus] = useState<BusRoute | null>(null);
  const [viewingBus, setViewingBus] = useState<BusRoute | null>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string; permanent: boolean } | null>(null);

  React.useEffect(() => {
    fetch('/api/buses', { cache: 'no-store' })
      .then((res) => res.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          useCrudStore.setState({ buses: res.data });
        }
      })
      .catch((err) => console.error('Failed to load buses from DB:', err));
  }, []);

  const busFields: FieldConfig[] = [
    { name: 'routeNo', label: 'Route Identifier (e.g. Route 5)', type: 'text' },
    { name: 'routeName', label: 'Route Coverage Description', type: 'text' },
    { name: 'busNo', label: 'Bus Vehicle Reg No (e.g. DL-01-AB-4321)', type: 'text' },
    { name: 'driverName', label: 'Driver Full Name', type: 'text' },
    { name: 'driverPhone', label: 'Driver Contact Phone', type: 'phone' },
    { name: 'conductorName', label: 'Conductor Name', type: 'text' },
    { name: 'capacity', label: 'Passenger Capacity', type: 'number' },
    { name: 'feePerTerm', label: 'Term Transport Fee (₹)', type: 'number' },
    {
      name: 'status',
      label: 'Fleet Operational Status',
      type: 'select',
      options: [
        { label: 'Operational', value: 'Operational' },
        { label: 'Maintenance', value: 'Maintenance' },
        { label: 'Idle', value: 'Idle' },
      ],
    },
  ];

  const columns: Column<BusRoute>[] = [
    {
      key: 'routeNo',
      header: 'Route & Description',
      sortable: true,
      render: (b) => (
        <div>
          <span className="font-extrabold text-blue-600 dark:text-blue-400">{b.routeNo}</span>
          <p className="text-[11px] text-slate-800 dark:text-slate-100 font-bold">{b.routeName}</p>
        </div>
      ),
    },
    {
      key: 'busNo',
      header: 'Bus Vehicle No',
      sortable: true,
      render: (b) => <span className="font-mono font-bold text-slate-700 dark:text-slate-200">{b.busNo}</span>,
    },
    {
      key: 'driverName',
      header: 'Driver Contact',
      sortable: true,
      render: (b) => (
        <div className="space-y-0.5 text-[11px]">
          <p className="font-bold text-slate-800 dark:text-slate-100">{b.driverName}</p>
          <p className="flex items-center gap-1 text-slate-500">
            <Phone className="w-3 h-3 text-blue-500" /> {b.driverPhone}
          </p>
        </div>
      ),
    },
    { key: 'conductorName', header: 'Conductor' },
    {
      key: 'capacity',
      header: 'Allocated / Capacity',
      sortable: true,
      render: (b) => (
        <span className="font-bold text-slate-700 dark:text-slate-300">
          {b.assignedStudentsCount ?? 0} / {b.capacity} seats
        </span>
      ),
    },
    {
      key: 'feePerTerm',
      header: 'Fee Per Term',
      sortable: true,
      render: (b) => <span className="font-black text-slate-900 dark:text-white">{formatCurrency(b.feePerTerm)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (b) => (
        <span
          className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
            b.status === 'Operational'
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
              : b.status === 'Maintenance'
              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          {b.status}
        </span>
      ),
    },
  ];

  const handleSaveBus = async (data: Record<string, any>, saveAndNew?: boolean) => {
    if (editingBus) {
      updateRecord('buses', editingBus.id, data);
      try {
        await fetch('/api/buses', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingBus.id, ...data }),
        });
      } catch (err) {
        console.error('Failed to update bus route in DB:', err);
      }
      setEditingBus(null);
    } else {
      const newB: BusRoute = {
        id: `bus-${Date.now()}`,
        routeNo: data.routeNo || `Route ${buses.length + 1}`,
        routeName: data.routeName,
        busNo: data.busNo,
        driverName: data.driverName,
        driverPhone: data.driverPhone,
        conductorName: data.conductorName || 'Staff Member',
        capacity: Number(data.capacity) || 42,
        assignedStudentsCount: 0,
        feePerTerm: Number(data.feePerTerm) || 8000,
        status: data.status || 'Operational',
      };
      addRecord('buses', newB);

      try {
        await fetch('/api/buses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: newB.id,
            routeNumber: newB.routeNo,
            routeName: newB.routeName,
            driverName: newB.driverName,
            driverPhone: newB.driverPhone,
            vehicleNo: newB.busNo,
            capacity: newB.capacity,
            monthlyFee: newB.feePerTerm,
            status: newB.status,
          }),
        });
      } catch (err) {
        console.error('Failed to save bus route to DB:', err);
      }

      if (!saveAndNew) setIsAddModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <DataTable
        title="School Bus & Transport Management"
        subtitle="Bus Fleet, Driver Allocations, Pickup Circuits & Maintenance Records"
        icon={<Bus className="w-6 h-6" />}
        columns={columns}
        data={buses}
        addLabel="Add Bus Route"
        exportFilename="ABS_Transport_Bus_Routes"
        filterOptions={[
          {
            key: 'status',
            label: 'Status',
            options: [
              { label: 'Operational', value: 'Operational' },
              { label: 'Maintenance', value: 'Maintenance' },
              { label: 'Idle', value: 'Idle' },
            ],
          },
        ]}
        statusUpdateOptions={{
          field: 'status',
          label: 'Status',
          values: ['Operational', 'Maintenance', 'Idle'],
        }}
        onAddClick={() => setIsAddModalOpen(true)}
        onEditClick={(b) => setEditingBus(b)}
        onViewClick={(b) => setViewingBus(b)}
        onSoftDeleteClick={(b) => setConfirmDelete({ id: b.id, name: b.routeNo, permanent: false })}
        onRestoreClick={(b) => restoreRecord('buses', b.id)}
        onPermanentDeleteClick={(b) => setConfirmDelete({ id: b.id, name: b.routeNo, permanent: true })}
        onBulkDelete={(ids, soft) => bulkDeleteRecords('buses', ids, soft)}
        onBulkStatusUpdate={(ids, field, val) => bulkUpdateStatus('buses', ids, field, val)}
        onImportClick={() => setIsImportOpen(true)}
        onAuditLogsClick={() => setIsAuditOpen(true)}
      />

      {/* Add / Edit Modal */}
      <CrudModal
        isOpen={isAddModalOpen || Boolean(editingBus)}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingBus(null);
        }}
        title="Bus Route"
        fields={busFields}
        initialData={editingBus ? { ...editingBus } : null}
        onSave={handleSaveBus}
      />

      {/* Import Modal */}
      <ImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        title="Bus Routes"
        onImport={(rows) => importRecords('buses', rows)}
      />

      {/* Audit Log Modal */}
      <AuditLogViewer
        isOpen={isAuditOpen}
        onClose={() => setIsAuditOpen(false)}
        moduleName="buses"
        auditLogs={auditLogs}
      />

      {/* Delete Confirm */}
      {confirmDelete && (
        <ConfirmDialog
          isOpen={Boolean(confirmDelete)}
          onClose={() => setConfirmDelete(null)}
          title={confirmDelete.permanent ? 'Permanently Purge Bus Route' : 'Move Route to Trash'}
          message={`Are you sure you want to ${
            confirmDelete.permanent ? 'permanently delete' : 'soft delete'
          } ${confirmDelete.name}?`}
          confirmLabel={confirmDelete.permanent ? 'Permanent Delete' : 'Move to Trash'}
          onConfirm={async () => {
            if (confirmDelete.permanent) {
              permanentDeleteRecord('buses', confirmDelete.id);
              try {
                await fetch(`/api/buses?id=${confirmDelete.id}`, { method: 'DELETE' });
                router.refresh();
              } catch (err) {
                console.error('Failed to delete bus route from DB:', err);
              }
            } else {
              softDeleteRecord('buses', confirmDelete.id);
            }
          }}
        />
      )}

      {/* View Bus Route Modal */}
      {viewingBus && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Bus className="w-5 h-5 text-amber-600" /> Bus Transport Dossier
              </h3>
              <button onClick={() => setViewingBus(null)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl flex justify-between items-center">
                <div>
                  <span className="text-slate-400 block">{viewingBus.routeNo}</span>
                  <strong className="text-base font-extrabold text-slate-900 dark:text-white">{viewingBus.routeName}</strong>
                </div>
                <span className="font-mono text-xs font-bold text-amber-600">{viewingBus.busNo}</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 block">Driver</span>
                  <strong>{viewingBus.driverName} ({viewingBus.driverPhone})</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Conductor</span>
                  <strong>{viewingBus.conductorName}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Seat Capacity</span>
                  <strong>{viewingBus.capacity} Passengers</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Term Fee</span>
                  <strong className="text-emerald-600">{formatCurrency(viewingBus.feePerTerm)}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
