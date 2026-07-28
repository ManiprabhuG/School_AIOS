/**
 * ABS School Management ERP - Security & Application Configuration
 * Centralized loader for environment configuration with secure fallback defaults.
 */

export const securityConfig = {
  env: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'abs_school_erp_secure_jwt_secret_key_2026_default',
  
  rateLimiting: {
    authRateLimit: parseInt(process.env.AUTH_RATE_LIMIT || '5', 10),
    publicRateLimit: parseInt(process.env.PUBLIC_RATE_LIMIT || '30', 10),
    userRateLimit: parseInt(process.env.USER_RATE_LIMIT || '100', 10),
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '60000', 10),
    exponentialBackoff: process.env.EXPONENTIAL_BACKOFF !== 'false',
  },

  fileUpload: {
    maxSizeBytes: parseInt(process.env.MAX_UPLOAD_SIZE_MB || '5', 10) * 1024 * 1024,
    allowedExtensions: (process.env.ALLOWED_FILE_EXTENSIONS || '.csv,.xlsx,.xls,.pdf,.jpg,.jpeg,.png')
      .split(',')
      .map((ext) => ext.trim().toLowerCase()),
  },

  cors: {
    allowedOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000')
      .split(',')
      .map((origin) => origin.trim()),
  },
};
