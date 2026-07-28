import { NextResponse } from 'next/server';
import { useAuthStore } from '@/store/auth-store';
import { Logger } from '@/lib/logger';

export async function POST(request: Request) {
  const ipAddress = request.headers.get('x-forwarded-for') || '127.0.0.1';
  const { user } = useAuthStore.getState();

  Logger.info({
    endpoint: '/api/auth/logout',
    userId: user?.id || 'anonymous',
    ipAddress,
    action: 'LOGOUT_SUCCESS',
    message: 'User session logged out successfully.',
  });

  useAuthStore.getState().logout();

  return NextResponse.json({
    success: true,
    message: 'User session logged out successfully.',
  });
}
