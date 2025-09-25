import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class EmailVerificationService {
  constructor(private readonly jwtService: JwtService) {}

  generateVerificationToken(email: string, userId: string): string {
    const payload = {
      email,
      userId,
      type: 'email_verification',
      timestamp: Date.now(),
    };

    // Token expires in 24 hours
    return this.jwtService.sign(payload, { expiresIn: '24h' });
  }

  verifyToken(token: string): { email: string; userId: string } {
    if (typeof token !== 'string') {
      throw new Error('Token must be a string');
    }

    if (!token?.trim()) {
      throw new Error('Token is required');
    }

    const decoded = this.jwtService.verify(token);

    if (!decoded || typeof decoded !== 'object') {
      throw new Error('Invalid token structure');
    }

    if (decoded.type !== 'email_verification') {
      throw new Error('Invalid token type');
    }

    if (
      !decoded.email ||
      !decoded.userId ||
      typeof decoded.email !== 'string' ||
      typeof decoded.userId !== 'string'
    ) {
      throw new Error('Token missing or invalid required fields');
    }

    return {
      email: decoded.email,
      userId: decoded.userId,
    };
  }
}
