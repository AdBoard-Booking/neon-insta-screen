import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/custom-auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = verifySessionToken(token);

    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 },
      );
    }

    return NextResponse.json({
      session,
    });
  } catch (error) {
    console.error('Failed to read admin session', error);
    return NextResponse.json(
      { error: 'Failed to read session' },
      { status: 500 },
    );
  }
}
