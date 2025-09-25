import { validate } from 'class-validator';
import { VerifyEmailDto } from './verify-email.dto';

describe('VerifyEmailDto', () => {
  it('should validate successfully with valid token', async () => {
    // Arrange
    const dto = new VerifyEmailDto();
    dto.token = 'valid.jwt.token';

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors).toHaveLength(0);
  });

  it('should fail validation when token is empty', async () => {
    // Arrange
    const dto = new VerifyEmailDto();
    dto.token = '';

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('token');
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('should fail validation when token is null', async () => {
    // Arrange
    const dto = new VerifyEmailDto();
    dto.token = null as any;

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('token');
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('should fail validation when token is undefined', async () => {
    // Arrange
    const dto = new VerifyEmailDto();
    // token is undefined by default

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('token');
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('should fail validation when token is not a string', async () => {
    // Arrange
    const dto = new VerifyEmailDto();
    dto.token = 123 as any;

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('token');
    expect(errors[0].constraints).toHaveProperty('isString');
  });

  it('should fail validation when token is an object', async () => {
    // Arrange
    const dto = new VerifyEmailDto();
    dto.token = { invalid: 'token' } as any;

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('token');
    expect(errors[0].constraints).toHaveProperty('isString');
  });

  it('should validate successfully with JWT-like token format', async () => {
    // Arrange
    const dto = new VerifyEmailDto();
    dto.token =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors).toHaveLength(0);
  });

  it('should fail validation with whitespace-only token', async () => {
    // Arrange
    const dto = new VerifyEmailDto();
    dto.token = '   ';

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('token');
    expect(errors[0].constraints).toHaveProperty('matches');
    expect(errors[0].constraints.matches).toBe(
      'Token cannot be empty or contain only whitespace',
    );
  });
});
