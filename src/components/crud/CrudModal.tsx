'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, Save, Plus, Check, Image as ImageIcon, ChevronDown } from 'lucide-react';
import { useCrudStore } from '@/store/crud-store';

export interface FieldConfig {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'date' | 'textarea' | 'image' | 'email' | 'phone';
  required?: boolean;
  readOnly?: boolean;
  hidden?: boolean | ((formData: Record<string, any>) => boolean);
  options?: { label: string; value: string }[];
  placeholder?: string;
  defaultValue?: any;
  colSpan?: 1 | 2;
  addonButton?: { icon?: React.ReactNode; label?: string; onClick: () => void };
}

interface CrudModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  fields: FieldConfig[];
  initialData?: Record<string, any> | null;
  onSave: (data: Record<string, any>, saveAndNew?: boolean) => void;
  onAddSectionClick?: () => void;
  onFormChange?: (formData: Record<string, any>, changedField: string, newValue: any) => Record<string, any> | void;
}

function PersonNameInput({
  field,
  value,
  formData,
  onChange,
  onAutoFill,
}: {
  field: FieldConfig;
  value: string;
  formData: Record<string, any>;
  onChange: (val: string) => void;
  onAutoFill: (person: any) => void;
}) {
  const { students, staff } = useCrudStore();
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const category = (formData.entityType || formData.personType || formData.customerType || '').toLowerCase();
  const isStaffCategory = category === 'staff';
  const list = isStaffCategory ? staff : students;

  const filtered = useMemo(() => {
    const q = (value || '').trim().toLowerCase();
    if (!q) return list;
    return list.filter((item: any) => {
      const name = (item.name || `${item.firstName || ''} ${item.lastName || ''}`).toLowerCase();
      const idStr = (item.admissionNo || item.employeeId || item.empId || item.rollNo || '').toLowerCase();
      const clsStr = (item.className || item.department || '').toLowerCase();
      return name.includes(q) || idStr.includes(q) || clsStr.includes(q);
    });
  }, [list, value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative flex items-center">
        <input
          type="text"
          value={value ?? ''}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          placeholder={field.placeholder || `Click cursor to select ${isStaffCategory ? 'Staff' : 'Student'} name or type...`}
          className="w-full p-2.5 pr-8 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none text-xs"
        />
        <div className="absolute right-2.5 pointer-events-none text-slate-400">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2 max-h-56 overflow-y-auto space-y-1 animate-in fade-in text-xs">
          <div className="px-2 py-1 text-[10px] font-extrabold text-blue-600 dark:text-blue-400 border-b border-slate-100 dark:border-slate-800 flex justify-between">
            <span>Select {isStaffCategory ? 'Staff Member' : 'Student'} ({filtered.length})</span>
            <span>Click to auto-fill</span>
          </div>

          {filtered.length > 0 ? (
            filtered.map((person: any) => {
              const fullName = person.name || `${person.firstName || ''} ${person.lastName || ''}`.trim();
              return (
                <div
                  key={person.id}
                  onMouseDown={() => {
                    onChange(fullName);
                    onAutoFill(person);
                    setIsOpen(false);
                  }}
                  className="p-2 rounded-xl border border-slate-100 dark:border-slate-800/60 hover:border-blue-500 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-blue-50 dark:hover:bg-blue-950/50 cursor-pointer flex items-center justify-between gap-2 transition-all group"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <img
                      src={person.photo || person.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                      alt={fullName}
                      className="w-7 h-7 rounded-lg object-cover shrink-0"
                    />
                    <div className="truncate">
                      <span className="font-extrabold text-slate-900 dark:text-white block truncate group-hover:text-blue-600">
                        {fullName}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                        {isStaffCategory
                          ? `ID: ${person.employeeId || person.empId || 'EMP'} | Dept: ${person.department || 'Staff'}`
                          : `Adm: ${person.admissionNo || 'ADM'} | Class: ${person.className || '10th'}-${person.section || 'A'}`}
                      </span>
                    </div>
                  </div>
                  <span className="shrink-0 px-2 py-0.5 rounded-md bg-blue-600 text-white font-extrabold text-[10px]">
                    Auto-fill
                  </span>
                </div>
              );
            })
          ) : (
            <div className="p-3 text-center text-slate-400 text-xs">
              No matching {isStaffCategory ? 'staff' : 'students'} found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

import { StudentAlphabetSearch } from './StudentAlphabetSearch';

const formatDateForInput = (val: any) => {
  if (!val) return new Date().toISOString().slice(0, 10);
  const str = String(val).trim();
  if (str.includes('T')) return str.split('T')[0];
  if (str.length >= 10 && str.includes('-')) return str.slice(0, 10);
  const parsed = new Date(val);
  if (!isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
  return new Date().toISOString().slice(0, 10);
};

export function CrudModal({
  isOpen,
  onClose,
  title,
  fields,
  initialData,
  onSave,
  onAddSectionClick,
  onFormChange,
}: CrudModalProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const isEdit = Boolean(initialData);

  const hasStudentField = fields.some(
    (f) =>
      f.name === 'studentName' ||
      f.name === 'studentId' ||
      f.name === 'customerName' ||
      (f.name === 'name' && (title.toLowerCase().includes('attendance') || title.toLowerCase().includes('fee') || title.toLowerCase().includes('mark') || title.toLowerCase().includes('sale') || title.toLowerCase().includes('bus') || title.toLowerCase().includes('entry')))
  );

  const handleStudentAutoFill = (student: any) => {
    setFormData((prev) => {
      const updated = {
        ...prev,
        studentName: student.name,
        name: student.name,
        customerName: student.name,
        studentId: student.id,
        entityId: student.id,
        admissionNo: student.admissionNo,
        rollNo: student.rollNo,
        className: student.className,
        section: student.section,
        course: student.course || '',
        parentPhone: student.parentPhone,
        parentEmail: student.parentEmail || '',
        dueFees: student.dueFees || 0,
        amount: prev.amount || student.dueFees || 0,
        address: student.address,
      };
      if (onFormChange) {
        const overrides = onFormChange(updated, 'studentName', student.name);
        if (overrides) Object.assign(updated, overrides);
      }
      return updated;
    });
  };

  const generateAutoId = (fieldName: string) => {
    const timestamp = Date.now().toString().slice(-4);
    const lowerName = fieldName.toLowerCase();
    if (lowerName.includes('student')) return `STD-2026-${timestamp}`;
    if (lowerName.includes('staff') || lowerName.includes('emp')) return `EMP-${timestamp}`;
    if (lowerName.includes('supplier')) return `SUP-${timestamp}`;
    if (lowerName.includes('purchase') || lowerName.includes('po')) return `PO-2026-${timestamp}`;
    if (lowerName.includes('sale') || lowerName.includes('inv')) return `INV-2026-${timestamp}`;
    if (lowerName.includes('fee') || lowerName.includes('rcp') || lowerName.includes('receipt')) return `RCP-2026-${timestamp}`;
    if (lowerName.includes('bus') || lowerName.includes('route')) return `ROUTE-${timestamp.slice(-2)}`;
    if (lowerName.includes('item') || lowerName.includes('product') || lowerName.includes('inv')) return `ITEM-${timestamp}`;
    if (lowerName.includes('exam')) return `EXAM-${timestamp}`;
    if (lowerName.includes('announcement')) return `ANN-${timestamp}`;
    if (lowerName.includes('voucher') || lowerName.includes('txn')) return `TXN-${timestamp}`;
    return `ID-${timestamp}`;
  };

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      const defaults: Record<string, any> = {};
      fields.forEach((f) => {
        if (f.defaultValue !== undefined) {
          defaults[f.name] = f.defaultValue;
        } else if (f.name === 'id' || f.name.toLowerCase().endsWith('id') || f.name.toLowerCase().endsWith('no') || f.name.toLowerCase().endsWith('number') || f.name.toLowerCase().endsWith('code')) {
          defaults[f.name] = generateAutoId(f.name);
        } else if (f.type === 'number') {
          defaults[f.name] = '';
        } else if (f.type === 'date') {
          defaults[f.name] = new Date().toISOString().slice(0, 10);
        } else if (f.type === 'select' && f.options && f.options.length > 0) {
          defaults[f.name] = f.options[0].value;
        } else {
          defaults[f.name] = '';
        }
      });
      if (onFormChange) {
        const overrides = onFormChange(defaults, '_init', null);
        if (overrides) {
          Object.assign(defaults, overrides);
        }
      }
      setFormData(defaults);
    }
  }, [initialData, fields, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent, saveAndNew: boolean = false) => {
    e.preventDefault();
    onSave(formData, saveAndNew);
    if (saveAndNew) {
      const defaults: Record<string, any> = {};
      fields.forEach((f) => {
        if (f.name === 'id' || f.name.toLowerCase().endsWith('id')) defaults[f.name] = generateAutoId(f.name);
        else if (f.type === 'number') defaults[f.name] = '';
        else if (f.type === 'date') defaults[f.name] = new Date().toISOString().slice(0, 10);
        else if (f.type === 'select' && f.options && f.options.length > 0) defaults[f.name] = f.options[0].value;
        else defaults[f.name] = '';
      });
      if (onFormChange) {
        const overrides = onFormChange(defaults, '_init', null);
        if (overrides) {
          Object.assign(defaults, overrides);
        }
      }
      setFormData(defaults);
    }
  };

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => {
      const nextData = { ...prev, [name]: value };
      if (onFormChange) {
        const overrides = onFormChange(nextData, name, value);
        if (overrides) {
          return { ...nextData, ...overrides };
        }
      }
      return nextData;
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[85vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
            {isEdit ? `Edit ${title}` : `Create New ${title}`}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={(e) => handleSubmit(e, false)} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {fields.map((field) => {
              const isHidden = typeof field.hidden === 'function' ? field.hidden(formData) : Boolean(field.hidden);
              if (isHidden) return null;

              const isReadOnly = field.readOnly || field.name === 'id' || field.name.toLowerCase().endsWith('id') || field.name.toLowerCase().endsWith('no') || field.name.toLowerCase().endsWith('number') || field.name.toLowerCase().endsWith('code');
              const colSpanClass = field.colSpan === 2 ? 'sm:col-span-2' : '';
              const isSupplierForm = title.toLowerCase().includes('supplier');
              const isNameField = !isReadOnly && !isSupplierForm && (field.name === 'name' || field.name === 'studentName' || field.name === 'customerName' || field.name === 'staffName' || field.name === 'postedBy' || field.name === 'driverName');
              
              return (
                <div key={field.name} className={`space-y-1.5 ${colSpanClass}`}>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block text-xs">
                    {field.label}
                  </label>

                  {isNameField ? (
                    <PersonNameInput
                      field={field}
                      value={formData[field.name]}
                      formData={formData}
                      onChange={(v) => handleChange(field.name, v)}
                      onAutoFill={handleStudentAutoFill}
                    />
                  ) : field.type === 'select' ? (
                    <div className="flex items-center gap-2">
                      <select
                        value={formData[field.name] ?? ''}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                        className="flex-1 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none text-xs"
                      >
                        {field.options?.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>

                      {(field.name === 'section' || field.addonButton || onAddSectionClick) && field.name.toLowerCase().includes('section') && (
                        <button
                          type="button"
                          onClick={() => {
                            if (field.addonButton?.onClick) field.addonButton.onClick();
                            else if (onAddSectionClick) onAddSectionClick();
                          }}
                          title="Add New Section"
                          className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center transition-all shadow-sm shrink-0 min-w-[40px] min-h-[40px]"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ) : field.type === 'textarea' ? (
                    <textarea
                      rows={3}
                      value={formData[field.name] ?? ''}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none text-xs"
                    />
                  ) : field.type === 'image' ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        {formData[field.name] ? (
                          <img
                            src={formData[field.name]}
                            alt="Preview"
                            className="w-12 h-12 rounded-xl object-cover ring-2 ring-blue-500/30"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                            <ImageIcon className="w-6 h-6" />
                          </div>
                        )}
                        <input
                          type="text"
                          value={formData[field.name] ?? ''}
                          onChange={(e) => handleChange(field.name, e.target.value)}
                          placeholder="Image URL or upload..."
                          className="flex-1 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-medium text-xs"
                        />
                      </div>
                    </div>
                  ) : field.type === 'date' ? (
                    <input
                      type="date"
                      readOnly={isReadOnly}
                      value={formatDateForInput(formData[field.name])}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      className={`w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none text-xs ${
                        isReadOnly ? 'bg-slate-100 dark:bg-slate-800/60 cursor-not-allowed text-slate-500' : 'bg-slate-50 dark:bg-slate-800'
                      }`}
                    />
                  ) : (
                    <input
                      type={field.type === 'number' ? 'number' : 'text'}
                      readOnly={isReadOnly}
                      value={formData[field.name] ?? ''}
                      onChange={(e) =>
                        handleChange(
                          field.name,
                          field.type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value
                        )
                      }
                      placeholder={field.type === 'number' ? (field.placeholder || '0') : field.placeholder}
                      className={`w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none text-xs ${
                        isReadOnly ? 'bg-slate-100 dark:bg-slate-800/60 cursor-not-allowed text-slate-500' : 'bg-slate-50 dark:bg-slate-800'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </form>

        {/* Modal Footer Buttons */}
        <div className="p-3 sm:p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Cancel
          </button>

          {!isEdit && (
            <button
              type="button"
              onClick={(e) => handleSubmit(e, true)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
            >
              <Plus className="w-4 h-4" /> Save & New
            </button>
          )}

          <button
            type="button"
            onClick={(e) => handleSubmit(e, false)}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-blue-600/30"
          >
            <Save className="w-4 h-4" /> {isEdit ? 'Update Record' : 'Save Record'}
          </button>
        </div>
      </div>
    </div>
  );
}
