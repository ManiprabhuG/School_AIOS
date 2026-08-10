'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { useUIStore, ThemeMode, CompanyProfile } from '@/store/ui-store';
import { useCrudStore } from '@/store/crud-store';
import { FinancialAccount } from '@/types';
import { formatCurrency } from '@/lib/utils';
import {
  Settings,
  School,
  Palette,
  Shield,
  Save,
  Check,
  Download,
  Upload,
  RotateCcw,
  Image,
  Trash2,
  FileSpreadsheet,
  Building2,
  MapPin,
  Hash,
  Phone,
  Mail,
  Globe,
  Award,
  Landmark,
  Plus,
  Edit,
  Sliders,
  DollarSign,
  AlertTriangle,
  History,
  Lock,
} from 'lucide-react';

export default function SettingsPage() {
  const { theme, setTheme, companyProfile, updateCompanyProfile } = useUIStore();
  const {
    financialAccounts,
    seedDefaultAccounts,
    addFinancialAccount,
    updateFinancialAccount,
    adjustAccountBalance,
    pmConfig,
    setPmConfig,
    resetToDefaultData,
    logAudit,
  } = useCrudStore();

  const [activeTab, setActiveTab] = useState<'profile' | 'financial-accounts'>('profile');
  const [saved, setSaved] = useState(false);
  const [cleanupReport, setCleanupReport] = useState<any[] | null>(null);


  // Financial Accounts Modals
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<FinancialAccount | null>(null);
  const [adjustModalAccount, setAdjustModalAccount] = useState<FinancialAccount | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<number>(0);
  const [adjustType, setAdjustType] = useState<'CREDIT' | 'DEBIT'>('CREDIT');
  const [adjustReason, setAdjustReason] = useState<string>('');

  // Account Form State
  const [accForm, setAccForm] = useState<{
    accountName: string;
    accountCode: string;
    accountType: 'School Bank Account' | 'Cash Fund Account';
    bankName: string;
    branch: string;
    accountNumber: string;
    ifscCode: string;
    openingBalance: number;
    openingDate: string;
    status: 'ACTIVE' | 'INACTIVE';
    description: string;
  }>({
    accountName: '',
    accountCode: '',
    accountType: 'School Bank Account',
    bankName: '',
    branch: '',
    accountNumber: '',
    ifscCode: '',
    openingBalance: 0,
    openingDate: new Date().toISOString().split('T')[0],
    status: 'ACTIVE',
    description: '',
  });

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

  useEffect(() => {
    fetch('/api/settings', { cache: 'no-store' })
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) {
          setProfileForm((prev) => ({
            ...prev,
            ...res.data,
            schoolLogo: res.data.schoolLogo || prev.schoolLogo || companyProfile.schoolLogo || '',
          }));
          updateCompanyProfile({
            ...res.data,
            schoolLogo: res.data.schoolLogo || companyProfile.schoolLogo || '',
          });
          if (res.data.theme) {
            setTheme(res.data.theme as ThemeMode);
          }
        }
      })
      .catch((err) => console.error('Failed to load cloud database settings:', err));

    fetch('/api/financial-accounts', { cache: 'no-store' })
      .then((res) => res.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          if (res.data.length === 0) {
            seedDefaultAccounts();
          } else {
            useCrudStore.setState({ financialAccounts: res.data });
          }
        }
      })
      .catch(() => seedDefaultAccounts());
  }, []);

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

  const handleSave = async () => {
    const payload = {
      ...profileForm,
      theme,
    };
    updateCompanyProfile(payload);
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.error('Failed to save settings to cloud database:', err);
    }
    setSaved(true);
    logAudit({
      userId: 'usr-1',
      userName: 'Dr. Rajesh Sharma',
      userRole: 'Super Admin',
      action: 'UPDATE',
      module: 'settings',
      recordId: 'company-profile-settings',
      details: `Updated Company/School profile in Cloud DB: ${profileForm.schoolName}, GSTIN: ${profileForm.gstin}, Pincode: ${profileForm.pincode}`,
    });
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSaveAccount = async () => {
    if (!accForm.accountName.trim()) {
      alert('Please enter Account Name');
      return;
    }

    if (editingAccount) {
      updateFinancialAccount(editingAccount.id, accForm);
      try {
        await fetch('/api/financial-accounts', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingAccount.id, ...accForm }),
        });
      } catch (err) {
        console.error('Failed to update financial account in DB:', err);
      }
    } else {
      const newAccData = {
        ...accForm,
        accountCode: accForm.accountCode || `ACC-${Math.floor(1000 + Math.random() * 9000)}`,
        currentBalance: Number(accForm.openingBalance) || 0,
      };
      addFinancialAccount(newAccData);
      try {
        await fetch('/api/financial-accounts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newAccData),
        });
      } catch (err) {
        console.error('Failed to create financial account in DB:', err);
      }
    }

    setIsAddAccountOpen(false);
    setEditingAccount(null);
    setAccForm({
      accountName: '',
      accountCode: '',
      accountType: 'School Bank Account',
      bankName: '',
      branch: '',
      accountNumber: '',
      ifscCode: '',
      openingBalance: 0,
      openingDate: new Date().toISOString().split('T')[0],
      status: 'ACTIVE',
      description: '',
    });
  };

  const handleAdjustBalanceSubmit = async () => {
    if (!adjustModalAccount || adjustAmount <= 0) {
      alert('Please enter a valid positive adjustment amount');
      return;
    }
    if (!adjustReason.trim()) {
      alert('Please provide a justification reason for the balance adjustment');
      return;
    }

    adjustAccountBalance(adjustModalAccount.id, adjustType, adjustAmount, adjustReason, 'Dr. Rajesh Sharma');

    const newBalance = adjustType === 'CREDIT'
      ? adjustModalAccount.currentBalance + adjustAmount
      : adjustModalAccount.currentBalance - adjustAmount;

    try {
      await fetch('/api/financial-accounts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: adjustModalAccount.id, currentBalance: newBalance }),
      });

      await fetch('/api/account-transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: adjustModalAccount.id,
          accountName: adjustModalAccount.accountName,
          transactionType: adjustType === 'CREDIT' ? 'INCOME' : 'EXPENSE',
          module: 'ADJUSTMENT',
          description: `Balance Adjustment: ${adjustReason}`,
          paymentMethod: 'Internal Adjustment',
          credit: adjustType === 'CREDIT' ? adjustAmount : 0,
          debit: adjustType === 'DEBIT' ? adjustAmount : 0,
          createdBy: 'Dr. Rajesh Sharma',
        }),
      });
    } catch (err) {
      console.error('Failed to sync balance adjustment to DB:', err);
    }

    setAdjustModalAccount(null);
    setAdjustAmount(0);
    setAdjustReason('');
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
      { name: 'FINANCIAL_ACCOUNTS', data: crudState.financialAccounts || [] },
      { name: 'ACCOUNT_TRANSACTIONS', data: crudState.accountTransactions || [] },
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

  const totalFunds = financialAccounts.reduce((sum, a) => sum + a.currentBalance, 0);
  const bankFunds = financialAccounts
    .filter((a) => a.accountType === 'School Bank Account' || a.accountType === 'BANK')
    .reduce((sum, a) => sum + a.currentBalance, 0);
  const cashFunds = financialAccounts
    .filter((a) => a.accountType === 'Cash Fund Account' || a.accountType === 'CASH')
    .reduce((sum, a) => sum + a.currentBalance, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Settings & Central Fund Management
            </h1>
            <p className="text-xs text-slate-500">
              Institution Profile, Financial Fund Accounts, Payment Method Rules & Database Backup
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 hover:opacity-95 transition-all active:scale-95"
          >
            {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saved ? 'Settings Saved!' : 'Save System Settings'}
          </button>
        </div>
      </div>

      {/* Settings Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-4">
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 text-xs font-bold transition-all flex items-center gap-2 border-b-2 ${
            activeTab === 'profile'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" /> Institution & Identity Settings
        </button>

        <button
          onClick={() => setActiveTab('financial-accounts')}
          className={`pb-3 text-xs font-bold transition-all flex items-center gap-2 border-b-2 ${
            activeTab === 'financial-accounts'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Landmark className="w-4 h-4" /> Financial Accounts & Central Funds
          <span className="ml-1 px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-black">
            {financialAccounts.length} Accounts
          </span>
        </button>
      </div>

      {/* TAB 1: INSTITUTION PROFILE */}
      {activeTab === 'profile' && (
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
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Area Pincode *</label>
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
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">GSTIN / GST Number *</label>
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
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Official Contact Phone Number</label>
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
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Official Email Address</label>
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
            </div>
          </div>

          {/* Right Sidebar Options */}
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Palette className="w-5 h-5 text-sky-500" /> Theme & Appearance
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
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

          {/* Database Backup & Export Section */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 lg:col-span-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
                  <Shield className="w-5 h-5 text-emerald-600" /> Database Backup, Export & Maintenance
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Download full data backups including Financial Accounts and Ledgers.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={handleJsonBackup}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
              >
                <Download className="w-4 h-4" /> Download Backup (JSON)
              </button>
              <button
                onClick={handleCsvBackup}
                className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-200" /> Download Backup (CSV)
              </button>
              <label className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all active:scale-95">
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
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 font-bold text-xs rounded-xl border border-slate-200 transition-all ml-auto"
              >
                <RotateCcw className="w-4 h-4" /> Reset Demo Seed Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FINANCIAL ACCOUNTS (FUND MANAGEMENT) */}
      {activeTab === 'financial-accounts' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 block">Total Available Funds</span>
                <p className="text-xl font-black text-emerald-600 tracking-tight">{formatCurrency(totalFunds)}</p>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
                <Landmark className="w-6 h-6" />
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 block">School Bank Balances</span>
                <p className="text-xl font-black text-blue-600 tracking-tight">{formatCurrency(bankFunds)}</p>
              </div>
              <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600">
                <Building2 className="w-6 h-6" />
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 block">Cash In Hand</span>
                <p className="text-xl font-black text-amber-600 tracking-tight">{formatCurrency(cashFunds)}</p>
              </div>
              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950 text-amber-600">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 block">Active Accounts</span>
                <p className="text-xl font-black text-purple-600 tracking-tight">{financialAccounts.length} Active</p>
              </div>
              <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950 text-purple-600">
                <Sliders className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Account Management Main Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-lg flex items-center gap-2">
                  <Landmark className="w-5 h-5 text-blue-600" /> School Fund Accounts
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Central account ledger system tracking bank accounts & cash in hand as real money repositories.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {financialAccounts.length === 0 && (
                  <button
                    onClick={() => seedDefaultAccounts()}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold text-xs border border-amber-200 hover:bg-amber-100 transition-all"
                  >
                    <Sliders className="w-4 h-4" /> Seed Default Accounts
                  </button>
                )}
                <button
                  onClick={() => {
                    setEditingAccount(null);
                    setAccForm({
                      accountName: '',
                      accountCode: `ACC-${Math.floor(1000 + Math.random() * 9000)}`,
                      accountType: 'School Bank Account',
                      bankName: '',
                      branch: '',
                      accountNumber: '',
                      ifscCode: '',
                      openingBalance: 0,
                      openingDate: new Date().toISOString().split('T')[0],
                      status: 'ACTIVE',
                      description: '',
                    });
                    setIsAddAccountOpen(true);
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4" /> Add Fund Account
                </button>
              </div>
            </div>

            {/* Accounts Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-extrabold tracking-wider bg-slate-50 dark:bg-slate-800/50">
                    <th className="p-3.5 rounded-l-xl">Account Name & Code</th>
                    <th className="p-3.5">Account Type</th>
                    <th className="p-3.5">Bank / Account No</th>
                    <th className="p-3.5">Opening Balance</th>
                    <th className="p-3.5">Current Balance</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right rounded-r-xl">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {financialAccounts.map((acc) => {
                    const isCash = acc.accountType === 'Cash Fund Account' || acc.accountType === 'CASH';
                    return (
                      <tr key={acc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="p-3.5">
                          <span className="font-extrabold text-slate-900 dark:text-white block text-sm">
                            {acc.accountName}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400">{acc.accountCode}</span>
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                              isCash
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            }`}
                          >
                            {isCash ? <DollarSign className="w-3 h-3" /> : <Building2 className="w-3 h-3" />}
                            {acc.accountType}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-600 dark:text-slate-300">
                          {isCash ? (
                            <span className="italic text-slate-400">Physical Cash Drawer</span>
                          ) : (
                            <div>
                              <span className="font-bold block text-slate-800 dark:text-slate-100">{acc.bankName || 'N/A'}</span>
                              <span className="font-mono text-[10px] text-slate-400">
                                {acc.accountNumber ? `A/C: ${acc.accountNumber}` : ''} {acc.ifscCode ? `| IFSC: ${acc.ifscCode}` : ''}
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="p-3.5 text-slate-500 font-mono">{formatCurrency(acc.openingBalance)}</td>
                        <td className="p-3.5">
                          <span className="font-black text-sm text-emerald-600 dark:text-emerald-400 font-mono">
                            {formatCurrency(acc.currentBalance)}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                              acc.status === 'ACTIVE' || acc.status === 'Active'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                            }`}
                          >
                            {acc.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right space-x-2">
                          <button
                            onClick={() => {
                              setEditingAccount(acc);
                              setAccForm({
                                accountName: acc.accountName,
                                accountCode: acc.accountCode,
                                accountType: (acc.accountType === 'CASH' ? 'Cash Fund Account' : acc.accountType) as any,
                                bankName: acc.bankName || '',
                                branch: acc.branch || '',
                                accountNumber: acc.accountNumber || '',
                                ifscCode: acc.ifscCode || '',
                                openingBalance: acc.openingBalance,
                                openingDate: acc.openingDate,
                                status: (acc.status === 'Active' ? 'ACTIVE' : acc.status) as any,
                                description: acc.description || '',
                              });
                              setIsAddAccountOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 text-slate-600 hover:text-blue-600 transition-colors"
                            title="Edit Account"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setAdjustModalAccount(acc);
                              setAdjustAmount(0);
                              setAdjustType('CREDIT');
                              setAdjustReason('');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 font-bold text-[11px] transition-colors"
                            title="Adjust Balance"
                          >
                            Adjust Balance
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {financialAccounts.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        No financial accounts created yet. Click "Seed Default Accounts" or "Add Fund Account".
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Account Settings & Business Rules Panel */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <Lock className="w-5 h-5 text-amber-500" /> Account Security & Reporting Rules
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              {/* Negative Balance Rule */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <strong className="text-slate-900 dark:text-white font-bold block text-sm">
                      Prevent Negative Account Balances
                    </strong>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      Block disbursements or expenses if selected account has insufficient funds.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={pmConfig.preventNegativeBal}
                    onChange={(e) => setPmConfig({ preventNegativeBal: e.target.checked })}
                    className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </div>
              </div>

                {/* Digital Payment Wording Selector */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-3">
                  <div>
                    <strong className="text-slate-900 dark:text-white font-bold block text-sm">
                      Preferred Digital Collections Report Wording
                    </strong>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      Select preferred wording for UPI/Online transactions in executive financial reports.
                    </p>
                  </div>
                  <select
                    value={pmConfig.digitalLabel}
                    onChange={(e) => setPmConfig({ digitalLabel: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold"
                  >
                    <option value="Digital Collections">Digital Collections</option>
                    <option value="Electronic Payments">Electronic Payments</option>
                    <option value="Online Collections">Online Collections</option>
                    <option value="Digital Transactions">Digital Transactions</option>
                  </select>
                </div>

                {/* Data Management & Reset Demo Seed Data Panel */}
                <div className="md:col-span-2 p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 space-y-4">
                  <div>
                    <strong className="text-rose-900 dark:text-rose-300 font-bold block text-sm flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-rose-600" /> Data Management & Demo Data Cleanup
                    </strong>
                    <p className="text-rose-700 dark:text-rose-400 text-xs mt-1 leading-relaxed">
                      Wipe all demo purchases, sales, inventory, announcements, notifications, vouchers, central ledger entries, fee payments, exam marks, and audit logs from TiDB Cloud.
                      <strong className="block mt-1 font-bold text-rose-900 dark:text-rose-200">
                        🛡️ STRICTLY PRESERVED: Students, Staff, Staff Allocation (Classes/Sections), Attendance, Fee Structure, Suppliers, Roles & Permissions, System Settings, and Admin Accounts will NOT be deleted.
                      </strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={async () => {
                        if (
                          !confirm(
                            'Are you sure you want to execute Reset Demo Seed Data?\n\nThis will remove all sample/demo transactions, purchases, sales, inventory, announcements, and vouchers.\n\nStudents, Staff, Staff Allocation, Attendance, Fee Structure, and Suppliers will remain COMPLETELY INTACT.'
                          )
                        ) {
                          return;
                        }

                        try {
                          resetToDefaultData();
                          const res = await fetch('/api/admin/clear-demo-data', { method: 'POST' });
                          const json = await res.json();
                          if (json.success) {
                            setCleanupReport(json.report);
                          } else {
                            alert(json.error || 'Failed to clear demo seed data');
                          }
                        } catch (err) {
                          console.error('Failed to clear demo data:', err);
                          alert('Failed to clear demo data');
                        }
                      }}
                      className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" /> Reset Demo Seed Data
                    </button>
                  </div>
                </div>
              </div>
            </div>


        </div>
      )}

      {/* CREATE / EDIT ACCOUNT MODAL */}
      {isAddAccountOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Landmark className="w-5 h-5 text-blue-600" />
                {editingAccount ? 'Edit School Fund Account' : 'Create New School Fund Account'}
              </h3>
              <button onClick={() => setIsAddAccountOpen(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="md:col-span-2">
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Account Name *</label>
                <input
                  type="text"
                  value={accForm.accountName}
                  onChange={(e) => setAccForm({ ...accForm, accountName: e.target.value })}
                  placeholder="e.g. Main School Account or HDFC Account"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Account Code</label>
                <input
                  type="text"
                  value={accForm.accountCode}
                  onChange={(e) => setAccForm({ ...accForm, accountCode: e.target.value })}
                  placeholder="e.g. ACC-001"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Account Type *</label>
                <select
                  value={accForm.accountType}
                  onChange={(e) => setAccForm({ ...accForm, accountType: e.target.value as any })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                >
                  <option value="School Bank Account">School Bank Account</option>
                  <option value="Cash Fund Account">Cash Fund Account</option>
                </select>
              </div>

              {accForm.accountType === 'School Bank Account' && (
                <>
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Bank Name</label>
                    <input
                      type="text"
                      value={accForm.bankName}
                      onChange={(e) => setAccForm({ ...accForm, bankName: e.target.value })}
                      placeholder="e.g. State Bank of India"
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Branch</label>
                    <input
                      type="text"
                      value={accForm.branch}
                      onChange={(e) => setAccForm({ ...accForm, branch: e.target.value })}
                      placeholder="e.g. Main Branch"
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Account Number</label>
                    <input
                      type="text"
                      value={accForm.accountNumber}
                      onChange={(e) => setAccForm({ ...accForm, accountNumber: e.target.value })}
                      placeholder="e.g. 30129844001"
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">IFSC Code</label>
                    <input
                      type="text"
                      value={accForm.ifscCode}
                      onChange={(e) => setAccForm({ ...accForm, ifscCode: e.target.value })}
                      placeholder="e.g. SBIN0004012"
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono uppercase"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Opening Balance (₹)</label>
                <input
                  type="number"
                  value={accForm.openingBalance}
                  onChange={(e) => setAccForm({ ...accForm, openingBalance: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Opening Date</label>
                <input
                  type="date"
                  value={accForm.openingDate}
                  onChange={(e) => setAccForm({ ...accForm, openingDate: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                />
              </div>

              <div className="md:col-span-2">
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Description / Notes</label>
                <textarea
                  value={accForm.description}
                  onChange={(e) => setAccForm({ ...accForm, description: e.target.value })}
                  placeholder="Purpose of account..."
                  rows={2}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => setIsAddAccountOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAccount}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md"
              >
                {editingAccount ? 'Save Account Changes' : 'Create Account'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADJUST BALANCE MODAL */}
      {adjustModalAccount && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600" /> Manual Balance Adjustment
              </h3>
              <button onClick={() => setAdjustModalAccount(null)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 space-y-1">
                <span className="text-slate-400 font-bold block">Target Account</span>
                <strong className="text-base text-slate-900 dark:text-white font-black">{adjustModalAccount.accountName}</strong>
                <span className="block text-slate-500 font-mono">Current Balance: {formatCurrency(adjustModalAccount.currentBalance)}</span>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Adjustment Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustType('CREDIT')}
                    className={`py-2 rounded-xl font-bold transition-all ${
                      adjustType === 'CREDIT'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                    }`}
                  >
                    + Credit (Increase)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustType('DEBIT')}
                    className={`py-2 rounded-xl font-bold transition-all ${
                      adjustType === 'DEBIT'
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                    }`}
                  >
                    - Debit (Decrease)
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Adjustment Amount (₹) *</label>
                <input
                  type="number"
                  value={adjustAmount || ''}
                  onChange={(e) => setAdjustAmount(Number(e.target.value))}
                  placeholder="e.g. 5000"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-sm"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Justification Reason *</label>
                <textarea
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="Audit reason for manual balance adjustment..."
                  rows={3}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => setAdjustModalAccount(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleAdjustBalanceSubmit}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md"
              >
                Apply Adjustment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CLEANUP REPORT MODAL */}
      {cleanupReport && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-3xl p-6 space-y-4 shadow-2xl animate-in zoom-in-95 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 shrink-0">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Check className="w-5 h-5 text-emerald-600" /> Reset Demo Seed Data - Cleanup Audit Report
              </h3>
              <button onClick={() => { setCleanupReport(null); window.location.reload(); }} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 shrink-0">
              The Reset Demo Seed Data process has completed successfully on TiDB Cloud Production Database. Protected records (Students, Staff, Staff Allocations, Attendance, Fee Structure, Suppliers) were 100% preserved.
            </p>

            <div className="overflow-y-auto flex-1 border border-slate-200 dark:border-slate-800 rounded-2xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase font-extrabold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-3">Table Name</th>
                    <th className="p-3 text-right">Rows Before</th>
                    <th className="p-3 text-right text-rose-600">Rows Deleted</th>
                    <th className="p-3 text-right font-black">Rows Remaining</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {cleanupReport.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-bold text-slate-900 dark:text-white">{item.table}</td>
                      <td className="p-3 text-right font-mono">{item.rowsBefore}</td>
                      <td className="p-3 text-right font-mono font-bold text-rose-600">{item.rowsDeleted}</td>
                      <td className="p-3 text-right font-mono font-black">{item.rowsRemaining}</td>
                      <td className="p-3 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                            item.status === 'Protected'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end shrink-0">
              <button
                onClick={() => { setCleanupReport(null); window.location.reload(); }}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md"
              >
                Close & Refresh Application
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

