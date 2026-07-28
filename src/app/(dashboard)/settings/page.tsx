'use client';

import React, { useState } from 'react';
import { useUIStore, ThemeMode, CompanyProfile } from '@/store/ui-store';
import { useCrudStore } from '@/store/crud-store';
import { Settings, School, Palette, Shield, Save, Check, Download, Upload, RotateCcw, Image, Trash2, FileSpreadsheet, Building2, MapPin, Hash, Phone, Mail, Globe, Award } from 'lucide-react';

export default function SettingsPage() {
  const { theme, setTheme, companyProfile, updateCompanyProfile } = useUIStore();
  const { resetToDefaultData, logAudit } = useCrudStore();
  const [saved, setSaved] = useState(false);

  const [profileForm, setProfileForm] = useState<CompanyProfile>({
    schoolName: companyProfile?.schoolName || 'ABS MATRICULATION HIGHER SECONDARY SCHOOL',
    schoolLogo: companyProfile?.schoolLogo || '',
    address: companyProfile?.address || '124, Education Boulevard, Knowledge City, Chennai, Tamil Nadu',
    pincode: companyProfile?.pincode || '600001',
    gstin: companyProfile?.gstin || '33AAAAA0000A1Z5',
    phone: companyProfile?.phone || '+91 44 2800 1122 / +91 98765 43210',
    email: companyProfile?.email || 'info@absschool.edu.in',
    website: companyProfile?.website || 'www.absschool.edu.in',
    academicYear: companyProfile?.academicYear || '2025 - 2026',
    currency: companyProfile?.currency || 'INR (₹)',
    timeZone: companyProfile?.timeZone || 'Asia/Kolkata (IST)',
    affiliationNo: companyProfile?.affiliationNo || 'AFF-TN-2026-99',
    authorizedSignatoryTitle: companyProfile?.authorizedSignatoryTitle || 'Authorized Finance Officer & Principal',
  });

  const handleInputChange = (field: keyof CompanyProfile, value: string) => {
    setProfileForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (.png, .jpg, .svg, .jpeg)');
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      alert('Image file size should be less than 3MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        setProfileForm((prev) => ({ ...prev, schoolLogo: base64 }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setProfileForm((prev) => ({ ...prev, schoolLogo: '' }));
  };

  const handleSave = () => {
    updateCompanyProfile(profileForm);
    setSaved(true);
    logAudit({
      userId: 'usr-1',
      userName: 'Dr. Rajesh Sharma',
      userRole: 'Super Admin',
      action: 'UPDATE',
      module: 'settings',
      recordId: 'company-profile-settings',
      details: `Updated Company/School profile: ${profileForm.schoolName}, GSTIN: ${profileForm.gstin}, Pincode: ${profileForm.pincode}`,
    });
    setTimeout(() => setSaved(false), 2000);
  };

  const handleJsonBackup = () => {
    const backupObj = {
      timestamp: new Date().toISOString(),
      companyProfile: profileForm,
      crudData: JSON.parse(localStorage.getItem('abs_school_erp_crud_store_v1') || '{}'),
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupObj, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `ABS_School_ERP_Backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleCsvBackup = () => {
    const crudState = useCrudStore.getState();
    const entities = [
      { name: 'STUDENTS', data: crudState.students || [] },
      { name: 'STAFF', data: crudState.staff || [] },
      { name: 'FEE_PAYMENTS', data: crudState.feePayments || [] },
      { name: 'EXAMS', data: crudState.exams || [] },
      { name: 'EXAM_MARKS', data: crudState.examMarks || [] },
      { name: 'INVENTORY', data: crudState.inventory || [] },
      { name: 'BUS_ROUTES', data: crudState.buses || [] },
      { name: 'ANNOUNCEMENTS', data: crudState.announcements || [] },
      { name: 'FINANCIAL_TRANSACTIONS', data: crudState.financials || [] },
      { name: 'SALES_ITEMS', data: crudState.sales || [] },
      { name: 'PURCHASE_ORDERS', data: crudState.purchases || [] },
      { name: 'SUPPLIERS', data: crudState.suppliers || [] },
    ];

    let csvContent = '=== ABS SCHOOL ERP FULL SYSTEM MULTI-TABLE CSV BACKUP ===\n';
    csvContent += `Institution Name: "${profileForm.schoolName.replace(/"/g, '""')}"\n`;
    csvContent += `GSTIN: "${profileForm.gstin}" | Pincode: "${profileForm.pincode}"\n`;
    csvContent += `Generated On: ${new Date().toLocaleString()}\n\n`;

    entities.forEach((ent) => {
      csvContent += `\n===============================================\n`;
      csvContent += `MODULE / TABLE: ${ent.name} (${ent.data.length} RECORDS)\n`;
      csvContent += `===============================================\n`;

      if (ent.data.length > 0) {
        const keys = Object.keys(ent.data[0]);
        csvContent += keys.map((k) => `"${k}"`).join(',') + '\n';

        ent.data.forEach((row: any) => {
          const line = keys
            .map((k) => {
              const val = row[k];
              const strVal = typeof val === 'object' ? JSON.stringify(val) : String(val ?? '');
              return `"${strVal.replace(/"/g, '""')}"`;
            })
            .join(',');
          csvContent += line + '\n';
        });
      } else {
        csvContent += '(No records in this module)\n';
      }
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `ABS_School_ERP_Full_Backup_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleRestoreBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) return;
        const parsed = JSON.parse(text);
        if (parsed.companyProfile) {
          updateCompanyProfile(parsed.companyProfile);
        }
        if (parsed.crudData) {
          localStorage.setItem('abs_school_erp_crud_store_v1', JSON.stringify(parsed.crudData));
        } else {
          localStorage.setItem('abs_school_erp_crud_store_v1', text);
        }
        alert('Backup restored successfully!');
        window.location.reload();
      } catch (err) {
        alert('Invalid backup JSON file format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">System & Institution Settings</h1>
            <p className="text-xs text-slate-500">Company Identity, School Logo, Address, GSTIN, Print Branding & Data Backup</p>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 hover:opacity-95 transition-all active:scale-95"
        >
          {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? 'All Settings Saved!' : 'Save Company Profile'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Company & Institution Profile (2 Columns) */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <Building2 className="w-5 h-5 text-blue-600" /> Company & School Identity (Printed on Invoices & Receipts)
          </h3>

          {/* Logo Upload & Preview Section */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/70 space-y-3">
            <label className="font-bold text-xs text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
              <Image className="w-4 h-4 text-blue-500" /> School / Company Logo Upload
            </label>
            <p className="text-[11px] text-slate-500">
              Upload your official school logo image. This logo will automatically display on all print receipts, fee vouchers, exam marksheets, and report PDFs.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-1">
              {profileForm.schoolLogo ? (
                <div className="relative group">
                  <div className="w-24 h-24 rounded-2xl border-2 border-blue-500/50 bg-white dark:bg-slate-900 p-2 flex items-center justify-center shadow-md">
                    <img src={profileForm.schoolLogo} alt="School Logo Preview" className="max-w-full max-h-full object-contain" />
                  </div>
                  <button
                    onClick={handleRemoveLogo}
                    className="absolute -top-2 -right-2 p-1.5 rounded-full bg-rose-600 text-white shadow-md hover:bg-rose-500 transition-colors"
                    title="Remove Logo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 flex flex-col items-center justify-center text-slate-400 p-2">
                  <School className="w-8 h-8 mb-1 opacity-60" />
                  <span className="text-[9px] font-bold text-center">No Logo Uploaded</span>
                </div>
              )}

              <div className="space-y-2">
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all">
                  <Upload className="w-4 h-4" /> Upload Logo Image
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                </label>
                <p className="text-[10px] text-slate-400">Supported formats: PNG, JPG, SVG, JPEG (Max 3MB)</p>
              </div>
            </div>
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="md:col-span-2">
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                School / Company Full Name *
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  value={profileForm.schoolName}
                  onChange={(e) => handleInputChange('schoolName', e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-100"
                  placeholder="e.g. ABS MATRICULATION HIGHER SECONDARY SCHOOL"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Full Campus / Premises Address *
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  value={profileForm.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-100"
                  placeholder="e.g. 124, Education Boulevard, Knowledge City, Chennai, Tamil Nadu"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Area Pincode *
              </label>
              <div className="relative">
                <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  value={profileForm.pincode}
                  onChange={(e) => handleInputChange('pincode', e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-100"
                  placeholder="e.g. 600001"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                GSTIN / GST Number *
              </label>
              <div className="relative">
                <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  value={profileForm.gstin}
                  onChange={(e) => handleInputChange('gstin', e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold uppercase text-slate-800 dark:text-slate-100"
                  placeholder="e.g. 33AAAAA0000A1Z5"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Official Contact Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  value={profileForm.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-100"
                  placeholder="e.g. +91 44 2800 1122"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Official Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-100"
                  placeholder="e.g. info@absschool.edu.in"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Website URL
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  value={profileForm.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-100"
                  placeholder="e.g. www.absschool.edu.in"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Affiliation / Board Code
              </label>
              <div className="relative">
                <Award className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  value={profileForm.affiliationNo}
                  onChange={(e) => handleInputChange('affiliationNo', e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-100"
                  placeholder="e.g. AFF-TN-2026-99"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Academic Session Year
              </label>
              <input
                type="text"
                value={profileForm.academicYear}
                onChange={(e) => handleInputChange('academicYear', e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Authorized Signatory Title
              </label>
              <input
                type="text"
                value={profileForm.authorizedSignatoryTitle}
                onChange={(e) => handleInputChange('authorizedSignatoryTitle', e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>
        </div>

        {/* Right Sidebar Options: Appearance & Theme */}
        <div className="space-y-6">
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

          {/* Regional Settings */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-xs">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <Globe className="w-5 h-5 text-indigo-500" /> Regional Locale
            </h3>
            <div>
              <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">Currency Symbol</label>
              <input
                type="text"
                value={profileForm.currency}
                onChange={(e) => handleInputChange('currency', e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">Time Zone</label>
              <input
                type="text"
                value={profileForm.timeZone}
                onChange={(e) => handleInputChange('timeZone', e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
              />
            </div>
          </div>
        </div>

        {/* Database Backup & Restore Section (Full Width) */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 lg:col-span-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-600" /> Database Backup, Export & System Maintenance
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Download full data backups in JSON or CSV formats, restore database state, or reset demo seed records.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            {/* JSON Backup Button */}
            <button
              onClick={handleJsonBackup}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
            >
              <Download className="w-4 h-4" /> Download Backup (JSON)
            </button>

            {/* CSV Backup Button (Placed Next to JSON Button) */}
            <button
              onClick={handleCsvBackup}
              className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-200" /> Download Backup (CSV)
            </button>

            {/* Restore Button */}
            <label className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all active:scale-95">
              <Upload className="w-4 h-4" /> Restore Database Backup
              <input type="file" accept=".json" onChange={handleRestoreBackup} className="hidden" />
            </label>

            {/* Reset Button */}
            <button
              onClick={() => {
                if (confirm('Are you sure you want to reset all store data to default demo seed records?')) {
                  resetToDefaultData();
                  window.location.reload();
                }
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 font-bold text-xs rounded-xl border border-slate-200 transition-all ml-auto"
            >
              <RotateCcw className="w-4 h-4" /> Reset Demo Seed Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
