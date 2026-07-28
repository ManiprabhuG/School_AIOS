'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Check, Image as ImageIcon } from 'lucide-react';

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

import { StudentAlphabetSearch } from './StudentAlphabetSearch';

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
          {hasStudentField && (
            <div className="p-3 bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-2xl space-y-2">
              <label className="font-extrabold text-blue-950 dark:text-blue-200 text-xs block">
                🔍 Student Quick Search & A-Z Alphabet Filter (Auto-fill Form Details)
              </label>
              <StudentAlphabetSearch
                onSelectStudent={handleStudentAutoFill}
                selectedStudentId={formData.studentId || formData.entityId}
                placeholder="Type student name or click A-Z letter to filter and auto-fill form..."
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {fields.map((field) => {
              const isHidden = typeof field.hidden === 'function' ? field.hidden(formData) : Boolean(field.hidden);
              if (isHidden) return null;

              const isReadOnly = field.readOnly || field.name === 'id' || field.name.toLowerCase().endsWith('id') || field.name.toLowerCase().endsWith('no') || field.name.toLowerCase().endsWith('number') || field.name.toLowerCase().endsWith('code');
              const colSpanClass = field.colSpan === 2 ? 'sm:col-span-2' : '';
              
              return (
                <div key={field.name} className={`space-y-1.5 ${colSpanClass}`}>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block text-xs">
                    {field.label}
                  </label>

                  {field.type === 'select' ? (
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
                  ) : (
                    <input
                      type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
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
