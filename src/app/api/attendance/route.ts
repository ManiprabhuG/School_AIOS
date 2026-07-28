import { NextResponse } from 'next/server';
import { db, isDbConnected } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (isDbConnected()) {
      const records = await db.attendanceRecord.findMany({
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json({ success: true, data: records });
    }
  } catch (err) {
    console.error('Database query error (attendance):', err);
  }
  return NextResponse.json({ success: true, data: [] });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const timestamp = Date.now();

    const attData = {
      id: body.id || `att-${timestamp}`,
      date: String(body.date || new Date().toISOString().split('T')[0]),
      entityId: String(body.entityId || body.id || `ent-${timestamp}`),
      entityType: String(body.entityType || 'Student'),
      name: String(body.name || 'User'),
      className: body.className ? String(body.className) : null,
      section: body.section ? String(body.section) : null,
      staffType: body.staffType ? String(body.staffType) : null,
      department: body.department ? String(body.department) : null,
      status: String(body.status || 'Present'),
      timeIn: body.timeIn ? String(body.timeIn) : null,
      timeOut: body.timeOut ? String(body.timeOut) : null,
      remarks: body.remarks ? String(body.remarks) : '',
    };

    if (isDbConnected()) {
      const created = await db.attendanceRecord.create({
        data: attData,
      });
      return NextResponse.json({ success: true, data: created }, { status: 201 });
    }

    return NextResponse.json({ success: true, data: attData }, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create attendance record in database:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Failed to create attendance record' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ success: false, error: 'Missing ID' }, { status: 400 });

    const allowedFields = ['date', 'entityId', 'entityType', 'name', 'className', 'section', 'staffType', 'department', 'status', 'timeIn', 'timeOut', 'remarks'];
    const dbUpdates: any = {};
    for (const key of allowedFields) {
      if (updates[key] !== undefined) {
        dbUpdates[key] = updates[key];
      }
    }

    if (isDbConnected()) {
      await db.attendanceRecord.update({
        where: { id },
        data: dbUpdates,
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to update attendance record:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Failed to update attendance record' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'Missing ID' }, { status: 400 });

    if (isDbConnected()) {
      await db.attendanceRecord.delete({
        where: { id },
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to delete attendance record:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Failed to delete attendance record' }, { status: 500 });
  }
}
