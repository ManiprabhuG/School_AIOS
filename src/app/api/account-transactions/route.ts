import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
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

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;
    if (!id) return NextResponse.json({ success: false, error: 'Missing ID' }, { status: 400 });

    if (isDbConnected()) {
      const oldTx = await db.accountTransaction.findUnique({ where: { id } });
      if (!oldTx) return NextResponse.json({ success: false, error: 'Ledger entry not found' }, { status: 404 });

      const accountId = body.accountId || oldTx.accountId;
      const account = await db.financialAccount.findUnique({ where: { id: accountId } });
      if (!account) return NextResponse.json({ success: false, error: 'Account not found' }, { status: 404 });

      // Step 1: Revert old transaction effect
      let balance = account.currentBalance;
      if (oldTx.transactionType === 'INCOME' || oldTx.credit > 0) {
        balance -= oldTx.credit || 0;
      } else {
        balance += oldTx.debit || 0;
      }

      // Step 2: Calculate new effect
      const newType = body.transactionType || oldTx.transactionType;
      const isCredit = newType === 'INCOME' || (body.credit && Number(body.credit) > 0);
      const creditAmt = isCredit ? Number(body.credit !== undefined ? body.credit : (body.amount || oldTx.credit)) : 0;
      const debitAmt = !isCredit ? Number(body.debit !== undefined ? body.debit : (body.amount || oldTx.debit)) : 0;

      if (isCredit) {
        balance += creditAmt;
      } else {
        balance -= debitAmt;
      }

      // Update account balance & ledger entry in DB
      await db.financialAccount.update({
        where: { id: accountId },
        data: { currentBalance: balance },
      });

      const updated = await db.accountTransaction.update({
        where: { id },
        data: {
          accountId: account.id,
          accountName: account.accountName,
          date: body.date || oldTx.date,
          referenceNo: body.referenceNo !== undefined ? body.referenceNo : oldTx.referenceNo,
          module: body.module || oldTx.module,
          transactionType: isCredit ? 'INCOME' : 'EXPENSE',
          description: body.description || oldTx.description,
          paymentMethod: body.paymentMethod || oldTx.paymentMethod,
          credit: creditAmt,
          debit: debitAmt,
          runningBalance: balance,
        },
      });

      return NextResponse.json({ success: true, data: updated });
    }

    const store = useCrudStore.getState();
    store.updateAccountLedgerEntry(id, body);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to update account transaction:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Failed to update ledger entry' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'Missing ID' }, { status: 400 });

    if (isDbConnected()) {
      const oldTx = await db.accountTransaction.findUnique({ where: { id } });
      if (oldTx) {
        const account = await db.financialAccount.findUnique({ where: { id: oldTx.accountId } });
        if (account) {
          let balance = account.currentBalance;
          if (oldTx.transactionType === 'INCOME' || oldTx.credit > 0) {
            balance -= oldTx.credit || 0;
          } else {
            balance += oldTx.debit || 0;
          }

          await db.financialAccount.update({
            where: { id: account.id },
            data: { currentBalance: balance },
          });
        }

        await db.accountTransaction.delete({
          where: { id },
        });
        revalidatePath('/finance');
        return NextResponse.json({ success: true });
      }
    }

    const store = useCrudStore.getState();
    store.deleteAccountLedgerEntry(id);
    revalidatePath('/finance');
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to delete account transaction:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Failed to delete ledger entry' }, { status: 500 });
  }
}

