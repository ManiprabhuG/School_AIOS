'use client';

import React from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth-store';
import { useUIStore, ThemeMode } from '@/store/ui-store';
import { initialNotifications } from '@/lib/mock-data';
import {
  Search,
  Bell,
  Sun,
  Moon,
  Laptop,
  Palette,
  User as UserIcon,
  LogOut,
  Shield,
  Menu,
} from 'lucide-react';

export default function Header() {
  const { user, activeRole, logout } = useAuthStore();
  const { theme, setTheme, toggleSidebar, setSearchOpen, setNotificationOpen } = useUIStore();

  const unreadCount = initialNotifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 md:px-6 flex items-center justify-between transition-colors">
      {/* Left section: Mobile menu toggle + Global Search input trigger */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <button
          onClick={() => setSearchOpen(true)}
          className="flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 text-sm w-48 md:w-80 transition-all border border-slate-200/60 dark:border-slate-700/60"
        >
          <Search className="w-4 h-4 text-slate-400" />
          <span className="truncate">Search students, staff, fees...</span>
          <kbd className="hidden md:inline-block ml-auto text-[10px] bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-700 font-mono text-slate-400">
            Ctrl K
          </kbd>
        </button>
      </div>

      {/* Right section: Theme Selector, Notifications, User Profile */}
      <div className="flex items-center gap-3">
        {/* Theme Selector */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
          <button
            onClick={() => setTheme('light')}
            className={`p-1.5 rounded-lg transition-all ${
              theme === 'light' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
            title="Light Theme"
          >
            <Sun className="w-4 h-4" />
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={`p-1.5 rounded-lg transition-all ${
              theme === 'dark' ? 'bg-white dark:bg-slate-700 text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
            title="Dark Theme"
          >
            <Moon className="w-4 h-4" />
          </button>
          <button
            onClick={() => setTheme('blue')}
            className={`p-1.5 rounded-lg transition-all ${
              theme === 'blue' ? 'bg-white dark:bg-slate-700 text-sky-500 shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
            title="Corporate Blue Theme"
          >
            <Palette className="w-4 h-4" />
          </button>
          <button
            onClick={() => setTheme('auto')}
            className={`p-1.5 rounded-lg transition-all ${
              theme === 'auto' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
            title="Auto Theme"
          >
            <Laptop className="w-4 h-4" />
          </button>
        </div>

        {/* Notifications Button */}
        <button
          onClick={() => setNotificationOpen(true)}
          className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200/60 dark:border-slate-700/60"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>

        {/* User Profile Badge */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-200 dark:border-slate-800">
          <Link href="/profile" className="flex items-center gap-2 group">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={user?.name || 'User Avatar'}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-blue-500/30 group-hover:ring-blue-500 transition-all"
            />
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 transition-colors">
                {user?.name}
              </span>
              <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-900 inline-block w-fit">
                {activeRole}
              </span>
            </div>
          </Link>

          <button
            onClick={logout}
            className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
