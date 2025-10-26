
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
}

export function ProductCard({ 
  product, 
}: ProductCardProps) {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isWishlisted } = useWishlist();
  const { formatPrice } = useCurrency();
  const router = useRouter();
  const autoplayPlugin = useRef(
    Autoplay({ delay: 2000, stopOnInteraction: true, stopOnMouseEnter: true })
  );

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
  }

  return (
    <Card className="product-card group">
        <CardHeader className="p-0 relative">
          <Link href={`/products/${product.id}`} aria-label={product.name}>
             <div className="product-image-wrapper">
                <ProductImage
                    src={product.imageUrls[0]}
                    alt={`${product.name} image 1`}
                    width={250}
                    height={300} 
                    className="w-full h-full"
                    aiHint={aiHintForImage}
                />
             </div>
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
        <CardContent className="flex-grow p-3 text-center">
          <Link href={`/products/${product.id}`}>
            <h3 className="font-semibold text-foreground mb-1 text-sm truncate hover:text-primary transition-colors" title={product.name}>{product.name}</h3>
          </Link>
          
          <div className="flex items-baseline gap-2 justify-center">
            <span className="text-primary font-bold text-base">{formatPrice(product.price)}</span>
            {showDiscount && (
              <span className="text-muted-foreground text-xs line-through">{formatPrice(product.originalPrice!)}</span>
            )}
          </div>
          
          {product.sizes && product.sizes.length > 0 && product.sizes[0] !== 'One Size' && (
            <div className="mt-1">
              <span className="text-xs text-muted-foreground">{product.sizes.slice(0, 2).join(' / ')}</span>
            </div>
          )}
        </CardContent>
        <CardFooter className="mt-auto p-2 pt-0 grid grid-cols-1 gap-2">
           <Button size="sm" onClick={handleAddToCart} className={cn("w-full text-white text-xs", isOutOfStock ? "bg-red-500 hover:bg-red-600" : "bg-green-600 hover:bg-green-700")} disabled={isOutOfStock}>
              <ShoppingCart size={14} className="mr-2" />
              {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            </Button>
        </CardFooter>
    </Card>
  );
}
