<<<<<<< HEAD
=======

>>>>>>> 8c7225b (first commit)
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import type { ProductCategory, ProductSize, Filters } from '@/types';
import { ALL_CATEGORIES, ALL_SIZES } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Filter as FilterIcon, X as ClearIcon } from 'lucide-react';

interface FilterSidebarProps {
  onFilterChange: (filters: Partial<Filters>) => void;
  initialFilters?: Partial<Filters>;
<<<<<<< HEAD
  maxPrice?: number;
}

const DEFAULT_MAX_PRICE = 500;

export function FilterSidebar({ onFilterChange, initialFilters = {}, maxPrice = DEFAULT_MAX_PRICE }: FilterSidebarProps) {
  const [categories, setCategories] = useState<ProductCategory[]>(initialFilters.categories || []);
  const [sizes, setSizes] = useState<ProductSize[]>(initialFilters.sizes || []);
  const [priceRange, setPriceRange] = useState<[number, number]>(
    initialFilters.priceRange ? [initialFilters.priceRange.min, initialFilters.priceRange.max] : [0, maxPrice]
  );

  useEffect(() => {
    // Update internal price range if maxPrice prop changes and current max is default
    if (priceRange[1] === DEFAULT_MAX_PRICE && maxPrice !== DEFAULT_MAX_PRICE) {
      setPriceRange([priceRange[0], maxPrice]);
    }
  }, [maxPrice, priceRange]);
=======
  maxPrice?: number; // Overall maximum price for the slider
}

const DEFAULT_MAX_PRICE = 500; // Fallback if maxPrice prop is not provided or zero

export function FilterSidebar({ 
  onFilterChange, 
  initialFilters = {}, 
  maxPrice: maxPriceProp = DEFAULT_MAX_PRICE 
}: FilterSidebarProps) {
  
  const effectiveMaxPrice = maxPriceProp > 0 ? maxPriceProp : DEFAULT_MAX_PRICE;

  const [categories, setCategories] = useState<ProductCategory[]>(initialFilters.categories || []);
  const [sizes, setSizes] = useState<ProductSize[]>(initialFilters.sizes || []);
  
  const [priceRange, setPriceRange] = useState<[number, number]>(() => {
    if (initialFilters.priceRange) {
      return [
        Math.max(0, initialFilters.priceRange.min), 
        Math.min(initialFilters.priceRange.max, effectiveMaxPrice)
      ];
    }
    return [0, effectiveMaxPrice];
  });

  // Update priceRange if initialFilters or effectiveMaxPrice changes after initial mount
  useEffect(() => {
    setPriceRange(currentSelection => {
        const newMin = initialFilters?.priceRange?.min !== undefined ? Math.max(0, initialFilters.priceRange.min) : 0;
        const newMaxFromInitial = initialFilters?.priceRange?.max !== undefined ? initialFilters.priceRange.max : effectiveMaxPrice;
        
        return [
            Math.min(newMin, effectiveMaxPrice), // Min shouldn't exceed effectiveMaxPrice
            Math.min(newMaxFromInitial, effectiveMaxPrice) // Max from initial, capped by effectiveMaxPrice
        ];
    });
  }, [initialFilters?.priceRange?.min, initialFilters?.priceRange?.max, effectiveMaxPrice]);
>>>>>>> 8c7225b (first commit)


  const handleCategoryChange = (category: ProductCategory) => {
    setCategories(prev =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  const handleSizeChange = (size: ProductSize) => {
    setSizes(prev =>
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const handlePriceChange = (newRange: [number, number]) => {
    setPriceRange(newRange);
  };
  
  const applyFilters = () => {
    onFilterChange({
      categories,
      sizes,
      priceRange: { min: priceRange[0], max: priceRange[1] },
    });
  };

  const clearFilters = () => {
    setCategories([]);
    setSizes([]);
<<<<<<< HEAD
    setPriceRange([0, maxPrice]);
    onFilterChange({
      categories: [],
      sizes: [],
      priceRange: { min: 0, max: maxPrice },
=======
    setPriceRange([0, effectiveMaxPrice]); // Reset to full available range
    onFilterChange({
      categories: [],
      sizes: [],
      priceRange: { min: 0, max: effectiveMaxPrice },
>>>>>>> 8c7225b (first commit)
    });
  };

  return (
    <Card className="sticky top-20 shadow-lg rounded-xl">
      <CardHeader>
        <CardTitle className="text-xl flex items-center justify-between">
          <span><FilterIcon className="inline mr-2 h-5 w-5" />Filters</span>
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs">
            <ClearIcon className="inline mr-1 h-4 w-4" /> Clear All
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="mb-2 font-semibold text-md">Category</h4>
          <div className="space-y-2">
            {ALL_CATEGORIES.map(category => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category}`}
                  checked={categories.includes(category)}
                  onCheckedChange={() => handleCategoryChange(category)}
<<<<<<< HEAD
=======
                  aria-label={`Filter by category ${category}`}
>>>>>>> 8c7225b (first commit)
                />
                <Label htmlFor={`category-${category}`} className="font-normal text-sm">{category}</Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="mb-2 font-semibold text-md">Size</h4>
          <div className="grid grid-cols-3 gap-2">
            {ALL_SIZES.map(size => (
              <Button
                key={size}
                variant={sizes.includes(size) ? "default" : "outline"}
                size="sm"
                onClick={() => handleSizeChange(size)}
                className="text-xs"
<<<<<<< HEAD
=======
                aria-pressed={sizes.includes(size)}
                aria-label={`Filter by size ${size}`}
>>>>>>> 8c7225b (first commit)
              >
                {size}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <h4 className="mb-2 font-semibold text-md">Price Range</h4>
          <Slider
            min={0}
<<<<<<< HEAD
            max={maxPrice}
            step={10}
            value={priceRange}
            onValueChange={(value) => handlePriceChange(value as [number, number])}
            className="mb-2"
=======
            max={effectiveMaxPrice} // Use the overall max price for the slider scale
            step={10} // Or a more dynamic step, e.g., effectiveMaxPrice / 50
            value={priceRange} // Current selected range
            onValueChange={(value) => handlePriceChange(value as [number, number])}
            className="mb-2"
            aria-label="Price range slider"
>>>>>>> 8c7225b (first commit)
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>${priceRange[0]}</span>
            <span>${priceRange[1]}</span>
          </div>
        </div>
        
        <Button onClick={applyFilters} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
          Apply Filters
        </Button>
      </CardContent>
    </Card>
  );
}
