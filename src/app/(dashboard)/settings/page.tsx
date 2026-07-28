'use client';

import React, { useState } from 'react';
import { useUIStore, ThemeMode } from '@/store/ui-store';
import { useCrudStore } from '@/store/crud-store';
import { Settings, School, Palette, Shield, Save, Check, Download, Upload, RotateCcw } from 'lucide-react';

export default function SettingsPage() {
  const { theme, setTheme } = useUIStore();
  const { resetToDefaultData, logAudit } = useCrudStore();
  const [saved, setSaved] = useState(false);

  const [schoolName, setSchoolName] = useState('ABS School');
  const [academicYear, setAcademicYear] = useState('2026 - 2027');
  const [currency, setCurrency] = useState('INR (₹)');
  const [timeZone, setTimeZone] = useState('Asia/Kolkata (IST)');
  const [smtpEmail, setSmtpEmail] = useState('notifications@absschool.edu.in');

  const handleSave = () => {
    setSaved(true);
    logAudit({
      userId: 'usr-1',
      userName: 'Dr. Rajesh Sharma',
      userRole: 'Super Admin',
      action: 'UPDATE',
      module: 'settings',
      recordId: 'school-settings',
      details: 'Updated School settings, academic session year, and SMTP configuration',
    });
    setTimeout(() => setSaved(false), 2000);
  };

  const handleBackup = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(localStorage.getItem('abs_school_erp_crud_store_v1') || '{}');
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `ABS_School_ERP_Full_Backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleRestoreBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonStr = event.target?.result as string;
        if (jsonStr) {
          localStorage.setItem('abs_school_erp_crud_store_v1', jsonStr);
          window.location.reload();
        }
      } catch (err) {
        alert('Invalid backup JSON file.');
      }
    };
    reader.readAsText(file);
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
            <p className="text-xs text-slate-500">Institution Identity, Academic Session, Theme & Backup/Restore Management</p>
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
            <School className="w-5 h-5 text-blue-600" /> School Information & Session
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

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">Currency</label>
                <input
                  type="text"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">Time Zone</label>
                <input
                  type="text"
                  value={timeZone}
                  onChange={(e) => setTimeZone(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                />
              </div>
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

        {/* Database Backup & Restore */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 lg:col-span-2">
          <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-600" /> Database Backup & LocalStorage Reset
          </h3>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleBackup}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md"
            >
              <Download className="w-4 h-4" /> Download Full ERP Database Backup (JSON)
            </button>

            <label className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer">
              <Upload className="w-4 h-4" /> Restore Database Backup
              <input type="file" accept=".json" onChange={handleRestoreBackup} className="hidden" />
            </label>

            <button
              onClick={() => {
                if (confirm('Are you sure you want to reset all store data to default demo seed records?')) {
                  resetToDefaultData();
                  window.location.reload();
                }
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 font-bold text-xs rounded-xl border border-slate-200"
            >
              <RotateCcw className="w-4 h-4" /> Reset to Demo Seed Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
