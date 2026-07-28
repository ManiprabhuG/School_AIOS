/**
 * ABS School Management ERP - Input Validation & Sanitization Utility
 * Provides sanitization and validation schemas across Frontend & Backend API layers.
 */

// Patterns to detect potential malicious injections
const SQL_INJECTION_PATTERN = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|EXEC|UNION|TRUNCATE)\b)|(['";\-])/i;
const XSS_PATTERN = /(<script\b[^>]*>|javascript:|on\w+\s*=|data:text\/html)/i;
const PATH_TRAVERSAL_PATTERN = /(\.\.\/|\.\.\\)/;

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  sanitized?: string;
}

/**
 * Sanitizes generic string inputs by stripping HTML tags and trimming whitespace.
 */
export function sanitizeString(input: unknown): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<[^>]*>?/gm, '') // Strip HTML tags
    .trim();
}

/**
 * Validates identifier (username or email).
 */
export function validateIdentifier(identifier: unknown): ValidationResult {
  if (typeof identifier !== 'string' || !identifier.trim()) {
    return { isValid: false, error: 'User ID or Email is required.' };
  }
  const clean = identifier.trim();
  if (clean.length < 2 || clean.length > 150) {
    return { isValid: false, error: 'User ID or Email must be between 2 and 150 characters.' };
  }
  if (PATH_TRAVERSAL_PATTERN.test(clean)) {
    return { isValid: false, error: 'Invalid characters in User ID or Email.' };
  }
  if (XSS_PATTERN.test(clean)) {
    return { isValid: false, error: 'Malicious content detected in input.' };
  }
  return { isValid: true, sanitized: clean };
}

/**
 * Validates password format and strength parameters.
 */
export function validatePassword(password: unknown): ValidationResult {
  if (typeof password !== 'string' || !password) {
    return { isValid: false, error: 'Password is required.' };
  }
  if (password.length < 4 || password.length > 128) {
    return { isValid: false, error: 'Password must be between 4 and 128 characters.' };
  }
  return { isValid: true, sanitized: password };
}

/**
 * Validates standard email address format.
 */
export function validateEmail(email: unknown): ValidationResult {
  if (typeof email !== 'string' || !email.trim()) {
    return { isValid: false, error: 'Email address is required.' };
  }
  const clean = email.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(clean)) {
    return { isValid: false, error: 'Invalid email address format.' };
  }
  return { isValid: true, sanitized: clean };
}

/**
 * Validates phone numbers (Indian & international formats).
 */
export function validatePhone(phone: unknown): ValidationResult {
  if (typeof phone !== 'string' || !phone.trim()) {
    return { isValid: true, sanitized: '' }; // Optional phone
  }
  const clean = phone.trim();
  const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,15}$/;
  if (!phoneRegex.test(clean)) {
    return { isValid: false, error: 'Invalid phone number format.' };
  }
  return { isValid: true, sanitized: clean };
}

/**
 * Validates generic payload for malicious SQL/XSS patterns.
 */
export function validateSafePayload(data: Record<string, any>): ValidationResult {
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      if (XSS_PATTERN.test(value)) {
        return { isValid: false, error: `Invalid input detected in field '${key}'.` };
      }
      if (SQL_INJECTION_PATTERN.test(value)) {
        return { isValid: false, error: `Potentially unsafe input detected in field '${key}'.` };
      }
    }
  }
  return { isValid: true };
}
