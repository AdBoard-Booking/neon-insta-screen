import { NextRequest, NextResponse } from 'next/server';
import { verifyWhatsAppWebhook } from '@/lib/whatsapp';
import { createSubmission } from '@/lib/airtable';
import { uploadImage } from '@/lib/imagekit';
import { emitNewUpload } from '@/lib/socket-io';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const verificationResult = verifyWhatsAppWebhook(mode!, token!, challenge!);
  
  if (verificationResult) {
    return new NextResponse(verificationResult);
  }
  
  return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Handle WhatsApp webhook events
    if (body.object === 'whatsapp_business_account') {
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      
      if (changes?.field === 'messages') {
        const messages = changes.value?.messages || [];
        
        for (const message of messages) {
          if (message.type === 'image') {
            await handleImageMessage(message);
          }
        }
      }
    }
    
    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('WhatsApp webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function handleImageMessage(message: Record<string, any>) {
  try {
    // Get the image URL from WhatsApp
    const imageUrl = message.image?.id;
    if (!imageUrl) return;

    // For demo purposes, we'll use a placeholder name
    // In production, you'd get this from the user's WhatsApp profile
    const phoneNumber = message.from;
    const name = `User ${phoneNumber.slice(-4)}`; // Use last 4 digits as identifier

    // Download and process the image
    const response = await fetch(`https://graph.facebook.com/v18.0/${imageUrl}`, {
      headers: {
        'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
      },
    });
    
    const imageBuffer = Buffer.from(await response.arrayBuffer());
    
    // Upload to ImageKit
    const uploadResult = await uploadImage(imageBuffer, `whatsapp-${Date.now()}.jpg`);
    const imagekitImageUrl = uploadResult.url;

    // Create submission
    await createSubmission({
      name,
      imageUrl: imagekitImageUrl,
      status: 'pending',
      source: 'whatsapp',
      phoneNumber,
    });

    // Emit real-time event for FOMO banner
    emitNewUpload(name);

    // Send confirmation message
    await sendWhatsAppMessage(phoneNumber, `Thanks ${name}! Your selfie has been received and is being reviewed. We'll notify you once it's approved!`);

  } catch (error) {
    console.error('Error handling image message:', error);
  }
}

async function sendWhatsAppMessage(phoneNumber: string, message: string) {
  // This would use the WhatsApp API to send a message
  // Implementation depends on your WhatsApp Business API setup
  console.log(`Sending to ${phoneNumber}: ${message}`);
}