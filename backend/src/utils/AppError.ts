export class AppError extends Error {
  statusCode: number;
  code: string;

  constructor(message: string, statusCode: number, code: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export function assertFound<T>(value: T | null | undefined, message: string, code: string): T {
  if (!value) {
    throw new AppError(message, 404, code);
  }
  return value;
}
