/**
 * ABS School Management ERP - Centralized Security & Application Logger
 * Logs technical audit details internally while shielding users from stack trace leakage.
 */

export interface LogPayload {
  timestamp?: string;
  endpoint?: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  action?: string;
  statusCode?: number;
  message?: string;
  error?: any;
}

export class Logger {
  private static formatLog(level: 'INFO' | 'WARN' | 'ERROR', payload: LogPayload): string {
    const time = payload.timestamp || new Date().toISOString();
    const ep = payload.endpoint ? `[${payload.endpoint}]` : '';
    const user = payload.userId ? `(User: ${payload.userId})` : '';
    const ip = payload.ipAddress ? `(IP: ${payload.ipAddress})` : '';
    return `[${time}] [${level}] ${ep} ${user} ${ip} ${payload.action || ''} - ${payload.message || ''}`;
  }

  static info(payload: LogPayload) {
    console.log(this.formatLog('INFO', payload));
  }

  static warn(payload: LogPayload) {
    console.warn(this.formatLog('WARN', payload));
  }

  static error(payload: LogPayload) {
    console.error(this.formatLog('ERROR', payload));
    if (payload.error && payload.error.stack) {
      console.error(`[STACK TRACE]`, payload.error.stack);
    }
  }

  /**
   * Sanitizes exceptions to return generic user-friendly messages.
   */
  static getSanitizedErrorMessage(error: any, fallbackMessage = 'Unable to process your request. Please try again.'): string {
    // In production or API responses, never return raw stack trace or database error message
    if (process.env.NODE_ENV === 'development' && error?.isDevelopmentExposed) {
      return error?.message || fallbackMessage;
    }
    return fallbackMessage;
  }
}
