type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

interface RequestContext {
  method: string;
  url: string;
  userAgent?: string;
  ip?: string;
  userId?: string;
  userType?: string;
}

class ApiLogger {
  private formatMessage(level: LogLevel, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [API] [${level}]`;
    
    if (data) {
      return `${prefix} ${message} ${JSON.stringify(data)}`;
    }
    return `${prefix} ${message}`;
  }

  info(message: string, data?: any) {
    console.log(this.formatMessage('INFO', message, data));
  }

  warn(message: string, data?: any) {
    console.warn(this.formatMessage('WARN', message, data));
  }

  error(message: string, error?: any) {
    const errorData = error instanceof Error ? { 
      message: error.message, 
      stack: error.stack 
    } : error;
    console.error(this.formatMessage('ERROR', message, errorData));
  }

  debug(message: string, data?: any) {
    if (process.env.NODE_ENV === 'development') {
      console.debug(this.formatMessage('DEBUG', message, data));
    }
  }

  // Helper method to extract request context
  getRequestContext(request: Request): RequestContext {
    const url = new URL(request.url);
    return {
      method: request.method,
      url: url.pathname,
      userAgent: request.headers.get('user-agent') || undefined,
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
    };
  }

  // Log request start
  logRequest(context: RequestContext, additionalData?: any) {
    this.info('Request started', { ...context, ...additionalData });
  }

  // Log successful response
  logResponse(context: RequestContext, status: number, duration: number, additionalData?: any) {
    this.info('Request completed', { 
      ...context, 
      status, 
      duration: `${duration}ms`,
      ...additionalData 
    });
  }

  // Log error response
  logError(context: RequestContext, status: number, duration: number, error: any) {
    this.error('Request failed', { 
      ...context, 
      status, 
      duration: `${duration}ms`,
      error 
    });
  }
}

export const apiLogger = new ApiLogger();