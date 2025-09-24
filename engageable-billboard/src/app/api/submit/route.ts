import { NextRequest, NextResponse } from 'next/server';
import { createSubmission } from '@/lib/airtable';
import { uploadImage } from '@/lib/imagekit';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const instagramHandle = formData.get('instagramHandle') as string;
    const image = formData.get('image') as File;
    const source = formData.get('source') as 'whatsapp' | 'web';
    const phoneNumber = formData.get('phoneNumber') as string;

    if (!name || !image) {
      return NextResponse.json({ error: 'Name and image are required' }, { status: 400 });
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
      imageUrl,
      status: 'pending',
      source,
      phoneNumber: phoneNumber || undefined,
    });

    // TODO: Emit real-time event for FOMO banner
    // This would be handled by Socket.io in a real implementation

    return NextResponse.json({
      success: true,
      submission,
      message: 'Submission received! Your selfie is being reviewed.',
    });
  } catch (error) {
    console.error('Submission error:', error);
    return NextResponse.json(
      { error: 'Failed to process submission' },
      { status: 500 }
    );
  }
}