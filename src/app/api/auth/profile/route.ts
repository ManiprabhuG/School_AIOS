import { NextResponse } from 'next/server';
import { useAuthStore } from '@/store/auth-store';

export const dynamic = 'force-dynamic';
import { checkRateLimit } from '@/lib/rate-limit';
import { Logger } from '@/lib/logger';
import { securityConfig } from '@/lib/config';

export async function GET(request: Request) {
  const ipAddress = request.headers.get('x-forwarded-for') || '127.0.0.1';
  const rateLimitKey = `profile_${ipAddress}`;

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
    const { user, activeRole, isAuthenticated } = useAuthStore.getState();

    if (!isAuthenticated || !user) {
      Logger.warn({ endpoint: '/api/auth/profile', ipAddress, action: 'UNAUTHORIZED_ACCESS' });
      return NextResponse.json(
        { success: false, error: 'Unauthorized user session.' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: activeRole,
        avatar: user.avatar,
        phone: user.phone,
        status: user.status,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error: any) {
    Logger.error({ endpoint: '/api/auth/profile', ipAddress, action: 'PROFILE_FETCH_ERROR', error });
    return NextResponse.json(
      { success: false, error: Logger.getSanitizedErrorMessage(error) },
      { status: 500 }
    );
  }
}
