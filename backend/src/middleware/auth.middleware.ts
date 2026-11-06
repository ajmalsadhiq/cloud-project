import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { ApiError } from '../utils/apiResponse.js';
import { User } from '../models/User.model.js';
import { AuthUserPayload } from '../types/index.js';

interface JwtCustomPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export const authenticateJwt = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Authentication token is missing. Please log in.');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw ApiError.unauthorized('Authentication token format invalid.');
    }

    let decoded: JwtCustomPayload;
    try {
      decoded = jwt.verify(token, config.jwtSecret) as JwtCustomPayload;
    } catch (err: unknown) {
      const error = err as Error;
      if (error.name === 'TokenExpiredError') {
        throw ApiError.unauthorized('Session expired. Please log in again.');
      }
      throw ApiError.unauthorized('Invalid authentication token.');
    }

    // Verify user exists in the database
    const user = await User.findById(decoded.userId).select('id name email');
    if (!user) {
      throw ApiError.unauthorized('User associated with this token no longer exists.');
    }

    const userPayload: AuthUserPayload = {
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
    };

    req.user = userPayload;
    next();
  } catch (error) {
    next(error);
  }
};
