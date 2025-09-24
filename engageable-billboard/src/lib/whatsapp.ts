import axios from 'axios';

const WHATSAPP_API_URL = `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

export async function sendWhatsAppMessage(phoneNumber: string, message: string, imageUrl?: string) {
  const headers = {
    'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
  };

  let payload: any = {
    messaging_product: 'whatsapp',
    to: phoneNumber,
  };

  if (imageUrl) {
    payload.type = 'template';
    payload.template = {
      name: 'selfie_approved',
      language: { code: 'en' },
      components: [
        {
          type: 'header',
          parameters: [
            {
              type: 'image',
              image: { link: imageUrl }
            }
          ]
        },
        {
          type: 'body',
          parameters: [
            { type: 'text', text: message }
          ]
        }
      ]
    };
  } else {
    payload.type = 'text';
    payload.text = { body: message };
  }

  try {
    const response = await axios.post(WHATSAPP_API_URL, payload, { headers });
    return response.data;
  } catch (error) {
    console.error('WhatsApp API Error:', error);
    throw error;
  }
}

export async function sendApprovalMessage(phoneNumber: string, name: string, framedImageUrl: string) {
  const message = `🎉 Congrats ${name}! Your selfie is now live on the billboard!\n\nShare this on Instagram with #MyBillboardMoment and tag us!`;
  
  return sendWhatsAppMessage(phoneNumber, message, framedImageUrl);
}

export async function sendRejectionMessage(phoneNumber: string, name: string) {
  const message = `Hi ${name}, thanks for your submission! Unfortunately, we couldn't approve your selfie this time. Please try again with a clear, appropriate photo.`;
  
  return sendWhatsAppMessage(phoneNumber, message);
}

export function verifyWhatsAppWebhook(mode: string, token: string, challenge: string) {
  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return challenge;
  }
  return null;
}