# Engageable Billboard (UGC Selfie Wall v2)

A Next.js application that enables people to upload selfies via WhatsApp or web interface, get them moderated, and display them on a digital billboard with real-time FOMO prompts and Instagram virality features.

## Features

- 📱 **WhatsApp Integration**: Upload selfies directly via WhatsApp Business API
- 🌐 **Web Upload**: User-friendly web interface for selfie submissions
- 🖼️ **Image Framing**: Automatic brand overlay and framing with ImageKit
- 📺 **Live Billboard**: Fullscreen display with rotating approved images
- ⚡ **Real-time Events**: Socket.io powered FOMO banners and notifications
- 👨‍💼 **Admin Dashboard**: Complete moderation system with Airtable integration
- 📊 **Analytics**: Live counters and submission statistics
- 🎨 **Modern UI**: Beautiful, responsive design with Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 14 (TypeScript), Tailwind CSS, Framer Motion
- **Backend**: Next.js API routes, Socket.io
- **Database**: Airtable
- **Storage**: ImageKit
- **Messaging**: WhatsApp Business Cloud API
- **Real-time**: Socket.io

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd engageable-billboard
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Airtable Configuration
AIRTABLE_API_KEY=your_airtable_api_key
AIRTABLE_BASE_ID=your_airtable_base_id
AIRTABLE_TABLE_NAME=Submissions

# ImageKit Configuration
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_imagekit_id

# WhatsApp Business API
WHATSAPP_ACCESS_TOKEN=your_whatsapp_access_token
WHATSAPP_PHONE_NUMBER_ID=your_whatsapp_phone_number_id
WHATSAPP_VERIFY_TOKEN=your_whatsapp_verify_token

# Next.js
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# Admin Authentication
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
```

### 3. Airtable Setup

1. Create a new Airtable base
2. Create a table called "Submissions" with the following fields:
   - `Name` (Single line text)
   - `Instagram Handle` (Single line text)
   - `Image URL` (URL)
   - `Status` (Single select: pending, approved, rejected)
   - `Source` (Single select: whatsapp, web)
   - `Phone Number` (Phone number)
   - `Framed Image URL` (URL)
   - `Approved At` (Date)
   - `Created At` (Created time - auto-generated)

### 4. ImageKit Setup

1. Create an ImageKit account
2. Upload a frame image and note its path (e.g., "billboard-frame.png")
3. Get your public key, private key, and URL endpoint from the dashboard
4. Update the frame image path in the code if needed

### 5. WhatsApp Business API Setup

1. Set up a WhatsApp Business account
2. Create a WhatsApp Business API app
3. Get your access token and phone number ID
4. Set up webhook URL: `https://yourdomain.com/api/whatsapp/webhook`

### 6. Run the Application

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## Pages
 
- `/` - Landing page with upload options
- `/upload` - Web upload form
- `/billboard` - Live billboard display (fullscreen)
- `/admin` - Admin dashboard for moderation

## API Endpoints 

- `POST /api/submit` - Submit a new selfie
- `GET /api/admin/submissions` - Get all submissions (admin)
- `PATCH /api/admin/submissions` - Update submission status
- `GET /api/billboard/approved` - Get approved submissions for billboard
- `POST /api/whatsapp/webhook` - WhatsApp webhook handler

## Real-time Events

The application uses Socket.io for real-time communication:

- `new_upload` - Triggered when someone uploads a selfie
- `approved_post` - Triggered when a submission is approved
- `rejected_post` - Triggered when a submission is rejected
- `billboard_update` - General billboard updates

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Customization

### Branding

1. Update the frame image in ImageKit
2. Modify colors in `tailwind.config.js`
3. Update the hashtag in the codebase
4. Customize the WhatsApp message templates

### Features

- Add more image filters and effects
- Implement user authentication
- Add more social media integrations
- Create advanced analytics dashboard

## Troubleshooting

### Common Issues

1. **Airtable API errors**: Check your API key and base ID
2. **ImageKit upload fails**: Verify your public key, private key, and URL endpoint
3. **WhatsApp webhook not working**: Ensure the webhook URL is accessible
4. **Socket.io connection issues**: Check CORS settings

### Debug Mode

Set `NODE_ENV=development` to enable debug logging.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For support, email support@example.com or create an issue in the repository.