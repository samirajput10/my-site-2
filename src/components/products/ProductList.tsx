
"use client";

import React from 'react';
import type { Product } from '@/types';
import { ProductCard } from './ProductCard';

interface ProductListProps {
  products?: Product[]; 
}

export function ProductList({ products }: ProductListProps) {
  const productsToDisplay = products || [];

  if (productsToDisplay.length === 0) {
     return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-semibold mb-2">No Products Found</h2>
        <p className="text-muted-foreground">Try adjusting your filters or check back later for new arrivals.</p>
      </div>
    );
  }

  return (
    <div className="shop-grid">
      {productsToDisplay.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
