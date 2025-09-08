
"use client";

import React from 'react';
import type { Product } from '@/types';
import { ProductCard } from './ProductCard';

interface ProductListProps {
  initialProducts?: Product[]; 
}

export function ProductList({ initialProducts }: ProductListProps) {
  const productsToDisplay = initialProducts || [];

  if (productsToDisplay.length === 0) {
     return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-semibold mb-2">No Products Available</h2>
        <p className="text-muted-foreground">Check back later for new arrivals.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {productsToDisplay.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
