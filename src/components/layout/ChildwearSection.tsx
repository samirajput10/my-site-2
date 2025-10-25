"use client";

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { ProductCard } from '@/components/products/ProductCard';
import type { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2, Baby } from 'lucide-react';
import { getAllProductsFromDB } from '@/actions/productActions';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

export function ChildwearSection() {
  const [childwearProducts, setChildwearProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const autoplayPlugin = useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true, stopOnMouseEnter: true })
  );

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);

      const allProductsResult = await getAllProductsFromDB();
      if ('error' in allProductsResult) {
        console.error("ChildwearSection Error:", allProductsResult.error);
        setChildwearProducts([]);
      } else {
        const childsProducts = allProductsResult.filter(p => p.category === 'Childwear');
        setChildwearProducts(childsProducts);
      }
      
      setIsLoading(false);
    };

    fetchProducts();
  }, []);

  if (isLoading) {
    return (
      <section className="bg-background py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
             <h2 className="text-2xl font-bold text-foreground flex items-center"><Baby className="mr-3 h-6 w-6 text-primary"/>For The Little Ones</h2>
          </div>
          <div className="flex items-center justify-center min-h-[200px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </section>
    );
  }

  if (childwearProducts.length === 0) {
    return null; // Don't show if there are no childwear products
  }

  return (
    <section className="bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-foreground flex items-center"><Baby className="mr-3 h-6 w-6 text-primary"/>For The Little Ones</h2>
          <Button variant="link" asChild className="text-primary hover:underline">
            <Link href="/shop?category=Childwear">View All <ArrowRight className="ml-1 h-4 w-4" /></Link>
          </Button>
        </div>
        
        <Carousel
          plugins={[autoplayPlugin.current]}
          className="w-full"
          opts={{
            align: "start",
            loop: childwearProducts.length > 5, // Only loop if there are more items than can be shown
          }}
        >
          <CarouselContent className="-ml-4">
            {childwearProducts.map((product) => (
              <CarouselItem key={product.id} className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
                <div className="p-1 h-full">
                  <ProductCard product={product} />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </section>
  );
}
