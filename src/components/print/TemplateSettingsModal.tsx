'use client';

import React, { useState } from 'react';
import { X, SlidersHorizontal, Save, RotateCcw } from 'lucide-react';
import { TemplateBranding, defaultBranding } from './TemplateHeaderFooter';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  branding: TemplateBranding;
  onSave: (updated: TemplateBranding) => void;
}

export default function TemplateSettingsModal({
  isOpen,
  onClose,
  branding,
  onSave,
}: SettingsModalProps) {
  const [formData, setFormData] = useState<TemplateBranding>(branding);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const handleReset = () => {
    setFormData(defaultBranding);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-xs">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <SlidersHorizontal className="w-5 h-5 text-blue-400" />
            <h2 className="text-base font-extrabold text-white">Print Template Customization Settings</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-slate-200">
          <div>
            <label className="font-bold text-slate-300 block mb-1">School Name</label>
            <input
              type="text"
              required
              value={formData.schoolName}
              onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="font-bold text-slate-300 block mb-1">School Official Address</label>
            <textarea
              rows={2}
              required
              value={formData.schoolAddress}
              onChange={(e) => setFormData({ ...formData, schoolAddress: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-300 block mb-1">Contact Phone Numbers</label>
              <input
                type="text"
                required
                value={formData.contactNumber}
                onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">Official Email Address</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-300 block mb-1">Current Academic Year</label>
              <input
                type="text"
                required
                value={formData.academicYear}
                onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">Authorized Signatory Title</label>
              <input
                type="text"
                required
                value={formData.authorizedSignatoryTitle}
                onChange={(e) => setFormData({ ...formData, authorizedSignatoryTitle: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-300 block mb-1">Watermark Text (Optional)</label>
            <input
              type="text"
              value={formData.watermarkText || ''}
              onChange={(e) => setFormData({ ...formData, watermarkText: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="e.g. ABS SCHOOL OFFICIAL"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
            <button
              type="button"
              onClick={handleReset}
              className="px-3.5 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 text-white font-bold flex items-center gap-1.5 shadow-lg shadow-blue-600/30 hover:opacity-95"
              >
                <Save className="w-4 h-4" />
                <span>Save Branding Settings</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
