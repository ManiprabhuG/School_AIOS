'use client';

import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ComposedChart,
} from 'recharts';

const monthlyAdmissionsData = [
  { month: 'Jan', admissions: 45 },
  { month: 'Feb', admissions: 65 },
  { month: 'Mar', admissions: 120 },
  { month: 'Apr', admissions: 340 },
  { month: 'May', admissions: 180 },
  { month: 'Jun', admissions: 95 },
  { month: 'Jul', admissions: 110 },
];

const feeCollectionData = [
  { month: 'Jan', collected: 24, target: 28 },
  { month: 'Feb', collected: 30, target: 30 },
  { month: 'Mar', collected: 45, target: 40 },
  { month: 'Apr', collected: 78, target: 75 },
  { month: 'May', collected: 52, target: 50 },
  { month: 'Jun', collected: 38, target: 40 },
  { month: 'Jul', collected: 42, target: 45 },
];

const attendanceData = [
  { day: 'Mon', students: 96.2, staff: 98.0 },
  { day: 'Tue', students: 95.8, staff: 97.5 },
  { day: 'Wed', students: 94.5, staff: 96.0 },
  { day: 'Thu', students: 96.0, staff: 98.2 },
  { day: 'Fri', students: 93.8, staff: 95.0 },
  { day: 'Sat', students: 91.2, staff: 94.0 },
];

const classDistributionData = [
  { name: 'Pre-Primary (LKG-UKG)', value: 340, color: '#3b82f6' },
  { name: 'Primary (1st-5th)', value: 720, color: '#0ea5e9' },
  { name: 'Middle (6th-8th)', value: 580, color: '#10b981' },
  { name: 'Secondary (9th-10th)', value: 460, color: '#f59e0b' },
  { name: 'Sr Secondary (11th-12th)', value: 380, color: '#6366f1' },
];

const expenseCategoryData = [
  { name: 'Salaries', value: 48, color: '#3b82f6' },
  { name: 'Infrastructure', value: 18, color: '#10b981' },
  { name: 'Utilities', value: 12, color: '#f59e0b' },
  { name: 'Transport & Fuel', value: 14, color: '#8b5cf6' },
  { name: 'Events & Admin', value: 8, color: '#ec4899' },
];

const revenueVsExpenseData = [
  { month: 'Jan', revenue: 35, expense: 28 },
  { month: 'Feb', revenue: 42, expense: 30 },
  { month: 'Mar', revenue: 60, expense: 35 },
  { month: 'Apr', revenue: 95, expense: 45 },
  { month: 'May', revenue: 68, expense: 38 },
  { month: 'Jun', revenue: 50, expense: 32 },
];

const purchaseAnalyticsData = [
  { category: 'Uniforms', count: 185 },
  { category: 'Books', count: 94 },
  { category: 'IT & Computers', count: 120 },
  { category: 'Stationery', count: 45 },
  { category: 'Furniture', count: 68 },
];

export default function DashboardCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {/* 1. Monthly Admissions */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Monthly Student Admissions</h3>
            <p className="text-xs text-slate-500">2026 Academic Season Trend</p>
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyAdmissionsData}>
              <defs>
                <linearGradient id="admissionColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip />
              <Area type="monotone" dataKey="admissions" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#admissionColor)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Fee Collection vs Target */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Fee Collection vs Target (Lakhs ₹)</h3>
            <p className="text-xs text-slate-500">Monthly Targets & Receipts</p>
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={feeCollectionData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip />
              <Legend />
              <Bar dataKey="collected" fill="#10b981" name="Collected" radius={[4, 4, 0, 0]} />
              <Bar dataKey="target" fill="#94a3b8" name="Target" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Attendance Analytics */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Weekly Attendance Analytics (%)</h3>
            <p className="text-xs text-slate-500">Student vs Staff Turnout</p>
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={attendanceData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
              <YAxis domain={[85, 100]} stroke="#94a3b8" fontSize={12} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="students" stroke="#0ea5e9" strokeWidth={3} name="Students %" dot={{ r: 4 }} />
              <Line type="monotone" dataKey="staff" stroke="#8b5cf6" strokeWidth={3} name="Staff %" dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Class-wise Student Distribution */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Class-wise Student Distribution</h3>
            <p className="text-xs text-slate-500">2,480 Total Enrolled</p>
          </div>
        </div>
        <div className="h-64 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={classDistributionData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                {classDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '11px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 5. Revenue vs Expense */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Revenue vs Expense Comparison</h3>
            <p className="text-xs text-slate-500">Financial Growth (Lakhs ₹)</p>
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={revenueVsExpenseData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" radius={[4, 4, 0, 0]} />
              <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={3} name="Expense" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 6. Purchase & Procurement Breakdown */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Purchase & Procurement (Thousands ₹)</h3>
            <p className="text-xs text-slate-500">Inventory Spend per Category</p>
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={purchaseAnalyticsData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis type="number" stroke="#94a3b8" fontSize={12} />
              <YAxis dataKey="category" type="category" stroke="#94a3b8" fontSize={11} width={90} />
              <Tooltip />
              <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
