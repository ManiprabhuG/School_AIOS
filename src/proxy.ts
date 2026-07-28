import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { securityConfig } from '@/lib/config';

export function proxy(request: NextRequest) {
  const response = NextResponse.next();
  const origin = request.headers.get('origin');

  // Verify CORS Origin if present
  if (origin) {
    if (securityConfig.cors.allowedOrigins.includes(origin) || securityConfig.cors.allowedOrigins.includes('*')) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      response.headers.set('Access-Control-Allow-Credentials', 'true');
    }
  }

  // Set Security Response Headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Handle OPTIONS preflight request
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: response.headers,
    });
  }

  return response;
}

// Fallback export for backward compatibility
export function middleware(request: NextRequest) {
  return proxy(request);
}

export const config = {
  matcher: ['/api/:path*'],
};
