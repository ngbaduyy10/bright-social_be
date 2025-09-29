import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { EmailVerificationService } from './email-verification.service';

describe('EmailVerificationService', () => {
  let service: EmailVerificationService;
  let jwtService: JwtService;

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailVerificationService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<EmailVerificationService>(EmailVerificationService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateVerificationToken', () => {
    it('should generate a verification token with correct payload', () => {
      // Arrange
      const email = 'test@example.com';
      const userId = '123';
      const expectedToken = 'jwt-token';

      mockJwtService.sign.mockReturnValue(expectedToken);

      // Act
      const result = service.generateVerificationToken(email, userId);

      // Assert
      expect(jwtService.sign).toHaveBeenCalledWith(
        {
          email,
          userId,
          type: 'email_verification',
          timestamp: expect.any(Number),
        },
        { expiresIn: '24h' },
      );
      expect(result).toBe(expectedToken);
    });

    it('should generate tokens with different timestamps', () => {
      // Arrange
      const email = 'test@example.com';
      const userId = '123';
      mockJwtService.sign.mockReturnValue('token');

      // Act
      service.generateVerificationToken(email, userId);
      const firstCall = mockJwtService.sign.mock.calls[0][0];

      // Wait a bit and generate another token
      jest.advanceTimersByTime(1);
      service.generateVerificationToken(email, userId);
      const secondCall = mockJwtService.sign.mock.calls[1][0];

      // Assert
      expect(firstCall.timestamp).toBeDefined();
      expect(secondCall.timestamp).toBeDefined();
    });
  });

  describe('verifyToken', () => {
    const validToken = 'valid-token';
    const validDecoded = {
      email: 'test@example.com',
      userId: '123',
      type: 'email_verification',
      timestamp: Date.now(),
    };

    describe('successful verification', () => {
      it('should verify a valid token and return decoded data', () => {
        // Arrange
        mockJwtService.verify.mockReturnValue(validDecoded);

        // Act
        const result = service.verifyToken(validToken);

        // Assert
        expect(jwtService.verify).toHaveBeenCalledWith(validToken);
        expect(result).toEqual({
          email: validDecoded.email,
          userId: validDecoded.userId,
        });
      });
    });

    describe('input validation errors', () => {
      it('should throw error for null token', () => {
        // Act & Assert
        expect(() => service.verifyToken(null as any)).toThrow(
          'Token must be a string',
        );
        expect(mockJwtService.verify).not.toHaveBeenCalled();
      });

      it('should throw error for undefined token', () => {
        // Act & Assert
        expect(() => service.verifyToken(undefined as any)).toThrow(
          'Token must be a string',
        );
        expect(mockJwtService.verify).not.toHaveBeenCalled();
      });

      it('should throw error for empty string token', () => {
        // Act & Assert
        expect(() => service.verifyToken('')).toThrow('Token is required');
        expect(mockJwtService.verify).not.toHaveBeenCalled();
      });

      it('should throw error for whitespace-only token', () => {
        // Act & Assert
        expect(() => service.verifyToken('   ')).toThrow('Token is required');
        expect(mockJwtService.verify).not.toHaveBeenCalled();
      });

      it('should throw error for non-string token', () => {
        // Act & Assert
        expect(() => service.verifyToken(123 as any)).toThrow(
          'Token must be a string',
        );
        expect(mockJwtService.verify).not.toHaveBeenCalled();
      });
    });

    describe('JWT service errors', () => {
      it('should throw TokenExpiredError for expired tokens', () => {
        // Arrange
        const expiredError = new Error('jwt expired');
        expiredError.name = 'TokenExpiredError';
        mockJwtService.verify.mockImplementation(() => {
          throw expiredError;
        });

        // Act & Assert
        expect(() => service.verifyToken(validToken)).toThrow(expiredError);
        expect(jwtService.verify).toHaveBeenCalledWith(validToken);
      });

      it('should throw JsonWebTokenError for invalid token format', () => {
        // Arrange
        const jwtError = new Error('invalid token');
        jwtError.name = 'JsonWebTokenError';
        mockJwtService.verify.mockImplementation(() => {
          throw jwtError;
        });

        // Act & Assert
        expect(() => service.verifyToken(validToken)).toThrow(jwtError);
        expect(jwtService.verify).toHaveBeenCalledWith(validToken);
      });

      it('should throw NotBeforeError for tokens not yet active', () => {
        // Arrange
        const notBeforeError = new Error('jwt not active');
        notBeforeError.name = 'NotBeforeError';
        mockJwtService.verify.mockImplementation(() => {
          throw notBeforeError;
        });

        // Act & Assert
        expect(() => service.verifyToken(validToken)).toThrow(notBeforeError);
        expect(jwtService.verify).toHaveBeenCalledWith(validToken);
      });

      it('should throw generic errors from JWT service', () => {
        // Arrange
        const genericError = new Error('Some JWT error');
        mockJwtService.verify.mockImplementation(() => {
          throw genericError;
        });

        // Act & Assert
        expect(() => service.verifyToken(validToken)).toThrow(genericError);
        expect(jwtService.verify).toHaveBeenCalledWith(validToken);
      });
    });

    describe('payload validation errors', () => {
      it('should throw error for null decoded payload', () => {
        // Arrange
        mockJwtService.verify.mockReturnValue(null);

        // Act & Assert
        expect(() => service.verifyToken(validToken)).toThrow(
          'Invalid token structure',
        );
      });

      it('should throw error for undefined decoded payload', () => {
        // Arrange
        mockJwtService.verify.mockReturnValue(undefined);

        // Act & Assert
        expect(() => service.verifyToken(validToken)).toThrow(
          'Invalid token structure',
        );
      });

      it('should throw error for non-object decoded payload', () => {
        // Arrange
        mockJwtService.verify.mockReturnValue('not-an-object');

        // Act & Assert
        expect(() => service.verifyToken(validToken)).toThrow(
          'Invalid token structure',
        );
      });

      it('should throw error for primitive decoded payload', () => {
        // Arrange
        mockJwtService.verify.mockReturnValue(123);

        // Act & Assert
        expect(() => service.verifyToken(validToken)).toThrow(
          'Invalid token structure',
        );
      });
    });

    describe('token type validation errors', () => {
      it('should throw error for wrong token type', () => {
        // Arrange
        const wrongTypeDecoded = {
          ...validDecoded,
          type: 'login_token',
        };
        mockJwtService.verify.mockReturnValue(wrongTypeDecoded);

        // Act & Assert
        expect(() => service.verifyToken(validToken)).toThrow(
          'Invalid token type',
        );
      });

      it('should throw error for missing token type', () => {
        // Arrange
        const { type, ...decodedWithoutType } = validDecoded;
        mockJwtService.verify.mockReturnValue(decodedWithoutType);

        // Act & Assert
        expect(() => service.verifyToken(validToken)).toThrow(
          'Invalid token type',
        );
      });

      it('should throw error for null token type', () => {
        // Arrange
        const nullTypeDecoded = {
          ...validDecoded,
          type: null,
        };
        mockJwtService.verify.mockReturnValue(nullTypeDecoded);

        // Act & Assert
        expect(() => service.verifyToken(validToken)).toThrow(
          'Invalid token type',
        );
      });
    });

    describe('required fields validation errors', () => {
      it('should throw error for missing email', () => {
        // Arrange
        const { email, ...decodedWithoutEmail } = validDecoded;
        mockJwtService.verify.mockReturnValue(decodedWithoutEmail);

        // Act & Assert
        expect(() => service.verifyToken(validToken)).toThrow(
          'Token missing or invalid required fields',
        );
      });

      it('should throw error for missing userId', () => {
        // Arrange
        const { userId, ...decodedWithoutUserId } = validDecoded;
        mockJwtService.verify.mockReturnValue(decodedWithoutUserId);

        // Act & Assert
        expect(() => service.verifyToken(validToken)).toThrow(
          'Token missing or invalid required fields',
        );
      });

      it('should throw error for missing both email and userId', () => {
        // Arrange
        const { email, userId, ...decodedWithoutBoth } = validDecoded;
        mockJwtService.verify.mockReturnValue(decodedWithoutBoth);

        // Act & Assert
        expect(() => service.verifyToken(validToken)).toThrow(
          'Token missing or invalid required fields',
        );
      });

      it('should throw error for null email', () => {
        // Arrange
        const nullEmailDecoded = {
          ...validDecoded,
          email: null,
        };
        mockJwtService.verify.mockReturnValue(nullEmailDecoded);

        // Act & Assert
        expect(() => service.verifyToken(validToken)).toThrow(
          'Token missing or invalid required fields',
        );
      });

      it('should throw error for empty string email', () => {
        // Arrange
        const emptyEmailDecoded = {
          ...validDecoded,
          email: '',
        };
        mockJwtService.verify.mockReturnValue(emptyEmailDecoded);

        // Act & Assert
        expect(() => service.verifyToken(validToken)).toThrow(
          'Token missing or invalid required fields',
        );
      });
    });

    describe('field type validation errors', () => {
      it('should throw error for non-string email', () => {
        // Arrange
        const numberEmailDecoded = {
          ...validDecoded,
          email: 123,
        };
        mockJwtService.verify.mockReturnValue(numberEmailDecoded);

        // Act & Assert
        expect(() => service.verifyToken(validToken)).toThrow(
          'Token missing or invalid required fields',
        );
      });

      it('should throw error for non-string userId', () => {
        // Arrange
        const numberUserIdDecoded = {
          ...validDecoded,
          userId: 456,
        };
        mockJwtService.verify.mockReturnValue(numberUserIdDecoded);

        // Act & Assert
        expect(() => service.verifyToken(validToken)).toThrow(
          'Token missing or invalid required fields',
        );
      });

      it('should throw error for object email', () => {
        // Arrange
        const objectEmailDecoded = {
          ...validDecoded,
          email: { value: 'test@example.com' },
        };
        mockJwtService.verify.mockReturnValue(objectEmailDecoded);

        // Act & Assert
        expect(() => service.verifyToken(validToken)).toThrow(
          'Token missing or invalid required fields',
        );
      });

      it('should throw error for array userId', () => {
        // Arrange
        const arrayUserIdDecoded = {
          ...validDecoded,
          userId: ['123'],
        };
        mockJwtService.verify.mockReturnValue(arrayUserIdDecoded);

        // Act & Assert
        expect(() => service.verifyToken(validToken)).toThrow(
          'Token missing or invalid required fields',
        );
      });

      it('should throw error for boolean fields', () => {
        // Arrange
        const booleanFieldsDecoded = {
          ...validDecoded,
          email: true,
          userId: false,
        };
        mockJwtService.verify.mockReturnValue(booleanFieldsDecoded);

        // Act & Assert
        expect(() => service.verifyToken(validToken)).toThrow(
          'Token missing or invalid required fields',
        );
      });
    });

    describe('edge cases', () => {
      it('should handle tokens with extra fields', () => {
        // Arrange
        const decodedWithExtraFields = {
          ...validDecoded,
          extraField: 'should-be-ignored',
          anotherField: 123,
        };
        mockJwtService.verify.mockReturnValue(decodedWithExtraFields);

        // Act
        const result = service.verifyToken(validToken);

        // Assert
        expect(result).toEqual({
          email: validDecoded.email,
          userId: validDecoded.userId,
        });
      });

      it('should handle whitespace in valid string fields', () => {
        // Arrange
        const decodedWithWhitespace = {
          ...validDecoded,
          email: '  test@example.com  ',
          userId: '  123  ',
        };
        mockJwtService.verify.mockReturnValue(decodedWithWhitespace);

        // Act
        const result = service.verifyToken(validToken);

        // Assert
        expect(result).toEqual({
          email: '  test@example.com  ',
          userId: '  123  ',
        });
      });

      it('should handle special characters in fields', () => {
        // Arrange
        const decodedWithSpecialChars = {
          ...validDecoded,
          email: 'test+tag@example-domain.com',
          userId: 'user_123-abc',
        };
        mockJwtService.verify.mockReturnValue(decodedWithSpecialChars);

        // Act
        const result = service.verifyToken(validToken);

        // Assert
        expect(result).toEqual({
          email: 'test+tag@example-domain.com',
          userId: 'user_123-abc',
        });
      });
    });
  });
});
