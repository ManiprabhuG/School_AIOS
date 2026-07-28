import { NextResponse } from 'next/server';
import { db, isDbConnected } from '@/lib/db';

export const dynamic = 'force-dynamic';

const DEFAULT_SETTINGS = {
  id: 'company_settings',
  schoolName: 'ABS MATRICULATION HIGHER SECONDARY SCHOOL',
  schoolLogo: '',
  address: '124, Education Boulevard, Knowledge City, Chennai, Tamil Nadu',
  pincode: '600001',
  gstin: '33AAAAA0000A1Z5',
  phone: '+91 44 2800 1122 / +91 98765 43210',
  email: 'info@absschool.edu.in',
  website: 'www.absschool.edu.in',
  academicYear: '2025 - 2026',
  currency: 'INR (₹)',
  timeZone: 'Asia/Kolkata (IST)',
  affiliationNo: 'AFF-TN-2026-99',
  authorizedSignatoryTitle: 'Authorized Finance Officer & Principal',
};

export async function GET() {
  try {
    if (isDbConnected()) {
      const setting = await db.systemSetting.findFirst();
      if (setting) {
        return NextResponse.json({ success: true, data: setting });
      }
    }
  } catch (err) {
    console.error('Database query error (system_settings):', err);
  }
  return NextResponse.json({ success: true, data: DEFAULT_SETTINGS });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const dataObj = {
      id: 'company_settings',
      schoolName: String(body.schoolName || DEFAULT_SETTINGS.schoolName),
      schoolLogo: body.schoolLogo ? String(body.schoolLogo) : '',
      address: String(body.address || DEFAULT_SETTINGS.address),
      pincode: String(body.pincode || DEFAULT_SETTINGS.pincode),
      gstin: String(body.gstin || DEFAULT_SETTINGS.gstin),
      phone: String(body.phone || DEFAULT_SETTINGS.phone),
      email: String(body.email || DEFAULT_SETTINGS.email),
      website: String(body.website || DEFAULT_SETTINGS.website),
      academicYear: String(body.academicYear || DEFAULT_SETTINGS.academicYear),
      currency: String(body.currency || DEFAULT_SETTINGS.currency),
      timeZone: String(body.timeZone || DEFAULT_SETTINGS.timeZone),
      affiliationNo: String(body.affiliationNo || DEFAULT_SETTINGS.affiliationNo),
      authorizedSignatoryTitle: String(body.authorizedSignatoryTitle || DEFAULT_SETTINGS.authorizedSignatoryTitle),
    };

    if (isDbConnected()) {
      const saved = await db.systemSetting.upsert({
        where: { id: 'company_settings' },
        update: dataObj,
        create: dataObj,
      });
      return NextResponse.json({ success: true, data: saved }, { status: 200 });
    }

    return NextResponse.json({ success: true, data: dataObj }, { status: 200 });
  } catch (error: any) {
    console.error('Failed to save settings to database:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to save settings to database' },
      { status: 500 }
    );
  }
}
