import { NextRequest, NextResponse } from 'next/server';
import { getAllSubmissions, updateSubmissionStatus, getSubmissionStats } from '@/lib/airtable';
import { createFramedImage } from '@/lib/imagekit';
import { sendApprovalMessage, sendRejectionMessage } from '@/lib/whatsapp';

export async function GET() {
  try {
    const submissions = await getAllSubmissions();
    const stats = await getSubmissionStats();
    
    return NextResponse.json({
      submissions,
      stats,
    });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, status } = await request.json();
    
    if (!id || !status) {
      return NextResponse.json(
        { error: 'ID and status are required' },
        { status: 400 }
      );
    }

    let framedImageUrl: string | undefined;

    if (status === 'approved') {
      // Get the submission to create framed image
      const submissions = await getAllSubmissions();
      const submission = submissions.find(s => s.id === id);
      
      if (submission) {
        framedImageUrl = await createFramedImage(
          submission.imageUrl,
          submission.name,
          submission.instagramHandle
        );
      }
    }

    // Update status in Airtable
    await updateSubmissionStatus(id, status, framedImageUrl);

    // Send notification if phone number exists
    const submissions = await getAllSubmissions();
    const submission = submissions.find(s => s.id === id);
    
    if (submission?.phoneNumber) {
      if (status === 'approved' && framedImageUrl) {
        await sendApprovalMessage(submission.phoneNumber, submission.name, framedImageUrl);
      } else if (status === 'rejected') {
        await sendRejectionMessage(submission.phoneNumber, submission.name);
      }
    }

    // TODO: Emit real-time event for billboard update
    // This would be handled by Socket.io in a real implementation

    return NextResponse.json({
      success: true,
      message: `Submission ${status} successfully`,
      framedImageUrl,
    });
  } catch (error) {
    console.error('Error updating submission:', error);
    return NextResponse.json(
      { error: 'Failed to update submission' },
      { status: 500 }
    );
  }
}