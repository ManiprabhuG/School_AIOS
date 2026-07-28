import { NextResponse } from 'next/server';
import { db, isDbConnected } from '@/lib/db';
import { useCrudStore } from '@/store/crud-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (isDbConnected()) {
      const items = await db.purchaseOrder.findMany({
        orderBy: { createdAt: 'desc' },
      });

      const mapped = items.map((p) => ({
        ...p,
        deliveryDate: p.expectedDate || (p as any).deliveryDate || p.orderDate,
        status: p.paymentStatus || (p as any).status || 'Draft',
      }));

      return NextResponse.json({ success: true, data: mapped });
    }
  } catch (err) {
    console.error('Database query error (purchases):', err);
  }
  const store = useCrudStore.getState();
  return NextResponse.json({ success: true, data: store.purchases || [] });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const itemsJson = typeof body.items === 'string' ? body.items : JSON.stringify(body.items || []);
    const dataObj = {
      id: body.id || `po-${Date.now()}`,
      poNumber: String(body.poNumber || `PO-2026-${Date.now().toString().slice(-4)}`),
      supplierName: String(body.supplierName || body.supplier || 'Supplier Name'),
      supplierId: body.supplierId || null,
      orderDate: String(body.orderDate || new Date().toISOString().split('T')[0]),
      expectedDate: String(body.deliveryDate || body.expectedDate || new Date().toISOString().split('T')[0]),
      itemsCount: Number(body.itemsCount) || 1,
      totalAmount: Number(body.totalAmount) || 0,
      paidAmount: Number(body.paidAmount) || 0,
      paymentStatus: String(body.status || body.paymentStatus || 'Draft'),
      deliveryStatus: String(body.deliveryStatus || 'Pending'),
      items: itemsJson,
    };

    if (isDbConnected()) {
      const created = await db.purchaseOrder.create({
        data: dataObj as any,
      });

      const mapped = {
        ...created,
        deliveryDate: created.expectedDate,
        status: created.paymentStatus,
      };

      return NextResponse.json({ success: true, data: mapped }, { status: 201 });
    }

    const store = useCrudStore.getState();
    store.addRecord('purchases', dataObj);
    return NextResponse.json({ success: true, data: dataObj }, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create purchase order:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Failed to create purchase order' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, deliveryDate, status, ...updates } = body;
    if (!id) return NextResponse.json({ success: false, error: 'Missing ID' }, { status: 400 });

    const dbUpdates: any = { ...updates };
    if (deliveryDate) dbUpdates.expectedDate = deliveryDate;
    if (status) dbUpdates.paymentStatus = status;

    if (isDbConnected()) {
      await db.purchaseOrder.update({
        where: { id },
        data: dbUpdates,
      });
      return NextResponse.json({ success: true });
    }

    const store = useCrudStore.getState();
    store.updateRecord('purchases', id, updates);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update purchase order' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'Missing ID' }, { status: 400 });

    if (isDbConnected()) {
      await db.purchaseOrder.delete({
        where: { id },
      });
      return NextResponse.json({ success: true });
    }

    const store = useCrudStore.getState();
    store.permanentDeleteRecord('purchases', id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete purchase order' }, { status: 500 });
  }
}
