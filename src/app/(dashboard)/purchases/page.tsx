'use client';

import React, { useState } from 'react';
import { useCrudStore } from '@/store/crud-store';
import { PurchaseOrder } from '@/types';
import { DataTable, Column } from '@/components/crud/DataTable';
import { CrudModal, FieldConfig } from '@/components/crud/CrudModal';
import { ImportModal } from '@/components/crud/ImportModal';
import { AuditLogViewer } from '@/components/crud/AuditLogViewer';
import { ConfirmDialog } from '@/components/crud/ConfirmDialog';
import { formatCurrency } from '@/lib/utils';
import { ShoppingBag, Truck, Calendar, CheckCircle2, PackageCheck } from 'lucide-react';

export default function PurchasesPage() {
  const {
    purchases,
    suppliers,
    financialAccounts,
    recordAccountTransaction,
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
  const [editingPO, setEditingPO] = useState<PurchaseOrder | null>(null);
  const [viewingPO, setViewingPO] = useState<PurchaseOrder | null>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string; permanent: boolean } | null>(null);

  React.useEffect(() => {
    fetch('/api/purchases')
      .then((res) => res.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          useCrudStore.setState({ purchases: res.data });
        }
      })
      .catch((err) => console.error('Failed to load purchases from DB:', err));
  }, []);

  const supplierOptions = suppliers.map((s) => ({ label: s.name, value: s.name }));

  const purchaseFields: FieldConfig[] = [
    { name: 'poNumber', label: 'Purchase Order Number (e.g. PO-2026-045)', type: 'text' },
    {
      name: 'supplierName',
      label: 'Supplier Vendor',
      type: 'select',
      options: supplierOptions.length > 0 ? supplierOptions : [{ label: 'Raymond School Uniforms', value: 'Raymond School Uniforms' }],
    },
    {
      name: 'accountId',
      label: 'Payment Account (Disbursement Account)',
      type: 'select',
      options:
        financialAccounts.length > 0
          ? financialAccounts.map((a) => ({
              label: `${a.accountName} (${a.accountType === 'Cash Fund Account' || a.accountType === 'CASH' ? 'Cash' : 'Bank'}) - ₹${a.currentBalance.toLocaleString('en-IN')}`,
              value: a.id,
            }))
          : [{ label: 'Main School Account', value: 'acc-main-001' }],
    },
    { name: 'orderDate', label: 'Order Date', type: 'date' },

    { name: 'deliveryDate', label: 'Expected Delivery Date', type: 'date' },
    { name: 'itemsCount', label: 'Total Quantity of Items', type: 'number' },
    { name: 'totalAmount', label: 'Total PO Invoice Amount (₹)', type: 'number' },
    {
      name: 'status',
      label: 'PO Order Status',
      type: 'select',
      options: [
        { label: 'Draft', value: 'Draft' },
        { label: 'Sent', value: 'Sent' },
        { label: 'Goods Received', value: 'Goods Received' },
        { label: 'Paid', value: 'Paid' },
        { label: 'Cancelled', value: 'Cancelled' },
      ],
    },
  ];

  const columns: Column<PurchaseOrder>[] = [
    {
      key: 'poNumber',
      header: 'PO Number',
      sortable: true,
      render: (po) => <span className="font-mono font-bold text-slate-800 dark:text-slate-100">{po.poNumber}</span>,
    },
    {
      key: 'supplierName',
      header: 'Supplier Vendor',
      sortable: true,
      render: (po) => <span className="font-extrabold text-blue-600 dark:text-blue-400">{po.supplierName}</span>,
    },
    { key: 'orderDate', header: 'Order Date', sortable: true },
    { key: 'deliveryDate', header: 'Delivery Date', sortable: true },
    {
      key: 'itemsCount',
      header: 'Items Qty',
      sortable: true,
      render: (po) => <span className="font-bold text-slate-700 dark:text-slate-300">{po.itemsCount} units</span>,
    },
    {
      key: 'totalAmount',
      header: 'Total Invoice Amount',
      sortable: true,
      render: (po) => <span className="font-black text-slate-900 dark:text-white">{formatCurrency(po.totalAmount)}</span>,
    },
    {
      key: 'status',
      header: 'Order Status',
      sortable: true,
      render: (po) => (
        <span
          className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
            po.status === 'Paid' || po.status === 'Goods Received'
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
              : po.status === 'Sent'
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
              : po.status === 'Draft'
              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
              : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
          }`}
        >
          {po.status}
        </span>
      ),
    },
  ];

  const handleSavePurchase = async (data: Record<string, any>, saveAndNew?: boolean) => {
    if (editingPO) {
      updateRecord('purchases', editingPO.id, data);
      try {
        await fetch('/api/purchases', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingPO.id, ...data }),
        });
      } catch (err) {
        console.error('Failed to update PO in DB:', err);
      }
      setEditingPO(null);
    } else {
      const selectedSup = suppliers.find((s) => s.name === data.supplierName);
      const newPO: PurchaseOrder = {
        id: `po-${Date.now()}`,
        poNumber: data.poNumber || `PO-2026-0${purchases.length + 10}`,
        supplierId: selectedSup?.id || 'sup-1',
        supplierName: data.supplierName,
        orderDate: data.orderDate || new Date().toISOString().split('T')[0],
        deliveryDate: data.deliveryDate || new Date().toISOString().split('T')[0],
        totalAmount: Number(data.totalAmount) || 0,
        status: data.status || 'Draft',
        itemsCount: Number(data.itemsCount) || 1,
      };
      addRecord('purchases', newPO);

      if (newPO.status === 'Paid' && newPO.totalAmount > 0) {
        recordAccountTransaction({
          txnNumber: `TXN-PO-${newPO.poNumber}`,
          accountId: data.accountId || '',
          accountName: '',
          date: newPO.orderDate,
          referenceNo: newPO.poNumber,
          module: 'PURCHASE',
          transactionType: 'EXPENSE',
          description: `Purchase Payment: Vendor ${newPO.supplierName} (${newPO.itemsCount} items)`,
          paymentMethod: 'Bank Transfer',
          debit: newPO.totalAmount,
          credit: 0,
          createdBy: 'Purchase Manager',
        });
      }

      try {
        await fetch('/api/purchases', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: newPO.id,
            poNumber: newPO.poNumber,
            supplierName: newPO.supplierName,
            supplierId: newPO.supplierId,
            orderDate: newPO.orderDate,
            expectedDate: newPO.deliveryDate,
            itemsCount: newPO.itemsCount,
            totalAmount: newPO.totalAmount,
            paymentStatus: newPO.status,
            items: [],
          }),
        });
      } catch (err) {
        console.error('Failed to save PO to DB:', err);
      }

      if (!saveAndNew) setIsAddModalOpen(false);
    }
  };


  return (
    <div className="space-y-6">
      <DataTable
        title="Purchase Orders & Vendor Procurement"
        subtitle="Purchase Bills, Goods Received Notes, Vendor Payments & Order History"
        icon={<ShoppingBag className="w-6 h-6" />}
        columns={columns}
        data={purchases}
        addLabel="Create Purchase Order"
        exportFilename="ABS_Purchase_Orders"
        filterOptions={[
          {
            key: 'status',
            label: 'Status',
            options: [
              { label: 'Draft', value: 'Draft' },
              { label: 'Sent', value: 'Sent' },
              { label: 'Goods Received', value: 'Goods Received' },
              { label: 'Paid', value: 'Paid' },
              { label: 'Cancelled', value: 'Cancelled' },
            ],
          },
        ]}
        statusUpdateOptions={{
          field: 'status',
          label: 'Order Status',
          values: ['Draft', 'Sent', 'Goods Received', 'Paid', 'Cancelled'],
        }}
        onAddClick={() => setIsAddModalOpen(true)}
        onEditClick={(po) => setEditingPO(po)}
        onViewClick={(po) => setViewingPO(po)}
        onSoftDeleteClick={(po) => setConfirmDelete({ id: po.id, name: po.poNumber, permanent: false })}
        onRestoreClick={(po) => restoreRecord('purchases', po.id)}
        onPermanentDeleteClick={(po) => setConfirmDelete({ id: po.id, name: po.poNumber, permanent: true })}
        onBulkDelete={(ids, soft) => bulkDeleteRecords('purchases', ids, soft)}
        onBulkStatusUpdate={(ids, field, val) => bulkUpdateStatus('purchases', ids, field, val)}
        onImportClick={() => setIsImportOpen(true)}
        onAuditLogsClick={() => setIsAuditOpen(true)}
      />

      {/* Add / Edit Modal */}
      <CrudModal
        isOpen={isAddModalOpen || Boolean(editingPO)}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingPO(null);
        }}
        title="Purchase Order"
        fields={purchaseFields}
        initialData={editingPO ? { ...editingPO } : null}
        onSave={handleSavePurchase}
      />

      {/* Import Modal */}
      <ImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        title="Purchases"
        onImport={(rows) => importRecords('purchases', rows)}
      />

      {/* Audit Log Modal */}
      <AuditLogViewer
        isOpen={isAuditOpen}
        onClose={() => setIsAuditOpen(false)}
        moduleName="purchases"
        auditLogs={auditLogs}
      />

      {/* Delete Confirm */}
      {confirmDelete && (
        <ConfirmDialog
          isOpen={Boolean(confirmDelete)}
          onClose={() => setConfirmDelete(null)}
          title={confirmDelete.permanent ? 'Permanently Purge Purchase Order' : 'Move PO to Trash'}
          message={`Are you sure you want to ${
            confirmDelete.permanent ? 'permanently delete' : 'soft delete'
          } ${confirmDelete.name}?`}
          confirmLabel={confirmDelete.permanent ? 'Permanent Delete' : 'Move to Trash'}
          onConfirm={async () => {
            if (confirmDelete.permanent) {
              permanentDeleteRecord('purchases', confirmDelete.id);
              try {
                await fetch(`/api/purchases?id=${confirmDelete.id}`, { method: 'DELETE' });
              } catch (err) {
                console.error('Failed to delete PO from DB:', err);
              }
            } else {
              softDeleteRecord('purchases', confirmDelete.id);
            }
          }}
        />
      )}

      {/* View PO Modal */}
      {viewingPO && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-blue-600" /> Purchase Order Dossier
              </h3>
              <button onClick={() => setViewingPO(null)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl">
                <div>
                  <span className="text-slate-400 block">PO Number</span>
                  <strong className="font-mono text-base text-slate-900 dark:text-white">{viewingPO.poNumber}</strong>
                </div>
                <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-bold">{viewingPO.status}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-400 block">Supplier Name</span>
                  <strong className="text-slate-800 dark:text-slate-200">{viewingPO.supplierName}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Items Quantity</span>
                  <strong className="text-slate-800 dark:text-slate-200">{viewingPO.itemsCount} Units</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Order Date</span>
                  <strong className="text-slate-800 dark:text-slate-200">{viewingPO.orderDate}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Delivery Date</span>
                  <strong className="text-slate-800 dark:text-slate-200">{viewingPO.deliveryDate}</strong>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Total Purchase Amount:</span>
                <strong className="text-lg font-black text-blue-600">{formatCurrency(viewingPO.totalAmount)}</strong>
              </div>

              {viewingPO.status !== 'Goods Received' && (
                <button
                  onClick={() => {
                    updateRecord('purchases', viewingPO.id, { status: 'Goods Received' });
                    setViewingPO(null);
                  }}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center gap-1.5 shadow-md hover:bg-emerald-500"
                >
                  <PackageCheck className="w-4 h-4" /> Mark Goods Received
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
