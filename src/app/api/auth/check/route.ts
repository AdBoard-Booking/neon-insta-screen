import { NextRequest, NextResponse } from 'next/server';
import { isUserAuthorized, getAuthorizedUser } from '@/lib/airtable';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      );
    }

    const isAuthorized = await isUserAuthorized(email);
    
    if (!isAuthorized) {
      return NextResponse.json(
        { authorized: false, error: 'User not authorized' },
        { status: 403 }
      );
    }

    const user = await getAuthorizedUser(email);
    
    return NextResponse.json({
      authorized: true,
      user: user || { email, name: email.split('@')[0], role: 'admin' }
    });

  } catch (error) {
    console.error('Error checking user authorization:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


