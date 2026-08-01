'use client';

export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { useCrudStore } from '@/store/crud-store';
import { User, Shield, Mail, Phone, Lock, Save, Check, Edit } from 'lucide-react';

export default function ProfilePage() {
  const { user, activeRole } = useAuthStore();
  const { logAudit } = useCrudStore();

  const [name, setName] = useState(user?.name || 'Dr. Rajesh Sharma');
  const [email, setEmail] = useState(user?.email || 'admin@absschool.edu.in');
  const [phone, setPhone] = useState(user?.phone || '+91 98765 43210');
  const [avatar, setAvatar] = useState(user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80');

  const [isEditing, setIsEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pwdSaved, setPwdSaved] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setIsEditing(false);
    logAudit({
      userId: user?.id || 'usr-1',
      userName: name,
      userRole: activeRole,
      action: 'UPDATE',
      module: 'profile',
      recordId: user?.id || 'usr-1',
      details: `Updated admin profile information for ${name}`,
    });
    setTimeout(() => setSaved(false), 2000);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPwdSaved(true);
    logAudit({
      userId: user?.id || 'usr-1',
      userName: name,
      userRole: activeRole,
      action: 'UPDATE',
      module: 'profile',
      recordId: user?.id || 'usr-1',
      details: `Changed security password for user ${name}`,
    });
    setTimeout(() => setPwdSaved(false), 2000);
    setOldPassword('');
    setNewPassword('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">User Profile & Account Dossier</h1>
            <p className="text-xs text-slate-500">Personal Details, Role Matrix & Password Security</p>
          </div>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-200"
        >
          <Edit className="w-4 h-4" /> {isEditing ? 'Cancel Edit' : 'Edit Profile Information'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Card & Form */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <img src={avatar} alt={name} className="w-20 h-20 rounded-2xl object-cover ring-4 ring-blue-500/20 shrink-0" />
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-extrabold text-xs">
                {activeRole}
              </span>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">{name}</h3>
              <p className="text-xs text-slate-400">Last Active: {user?.lastLogin}</p>
            </div>
          </div>

          {isEditing ? (
            <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-md hover:bg-blue-500"
              >
                <Save className="w-4 h-4" /> Save Profile Details
              </button>
            </form>
          ) : (
            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-500" /> {email}
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-500" /> {phone}
              </p>
              {saved && (
                <p className="text-emerald-600 font-bold flex items-center gap-1">
                  <Check className="w-4 h-4" /> Profile details saved successfully!
                </p>
              )}
            </div>
          )}
        </div>

        {/* Change Security Password */}
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
              <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">New Security Password</label>
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
              {pwdSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {pwdSaved ? 'Password Updated!' : 'Update Security Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
