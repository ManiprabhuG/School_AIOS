import { NextResponse } from 'next/server';
import { db, isDbConnected } from '@/lib/db';
import { useCrudStore } from '@/store/crud-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (isDbConnected()) {
      const items = await db.exam.findMany({
        orderBy: { createdAt: 'desc' },
      });

      // Map DB fields to UI Exam interface
      const mappedExams = items.map((item) => ({
        ...item,
        name: item.title || (item as any).name || 'Exam',
        examType: item.subject || (item as any).examType || 'Unit Test',
        startDate: item.examDate || (item as any).startDate || new Date().toISOString().split('T')[0],
        endDate: item.examDate || (item as any).endDate || new Date().toISOString().split('T')[0],
        status: item.status === 'Scheduled' ? 'Upcoming' : item.status || 'Upcoming',
      }));

      return NextResponse.json({ success: true, data: mappedExams });
    }
  } catch (err) {
    console.error('Database query error (exams):', err);
  }
  const store = useCrudStore.getState();
  return NextResponse.json({ success: true, data: store.exams || [] });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const dataObj = {
      id: body.id || `exm-${Date.now()}`,
      examCode: String(body.examCode || body.code || `EXM-2026-${Date.now().toString().slice(-4)}`),
      title: String(body.name || body.title || 'Exam Title'),
      className: String(body.className || '10th'),
      section: String(body.section || 'A'),
      subject: String(body.examType || body.subject || 'Mathematics'),
      examDate: String(body.startDate || body.examDate || new Date().toISOString().split('T')[0]),
      totalMarks: Number(body.totalMarks) || 100,
      passingMarks: Number(body.passingMarks) || 35,
      academicYear: String(body.academicYear || '2025-2026'),
      status: String(body.status || 'Scheduled'),
    };

    if (isDbConnected()) {
      const created = await db.exam.create({
        data: dataObj as any,
      });

      const mappedCreated = {
        ...created,
        name: created.title,
        examType: created.subject,
        startDate: created.examDate,
        endDate: created.examDate,
        status: created.status === 'Scheduled' ? 'Upcoming' : created.status,
      };

      return NextResponse.json({ success: true, data: mappedCreated }, { status: 201 });
    }

    const store = useCrudStore.getState();
    store.addRecord('exams', body);
    return NextResponse.json({ success: true, data: body }, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create exam:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Failed to create exam' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, examType, startDate, endDate, ...updates } = body;
    if (!id) return NextResponse.json({ success: false, error: 'Missing ID' }, { status: 400 });

    const dbUpdates: any = { ...updates };
    if (name) dbUpdates.title = name;
    if (examType) dbUpdates.subject = examType;
    if (startDate) dbUpdates.examDate = startDate;

    if (isDbConnected()) {
      await db.exam.update({
        where: { id },
        data: dbUpdates,
      });
      return NextResponse.json({ success: true });
    }

    const store = useCrudStore.getState();
    store.updateRecord('exams', id, body);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update exam' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'Missing ID' }, { status: 400 });

    if (isDbConnected()) {
      await db.exam.delete({
        where: { id },
      });
      return NextResponse.json({ success: true });
    }

    const store = useCrudStore.getState();
    store.permanentDeleteRecord('exams', id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete exam' }, { status: 500 });
  }
}
