import { NextResponse } from 'next/server';
import { db, isDbConnected } from '@/lib/db';
import { useCrudStore } from '@/store/crud-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (isDbConnected()) {
      const items = await db.inventoryItem.findMany({
        orderBy: { createdAt: 'desc' },
      });

      const mapped = items.map((inv) => ({
        ...inv,
        quantityInStock: inv.quantity,
        minReorderLevel: inv.minStock,
        warehouseLocation: inv.location || (inv as any).warehouseLocation || 'Main Store',
        supplierName: inv.supplier || (inv as any).supplierName || 'General Supplier',
      }));

      return NextResponse.json({ success: true, data: mapped });
    }
  } catch (err) {
    console.error('Database query error (inventory):', err);
  }
  const store = useCrudStore.getState();
  return NextResponse.json({ success: true, data: store.inventory || [] });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const inventoryData = {
      id: body.id || `inv-${Date.now()}`,
      itemCode: String(body.itemCode || body.code || `INV-2026-${Date.now().toString().slice(-4)}`),
      name: String(body.name || body.itemName || 'Inventory Item'),
      category: String(body.category || 'General'),
      quantity: Number(body.quantityInStock ?? body.quantity) || 0,
      minStock: Number(body.minReorderLevel ?? body.minStock) || 10,
      unitPrice: Number(body.unitPrice || body.price) || 0,
      location: String(body.warehouseLocation || body.location || 'Main Store'),
      supplier: body.supplierName || body.supplier || null,
      lastUpdated: String(body.lastUpdated || new Date().toISOString().split('T')[0]),
      status: String(body.status || 'In Stock'),
    };

    if (isDbConnected()) {
      const created = await db.inventoryItem.create({
        data: inventoryData as any,
      });

      const mapped = {
        ...created,
        quantityInStock: created.quantity,
        minReorderLevel: created.minStock,
        warehouseLocation: created.location,
        supplierName: created.supplier,
      };

      return NextResponse.json({ success: true, data: mapped }, { status: 201 });
    }

    const store = useCrudStore.getState();
    store.addRecord('inventory', inventoryData);
    return NextResponse.json({ success: true, data: inventoryData }, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create inventory item:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Failed to create inventory item' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, quantityInStock, minReorderLevel, warehouseLocation, supplierName, ...updates } = body;
    if (!id) return NextResponse.json({ success: false, error: 'Missing ID' }, { status: 400 });

    const dbUpdates: any = { ...updates };
    if (quantityInStock !== undefined) dbUpdates.quantity = Number(quantityInStock);
    if (minReorderLevel !== undefined) dbUpdates.minStock = Number(minReorderLevel);
    if (warehouseLocation) dbUpdates.location = warehouseLocation;
    if (supplierName) dbUpdates.supplier = supplierName;

    if (isDbConnected()) {
      await db.inventoryItem.update({
        where: { id },
        data: dbUpdates,
      });
      return NextResponse.json({ success: true });
    }

    const store = useCrudStore.getState();
    store.updateRecord('inventory', id, updates);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update inventory item' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'Missing ID' }, { status: 400 });

    if (isDbConnected()) {
      await db.inventoryItem.delete({
        where: { id },
      });
      return NextResponse.json({ success: true });
    }

    const store = useCrudStore.getState();
    store.permanentDeleteRecord('inventory', id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete inventory item' }, { status: 500 });
  }
}
