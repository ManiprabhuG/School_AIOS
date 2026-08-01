import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db, isDbConnected } from '@/lib/db';
import { useCrudStore } from '@/store/crud-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (isDbConnected()) {
      const routes = await db.busRoute.findMany({
        orderBy: { createdAt: 'desc' },
      });

      const mapped = routes.map((b) => ({
        ...b,
        routeNo: b.routeNumber || (b as any).routeNo || 'Route 1',
        busNo: b.vehicleNo || (b as any).busNo || 'TN-01-AB-1000',
        assignedStudentsCount: b.assignedCount || (b as any).assignedStudentsCount || 0,
        feePerTerm: b.monthlyFee || (b as any).feePerTerm || 8000,
        status: b.status === 'ACTIVE' ? 'Operational' : b.status === 'INACTIVE' ? 'Maintenance' : b.status,
      }));

      return NextResponse.json({ success: true, data: mapped });
    }
  } catch (err) {
    console.error('Database query error (buses):', err);
  }
  const store = useCrudStore.getState();
  return NextResponse.json({ success: true, data: store.buses || [] });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const busData = {
      id: body.id || `bus-${Date.now()}`,
      routeNumber: String(body.routeNo || body.routeNumber || `ROUTE-${Date.now().toString().slice(-3)}`),
      routeName: String(body.routeName || body.name || 'Bus Route Name'),
      driverName: String(body.driverName || 'Driver Name'),
      driverPhone: String(body.driverPhone || '9876543210'),
      vehicleNo: String(body.busNo || body.vehicleNo || 'TN-01-AB-1234'),
      capacity: Number(body.capacity) || 40,
      assignedCount: Number(body.assignedStudentsCount ?? body.assignedCount) || 0,
      monthlyFee: Number(body.feePerTerm ?? body.monthlyFee) || 2000,
      status: body.status === 'Maintenance' || body.status === 'Inactive' ? 'INACTIVE' : 'ACTIVE',
    };

    if (isDbConnected()) {
      const created = await db.busRoute.create({
        data: busData as any,
      });

      const mapped = {
        ...created,
        routeNo: created.routeNumber,
        busNo: created.vehicleNo,
        assignedStudentsCount: created.assignedCount,
        feePerTerm: created.monthlyFee,
        status: created.status === 'ACTIVE' ? 'Operational' : 'Maintenance',
      };

      return NextResponse.json({ success: true, data: mapped }, { status: 201 });
    }

    const store = useCrudStore.getState();
    store.addRecord('buses', busData);
    return NextResponse.json({ success: true, data: busData }, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create bus route:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Failed to create bus route' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, routeNo, busNo, assignedStudentsCount, feePerTerm, ...updates } = body;
    if (!id) return NextResponse.json({ success: false, error: 'Missing ID' }, { status: 400 });

    const dbUpdates: any = { ...updates };
    if (routeNo) dbUpdates.routeNumber = routeNo;
    if (busNo) dbUpdates.vehicleNo = busNo;
    if (assignedStudentsCount !== undefined) dbUpdates.assignedCount = Number(assignedStudentsCount);
    if (feePerTerm !== undefined) dbUpdates.monthlyFee = Number(feePerTerm);
    if (dbUpdates.status === 'Operational') dbUpdates.status = 'ACTIVE';
    if (dbUpdates.status === 'Maintenance' || dbUpdates.status === 'Idle') dbUpdates.status = 'INACTIVE';

    if (isDbConnected()) {
      await db.busRoute.update({
        where: { id },
        data: dbUpdates,
      });
      return NextResponse.json({ success: true });
    }

    const store = useCrudStore.getState();
    store.updateRecord('buses', id, updates);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update bus route' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'Missing ID' }, { status: 400 });

    if (isDbConnected()) {
      await db.busRoute.delete({
        where: { id },
      });
      revalidatePath('/bus');
      return NextResponse.json({ success: true });
    }

    const store = useCrudStore.getState();
    store.permanentDeleteRecord('buses', id);
    revalidatePath('/bus');
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete bus route' }, { status: 500 });
  }
}
