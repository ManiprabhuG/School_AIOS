import { NextResponse } from 'next/server';
import { db, isDbConnected } from '@/lib/db';
import { useCrudStore } from '@/store/crud-store';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');
    const module = searchParams.get('module');
    const paymentMethod = searchParams.get('paymentMethod');

    if (isDbConnected()) {
      const where: any = {};
      if (accountId) where.accountId = accountId;
      if (module) where.module = module;
      if (paymentMethod) where.paymentMethod = paymentMethod;

      const txs = await db.accountTransaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json({ success: true, data: txs });
    }
  } catch (err) {
    console.error('Database query error (account-transactions):', err);
  }

  const store = useCrudStore.getState();
  const { searchParams } = new URL(request.url);
  const accountId = searchParams.get('accountId');
  const module = searchParams.get('module');
  const paymentMethod = searchParams.get('paymentMethod');

  let list = store.accountTransactions || [];
  if (accountId) list = list.filter((t) => t.accountId === accountId);
  if (module) list = list.filter((t) => t.module === module);
  if (paymentMethod) list = list.filter((t) => t.paymentMethod === paymentMethod);

  return NextResponse.json({ success: true, data: list });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { accountId, transactionType, amount, debit, credit, description, paymentMethod, referenceNo, module, createdBy } = body;

    if (!accountId) {
      return NextResponse.json({ success: false, error: 'Target Account ID is required' }, { status: 400 });
    }

    const isCredit = transactionType === 'INCOME' || (credit && credit > 0);
    const txAmount = isCredit ? Number(credit || amount || 0) : Number(debit || amount || 0);

    if (isDbConnected()) {
      const account = await db.financialAccount.findUnique({ where: { id: accountId } });
      if (!account) return NextResponse.json({ success: false, error: 'Account not found' }, { status: 404 });

      const newBalance = isCredit ? account.currentBalance + txAmount : account.currentBalance - txAmount;

      const created = await db.$transaction(async (tx) => {
        await tx.financialAccount.update({
          where: { id: accountId },
          data: { currentBalance: newBalance },
        });

        return await tx.accountTransaction.create({
          data: {
            id: `atx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            txnNumber: body.txnNumber || `LATX-${Date.now().toString().slice(-6)}`,
            accountId: account.id,
            accountName: account.accountName,
            date: body.date || new Date().toISOString().split('T')[0],
            referenceNo: referenceNo || null,
            module: module || 'FINANCE',
            transactionType: isCredit ? 'INCOME' : 'EXPENSE',
            description: description || 'Account Transaction',
            paymentMethod: paymentMethod || 'Cash',
            debit: isCredit ? 0 : txAmount,
            credit: isCredit ? txAmount : 0,
            runningBalance: newBalance,
            createdBy: createdBy || 'Administrator',
          },
        });
      });

      return NextResponse.json({ success: true, data: created }, { status: 201 });
    }

    const store = useCrudStore.getState();
    const createdTx = store.recordAccountTransaction({
      txnNumber: body.txnNumber,
      accountId,
      accountName: body.accountName || '',
      date: body.date,
      referenceNo,
      module: module || 'FINANCE',
      transactionType: isCredit ? 'INCOME' : 'EXPENSE',
      description: description || 'Account Transaction',
      paymentMethod: paymentMethod || 'Cash',
      debit: isCredit ? 0 : txAmount,
      credit: isCredit ? txAmount : 0,
      createdBy: createdBy || 'Administrator',
    });

    if (!createdTx) {
      return NextResponse.json({ success: false, error: 'Transaction failed (insufficient balance or account error)' }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: createdTx }, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create account transaction:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Failed to record account transaction' }, { status: 500 });
  }
}
