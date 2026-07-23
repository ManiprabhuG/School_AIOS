'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { User, Shield, Mail, Phone, Lock, Save, Check } from 'lucide-react';

export default function ProfilePage() {
  const { user, activeRole } = useAuthStore();
  const [saved, setSaved] = useState(false);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Admin Profile & Account Settings</h1>
            <p className="text-xs text-slate-500">Personal Details, Persona Role Matrix & Password Security</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Details */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-center md:text-left md:flex md:items-start md:gap-6">
          <img src={user?.avatar} alt={user?.name} className="w-24 h-24 rounded-3xl object-cover ring-4 ring-blue-500/20 mx-auto md:mx-0 shrink-0" />
          <div className="space-y-2 flex-1 text-xs">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-extrabold">
              {activeRole}
            </span>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">{user?.name}</h3>
            <p className="text-slate-500 flex items-center justify-center md:justify-start gap-1">
              <Mail className="w-3.5 h-3.5 text-blue-500" /> {user?.email}
            </p>
            <p className="text-slate-500 flex items-center justify-center md:justify-start gap-1">
              <Phone className="w-3.5 h-3.5 text-blue-500" /> {user?.phone}
            </p>
            <p className="text-slate-400 text-[11px]">Last Login: {user?.lastLogin}</p>
          </div>
        </div>

        {/* Change Password */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <Lock className="w-5 h-5 text-blue-600" /> Change Security Password
          </h3>

          <form onSubmit={handleChangePassword} className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">Current Password</label>
              <input
                type="password"
                required
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md hover:bg-blue-500 transition-all flex items-center justify-center gap-2 mt-2"
            >
              {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {saved ? 'Password Updated!' : 'Update Security Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
