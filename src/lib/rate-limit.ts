/**
 * ABS School Management ERP - Configurable Rate Limiter
 * Implements sliding window rate limiting and exponential backoff calculations for APIs.
 */

import { securityConfig } from './config';

interface RateLimitEntry {
  count: number;
  resetTime: number;
  lastAttempt: number;
  consecutiveFailures: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

// Cleanup stale rate limit entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitMap.entries()) {
      if (now > entry.resetTime && entry.consecutiveFailures === 0) {
        rateLimitMap.delete(key);
      }
    }
  }, 300000);
}

export interface RateLimitCheckResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetMs: number;
  retryAfterSeconds?: number;
}

/**
 * Checks rate limit for a given key (IP, user account, endpoint).
 */
export function checkRateLimit(
  key: string,
  limit: number = securityConfig.rateLimiting.authRateLimit,
  windowMs: number = securityConfig.rateLimiting.rateLimitWindowMs
): RateLimitCheckResult {
  const now = Date.now();
  let entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetTime) {
    entry = {
      count: 1,
      resetTime: now + windowMs,
      lastAttempt: now,
      consecutiveFailures: 0,
    };
    rateLimitMap.set(key, entry);
    return {
      success: true,
      limit,
      remaining: limit - 1,
      resetMs: windowMs,
    };
  }

  if (entry.count >= limit) {
    const resetMs = entry.resetTime - now;
    const retryAfterSeconds = Math.ceil(resetMs / 1000);
    return {
      success: false,
      limit,
      remaining: 0,
      resetMs,
      retryAfterSeconds,
    };
  }

  entry.count += 1;
  entry.lastAttempt = now;

  return {
    success: true,
    limit,
    remaining: limit - entry.count,
    resetMs: entry.resetTime - now,
  };
}

/**
 * Records a failed attempt for exponential backoff calculations.
 */
export function recordFailedAttempt(key: string): void {
  const entry = rateLimitMap.get(key);
  if (entry) {
    entry.consecutiveFailures += 1;
    if (securityConfig.rateLimiting.exponentialBackoff) {
      const backoffMs = Math.min(
        securityConfig.rateLimiting.rateLimitWindowMs * Math.pow(2, entry.consecutiveFailures - 1),
        3600000 // Max backoff 1 hour
      );
      entry.resetTime = Date.now() + backoffMs;
    }
  }
}

/**
 * Resets failed attempts on successful action.
 */
export function resetFailedAttempts(key: string): void {
  const entry = rateLimitMap.get(key);
  if (entry) {
    entry.consecutiveFailures = 0;
    entry.count = 0;
  }
}
