// src/components/layout/PersonalizedRecommendations.tsx
"use client"; // Needs to be client for potential future personalization logic orcarousels

import Link from 'next/link';
import { ProductCard } from '@/components/products/ProductCard';
import type { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { mockProducts } from '@/data/products'; // Using mock products
import { cn } from '@/lib/utils'; // Ensure cn is imported

// Example: Select a few products for recommendation
const recommendedProducts = mockProducts.slice(0, 5); // Show 5 products

// Adding example properties for product cards based on user HTML
const productsWithDemoDetails: (Product & { discount?: string; status?: string; rating?: number; reviewCount?: number; brandName?: string; secondaryInfo?: string; originalPrice?: number; })[] = [
  { ...recommendedProducts[0], discount: '-25%', rating: 4.5, reviewCount: 42, originalPrice: 79.99, name: "Vintage Denim Jacket", category: "Outerwear", imageUrl: "https://placehold.co/300x400.png" },
  { ...recommendedProducts[1], rating: 4, reviewCount: 28, brandName: "CottonCraft", name: "Linen Button-Up Shirt", category: "Tops", imageUrl: "https://placehold.co/300x400.png" },
  { ...recommendedProducts[2], status: 'New', rating: 5, reviewCount: 112, secondaryInfo: "Eco-friendly materials", name: "Canvas Sneakers", category: "Shoes", imageUrl: "https://placehold.co/300x400.png" },
  { ...recommendedProducts[3], rating: 4.5, reviewCount: 76, name: "Floral Summer Dress", category: "Dresses", imageUrl: "https://placehold.co/300x400.png" },
  { ...recommendedProducts[4], status: 'Last 2!', discount: '-15%', rating: 5, reviewCount: 145, secondaryInfo: "Handcrafted by artisans", originalPrice: 120.00, name: "Handmade Leather Bag", category: "Accessories", imageUrl: "https://placehold.co/300x400.png" },
].map(p => ({...p, id: p.id + '_rec'})); // Ensure unique IDs if original products are also displayed

export function PersonalizedRecommendations() {
  if (!productsWithDemoDetails || productsWithDemoDetails.length === 0) {
    return null;
  }

  return (
    <section className="bg-muted/30 py-12"> {/* bg-gray-100 equivalent */}
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-foreground">Recommended For You</h2>
          <Button variant="link" asChild className="text-primary hover:underline">
            <Link href="/#all-recommendations">View All <ArrowRight className="ml-1 h-4 w-4" /></Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {productsWithDemoDetails.map((product, index) => (
            <ProductCard 
              key={product.id} 
              product={product}
              discount={product.discount}
              status={product.status}
              rating={product.rating}
              reviewCount={product.reviewCount}
              brandName={product.brandName}
              secondaryInfo={product.secondaryInfo}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
