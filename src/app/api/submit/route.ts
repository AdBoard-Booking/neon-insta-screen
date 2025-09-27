import { NextRequest, NextResponse } from 'next/server';
import { createSubmission, updateSubmissionAuth } from '@/lib/airtable';
import { uploadImage } from '@/lib/imagekit';
import { emitNewUpload } from '@/lib/socket-io';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const instagramHandle = formData.get('instagramHandle') as string;
    const whatsappContact = formData.get('whatsappContact') as string;
    const image = formData.get('image') as File;
    const source = formData.get('source') as 'whatsapp' | 'web';
    const isAuthenticated = formData.get('isAuthenticated') === 'true';
    const acceptTerms = formData.get('acceptTerms') === 'true';

    if (!name || !image) {
      return NextResponse.json({ error: 'Name and image are required' }, { status: 400 });
    }

    if (isAuthenticated && !acceptTerms) {
      return NextResponse.json({ error: 'You must accept the terms and conditions' }, { status: 400 });
    }

    // Convert image to buffer
    const imageBuffer = Buffer.from(await image.arrayBuffer());

    // Upload to ImageKit
    const uploadResult = await uploadImage(imageBuffer, image.name);
    const imageUrl = uploadResult.url;

    // Create submission in Airtable
    const submission = await createSubmission({
      name,
      instagramHandle: instagramHandle || undefined,
      whatsappContact: whatsappContact || undefined,
      imageUrl,
      status: 'pending',
      source,
      phoneNumber: whatsappContact || undefined,
    });

    // If authenticated, update the submission to mark it as authenticated
    if (isAuthenticated && whatsappContact) {
      await updateSubmissionAuth(submission.id, whatsappContact);
    }

    // Emit real-time event for FOMO banner
    emitNewUpload(name);

    // Call n8n webhook
    try {
      await fetch('https://n8n.adboardbooking.com/webhook/47d14463-9196-464d-adcc-935d413e4382', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          submissionId: submission.id,
          name,
          instagramHandle: instagramHandle || undefined,
          whatsappContact: whatsappContact || undefined,
          imageUrl,
          source,
          phoneNumber: whatsappContact || undefined,
          status: 'pending',
          createdAt: submission.createdAt,
        }),
      });
    } catch (webhookError) {
      console.error('Webhook error:', webhookError);
      // Don't fail the submission if webhook fails
    }

    return NextResponse.json({
      success: true,
      submission,
      message: isAuthenticated 
        ? 'Authentication confirmed successfully! Your submission is now complete.'
        : 'Submission received! Your selfie is being reviewed.',
    });
  } catch (error) {
    console.error('Submission error:', error);
    return NextResponse.json(
      { error: 'Failed to process submission' },
      { status: 500 }
    );
  }
}