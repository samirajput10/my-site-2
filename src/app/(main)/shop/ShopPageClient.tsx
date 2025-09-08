
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProductList } from '@/components/products/ProductList';
import type { Product } from '@/types';
import { getAllProductsFromDB } from '@/actions/productActions';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ShopPageClient() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);
      const result = await getAllProductsFromDB();
      if ('error' in result) {
        setError(result.error);
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
        <p className="text-lg text-muted-foreground">Discover unique pieces from independent brands.</p>
      </div>
      <div>
        {isLoading && (
          <div className="flex flex-col items-center justify-center min-h-[300px]">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading products...</p>
          </div>
        )}
        {error && !isLoading && (
          <div className="flex flex-col items-center justify-center min-h-[300px] text-center bg-destructive/10 p-6 rounded-lg">
            <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
            <h2 className="text-xl font-semibold text-destructive mb-2">Failed to Load Products</h2>
            <p className="text-destructive/80 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} variant="destructive">Try Again</Button>
          </div>
        )}
        {!isLoading && !error && (
          <ProductList initialProducts={allProducts} />
        )}
      </div>
    </div>
  );
}
