import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, IUserDocument } from '../models/User.model.js';
import { config } from '../config/env.js';
import { ApiError } from '../utils/apiResponse.js';
import { RegisterInput, LoginInput } from '../validators/auth.validator.js';

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    storageQuota: number;
    storageUsed: number;
    createdAt: Date;
  };
  token: string;
}

export class AuthService {
  /**
   * Register a new user
   */
  static async register(input: RegisterInput): Promise<AuthResponse> {
    const existingUser = await User.findOne({ email: input.email });
    if (existingUser) {
      throw ApiError.conflict('An account with this email address already exists');
    }

    // Hash password with 10 salt rounds
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(input.password, salt);

    // Create user in database
    const newUser = await User.create({
      name: input.name,
      email: input.email,
      passwordHash,
      storageQuota: config.defaultStorageQuota,
      storageUsed: 0,
    });

    const token = this.generateToken(newUser);

    return {
      user: newUser.toJSON() as unknown as AuthResponse['user'],
      token,
    };
  }

  /**
   * Log in an existing user
   */
  static async login(input: LoginInput): Promise<AuthResponse> {
    const user = await User.findOne({ email: input.email }).select('+passwordHash');
    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const isMatch = await user.comparePassword(input.password);
    if (!isMatch) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const token = this.generateToken(user);

    return {
      user: user.toJSON() as unknown as AuthResponse['user'],
      token,
    };
  }

  /**
   * Fetch current authenticated user profile
   */
  static async getMe(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw ApiError.notFound('User account not found');
    }

    return user.toJSON();
  }

  /**
   * Helper to sign JWT
   */
  private static generateToken(user: IUserDocument): string {
    return jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
        name: user.name,
      },
      config.jwtSecret,
      {
        expiresIn: config.jwtExpiresIn,
      } as jwt.SignOptions
    );
  }
}
