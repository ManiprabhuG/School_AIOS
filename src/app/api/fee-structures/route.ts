import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db, isDbConnected } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (isDbConnected()) {
      const structures = await db.feeStructure.findMany({
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json({ success: true, data: structures });
    }
  } catch (err) {
    console.error('Database query error (fee_structures):', err);
  }
  return NextResponse.json({ success: true, data: [] });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const timestamp = Date.now();

    const dataObj = {
      id: body.id || `fs-${timestamp}`,
      className: String(body.className || '10th'),
      academicYear: String(body.academicYear || '2025 - 2026'),
      tuitionFee: Number(body.tuitionFee) || 0,
      admissionFee: Number(body.admissionFee) || 0,
      uniformFee: Number(body.uniformFee) || 0,
      transportFee: Number(body.transportFee) || 0,
      labFee: Number(body.labFee) || 0,
      otherFee: Number(body.otherFee) || 0,
      totalAnnualFee: Number(body.totalAnnualFee) || 0,
      dueDate: String(body.dueDate || '2026-08-31'),
    };

    if (isDbConnected()) {
      const created = await db.feeStructure.upsert({
        where: { id: dataObj.id },
        update: dataObj,
        create: dataObj,
      });
      return NextResponse.json({ success: true, data: created }, { status: 201 });
    }

    return NextResponse.json({ success: true, data: dataObj }, { status: 201 });
  } catch (error: any) {
    console.error('Failed to save fee structure:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Failed to save fee structure' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'Missing ID' }, { status: 400 });

    if (isDbConnected()) {
      await db.feeStructure.delete({
        where: { id },
      });
      revalidatePath('/fees');
      return NextResponse.json({ success: true });
    }

    revalidatePath('/fees');
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to delete fee structure:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Failed to delete fee structure' }, { status: 500 });
  }
}
