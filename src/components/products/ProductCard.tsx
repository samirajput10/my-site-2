
"use client";

import Link from 'next/link';
import type { Product } from '@/types';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, ShoppingCart, Star, Camera } from 'lucide-react';
import { ProductImage } from './ProductImage';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge'; 
import { useRouter } from 'next/navigation';
import React, { useEffect, useState, useRef } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"


interface ProductCardProps {
  product: Product;
  discount?: string; 
  status?: "New" | "Last 2!" | string;
  rating?: number;
  reviewCount?: number;
  brandName?: string;
  secondaryInfo?: string;
}

export function ProductCard({ 
  product, 
  discount, 
  status, 
  rating = 0,
  reviewCount = 0,
  brandName,
  secondaryInfo 
}: ProductCardProps) {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isWishlisted } = useWishlist();
  const { formatPrice } = useCurrency();
  const router = useRouter();
  const autoplayPlugin = useRef(
    Autoplay({ delay: 2000, stopOnInteraction: true, stopOnMouseEnter: true })
  );

  const [currentUser, setCurrentUser] = useState<User | null>(null);

   useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribeAuth();
  }, []);

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation();
    if (isWishlisted(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation();
    addToCart(product);
  };
  
  const aiHintForImage = `${product.category.toLowerCase()} ${product.name.split(' ').slice(0,1).join(' ').toLowerCase()}`;
  const isOutOfStock = product.stock <= 0;

  const showDiscount = product.originalPrice && product.originalPrice > product.price;
  const calculatedDiscount = showDiscount ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100) : 0;

  let displayBadge: React.ReactNode = null;
  if (isOutOfStock) {
    displayBadge = <Badge variant="destructive" className="absolute top-2 left-2 text-xs px-2 py-1 z-10">Out of Stock</Badge>;
  } else if (showDiscount) {
    displayBadge = <Badge className="absolute top-2 left-2 text-xs px-2 py-1 z-10 bg-green-600 text-white hover:bg-green-700">{calculatedDiscount}% OFF</Badge>;
  } else if (status === "New") {
    displayBadge = <Badge variant="secondary" className="absolute top-2 left-2 text-xs px-2 py-1 bg-green-600 text-white z-10">{status}</Badge>;
  } else if (status) {
    displayBadge = <Badge variant="destructive" className="absolute top-2 left-2 text-xs px-2 py-1 z-10">{status}</Badge>;
  }

  return (
    <Card className="group flex flex-col overflow-hidden rounded-lg bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
        <CardHeader className="p-0 relative">
          <Link href={`/products/${product.id}`} aria-label={product.name}>
             <Carousel 
                plugins={[autoplayPlugin.current]}
                className="w-full"
                opts={{ align: "start", loop: true, }}
              >
              <CarouselContent>
                {product.imageUrls && product.imageUrls.length > 0 ? (
                  product.imageUrls.map((url, index) => (
                    <CarouselItem key={index}>
                      <ProductImage
                        src={url}
                        alt={`${product.name} image ${index + 1}`}
                        width={240}
                        height={320} 
                        className="w-full h-auto aspect-[3/4] transition-transform duration-300 group-hover:scale-105"
                        aiHint={aiHintForImage}
                      />
                    </CarouselItem>
                  ))
                ) : (
                   <CarouselItem>
                      <ProductImage
                        src={`https://placehold.co/240x320.png`}
                        alt={product.name}
                        width={240}
                        height={320} 
                        className="w-full h-auto aspect-[3/4] transition-transform duration-300 group-hover:scale-105"
                        aiHint={aiHintForImage}
                      />
                    </CarouselItem>
                )}
              </CarouselContent>
            </Carousel>
          </Link>
          {displayBadge}
          
          <div className="absolute top-2 right-2 flex flex-col gap-2 z-10">
            <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleWishlistToggle}
                className={cn(
                "h-auto p-1.5 rounded-full bg-card/70 hover:bg-card text-muted-foreground hover:text-primary",
                isWishlisted(product.id) && "text-primary bg-primary/10 hover:bg-primary/20"
                )}
                aria-label={isWishlisted(product.id) ? "Remove from wishlist" : "Add to wishlist"}
            >
                <Heart className="h-5 w-5" fill={isWishlisted(product.id) ? "currentColor" : "none"} />
            </Button>
          </div>

        </CardHeader>
        <CardContent className="flex-grow p-4">
          <Link href={`/products/${product.id}`}>
            <h3 className="font-semibold text-foreground mb-1 text-base truncate hover:text-primary transition-colors" title={product.name}>{product.name}</h3>
          </Link>
          
          {rating > 0 && (
            <div className="flex items-center mb-2">
              <div className="flex text-yellow-400 text-sm">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={cn("h-4 w-4", i < Math.floor(rating) ? "fill-current" : (i < rating ? "fill-current opacity-50" : "fill-transparent stroke-current"))} />
                ))}
              </div>
              {reviewCount > 0 && <span className="text-muted-foreground text-xs ml-1">({reviewCount})</span>}
            </div>
          )}

          <div className="flex items-baseline gap-2">
            <span className="text-primary font-bold text-lg">{formatPrice(product.price)}</span>
            {showDiscount && (
              <span className="text-muted-foreground text-sm line-through">{formatPrice(product.originalPrice!)}</span>
            )}
          </div>

          {brandName && <p className="text-xs text-muted-foreground mt-1">From "{brandName}"</p>}
          {secondaryInfo && <p className="text-xs text-muted-foreground mt-1">{secondaryInfo}</p>}
          
          {product.sizes && product.sizes.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {product.sizes.slice(0, 4).map(size => ( // Show max 4 sizes
                <Badge key={size} variant="outline" className="text-xs px-1.5 py-0.5">{size}</Badge>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="mt-auto p-4 pt-0 grid grid-cols-1 gap-2">
           <Button size="sm" onClick={handleAddToCart} className={cn("w-full text-white", isOutOfStock ? "bg-red-500 hover:bg-red-600" : "bg-green-600 hover:bg-green-700")} disabled={isOutOfStock}>
              <ShoppingCart size={16} className="mr-2" />
              {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            </Button>
        </CardFooter>
    </Card>
  );
}
