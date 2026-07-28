import { NextResponse } from 'next/server';
import { db, isDbConnected } from '@/lib/db';
import { useCrudStore } from '@/store/crud-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (isDbConnected()) {
      const dbStudents = await db.student.findMany({
        orderBy: { createdAt: 'desc' },
      });
      const mappedStudents = dbStudents.map((s) => ({
        ...s,
        status: s.status === 'ACTIVE' ? 'Active' : s.status === 'INACTIVE' ? 'Transferred' : s.status,
      }));
      return NextResponse.json({ success: true, data: mappedStudents });
    }
  } catch (err) {
    console.error('Database query error (students):', err);
  }
  try {
    const store = useCrudStore.getState();
    return NextResponse.json({ success: true, data: store?.students || [] });
  } catch (storeErr) {
    return NextResponse.json({ success: true, data: [] });
  }
}

const ALLOWED_STUDENT_FIELDS = [
  'admissionNo',
  'rollNo',
  'firstName',
  'lastName',
  'name',
  'className',
  'section',
  'course',
  'dob',
  'gender',
  'bloodGroup',
  'photo',
  'fatherName',
  'motherName',
  'parentPhone',
  'parentEmail',
  'address',
  'busRoute',
  'feeStatus',
  'totalFees',
  'paidFees',
  'dueFees',
  'attendancePercent',
  'medicalInfo',
  'joiningDate',
];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const timestamp = Date.now();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const uniqueAdmissionNo = body.admissionNo || `ABS-${new Date().getFullYear()}-${timestamp.toString().slice(-4)}${randomNum}`;

    const studentData = {
      id: body.id || `std-${timestamp}`,
      admissionNo: String(uniqueAdmissionNo),
      rollNo: String(body.rollNo || '101'),
      firstName: String(body.firstName || body.name?.split(' ')[0] || 'Student'),
      lastName: String(body.lastName || body.name?.split(' ')[1] || 'Name'),
      name: String(body.name || `${body.firstName || ''} ${body.lastName || ''}`.trim() || 'Student Name'),
      className: String(body.className || '10th'),
      section: String(body.section || 'A'),
      course: body.course ? String(body.course) : null,
      dob: String(body.dob || '2010-01-01'),
      gender: String(body.gender || 'Male'),
      bloodGroup: String(body.bloodGroup || 'O+'),
      photo: body.photo ? String(body.photo) : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      fatherName: String(body.fatherName || 'Father Name'),
      motherName: String(body.motherName || 'Mother Name'),
      parentPhone: String(body.parentPhone || '9876543210'),
      parentEmail: String(body.parentEmail || 'parent@example.com'),
      address: String(body.address || 'Address Details'),
      busRoute: String(body.busRoute || 'Self Transport'),
      feeStatus: String(body.feeStatus || 'Pending'),
      totalFees: Number(body.totalFees) || 0,
      paidFees: Number(body.paidFees) || 0,
      dueFees: Number(body.dueFees) || 0,
      attendancePercent: Number(body.attendancePercent) || 0,
      medicalInfo: body.medicalInfo ? String(body.medicalInfo) : null,
      joiningDate: String(body.joiningDate || new Date().toISOString().split('T')[0]),
    };

    const dbData: any = {
      ...studentData,
      status: body.status === 'Transferred' || body.status === 'Inactive' ? 'INACTIVE' : 'ACTIVE',
    };

    if (isDbConnected()) {
      const created = await db.student.create({
        data: dbData,
      });
      const mapped = {
        ...created,
        status: created.status === 'ACTIVE' ? 'Active' : 'Transferred',
      };
      return NextResponse.json({ success: true, data: mapped }, { status: 201 });
    }

    const store = useCrudStore.getState();
    store.addRecord('students', studentData);
    return NextResponse.json({ success: true, data: studentData }, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create student in database:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Failed to create student' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ success: false, error: 'Missing ID' }, { status: 400 });

    const dbUpdates: any = {};
    for (const key of ALLOWED_STUDENT_FIELDS) {
      if (updates[key] !== undefined) {
        dbUpdates[key] = updates[key];
      }
    }

    if (updates.status) {
      dbUpdates.status = updates.status === 'Active' ? 'ACTIVE' : updates.status === 'Transferred' || updates.status === 'Inactive' ? 'INACTIVE' : 'ACTIVE';
    }

    if (isDbConnected()) {
      await db.student.update({
        where: { id },
        data: dbUpdates,
      });
      return NextResponse.json({ success: true });
    }

    const store = useCrudStore.getState();
    store.updateRecord('students', id, updates);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to update student in database:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Failed to update student' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'Missing ID' }, { status: 400 });

    if (isDbConnected()) {
      await db.student.delete({
        where: { id },
      });
      return NextResponse.json({ success: true });
    }

    const store = useCrudStore.getState();
    store.permanentDeleteRecord('students', id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete student' }, { status: 500 });
  }
}
