'use client';

import React, { useState } from 'react';
import { X, Printer, FileText, Download, FileSpreadsheet, SlidersHorizontal } from 'lucide-react';
import ReceiptTemplate, { ReceiptData } from './ReceiptTemplate';
import ReportTemplate, { ReportData } from './ReportTemplate';
import { TemplateBranding, defaultBranding } from './TemplateHeaderFooter';

export type PaperFormat = 'A4' | 'Letter' | '58mm' | '80mm';

interface PrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  receiptData?: ReceiptData;
  reportData?: ReportData;
  branding?: TemplateBranding;
  onOpenSettings?: () => void;
}

export default function PrintModal({
  isOpen,
  onClose,
  title,
  receiptData,
  reportData,
  branding = defaultBranding,
  onOpenSettings,
}: PrintModalProps) {
  const [paperFormat, setPaperFormat] = useState<PaperFormat>('A4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  if (!isOpen) return null;

  // Direct Browser Print
  const handlePrint = () => {
    window.print();
  };

  // Export CSV Handler
  const handleExportCSV = () => {
    if (!reportData || !reportData.rows || reportData.rows.length === 0) return;

    const headers = reportData.columns.map((c) => `"${c.label}"`).join(',');
    const rows = reportData.rows.map((row) =>
      reportData.columns
        .map((c) => {
          const val = row[c.key];
          return `"${String(val !== undefined && val !== null ? val : '').replace(/"/g, '""')}"`;
        })
        .join(',')
    );

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${reportData.moduleName || 'ERP_Report'}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Excel Handler
  const handleExportExcel = () => {
    if (!reportData || !reportData.rows || reportData.rows.length === 0) return;

    const tableHeaders = reportData.columns.map((c) => `<th>${c.label}</th>`).join('');
    const tableRows = reportData.rows
      .map(
        (row) =>
          `<tr>${reportData.columns
            .map((c) => `<td>${row[c.key] !== undefined && row[c.key] !== null ? row[c.key] : ''}</td>`)
            .join('')}</tr>`
      )
      .join('');

    const excelHTML = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="utf-8"/></head>
      <body>
        <h2>${reportData.title}</h2>
        <table border="1">${tableHeaders}${tableRows}</table>
      </body>
      </html>
    `;

    const blob = new Blob([excelHTML], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportData.moduleName || 'ERP_Report'}_${Date.now()}.xls`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in print-modal-overlay">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] print-modal-content">
        {/* Modal Toolbar Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 no-print">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white tracking-tight">{title}</h2>
              <p className="text-xs text-slate-400">Enterprise Print Engine & PDF Generator</p>
            </div>
          </div>

          {/* Form Factor & Orientation Selectors */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
              <button
                onClick={() => setPaperFormat('A4')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  paperFormat === 'A4' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                A4
              </button>
              <button
                onClick={() => setPaperFormat('Letter')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  paperFormat === 'Letter' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Letter
              </button>
              <button
                onClick={() => setPaperFormat('58mm')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  paperFormat === '58mm' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                58mm
              </button>
              <button
                onClick={() => setPaperFormat('80mm')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  paperFormat === '80mm' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                80mm
              </button>
            </div>

            {reportData && (
              <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
                <button
                  onClick={() => setOrientation('portrait')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    orientation === 'portrait' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Portrait
                </button>
                <button
                  onClick={() => setOrientation('landscape')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    orientation === 'landscape' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Landscape
                </button>
              </div>
            )}
          </div>

          {/* Actions & Settings Button */}
          <div className="flex items-center gap-2">
            {onOpenSettings && (
              <button
                onClick={onOpenSettings}
                className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                title="Branding & Template Settings"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
            )}

            {reportData && (
              <>
                <button
                  onClick={handleExportCSV}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-all"
                  title="Export to CSV"
                >
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span className="hidden sm:inline">CSV</span>
                </button>

                <button
                  onClick={handleExportExcel}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-all"
                  title="Export to Excel"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <span className="hidden sm:inline">Excel</span>
                </button>
              </>
            )}

            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 hover:opacity-95 flex items-center gap-2 transition-all active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Canvas Viewport */}
        <div className="flex-1 p-3 sm:p-6 md:p-8 overflow-y-auto overflow-x-auto bg-slate-950/90 print-area flex justify-center items-start min-h-[400px]">
          {receiptData && (
            <ReceiptTemplate data={receiptData} branding={branding} paperFormat={paperFormat} />
          )}
          {reportData && (
            <ReportTemplate data={reportData} branding={branding} orientation={orientation} />
          )}
        </div>
      </div>
    </div>
  );
}
