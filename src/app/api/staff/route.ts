import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
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
        allocatedClass: s.assignedClass || (s as any).allocatedClass || '10th A',
        subjects: s.subjectSpecial ? s.subjectSpecial.split(',').map((item) => item.trim()) : (s as any).subjects || [],
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
      assignedClass: body.assignedClass || body.allocatedClass || null,
      subjectSpecial: Array.isArray(body.subjects) ? body.subjects.join(', ') : body.subjectSpecial || null,
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
        allocatedClass: created.assignedClass || '10th A',
        subjects: created.subjectSpecial ? created.subjectSpecial.split(',').map((i) => i.trim()) : [],
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
    const { id, empId, username, password, experienceYears, ...updates } = body;
    if (!id) return NextResponse.json({ success: false, error: 'Missing ID' }, { status: 400 });

    const cleanData: any = {};
    if (body.firstName !== undefined) cleanData.firstName = String(body.firstName);
    if (body.lastName !== undefined) cleanData.lastName = String(body.lastName);
    if (body.name !== undefined || (body.firstName && body.lastName)) {
      cleanData.name = body.name || `${body.firstName || ''} ${body.lastName || ''}`.trim();
    }
    if (body.role !== undefined) cleanData.role = String(body.role);
    if (body.designation !== undefined) cleanData.designation = String(body.designation);
    if (body.department !== undefined) cleanData.department = String(body.department);
    if (body.email !== undefined) cleanData.email = String(body.email);
    if (body.phone !== undefined) cleanData.phone = String(body.phone);
    if (body.qualification !== undefined) cleanData.qualification = String(body.qualification);
    if (body.salary !== undefined) cleanData.salary = Number(body.salary) || 0;
    if (body.joiningDate !== undefined) cleanData.joiningDate = String(body.joiningDate);
    if (body.gender !== undefined) cleanData.gender = String(body.gender);
    if (body.address !== undefined) cleanData.address = String(body.address);
    if (body.photo !== undefined) cleanData.photo = body.photo;

    if (body.empId || body.employeeId) cleanData.employeeId = body.empId || body.employeeId;
    if (body.allocatedClass || body.assignedClass) cleanData.assignedClass = body.allocatedClass || body.assignedClass;
    if (body.subjects || body.subjectSpecial) {
      cleanData.subjectSpecial = Array.isArray(body.subjects) ? body.subjects.join(', ') : body.subjectSpecial;
    }
    if (body.status !== undefined) {
      cleanData.status = body.status === 'Active' ? 'ACTIVE' : body.status === 'Inactive' ? 'INACTIVE' : String(body.status);
    }

    if (isDbConnected()) {
      try {
        await db.staff.update({
          where: { id },
          data: cleanData,
        });
      } catch (dbErr) {
        console.error('Failed to update staff in MySQL DB:', dbErr);
      }
    }

    const store = useCrudStore.getState();
    store.updateRecord('staff', id, { ...updates, ...cleanData, name: cleanData.name || body.name });
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
      revalidatePath('/staff');
      return NextResponse.json({ success: true });
    }

    const store = useCrudStore.getState();
    store.permanentDeleteRecord('staff', id);
    revalidatePath('/staff');
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete staff' }, { status: 500 });
  }
}
