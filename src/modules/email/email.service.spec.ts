import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';
import * as nodemailer from 'nodemailer';

describe('EmailService', () => {
  let service: EmailService;

  const mockTransporter = {
    sendMail: jest.fn(),
  } as unknown as nodemailer.Transporter;

  beforeEach(async () => {
    process.env.EMAIL_USER =
      process.env.EMAIL_USER || 'noreply@brightsocial.test';
    process.env.EMAIL_PASSWORD = process.env.EMAIL_PASSWORD || 'password';
    process.env.FRONTEND_URL =
      process.env.FRONTEND_URL || 'http://localhost:3000';

    jest.spyOn(nodemailer, 'createTransport').mockReturnValue(mockTransporter);

    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailService],
    }).compile();

    service = module.get<EmailService>(EmailService);

    jest.clearAllMocks();
  });

  afterEach(() => jest.restoreAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendVerificationEmail', () => {
    it('sends verification email with correct fields and verification URL', async () => {
      // Arrange
      const email = 'test@example.com';
      const token = 'verification-token';
      const userName = 'John Doe';

      process.env.EMAIL_USER = 'noreply@brightsocial.com';
      process.env.FRONTEND_URL = 'http://localhost:3000';

      mockTransporter.sendMail = jest
        .fn()
        .mockResolvedValue({ messageId: 'msg-1' });

      // Act
      await service.sendVerificationEmail(email, token, userName);

      // Assert
      expect(mockTransporter.sendMail).toHaveBeenCalledTimes(1);
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          from: '"Bright Social" <noreply@brightsocial.com>',
          to: email,
          subject: '🎉 Welcome to Bright Social - Verify Your Email',
          html: expect.any(String),
        }),
      );

      const sentOptions = (mockTransporter.sendMail as jest.Mock).mock
        .calls[0][0];
      expect(sentOptions.html).toContain(userName);
      expect(sentOptions.html).toContain(
        `http://localhost:3000/verify-email?token=${token}`,
      );
    });

    it('throws when transporter.sendMail rejects', async () => {
      // Arrange
      const email = 'test@example.com';
      const token = 'verification-token';
      const userName = 'John Doe';

      mockTransporter.sendMail = jest
        .fn()
        .mockRejectedValue(new Error('SMTP down'));

      // Act & Assert
      await expect(
        service.sendVerificationEmail(email, token, userName),
      ).rejects.toThrow('Failed to send verification email');
    });
  });

  describe('sendWelcomeEmail', () => {
    it('sends welcome email with expected content', async () => {
      // Arrange
      const email = 'test@example.com';
      const userName = 'John Doe';

      process.env.EMAIL_USER = 'noreply@brightsocial.com';
      process.env.FRONTEND_URL = 'http://localhost:3000';

      mockTransporter.sendMail = jest
        .fn()
        .mockResolvedValue({ messageId: 'welcome-1' });

      // Act
      await service.sendWelcomeEmail(email, userName);

      // Assert
      expect(mockTransporter.sendMail).toHaveBeenCalledTimes(1);
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          from: '"Bright Social" <noreply@brightsocial.com>',
          to: email,
          subject: '🎊 Welcome to Bright Social!',
          html: expect.any(String),
        }),
      );

      const sentOptions = (mockTransporter.sendMail as jest.Mock).mock
        .calls[0][0];
      expect(sentOptions.html).toContain('Welcome to Bright Social');
      expect(sentOptions.html).toContain(userName);
      expect(sentOptions.html).toContain('Start Exploring');
    });

    it("doesn't throw when sendMail fails (welcome email is logged)", async () => {
      // Arrange
      const email = 'test@example.com';
      const userName = 'John Doe';

      mockTransporter.sendMail = jest
        .fn()
        .mockRejectedValue(new Error('Timeout'));

      // Act & Assert - service should swallow errors for welcome email
      await expect(
        service.sendWelcomeEmail(email, userName),
      ).resolves.not.toThrow();
      expect(mockTransporter.sendMail).toHaveBeenCalledTimes(1);
    });
  });
});
