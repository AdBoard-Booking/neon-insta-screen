import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAllSubmissions, updateSubmissionStatus, getSubmissionStats, deleteSubmission, logAdminAction } from '@/lib/airtable';
import { createFramedImage } from '@/lib/imagekit';
import { sendApprovalMessage, sendRejectionMessage } from '@/lib/whatsapp';
import { emitApprovedPost, emitRejectedPost } from '@/lib/socket-io';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/custom-auth';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = verifySessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

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
  const session = verifySessionToken(request.cookies.get(SESSION_COOKIE_NAME)?.value);

  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  let submissionId: string | undefined;
  let newStatus: 'approved' | 'rejected' | undefined;

  try {
    const { id, status } = await request.json();

    if (!id || !status) {
      return NextResponse.json(
        { error: 'ID and status are required' },
        { status: 400 }
      );
    }

    submissionId = id;
    newStatus = status;

    let framedImageUrl: string | undefined;

    const submissions = await getAllSubmissions();
    const submission = submissions.find(s => s.id === id);

    if (!submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      );
    }

    if (status === 'approved') {
      framedImageUrl = await createFramedImage(
        submission.imageUrl,
        submission.name,
        submission.instagramHandle
      );
    }

    // Update status in Airtable
    await updateSubmissionStatus(id, status, framedImageUrl);

    // Send notification if phone number exists
    if (submission.phoneNumber) {
      if (status === 'approved' && framedImageUrl) {
        await sendApprovalMessage(submission.phoneNumber, submission.name, framedImageUrl);
      } else if (status === 'rejected') {
        await sendRejectionMessage(submission.phoneNumber, submission.name);
      }
    }

    // Emit real-time event for billboard update
    if (status === 'approved') {
      // const approvalTimestamp = new Date().toISOString();
      emitApprovedPost({
        ...submission,
        status,
        framedImageUrl,
        // approvedAt: approvalTimestamp,
      });
    } else if (status === 'rejected') {
      emitRejectedPost(id);
    }

    await logAdminAction({
      action: 'update_submission_status',
      actorEmail: session.email,
      actorName: session.name,
      targetId: id,
      result: 'success',
      details: {
        previousStatus: submission.status,
        newStatus: status,
        framedImageUrl,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Submission ${status} successfully`,
      framedImageUrl,
    });
  } catch (error) {
    console.error('Error updating submission:', error);
    if (submissionId && newStatus) {
      await logAdminAction({
        action: 'update_submission_status',
        actorEmail: session?.email,
        actorName: session?.name,
        targetId: submissionId,
        result: 'error',
        details: { newStatus },
      });
    }
    return NextResponse.json(
      { error: 'Failed to update submission' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const session = verifySessionToken(request.cookies.get(SESSION_COOKIE_NAME)?.value);

  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  let submissionId: string | null = null;
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }

    submissionId = id;

    // Delete submission from Airtable
    await deleteSubmission(id);

    await logAdminAction({
      action: 'delete_submission',
      actorEmail: session.email,
      actorName: session.name,
      targetId: id,
      result: 'success',
    });

    return NextResponse.json({
      success: true,
      message: 'Submission deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting submission:', error);
    if (submissionId) {
      await logAdminAction({
        action: 'delete_submission',
        actorEmail: session?.email,
        actorName: session?.name,
        targetId: submissionId,
        result: 'error',
      });
    }
    return NextResponse.json(
      { error: 'Failed to delete submission' },
      { status: 500 }
    );
  }
}
