'use client';

import React, { useState } from 'react';
import { Settings, School, Palette, Shield, Save, Check } from 'lucide-react';
import { useUIStore, ThemeMode } from '@/store/ui-store';

export default function SettingsPage() {
  const { theme, setTheme } = useUIStore();
  const [saved, setSaved] = useState(false);

  const [schoolName, setSchoolName] = useState('ABS School');
  const [academicYear, setAcademicYear] = useState('2026 - 2027');
  const [currency, setCurrency] = useState('INR (₹)');
  const [timeZone, setTimeZone] = useState('Asia/Kolkata (IST)');

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">System & School Settings</h1>
            <p className="text-xs text-slate-500">Institution Identity, Academic Session, Theme Preferences & Security Configuration</p>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition-all active:scale-95"
        >
          {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? 'Settings Saved!' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* School Identity */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <School className="w-5 h-5 text-blue-600" /> School Information
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">School Name</label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">Academic Session Year</label>
              <input
                type="text"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>
        </div>

        {/* Theme Settings */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <Palette className="w-5 h-5 text-sky-500" /> Theme & Appearance
          </h3>

          <div className="space-y-3 text-xs">
            <label className="font-semibold text-slate-600 dark:text-slate-300 block">Select Active ERP Theme</label>
            <div className="grid grid-cols-2 gap-3">
              {(['light', 'dark', 'blue', 'auto'] as ThemeMode[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`p-3 rounded-xl border font-bold capitalize transition-all ${
                    theme === t
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {t} Theme
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
