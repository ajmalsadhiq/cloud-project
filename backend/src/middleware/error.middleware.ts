import { Request, Response, NextFunction } from 'express';
import { ApiError, sendError } from '../utils/apiResponse.js';
import { logger } from '../config/logger.js';

export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  logger.error(`[${req.method}] ${req.url} - Error: ${err.message}`, {
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  if (err instanceof ApiError) {
    sendError(res, err.message, err.statusCode, err.details);
    return;
  }

  // Handle Mongoose duplicate key error
  if ('code' in err && (err as { code: number }).code === 11000) {
    sendError(res, 'A record with that unique key already exists', 409);
    return;
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    sendError(res, 'Database validation failed', 400, err.message);
    return;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    sendError(res, 'Invalid token provided', 401);
    return;
  }

  if (err.name === 'TokenExpiredError') {
    sendError(res, 'Token has expired', 401);
    return;
  }

  // Fallback for unexpected errors
  sendError(
    res,
    process.env.NODE_ENV === 'production'
      ? 'An unexpected internal server error occurred'
      : err.message,
    500
  );
};
