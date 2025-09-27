import { NextRequest, NextResponse } from 'next/server';
import { getSubmissionById, updateSubmissionAuth } from '@/lib/airtable';

export async function POST(request: NextRequest) {
  try {
    const { id, email, acceptTerms } = await request.json();

    if (!id || !email) {
      return NextResponse.json(
        { error: 'Submission ID and email are required' },
        { status: 400 }
      );
    }

    if (!acceptTerms) {
      return NextResponse.json(
        { error: 'You must accept the terms and conditions' },
        { status: 400 }
      );
    }

    // Check if submission exists
    const submission = await getSubmissionById(id);
    if (!submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      );
    }

    // Update submission with authentication data
    await updateSubmissionAuth(id, email);

    return NextResponse.json({
      success: true,
      message: 'Authentication confirmed successfully! Your submission is now complete.',
    });

  } catch (error) {
    console.error('Error confirming submission:', error);
    return NextResponse.json(
      { error: 'Failed to confirm submission' },
      { status: 500 }
    );
  }
}
