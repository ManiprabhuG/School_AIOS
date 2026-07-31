import { NextResponse } from 'next/server';
import { db, isDbConnected } from '@/lib/db';
import { useCrudStore } from '@/store/crud-store';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    if (isDbConnected()) {
      // Execute in transaction to safely delete non-essential data
      // while PRESERVING: Students, Staff, Classes/Allocations, Attendance, Suppliers, Users
      await db.$transaction([
        db.accountTransaction.deleteMany({}),
        db.accountAdjustment.deleteMany({}),
        db.financialTransaction.deleteMany({}),
        db.feePayment.deleteMany({}),
        db.purchaseOrder.deleteMany({}),
        db.salesItem.deleteMany({}),
        db.auditLog.deleteMany({}),
      ]);

      // Reset financial accounts current balance back to opening balance
      const accounts = await db.financialAccount.findMany();
      for (const acc of accounts) {
        await db.financialAccount.update({
          where: { id: acc.id },
          data: { currentBalance: acc.openingBalance },
        });
      }

      return NextResponse.json({
        success: true,
        message: 'Successfully cleared all financial, transaction, purchase, sale & ledger data. Students, Staff, Allocations, Attendance, and Suppliers remain completely intact.',
      });
    }

    // Fallback for Zustand store in-memory mode
    const store = useCrudStore.getState();
    useCrudStore.setState({
      financials: [],
      accountTransactions: [],
      accountAdjustments: [],
      feePayments: [],
      purchases: [],
      sales: [],
      auditLogs: [],
      financialAccounts: store.financialAccounts.map((a) => ({
        ...a,
        currentBalance: a.openingBalance,
      })),
    });

    return NextResponse.json({
      success: true,
      message: 'Successfully cleared store financial & ledger data.',
    });
  } catch (error: any) {
    console.error('Failed to clear financial data:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to clear financial data' },
      { status: 500 }
    );
  }
}
