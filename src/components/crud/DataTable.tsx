'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  Upload,
  Printer,
  FileSpreadsheet,
  FileText,
  Plus,
  Trash2,
  RotateCcw,
  Eye,
  Edit,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  History,
  CheckSquare,
  AlertCircle,
  MoreVertical,
  X,
} from 'lucide-react';
import { exportToCSV, exportToExcel, exportToPDF, printData } from '@/lib/export-utils';
import PrintModal from '@/components/print/PrintModal';
import { ReportData } from '@/components/print/ReportTemplate';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
}

export interface FilterOption {
  key: string;
  label: string;
  options: { label: string; value: string }[];
}

interface DataTableProps<T extends { id: string; isDeleted?: boolean }> {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  columns: Column<T>[];
  data: T[];
  filterOptions?: FilterOption[];
  onAddClick?: () => void;
  onEditClick?: (item: T) => void;
  onViewClick?: (item: T) => void;
  onSoftDeleteClick?: (item: T) => void;
  onRestoreClick?: (item: T) => void;
  onPermanentDeleteClick?: (item: T) => void;
  onBulkDelete?: (ids: string[], soft: boolean) => void;
  onBulkStatusUpdate?: (ids: string[], statusField: string, statusValue: string) => void;
  onImportClick?: () => void;
  onAuditLogsClick?: () => void;
  statusUpdateOptions?: { field: string; label: string; values: string[] };
  exportFilename?: string;
  addLabel?: string;
  onFilterChange?: (filters: Record<string, string>) => void;
}

