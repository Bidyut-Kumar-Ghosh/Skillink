import * as Crypto from "expo-crypto";

/**
 * Hashes a password using SHA-256 algorithm
 * @param {string} password - The plain text password to hash
 * @returns {Promise<string>} The hashed password
 */
export const hashPassword = async (password) => {
  try {
    // Using SHA-256 for password hashing
    // In a production app, you might want to use a more secure algorithm like bcrypt
    // but that would require a native module, so SHA-256 is used for simplicity
    const hashedPassword = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      password
    );
    return hashedPassword;
  } catch (error) {
    console.error("Error hashing password:", error);
    throw error;
  }
};

/**
 * Verifies a password against a stored hash
 * @param {string} password - The plain text password to verify
 * @param {string} storedHash - The stored password hash
 * @returns {Promise<boolean>} True if password matches, false otherwise
 */
export const verifyPassword = async (password, storedHash) => {
  try {
    const hashedPassword = await hashPassword(password);
    return hashedPassword === storedHash;
  } catch (error) {
    console.error("Error verifying password:", error);
    return false;
  }
};
