
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ProductCard } from '@/components/products/ProductCard';
import type { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2 } from 'lucide-react';
import { getAllProductsFromDB } from '@/actions/productActions';

export function NewArrivals() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);

      const allProductsResult = await getAllProductsFromDB();
      if ('error' in allProductsResult) {
        console.error(allProductsResult.error);
        setProducts([]);
      } else {
        // Sort by creation date (assuming it's available) and take the latest 8
        const sortedProducts = allProductsResult.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        setProducts(sortedProducts.slice(0, 8));
      }
      
      setIsLoading(false);
    };

    fetchProducts();
  }, []);

  if (isLoading) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-foreground mb-6 text-center">Fresh Off The Hanger</h2>
          <div className="flex items-center justify-center min-h-[200px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null; // Don't show if there are no products
  }

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-foreground">Fresh Off The Hanger</h2>
          <Button variant="link" asChild className="text-primary hover:underline">
            <Link href="/shop">View All <ArrowRight className="ml-1 h-4 w-4" /></Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
