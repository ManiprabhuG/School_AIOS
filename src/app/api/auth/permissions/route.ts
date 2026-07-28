import { NextResponse } from 'next/server';
import { useAuthStore } from '@/store/auth-store';
import { initialRolePermissions, useCrudStore } from '@/store/crud-store';
import { RolePermission } from '@/types';

export const dynamic = 'force-dynamic';
import { checkRateLimit } from '@/lib/rate-limit';
import { Logger } from '@/lib/logger';
import { securityConfig } from '@/lib/config';

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
    const { activeRole } = useAuthStore.getState();
    const { rolePermissions } = useCrudStore.getState();

    const permissionsList = rolePermissions || initialRolePermissions;
    const currentRoleMatrix = permissionsList.find(
      (rp: RolePermission) => rp.role === activeRole
    );

    return NextResponse.json({
      success: true,
      role: activeRole,
      permissions: currentRoleMatrix || null,
    });
  } catch (error: any) {
    Logger.error({ endpoint: '/api/auth/permissions', ipAddress, action: 'PERMISSIONS_FETCH_ERROR', error });
    return NextResponse.json(
      { success: false, error: Logger.getSanitizedErrorMessage(error) },
      { status: 500 }
    );
  }
}
