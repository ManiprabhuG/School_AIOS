import { NextResponse } from 'next/server';
import { db, isDbConnected } from '@/lib/db';
import { initialRolePermissions, useCrudStore } from '@/store/crud-store';
import { RolePermission } from '@/types';
import { checkRateLimit } from '@/lib/rate-limit';
import { Logger } from '@/lib/logger';
import { securityConfig } from '@/lib/config';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const ipAddress = request.headers.get('x-forwarded-for') || '127.0.0.1';
  const rateLimitKey = `permissions_${ipAddress}`;

  const rateLimitResult = checkRateLimit(
    rateLimitKey,
    securityConfig.rateLimiting.userRateLimit,
    securityConfig.rateLimiting.rateLimitWindowMs
  );

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { success: false, error: 'Rate limit exceeded.' },
      { status: 429 }
    );
  }

  try {
    if (isDbConnected()) {
      const dbPermissions = await db.rolePermission.findMany();
      if (dbPermissions && dbPermissions.length > 0) {
        const formatted = dbPermissions.map((rp) => ({
          id: rp.id,
          role: rp.role,
          description: rp.description || '',
          permissions: typeof rp.permissions === 'string' ? JSON.parse(rp.permissions) : rp.permissions,
        }));
        return NextResponse.json({
          success: true,
          permissions: formatted,
        });
      }
    }

    const { rolePermissions } = useCrudStore.getState();
    const permissionsList = rolePermissions.length > 0 ? rolePermissions : initialRolePermissions;

    return NextResponse.json({
      success: true,
      permissions: permissionsList,
    });
  } catch (error: any) {
    Logger.error({ endpoint: '/api/auth/permissions', ipAddress, action: 'PERMISSIONS_FETCH_ERROR', error });
    return NextResponse.json({ success: true, permissions: initialRolePermissions });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const items: RolePermission[] = Array.isArray(body) ? body : [body];

    if (isDbConnected()) {
      for (const item of items) {
        if (!item.role) continue;
        const permissionsJson = JSON.stringify(item.permissions || []);
        await db.rolePermission.upsert({
          where: { role: item.role },
          update: {
            description: item.description || '',
            permissions: permissionsJson,
          },
          create: {
            role: item.role,
            description: item.description || '',
            permissions: permissionsJson,
          },
        });
      }
    }

    return NextResponse.json({ success: true, data: items }, { status: 200 });
  } catch (error: any) {
    console.error('Failed to save role permissions to DB:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to save role permissions' },
      { status: 500 }
    );
  }
}
