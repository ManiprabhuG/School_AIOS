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
import { useCrudStore } from '@/store/crud-store';

interface KPICardData {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon: React.ElementType;
  color: string;
}

export default function KPICards() {
  const {
    students,
    staff,
    feePayments,
    exams,
    buses,
    inventory,
    suppliers,
    purchases,
    announcements,
  } = useCrudStore();

  const totalStudentsCount = students.length;
  const boysCount = students.filter((s) => s.gender === 'Male').length;
  const girlsCount = students.filter((s) => s.gender === 'Female').length;
  const totalStaffCount = staff.length;
  const teachingStaffCount = staff.filter((s) => s.role === 'Teacher').length;
  const nonTeachingStaffCount = totalStaffCount - teachingStaffCount;

  const totalFeeCollected = feePayments.reduce((sum, p: any) => sum + (p.amount || p.amountPaid || 0), 0);
  const totalPendingFees = students.reduce((sum, s) => sum + (s.dueFees || 0), 0);
  const totalInventoryCount = inventory.reduce((sum, i: any) => sum + (i.quantityInStock || i.quantity || 0), 0);
  const lowStockCount = inventory.filter((i: any) => (i.quantityInStock || i.quantity || 0) < (i.minReorderLevel || i.minStock || 10)).length;

  const kpiData: KPICardData[] = [
    { title: 'Total Students', value: totalStudentsCount, change: totalStudentsCount > 0 ? `${totalStudentsCount} active students` : 'No records yet', isPositive: true, icon: GraduationCap, color: 'from-blue-500 to-indigo-600' },
    { title: 'Boys', value: boysCount, change: totalStudentsCount > 0 ? `${((boysCount / totalStudentsCount) * 100).toFixed(1)}% ratio` : '0%', isPositive: true, icon: Users, color: 'from-cyan-500 to-blue-600' },
    { title: 'Girls', value: girlsCount, change: totalStudentsCount > 0 ? `${((girlsCount / totalStudentsCount) * 100).toFixed(1)}% ratio` : '0%', isPositive: true, icon: Users, color: 'from-pink-500 to-rose-600' },
    { title: 'Total Staff', value: totalStaffCount, change: totalStaffCount > 0 ? `${totalStaffCount} active staff` : 'No staff yet', isPositive: true, icon: UserCheck, color: 'from-purple-500 to-indigo-600' },
    { title: 'Teaching Staff', value: teachingStaffCount, change: 'Faculty members', isPositive: true, icon: UserCheck, color: 'from-violet-500 to-purple-600' },
    { title: 'Non-Teaching Staff', value: nonTeachingStaffCount > 0 ? nonTeachingStaffCount : 0, change: 'Admin & Operations', isPositive: true, icon: UserCheck, color: 'from-slate-500 to-slate-700' },
    { title: "Today's Attendance", value: totalStudentsCount > 0 ? '0%' : '0%', change: 'Record attendance', isPositive: true, icon: CalendarCheck, color: 'from-emerald-500 to-teal-600' },
    { title: 'Fee Collection', value: formatCurrency(totalFeeCollected), change: `${feePayments.length} transactions`, isPositive: true, icon: CreditCard, color: 'from-emerald-600 to-green-700' },
    { title: 'Monthly Collection', value: formatCurrency(totalFeeCollected), change: 'Total collected', isPositive: true, icon: TrendingUp, color: 'from-blue-600 to-cyan-600' },
    { title: 'Pending Fees', value: formatCurrency(totalPendingFees), change: totalPendingFees > 0 ? 'Outstanding balance' : 'Zero dues', isPositive: totalPendingFees === 0, icon: AlertCircle, color: 'from-amber-500 to-orange-600' },
    { title: 'Exams Scheduled', value: `${exams.length} Exams`, change: exams.length > 0 ? 'Active exams' : 'No exams scheduled', isPositive: true, icon: BookOpen, color: 'from-sky-500 to-blue-600' },
    { title: 'Buses Running', value: `${buses.length} Fleet`, change: buses.length > 0 ? 'Active routes' : 'No routes added', isPositive: true, icon: Bus, color: 'from-yellow-500 to-amber-600' },
    { title: 'Inventory Items', value: totalInventoryCount, change: lowStockCount > 0 ? `${lowStockCount} low stock items` : 'Stock normal', isPositive: lowStockCount === 0, icon: Boxes, color: 'from-indigo-500 to-blue-600' },
    { title: 'Suppliers', value: `${suppliers.length} Vendors`, change: 'Registered suppliers', isPositive: true, icon: Truck, color: 'from-teal-500 to-emerald-600' },
    { title: 'Purchase Orders', value: `${purchases.length} Orders`, change: 'Total POs', isPositive: true, icon: ShoppingBag, color: 'from-violet-600 to-purple-700' },
    { title: 'Announcements', value: `${announcements.length} Active`, change: announcements.length > 0 ? 'Published notices' : 'No announcements', isPositive: true, icon: Megaphone, color: 'from-rose-500 to-pink-600' },
    { title: 'Events This Month', value: '0 Events', change: 'Academic calendar', isPositive: true, icon: Calendar, color: 'from-sky-600 to-indigo-600' },
    { title: 'Visitors Today', value: '0 Guests', change: 'Visitor log empty', isPositive: true, icon: UserPlus, color: 'from-emerald-500 to-green-600' },
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
