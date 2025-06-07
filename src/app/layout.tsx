import type { Metadata } from 'next';
import './globals.css';
import { AppProviders } from '@/components/layout/AppProviders';
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
<<<<<<< HEAD
  title: 'Fashion Frenzy',
  description: 'Your ultimate destination for fashion.',
=======
  title: 'Fashion Frenzy - Support Small Fashion Brands',
  description: 'Shop from hundreds of small fashion brands. Each purchase supports an independent creator.',
>>>>>>> 8c7225b (first commit)
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
<<<<<<< HEAD
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Belleza&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Alegreya:ital,wght@0,400;0,500;0,700;1,400&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
=======
        {/* Added Google Fonts for Alegreya and Belleza */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Alegreya:ital,wght@0,400;0,500;0,700;1,400&family=Belleza&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body bg-background text-foreground antialiased"> {/* Changed to font-body */}
>>>>>>> 8c7225b (first commit)
        <AppProviders>
          {children}
          <Toaster />
        </AppProviders>
      </body>
    </html>
  );
}
