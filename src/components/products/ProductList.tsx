"use client";

import React, { useState, useEffect, useMemo } from 'react';
import type { Product, Filters, ProductCategory, ProductSize } from '@/types';
import { ProductCard } from './ProductCard';
import { mockProducts } from '@/data/products'; // Using mock products directly for client-side filtering

interface ProductListProps {
  initialProducts?: Product[]; // For potential server-side pre-fetching
  filters: Partial<Filters>;
}

export function ProductList({ initialProducts, filters }: ProductListProps) {
  const [productsToDisplay, setProductsToDisplay] = useState<Product[]>(initialProducts || mockProducts);

  const filteredProducts = useMemo(() => {
    let tempProducts = initialProducts || mockProducts;

    if (filters.searchQuery) {
      tempProducts = tempProducts.filter(p =>
        p.name.toLowerCase().includes(filters.searchQuery!.toLowerCase()) ||
        p.description.toLowerCase().includes(filters.searchQuery!.toLowerCase())
      );
    }

    if (filters.categories && filters.categories.length > 0) {
      tempProducts = tempProducts.filter(p => filters.categories!.includes(p.category));
    }

    if (filters.sizes && filters.sizes.length > 0) {
      tempProducts = tempProducts.filter(p => p.sizes.some(s => filters.sizes!.includes(s)));
    }

    if (filters.priceRange) {
      tempProducts = tempProducts.filter(p => p.price >= filters.priceRange!.min && p.price <= filters.priceRange!.max);
    }
    
    return tempProducts;
  }, [initialProducts, filters]);


  useEffect(() => {
    setProductsToDisplay(filteredProducts);
  }, [filteredProducts]);

  if (productsToDisplay.length === 0) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-semibold mb-2">No Products Found</h2>
        <p className="text-muted-foreground">Try adjusting your filters or search terms.</p>
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
