
// src/components/layout/HeroSection.tsx
"use client";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { ProductImage } from '@/components/products/ProductImage';
import { getAllProductsFromDB } from '@/actions/productActions';
import type { Product } from '@/types';
import { useEffect, useState } from 'react';
import Autoplay from "embla-carousel-autoplay"
import { useCurrency } from '@/contexts/CurrencyContext';

export function HeroSection() {
    const [newArrivals, setNewArrivals] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { formatPrice } = useCurrency();

    useEffect(() => {
        const fetchNewArrivals = async () => {
            setIsLoading(true);
            const result = await getAllProductsFromDB();
            if ('error' in result) {
                console.error(result.error);
                setNewArrivals([]);
            } else {
                // Get the 5 most recent products
                setNewArrivals(result.slice(0, 5));
            }
            setIsLoading(false);
        };
        fetchNewArrivals();
    }, []);

  return (
    <section className="w-full py-12 md:py-16 lg:py-20 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-headline">
                New Arrivals
            </h2>
            <p className="text-lg mb-8 text-muted-foreground max-w-2xl mx-auto">
                Check out the latest unique styles from our independent designers. Fresh looks updated daily.
            </p>
        </div>
      <div className="container mx-auto flex justify-center">
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        plugins={[
            Autoplay({
              delay: 3000,
              stopOnInteraction: true,
            }),
        ]}
        className="w-full max-w-xs sm:max-w-xl md:max-w-3xl lg:max-w-5xl"
      >
        <CarouselContent>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                    <div className="p-1">
                        <Card className="shadow-md">
                            <CardContent className="flex flex-col items-center justify-center p-6 aspect-[4/5] bg-muted rounded-lg animate-pulse">
                            </CardContent>
                        </Card>
                    </div>
                </CarouselItem>
            ))
          ) : (
            newArrivals.map((product) => {
                const aiHintForImage = `${product.category.toLowerCase()} ${product.name.split(' ').slice(0,1).join(' ').toLowerCase()}`;
                return (
                    <CarouselItem key={product.id} className="md:basis-1/2 lg:basis-1/3">
                        <div className="p-1">
                        <Link href={`/products/${product.id}`}>
                            <Card className="overflow-hidden group shadow-lg rounded-xl transform transition-transform duration-300 hover:scale-105">
                                <CardContent className="relative flex flex-col items-center justify-center p-0">
                                    <ProductImage 
                                        src={product.imageUrl}
                                        alt={product.name}
                                        width={400}
                                        height={500}
                                        className="w-full h-auto aspect-[4/5] object-cover"
                                        aiHint={aiHintForImage}
                                    />
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300" />
                                    <div className="absolute bottom-4 left-4 right-4 text-white p-4 bg-black/50 rounded-lg backdrop-blur-sm">
                                        <h3 className="font-bold text-lg truncate">{product.name}</h3>
                                        <p className="text-primary font-semibold">{formatPrice(product.price)}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        </div>
                    </CarouselItem>
                )
            })
          )}
        </CarouselContent>
        <CarouselPrevious className="hidden sm:flex" />
        <CarouselNext className="hidden sm:flex" />
      </Carousel>
      </div>
       <div className="container mx-auto text-center mt-8">
            <Button asChild size="lg">
                <Link href="/shop">Shop All New Arrivals</Link>
            </Button>
        </div>
    </section>
  );
}
