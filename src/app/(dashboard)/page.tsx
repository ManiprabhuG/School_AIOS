'use client';

export const dynamic = 'force-dynamic';

import React from 'react';
import KPICards from '@/components/dashboard/KPICards';
import DashboardCharts from '@/components/dashboard/DashboardCharts';
import DashboardWidgets from '@/components/dashboard/DashboardWidgets';
import { useAuthStore } from '@/store/auth-store';
import { canAccessModule } from '@/lib/permissions';
import { UserPlus, CreditCard, Megaphone, FileSpreadsheet, Sparkles, School } from 'lucide-react';
import Link from 'next/link';

export default function DashboardHome() {
  const { user, activeRole } = useAuthStore();

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden p-6 md:p-8 rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-sky-500 text-white shadow-xl">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-sky-100 mb-3 border border-white/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>ABS School ERP Administration Platform</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name || 'Administrator'}!
            </h1>
            <p className="text-sm md:text-base text-blue-100 mt-1 max-w-2xl">
              Logged in as <strong className="underline decoration-sky-300 font-semibold">{activeRole}</strong>. Today is {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2.5">
            {canAccessModule(activeRole, '/students') && (
              <Link
                href="/students"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-blue-700 font-bold text-xs hover:bg-blue-50 transition-all shadow-md active:scale-95"
              >
                <UserPlus className="w-4 h-4" /> Add Student
              </Link>
            )}
            {canAccessModule(activeRole, '/fees') && (
              <Link
                href="/fees"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-400/30 text-white font-bold text-xs hover:bg-sky-400/40 transition-all backdrop-blur-md border border-white/20 active:scale-95"
              >
                <CreditCard className="w-4 h-4" /> Collect Fee
              </Link>
            )}
            {canAccessModule(activeRole, '/announcements') && (
              <Link
                href="/announcements"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-400/30 text-white font-bold text-xs hover:bg-sky-400/40 transition-all backdrop-blur-md border border-white/20 active:scale-95"
              >
                <Megaphone className="w-4 h-4" /> Post Notice
              </Link>
            )}
            {canAccessModule(activeRole, '/reports') && (
              <Link
                href="/reports"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-400/30 text-white font-bold text-xs hover:bg-sky-400/40 transition-all backdrop-blur-md border border-white/20 active:scale-95"
              >
                <FileSpreadsheet className="w-4 h-4" /> Reports
              </Link>
            )}
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      </div>

      {/* KPI Section (18 Cards) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <School className="w-5 h-5 text-blue-600" /> Executive Key Performance Indicators
          </h2>
          <span className="text-xs text-slate-500 font-medium">Real-time metrics from LKG to 12th Standard</span>
        </div>
        <KPICards />
      </section>

      {/* Charts Section (8 Recharts) */}
      <section className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Academic & Financial Analytics</h2>
          <span className="text-xs text-slate-500 font-medium">Interactive Data Visualizations</span>
        </div>
        <DashboardCharts />
      </section>

      {/* Widgets Section (Timetable, Exams, Recent Fees, Birthdays, Calendar) */}
      <section className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Operational Dashboard Widgets</h2>
          <span className="text-xs text-slate-500 font-medium">Daily Operations & Schedules</span>
        </div>
        <DashboardWidgets />
      </section>
    </div>
  );
}
