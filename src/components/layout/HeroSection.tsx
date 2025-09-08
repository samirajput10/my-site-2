
// src/components/layout/HeroSection.tsx

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative w-full h-[60vh] md:h-[70vh] flex items-center justify-center text-center text-white overflow-hidden">
        <Link href="/shop" className="absolute inset-0 z-10" aria-label="Shop Now"></Link>
        <div 
            className="absolute inset-0 bg-cover bg-center z-0" 
            style={{ backgroundImage: 'url(https://i.postimg.cc/PqYp5dF7/image.png)' }}
            data-ai-hint="earrings jewelry sparkle"
        >
        </div>
    </section>
  );
}
