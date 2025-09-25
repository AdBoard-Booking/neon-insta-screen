import { NextRequest, NextResponse } from 'next/server';
import { createSessionToken, AdminSessionPayload, SESSION_COOKIE_NAME } from '@/lib/custom-auth';

interface GoogleTokenInfo {
  email: string;
  email_verified: string | boolean;
  name?: string;
  picture?: string;
  sub?: string;
  aud?: string;
}

const getAllowedEmails = () =>
  process.env.ADMIN_EMAILS?.split(',')
    .map(email => email.trim().toLowerCase())
    .filter(Boolean);

const isEmailAllowed = (email: string) => {
  const allowedEmails = getAllowedEmails();
  if (!allowedEmails || allowedEmails.length === 0) {
    return true;
  }
  return allowedEmails.includes(email.toLowerCase());
};

const validateGoogleAudience = (aud?: string) => {
  const expectedAudience = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!expectedAudience) {
    return true;
  }
  return aud === expectedAudience;
};

export async function POST(request: NextRequest) {
  try {
    const { credential } = await request.json();

    if (!credential) {
      return NextResponse.json(
        { error: 'Missing Google credential' },
        { status: 400 },
      );
    }

    const googleResponse = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`,
    );

    if (!googleResponse.ok) {
      return NextResponse.json(
        { error: 'Invalid Google credential' },
        { status: 401 },
      );
    }

    const tokenInfo = (await googleResponse.json()) as GoogleTokenInfo;

    if (!tokenInfo.email || tokenInfo.email_verified !== 'true' && tokenInfo.email_verified !== true) {
      return NextResponse.json(
        { error: 'Google account email is not verified' },
        { status: 401 },
      );
    }

    if (!validateGoogleAudience(tokenInfo.aud)) {
      return NextResponse.json(
        { error: 'Google credential is not issued for this application' },
        { status: 401 },
      );
    }

    if (!isEmailAllowed(tokenInfo.email)) {
      return NextResponse.json(
        { error: 'Email address is not authorized for admin access' },
        { status: 403 },
      );
    }

    const sessionPayload: AdminSessionPayload = {
      email: tokenInfo.email,
      name: tokenInfo.name,
      picture: tokenInfo.picture,
      sub: tokenInfo.sub,
    };

    const { token, expiresAt } = createSessionToken(sessionPayload);

    const response = NextResponse.json({
      success: true,
      session: sessionPayload,
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(expiresAt),
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Failed to verify Google credential', error);
    return NextResponse.json(
      { error: 'Failed to sign in with Google' },
      { status: 500 },
    );
  }
}
