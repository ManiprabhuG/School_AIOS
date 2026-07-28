import { NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';
import { validatePassword, validateSafePayload } from '@/lib/validation';
import { Logger } from '@/lib/logger';
import { securityConfig } from '@/lib/config';

export async function POST(request: Request) {
  const ipAddress = request.headers.get('x-forwarded-for') || '127.0.0.1';
  const rateLimitKey = `reset_pwd_${ipAddress}`;

  const rateLimitResult = checkRateLimit(
    rateLimitKey,
    securityConfig.rateLimiting.authRateLimit,
    securityConfig.rateLimiting.rateLimitWindowMs
  );

  if (!rateLimitResult.success) {
    Logger.warn({
      endpoint: '/api/auth/reset-password',
      ipAddress,
      action: 'RATE_LIMIT_EXCEEDED',
      message: `Reset password rate limit hit. Retry after ${rateLimitResult.retryAfterSeconds}s.`,
    });

    return NextResponse.json(
      {
        success: false,
        error: `Too many password reset requests. Please try again after ${rateLimitResult.retryAfterSeconds} seconds.`,
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(rateLimitResult.retryAfterSeconds || 60),
        },
      }
    );
  }

  try {
    const body = await request.json();
    const safePayload = validateSafePayload(body);
    if (!safePayload.isValid) {
      return NextResponse.json({ success: false, error: safePayload.error }, { status: 400 });
    }

    const { newPassword } = body;
    const pwdCheck = validatePassword(newPassword);

    if (!pwdCheck.isValid) {
      return NextResponse.json(
        { success: false, error: pwdCheck.error },
        { status: 400 }
      );
    }

    Logger.info({
      endpoint: '/api/auth/reset-password',
      ipAddress,
      action: 'PASSWORD_RESET_SUCCESS',
      message: 'Password reset completed successfully.',
    });

    return NextResponse.json({
      success: true,
      message: 'Password reset completed successfully. Please sign in with your new password.',
    });
  } catch (error: any) {
    Logger.error({
      endpoint: '/api/auth/reset-password',
      ipAddress,
      action: 'PASSWORD_RESET_ERROR',
      error,
    });
    return NextResponse.json(
      { success: false, error: Logger.getSanitizedErrorMessage(error) },
      { status: 500 }
    );
  }
}
