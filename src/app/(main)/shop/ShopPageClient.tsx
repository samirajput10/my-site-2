
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProductList } from '@/components/products/ProductList';
import type { Product } from '@/types';
import { getAllProductsFromDB } from '@/actions/productActions';
import { Loader2, AlertTriangle, ServerCrash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const recommendedDbRules = `{
  "rules": {
    "products": {
      ".read": "true",
      // Only authenticated users (admins) can write
      ".write": "auth != null",
       // Index for efficient querying by creation date
      ".indexOn": "createdAt"
    },
    "userTryOnCounts": {
      "$uid": {
        // Users can only read/write their own try-on count
        ".read": "auth != null && auth.uid === $uid",
        ".write": "auth != null && auth.uid === $uid",
        ".validate": "newData.isNumber() && newData.val() >= 0 && newData.val() <= 4"
      }
    }
  }
}`;


export function ShopPageClient() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | React.ReactNode | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);
      const result = await getAllProductsFromDB();
      if ('error' in result) {
         if (result.error.includes('permission-denied') || result.error.includes('PERMISSION_DENIED')) {
            const permissionError = (
                <>
                    Your database security rules are blocking access, which is preventing products from loading.
                    <br />
                    Please update your <strong>Realtime Database rules</strong> in the Firebase Console to allow public read access.
                    <br /><br />
                    <strong>Recommended rules for this app:</strong>
                    <pre className="mt-2 p-2 bg-gray-800 text-white rounded-md text-xs whitespace-pre-wrap">{recommendedDbRules}</pre>
                </>
            );
             setError(permissionError);
        } else {
            setError(result.error);
        }
        setAllProducts([]);
      } else {
        setAllProducts(result);
      }
      setIsLoading(false);
    };
    fetchProducts();
  }, []);

  return (
    <div className="container mx-auto py-8 md:py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-headline font-bold mb-3">Shop Our Collection</h1>
        <p className="text-lg text-muted-foreground">Discover unique pieces from independent designers.</p>
      </div>
      <div>
        {isLoading && (
          <div className="flex flex-col items-center justify-center min-h-[300px]">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading products...</p>
          </div>
        )}
        {error && !isLoading && (
          <div className="max-w-3xl mx-auto">
            <Alert variant="destructive" className="text-left">
                <ServerCrash className="h-4 w-4" />
                <AlertTitle>Error Loading Products</AlertTitle>
                <AlertDescription>
                    {error}
                </AlertDescription>
            </Alert>
            <div className="text-center mt-6">
                <Button onClick={() => window.location.reload()} variant="destructive">Try Again</Button>
            </div>
          </div>
        )}
        {!isLoading && !error && (
          <ProductList initialProducts={allProducts} />
        )}
      </div>
    </div>
  );
}
