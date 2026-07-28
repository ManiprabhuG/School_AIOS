'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { useUIStore } from '@/store/ui-store';
import { canAccessModule } from '@/lib/permissions';
import { UserRole } from '@/types';
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  CalendarCheck,
  CreditCard,
  BookOpen,
  ShoppingBag,
  Truck,
  ShoppingCart,
  Boxes,
  Landmark,
  Bus,
  Megaphone,
  BarChart3,
  Bell,
  Settings,
  ShieldAlert,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  School,
} from 'lucide-react';

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { title: 'Dashboard', href: '/', icon: LayoutDashboard },
  { title: 'Student Management', href: '/students', icon: GraduationCap },
  { title: 'Staff Management', href: '/staff', icon: Users },
  { title: 'Staff Allocation', href: '/staff/allocation', icon: UserCheck },
  { title: 'Attendance', href: '/attendance', icon: CalendarCheck },
  { title: 'Fees Management', href: '/fees', icon: CreditCard },
  { title: 'Examinations', href: '/examinations', icon: BookOpen },
  { title: 'Purchase ERP', href: '/purchases', icon: ShoppingBag },
  { title: 'Supplier Directory', href: '/suppliers', icon: Truck },
  { title: 'Uniform & POS Sales', href: '/sales', icon: ShoppingCart },
  { title: 'Inventory Stock', href: '/inventory', icon: Boxes },
  { title: 'Finance & Accounts', href: '/finance', icon: Landmark },
  { title: 'Bus Transportation', href: '/bus', icon: Bus },
  { title: 'Announcements', href: '/announcements', icon: Megaphone },
  { title: 'Reports Center', href: '/reports', icon: BarChart3 },
  { title: 'Notification Center', href: '/notifications', icon: Bell },
  { title: 'Admin & Role Matrix', href: '/admin', icon: ShieldAlert },
  { title: 'Settings', href: '/settings', icon: Settings },
];

const allRoles: UserRole[] = [
  'Super Admin',
  'Principal',
  'Vice Principal',
  'Admin',
  'Accountant',
  'Teacher',
  'HR',
  'Receptionist',
  'Librarian',
  'Transport Manager',
  'Inventory Manager',
  'Parent',
  'Student',
];

export default function Sidebar() {
  const pathname = usePathname();
  const { activeRole, switchRole } = useAuthStore();
  const { sidebarOpen, toggleSidebar } = useUIStore();

  const filteredNavItems = navItems.filter((item) => canAccessModule(activeRole, item.href));

  const handleNavClick = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768 && sidebarOpen) {
      toggleSidebar();
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {sidebarOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 z-30 bg-slate-950/60 backdrop-blur-xs md:hidden transition-opacity"
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 bg-slate-900 text-white flex flex-col justify-between shadow-2xl border-r border-slate-800 ${
          sidebarOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full md:translate-x-0 md:w-20'
        }`}
      >
        {/* Brand Header */}
        <div>
          <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 bg-slate-950/60">
            <Link href="/" onClick={handleNavClick} className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/30">
                <School className="w-6 h-6 text-white" />
              </div>
              <div className={`flex flex-col truncate ${!sidebarOpen ? 'md:hidden' : ''}`}>
                <span className="font-extrabold text-lg tracking-wide text-white leading-tight">ABS SCHOOL</span>
                <span className="text-[10px] text-sky-400 font-medium tracking-wider uppercase">Enterprise ERP</span>
              </div>
            </Link>
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title={sidebarOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
            >
              {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </button>
          </div>

          {/* Navigation items */}
          <nav className="p-3 space-y-1.5 overflow-y-auto max-h-[calc(100vh-140px)]">
            {filteredNavItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleNavClick}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 group ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-semibold'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`}
                  title={!sidebarOpen ? item.title : undefined}
                >
                  <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-sky-400'}`} />
                  <span className={`truncate ${!sidebarOpen ? 'md:hidden' : ''}`}>{item.title}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Role Switcher */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/80">
          <div className={`${!sidebarOpen ? 'hidden md:block' : ''}`}>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Switch Persona Role</label>
              <select
                value={activeRole}
                onChange={(e) => switchRole(e.target.value as UserRole)}
                className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {allRoles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {!sidebarOpen && (
            <div className="hidden md:flex justify-center" title={`Current Role: ${activeRole}`}>
              <span className="w-8 h-8 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-xs">
                {activeRole[0]}
              </span>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
