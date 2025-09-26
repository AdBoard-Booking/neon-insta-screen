import type { Metadata } from 'next';
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackServerApp } from "../stack/server";
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
  
  return (
    <html lang="en">
      <body className={inter.className}><StackProvider app={stackServerApp}><StackTheme>
          <>
            <Script id="posthog-init" strategy="afterInteractive">
              {`
    !function(t,e){var o,n,p,r;e.__SV||(window.posthog && window.posthog.__loaded)||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init Ce Ds js Te Os As capture Ye calculateEventProperties Us register register_once register_for_session unregister unregister_for_session Hs getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSurveysLoaded onSessionId getSurveys getActiveMatchingSurveys renderSurvey displaySurvey canRenderSurvey canRenderSurveyAsync identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty qs Ns createPersonProfile Bs Cs Ws opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing get_explicit_consent_status is_capturing clear_opt_in_out_capturing Ls debug L zs getPageViewId captureTraceFeedback captureTraceMetric".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
    posthog.init('phc_xuWeW1axhPe67lrlmU9jVKYgozklO4gNYvcRsIH3nzD', {
        api_host: 'https://eu.i.posthog.com',
        person_profiles: 'always'
    })
              `}
            </Script>
          </>
        {children}
      </StackTheme></StackProvider></body>
    </html>
  );
}
