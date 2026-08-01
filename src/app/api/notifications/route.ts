import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db, isDbConnected } from '@/lib/db';
import { useCrudStore } from '@/store/crud-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (isDbConnected()) {
      const items = await db.systemNotification.findMany({
        orderBy: { createdAt: 'desc' },
      });

      const mapped = items.map((n) => ({
        ...n,
        category: n.target || (n as any).category || 'Announcement',
      }));

      return NextResponse.json({ success: true, data: mapped });
    }
  } catch (err) {
    console.error('Database query error (notifications):', err);
  }
  const store = useCrudStore.getState();
  return NextResponse.json({ success: true, data: store.notifications || [] });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const dataObj = {
      id: body.id || `notif-${Date.now()}`,
      title: String(body.title || 'Notification Title'),
      message: String(body.message || 'Notification Message'),
      type: String(body.type || 'Info'),
      target: String(body.category || body.target || 'All'),
      read: Boolean(body.read),
      timestamp: String(body.timestamp || new Date().toLocaleString()),
    };

    if (isDbConnected()) {
      const created = await db.systemNotification.create({
        data: dataObj as any,
      });

      const mapped = {
        ...created,
        category: created.target,
      };

      return NextResponse.json({ success: true, data: mapped }, { status: 201 });
    }

    const store = useCrudStore.getState();
    store.addRecord('notifications', dataObj);
    return NextResponse.json({ success: true, data: dataObj }, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create notification:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Failed to create notification' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, category, ...updates } = body;
    if (!id) return NextResponse.json({ success: false, error: 'Missing ID' }, { status: 400 });

    const dbUpdates: any = { ...updates };
    if (category) dbUpdates.target = category;

    if (isDbConnected()) {
      await db.systemNotification.update({
        where: { id },
        data: dbUpdates,
      });
      return NextResponse.json({ success: true });
    }

    const store = useCrudStore.getState();
    store.updateRecord('notifications', id, updates);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update notification' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'Missing ID' }, { status: 400 });

    if (isDbConnected()) {
      await db.systemNotification.delete({
        where: { id },
      });
      revalidatePath('/notifications');
      return NextResponse.json({ success: true });
    }

    const store = useCrudStore.getState();
    store.permanentDeleteRecord('notifications', id);
    revalidatePath('/notifications');
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete notification' }, { status: 500 });
  }
}
