'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import GlobalSearchModal from '@/components/layout/GlobalSearchModal';
import NotificationDrawer from '@/components/layout/NotificationDrawer';
import { useUIStore, applyThemeToDOM } from '@/store/ui-store';
import { useAuthStore } from '@/store/auth-store';

import { useCrudStore } from '@/store/crud-store';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { sidebarOpen, theme } = useUIStore();
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [isHydrated, setIsHydrated] = React.useState(false);

  React.useEffect(() => {
    applyThemeToDOM(theme);
  }, [theme]);

  React.useEffect(() => {
    fetch('/api/students')
      .then((res) => res.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          useCrudStore.setState((state) => {
            const dbIds = new Set(res.data.map((d: any) => d.id));
            const localOnly = state.students.filter((s) => !dbIds.has(s.id));
            return { students: [...res.data, ...localOnly] };
          });
        }
      })
      .catch((err) => console.error('Failed to sync students in dashboard layout:', err));

    fetch('/api/staff')
      .then((res) => res.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          useCrudStore.setState((state) => {
            const dbIds = new Set(res.data.map((d: any) => d.id));
            const localOnly = state.staff.filter((s) => !dbIds.has(s.id));
            return { staff: [...res.data, ...localOnly] };
          });
        }
      })
      .catch((err) => console.error('Failed to sync staff in dashboard layout:', err));
  }, []);

  React.useEffect(() => {
    const checkHydration = () => {
      if (useAuthStore.persist?.hasHydrated) {
        setIsHydrated(useAuthStore.persist.hasHydrated());
      } else {
        setIsHydrated(true);
      }
    };
    checkHydration();
    const unsub = useAuthStore.persist?.onFinishHydration?.(() => setIsHydrated(true));
    return () => {
      if (unsub) unsub();
    };
  }, []);

  React.useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.push('/login');
    }
  }, [isHydrated, isAuthenticated, router]);

  if (!isHydrated || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-semibold text-slate-400">Loading ABS ERP Environment...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors">
      <Sidebar />
      <GlobalSearchModal />
      <NotificationDrawer />

      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          sidebarOpen ? 'md:ml-64' : 'md:ml-20'
        }`}
      >
        <Header />
        <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {children}
        </main>

        <footer className="py-4 px-6 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400 bg-white/50 dark:bg-slate-900/50">
          ABS School Management ERP Dashboard &copy; 2026. All Rights Reserved. Built for Excellence in Education.
        </footer>
      </div>
    </div>
  );
}
