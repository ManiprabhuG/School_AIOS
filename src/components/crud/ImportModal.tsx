'use client';

import React, { useState } from 'react';
import { X, Upload, FileSpreadsheet, Check, AlertCircle } from 'lucide-react';
import { parseImportFile } from '@/lib/export-utils';
import { validateFileSignature } from '@/lib/file-security';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  onImport: (rows: Record<string, any>[]) => void;
}

export function ImportModal({ isOpen, onClose, title, onImport }: ImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<Record<string, any>[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setLoading(true);
    setError('');

    try {
      const validation = await validateFileSignature(selectedFile);
      if (!validation.isValid) {
        setError(validation.error || 'Invalid or insecure file.');
        setParsedRows([]);
        setLoading(false);
        return;
      }

      const rows = await parseImportFile(selectedFile);
      setParsedRows(rows);
    } catch (err: any) {
      setError(err.message || 'Failed to parse import file.');
      setParsedRows([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCommitImport = () => {
    if (parsedRows.length === 0) return;
    onImport(parsedRows);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">Import {title} Data</h2>
              <p className="text-xs text-slate-500">Upload CSV or Excel (.xlsx) file to bulk insert records</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-6 text-center space-y-2 hover:border-emerald-500 transition-colors">
            <FileSpreadsheet className="w-10 h-10 text-emerald-500 mx-auto" />
            <div>
              <p className="font-bold text-slate-700 dark:text-slate-200">
                {file ? file.name : 'Select or Drop CSV / XLSX file here'}
              </p>
              <p className="text-[11px] text-slate-400">Supports .csv, .xlsx, .xls</p>
            </div>
            <label className="inline-block px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl cursor-pointer shadow-md transition-all">
              Choose File
              <input type="file" accept=".csv, .xlsx, .xls" onChange={handleFileChange} className="hidden" />
            </label>
          </div>

          {loading && <p className="text-center font-bold text-slate-500">Parsing file records...</p>}
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          )}

          {parsedRows.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-800 dark:text-slate-100">
                  Preview ({parsedRows.length} rows ready to import)
                </span>
              </div>
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-x-auto max-h-48">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-100 dark:bg-slate-800 font-bold border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      {Object.keys(parsedRows[0] || {}).map((header) => (
                        <th key={header} className="p-2">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {parsedRows.slice(0, 5).map((row, idx) => (
                      <tr key={idx}>
                        {Object.values(row).map((val: any, i) => (
                          <td key={i} className="p-2">
                            {String(val)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parsedRows.length > 5 && (
                <p className="text-[11px] text-slate-400 italic">Showing first 5 rows preview...</p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-xs">
            Cancel
          </button>
          <button
            disabled={parsedRows.length === 0}
            onClick={handleCommitImport}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 disabled:opacity-50"
          >
            <Check className="w-4 h-4" /> Commit Import ({parsedRows.length})
          </button>
        </div>
      </div>
    </div>
  );
}
