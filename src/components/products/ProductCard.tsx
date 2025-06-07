"use client";

import Link from 'next/link';
import type { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Heart, ShoppingCart } from 'lucide-react';
import { ProductImage } from './ProductImage';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isWishlisted } = useWishlist();

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent link navigation when clicking wishlist button
    e.stopPropagation();
    if (isWishlisted(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent link navigation
    e.stopPropagation();
    addToCart(product);
  };
  
  const aiHintForImage = `${product.category.toLowerCase()} ${product.name.split(' ').slice(0,1).join(' ').toLowerCase()}`;

  return (
    <Card className="group flex h-full flex-col overflow-hidden rounded-lg shadow-md transition-shadow hover:shadow-xl">
      <Link href={`/products/${product.id}`} className="flex flex-col h-full">
        <CardHeader className="p-0">
          <ProductImage
            src={product.imageUrl}
            alt={product.name}
            width={300}
            height={400} // Adjusted for a more typical fashion image aspect ratio
            className="w-full h-auto aspect-[3/4]"
            aiHint={aiHintForImage}
          />
        </CardHeader>
        <CardContent className="flex-grow p-4">
          <CardTitle className="mb-1 text-lg font-headline truncate" title={product.name}>{product.name}</CardTitle>
          <CardDescription className="mb-2 text-sm text-muted-foreground">{product.category}</CardDescription>
          <p className="text-lg font-semibold text-primary">${product.price.toFixed(2)}</p>
        </CardContent>
        <CardFooter className="mt-auto p-4 pt-0">
          <div className="flex w-full items-center justify-between space-x-2">
            <Button size="sm" onClick={handleAddToCart} className="flex-grow">
              <ShoppingCart size={16} className="mr-2" />
              Add to Cart
            </Button>
            <Button
              size="icon"
              variant="outline"
              onClick={handleWishlistToggle}
              aria-label={isWishlisted(product.id) ? "Remove from wishlist" : "Add to wishlist"}
              className={cn(isWishlisted(product.id) ? "text-primary border-primary hover:bg-primary/10" : "")}
            >
              <Heart size={16} fill={isWishlisted(product.id) ? "currentColor" : "none"} />
            </Button>
          </div>
        </CardFooter>
      </Link>
    </Card>
  );
}
