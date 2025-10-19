
import React, { Suspense } from 'react';
import AiTryOnPageClient from './AiTryOnPageClient';

function AiTryOnLoading() {
  return (
    <div className="container mx-auto py-8 md:py-12 text-center">
        <h1 className="text-2xl font-bold">Loading...</h1>
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
