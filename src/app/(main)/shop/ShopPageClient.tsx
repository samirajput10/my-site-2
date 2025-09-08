
"use client";

import React, { useState, useEffect } from 'react';
import { ProductList } from '@/components/products/ProductList';
import type { Product } from '@/types';
import { getAllProductsFromDB } from '@/actions/productActions';
import { Loader2, ServerCrash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const recommendedDbRules = `{
  "rules": {
    "service cloud.firestore": {
      "match /databases/{database}/documents": {
        // Allow public read access to products
        "match /products/{productId}": {
          "allow read": true;
          "allow write": if request.auth != null; // Or more specific admin logic
        },
        // Allow users to manage their own credits
        "match /userCredits/{userId}": {
           "allow read, write": if request.auth != null && request.auth.uid == userId;
        }
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
         if (result.error.includes('permission-denied') || result.error.includes('PERMISSION_DENIED') || result.error.includes('firestore/permission-denied')) {
            const permissionError = (
                <>
                    Your database security rules are blocking access, which is preventing products from loading.
                    <br />
                    Please update your <strong>Firestore rules</strong> in the Firebase Console to allow public read access.
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
