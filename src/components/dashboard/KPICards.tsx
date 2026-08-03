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
  Landmark,
  DollarSign,
  Building2,
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
    financialAccounts,
    accountTransactions,
  } = useCrudStore();

  const activeStudents = students.filter((s: any) => !s.isDeleted && s.status !== 'INACTIVE' && s.status !== 'Transferred');
  const activeStaff = staff.filter((s: any) => !s.isDeleted && s.status !== 'INACTIVE');
  const activeFeePayments = feePayments.filter((p: any) => !p.isDeleted);
  const activeExams = exams.filter((e: any) => !e.isDeleted);
  const activeBuses = buses.filter((b: any) => !b.isDeleted);
  const activeInventory = inventory.filter((i: any) => !i.isDeleted);
  const activeSuppliers = suppliers.filter((s: any) => !s.isDeleted);
  const activePurchases = purchases.filter((p: any) => !p.isDeleted);
  const activeAnnouncements = announcements.filter((a: any) => !a.isDeleted);
  const activeFinancialAccounts = financialAccounts.filter((a: any) => !a.isDeleted);
  const activeAccountTransactions = accountTransactions.filter((t: any) => !t.isDeleted);

  const totalStudentsCount = activeStudents.length;
  const boysCount = activeStudents.filter((s) => s.gender === 'Male').length;
  const girlsCount = activeStudents.filter((s) => s.gender === 'Female').length;
  const totalStaffCount = activeStaff.length;
  const teachingStaffCount = activeStaff.filter((s) => s.role === 'Teacher').length;
  const nonTeachingStaffCount = totalStaffCount - teachingStaffCount;

  const totalFeeCollected = activeFeePayments.reduce((sum, p: any) => sum + (p.amount || p.amountPaid || 0), 0);
  const totalPendingFees = activeStudents.reduce((sum, s: any) => {
    const studentPayments = activeFeePayments.filter(
      (p: any) =>
        p.studentId === s.id ||
        (p.studentName && s.name && p.studentName.trim().toLowerCase() === s.name.trim().toLowerCase())
    );
    const totalPaidForStudent = studentPayments.reduce(
      (pSum: number, p: any) => pSum + Number(p.amount || p.amountPaid || 0),
      0
    );

    const totalFeesForStudent = Number(s.totalFees) || 60000;
    const paidSoFar = Math.max(Number(s.paidFees || 0), totalPaidForStudent);
    const due = Math.max(0, totalFeesForStudent - paidSoFar);

    return sum + due;
  }, 0);
  const totalInventoryCount = activeInventory.reduce((sum, i: any) => sum + (i.quantityInStock || i.quantity || 0), 0);
  const lowStockCount = activeInventory.filter((i: any) => (i.quantityInStock || i.quantity || 0) < (i.minReorderLevel || i.minStock || 10)).length;

  const totalAvailableFunds = activeFinancialAccounts.reduce((sum, a) => sum + a.currentBalance, 0);
  const bankFunds = activeFinancialAccounts
    .filter((a) => a.accountType === 'School Bank Account' || a.accountType === 'BANK')
    .reduce((sum, a) => sum + a.currentBalance, 0);
  const cashInHand = activeFinancialAccounts
    .filter((a) => a.accountType === 'Cash Fund Account' || a.accountType === 'CASH')
    .reduce((sum, a) => sum + a.currentBalance, 0);

  const todayStr = new Date().toISOString().split('T')[0];
  const todaysIncome = activeAccountTransactions
    .filter((t) => t.date === todayStr && t.credit > 0)
    .reduce((sum, t) => sum + t.credit, 0);
  const todaysExpense = activeAccountTransactions
    .filter((t) => t.date === todayStr && t.debit > 0)
    .reduce((sum, t) => sum + t.debit, 0);

  const kpiData: KPICardData[] = [
    { title: 'Available School Funds', value: formatCurrency(totalAvailableFunds), change: `${activeFinancialAccounts.length} fund accounts`, isPositive: true, icon: Landmark, color: 'from-blue-600 to-indigo-700' },
    { title: 'Cash In Hand', value: formatCurrency(cashInHand), change: 'Physical Cash Balance', isPositive: true, icon: DollarSign, color: 'from-amber-500 to-emerald-600' },
    { title: 'Bank Account Balances', value: formatCurrency(bankFunds), change: 'Central Bank Balances', isPositive: true, icon: Building2, color: 'from-indigo-500 to-sky-600' },
    { title: "Today's Collection", value: formatCurrency(todaysIncome), change: "Today's Income", isPositive: true, icon: TrendingUp, color: 'from-emerald-600 to-teal-700' },
    { title: "Today's Expense", value: formatCurrency(todaysExpense), change: "Today's Disbursements", isPositive: false, icon: AlertCircle, color: 'from-rose-500 to-pink-600' },
    { title: 'Total Students', value: totalStudentsCount, change: totalStudentsCount > 0 ? `${totalStudentsCount} active students` : 'No records yet', isPositive: true, icon: GraduationCap, color: 'from-blue-500 to-indigo-600' },
    { title: 'Boys', value: boysCount, change: totalStudentsCount > 0 ? `${((boysCount / totalStudentsCount) * 100).toFixed(1)}% ratio` : '0%', isPositive: true, icon: Users, color: 'from-cyan-500 to-blue-600' },
    { title: 'Girls', value: girlsCount, change: totalStudentsCount > 0 ? `${((girlsCount / totalStudentsCount) * 100).toFixed(1)}% ratio` : '0%', isPositive: true, icon: Users, color: 'from-pink-500 to-rose-600' },
    { title: 'Total Staff', value: totalStaffCount, change: totalStaffCount > 0 ? `${totalStaffCount} active staff` : 'No staff yet', isPositive: true, icon: UserCheck, color: 'from-purple-500 to-indigo-600' },
    { title: 'Teaching Staff', value: teachingStaffCount, change: 'Faculty members', isPositive: true, icon: UserCheck, color: 'from-violet-500 to-purple-600' },
    { title: 'Fee Collection', value: formatCurrency(totalFeeCollected), change: `${activeFeePayments.length} transactions`, isPositive: true, icon: CreditCard, color: 'from-emerald-600 to-green-700' },
    { title: 'Pending Fees', value: formatCurrency(totalPendingFees), change: totalPendingFees > 0 ? 'Outstanding balance' : 'Zero dues', isPositive: totalPendingFees === 0, icon: AlertCircle, color: 'from-amber-500 to-orange-600' },
    { title: 'Exams Scheduled', value: `${activeExams.length} Exams`, change: activeExams.length > 0 ? 'Active exams' : 'No exams scheduled', isPositive: true, icon: BookOpen, color: 'from-sky-500 to-blue-600' },
    { title: 'Buses Running', value: `${activeBuses.length} Fleet`, change: activeBuses.length > 0 ? 'Active routes' : 'No routes added', isPositive: true, icon: Bus, color: 'from-yellow-500 to-amber-600' },
    { title: 'Inventory Items', value: totalInventoryCount, change: lowStockCount > 0 ? `${lowStockCount} low stock items` : 'Stock normal', isPositive: lowStockCount === 0, icon: Boxes, color: 'from-indigo-500 to-blue-600' },
    { title: 'Suppliers', value: `${activeSuppliers.length} Vendors`, change: 'Registered suppliers', isPositive: true, icon: Truck, color: 'from-teal-500 to-emerald-600' },
    { title: 'Purchase Orders', value: `${activePurchases.length} Orders`, change: 'Total POs', isPositive: true, icon: ShoppingBag, color: 'from-violet-600 to-purple-700' },
    { title: 'Announcements', value: `${activeAnnouncements.length} Active`, change: activeAnnouncements.length > 0 ? 'Published notices' : 'No announcements', isPositive: true, icon: Megaphone, color: 'from-rose-500 to-pink-600' },
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
