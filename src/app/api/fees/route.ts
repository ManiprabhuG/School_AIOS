import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db, isDbConnected } from '@/lib/db';
import { useCrudStore } from '@/store/crud-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (isDbConnected()) {
      const payments = await db.feePayment.findMany({
        orderBy: { createdAt: 'desc' },
      });

      const mapped = payments.map((p) => {
        const total = (p as any).totalAmount;
        const due = (p as any).dueAmount;
        return {
          id: p.id,
          receiptNo: p.receiptNo,
          studentId: p.studentId,
          studentName: p.studentName,
          className: p.className,
          amount: p.amountPaid || (p as any).amount || 0,
          totalAmount: typeof total === 'number' ? total : undefined,
          dueAmount: typeof due === 'number' ? due : undefined,
          feeCategory: p.feeType || (p as any).feeCategory || 'Tuition',
          collectedBy: p.cashier || (p as any).collectedBy || 'Accounts Desk',
          paymentDate: p.paymentDate,
          paymentMode: p.paymentMode,
          status: p.status === 'Completed' ? 'Success' : p.status,
        };
      });

      return NextResponse.json({ success: true, data: mapped });
    }
  } catch (err) {
    console.error('Database query error (fees):', err);
  }
  const store = useCrudStore.getState();
  return NextResponse.json({ success: true, data: store.feePayments || [] });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const dataObj = {
      id: body.id || `pay-${Date.now()}`,
      receiptNo: String(body.receiptNo || `RCP-2026-${Date.now().toString().slice(-4)}`),
      studentId: String(body.studentId || `std-${Date.now()}`),
      studentName: String(body.studentName || body.name || 'Student Name'),
      admissionNo: String(body.admissionNo || 'ADM-2026-001'),
      className: String(body.className || '10th'),
      section: String(body.section || 'A'),
      feeType: String(body.feeCategory || body.feeType || 'Tuition'),
      amountPaid: Number(body.amount || body.amountPaid) || 0,
      paymentDate: String(body.paymentDate || new Date().toISOString().split('T')[0]),
      paymentMode: String(body.paymentMode || body.mode || 'Cash'),
      transactionRef: body.transactionRef || null,
      cashier: String(body.collectedBy || body.cashier || 'Accounts Desk'),
      status: String(body.status === 'Success' ? 'Completed' : body.status || 'Completed'),
    };

    if (isDbConnected()) {
      const created = await db.feePayment.create({
        data: dataObj,
      });

      // Record Account Ledger transaction if account is specified or fallback
      let accountId = body.accountId;
      if (!accountId) {
        const defaultAcc = dataObj.paymentMode.toLowerCase().includes('cash')
          ? await db.financialAccount.findFirst({ where: { accountType: 'CASH' } })
          : await db.financialAccount.findFirst({ where: { accountType: 'BANK' } });
        accountId = defaultAcc?.id;
      }

      if (accountId) {
        const account = await db.financialAccount.findUnique({ where: { id: accountId } });
        if (account) {
          const newBalance = account.currentBalance + dataObj.amountPaid;
          await db.financialAccount.update({
            where: { id: accountId },
            data: { currentBalance: newBalance },
          });
          await db.accountTransaction.create({
            data: {
              txnNumber: `TXN-FEE-${created.receiptNo}`,
              accountId: account.id,
              accountName: account.accountName,
              date: dataObj.paymentDate,
              referenceNo: created.receiptNo,
              module: 'FEES',
              transactionType: 'INCOME',
              description: `Fee Collection: ${created.studentName} (${created.className}-${created.section}) - ${created.feeType}`,
              paymentMethod: dataObj.paymentMode,
              credit: dataObj.amountPaid,
              debit: 0,
              runningBalance: newBalance,
              createdBy: dataObj.cashier,
            },
          });
        }
      }

      const mapped = {
        ...created,
        amount: created.amountPaid,
        totalAmount: body.totalAmount,
        dueAmount: body.dueAmount,
        feeCategory: created.feeType,
        collectedBy: created.cashier,
        status: created.status === 'Completed' ? 'Success' : created.status,
      };

      return NextResponse.json({ success: true, data: mapped }, { status: 201 });
    }

    const store = useCrudStore.getState();
    store.addRecord('feePayments', body);

    // Record central account ledger entry in store mode
    store.recordAccountTransaction({
      txnNumber: `TXN-FEE-${dataObj.receiptNo}`,
      accountId: body.accountId || '',
      accountName: '',
      date: dataObj.paymentDate,
      referenceNo: dataObj.receiptNo,
      module: 'FEES',
      transactionType: 'INCOME',
      description: `Fee Collection: ${dataObj.studentName} (${dataObj.className}-${dataObj.section}) - ${dataObj.feeType}`,
      paymentMethod: dataObj.paymentMode,
      credit: dataObj.amountPaid,
      debit: 0,
      createdBy: dataObj.cashier,
    });

    return NextResponse.json({ success: true, data: body }, { status: 201 });

  } catch (error: any) {
    console.error('Failed to record fee payment:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Failed to record fee payment' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const id = body.id;
    if (!id) return NextResponse.json({ success: false, error: 'Missing ID' }, { status: 400 });

    const validDbFields: Record<string, any> = {};
    if (body.receiptNo !== undefined) validDbFields.receiptNo = String(body.receiptNo);
    if (body.studentId !== undefined) validDbFields.studentId = String(body.studentId);
    if (body.studentName !== undefined) validDbFields.studentName = String(body.studentName);
    if (body.admissionNo !== undefined) validDbFields.admissionNo = String(body.admissionNo);
    if (body.className !== undefined) validDbFields.className = String(body.className);
    if (body.section !== undefined) validDbFields.section = String(body.section);
    if (body.feeCategory !== undefined || body.feeType !== undefined) validDbFields.feeType = String(body.feeCategory || body.feeType);
    if (body.amount !== undefined || body.amountPaid !== undefined) validDbFields.amountPaid = Number(body.amount ?? body.amountPaid);
    if (body.paymentDate !== undefined) validDbFields.paymentDate = String(body.paymentDate);
    if (body.paymentMode !== undefined) validDbFields.paymentMode = String(body.paymentMode);
    if (body.collectedBy !== undefined || body.cashier !== undefined) validDbFields.cashier = String(body.collectedBy || body.cashier);
    if (body.status !== undefined) validDbFields.status = body.status === 'Success' ? 'Completed' : String(body.status);

    if (isDbConnected()) {
      const updated = await db.feePayment.update({
        where: { id },
        data: validDbFields,
      });
      const mapped = {
        ...updated,
        amount: updated.amountPaid,
        totalAmount: body.totalAmount,
        dueAmount: body.dueAmount,
        feeCategory: updated.feeType,
        collectedBy: updated.cashier,
        status: updated.status === 'Completed' ? 'Success' : updated.status,
      };
      return NextResponse.json({ success: true, data: mapped });
    }

    const store = useCrudStore.getState();
    store.updateRecord('feePayments', id, body);
    return NextResponse.json({ success: true, data: body });
  } catch (error: any) {
    console.error('Failed to update fee payment:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Failed to update fee payment' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'Missing ID' }, { status: 400 });

    if (isDbConnected()) {
      await db.feePayment.delete({
        where: { id },
      });
      revalidatePath('/fees');
      return NextResponse.json({ success: true });
    }

    const store = useCrudStore.getState();
    store.permanentDeleteRecord('feePayments', id);
    revalidatePath('/fees');
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete fee payment' }, { status: 500 });
  }
}
