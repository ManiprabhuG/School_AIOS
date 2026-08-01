import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db, isDbConnected } from '@/lib/db';
import { useCrudStore } from '@/store/crud-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (isDbConnected()) {
      const items = await db.salesItem.findMany({
        orderBy: { createdAt: 'desc' },
      });

      const mapped = items.map((sl) => ({
        ...sl,
        discount: (sl as any).discount || 0,
        netAmount: sl.totalAmount,
      }));

      return NextResponse.json({ success: true, data: mapped });
    }
  } catch (err) {
    console.error('Database query error (sales):', err);
  }
  const store = useCrudStore.getState();
  return NextResponse.json({ success: true, data: store.sales || [] });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const dataObj = {
      id: body.id || `sl-${Date.now()}`,
      invoiceNo: String(body.invoiceNo || body.receiptNo || `INV-2026-${Date.now().toString().slice(-4)}`),
      customerName: String(body.customerName || body.customer || 'Customer Name'),
      customerType: String(body.customerType || 'Student'),
      date: String(body.date || new Date().toISOString().split('T')[0]),
      itemCategory: String(body.itemCategory || body.category || 'Stationery'),
      itemName: String(body.itemName || body.name || 'Sales Item'),
      quantity: Number(body.quantity) || 1,
      unitPrice: Number(body.unitPrice) || 0,
      totalAmount: Number(body.netAmount ?? body.totalAmount) || 0,
      paymentMethod: String(body.paymentMethod || 'Cash'),
      paymentStatus: String(body.paymentStatus || 'Paid'),
    };

    if (isDbConnected()) {
      const created = await db.salesItem.create({
        data: dataObj as any,
      });

      const mapped = {
        ...created,
        discount: body.discount || 0,
        netAmount: created.totalAmount,
      };

      return NextResponse.json({ success: true, data: mapped }, { status: 201 });
    }

    const store = useCrudStore.getState();
    store.addRecord('sales', dataObj);
    return NextResponse.json({ success: true, data: dataObj }, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create sales item:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Failed to create sales item' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, netAmount, ...updates } = body;
    if (!id) return NextResponse.json({ success: false, error: 'Missing ID' }, { status: 400 });

    const dbUpdates: any = { ...updates };
    if (netAmount !== undefined) dbUpdates.totalAmount = Number(netAmount);

    if (isDbConnected()) {
      await db.salesItem.update({
        where: { id },
        data: dbUpdates,
      });
      return NextResponse.json({ success: true });
    }

    const store = useCrudStore.getState();
    store.updateRecord('sales', id, updates);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update sales item' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'Missing ID' }, { status: 400 });

    if (isDbConnected()) {
      await db.salesItem.delete({
        where: { id },
      });
      revalidatePath('/sales');
      return NextResponse.json({ success: true });
    }

    const store = useCrudStore.getState();
    store.permanentDeleteRecord('sales', id);
    revalidatePath('/sales');
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete sales item' }, { status: 500 });
  }
}
