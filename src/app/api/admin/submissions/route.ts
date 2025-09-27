import { NextRequest, NextResponse } from 'next/server';
import { getAllSubmissions, updateSubmissionStatus, getSubmissionStats, deleteSubmission, logAdminAction, isUserAuthorized } from '@/lib/airtable';
import { createFramedImage } from '@/lib/imagekit';
import { sendApprovalMessage, sendRejectionMessage } from '@/lib/whatsapp';
import { emitApprovedPost, emitRejectedPost, emitDeletedPost } from '@/lib/socket-io';
import { stackServerApp } from '@/stack/server';

export async function GET() {
  try {
    const user = await stackServerApp.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is authorized to access admin
    const isAuthorized = await isUserAuthorized(user.primaryEmail || '');
    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
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
  const user = await stackServerApp.getUser();

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Check if user is authorized to access admin
  const isAuthorized = await isUserAuthorized(user.primaryEmail || '');
  if (!isAuthorized) {
    return NextResponse.json(
      { error: 'Forbidden' },
      { status: 403 }
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

      // Call n8n webhook for approval
      try {
        await fetch('https://n8n.adboardbooking.com/webhook/47d14463-9196-464d-adcc-935d413e4382', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'approval',
            submissionId: id,
            name: submission.name,
            instagramHandle: submission.instagramHandle || undefined,
            whatsappContact: submission.whatsappContact || undefined,
            imageUrl: submission.imageUrl,
            framedImageUrl: framedImageUrl || undefined,
            source: submission.source,
            phoneNumber: submission.phoneNumber || undefined,
            status: 'approved',
            approvedAt: new Date().toISOString(),
            createdAt: submission.createdAt,
            adminEmail: user.primaryEmail || undefined,
            adminName: user.displayName || undefined,
          }),
        });
      } catch (webhookError) {
        console.error('Approval webhook error:', webhookError);
        // Don't fail the approval if webhook fails
      }
    } else if (status === 'rejected') {
      emitRejectedPost(id);
    }

    await logAdminAction({
      action: 'update_submission_status',
      actorEmail: user.primaryEmail || '',
      actorName: user.displayName || '',
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
        actorEmail: user?.primaryEmail || '',
        actorName: user?.displayName || '',
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
  const user = await stackServerApp.getUser();

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Check if user is authorized to access admin
  const isAuthorized = await isUserAuthorized(user.primaryEmail || '');
  if (!isAuthorized) {
    return NextResponse.json(
      { error: 'Forbidden' },
      { status: 403 }
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

    // Emit real-time event for billboard update
    emitDeletedPost(id);

    await logAdminAction({
      action: 'delete_submission',
      actorEmail: user.primaryEmail || '',
      actorName: user.displayName || '',
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
        actorEmail: user?.primaryEmail || '',
        actorName: user?.displayName || '',
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
