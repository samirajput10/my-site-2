// src/components/layout/HeroSection.tsx
"use client";
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function HeroSection() {
  return (
    <section className="relative bg-gradient-to-r from-primary to-accent text-primary-foreground">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="md:w-1/2">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Discover Unique Fashion From Independent Designers
          </h2>
          <p className="text-lg mb-6 text-primary-foreground/90">
            Shop from hundreds of small fashion brands. Each purchase supports an independent creator.
          </p>
          <Button 
            asChild 
            size="lg" 
            className="bg-card text-primary px-6 py-3 rounded-full font-semibold hover:bg-card/90 transition duration-300"
          >
            <Link href="/#shop">Shop Now</Link>
          </Button>
        </div>
      </div>
      {/* Subtle gradient overlay at the bottom if needed, or remove if card bg provides enough contrast */}
      {/* <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent"></div> */}
    </section>
  );
}
