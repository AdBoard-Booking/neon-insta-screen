// Shared in-memory storage for verification codes
// In production, replace this with Redis or a database

interface VerificationData {
  code: string;
  expiresAt: number;
  submissionId?: string;
}

// Global Map to store verification codes across API routes
const verificationCodes = new Map<string, VerificationData>();

export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function storeVerificationCode(
  phoneNumber: string, 
  code: string, 
  submissionId?: string
): void {
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
  verificationCodes.set(phoneNumber, {
    code,
    expiresAt,
    submissionId
  });
}

export function getVerificationCode(phoneNumber: string): VerificationData | undefined {
  return verificationCodes.get(phoneNumber);
}

export function deleteVerificationCode(phoneNumber: string): void {
  verificationCodes.delete(phoneNumber);
}

export function cleanupExpiredCodes(): void {
  const now = Date.now();
  for (const [key, value] of verificationCodes.entries()) {
    if (value.expiresAt < now) {
      verificationCodes.delete(key);
    }
  }
}

// Debug function to check current codes
export function getCurrentCodes(): Map<string, VerificationData> {
  return new Map(verificationCodes);
}
