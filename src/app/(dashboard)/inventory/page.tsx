'use client';

import React, { useState } from 'react';
import { useCrudStore } from '@/store/crud-store';
import { InventoryItem } from '@/types';
import { DataTable, Column } from '@/components/crud/DataTable';
import { CrudModal, FieldConfig } from '@/components/crud/CrudModal';
import { ImportModal } from '@/components/crud/ImportModal';
import { AuditLogViewer } from '@/components/crud/AuditLogViewer';
import { ConfirmDialog } from '@/components/crud/ConfirmDialog';
import { formatCurrency } from '@/lib/utils';
import { Layers, Package, AlertTriangle, PlusCircle, MinusCircle, Warehouse } from 'lucide-react';

export default function InventoryPage() {
  const {
    inventory,
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
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [viewingItem, setViewingItem] = useState<InventoryItem | null>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string; permanent: boolean } | null>(null);

  React.useEffect(() => {
    fetch('/api/inventory')
      .then((res) => res.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          useCrudStore.setState({ inventory: res.data });
        }
      })
      .catch((err) => console.error('Failed to load inventory from DB:', err));
  }, []);

  const supplierNames = suppliers.map((s) => s.name);

  const inventoryFields: FieldConfig[] = [
    { name: 'itemCode', label: 'Item Code (e.g. UNIF-BLAZER-M)', type: 'text' },
    { name: 'name', label: 'Item Name & Specs', type: 'text' },
    {
      name: 'category',
      label: 'Category',
      type: 'select',
      options: [
        { label: 'Uniforms', value: 'Uniforms' },
        { label: 'Books', value: 'Books' },
        { label: 'Stationery', value: 'Stationery' },
        { label: 'Furniture', value: 'Furniture' },
        { label: 'Computers', value: 'Computers' },
        { label: 'Electronics', value: 'Electronics' },
        { label: 'Laboratory', value: 'Laboratory' },
        { label: 'Sports', value: 'Sports' },
        { label: 'Office', value: 'Office' },
      ],
    },
    { name: 'quantityInStock', label: 'Quantity In Stock', type: 'number' },
    { name: 'minReorderLevel', label: 'Minimum Reorder Threshold', type: 'number' },
    { name: 'unitPrice', label: 'Unit Retail Price (₹)', type: 'number' },
    {
      name: 'supplierName',
      label: 'Supplier / Vendor',
      type: 'select',
      options: supplierNames.length > 0 ? supplierNames.map((s) => ({ label: s, value: s })) : [{ label: 'Raymond School Uniforms', value: 'Raymond School Uniforms' }],
    },
    { name: 'warehouseLocation', label: 'Warehouse / Store Location', type: 'text' },
    {
      name: 'status',
      label: 'Stock Status',
      type: 'select',
      options: [
        { label: 'In Stock', value: 'In Stock' },
        { label: 'Low Stock', value: 'Low Stock' },
        { label: 'Out of Stock', value: 'Out of Stock' },
      ],
    },
  ];

  const columns: Column<InventoryItem>[] = [
    {
      key: 'itemCode',
      header: 'Item Code',
      sortable: true,
      render: (inv) => <span className="font-mono font-bold text-slate-700 dark:text-slate-200">{inv.itemCode}</span>,
    },
    {
      key: 'name',
      header: 'Item Name & Specs',
      sortable: true,
      render: (inv) => (
        <div>
          <p className="font-bold text-slate-800 dark:text-slate-100">{inv.name}</p>
          <span className="text-[10px] text-blue-600 font-semibold">{inv.category}</span>
        </div>
      ),
    },
    {
      key: 'quantityInStock',
      header: 'Stock Qty',
      sortable: true,
      render: (inv) => {
        const isLow = inv.quantityInStock <= inv.minReorderLevel;
        return (
          <div className="flex items-center gap-1.5">
            <span className={`font-extrabold text-sm ${isLow ? 'text-rose-600' : 'text-slate-800 dark:text-slate-100'}`}>
              {inv.quantityInStock} units
            </span>
            {isLow && <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />}
          </div>
        );
      },
    },
    {
      key: 'unitPrice',
      header: 'Unit Price',
      sortable: true,
      render: (inv) => <span className="font-semibold text-slate-800 dark:text-slate-200">{formatCurrency(inv.unitPrice)}</span>,
    },
    { key: 'warehouseLocation', header: 'Location' },
    { key: 'supplierName', header: 'Supplier' },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (inv) => (
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            inv.status === 'In Stock'
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
              : inv.status === 'Low Stock'
              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
              : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
          }`}
        >
          {inv.status}
        </span>
      ),
    },
  ];

  const handleSaveItem = async (data: Record<string, any>, saveAndNew?: boolean) => {
    const qty = Number(data.quantityInStock) || 0;
    const minLevel = Number(data.minReorderLevel) || 10;
    let computedStatus: 'In Stock' | 'Low Stock' | 'Out of Stock' = 'In Stock';
    if (qty === 0) computedStatus = 'Out of Stock';
    else if (qty <= minLevel) computedStatus = 'Low Stock';

    if (editingItem) {
      updateRecord('inventory', editingItem.id, {
        ...data,
        quantityInStock: qty,
        minReorderLevel: minLevel,
        status: data.status || computedStatus,
      });
      try {
        await fetch('/api/inventory', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingItem.id,
            ...data,
            quantity: qty,
            minStock: minLevel,
            unitPrice: Number(data.unitPrice) || 0,
            status: data.status || computedStatus,
          }),
        });
      } catch (err) {
        console.error('Failed to update inventory in DB:', err);
      }
      setEditingItem(null);
    } else {
      const newItem: InventoryItem = {
        id: `inv-${Date.now()}`,
        itemCode: data.itemCode || `ITEM-00${inventory.length + 1}`,
        name: data.name,
        category: data.category || 'Uniforms',
        quantityInStock: qty,
        minReorderLevel: minLevel,
        unitPrice: Number(data.unitPrice) || 0,
        supplierName: data.supplierName || 'Raymond School Uniforms',
        warehouseLocation: data.warehouseLocation || 'Store Room A1',
        status: data.status || computedStatus,
      };
      addRecord('inventory', newItem);

      try {
        await fetch('/api/inventory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: newItem.id,
            itemCode: newItem.itemCode,
            name: newItem.name,
            category: newItem.category,
            quantity: qty,
            minStock: minLevel,
            unitPrice: newItem.unitPrice,
            location: newItem.warehouseLocation,
            supplier: newItem.supplierName,
            status: newItem.status,
          }),
        });
      } catch (err) {
        console.error('Failed to save inventory item to DB:', err);
      }

      if (!saveAndNew) setIsAddModalOpen(false);
    }
  };

  const handleStockAdjustment = (id: string, delta: number) => {
    const target = inventory.find((i) => i.id === id);
    if (!target) return;
    const newQty = Math.max(0, target.quantityInStock + delta);
    let newStatus: 'In Stock' | 'Low Stock' | 'Out of Stock' = 'In Stock';
    if (newQty === 0) newStatus = 'Out of Stock';
    else if (newQty <= target.minReorderLevel) newStatus = 'Low Stock';

    updateRecord('inventory', id, {
      quantityInStock: newQty,
      status: newStatus,
    });
    if (viewingItem && viewingItem.id === id) {
      setViewingItem({ ...viewingItem, quantityInStock: newQty, status: newStatus });
    }
  };

  return (
    <div className="space-y-6">
      <DataTable
        title="Inventory & Stock Control"
        subtitle="Uniforms, Books, Stationery, Lab & IT Equipment Warehousing"
        icon={<Layers className="w-6 h-6" />}
        columns={columns}
        data={inventory}
        addLabel="Add Inventory Item"
        exportFilename="ABS_Inventory_Stock"
        filterOptions={[
          {
            key: 'category',
            label: 'Category',
            options: [
              { label: 'Uniforms', value: 'Uniforms' },
              { label: 'Books', value: 'Books' },
              { label: 'Stationery', value: 'Stationery' },
              { label: 'Computers', value: 'Computers' },
            ],
          },
          {
            key: 'status',
            label: 'Stock Status',
            options: [
              { label: 'In Stock', value: 'In Stock' },
              { label: 'Low Stock', value: 'Low Stock' },
              { label: 'Out of Stock', value: 'Out of Stock' },
            ],
          },
        ]}
        statusUpdateOptions={{
          field: 'status',
          label: 'Stock Status',
          values: ['In Stock', 'Low Stock', 'Out of Stock'],
        }}
        onAddClick={() => setIsAddModalOpen(true)}
        onEditClick={(inv) => setEditingItem(inv)}
        onViewClick={(inv) => setViewingItem(inv)}
        onSoftDeleteClick={(inv) => setConfirmDelete({ id: inv.id, name: inv.name, permanent: false })}
        onRestoreClick={(inv) => restoreRecord('inventory', inv.id)}
        onPermanentDeleteClick={(inv) => setConfirmDelete({ id: inv.id, name: inv.name, permanent: true })}
        onBulkDelete={(ids, soft) => bulkDeleteRecords('inventory', ids, soft)}
        onBulkStatusUpdate={(ids, field, val) => bulkUpdateStatus('inventory', ids, field, val)}
        onImportClick={() => setIsImportOpen(true)}
        onAuditLogsClick={() => setIsAuditOpen(true)}
      />

      {/* Add / Edit Modal */}
      <CrudModal
        isOpen={isAddModalOpen || Boolean(editingItem)}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingItem(null);
        }}
        title="Inventory Item"
        fields={inventoryFields}
        initialData={editingItem ? { ...editingItem } : null}
        onSave={handleSaveItem}
      />

      {/* Import Modal */}
      <ImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        title="Inventory"
        onImport={(rows) => importRecords('inventory', rows)}
      />

      {/* Audit Log Modal */}
      <AuditLogViewer
        isOpen={isAuditOpen}
        onClose={() => setIsAuditOpen(false)}
        moduleName="inventory"
        auditLogs={auditLogs}
      />

      {/* Delete Confirm */}
      {confirmDelete && (
        <ConfirmDialog
          isOpen={Boolean(confirmDelete)}
          onClose={() => setConfirmDelete(null)}
          title={confirmDelete.permanent ? 'Permanently Purge Stock Item' : 'Move Item to Trash'}
          message={`Are you sure you want to ${
            confirmDelete.permanent ? 'permanently delete' : 'soft delete'
          } ${confirmDelete.name}?`}
          confirmLabel={confirmDelete.permanent ? 'Permanent Delete' : 'Move to Trash'}
          onConfirm={async () => {
            if (confirmDelete.permanent) {
              permanentDeleteRecord('inventory', confirmDelete.id);
              try {
                await fetch(`/api/inventory?id=${confirmDelete.id}`, { method: 'DELETE' });
              } catch (err) {
                console.error('Failed to delete inventory from DB:', err);
              }
            } else {
              softDeleteRecord('inventory', confirmDelete.id);
            }
          }}
        />
      )}

      {/* View Item & Quick Stock Adjust Modal */}
      {viewingItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" /> Stock Adjustment: {viewingItem.name}
              </h3>
              <button onClick={() => setViewingItem(null)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                <div>
                  <span className="text-slate-400 block">Item Code</span>
                  <strong className="font-mono">{viewingItem.itemCode}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Warehouse</span>
                  <strong className="text-slate-800 dark:text-slate-200">{viewingItem.warehouseLocation}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Current Stock</span>
                  <strong className="text-base font-extrabold text-blue-600">{viewingItem.quantityInStock} units</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Reorder Level</span>
                  <strong>{viewingItem.minReorderLevel} units</strong>
                </div>
              </div>

              {/* Stock In / Out Adjustment buttons */}
              <div className="pt-2 space-y-2">
                <span className="font-bold text-slate-700 dark:text-slate-300 block">Instant Stock Adjustment:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleStockAdjustment(viewingItem.id, 10)}
                    className="flex-1 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 font-bold flex items-center justify-center gap-1 hover:bg-emerald-100"
                  >
                    <PlusCircle className="w-4 h-4" /> Stock In (+10)
                  </button>
                  <button
                    onClick={() => handleStockAdjustment(viewingItem.id, -5)}
                    className="flex-1 py-2 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-700 font-bold flex items-center justify-center gap-1 hover:bg-rose-100"
                  >
                    <MinusCircle className="w-4 h-4" /> Stock Out (-5)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
