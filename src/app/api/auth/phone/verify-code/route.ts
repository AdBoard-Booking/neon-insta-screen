import { NextRequest, NextResponse } from 'next/server';
import { 
  getVerificationCode, 
  deleteVerificationCode,
  getCurrentCodes 
} from '@/lib/verification-storage';

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, code, submissionId } = await request.json();

    if (!phoneNumber || !code || !submissionId) {
      return NextResponse.json(
        { error: 'Phone number, code, and submission ID are required' },
        { status: 400 }
      );
    }

    // Get stored verification data
    const storedData = getVerificationCode(phoneNumber);

    if (!storedData) {
      console.log('No verification code found for:', phoneNumber);
      console.log('Current codes:', getCurrentCodes());
      return NextResponse.json(
        { error: 'No verification code found for this phone number' },
        { status: 400 }
      );
    }

    // Check if code has expired
    if (Date.now() > storedData.expiresAt) {
      deleteVerificationCode(phoneNumber);
      return NextResponse.json(
        { error: 'Verification code has expired' },
        { status: 400 }
      );
    }

    // Verify the code
    if (storedData.code !== code) {
      console.log('Code mismatch. Expected:', storedData.code, 'Received:', code);
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    // Code is valid, remove it from storage
    deleteVerificationCode(phoneNumber);

    return NextResponse.json({
      success: true,
      message: 'Phone number verified successfully',
    });

  } catch (error) {
    console.error('Error verifying code:', error);
    return NextResponse.json(
      { error: 'Failed to verify code' },
      { status: 500 }
    );
  }
}
