import { NextResponse } from 'next/server';
import { db, isDbConnected } from '@/lib/db';
import { useCrudStore } from '@/store/crud-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (isDbConnected()) {
      const items = await db.announcement.findMany({
        orderBy: { createdAt: 'desc' },
      });

      const mapped = items.map((a) => ({
        ...a,
        priority: a.category || (a as any).priority || 'Normal',
        author: a.postedBy || (a as any).author || 'Admin',
        targetAudience: ['Students', 'Parents', 'Teachers', 'Staff'],
        status: a.status === 'ACTIVE' ? 'Published' : a.status,
      }));

      return NextResponse.json({ success: true, data: mapped });
    }
  } catch (err) {
    console.error('Database query error (announcements):', err);
  }
  try {
    const store = useCrudStore.getState();
    return NextResponse.json({ success: true, data: store?.announcements || [] });
  } catch (storeErr) {
    return NextResponse.json({ success: true, data: [] });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const dataObj = {
      id: body.id || `anc-${Date.now()}`,
      title: String(body.title || 'Announcement Title'),
      content: String(body.content || 'Announcement Details'),
      category: String(body.priority || body.category || 'Normal'),
      targetAudience: 'All',
      postedBy: String(body.author || body.postedBy || 'Admin'),
      date: String(body.date || new Date().toISOString().split('T')[0]),
      isImportant: Boolean(body.isImportant),
      status: body.status === 'Draft' ? 'INACTIVE' : 'ACTIVE',
    };

    if (isDbConnected()) {
      const created = await db.announcement.create({
        data: dataObj as any,
      });

      const mapped = {
        ...created,
        priority: created.category,
        author: created.postedBy,
        targetAudience: ['Students', 'Parents', 'Teachers', 'Staff'],
        status: created.status === 'ACTIVE' ? 'Published' : 'Draft',
      };

      return NextResponse.json({ success: true, data: mapped }, { status: 201 });
    }

    const store = useCrudStore.getState();
    store.addRecord('announcements', dataObj);
    return NextResponse.json({ success: true, data: dataObj }, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create announcement:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Failed to create announcement' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, priority, author, ...updates } = body;
    if (!id) return NextResponse.json({ success: false, error: 'Missing ID' }, { status: 400 });

    const dbUpdates: any = { ...updates };
    if (priority) dbUpdates.category = priority;
    if (author) dbUpdates.postedBy = author;
    if (dbUpdates.status === 'Published') dbUpdates.status = 'ACTIVE';

    if (isDbConnected()) {
      await db.announcement.update({
        where: { id },
        data: dbUpdates,
      });
      return NextResponse.json({ success: true });
    }

    const store = useCrudStore.getState();
    store.updateRecord('announcements', id, updates);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update announcement' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'Missing ID' }, { status: 400 });

    if (isDbConnected()) {
      await db.announcement.delete({
        where: { id },
      });
      return NextResponse.json({ success: true });
    }

    const store = useCrudStore.getState();
    store.permanentDeleteRecord('announcements', id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete announcement' }, { status: 500 });
  }
}
