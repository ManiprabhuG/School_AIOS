'use client';

export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCrudStore } from '@/store/crud-store';
import { Supplier } from '@/types';
import { DataTable, Column } from '@/components/crud/DataTable';
import { CrudModal, FieldConfig } from '@/components/crud/CrudModal';
import { ImportModal } from '@/components/crud/ImportModal';
import { AuditLogViewer } from '@/components/crud/AuditLogViewer';
import { ConfirmDialog } from '@/components/crud/ConfirmDialog';
import { formatCurrency } from '@/lib/utils';
import { Truck, Phone, Mail, MapPin, Building, CreditCard } from 'lucide-react';

export default function SuppliersPage() {
  const router = useRouter();
  const {
    suppliers,
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
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [viewingSupplier, setViewingSupplier] = useState<Supplier | null>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string; permanent: boolean } | null>(null);

  React.useEffect(() => {
    fetch('/api/suppliers', { cache: 'no-store' })
      .then((res) => res.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          useCrudStore.setState({ suppliers: res.data });
        }
      })
      .catch((err) => console.error('Failed to load suppliers from DB:', err));
  }, []);

  const supplierFields: FieldConfig[] = [
    { name: 'name', label: 'Supplier Trade Name', type: 'text' },
    { name: 'companyName', label: 'Company / Business Name', type: 'text' },
    { name: 'supplierCode', label: 'Supplier Code (e.g. SUP-005)', type: 'text' },
    { name: 'contactPerson', label: 'Contact Person Name', type: 'text' },
    { name: 'phone', label: 'Phone Number', type: 'phone' },
    { name: 'email', label: 'Email Address', type: 'email' },
    { name: 'gstNo', label: 'GSTIN Registration Number', type: 'text' },
    {
      name: 'category',
      label: 'Category',
      type: 'select',
      options: [
        { label: 'Uniforms', value: 'Uniforms' },
        { label: 'Books & Stationery', value: 'Books & Stationery' },
        { label: 'Computers & IT', value: 'Computers & IT' },
        { label: 'Furniture', value: 'Furniture' },
        { label: 'Laboratory', value: 'Laboratory' },
        { label: 'Sports Equipment', value: 'Sports Equipment' },
      ],
    },
    { name: 'outstandingBalance', label: 'Outstanding Payable Balance (₹)', type: 'number' },
    { name: 'address', label: 'Office Address', type: 'textarea', colSpan: 2 },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { label: 'Active', value: 'Active' },
        { label: 'Inactive', value: 'Inactive' },
      ],
    },
  ];

  const columns: Column<Supplier>[] = [
    {
      key: 'name',
      header: 'Supplier & Company',
      sortable: true,
      render: (s) => (
        <div>
          <p className="font-extrabold text-slate-800 dark:text-slate-100">{s.name}</p>
          <span className="text-[11px] text-teal-600 font-semibold block">{s.companyName}</span>
        </div>
      ),
    },
    {
      key: 'supplierCode',
      header: 'Supplier Code',
      sortable: true,
      render: (s) => <span className="font-mono font-bold text-slate-600 dark:text-slate-300">{s.supplierCode}</span>,
    },
    { key: 'contactPerson', header: 'Contact Person', sortable: true },
    {
      key: 'phone',
      header: 'Contact Info',
      render: (s) => (
        <div className="text-slate-600 dark:text-slate-400 space-y-0.5 text-[11px]">
          <p className="flex items-center gap-1">
            <Phone className="w-3 h-3 text-teal-500" /> {s.phone}
          </p>
          <p className="flex items-center gap-1">
            <Mail className="w-3 h-3 text-teal-500" /> {s.email}
          </p>
        </div>
      ),
    },
    {
      key: 'gstNo',
      header: 'GSTIN',
      sortable: true,
      render: (s) => <span className="font-mono text-xs text-slate-700 dark:text-slate-300">{s.gstNo}</span>,
    },
    {
      key: 'outstandingBalance',
      header: 'Outstanding Balance',
      sortable: true,
      render: (s) => (
        <strong className="font-extrabold text-slate-800 dark:text-slate-100">
          {formatCurrency(s.outstandingBalance || 0)}
        </strong>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (s) => (
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            s.status === 'Active'
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          {s.status || 'Active'}
        </span>
      ),
    },
  ];

  const handleSaveSupplier = async (data: Record<string, any>, saveAndNew?: boolean) => {
    if (editingSupplier) {
      updateRecord('suppliers', editingSupplier.id, data);
      try {
        await fetch('/api/suppliers', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingSupplier.id, ...data }),
        });
      } catch (err) {
        console.error('Failed to update supplier in DB:', err);
      }
      setEditingSupplier(null);
    } else {
      const newSup: Supplier = {
        id: `sup-${Date.now()}`,
        supplierCode: data.supplierCode || `SUP-00${suppliers.length + 1}`,
        name: data.name,
        companyName: data.companyName,
        contactPerson: data.contactPerson,
        phone: data.phone,
        email: data.email,
        gstNo: data.gstNo,
        category: data.category || 'Uniforms',
        outstandingBalance: Number(data.outstandingBalance) || 0,
        address: data.address || '',
        status: data.status || 'Active',
      };
      addRecord('suppliers', newSup);

      try {
        await fetch('/api/suppliers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newSup),
        });
      } catch (err) {
        console.error('Failed to save supplier to DB:', err);
      }

      if (!saveAndNew) setIsAddModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <DataTable
        title="Supplier & Vendor Directory"
        subtitle="Uniform Manufacturers, Publishers, IT Dealers & GST Tax Records"
        icon={<Truck className="w-6 h-6" />}
        columns={columns}
        data={suppliers}
        addLabel="Add New Supplier"
        exportFilename="ABS_Suppliers_Directory"
        filterOptions={[
          {
            key: 'category',
            label: 'Category',
            options: [
              { label: 'Uniforms', value: 'Uniforms' },
              { label: 'Books & Stationery', value: 'Books & Stationery' },
              { label: 'Computers & IT', value: 'Computers & IT' },
              { label: 'Furniture', value: 'Furniture' },
            ],
          },
          {
            key: 'status',
            label: 'Status',
            options: [
              { label: 'Active', value: 'Active' },
              { label: 'Inactive', value: 'Inactive' },
            ],
          },
        ]}
        statusUpdateOptions={{
          field: 'status',
          label: 'Status',
          values: ['Active', 'Inactive'],
        }}
        onAddClick={() => setIsAddModalOpen(true)}
        onEditClick={(s) => setEditingSupplier(s)}
        onViewClick={(s) => setViewingSupplier(s)}
        onSoftDeleteClick={(s) => setConfirmDelete({ id: s.id, name: s.name, permanent: false })}
        onRestoreClick={(s) => restoreRecord('suppliers', s.id)}
        onPermanentDeleteClick={(s) => setConfirmDelete({ id: s.id, name: s.name, permanent: true })}
        onBulkDelete={(ids, soft) => bulkDeleteRecords('suppliers', ids, soft)}
        onBulkStatusUpdate={(ids, field, val) => bulkUpdateStatus('suppliers', ids, field, val)}
        onImportClick={() => setIsImportOpen(true)}
        onAuditLogsClick={() => setIsAuditOpen(true)}
      />

      {/* Add / Edit Modal */}
      <CrudModal
        isOpen={isAddModalOpen || Boolean(editingSupplier)}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingSupplier(null);
        }}
        title="Supplier"
        fields={supplierFields}
        initialData={editingSupplier ? { ...editingSupplier } : null}
        onSave={handleSaveSupplier}
      />

      {/* Import Modal */}
      <ImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        title="Suppliers"
        onImport={(rows) => importRecords('suppliers', rows)}
      />

      {/* Audit Log Modal */}
      <AuditLogViewer
        isOpen={isAuditOpen}
        onClose={() => setIsAuditOpen(false)}
        moduleName="suppliers"
        auditLogs={auditLogs}
      />

      {/* Delete Confirm */}
      {confirmDelete && (
        <ConfirmDialog
          isOpen={Boolean(confirmDelete)}
          onClose={() => setConfirmDelete(null)}
          title={confirmDelete.permanent ? 'Permanently Delete Supplier' : 'Move Supplier to Trash'}
          message={`Are you sure you want to ${
            confirmDelete.permanent ? 'permanently delete' : 'soft delete'
          } ${confirmDelete.name}?`}
          confirmLabel={confirmDelete.permanent ? 'Permanent Delete' : 'Move to Trash'}
          onConfirm={async () => {
            if (confirmDelete.permanent) {
              permanentDeleteRecord('suppliers', confirmDelete.id);
              try {
                await fetch(`/api/suppliers?id=${confirmDelete.id}`, { method: 'DELETE' });
                router.refresh();
              } catch (err) {
                console.error('Failed to delete supplier from DB:', err);
              }
            } else {
              softDeleteRecord('suppliers', confirmDelete.id);
            }
          }}
        />
      )}

      {/* View Supplier Details Modal */}
      {viewingSupplier && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Truck className="w-5 h-5 text-teal-600" /> Supplier Dossier: {viewingSupplier.name}
              </h3>
              <button onClick={() => setViewingSupplier(null)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                <div>
                  <span className="text-slate-400 block">Supplier Code</span>
                  <strong className="font-mono text-slate-800 dark:text-slate-100">{viewingSupplier.supplierCode}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Category</span>
                  <strong className="text-teal-600 font-bold">{viewingSupplier.category}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Company Name</span>
                  <strong className="text-slate-800 dark:text-slate-100">{viewingSupplier.companyName}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">GSTIN</span>
                  <strong className="font-mono text-slate-800 dark:text-slate-100">{viewingSupplier.gstNo}</strong>
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <p className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Phone className="w-4 h-4 text-teal-500" /> {viewingSupplier.phone}
                </p>
                <p className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Mail className="w-4 h-4 text-teal-500" /> {viewingSupplier.email}
                </p>
                <p className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <MapPin className="w-4 h-4 text-teal-500" /> {viewingSupplier.address}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Outstanding Balance Payable:</span>
                <strong className="text-base font-black text-rose-600">
                  {formatCurrency(viewingSupplier.outstandingBalance)}
                </strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
