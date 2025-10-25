
"use client";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import GradientText from './GradientText';

export function HeroSection() {
  return (
    <section className="relative w-full h-[60vh] md:h-[70vh] flex items-center justify-center text-center text-white overflow-hidden">
        <div 
            className="absolute inset-0 bg-cover bg-center z-0" 
            style={{ backgroundImage: 'url(https://i.postimg.cc/DzvKcbzJ/Gemini-Generated-Image-jwx2z2jwx2z2jwx2.png)' }}
            data-ai-hint="fashion runway models"
        >
             <div className="absolute inset-0 bg-black/40 z-10" />
        </div>

        <div className="relative z-20 container mx-auto px-4">
            <GradientText className="text-4xl md:text-6xl font-headline font-extrabold text-white drop-shadow-lg mb-4 leading-tight">
               Where Comfort Meets Luxury Style
            </GradientText>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-8 drop-shadow-md">
                Each piece tells a story. Find the one that speaks to you. Curated collections from independent designers worldwide.
            </p>
            <Button size="lg" asChild className="bg-white text-black hover:bg-white/90">
                <Link href="/shop">
                    Shop Now <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
            </Button>
        </div>
    </section>
  );
}
