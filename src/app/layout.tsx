import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '#MyBillboardMoment - Share Your Selfie on Our Digital Billboard',
  description: 'Upload your selfie via web or WhatsApp and see it live on our digital billboard. Get framed, go viral, and share your #MyBillboardMoment!',
  keywords: 'selfie, billboard, digital, upload, whatsapp, instagram, viral, social media',
  openGraph: {
    title: '#MyBillboardMoment - Share Your Selfie on Our Digital Billboard',
    description: 'Upload your selfie via web or WhatsApp and see it live on our digital billboard. Get framed, go viral, and share your #MyBillboardMoment!',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: '#MyBillboardMoment - Digital Selfie Billboard',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '#MyBillboardMoment - Share Your Selfie on Our Digital Billboard',
    description: 'Upload your selfie via web or WhatsApp and see it live on our digital billboard. Get framed, go viral, and share your #MyBillboardMoment!',
    images: ['/og-image.jpg'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const posthogHost = (process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com').replace(/\/$/, '');
  const posthogScriptSrc = `${posthogHost}/static/array.js`;

  return (
    <html lang="en">
      <body className={inter.className}>
        {posthogKey ? (
          <>
            <Script src={posthogScriptSrc} strategy="afterInteractive" />
            <Script id="posthog-init" strategy="afterInteractive">
              {`
                window.posthog = window.posthog || function () {
                  (window.posthog.q = window.posthog.q || []).push(arguments);
                };
                window.posthog('init', ${JSON.stringify(posthogKey)}, {
                  api_host: ${JSON.stringify(posthogHost)},
                  capture_pageview: true,
                });
              `}
            </Script>
          </>
        ) : null}
        {children}
      </body>
    </html>
  );
}
