import { NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME } from '@/lib/custom-auth';

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: '',
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    expires: new Date(0),
  });

  return response;
}
