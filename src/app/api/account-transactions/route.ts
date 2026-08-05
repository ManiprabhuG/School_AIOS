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
    let { accountId, transactionType, amount, debit, credit, description, paymentMethod, referenceNo, module, createdBy } = body;

    const isCredit = transactionType === 'INCOME' || (credit && credit > 0);
    const txAmount = isCredit ? Number(credit || amount || 0) : Number(debit || amount || 0);
    const pMethod = (paymentMethod || 'Cash').toLowerCase();

    if (isDbConnected()) {
      // Duplicate Check (Required Change 9)
      if (referenceNo && referenceNo.trim() !== '') {
        const existing = await db.accountTransaction.findFirst({
          where: {
            referenceNo: referenceNo.trim(),
            module: module || 'FINANCE',
            transactionType: isCredit ? 'INCOME' : 'EXPENSE',
          },
        });
        if (existing) {
          return NextResponse.json({ success: true, data: existing, message: 'Duplicate transaction skipped' });
        }
      }

      // Auto Account Selection (Required Change 5)
      let account;
      if (accountId) {
        account = await db.financialAccount.findUnique({ where: { id: accountId } });
      }

      if (!account) {
        if (pMethod.includes('cash')) {
          account = await db.financialAccount.findFirst({
            where: { OR: [{ accountType: 'CASH' }, { accountType: 'Cash Fund Account' }, { accountName: { contains: 'Cash' } }] },
          });
        } else {
          account = await db.financialAccount.findFirst({
            where: { OR: [{ accountType: 'BANK' }, { accountType: 'School Bank Account' }, { accountName: { contains: 'Main' } }] },
          });
        }

        if (!account) {
          account = await db.financialAccount.findFirst();
        }
      }

      if (!account) return NextResponse.json({ success: false, error: 'No active account found' }, { status: 404 });

      const newBalance = isCredit ? account.currentBalance + txAmount : account.currentBalance - txAmount;

      const created = await db.$transaction(async (tx) => {
        await tx.financialAccount.update({
          where: { id: account.id },
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
      accountId: accountId || '',
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

      // Cascade update to mother module tables in DB
      const refNo = oldTx.referenceNo || oldTx.txnNumber;
      const mod = (oldTx.module || '').toUpperCase();
      const newAmt = isCredit ? creditAmt : debitAmt;
      const newDate = body.date || oldTx.date;
      const newMethod = body.paymentMethod || oldTx.paymentMethod;

      if (mod === 'FEES' || refNo.includes('RCP') || refNo.includes('FEE')) {
        await db.feePayment.updateMany({
          where: { OR: [{ receiptNo: refNo }, { id: refNo }] },
          data: { amountPaid: newAmt, paymentMode: newMethod, paymentDate: newDate },
        }).catch(() => {});
      } else if (mod === 'PURCHASE' || refNo.includes('PO')) {
        await db.purchaseOrder.updateMany({
          where: { OR: [{ poNumber: refNo }, { id: refNo }] },
          data: { totalAmount: newAmt, orderDate: newDate },
        }).catch(() => {});
      } else if (mod === 'SALES' || refNo.includes('INV') || refNo.includes('SL')) {
        await db.salesItem.updateMany({
          where: { OR: [{ invoiceNo: refNo }, { id: refNo }] },
          data: { totalAmount: newAmt, date: newDate, paymentMethod: newMethod },
        }).catch(() => {});
      } else if (mod === 'FINANCE' || refNo.includes('TXN')) {
        await db.financialTransaction.updateMany({
          where: { OR: [{ txnNumber: refNo }, { id: refNo }] },
          data: { amount: newAmt, date: newDate, paymentMethod: newMethod, description: body.description || oldTx.description },
        }).catch(() => {});
      }

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

        const refNo = oldTx.referenceNo || oldTx.txnNumber;
        const mod = (oldTx.module || '').toUpperCase();

        // Cascade delete from mother module tables in DB
        if (mod === 'FEES' || refNo.includes('RCP') || refNo.includes('FEE')) {
          await db.feePayment.deleteMany({ where: { OR: [{ receiptNo: refNo }, { id: refNo }] } }).catch(() => {});
        } else if (mod === 'PURCHASE' || refNo.includes('PO')) {
          await db.purchaseOrder.deleteMany({ where: { OR: [{ poNumber: refNo }, { id: refNo }] } }).catch(() => {});
        } else if (mod === 'SALES' || refNo.includes('INV') || refNo.includes('SL')) {
          await db.salesItem.deleteMany({ where: { OR: [{ invoiceNo: refNo }, { id: refNo }] } }).catch(() => {});
        } else if (mod === 'FINANCE' || refNo.includes('TXN')) {
          await db.financialTransaction.deleteMany({ where: { OR: [{ txnNumber: refNo }, { id: refNo }] } }).catch(() => {});
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

