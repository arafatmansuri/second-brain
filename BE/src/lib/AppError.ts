// src/lib/AppError.ts
export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'PAYMENT_FAILED'
  | 'OTP_EXPIRED'
  | 'OTP_INVALID'
  | 'OTP_MAX_ATTEMPTS'
  | 'TOKEN_EXPIRED'
  | 'TOKEN_INVALID'
  | 'INTERNAL_ERROR';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode;
  public isOperational: boolean;
  public readonly meta?: Record<string, unknown> | undefined;

  constructor(
    message: string,
    statusCode: number,
    code: ErrorCode,
    meta?: Record<string, unknown>,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    this.meta = meta;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, meta?: Record<string, unknown>) {
    return new AppError(message, 400, 'VALIDATION_ERROR', meta);
  }

  static unauthorized(message = 'Unauthorized') {
    return new AppError(message, 401, 'UNAUTHORIZED');
  }

  static forbidden(message = 'Forbidden') {
    return new AppError(message, 403, 'FORBIDDEN');
  }

  static notFound(resource: string) {
    return new AppError(`${resource} not found`, 404, 'NOT_FOUND');
  }

  static conflict(message: string) {
    return new AppError(message, 409, 'CONFLICT');
  }

  static otpExpired() {
    return new AppError('OTP has expired', 410, 'OTP_EXPIRED');
  }

  static otpInvalid() {
    return new AppError('Invalid OTP', 400, 'OTP_INVALID');
  }

  static rateLimited(message = 'Too many requests') {
    return new AppError(message, 429, 'RATE_LIMITED');
  }

  static internal(message = 'Internal server error') {
    const err = new AppError(message, 500, 'INTERNAL_ERROR');
    err.isOperational = false; // Triggers process restart alert
    return err;
  }
}