import axios from 'axios';

const WHATSAPP_API_URL = `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

// Types for template components
interface TemplateComponent {
  type: 'header' | 'body' | 'footer' | 'button';
  sub_type?: 'url' | 'quick_reply';
  index?: number;
  parameters?: Array<{
    type: 'text' | 'image' | 'document' | 'video';
    text?: string;
    image?: { link: string };
    document?: { link: string; filename: string };
    video?: { link: string };
  }>;
}

interface TemplateOptions {
  name: string;
  language?: { code: string };
  components?: TemplateComponent[];
}

export async function sendWhatsAppMessage(
  phoneNumber: string, 
  message: string, 
  options?: {
    imageUrl?: string;
    template?: TemplateOptions;
  }
) {
  const headers = {
    'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
  };

  const payload: {
    messaging_product: string;
    to: string;
    type?: string;
    text?: { body: string };
    template?: {
      name: string;
      language: { code: string };
      components: TemplateComponent[];
    };
  } = {
    messaging_product: 'whatsapp',
    to: phoneNumber,
  };

  // If template is provided, use it
  if (options?.template) {
    payload.type = 'template';
    payload.template = {
      name: options.template.name,
      language: options.template.language || { code: 'en' },
      components: options.template.components || []
    };
  }
  // If imageUrl is provided (legacy support), create template
  else if (options?.imageUrl) {
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
              image: { link: options.imageUrl }
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
  }
  // Default to text message
  else {
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
  
  return sendWhatsAppMessage(phoneNumber, message, { imageUrl: framedImageUrl });
}

export async function sendRejectionMessage(phoneNumber: string, name: string) {
  const message = `Hi ${name}, thanks for your submission! Unfortunately, we couldn't approve your selfie this time. Please try again with a clear, appropriate photo.`;
  
  return sendWhatsAppMessage(phoneNumber, message);
}

// New template-based functions
export async function sendOTPMessage(phoneNumber: string, otpCode: string, name?: string) {
  // For {{1}} based templates, just pass the OTP code as the first parameter
  // If you need to include name in the template, add it as a second parameter
  const parameters = name ? [otpCode, name] : [otpCode];
  return sendTemplateMessage(phoneNumber, 'otp_verification', parameters);
}

// OTP message with Copy code button - provides the button parameter
export async function sendOTPMessageWithButton(phoneNumber: string, otpCode: string, name?: string) {
  const bodyParameters = name ? [otpCode, name] : [otpCode];
  
  // If your template has a Copy code button at index 0, provide the OTP code as the button parameter
  const buttons = [
    { type: 'url' as const, index: 0, parameter: otpCode }
  ];
  
  return sendTemplateMessageWithButtons(phoneNumber, 'otp_verification', bodyParameters, buttons);
}

export async function sendWelcomeMessage(phoneNumber: string, name: string) {
  // For {{1}} based templates, pass the name as the first parameter
  return sendTemplateMessage(phoneNumber, 'welcome_message', [name]);
}

// Simple template function for {{1}}, {{2}}, etc. based templates
// Example: Template "Your code is {{1}}" with parameters ["123456"] becomes "Your code is 123456"
export async function sendTemplateMessage(
  phoneNumber: string,
  templateName: string,
  parameters: string[],
  languageCode: string = 'en'
) {
  const components: TemplateComponent[] = [];
  
  if (parameters.length > 0) {
    components.push({
      type: 'body',
      parameters: parameters.map(param => ({ type: 'text', text: param }))
    });
  }

  return sendWhatsAppMessage(phoneNumber, '', {
    template: {
      name: templateName,
      language: { code: languageCode },
      components
    }
  });
}

export async function sendCustomTemplateMessage(
  phoneNumber: string, 
  templateName: string, 
  components: TemplateComponent[],
  languageCode: string = 'en'
) {
  return sendWhatsAppMessage(phoneNumber, '', {
    template: {
      name: templateName,
      language: { code: languageCode },
      components
    }
  });
}

export async function sendImageTemplateMessage(
  phoneNumber: string, 
  templateName: string, 
  imageUrl: string, 
  bodyText?: string,
  languageCode: string = 'en'
) {
  const components: TemplateComponent[] = [
    {
      type: 'header',
      parameters: [
        {
          type: 'image',
          image: { link: imageUrl }
        }
      ]
    }
  ];

  if (bodyText) {
    components.push({
      type: 'body',
      parameters: [
        { type: 'text', text: bodyText }
      ]
    });
  }

  return sendCustomTemplateMessage(phoneNumber, templateName, components, languageCode);
}

// Enhanced template function that supports buttons
// Example usage:
// await sendTemplateMessageWithButtons(
//   phoneNumber,
//   'template_with_buttons',
//   ['John', '123456'], // body parameters
//   [
//     { type: 'url', index: 0, parameter: 'https://example.com' },
//     { type: 'quick_reply', index: 1, parameter: 'YES' }
//   ]
// );
export async function sendTemplateMessageWithButtons(
  phoneNumber: string,
  templateName: string,
  bodyParameters: string[] = [],
  buttons: Array<{ type: 'url' | 'quick_reply'; index: number; parameter: string }> = [],
  languageCode: string = 'en'
) {
  const components: TemplateComponent[] = [];

  // Add body component if there are parameters
  if (bodyParameters.length > 0) {
    components.push({
      type: 'body',
      parameters: bodyParameters.map(param => ({ type: 'text', text: param }))
    });
  }

  // Add button components
  buttons.forEach(button => {
    if (button.type === 'url') {
      components.push(createUrlButtonComponent(button.index, button.parameter));
    } else if (button.type === 'quick_reply') {
      components.push(createQuickReplyButtonComponent(button.index, button.parameter));
    }
  });

  return sendCustomTemplateMessage(phoneNumber, templateName, components, languageCode);
}

// Helper function to create button components
export function createButtonComponent(
  subType: 'url' | 'quick_reply',
  index: number,
  parameters: Array<{ type: 'text'; text: string }>
): TemplateComponent {
  return {
    type: 'button',
    sub_type: subType,
    index,
    parameters
  };
}

// Helper function to create URL button component
export function createUrlButtonComponent(
  index: number,
  urlParameter: string
): TemplateComponent {
  return createButtonComponent('url', index, [
    { type: 'text', text: urlParameter }
  ]);
}

// Helper function to create quick reply button component
export function createQuickReplyButtonComponent(
  index: number,
  payload: string
): TemplateComponent {
  return createButtonComponent('quick_reply', index, [
    { type: 'text', text: payload }
  ]);
}

export function verifyWhatsAppWebhook(mode: string, token: string, challenge: string) {
  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return challenge;
  }
  return null;
}