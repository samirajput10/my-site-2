
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProductList } from '@/components/products/ProductList';
import type { Product, ProductCategory, ProductSeason } from '@/types';
import { ALL_CATEGORIES, ALL_SEASONS }from '@/types';
import { getAllProductsFromDB } from '@/actions/productActions';
import { Loader2, ServerCrash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

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
  const searchParams = useSearchParams();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<React.ReactNode | null>(null);

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'All' | 'Sale'>('All');
  const [selectedSeason, setSelectedSeason] = useState<ProductSeason | 'All'>('All');
  
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category') as ProductCategory | null;
    const saleFromUrl = searchParams.get('sale');

    if (saleFromUrl === 'true') {
        setSelectedCategory('Sale');
    } else if (categoryFromUrl && ALL_CATEGORIES.includes(categoryFromUrl)) {
        setSelectedCategory(categoryFromUrl);
    }
  }, [searchParams]);

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

  const filteredProducts = useMemo(() => {
    let products = [...allProducts];

    // Filter by Category or Sale
    if (selectedCategory === 'Sale') {
      products = products.filter(p => p.originalPrice && p.originalPrice > p.price);
    } else if (selectedCategory !== 'All') {
      products = products.filter(p => p.category === selectedCategory);
    }

    // Filter by Season
    if (selectedSeason !== 'All') {
      products = products.filter(p => p.season === selectedSeason);
    }

    return products;
  }, [allProducts, selectedCategory, selectedSeason]);
  
  const FilterButtons = () => (
      <div className="flex flex-col gap-4 mb-10">
        <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="font-semibold mr-2">Category:</span>
            <Button
                variant={selectedCategory === 'All' ? 'default' : 'outline'}
                onClick={() => setSelectedCategory('All')}
                className="rounded-full"
            >
                All
            </Button>
            {ALL_CATEGORIES.map(cat => (
                <Button
                    key={cat}
                    variant={selectedCategory === cat ? 'default' : 'outline'}
                    onClick={() => setSelectedCategory(cat)}
                    className="rounded-full"
                >
                    {cat}
                </Button>
            ))}
            <Button
                variant={selectedCategory === 'Sale' ? 'default' : 'outline'}
                onClick={() => setSelectedCategory('Sale')}
                className="rounded-full bg-red-500/10 text-red-500 border-red-500/50 hover:bg-red-500/20 data-[state=active]:bg-red-500 data-[state=active]:text-white"
            >
                Sale
            </Button>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
             <span className="font-semibold mr-2">Season:</span>
            <Button
                variant={selectedSeason === 'All' ? 'default' : 'outline'}
                onClick={() => setSelectedSeason('All')}
                className="rounded-full"
            >
                All
            </Button>
            {ALL_SEASONS.map(season => (
                 <Button
                    key={season}
                    variant={selectedSeason === season ? 'default' : 'outline'}
                    onClick={() => setSelectedSeason(season)}
                    className="rounded-full"
                >
                    {season}
                </Button>
            ))}
        </div>
      </div>
  )

  return (
    <div className="container mx-auto py-8 md:py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-headline font-bold mb-3">Shop Our Collection</h1>
        <p className="text-lg text-muted-foreground">Discover unique pieces from independent designers.</p>
      </div>

      <FilterButtons />

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
          <ProductList products={filteredProducts} />
        )}
      </div>
    </div>
  );
}
