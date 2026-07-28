'use client';

import React, { useState } from 'react';
import { useCrudStore } from '@/store/crud-store';
import { SalesItem } from '@/types';
import { DataTable, Column } from '@/components/crud/DataTable';
import { CrudModal, FieldConfig } from '@/components/crud/CrudModal';
import { ImportModal } from '@/components/crud/ImportModal';
import { AuditLogViewer } from '@/components/crud/AuditLogViewer';
import { ConfirmDialog } from '@/components/crud/ConfirmDialog';
import { formatCurrency } from '@/lib/utils';
import PrintModal from '@/components/print/PrintModal';
import { ReceiptData } from '@/components/print/ReceiptTemplate';
import { ShoppingCart, Receipt, User, Tag, CreditCard, FileText } from 'lucide-react';

export default function SalesPage() {
  const {
    sales,
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
  const [editingSale, setEditingSale] = useState<SalesItem | null>(null);
  const [viewingSale, setViewingSale] = useState<SalesItem | null>(null);
  const [printReceiptData, setPrintReceiptData] = useState<ReceiptData | null>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string; permanent: boolean } | null>(null);

  React.useEffect(() => {
    fetch('/api/sales')
      .then((res) => res.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          useCrudStore.setState({ sales: res.data });
        }
      })
      .catch((err) => console.error('Failed to load sales from DB:', err));
  }, []);

  const salesFields: FieldConfig[] = [
    { name: 'invoiceNo', label: 'Invoice Number (e.g. INV-2026-1025)', type: 'text' },
    { name: 'customerName', label: 'Customer / Student Name', type: 'text' },
    {
      name: 'customerType',
      label: 'Customer Type',
      type: 'select',
      options: [
        { label: 'Student', value: 'Student' },
        { label: 'Staff', value: 'Staff' },
        { label: 'Guest', value: 'Guest' },
      ],
    },
    {
      name: 'itemCategory',
      label: 'Item Category',
      type: 'select',
      options: [
        { label: 'Uniform', value: 'Uniform' },
        { label: 'ID Card', value: 'ID Card' },
        { label: 'Books', value: 'Books' },
        { label: 'Stationery', value: 'Stationery' },
        { label: 'Accessories', value: 'Accessories' },
      ],
    },
    { name: 'itemName', label: 'Item Name & Specs', type: 'text' },
    { name: 'quantity', label: 'Quantity', type: 'number' },
    { name: 'unitPrice', label: 'Unit Price (₹)', type: 'number' },
    { name: 'discount', label: 'Discount Amount (₹)', type: 'number' },
    { name: 'date', label: 'Sale Date', type: 'date' },
    {
      name: 'paymentMethod',
      label: 'Payment Method',
      type: 'select',
      options: [
        { label: 'Cash', value: 'Cash' },
        { label: 'UPI', value: 'UPI' },
        { label: 'Card', value: 'Card' },
      ],
    },
  ];

  const columns: Column<SalesItem>[] = [
    {
      key: 'invoiceNo',
      header: 'Invoice No',
      sortable: true,
      render: (s) => <span className="font-mono font-bold text-slate-800 dark:text-slate-100">{s.invoiceNo}</span>,
    },
    {
      key: 'customerName',
      header: 'Customer',
      sortable: true,
      render: (s) => (
        <div>
          <p className="font-bold text-slate-800 dark:text-slate-100">{s.customerName}</p>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-medium">
            {s.customerType}
          </span>
        </div>
      ),
    },
    {
      key: 'itemName',
      header: 'Item & Category',
      sortable: true,
      render: (s) => (
        <div>
          <p className="font-semibold text-slate-800 dark:text-slate-200">{s.itemName}</p>
          <span className="text-[11px] text-blue-600 font-bold">{s.itemCategory}</span>
        </div>
      ),
    },
    {
      key: 'quantity',
      header: 'Qty x Price',
      render: (s) => (
        <span className="text-slate-600 dark:text-slate-400">
          {s.quantity} x {formatCurrency(s.unitPrice)}
        </span>
      ),
    },
    {
      key: 'netAmount',
      header: 'Net Invoice Total',
      sortable: true,
      render: (s) => <span className="font-black text-slate-900 dark:text-white">{formatCurrency(s.netAmount)}</span>,
    },
    { key: 'date', header: 'Date', sortable: true },
    {
      key: 'paymentMethod',
      header: 'Payment',
      sortable: true,
      render: (s) => <span className="font-bold text-emerald-600 dark:text-emerald-400">{s.paymentMethod}</span>,
    },
    {
      key: 'actions',
      header: 'Print Receipt',
      render: (s) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setPrintReceiptData({
              receiptNumber: s.invoiceNo || `INV-${s.id}`,
              title: 'POS UNIFORM & STORE SALES RECEIPT',
              studentName: s.customerName,
              admissionNo: 'ADM-POS-2026',
              paymentDate: s.date || new Date().toISOString().split('T')[0],
              paymentMethod: s.paymentMethod || 'Cash',
              cashierName: (s as any).cashierName || 'Store Cashier',
              items: [
                {
                  name: s.itemName,
                  category: s.itemCategory,
                  qty: s.quantity,
                  unitPrice: s.unitPrice,
                  amount: s.totalAmount,
                },
              ],
              subtotal: s.totalAmount,
              discount: s.discount || 0,
              totalAmount: s.netAmount,
              notes: 'Items once sold can be exchanged within 7 days with tag intact.',
            });
          }}
          className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] flex items-center gap-1 shadow-sm active:scale-95"
        >
          <FileText className="w-3 h-3" /> Receipt
        </button>
      ),
    },
  ];

  const handleSaveSale = async (data: Record<string, any>, saveAndNew?: boolean) => {
    const qty = Number(data.quantity) || 1;
    const price = Number(data.unitPrice) || 0;
    const disc = Number(data.discount) || 0;
    const total = qty * price;
    const net = Math.max(0, total - disc);

    if (editingSale) {
      updateRecord('sales', editingSale.id, {
        ...data,
        totalAmount: total,
        netAmount: net,
      });
      try {
        await fetch('/api/sales', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingSale.id, ...data, totalAmount: net }),
        });
      } catch (err) {
        console.error('Failed to update sales item in DB:', err);
      }
      setEditingSale(null);
    } else {
      const newSale: SalesItem = {
        id: `sl-${Date.now()}`,
        invoiceNo: data.invoiceNo || `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        customerName: data.customerName,
        customerType: data.customerType || 'Student',
        itemCategory: data.itemCategory || 'Uniform',
        itemName: data.itemName,
        quantity: qty,
        unitPrice: price,
        totalAmount: total,
        discount: disc,
        netAmount: net,
        date: data.date || new Date().toISOString().split('T')[0],
        paymentMethod: data.paymentMethod || 'UPI',
      };
      addRecord('sales', newSale);

      try {
        await fetch('/api/sales', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: newSale.id,
            invoiceNo: newSale.invoiceNo,
            customerName: newSale.customerName,
            customerType: newSale.customerType,
            date: newSale.date,
            itemCategory: newSale.itemCategory,
            itemName: newSale.itemName,
            quantity: newSale.quantity,
            unitPrice: newSale.unitPrice,
            totalAmount: net,
            paymentMethod: newSale.paymentMethod,
            paymentStatus: 'Paid',
          }),
        });
      } catch (err) {
        console.error('Failed to save sales item to DB:', err);
      }

      if (!saveAndNew) setIsAddModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="no-print space-y-6">
        <DataTable
        title="Counter Sales & Store Billing"
        subtitle="Uniforms, ID Cards, Books, Stationery Sales & Invoices"
        icon={<ShoppingCart className="w-6 h-6" />}
        columns={columns}
        data={sales}
        addLabel="Create New Invoice Sale"
        exportFilename="ABS_Sales_Invoices"
        filterOptions={[
          {
            key: 'itemCategory',
            label: 'Category',
            options: [
              { label: 'Uniform', value: 'Uniform' },
              { label: 'ID Card', value: 'ID Card' },
              { label: 'Books', value: 'Books' },
              { label: 'Stationery', value: 'Stationery' },
            ],
          },
          {
            key: 'paymentMethod',
            label: 'Payment Method',
            options: [
              { label: 'Cash', value: 'Cash' },
              { label: 'UPI', value: 'UPI' },
              { label: 'Card', value: 'Card' },
            ],
          },
        ]}
        onAddClick={() => setIsAddModalOpen(true)}
        onEditClick={(s) => setEditingSale(s)}
        onViewClick={(s) => setViewingSale(s)}
        onSoftDeleteClick={(s) => setConfirmDelete({ id: s.id, name: s.invoiceNo, permanent: false })}
        onRestoreClick={(s) => restoreRecord('sales', s.id)}
        onPermanentDeleteClick={(s) => setConfirmDelete({ id: s.id, name: s.invoiceNo, permanent: true })}
        onBulkDelete={(ids, soft) => bulkDeleteRecords('sales', ids, soft)}
        onImportClick={() => setIsImportOpen(true)}
        onAuditLogsClick={() => setIsAuditOpen(true)}
      />

      {/* Add / Edit Modal */}
      <CrudModal
        isOpen={isAddModalOpen || Boolean(editingSale)}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingSale(null);
        }}
        title="Sales Invoice"
        fields={salesFields}
        initialData={editingSale ? { ...editingSale } : null}
        onSave={handleSaveSale}
      />

      {/* Import Modal */}
      <ImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        title="Sales Invoices"
        onImport={(rows) => importRecords('sales', rows)}
      />

      {/* Audit Log Modal */}
      <AuditLogViewer
        isOpen={isAuditOpen}
        onClose={() => setIsAuditOpen(false)}
        moduleName="sales"
        auditLogs={auditLogs}
      />

      {/* Delete Confirm */}
      {confirmDelete && (
        <ConfirmDialog
          isOpen={Boolean(confirmDelete)}
          onClose={() => setConfirmDelete(null)}
          title={confirmDelete.permanent ? 'Permanently Purge Invoice' : 'Move Invoice to Trash'}
          message={`Are you sure you want to ${
            confirmDelete.permanent ? 'permanently delete' : 'soft delete'
          } Invoice ${confirmDelete.name}?`}
          confirmLabel={confirmDelete.permanent ? 'Permanent Delete' : 'Move to Trash'}
          onConfirm={() => {
            if (confirmDelete.permanent) {
              permanentDeleteRecord('sales', confirmDelete.id);
            } else {
              softDeleteRecord('sales', confirmDelete.id);
            }
          }}
        />
      )}

      {/* View Invoice Modal */}
      {viewingSale && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-600" /> Sales Invoice Details
              </h3>
              <button onClick={() => setViewingSale(null)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl">
                <div>
                  <span className="text-slate-400 block">Invoice No</span>
                  <strong className="font-mono text-base text-slate-900 dark:text-white">{viewingSale.invoiceNo}</strong>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 font-bold">
                  {viewingSale.paymentMethod} Paid
                </span>
              </div>

              <div className="space-y-1">
                <p>Customer: <strong>{viewingSale.customerName}</strong> ({viewingSale.customerType})</p>
                <p>Item: <strong>{viewingSale.itemName}</strong> ({viewingSale.itemCategory})</p>
                <p>Date: {viewingSale.date}</p>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Subtotal ({viewingSale.quantity} x {formatCurrency(viewingSale.unitPrice)}):</span>
                  <span>{formatCurrency(viewingSale.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-rose-500 font-semibold">
                  <span>Discount:</span>
                  <span>- {formatCurrency(viewingSale.discount)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-base font-extrabold">
                  <span>Net Total Paid:</span>
                  <span className="text-emerald-600">{formatCurrency(viewingSale.netAmount)}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  const s = viewingSale;
                  setViewingSale(null);
                  setPrintReceiptData({
                    receiptNumber: s.invoiceNo || `INV-${s.id}`,
                    title: 'POS UNIFORM & STORE SALES RECEIPT',
                    studentName: s.customerName,
                    admissionNo: 'ADM-POS-2026',
                    paymentDate: s.date || new Date().toISOString().split('T')[0],
                    paymentMethod: s.paymentMethod || 'Cash',
                    cashierName: (s as any).cashierName || 'Store Cashier',
                    items: [
                      {
                        name: s.itemName,
                        category: s.itemCategory,
                        qty: s.quantity,
                        unitPrice: s.unitPrice,
                        amount: s.totalAmount,
                      },
                    ],
                    subtotal: s.totalAmount,
                    discount: s.discount || 0,
                    totalAmount: s.netAmount,
                    notes: 'Items once sold can be exchanged within 7 days with tag intact.',
                  });
                }}
                className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center gap-1.5 shadow-md hover:bg-blue-500 mt-3"
              >
                <FileText className="w-4 h-4" /> Print / Thermal Receipt Preview
              </button>
            </div>
          </div>
        </div>
      )}
      </div>

      {/* POS Receipt Print Modal */}
      {printReceiptData && (
        <PrintModal
          isOpen={!!printReceiptData}
          onClose={() => setPrintReceiptData(null)}
          title={`Print Receipt - ${printReceiptData.receiptNumber}`}
          receiptData={printReceiptData}
        />
      )}
    </div>
  );
}
