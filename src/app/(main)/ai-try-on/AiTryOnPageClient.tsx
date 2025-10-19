
"use client";

// This file is intentionally left empty after removing the AI Try-On feature.

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function AiTryOnPageClient() {
    const router = useRouter();
    return (
        <div className="container mx-auto py-8 md:py-12 text-center">
            <h1 className="text-2xl font-bold mb-4">Feature Not Available</h1>
            <p className="text-muted-foreground mb-6">This feature has been removed.</p>
            <Button onClick={() => router.push('/')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go to Homepage
            </Button>
        </div>
    );
}
