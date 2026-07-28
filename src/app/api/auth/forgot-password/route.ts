import { NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';
import { validateIdentifier, validateSafePayload } from '@/lib/validation';
import { Logger } from '@/lib/logger';
import { securityConfig } from '@/lib/config';

export async function POST(request: Request) {
  const ipAddress = request.headers.get('x-forwarded-for') || '127.0.0.1';
  const rateLimitKey = `forgot_pwd_${ipAddress}`;

  const rateLimitResult = checkRateLimit(
    rateLimitKey,
    securityConfig.rateLimiting.authRateLimit,
    securityConfig.rateLimiting.rateLimitWindowMs
  );

  if (!rateLimitResult.success) {
    Logger.warn({
      endpoint: '/api/auth/forgot-password',
      ipAddress,
      action: 'RATE_LIMIT_EXCEEDED',
      message: `Password recovery rate limit hit. Retry after ${rateLimitResult.retryAfterSeconds}s.`,
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

    const { email } = body;
    const validation = validateIdentifier(email);

    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    const cleanEmail = validation.sanitized!;

    Logger.info({
      endpoint: '/api/auth/forgot-password',
      ipAddress,
      action: 'FORGOT_PASSWORD_REQUESTED',
      message: `OTP requested for ${cleanEmail}`,
    });

    return NextResponse.json({
      success: true,
      message: `If an account exists for ${cleanEmail}, password recovery instructions have been sent.`,
    });
  } catch (error: any) {
    Logger.error({
      endpoint: '/api/auth/forgot-password',
      ipAddress,
      action: 'FORGOT_PASSWORD_ERROR',
      error,
    });
    return NextResponse.json(
      { success: false, error: Logger.getSanitizedErrorMessage(error) },
      { status: 500 }
    );
  }
}
