/**
 * Auth utility functions for password hashing and comparison.
 */

/**
 * Hash a password using Bun's built-in crypto module.
 * @param password The plain text password to hash
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  return await Bun.password.hash(password);
}

/**
 * Verify a password against its hash.
 * @param password The plain text password to verify
 * @param hash The hash to verify against
 * @returns true if the password matches, false otherwise
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await Bun.password.verify(password, hash);
}
