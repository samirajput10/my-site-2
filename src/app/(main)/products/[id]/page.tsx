
"use client";

import { useEffect, useState }from 'react';
import { useParams } from 'next/navigation';
import type { Product } from '@/types';
import { ProductImage } from '@/components/products/ProductImage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Heart, ShoppingCart, Loader2, AlertTriangle, Camera, ServerCrash } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import Link from 'next/link';
import { ProductCard } from '@/components/products/ProductCard'; // For related products
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { getAllProductsFromDB, getProductFromDB } from '@/actions/productActions';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


const recommendedDbRules = `{
  "rules": {
    "service cloud.firestore": {
      "match /databases/{database}/documents": {
        // Products can be read by anyone, but only written by authenticated users (admins)
        "match /products/{productId}": {
          "allow read": true;
          "allow write": if request.auth != null;
        },
        // Users can only read/write their own credits document
        "match /userCredits/{userId}": {
          "allow read, write": if request.auth != null && request.auth.uid == userId;
        }
      }
    }
  }
}`;


export default function ProductDetailPage() {
  const params = useParams();
  const id = params.id as string;
  
  const [product, setProduct] = useState<Product | null | undefined>(undefined); // undefined for loading state
  const [error, setError] = useState<React.ReactNode | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isWishlisted } = useWishlist();
  const { formatPrice } = useCurrency();
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [availableCredits, setAvailableCredits] = useState(0);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        const fetchCredits = async () => {
            const userCreditsRef = doc(db, `userCredits/${user.uid}`);
            const docSnap = await getDoc(userCreditsRef);
            if (docSnap.exists()) {
                setAvailableCredits(docSnap.data().credits || 0);
            } else {
                setAvailableCredits(0);
            }
        };
        fetchCredits();
      }
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (id) {
      const fetchProductData = async () => {
        setError(null);
        setProduct(undefined);

        const productResult = await getProductFromDB(id);

        if (productResult && 'error' in productResult) {
            if (productResult.error.includes('permission-denied') || productResult.error.includes('PERMISSION_DENIED')) {
                const permissionError = (
                    <>
                        Your database security rules are blocking access. Update your <strong>Firestore rules</strong> in Firebase to allow public read access.
                        <br /><br />
                        <strong>Recommended rules:</strong>
                        <pre className="mt-2 p-2 bg-gray-800 text-white rounded-md text-xs whitespace-pre-wrap">{recommendedDbRules}</pre>
                    </>
                );
                setError(permissionError);
            } else {
                setError(productResult.error);
            }
          setProduct(null);
          return;
        }
        
        const foundProduct = productResult as Product | null;
        setProduct(foundProduct || null);

        if (!foundProduct) {
          setError("This product could not be found.");
          return;
        }

        if (foundProduct.sizes.length) {
          setSelectedSize(foundProduct.sizes[0]);
        }

        // Fetch related products
        const allProductsResult = await getAllProductsFromDB();
         if (allProductsResult && !('error' in allProductsResult)) {
            const related = allProductsResult
                .filter(p => p.category === foundProduct.category && p.id !== foundProduct.id)
                .slice(0, 4);
            setRelatedProducts(related);
        }
      };
      
      fetchProductData();
    }
  }, [id]);

  if (product === undefined && !error) {
    return (
      <div className="container mx-auto flex min-h-[calc(100vh-10rem)] items-center justify-center py-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error) {
      return (
        <div className="container mx-auto py-12">
             <Alert variant="destructive" className="max-w-2xl mx-auto text-left">
                <ServerCrash className="h-4 w-4" />
                <AlertTitle>Error Loading Product</AlertTitle>
                <AlertDescription>
                    {error}
                </AlertDescription>
            </Alert>
        </div>
      )
  }

  if (!product) {
    return (
      <div className="container mx-auto flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center py-12 text-center">
        <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-3xl font-bold mb-2">Product Not Found</h1>
        <p className="text-muted-foreground mb-6">Sorry, we couldn't find the product you're looking for.</p>
        <Button asChild>
          <Link href="/">Go to Homepage</Link>
        </Button>
      </div>
    );
  }

  const handleWishlistToggle = () => {
    if (isWishlisted(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };
  
  const aiHintForImage = `${product.category.toLowerCase()} ${product.name.split(' ').slice(0,1).join(' ').toLowerCase()}`;
  const hasReachedTryOnLimit = !currentUser || availableCredits <= 0;
  const isOutOfStock = product.stock <= 0;

  return (
    <div className="container mx-auto py-8 md:py-12">
      <Card className="overflow-hidden shadow-xl rounded-xl">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="p-4 md:p-6">
             <ProductImage
              src={product.imageUrls[0].replace('300x450', '600x800')} // Request larger image
              alt={product.name}
              width={600}
              height={800}
              className="w-full h-auto aspect-[3/4] rounded-lg shadow-md"
              priority
              aiHint={aiHintForImage}
            />
          </div>
          <div className="p-6 md:p-8 flex flex-col justify-center">
            <CardHeader className="p-0 mb-4">
              <Badge variant="secondary" className="mb-2 w-fit">{product.category}</Badge>
              <CardTitle className="text-3xl lg:text-4xl font-headline">{product.name}</CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-4">
              <CardDescription className="text-base text-muted-foreground leading-relaxed">
                {product.description}
              </CardDescription>
              <div className="flex items-center gap-4">
                <p className="text-4xl font-bold text-primary">{formatPrice(product.price)}</p>
                {isOutOfStock ? (
                  <Badge variant="destructive" className="text-base">Out of Stock</Badge>
                ) : (
                  <Badge variant="default" className="text-base bg-green-600 hover:bg-green-700">In Stock</Badge>
                )}
              </div>
              
              <Separator />

              <div>
                <h4 className="mb-2 text-sm font-medium text-foreground">Available Sizes:</h4>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map(size => (
                    <Button
                      key={size}
                      variant={selectedSize === size ? 'default' : 'outline'}
                      onClick={() => setSelectedSize(size)}
                      className="text-xs px-3 py-1 h-auto"
                    >
                      {size}
                    </Button>
                  ))}
                </div>
                {!selectedSize && product.sizes.length > 0 && product.sizes[0] !== 'One Size' && (
                  <p className="mt-2 text-sm text-destructive">Please select a size.</p>
                )}
              </div>

              <Separator />

              <div className="flex flex-col gap-3 mt-6">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    size="lg" 
                    onClick={() => addToCart(product)} 
                    className="flex-grow bg-primary hover:bg-primary/90 text-primary-foreground"
                    disabled={isOutOfStock || (!selectedSize && product.sizes.length > 0 && product.sizes[0] !== 'One Size')}
                  >
                    <ShoppingCart size={20} className="mr-2" />
                    {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                  </Button>
                   <Button 
                    size="lg" 
                    variant="outline" 
                    onClick={handleWishlistToggle} 
                    className={cn("flex-grow", isWishlisted(product.id) ? "text-primary border-primary hover:bg-primary/10" : "")}
                  >
                    <Heart size={20} className="mr-2" fill={isWishlisted(product.id) ? "currentColor" : "none"}/>
                    {isWishlisted(product.id) ? 'Wishlisted' : 'Add to Wishlist'}
                  </Button>
                </div>
                 <Link
                    href={`/ai-try-on?productId=${product.id}`}
                    className={cn(
                        buttonVariants({ size: 'lg'}), 
                        "w-full bg-primary hover:bg-primary/90 text-primary-foreground",
                        (hasReachedTryOnLimit || isOutOfStock) && "bg-muted hover:bg-muted text-muted-foreground cursor-not-allowed"
                    )}
                    aria-disabled={hasReachedTryOnLimit || isOutOfStock}
                    onClick={(e) => (hasReachedTryOnLimit || isOutOfStock) && e.preventDefault()}
                  >
                    <Camera size={20} className="mr-2" />
                     {isOutOfStock ? 'Unavailable for Try-On' : hasReachedTryOnLimit ? `No Credits Left` : `Try On Yourself (${availableCredits} left)`}
                  </Link>
                   {!currentUser && (
                    <p className="text-xs text-center text-muted-foreground">
                      <Link href="/login" className="underline">Log in</Link> to use the AI Try-On feature.
                    </p>
                  )}
              </div>
            </CardContent>
          </div>
        </div>
      </Card>

      {relatedProducts.length > 0 && (
        <div className="mt-12 md:mt-16">
          <h2 className="text-2xl md:text-3xl font-headline font-semibold mb-6 text-center">You Might Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map(relatedProduct => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
