
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { ProductList } from '@/components/products/ProductList';
import { FilterSidebar } from '@/components/products/FilterSidebar';
import type { Filters, Product } from '@/types';
import { mockProducts } from '@/data/products';

export default function ShopPage() {
  const [filters, setFilters] = useState<Partial<Filters>>({
    categories: [],
    sizes: [],
    priceRange: { min: 0, max: 0 }, // Will be updated based on products
    searchQuery: '',
  });

  const maxProductPrice = useMemo(() => {
    if (mockProducts.length === 0) return 500; // Default if no products
    return Math.max(...mockProducts.map(p => p.price), 0);
  }, []);

  useEffect(() => {
    // Initialize filters with the actual max product price
    setFilters(prevFilters => ({
      ...prevFilters,
      priceRange: { min: 0, max: maxProductPrice },
    }));
  }, [maxProductPrice]);

  const handleFilterChange = (newFilters: Partial<Filters>) => {
    setFilters(prevFilters => ({ ...prevFilters, ...newFilters }));
  };
  
  // Ensure filters object always has a priceRange for ProductList
  const currentFiltersForList = useMemo(() => ({
    ...filters,
    priceRange: filters.priceRange || { min: 0, max: maxProductPrice },
  }), [filters, maxProductPrice]);


  return (
    <div className="container mx-auto py-8 md:py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-headline font-bold mb-3">Shop Our Collection</h1>
        <p className="text-lg text-muted-foreground">Discover unique pieces from independent brands.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <FilterSidebar 
            onFilterChange={handleFilterChange} 
            initialFilters={filters} // Pass the full filters state which includes the dynamically set priceRange
            maxPrice={maxProductPrice} // Pass the calculated overall max price for the slider
          />
        </div>
        <div className="lg:col-span-3">
          <ProductList filters={currentFiltersForList} />
        </div>
      </div>
    </div>
  );
}
