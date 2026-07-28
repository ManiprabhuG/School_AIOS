import { NextResponse } from 'next/server';
import { db, isDbConnected } from '@/lib/db';
import { useCrudStore } from '@/store/crud-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (isDbConnected()) {
      const dbSuppliers = await db.supplier.findMany({
        orderBy: { createdAt: 'desc' },
      });

      const mapped = dbSuppliers.map((s) => ({
        ...s,
        name: s.companyName || (s as any).name || 'Supplier',
        supplierCode: (s as any).supplierCode || `SUP-${s.id.slice(-4)}`,
        gstNo: s.gstin || (s as any).gstNo || '',
        outstandingBalance: s.duePayment || (s as any).outstandingBalance || 0,
        status: s.status === 'ACTIVE' ? 'Active' : 'Inactive',
      }));

      return NextResponse.json({ success: true, data: mapped });
    }
  } catch (err) {
    console.error('Database query error (suppliers):', err);
  }
  const store = useCrudStore.getState();
  return NextResponse.json({ success: true, data: store.suppliers || [] });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supplierData = {
      id: body.id || `sup-${Date.now()}`,
      companyName: String(body.companyName || body.name || 'Supplier Company'),
      contactPerson: String(body.contactPerson || body.contact || 'Contact Person'),
      phone: String(body.phone || '9876543210'),
      email: String(body.email || `supplier_${Date.now()}@example.com`),
      address: String(body.address || 'Supplier Address'),
      gstin: body.gstin || body.gstNo || null,
      category: String(body.category || 'General'),
      suppliedItems: Array.isArray(body.suppliedItems) ? body.suppliedItems.join(', ') : body.suppliedItems || null,
      totalPurchases: Number(body.totalPurchases) || 0,
      duePayment: Number(body.duePayment || body.outstandingBalance) || 0,
      status: body.status === 'Inactive' ? 'INACTIVE' : 'ACTIVE',
    };

    if (isDbConnected()) {
      const created = await db.supplier.create({
        data: supplierData as any,
      });

      const mapped = {
        ...created,
        name: created.companyName,
        supplierCode: (body as any).supplierCode || `SUP-${created.id.slice(-4)}`,
        gstNo: created.gstin || '',
        outstandingBalance: created.duePayment,
        status: created.status === 'ACTIVE' ? 'Active' : 'Inactive',
      };

      return NextResponse.json({ success: true, data: mapped }, { status: 201 });
    }

    const store = useCrudStore.getState();
    store.addRecord('suppliers', supplierData);
    return NextResponse.json({ success: true, data: supplierData }, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create supplier:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Failed to create supplier' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, gstNo, outstandingBalance, name, ...updates } = body;
    if (!id) return NextResponse.json({ success: false, error: 'Missing ID' }, { status: 400 });

    const dbUpdates: any = { ...updates };
    if (gstNo) dbUpdates.gstin = gstNo;
    if (outstandingBalance !== undefined) dbUpdates.duePayment = Number(outstandingBalance);
    if (name && !dbUpdates.companyName) dbUpdates.companyName = name;
    if (dbUpdates.status === 'Active') dbUpdates.status = 'ACTIVE';
    if (dbUpdates.status === 'Inactive') dbUpdates.status = 'INACTIVE';

    if (isDbConnected()) {
      await db.supplier.update({
        where: { id },
        data: dbUpdates,
      });
      return NextResponse.json({ success: true });
    }

    const store = useCrudStore.getState();
    store.updateRecord('suppliers', id, updates);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update supplier' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'Missing ID' }, { status: 400 });

    if (isDbConnected()) {
      await db.supplier.delete({
        where: { id },
      });
      return NextResponse.json({ success: true });
    }

    const store = useCrudStore.getState();
    store.permanentDeleteRecord('suppliers', id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete supplier' }, { status: 500 });
  }
}
