
import React, { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { ShopPageClient } from './ShopPageClient';

function ShopPageLoading() {
  return (
    <div className="container mx-auto py-8 md:py-12">
      <div className="text-center mb-10">
        <Skeleton className="h-10 w-3/4 mx-auto max-w-lg mb-3" />
        <Skeleton className="h-6 w-1/2 mx-auto max-w-md" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(12)].map((_, i) => (
          <Skeleton key={i} className="h-96 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<ShopPageLoading />}>
      <ShopPageClient />
    </Suspense>
  );
}
