import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db, isDbConnected } from '@/lib/db';
import { useCrudStore } from '@/store/crud-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (isDbConnected()) {
      const accounts = await (db as any).financialAccount.findMany({
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json({ success: true, data: accounts });
    }
  } catch (err) {
    console.error('Database query error (financial-accounts):', err);
  }

  const store = useCrudStore.getState();
  if (store.financialAccounts.length === 0) {
    store.seedDefaultAccounts();
  }
  return NextResponse.json({ success: true, data: store.financialAccounts || [] });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Action: Seed default accounts
    if (body.action === 'seed_defaults') {
      if (isDbConnected()) {
        const existingCount = await (db as any).financialAccount.count();
        if (existingCount === 0) {
          await (db as any).financialAccount.createMany({
            data: [
              {
                id: 'acc-main-001',
                accountName: 'Main School Account',
                accountCode: 'ACC-MAIN-001',
                accountType: 'BANK',
                bankName: 'State Bank of India',
                branch: 'Main Branch, Knowledge City',
                accountNumber: '30129844001',
                ifscCode: 'SBIN0004012',
                openingBalance: 500000,
                currentBalance: 500000,
                openingDate: '2026-04-01',
                status: 'ACTIVE',
                description: 'Central operational bank account for fee receipts and direct disbursements.',
              },
              {
                id: 'acc-cash-001',
                accountName: 'Cash In Hand',
                accountCode: 'ACC-CASH-001',
                accountType: 'CASH',
                openingBalance: 50000,
                currentBalance: 50000,
                openingDate: '2026-04-01',
                status: 'ACTIVE',
                description: 'Main cash fund account for physical cash collected and office cash expenses.',
              },
            ],
          });
        }
        const accounts = await (db as any).financialAccount.findMany();
        return NextResponse.json({ success: true, data: accounts }, { status: 201 });
      }

      const store = useCrudStore.getState();
      store.seedDefaultAccounts();
      return NextResponse.json({ success: true, data: store.financialAccounts }, { status: 201 });
    }

    const openingBal = Number(body.openingBalance) || 0;
    const accountData = {
      id: body.id || `acc-${Date.now()}`,
      accountName: String(body.accountName || 'New Account'),
      accountCode: String(body.accountCode || `ACC-${Math.floor(100 + Math.random() * 900)}`),
      accountType: String(body.accountType || 'School Bank Account'),
      bankName: body.bankName ? String(body.bankName) : null,
      branch: body.branch ? String(body.branch) : null,
      accountNumber: body.accountNumber ? String(body.accountNumber) : null,
      ifscCode: body.ifscCode ? String(body.ifscCode) : null,
      openingBalance: openingBal,
      currentBalance: openingBal,
      openingDate: String(body.openingDate || new Date().toISOString().split('T')[0]),
      status: String(body.status || 'ACTIVE'),
      description: body.description ? String(body.description) : null,
    };

    if (isDbConnected()) {
      const created = await (db as any).financialAccount.create({
        data: accountData,
      });
      return NextResponse.json({ success: true, data: created }, { status: 201 });
    }

    const store = useCrudStore.getState();
    store.addFinancialAccount(accountData as any);
    return NextResponse.json({ success: true, data: accountData }, { status: 201 });

  } catch (error: any) {
    console.error('Failed to create financial account:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Failed to create financial account' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ success: false, error: 'Missing ID' }, { status: 400 });

    if (isDbConnected()) {
      const updated = await (db as any).financialAccount.update({
        where: { id },
        data: updates,
      });
      return NextResponse.json({ success: true, data: updated });
    }

    const store = useCrudStore.getState();
    store.updateFinancialAccount(id, updates);
    return NextResponse.json({ success: true, data: updates });
  } catch (error: any) {
    console.error('Failed to update financial account:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Failed to update financial account' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'Missing ID' }, { status: 400 });

    if (isDbConnected()) {
      await (db as any).financialAccount.delete({
        where: { id },
      });
      revalidatePath('/finance');
      revalidatePath('/settings');
      return NextResponse.json({ success: true });
    }

    const store = useCrudStore.getState();
    store.permanentDeleteRecord('financialAccounts', id);
    revalidatePath('/finance');
    revalidatePath('/settings');
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to delete financial account:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Failed to delete financial account' }, { status: 500 });
  }
}
