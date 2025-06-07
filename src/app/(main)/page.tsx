"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { ProductList } from '@/components/products/ProductList';
import { FilterSidebar } from '@/components/products/FilterSidebar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X as ClearSearchIcon } from 'lucide-react';
import type { Filters } from '@/types';
import { mockProducts } from '@/data/products'; // For max price calculation

export default function HomePage() {
  const [filters, setFilters] = useState<Partial<Filters>>({
    categories: [],
    sizes: [],
    priceRange: { min: 0, max: Math.max(...mockProducts.map(p => p.price), 500) }, // Calculate max price from products
    searchQuery: '',
  });
  const [searchInputValue, setSearchInputValue] = useState('');

  const handleFilterChange = (newFilters: Partial<Filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInputValue(event.target.value);
  };

  const applySearch = () => {
    setFilters(prev => ({ ...prev, searchQuery: searchInputValue }));
  };
  
  const clearSearch = () => {
    setSearchInputValue('');
    setFilters(prev => ({ ...prev, searchQuery: '' }));
  };
  
  // Debounce search apply
  useEffect(() => {
    const handler = setTimeout(() => {
      applySearch();
    }, 500); // Apply search after 500ms of no typing

    return () => {
      clearTimeout(handler);
    };
  }, [searchInputValue]);


  const maxPriceFromProducts = useMemo(() => {
    return Math.max(...mockProducts.map(p => p.price), 500); // Ensure a minimum sensible max
  }, []);

  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      priceRange: { min: prev.priceRange?.min || 0, max: maxPriceFromProducts }
    }));
  }, [maxPriceFromProducts]);


  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-headline font-bold text-gray-800 dark:text-white sm:text-5xl">
          Discover Your Next <span className="text-primary">Style</span>
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Browse our curated collection of the latest fashion trends.
        </p>
      </div>

      <div className="mb-8 max-w-2xl mx-auto">
        <div className="relative flex items-center">
          <Input
            type="text"
            placeholder="Search for products, brands, or styles..."
            value={searchInputValue}
            onChange={handleSearchChange}
            className="pr-20 pl-10 h-12 text-base rounded-full shadow-sm"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          {searchInputValue && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-10 top-1/2 -translate-y-1/2 h-8 w-8"
              onClick={clearSearch}
              aria-label="Clear search"
            >
              <ClearSearchIcon className="h-4 w-4" />
            </Button>
          )}
          <Button 
            onClick={applySearch} 
            className="absolute right-1 top-1/2 -translate-y-1/2 h-10 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground"
            aria-label="Search"
          >
            <Search className="h-5 w-5 md:hidden" />
            <span className="hidden md:inline">Search</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <FilterSidebar 
            onFilterChange={handleFilterChange} 
            initialFilters={filters}
            maxPrice={maxPriceFromProducts}
          />
        </div>
        <div className="lg:col-span-3">
          <ProductList filters={filters} />
        </div>
      </div>
    </div>
  );
}
