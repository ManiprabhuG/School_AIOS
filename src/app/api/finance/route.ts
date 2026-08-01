import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
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
      payeeName: body.payeeName ? String(body.payeeName) : null,
      entityType: body.entityType ? String(body.entityType) : null,
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
    const { id } = body;
    if (!id) return NextResponse.json({ success: false, error: 'Missing ID' }, { status: 400 });

    if (isDbConnected()) {
      const oldTx = await db.financialTransaction.findUnique({ where: { id } });
      if (oldTx) {
        let accountId = body.accountId;
        if (!accountId) {
          const defaultAcc = (oldTx.paymentMethod || '').toLowerCase().includes('cash')
            ? await db.financialAccount.findFirst({ where: { accountType: 'CASH' } })
            : await db.financialAccount.findFirst({ where: { accountType: 'BANK' } });
          accountId = defaultAcc?.id;
        }

        if (accountId) {
          const account = await db.financialAccount.findUnique({ where: { id: accountId } });
          if (account) {
            // Revert old transaction balance effect
            let balance = account.currentBalance;
            if (oldTx.type === 'Income') {
              balance -= oldTx.amount;
            } else if (oldTx.type === 'Expense') {
              balance += oldTx.amount;
            }

            // Apply new transaction balance effect
            const newType = body.type || oldTx.type;
            const newAmount = Number(body.amount !== undefined ? body.amount : oldTx.amount) || 0;
            const newIsIncome = newType === 'Income';

            if (newIsIncome) {
              balance += newAmount;
            } else {
              balance -= newAmount;
            }

            // Update account balance
            await db.financialAccount.update({
              where: { id: accountId },
              data: { currentBalance: balance },
            });

            // Update or create corresponding AccountTransaction ledger entry
            const atxNumber = `ATX-${oldTx.txnNumber}`;
            const existingAtx = await db.accountTransaction.findFirst({
              where: { txnNumber: atxNumber },
            });

            const newCategory = body.category || oldTx.category;
            const newPayee = body.payeeName || oldTx.payeeName || 'General';
            const newDesc = body.description || oldTx.description;
            const newMethod = body.paymentMode || body.paymentMethod || oldTx.paymentMethod;
            const newRef = body.referenceNo || oldTx.referenceNo || oldTx.txnNumber;
            const newHandledBy = body.approvedBy || body.handledBy || oldTx.handledBy;

            if (existingAtx) {
              await db.accountTransaction.update({
                where: { id: existingAtx.id },
                data: {
                  transactionType: newIsIncome ? 'INCOME' : 'EXPENSE',
                  description: `Voucher (${newCategory} - ${newPayee}): ${newDesc}`,
                  paymentMethod: newMethod,
                  credit: newIsIncome ? newAmount : 0,
                  debit: newIsIncome ? 0 : newAmount,
                  runningBalance: balance,
                  referenceNo: newRef,
                  date: body.date || oldTx.date,
                },
              });
            } else {
              await db.accountTransaction.create({
                data: {
                  txnNumber: atxNumber,
                  accountId: account.id,
                  accountName: account.accountName,
                  date: body.date || oldTx.date,
                  referenceNo: newRef,
                  module: 'FINANCE',
                  transactionType: newIsIncome ? 'INCOME' : 'EXPENSE',
                  description: `Voucher (${newCategory} - ${newPayee}): ${newDesc}`,
                  paymentMethod: newMethod,
                  credit: newIsIncome ? newAmount : 0,
                  debit: newIsIncome ? 0 : newAmount,
                  runningBalance: balance,
                  createdBy: newHandledBy,
                },
              });
            }
          }
        }

        const updated = await db.financialTransaction.update({
          where: { id },
          data: {
            txnNumber: body.transactionNo || body.txnNumber || oldTx.txnNumber,
            type: body.type || oldTx.type,
            category: body.category || oldTx.category,
            amount: Number(body.amount !== undefined ? body.amount : oldTx.amount) || 0,
            date: body.date || oldTx.date,
            description: body.description || oldTx.description,
            paymentMethod: body.paymentMode || body.paymentMethod || oldTx.paymentMethod,
            referenceNo: body.referenceNo || oldTx.referenceNo,
            handledBy: body.approvedBy || body.handledBy || oldTx.handledBy,
            payeeName: body.payeeName !== undefined ? body.payeeName : oldTx.payeeName,
            entityType: body.entityType !== undefined ? body.entityType : oldTx.entityType,
          },
        });

        return NextResponse.json({ success: true, data: updated });
      }
    }

    const store = useCrudStore.getState();
    store.updateFinancialTransaction(id, body, body.accountId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to update financial transaction:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Failed to update financial transaction' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'Missing ID' }, { status: 400 });

    if (isDbConnected()) {
      const oldTx = await db.financialTransaction.findUnique({ where: { id } });
      if (oldTx) {
        const defaultAcc = (oldTx.paymentMethod || '').toLowerCase().includes('cash')
          ? await db.financialAccount.findFirst({ where: { accountType: 'CASH' } })
          : await db.financialAccount.findFirst({ where: { accountType: 'BANK' } });

        if (defaultAcc) {
          let balance = defaultAcc.currentBalance;
          if (oldTx.type === 'Income') {
            balance -= oldTx.amount;
          } else if (oldTx.type === 'Expense') {
            balance += oldTx.amount;
          }

          await db.financialAccount.update({
            where: { id: defaultAcc.id },
            data: { currentBalance: balance },
          });

          const atxNumber = `ATX-${oldTx.txnNumber}`;
          await db.accountTransaction.deleteMany({
            where: { txnNumber: atxNumber },
          });
        }

        await db.financialTransaction.delete({
          where: { id },
        });
        revalidatePath('/finance');
        return NextResponse.json({ success: true });
      }
    }

    const store = useCrudStore.getState();
    store.deleteFinancialTransaction(id);
    revalidatePath('/finance');
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to delete financial transaction:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Failed to delete financial transaction' }, { status: 500 });
  }
}

