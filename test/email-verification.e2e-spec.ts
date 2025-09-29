import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@/app.module';
import { UserService } from '@/modules/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from '@/modules/email/email.service';

describe('Email Verification (e2e)', () => {
  let app: INestApplication;
  let userService: UserService;
  let jwtService: JwtService;
  let emailService: EmailService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(EmailService)
      .useValue({
        sendVerificationEmail: jest.fn(),
        sendWelcomeEmail: jest.fn(),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    userService = moduleFixture.get<UserService>(UserService);
    jwtService = moduleFixture.get<JwtService>(JwtService);
    emailService = moduleFixture.get<EmailService>(EmailService);

    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/auth/register (POST)', () => {
    it('should register user and trigger verification email', async () => {
      const registerData = {
        email: 'test@example.com',
        password: 'password123',
        first_name: 'John',
        last_name: 'Doe',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerData)
        .expect(201);

      expect(response.body).toEqual({
        message:
          'Registration successful! Please check your email to verify your account.',
        email: 'test@example.com',
      });

      // Verify email service was called
      expect(emailService.sendVerificationEmail).toHaveBeenCalledTimes(1);
      expect(emailService.sendVerificationEmail).toHaveBeenCalledWith(
        'test@example.com',
        expect.any(String), // JWT token
        'John',
      );
    });
  });

  describe('/auth/verify-email (POST)', () => {
    it('should verify email with valid token', async () => {
      // First register a user
      const registerData = {
        email: 'verify@example.com',
        password: 'password123',
        first_name: 'Jane',
        last_name: 'Smith',
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerData);

      // Get the user from database
      const user = await userService.getUserByEmail('verify@example.com');

      // Create a verification token
      const verificationToken = jwtService.sign(
        {
          email: user.email,
          userId: user.id,
          type: 'email_verification',
        },
        { expiresIn: '24h' },
      );

      // Verify email
      const response = await request(app.getHttpServer())
        .post('/auth/verify-email')
        .send({ token: verificationToken })
        .expect(201);

      expect(response.body).toEqual({
        message: 'Email verified successfully! Welcome to Bright Social.',
        user: {
          id: user.id,
          email: 'verify@example.com',
          first_name: 'Jane',
          last_name: 'Smith',
          is_verified: true,
        },
      });

      // Verify welcome email was sent
      expect(emailService.sendWelcomeEmail).toHaveBeenCalledTimes(1);
      expect(emailService.sendWelcomeEmail).toHaveBeenCalledWith(
        'verify@example.com',
        'Jane',
      );
    });

    it('should reject invalid token', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/verify-email')
        .send({ token: 'invalid-token' })
        .expect(400);

      expect(response.body.message).toBe('Invalid verification token');
    });

    it('should reject expired token', async () => {
      // Create an expired token
      const expiredToken = jwtService.sign(
        {
          email: 'test@example.com',
          userId: '123',
          type: 'email_verification',
        },
        { expiresIn: '0s' },
      ); // Expired immediately

      // Wait a moment to ensure expiration
      await new Promise((resolve) => setTimeout(resolve, 100));

      const response = await request(app.getHttpServer())
        .post('/auth/verify-email')
        .send({ token: expiredToken })
        .expect(400);

      expect(response.body.message).toBe('Verification token has expired');
    });

    it('should reject token with wrong type', async () => {
      const wrongTypeToken = jwtService.sign(
        {
          email: 'test@example.com',
          userId: '123',
          type: 'login_token', // Wrong type
        },
        { expiresIn: '24h' },
      );

      const response = await request(app.getHttpServer())
        .post('/auth/verify-email')
        .send({ token: wrongTypeToken })
        .expect(400);

      expect(response.body.message).toBe('Invalid verification token');
    });
  });

  describe('/auth/resend-verification (POST)', () => {
    it('should resend verification email for existing unverified user', async () => {
      // First register a user
      const registerData = {
        email: 'resend@example.com',
        password: 'password123',
        first_name: 'Bob',
        last_name: 'Wilson',
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerData);

      // Clear the mock to count only resend calls
      jest.clearAllMocks();

      // Resend verification email
      const response = await request(app.getHttpServer())
        .post('/auth/resend-verification')
        .send({ email: 'resend@example.com' })
        .expect(201);

      expect(response.body).toEqual({
        message: 'Verification email sent successfully!',
      });

      // Verify email service was called for resend
      expect(emailService.sendVerificationEmail).toHaveBeenCalledTimes(1);
      expect(emailService.sendVerificationEmail).toHaveBeenCalledWith(
        'resend@example.com',
        expect.any(String), // JWT token
        'Bob',
      );
    });

    it('should reject resend for non-existent user', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/resend-verification')
        .send({ email: 'nonexistent@example.com' })
        .expect(400);

      expect(response.body.message).toBe('User not found');
    });
  });

  describe('Email Verification Flow Validation', () => {
    it('should validate required token field', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/verify-email')
        .send({}) // Missing token
        .expect(400);

      expect(response.body.message).toContain('token');
    });

    it('should validate token is string', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/verify-email')
        .send({ token: 123 }) // Number instead of string
        .expect(400);

      expect(response.body.message).toContain('token');
    });

    it('should validate non-empty token', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/verify-email')
        .send({ token: '' }) // Empty string
        .expect(400);

      expect(response.body.message).toContain('token');
    });
  });
});
