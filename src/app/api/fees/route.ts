import { NextResponse } from 'next/server';
import { db, isDbConnected } from '@/lib/db';
import { useCrudStore } from '@/store/crud-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (isDbConnected()) {
      const payments = await db.feePayment.findMany({
        orderBy: { createdAt: 'desc' },
      });

      const mapped = payments.map((p) => ({
        ...p,
        amount: p.amountPaid || (p as any).amount || 0,
        feeCategory: p.feeType || (p as any).feeCategory || 'Tuition',
        collectedBy: p.cashier || (p as any).collectedBy || 'Accounts Desk',
        status: p.status === 'Completed' ? 'Success' : p.status,
      }));

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
        data: dataObj as any,
      });

      const mapped = {
        ...created,
        amount: created.amountPaid,
        feeCategory: created.feeType,
        collectedBy: created.cashier,
        status: created.status === 'Completed' ? 'Success' : created.status,
      };

      return NextResponse.json({ success: true, data: mapped }, { status: 201 });
    }

    const store = useCrudStore.getState();
    store.addRecord('feePayments', dataObj);
    return NextResponse.json({ success: true, data: dataObj }, { status: 201 });
  } catch (error: any) {
    console.error('Failed to record fee payment:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Failed to record fee payment' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, amount, feeCategory, collectedBy, ...updates } = body;
    if (!id) return NextResponse.json({ success: false, error: 'Missing ID' }, { status: 400 });

    const dbUpdates: any = { ...updates };
    if (amount !== undefined) dbUpdates.amountPaid = Number(amount);
    if (feeCategory) dbUpdates.feeType = feeCategory;
    if (collectedBy) dbUpdates.cashier = collectedBy;
    if (dbUpdates.status === 'Success') dbUpdates.status = 'Completed';

    if (isDbConnected()) {
      await db.feePayment.update({
        where: { id },
        data: dbUpdates,
      });
      return NextResponse.json({ success: true });
    }

    const store = useCrudStore.getState();
    store.updateRecord('feePayments', id, updates);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update fee payment' }, { status: 500 });
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
      return NextResponse.json({ success: true });
    }

    const store = useCrudStore.getState();
    store.permanentDeleteRecord('feePayments', id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete fee payment' }, { status: 500 });
  }
}