export function DataTable<T extends { id: string; isDeleted?: boolean }>({
  title,
  subtitle,
  icon,
  columns,
  data,
  filterOptions = [],
  onAddClick,
  onEditClick,
  onViewClick,
  onSoftDeleteClick,
  onRestoreClick,
  onPermanentDeleteClick,
  onBulkDelete,
  onBulkStatusUpdate,
  onImportClick,
  onAuditLogsClick,
  statusUpdateOptions,
  exportFilename = 'export_records',
  addLabel = 'Register Record',
  onFilterChange,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [showTrash, setShowTrash] = useState(false);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showBulkStatusModal, setShowBulkStatusModal] = useState(false);
  const [bulkStatusVal, setBulkStatusVal] = useState('');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printReportData, setPrintReportData] = useState<ReportData | null>(null);

  // Filter Active vs Soft-deleted
  const records = useMemo(() => {
    return data.filter((item) => (showTrash ? item.isDeleted === true : !item.isDeleted));
  }, [data, showTrash]);

  // Search and Filters
  const filteredRecords = useMemo(() => {
    return records.filter((item) => {
      // Search check
      if (search.trim()) {
        const query = search.toLowerCase();
        const matches = Object.values(item).some((val) => {
          if (val === null || val === undefined) return false;
          return String(val).toLowerCase().includes(query);
        });
        if (!matches) return false;
      }

      // Filter check
      for (const [key, val] of Object.entries(filters)) {
        if (val && val !== 'All') {
          if (String((item as any)[key]) !== val) return false;
        }
      }

      return true;
    });
  }, [records, search, filters]);

  // Sorting
  const sortedRecords = useMemo(() => {
    if (!sortKey) return filteredRecords;
    return [...filteredRecords].sort((a, b) => {
      const valA = (a as any)[sortKey];
      const valB = (b as any)[sortKey];
      if (valA === valB) return 0;
      if (valA === undefined || valA === null) return 1;
      if (valB === undefined || valB === null) return -1;

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      }
      return sortOrder === 'asc'
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  }, [filteredRecords, sortKey, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(sortedRecords.length / pageSize) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedRecords.slice(start, start + pageSize);
  }, [sortedRecords, currentPage, pageSize]);

  // Handle Sort
  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortOrder === 'asc') setSortOrder('desc');
      else setSortKey(null);
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  // Selection handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(paginatedRecords.map((r) => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Export handlers
  const getExportData = () => {
    const exportCols = columns.map((c) => ({ header: c.header, dataKey: c.key }));
    const exportRows = sortedRecords.map((row) => {
      const obj: Record<string, any> = {};
      columns.forEach((c) => {
        obj[c.key] = (row as any)[c.key];
      });
      return obj;
    });
    return { exportCols, exportRows };
  };

  const handleExportCSV = () => {
    const { exportRows } = getExportData();
    exportToCSV(exportFilename, exportRows);
  };

  const handleExportExcel = () => {
    const { exportRows } = getExportData();
    exportToExcel(exportFilename, exportRows);
  };

  const handleExportPDF = () => {
    const { exportCols, exportRows } = getExportData();
    exportToPDF(exportFilename, title, exportCols, exportRows);
  };

  const handlePrint = () => {
    const reportCols = columns.map((c) => ({ key: c.key, label: c.header }));
    const reportRows = sortedRecords.map((row) => {
      const obj: Record<string, any> = {};
      columns.forEach((c) => {
        const rawVal = (row as any)[c.key];
        obj[c.key] = rawVal !== undefined && rawVal !== null ? rawVal : '-';
      });
      return obj;
    });

    setPrintReportData({
      title: title,
      subtitle: subtitle || `Official Master Report - ${exportFilename}`,
      moduleName: exportFilename,
      docNumber: `REP-${Date.now().toString().slice(-6)}`,
      generatedDate: new Date().toLocaleString('en-IN'),
      generatedBy: 'Administrator',
      columns: reportCols,
      rows: reportRows,
      summaryItems: [
        { label: 'Total Records', value: sortedRecords.length, highlight: true },
        { label: 'Folder', value: showTrash ? 'Trash Directory' : 'Active Master' },
        { label: 'Status', value: 'Verified Audit' },
      ],
    });
    setIsPrintModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="no-print space-y-6">
        {/* Top Header Card */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          {icon && <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">{icon}</div>}
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{title}</h1>
            {subtitle && <p className="text-xs text-slate-500 font-medium">{subtitle}</p>}
          </div>
        </div>

        {/* Header Action Tools */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Active / Trash Switcher */}
          <button
            onClick={() => {
              setShowTrash(!showTrash);
              setSelectedIds([]);
              setCurrentPage(1);
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all ${
              showTrash
                ? 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/60 dark:border-rose-900 dark:text-rose-300'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            {showTrash ? 'View Active' : 'View Trash'}
          </button>

          {/* Audit Logs button */}
          {onAuditLogsClick && (
            <button
              onClick={onAuditLogsClick}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
            >
              <History className="w-3.5 h-3.5 text-indigo-500" /> Audit Log
            </button>
          )}

          {/* Import button */}
          {onImportClick && (
            <button
              onClick={onImportClick}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-500" /> Import
            </button>
          )}

          {/* Export Dropdown / Buttons */}
          <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-800 p-0.5 bg-slate-50 dark:bg-slate-800">
            <button
              onClick={handleExportCSV}
              className="px-2.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all"
              title="Export CSV"
            >
              CSV
            </button>
            <button
              onClick={handleExportExcel}
              className="px-2.5 py-1.5 text-xs font-semibold text-emerald-600 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all flex items-center gap-1"
              title="Export Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
            </button>
            <button
              onClick={handleExportPDF}
              className="px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all flex items-center gap-1"
              title="Export PDF"
            >
              <FileText className="w-3.5 h-3.5" /> PDF
            </button>
            <button
              onClick={handlePrint}
              className="px-2.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all"
              title="Print"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Add Record Primary Button */}
          {onAddClick && !showTrash && (
            <button
              onClick={onAddClick}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/25 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" /> {addLabel}
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search all records..."
            className="w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Dynamic Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {filterOptions.map((filter) => (
            <div key={filter.key} className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs font-semibold text-slate-500">{filter.label}:</span>
              <select
                value={filters[filter.key] || 'All'}
                onChange={(e) => {
                  const updated = { ...filters, [filter.key]: e.target.value };
                  setFilters(updated);
                  if (onFilterChange) onFilterChange(updated);
                  setCurrentPage(1);
                }}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium focus:outline-none"
              >
                <option value="All">All {filter.label}s</option>
                {filter.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          ))}

          {/* Reset Filters button */}
          {(search || Object.values(filters).some((v) => v !== 'All')) && (
            <button
              onClick={() => {
                setSearch('');
                setFilters({});
                if (onFilterChange) onFilterChange({});
                setCurrentPage(1);
              }}
              className="text-xs font-semibold text-rose-500 hover:underline"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Bulk Action Toolbar Banner if items selected */}
      {selectedIds.length > 0 && (
        <div className="p-3 bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 font-bold text-blue-900 dark:text-blue-200">
            <CheckSquare className="w-4 h-4 text-blue-600" />
            <span>{selectedIds.length} records selected</span>
          </div>

          <div className="flex items-center gap-2">
            {statusUpdateOptions && onBulkStatusUpdate && !showTrash && (
              <button
                onClick={() => setShowBulkStatusModal(true)}
                className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl font-bold hover:bg-slate-100"
              >
                Bulk Update Status
              </button>
            )}

            {onBulkDelete && (
              <button
                onClick={() => {
                  onBulkDelete(selectedIds, !showTrash);
                  setSelectedIds([]);
                }}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold shadow-xs flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {showTrash ? 'Permanently Purge Selected' : 'Bulk Move to Trash'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-4 w-10">
                  <input
                    type="checkbox"
                    checked={
                      paginatedRecords.length > 0 &&
                      paginatedRecords.every((r) => selectedIds.includes(r.id))
                    }
                    onChange={handleSelectAll}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                </th>

                {columns.map((col) => (
                  <th key={col.key} className="p-4">
                    <button
                      disabled={!col.sortable}
                      onClick={() => col.sortable && handleSort(col.key)}
                      className={`flex items-center gap-1 font-bold ${
                        col.sortable ? 'hover:text-slate-900 dark:hover:text-white' : 'cursor-default'
                      }`}
                    >
                      {col.header}
                      {col.sortable && <ArrowUpDown className="w-3 h-3 text-slate-400" />}
                    </button>
                  </th>
                ))}

                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 2} className="p-8 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <AlertCircle className="w-8 h-8 text-slate-300" />
                      <p className="font-semibold text-slate-500">No records found matching your criteria</p>
                      {showTrash && <p className="text-xs">Trash folder is empty.</p>}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((item) => {
                  const isSelected = selectedIds.includes(item.id);
                  return (
                    <tr
                      key={item.id}
                      className={`transition-colors ${
                        isSelected
                          ? 'bg-blue-50/50 dark:bg-blue-950/30'
                          : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectOne(item.id)}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                      </td>

                      {columns.map((col) => (
                        <td key={col.key} className="p-4 text-slate-700 dark:text-slate-300">
                          {col.render ? col.render(item) : (item as any)[col.key]}
                        </td>
                      ))}

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* View details */}
                          {onViewClick && (
                            <button
                              onClick={() => onViewClick(item)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}

                          {/* Edit details */}
                          {onEditClick && !showTrash && (
                            <button
                              onClick={() => onEditClick(item)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-800 transition-colors"
                              title="Edit Record"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}

                          {/* Soft Delete */}
                          {onSoftDeleteClick && !showTrash && (
                            <button
                              onClick={() => onSoftDeleteClick(item)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors"
                              title="Move to Trash"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}

                          {/* Restore */}
                          {onRestoreClick && showTrash && (
                            <button
                              onClick={() => onRestoreClick(item)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-800 transition-colors"
                              title="Restore Record"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          )}

                          {/* Permanent Delete */}
                          {onPermanentDeleteClick && showTrash && (
                            <button
                              onClick={() => onPermanentDeleteClick(item)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors"
                              title="Permanently Delete"
                            >
                              <Trash2 className="w-4 h-4 text-rose-600" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer & Pagination */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            Showing <strong>{sortedRecords.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</strong> to{' '}
            <strong>{Math.min(currentPage * pageSize, sortedRecords.length)}</strong> of{' '}
            <strong>{sortedRecords.length}</strong> records
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span>Per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg px-2 py-1 focus:outline-none"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 font-bold text-slate-700 dark:text-slate-300">
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Bulk Status Update Modal */}
      {showBulkStatusModal && statusUpdateOptions && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-sm p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                Bulk Update {statusUpdateOptions.label}
              </h3>
              <button onClick={() => setShowBulkStatusModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Select new {statusUpdateOptions.label} for {selectedIds.length} records:
            </p>
            <select
              value={bulkStatusVal}
              onChange={(e) => setBulkStatusVal(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
            >
              <option value="">Select Value...</option>
              {statusUpdateOptions.values.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setShowBulkStatusModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                disabled={!bulkStatusVal}
                onClick={() => {
                  if (onBulkStatusUpdate && bulkStatusVal) {
                    onBulkStatusUpdate(selectedIds, statusUpdateOptions.field, bulkStatusVal);
                    setSelectedIds([]);
                    setShowBulkStatusModal(false);
                  }
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold disabled:opacity-50"
              >
                Apply Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Executive Template Print Preview Modal */}
      {isPrintModalOpen && printReportData && (
        <PrintModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          title={`Print Preview - ${title}`}
          reportData={printReportData}
        />
      )}
    </div>
  );
}
