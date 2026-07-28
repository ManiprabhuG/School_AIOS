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
