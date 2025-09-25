import crypto from 'crypto';

export interface AdminSessionPayload {
  email: string;
  name?: string;
  picture?: string;
  sub?: string;
}

interface InternalSessionPayload extends AdminSessionPayload {
  exp: number;
  iat: number;
}

export const SESSION_COOKIE_NAME = 'admin_session';
const SESSION_DURATION_MS = 1000 * 60 * 60 * 12; // 12 hours

const base64UrlEncode = (input: string | Buffer) => {
  const buffer = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/u, '');
};

const base64UrlDecode = (input: string) => {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const padLength = normalized.length % 4;
  const padded = padLength ? normalized + '='.repeat(4 - padLength) : normalized;
  return Buffer.from(padded, 'base64').toString('utf-8');
};

const base64UrlToBuffer = (input: string) => {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const padLength = normalized.length % 4;
  const padded = padLength ? normalized + '='.repeat(4 - padLength) : normalized;
  return Buffer.from(padded, 'base64');
};

const getSessionSecret = () => {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error('ADMIN_SESSION_SECRET environment variable is required');
  }
  return secret;
};

export const createSessionToken = (session: AdminSessionPayload) => {
  const now = Date.now();
  const payload: InternalSessionPayload = {
    ...session,
    iat: now,
    exp: now + SESSION_DURATION_MS,
  };

  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const digest = crypto.createHmac('sha256', getSessionSecret()).update(encodedPayload).digest();
  const signature = base64UrlEncode(digest);

  return {
    token: `${encodedPayload}.${signature}`,
    expiresAt: payload.exp,
  };
};

export const verifySessionToken = (token?: string | null): AdminSessionPayload | null => {
  if (!token) {
    return null;
  }

  try {
    const [encodedPayload, signature] = token.split('.');
    if (!encodedPayload || !signature) {
      return null;
    }

    const expectedSignatureBuffer = crypto
      .createHmac('sha256', getSessionSecret())
      .update(encodedPayload)
      .digest();
    const providedSignatureBuffer = base64UrlToBuffer(signature);

    if (
      expectedSignatureBuffer.length !== providedSignatureBuffer.length ||
      !crypto.timingSafeEqual(expectedSignatureBuffer, providedSignatureBuffer)
    ) {
      return null;
    }

    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as InternalSessionPayload;

    if (!payload.exp || payload.exp < Date.now()) {
      return null;
    }

    if (!payload.email) {
      return null;
    }

    const { email, name, picture, sub } = payload;

    return { email, name, picture, sub };
  } catch (error) {
    console.error('Failed to verify admin session token', error);
    return null;
  }
};
