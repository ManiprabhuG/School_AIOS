'use client';

import React from 'react';
import {
  GraduationCap,
  Users,
  UserCheck,
  CalendarCheck,
  CreditCard,
  TrendingUp,
  AlertCircle,
  BookOpen,
  Bus,
  Boxes,
  Truck,
  ShoppingBag,
  Megaphone,
  Calendar,
  UserPlus,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface KPICardData {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon: React.ElementType;
  color: string;
}

export default function KPICards() {
  const kpiData: KPICardData[] = [
    { title: 'Total Students', value: '2,480', change: '+12% vs last term', isPositive: true, icon: GraduationCap, color: 'from-blue-500 to-indigo-600' },
    { title: 'Boys', value: '1,320', change: '53.2% ratio', isPositive: true, icon: Users, color: 'from-cyan-500 to-blue-600' },
    { title: 'Girls', value: '1,160', change: '46.8% ratio', isPositive: true, icon: Users, color: 'from-pink-500 to-rose-600' },
    { title: 'Total Staff', value: '184', change: 'Fully staffed', isPositive: true, icon: UserCheck, color: 'from-purple-500 to-indigo-600' },
    { title: 'Teaching Staff', value: '124', change: 'PBT & TGT qualified', isPositive: true, icon: UserCheck, color: 'from-violet-500 to-purple-600' },
    { title: 'Non-Teaching Staff', value: '60', change: 'Admin & Maintenance', isPositive: true, icon: UserCheck, color: 'from-slate-500 to-slate-700' },
    { title: "Today's Attendance", value: '95.4%', change: '+1.2% this week', isPositive: true, icon: CalendarCheck, color: 'from-emerald-500 to-teal-600' },
    { title: 'Fee Collection Today', value: formatCurrency(145000), change: '42 transactions', isPositive: true, icon: CreditCard, color: 'from-emerald-600 to-green-700' },
    { title: 'Monthly Fee Collection', value: formatCurrency(3850000), change: '+8.4% target met', isPositive: true, icon: TrendingUp, color: 'from-blue-600 to-cyan-600' },
    { title: 'Pending Fees', value: formatCurrency(420000), change: '18 students due', isPositive: false, icon: AlertCircle, color: 'from-amber-500 to-orange-600' },
    { title: 'Exams Scheduled', value: '4 Exams', change: 'Starting Aug 5', isPositive: true, icon: BookOpen, color: 'from-sky-500 to-blue-600' },
    { title: 'Buses Running', value: '18 Fleet', change: 'All routes active', isPositive: true, icon: Bus, color: 'from-yellow-500 to-amber-600' },
    { title: 'Inventory Items', value: '1,240', change: '4 low stock items', isPositive: false, icon: Boxes, color: 'from-indigo-500 to-blue-600' },
    { title: 'Suppliers', value: '28 Vendors', change: '2 pending bills', isPositive: true, icon: Truck, color: 'from-teal-500 to-emerald-600' },
    { title: 'Purchase Orders', value: '14 Active', change: '₹2.8L in pipeline', isPositive: true, icon: ShoppingBag, color: 'from-violet-600 to-purple-700' },
    { title: 'Announcements', value: '3 Active', change: 'Independence Day', isPositive: true, icon: Megaphone, color: 'from-rose-500 to-pink-600' },
    { title: 'Events This Month', value: '6 Events', change: 'Sports Meet ahead', isPositive: true, icon: Calendar, color: 'from-sky-600 to-indigo-600' },
    { title: 'Visitors Today', value: '24 Guests', change: 'Entry logged', isPositive: true, icon: UserPlus, color: 'from-emerald-500 to-green-600' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      {kpiData.map((kpi, index) => {
        const Icon = kpi.icon;
        return (
          <div
            key={index}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
          >
            <div className="flex items-start justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors">
                {kpi.title}
              </span>
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${kpi.color} flex items-center justify-center text-white shadow-xs`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">{kpi.value}</h3>
              {kpi.change && (
                <p className={`text-[11px] font-medium mt-1 ${kpi.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                  {kpi.change}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
