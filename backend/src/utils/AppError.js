export class AppError extends Error {
  /**
   * @param {number} statusCode
   * @param {string} message
   * @param {string} [code]
   * @param {any} [details]
   */
  constructor(statusCode, message, code = 'APP_ERROR', details) {
    super(message);
    this.name = 'AppError';
    this.statusCode = Number(statusCode) || 500;
    this.code = code;
    this.details = details;
    this.isOperational = true;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export function isAppError(err) {
  return !!err && (err instanceof AppError || err.name === 'AppError');
}
