
import React, { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import AiTryOnPageClient from './AiTryOnPageClient';
import { Loader2, Sparkles } from 'lucide-react';

function AiTryOnLoading() {
  return (
    <div className="container mx-auto py-8 md:py-12">
      <div className="text-center mb-10">
        <Sparkles className="mx-auto h-16 w-16 text-primary mb-4" />
        <Skeleton className="h-10 w-3/4 mx-auto max-w-lg mb-3" />
        <Skeleton className="h-6 w-1/2 mx-auto max-w-2xl" />
      </div>
       <div className="max-w-5xl mx-auto space-y-8">
            <Skeleton className="h-32 w-full rounded-xl" />
            <div className="text-center py-20">
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                <p className="mt-4 text-muted-foreground">Loading AI Try-On experience...</p>
            </div>
       </div>
    </div>
  );
}


export default function AiTryOnPage() {
  return (
    <Suspense fallback={<AiTryOnLoading />}>
      <AiTryOnPageClient />
    </Suspense>
  );
}

    