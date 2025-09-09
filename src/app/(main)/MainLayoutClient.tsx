
"use client";

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PromotionalBanner } from '@/components/layout/PromotionalBanner';

export function MainLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <PromotionalBanner />
      <Header />
      <main className="flex-grow bg-background">{children}</main>
      <Footer />
    </div>
  );
}
