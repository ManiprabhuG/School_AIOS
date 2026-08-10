import { NextResponse } from 'next/server';
import { db, isDbConnected } from '@/lib/db';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const SETTINGS_FILE = path.join(process.cwd(), 'src', 'data', 'system_settings.json');

const DEFAULT_SETTINGS = {
  id: 'company_settings',
  schoolName: 'ABS MATRICULATION HIGHER SECONDARY SCHOOL',
  schoolLogo: '',
  theme: 'light',
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

function readSettingsFile() {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const content = fs.readFileSync(SETTINGS_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error reading settings file:', err);
  }
  return null;
}

function writeSettingsFile(data: any) {
  try {
    const dir = path.dirname(SETTINGS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing settings file:', err);
  }
}

export async function GET() {
  try {
    if (isDbConnected()) {
      const setting = await db.systemSetting.findFirst();
      if (setting) {
        const fileSettings = readSettingsFile() || {};
        const merged = { ...DEFAULT_SETTINGS, ...setting, theme: fileSettings.theme || (setting as any).theme || 'light', schoolLogo: setting.schoolLogo || fileSettings.schoolLogo || '' };
        return NextResponse.json({ success: true, data: merged });
      }
    }
  } catch (err) {
    console.error('Database query error (system_settings):', err);
  }

  const fileSettings = readSettingsFile();
  if (fileSettings) {
    return NextResponse.json({ success: true, data: { ...DEFAULT_SETTINGS, ...fileSettings } });
  }

  return NextResponse.json({ success: true, data: DEFAULT_SETTINGS });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const fileSettings = readSettingsFile() || {};

    const dataObj = {
      id: 'company_settings',
      schoolName: String(body.schoolName || DEFAULT_SETTINGS.schoolName),
      schoolLogo: body.schoolLogo !== undefined ? String(body.schoolLogo) : (fileSettings.schoolLogo || ''),
      theme: String(body.theme || fileSettings.theme || 'light'),
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

    writeSettingsFile(dataObj);

    if (isDbConnected()) {
      try {
        const { theme, ...dbData } = dataObj;
        await db.systemSetting.upsert({
          where: { id: 'company_settings' },
          update: dbData,
          create: dbData,
        });
      } catch (dbErr) {
        console.error('Error saving settings to DB:', dbErr);
      }
    }

    return NextResponse.json({ success: true, data: dataObj }, { status: 200 });
  } catch (error: any) {
    console.error('Failed to save settings to database/file:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to save settings' },
      { status: 500 }
    );
  }
}
