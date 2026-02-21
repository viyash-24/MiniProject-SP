import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { AppError, isAppError } from '../utils/AppError.js';

export function notFound(req, _res, next) {
  next(new AppError(404, `Route not found: ${req.originalUrl}`, 'NOT_FOUND'));
}

function normalizeError(err) {
  if (!err) return new AppError(500, 'Server error', 'INTERNAL_ERROR');
  if (isAppError(err)) return err;

  // Invalid JSON body (express.json)
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return new AppError(400, 'Invalid JSON body', 'INVALID_JSON');
  }

  // Multer
  if (err.name === 'MulterError') {
    return new AppError(400, err.message || 'Invalid upload', 'UPLOAD_ERROR');
  }

  // JWT
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return new AppError(401, 'Unauthorized', 'UNAUTHORIZED');
  }

  // Mongoose
  if (err instanceof mongoose.Error.CastError) {
    return new AppError(400, `Invalid ${err.path}`, 'INVALID_ID', { path: err.path, value: err.value });
  }
  if (err instanceof mongoose.Error.ValidationError) {
    const details = Object.values(err.errors || {}).map((e) => ({
      path: e.path,
      message: e.message,
      kind: e.kind,
    }));
    return new AppError(400, 'Validation failed', 'VALIDATION_ERROR', details);
  }

  // Duplicate key (Mongo)
  if (err.code === 11000) {
    return new AppError(409, 'Duplicate key', 'DUPLICATE_KEY', err.keyValue || err.keyPattern);
  }

  return new AppError(err.statusCode || err.status || 500, err.message || 'Server error', 'INTERNAL_ERROR');
}

export function errorHandler(err, _req, res, _next) {
  const normalized = normalizeError(err);
  const statusCode = normalized.statusCode || 500;
  const isProd = env.NODE_ENV === 'production';

  // Avoid leaking internal details in prod 5xx
  const message = isProd && statusCode >= 500 ? 'Server error' : (normalized.message || 'Server error');

  if (!isProd) {
    // Keep stack traces in dev for debugging
    // eslint-disable-next-line no-console
    console.error(err);
  }

  const payload = {
    success: false,
    error: message,
    code: normalized.code || 'ERROR',
  };

  if (normalized.details !== undefined) payload.details = normalized.details;
  if (!isProd) payload.stack = err?.stack;

  res.status(statusCode).json(payload);
}
