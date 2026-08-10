'use client';

import React from 'react';
import { PrintableHeader, PrintableFooter, TemplateBranding, defaultBranding } from './TemplateHeaderFooter';

export interface ReceiptItem {
  name: string;
  category?: string;
  qty?: number;
  unitPrice?: number;
  amount: number;
}

export interface ReceiptData {
  receiptNumber: string;
  title: string;
  studentName?: string;
  admissionNo?: string;
  className?: string;
  section?: string;
  parentName?: string;
  employeeName?: string;
  employeeId?: string;
  supplierName?: string;
  paymentDate: string;
  paymentMethod: string;
  cashierName: string;
  items: ReceiptItem[];
  subtotal: number;
  discount?: number;
  taxOrFine?: number;
  totalAmount: number;
  remainingBalance?: number;
  notes?: string;
}

interface ReceiptTemplateProps {
  data: ReceiptData;
  branding?: TemplateBranding;
  paperFormat?: 'A4' | 'Letter' | '58mm' | '80mm';
}

export default function ReceiptTemplate({
  data,
  branding = defaultBranding,
  paperFormat = 'A4',
}: ReceiptTemplateProps) {
  const isThermal = paperFormat === '58mm' || paperFormat === '80mm';

  return (
    <div
      className={`bg-white text-slate-950 font-sans mx-auto p-4 ${
        paperFormat === '58mm'
          ? 'thermal-58mm border-2 border-slate-950'
          : paperFormat === '80mm'
          ? 'thermal-80mm border-2 border-slate-950'
          : 'max-w-3xl border-2 border-slate-950 rounded-xl p-8 shadow-none'
      }`}
    >
      {/* Header */}
      <PrintableHeader
        branding={branding}
        documentTitle={data.title}
        docNumber={data.receiptNumber}
        generatedDate={data.paymentDate}
        generatedBy={data.cashierName}
        isThermal={isThermal}
      />

      {/* Primary Details Grid */}
      <div className={`py-3 ${isThermal ? 'text-[10px] space-y-1' : 'grid grid-cols-2 gap-4 text-xs bg-slate-100 p-4 rounded-lg border-2 border-slate-950 mb-4'}`}>
        {data.studentName && (
          <div>
            <span className="font-black text-slate-950">Student Name: </span>
            <span className="font-extrabold text-slate-950">{data.studentName}</span>
          </div>
        )}

        {data.admissionNo && (
          <div>
            <span className="font-black text-slate-950">Admission No: </span>
            <span className="font-extrabold text-slate-950">{data.admissionNo}</span>
          </div>
        )}

        {(data.className || data.section) && (
          <div>
            <span className="font-black text-slate-950">Class & Sec: </span>
            <span className="font-extrabold text-slate-950">{data.className || ''} {data.section || ''}</span>
          </div>
        )}

        {data.parentName && (
          <div>
            <span className="font-black text-slate-950">Parent/Guardian: </span>
            <span className="font-extrabold text-slate-950">{data.parentName}</span>
          </div>
        )}

        {data.employeeName && (
          <div>
            <span className="font-black text-slate-950">Employee: </span>
            <span className="font-extrabold text-slate-950">{data.employeeName} ({data.employeeId || ''})</span>
          </div>
        )}

        {data.supplierName && (
          <div>
            <span className="font-black text-slate-950">Supplier: </span>
            <span className="font-extrabold text-slate-950">{data.supplierName}</span>
          </div>
        )}

        <div>
          <span className="font-black text-slate-950">Payment Method: </span>
          <span className="font-extrabold text-slate-950">{data.paymentMethod}</span>
        </div>

        <div>
          <span className="font-black text-slate-950">Cashier: </span>
          <span className="font-extrabold text-slate-950">{data.cashierName}</span>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full text-left border-collapse my-3 border-2 border-slate-950">
        <thead>
          <tr className={`bg-slate-950 text-white ${isThermal ? 'text-[10px]' : 'text-xs'}`}>
            <th className="py-2 px-3 font-black text-white uppercase border-r border-slate-800">Description</th>
            {data.items.some((i) => i.qty) && <th className="py-2 px-3 font-black text-white text-center border-r border-slate-800">Qty</th>}
            {data.items.some((i) => i.unitPrice) && <th className="py-2 px-3 font-black text-white text-right border-r border-slate-800">Price</th>}
            <th className="py-2 px-3 font-black text-white text-right">Amount</th>
          </tr>
        </thead>
        <tbody className={`divide-y divide-slate-300 ${isThermal ? 'text-[10px]' : 'text-xs'}`}>
          {data.items.map((item, idx) => (
            <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-100/60'}>
              <td className="py-2 px-3 font-bold text-slate-950 border-r border-slate-300">
                {item.name}
                {item.category && <span className="text-[10px] text-slate-700 block font-semibold">{item.category}</span>}
              </td>
              {data.items.some((i) => i.qty) && <td className="py-2 px-3 text-center font-bold text-slate-950 border-r border-slate-300">{item.qty || 1}</td>}
              {data.items.some((i) => i.unitPrice) && (
                <td className="py-2 px-3 text-right font-bold text-slate-950 border-r border-slate-300">₹{(item.unitPrice || item.amount).toLocaleString('en-IN')}</td>
              )}
              <td className="py-2 px-3 text-right font-black text-slate-950">₹{item.amount.toLocaleString('en-IN')}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Financial Totals Calculation */}
      <div className={`mt-4 p-3 rounded-lg bg-slate-950 text-white ${isThermal ? 'text-[10px] space-y-1' : 'w-72 ml-auto text-xs space-y-1.5 border-2 border-slate-950 shadow-sm'}`}>
        <div className="flex justify-between font-bold text-slate-100">
          <span>Total Fee Amount:</span>
          <span>₹{data.subtotal.toLocaleString('en-IN')}</span>
        </div>

        {data.discount && data.discount > 0 ? (
          <div className="flex justify-between text-slate-200 font-bold">
            <span>Discount / Concession:</span>
            <span>- ₹{data.discount.toLocaleString('en-IN')}</span>
          </div>
        ) : null}

        {data.taxOrFine && data.taxOrFine > 0 ? (
          <div className="flex justify-between text-slate-200 font-bold">
            <span>Fine / Tax:</span>
            <span>+ ₹{data.taxOrFine.toLocaleString('en-IN')}</span>
          </div>
        ) : null}

        <div className={`flex justify-between font-black border-t border-slate-700 pt-1 text-white ${isThermal ? 'text-xs' : 'text-sm'}`}>
          <span>Collected Fee Amount:</span>
          <span>₹{data.totalAmount.toLocaleString('en-IN')}</span>
        </div>

        {data.remainingBalance !== undefined && (
          <div className={`flex justify-between font-black pt-1 border-t border-slate-800 ${data.remainingBalance > 0 ? 'text-amber-300' : 'text-emerald-300'}`}>
            <span>Pending Due Amount:</span>
            <span>{data.remainingBalance > 0 ? `₹${data.remainingBalance.toLocaleString('en-IN')}` : '₹0 (Nil)'}</span>
          </div>
        )}
      </div>

      {data.notes && (
        <div className="mt-3 p-3 bg-slate-100 border-2 border-slate-950 rounded-lg text-xs text-slate-950 font-bold">
          <span className="font-black text-slate-950">Remarks: </span>{data.notes}
        </div>
      )}

      {/* Footer */}
      <PrintableFooter
        branding={branding}
        generatedBy={data.cashierName}
        generatedDate={data.paymentDate}
        isThermal={isThermal}
      />
    </div>
  );
}
