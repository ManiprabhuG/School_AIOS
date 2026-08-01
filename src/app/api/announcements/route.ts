import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
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
        id: a.id,
        title: a.title,
        content: a.content,
        priority: a.category || 'Normal',
        author: a.postedBy || 'Admin',
        targetAudience: ['Students', 'Parents', 'Teachers', 'Staff'],
        date: a.date,
        status: a.status === 'ACTIVE' ? 'Published' : a.status === 'INACTIVE' ? 'Draft' : a.status,
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
        data: dataObj,
      });

      const mapped = {
        id: created.id,
        title: created.title,
        content: created.content,
        priority: created.category,
        author: created.postedBy,
        targetAudience: ['Students', 'Parents', 'Teachers', 'Staff'],
        date: created.date,
        status: created.status === 'ACTIVE' ? 'Published' : created.status === 'INACTIVE' ? 'Draft' : created.status,
      };

      return NextResponse.json({ success: true, data: mapped }, { status: 201 });
    }

    const store = useCrudStore.getState();
    const localMapped = {
      id: dataObj.id,
      title: dataObj.title,
      content: dataObj.content,
      priority: dataObj.category,
      author: dataObj.postedBy,
      targetAudience: ['Students', 'Parents', 'Teachers', 'Staff'],
      date: dataObj.date,
      status: body.status || 'Published',
    };
    store.addRecord('announcements', localMapped);
    return NextResponse.json({ success: true, data: localMapped }, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create announcement:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Failed to create announcement' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const id = body.id;
    if (!id) return NextResponse.json({ success: false, error: 'Missing ID' }, { status: 400 });

    const validDbFields: Record<string, any> = {};
    if (body.title !== undefined) validDbFields.title = String(body.title);
    if (body.content !== undefined) validDbFields.content = String(body.content);
    if (body.priority !== undefined || body.category !== undefined) validDbFields.category = String(body.priority || body.category);
    if (body.author !== undefined || body.postedBy !== undefined) validDbFields.postedBy = String(body.author || body.postedBy);
    if (body.date !== undefined) validDbFields.date = String(body.date);
    if (body.isImportant !== undefined) validDbFields.isImportant = Boolean(body.isImportant);
    if (body.status !== undefined) {
      validDbFields.status = body.status === 'Draft' ? 'INACTIVE' : body.status === 'Published' ? 'ACTIVE' : String(body.status);
    }

    if (isDbConnected()) {
      const updated = await db.announcement.update({
        where: { id },
        data: validDbFields,
      });
      const mapped = {
        id: updated.id,
        title: updated.title,
        content: updated.content,
        priority: updated.category,
        author: updated.postedBy,
        targetAudience: ['Students', 'Parents', 'Teachers', 'Staff'],
        date: updated.date,
        status: updated.status === 'ACTIVE' ? 'Published' : updated.status === 'INACTIVE' ? 'Draft' : updated.status,
      };
      return NextResponse.json({ success: true, data: mapped });
    }

    const store = useCrudStore.getState();
    store.updateRecord('announcements', id, body);
    return NextResponse.json({ success: true, data: body });
  } catch (error: any) {
    console.error('Failed to update announcement:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Failed to update announcement' }, { status: 500 });
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
      revalidatePath('/announcements');
      return NextResponse.json({ success: true });
    }

    const store = useCrudStore.getState();
    store.permanentDeleteRecord('announcements', id);
    revalidatePath('/announcements');
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete announcement' }, { status: 500 });
  }
}
