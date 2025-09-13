import { hash, compare } from 'bcrypt';

const salt = 10;

export async function hashPassword(password: string) {
  if (!password) {
    throw new Error('Password is required for hashing');
  }
  return await hash(password, salt);
}

export async function comparePasswords(
  plainPassword: string,
  hashedPassword: string,
): Promise<boolean> {
  if (!plainPassword || !hashedPassword) {
    throw new Error('Both plain and hashed passwords are required for comparison');
  }
  return await compare(plainPassword, hashedPassword);
}
