import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { koKR } from "@clerk/localizations";
import Script from "next/script";
import "./globals.css";
import { GA4_MEASUREMENT_ID, GTM_CONTAINER_ID } from "@/lib/analytics";
import { GlobalDock } from "@/components/GlobalDock";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ADDCOW - Coming Soon",
  description: "Join our waitlist to be notified when we launch",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      localization={koKR}
      appearance={{
        layout: {
          unsafe_disableDevelopmentModeWarnings: true,
        },
        variables: {
          colorBackground: '#060010',
          colorPrimary: '#9333ea',
        },
      }}
    >
      <html lang="ko" suppressHydrationWarning style={{ backgroundColor: '#060010' }}>
        <head>
          {/* Google Tag Manager */}
          {GTM_CONTAINER_ID && (
            <Script
              id="gtm-script"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                  })(window,document,'script','dataLayer','${GTM_CONTAINER_ID}');
                `,
              }}
            />
          )}

          {/* Google Analytics 4 */}
          {GA4_MEASUREMENT_ID && (
            <>
              <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`}
                strategy="afterInteractive"
              />
              <Script
                id="ga4-script"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                  __html: `
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', '${GA4_MEASUREMENT_ID}', {
                      page_path: window.location.pathname,
                    });
                  `,
                }}
              />
            </>
          )}
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          {/* Google Tag Manager (noscript) */}
          {GTM_CONTAINER_ID && (
            <noscript>
              <iframe
                src={`https://www.googletagmanager.com/ns.html?id=${GTM_CONTAINER_ID}`}
                height="0"
                width="0"
                style={{ display: "none", visibility: "hidden" }}
              />
            </noscript>
          )}
          {children}
          <GlobalDock />
        </body>
      </html>
    </ClerkProvider>
  );
}
