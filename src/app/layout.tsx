
import type { Metadata } from 'next';
import './globals.css';
import { AppProviders } from '@/components/layout/AppProviders';
import { Toaster } from "@/components/ui/toaster";
import { firebaseError } from '@/lib/firebase/config';
import { FirebaseErrorOverlay } from '@/components/layout/FirebaseErrorOverlay';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Velbric - Discover Unique Fashion',
  description: 'Shop from hundreds of small fashion brands. Each purchase supports an independent creator.',
  openGraph: {
    images: ['/og-image.png'],
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // If there's a firebase configuration error, block the whole app and show the error overlay.
  if (firebaseError) {
    return (
      <html lang="en" suppressHydrationWarning>
         <head>
            <title>Configuration Error</title>
         </head>
        <body className="font-sans bg-background text-foreground antialiased">
          <FirebaseErrorOverlay message={firebaseError} />
        </body>
      </html>
    );
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google tag (gtag.js) */}
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-SND2DGSRJN"></Script>
        <Script id="google-analytics">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-SND2DGSRJN');
          `}
        </Script>
      </head>
      <body className="font-sans bg-background text-foreground antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AppProviders>
            {children}
            <Toaster />
          </AppProviders>
        </ThemeProvider>
      </body>
    </html>
  );
}
