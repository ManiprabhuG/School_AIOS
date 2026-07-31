import { NextResponse } from 'next/server';
import { db, isDbConnected } from '@/lib/db';
import { useCrudStore } from '@/store/crud-store';

export const dynamic = 'force-dynamic';

export interface CleanupReportItem {
  table: string;
  rowsBefore: number;
  rowsDeleted: number;
  rowsRemaining: number;
  status: 'Protected' | 'Cleaned';
}

export async function POST(request: Request) {
  try {
    const report: CleanupReportItem[] = [];

    if (isDbConnected()) {
      const dbAny = db as any;

      // 1. Protected Tables (Measure only, DO NOT DELETE)
      const studentCount = await dbAny.student.count();
      report.push({ table: 'Students (students)', rowsBefore: studentCount, rowsDeleted: 0, rowsRemaining: studentCount, status: 'Protected' });

      const staffCount = await dbAny.staff.count();
      report.push({ table: 'Staff (staff)', rowsBefore: staffCount, rowsDeleted: 0, rowsRemaining: staffCount, status: 'Protected' });

      const classCount = await dbAny.classEntity.count();
      report.push({ table: 'Staff Allocation / Classes (classes)', rowsBefore: classCount, rowsDeleted: 0, rowsRemaining: classCount, status: 'Protected' });

      const attendanceCount = await dbAny.attendanceRecord.count();
      report.push({ table: 'Attendance (attendance_records)', rowsBefore: attendanceCount, rowsDeleted: 0, rowsRemaining: attendanceCount, status: 'Protected' });

      const feeStructCount = await dbAny.feeStructure.count();
      report.push({ table: 'Fee Structure (fee_structures)', rowsBefore: feeStructCount, rowsDeleted: 0, rowsRemaining: feeStructCount, status: 'Protected' });

      const supplierCount = await dbAny.supplier.count();
      report.push({ table: 'Suppliers (suppliers)', rowsBefore: supplierCount, rowsDeleted: 0, rowsRemaining: supplierCount, status: 'Protected' });

      const userCount = await dbAny.user.count();
      report.push({ table: 'Admin Users & Roles (users)', rowsBefore: userCount, rowsDeleted: 0, rowsRemaining: userCount, status: 'Protected' });

      // 2. Target Demo Tables (Measure before, Delete, Measure after)
      const tablesToClean = [
        { name: 'Financial Vouchers (financial_transactions)', model: dbAny.financialTransaction },
        { name: 'Central Account Ledger (account_transactions)', model: dbAny.accountTransaction },
        { name: 'Account Adjustments (account_adjustments)', model: dbAny.accountAdjustment },
        { name: 'Fee Payments (fee_payments)', model: dbAny.feePayment },
        { name: 'Purchase Orders (purchase_orders)', model: dbAny.purchaseOrder },
        { name: 'Sales Items (sales_items)', model: dbAny.salesItem },
        { name: 'Inventory Items (inventory_items)', model: dbAny.inventoryItem },
        { name: 'Announcements (announcements)', model: dbAny.announcement },
        { name: 'Notifications (system_notifications)', model: dbAny.systemNotification },
        { name: 'Exams (exams)', model: dbAny.exam },
        { name: 'Exam Marks (exam_marks)', model: dbAny.examMark },
        { name: 'Audit Logs (audit_logs)', model: dbAny.auditLog },
      ];

      for (const item of tablesToClean) {
        if (item.model) {
          const before = await item.model.count();
          if (before > 0) {
            await item.model.deleteMany({});
          }
          report.push({
            table: item.name,
            rowsBefore: before,
            rowsDeleted: before,
            rowsRemaining: 0,
            status: 'Cleaned',
          });
        }
      }

      // Reset financial accounts current balance back to opening balance
      if (dbAny.financialAccount) {
        const accounts = await dbAny.financialAccount.findMany();
        for (const acc of accounts) {
          await dbAny.financialAccount.update({
            where: { id: acc.id },
            data: { currentBalance: acc.openingBalance },
          });
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Reset Demo Seed Data executed successfully. Protected data remains 100% intact.',
        report,
      });
    }

    // Fallback for Zustand store state
    const store = useCrudStore.getState();
    report.push({ table: 'Students', rowsBefore: store.students.length, rowsDeleted: 0, rowsRemaining: store.students.length, status: 'Protected' });
    report.push({ table: 'Staff', rowsBefore: store.staff.length, rowsDeleted: 0, rowsRemaining: store.staff.length, status: 'Protected' });
    report.push({ table: 'Staff Allocation / Classes', rowsBefore: store.classes.length, rowsDeleted: 0, rowsRemaining: store.classes.length, status: 'Protected' });
    report.push({ table: 'Attendance Records', rowsBefore: 0, rowsDeleted: 0, rowsRemaining: 0, status: 'Protected' });
    report.push({ table: 'Fee Structure', rowsBefore: store.feeStructures.length, rowsDeleted: 0, rowsRemaining: store.feeStructures.length, status: 'Protected' });
    report.push({ table: 'Suppliers', rowsBefore: store.suppliers.length, rowsDeleted: 0, rowsRemaining: store.suppliers.length, status: 'Protected' });

    report.push({ table: 'Purchases', rowsBefore: store.purchases.length, rowsDeleted: store.purchases.length, rowsRemaining: 0, status: 'Cleaned' });
    report.push({ table: 'Sales', rowsBefore: store.sales.length, rowsDeleted: store.sales.length, rowsRemaining: 0, status: 'Cleaned' });
    report.push({ table: 'Inventory', rowsBefore: store.inventory.length, rowsDeleted: store.inventory.length, rowsRemaining: 0, status: 'Cleaned' });
    report.push({ table: 'Announcements', rowsBefore: store.announcements.length, rowsDeleted: store.announcements.length, rowsRemaining: 0, status: 'Cleaned' });
    report.push({ table: 'Fee Payments', rowsBefore: store.feePayments.length, rowsDeleted: store.feePayments.length, rowsRemaining: 0, status: 'Cleaned' });
    report.push({ table: 'Financial Vouchers', rowsBefore: store.financials.length, rowsDeleted: store.financials.length, rowsRemaining: 0, status: 'Cleaned' });
    report.push({ table: 'Central Account Ledger', rowsBefore: store.accountTransactions.length, rowsDeleted: store.accountTransactions.length, rowsRemaining: 0, status: 'Cleaned' });

    store.resetToDefaultData();

    return NextResponse.json({
      success: true,
      message: 'Reset Demo Seed Data executed successfully on local store.',
      report,
    });
  } catch (error: any) {
    console.error('Failed to execute Reset Demo Seed Data:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to execute Reset Demo Seed Data' },
      { status: 500 }
    );
  }
}
