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
    setPriceRange([0, maxPrice]);
    onFilterChange({
      categories: [],
      sizes: [],
      priceRange: { min: 0, max: maxPrice },
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
            max={maxPrice}
            step={10}
            value={priceRange}
            onValueChange={(value) => handlePriceChange(value as [number, number])}
            className="mb-2"
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
