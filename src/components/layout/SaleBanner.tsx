
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Percent, ArrowRight } from 'lucide-react';

export function SaleBanner() {
  return (
    <section 
      className="relative bg-cover bg-center text-white"
      style={{ backgroundImage: "url('/images/Whisk_e1a835360ed821db99b4636d685665fddr.jpeg')" }}
      data-ai-hint="fashion sale background"
    >
      <div className="absolute inset-0 bg-black/50 z-0" />
      <div className="relative z-10 container mx-auto px-4 py-16 md:py-24 text-center dark:shadow-[0_4px_14px_0_rgba(255,255,255,0.1)]">
        
        <h2 className="text-3xl font-headline font-bold mb-3 drop-shadow-md">Winter Sale is On!</h2>
        <p className="text-lg mb-6 max-w-2xl mx-auto drop-shadow-sm">
          Get up to <span className="font-bold">50% off</span> on selected items. Don't miss out on these hot deals!
        </p>
        <Button asChild size="lg" className="bg-white text-black hover:bg-white/90">
          <Link href="/shop?sale=true">
            Shop The Sale <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
