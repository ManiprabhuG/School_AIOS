import { NextResponse } from 'next/server';
import { db, isDbConnected } from '@/lib/db';
import { useCrudStore } from '@/store/crud-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (isDbConnected()) {
      const dbStaff = await db.staff.findMany({
        orderBy: { createdAt: 'desc' },
      });

      const mappedStaff = dbStaff.map((s) => ({
        ...s,
        empId: s.employeeId || (s as any).empId || 'EMP-001',
        status: s.status === 'ACTIVE' ? 'Active' : s.status === 'INACTIVE' ? 'Inactive' : s.status,
      }));

      return NextResponse.json({ success: true, data: mappedStaff });
    }
  } catch (err) {
    console.error('Database query error (staff):', err);
  }
  const store = useCrudStore.getState();
  return NextResponse.json({ success: true, data: store.staff || [] });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const staffData = {
      id: body.id || `stf-${Date.now()}`,
      employeeId: body.empId || body.employeeId || `EMP-2026-${Date.now().toString().slice(-4)}`,
      firstName: body.firstName || body.name?.split(' ')[0] || 'Staff',
      lastName: body.lastName || body.name?.split(' ')[1] || 'Member',
      name: body.name || `${body.firstName || ''} ${body.lastName || ''}`.trim() || 'Staff Member',
      role: String(body.role || 'Teacher'),
      designation: String(body.designation || body.role || 'Senior Teacher'),
      department: String(body.department || 'Academics'),
      email: String(body.email || `staff_${Date.now()}@absschool.edu.in`),
      phone: String(body.phone || '9876543210'),
      qualification: String(body.qualification || 'B.Ed, M.Sc'),
      salary: Number(body.salary) || 35000,
      joiningDate: String(body.joiningDate || new Date().toISOString().split('T')[0]),
      gender: String(body.gender || 'Male'),
      address: String(body.address || 'Address Details'),
      photo: body.photo || null,
      assignedClass: body.assignedClass || null,
      subjectSpecial: body.subjectSpecial || null,
      status: body.status === 'Inactive' ? 'INACTIVE' : 'ACTIVE',
    };

    if (isDbConnected()) {
      const created = await db.staff.create({
        data: staffData as any,
      });

      const mapped = {
        ...created,
        empId: created.employeeId,
        status: created.status === 'ACTIVE' ? 'Active' : 'Inactive',
      };

      return NextResponse.json({ success: true, data: mapped }, { status: 201 });
    }

    const store = useCrudStore.getState();
    store.addRecord('staff', staffData);
    return NextResponse.json({ success: true, data: staffData }, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create staff:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Failed to create staff' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, empId, ...updates } = body;
    if (!id) return NextResponse.json({ success: false, error: 'Missing ID' }, { status: 400 });

    const dbUpdates: any = { ...updates };
    if (empId) dbUpdates.employeeId = empId;
    if (dbUpdates.status === 'Active') dbUpdates.status = 'ACTIVE';
    if (dbUpdates.status === 'Inactive') dbUpdates.status = 'INACTIVE';

    if (isDbConnected()) {
      await db.staff.update({
        where: { id },
        data: dbUpdates,
      });
      return NextResponse.json({ success: true });
    }

    const store = useCrudStore.getState();
    store.updateRecord('staff', id, updates);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update staff' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'Missing ID' }, { status: 400 });

    if (isDbConnected()) {
      await db.staff.delete({
        where: { id },
      });
      return NextResponse.json({ success: true });
    }

    const store = useCrudStore.getState();
    store.permanentDeleteRecord('staff', id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete staff' }, { status: 500 });
  }
}
