import { NextResponse } from 'next/server';
import { db, isDbConnected } from '@/lib/db';
import { useCrudStore } from '@/store/crud-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (isDbConnected()) {
      const items = await db.financialTransaction.findMany({
        orderBy: { createdAt: 'desc' },
      });

      const mapped = items.map((f) => ({
        ...f,
        transactionNo: f.txnNumber || (f as any).transactionNo || 'TXN-8800',
        paymentMode: f.paymentMethod || (f as any).paymentMode || 'UPI',
        approvedBy: f.handledBy || (f as any).approvedBy || 'Accounts Desk',
      }));

      return NextResponse.json({ success: true, data: mapped });
    }
  } catch (err) {
    console.error('Database query error (finance):', err);
  }
  const store = useCrudStore.getState();
  return NextResponse.json({ success: true, data: store.financials || [] });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const dataObj = {
      id: body.id || `tx-${Date.now()}`,
      txnNumber: String(body.transactionNo || body.txnNumber || `TXN-2026-${Date.now().toString().slice(-4)}`),
      date: String(body.date || new Date().toISOString().split('T')[0]),
      type: String(body.type || 'Income'),
      category: String(body.category || 'General'),
      description: String(body.description || 'Financial Transaction'),
      amount: Number(body.amount) || 0,
      paymentMethod: String(body.paymentMode || body.paymentMethod || 'Cash'),
      referenceNo: body.referenceNo || null,
      handledBy: String(body.approvedBy || body.handledBy || 'Accountant'),
      status: String(body.status || 'Completed'),
    };

    if (isDbConnected()) {
      const created = await db.financialTransaction.create({
        data: dataObj as any,
      });

      let accountId = body.accountId;
      if (!accountId) {
        const defaultAcc = dataObj.paymentMethod.toLowerCase().includes('cash')
          ? await db.financialAccount.findFirst({ where: { accountType: 'CASH' } })
          : await db.financialAccount.findFirst({ where: { accountType: 'BANK' } });
        accountId = defaultAcc?.id;
      }

      if (accountId) {
        const account = await db.financialAccount.findUnique({ where: { id: accountId } });
        if (account) {
          const isIncome = dataObj.type === 'Income';
          const newBalance = isIncome
            ? account.currentBalance + dataObj.amount
            : account.currentBalance - dataObj.amount;

          await db.financialAccount.update({
            where: { id: accountId },
            data: { currentBalance: newBalance },
          });

          await db.accountTransaction.create({
            data: {
              txnNumber: `ATX-${dataObj.txnNumber}`,
              accountId: account.id,
              accountName: account.accountName,
              date: dataObj.date,
              referenceNo: dataObj.referenceNo || dataObj.txnNumber,
              module: 'FINANCE',
              transactionType: isIncome ? 'INCOME' : 'EXPENSE',
              description: `Voucher (${dataObj.category}): ${dataObj.description}`,
              paymentMethod: dataObj.paymentMethod,
              credit: isIncome ? dataObj.amount : 0,
              debit: isIncome ? 0 : dataObj.amount,
              runningBalance: newBalance,
              createdBy: dataObj.handledBy,
            },
          });
        }
      }

      const mapped = {
        ...created,
        transactionNo: created.txnNumber,
        paymentMode: created.paymentMethod,
        approvedBy: created.handledBy,
      };

      return NextResponse.json({ success: true, data: mapped }, { status: 201 });
    }

    const store = useCrudStore.getState();
    store.addRecord('financials', dataObj);

    // Record central account transaction in store mode
    store.recordAccountTransaction({
      txnNumber: `ATX-${dataObj.txnNumber}`,
      accountId: body.accountId || '',
      accountName: '',
      date: dataObj.date,
      referenceNo: dataObj.referenceNo || dataObj.txnNumber,
      module: 'FINANCE',
      transactionType: dataObj.type === 'Income' ? 'INCOME' : 'EXPENSE',
      description: `Voucher (${dataObj.category}): ${dataObj.description}`,
      paymentMethod: dataObj.paymentMethod,
      credit: dataObj.type === 'Income' ? dataObj.amount : 0,
      debit: dataObj.type === 'Income' ? 0 : dataObj.amount,
      createdBy: dataObj.handledBy,
    });

    return NextResponse.json({ success: true, data: dataObj }, { status: 201 });

  } catch (error: any) {
    console.error('Failed to create financial transaction:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Failed to create financial transaction' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, transactionNo, paymentMode, approvedBy, ...updates } = body;
    if (!id) return NextResponse.json({ success: false, error: 'Missing ID' }, { status: 400 });

    const dbUpdates: any = { ...updates };
    if (transactionNo) dbUpdates.txnNumber = transactionNo;
    if (paymentMode) dbUpdates.paymentMethod = paymentMode;
    if (approvedBy) dbUpdates.handledBy = approvedBy;

    if (isDbConnected()) {
      await db.financialTransaction.update({
        where: { id },
        data: dbUpdates,
      });
      return NextResponse.json({ success: true });
    }

    const store = useCrudStore.getState();
    store.updateRecord('financials', id, updates);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update financial transaction' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'Missing ID' }, { status: 400 });

    if (isDbConnected()) {
      await db.financialTransaction.delete({
        where: { id },
      });
      return NextResponse.json({ success: true });
    }

    const store = useCrudStore.getState();
    store.permanentDeleteRecord('financials', id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete financial transaction' }, { status: 500 });
  }
}
