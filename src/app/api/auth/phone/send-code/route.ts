import { NextRequest, NextResponse } from 'next/server';
import { sendOTPMessageWithButton } from '@/lib/whatsapp';
import { 
  generateVerificationCode, 
  storeVerificationCode, 
  cleanupExpiredCodes,
  deleteVerificationCode,
  getCurrentCodes
} from '@/lib/verification-storage';

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, submissionId } = await request.json();

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Clean up expired codes
    cleanupExpiredCodes();

    // Generate verification code
    const code = generateVerificationCode();

    // Store the verification code with submission ID
    storeVerificationCode(phoneNumber, code, submissionId);

    // Send verification code via WhatsApp using template with button
    try {
      await sendOTPMessageWithButton("91"+phoneNumber, code);
    } catch (error) {
      console.error('Failed to send WhatsApp message:', error);
      // Remove the stored code if WhatsApp sending fails
      deleteVerificationCode(phoneNumber);
      return NextResponse.json(
        { error: 'Failed to send verification code. Please check your phone number.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Verification code sent successfully',
    });

  } catch (error) {
    console.error('Error sending verification code:', error);
    return NextResponse.json(
      { error: 'Failed to send verification code' },
      { status: 500 }
    );
  }
}

// Debug endpoint to check current codes (remove in production)
export async function GET() {
  const codes = getCurrentCodes();
  return NextResponse.json({
    codes: Object.fromEntries(codes),
    count: codes.size
  });
}
