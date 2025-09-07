
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Upload, Sparkles, ArrowLeft, AlertTriangle, Shirt, User as UserIcon, ShieldAlert } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { performVirtualTryOn } from '@/actions/tryOnActions';
import type { Product, ProductCategory, ProductSize } from '@/types';
import { ALL_CATEGORIES, ALL_SIZES } from '@/types';
import { ProductImage } from '@/components/products/ProductImage';
import Image from 'next/image';
import { ref, get } from 'firebase/database';
import { rtdb, auth } from '@/lib/firebase/config';
import { onAuthStateChanged, type User } from 'firebase/auth';


export default function AiTryOnPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [product, setProduct] = useState<Product | null>(null);
  const [productError, setProductError] = useState<string | null>(null);
  
  const [userImage, setUserImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  
  const productId = searchParams.get('productId');
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoadingAuth(false);
      if (!user) {
        toast({
          title: "Please Sign Up",
          description: "You need an account to use the AI Virtual Try-On.",
          variant: 'destructive'
        });
        router.push('/signup');
      }
    });
    return () => unsubscribe();
  }, [router, toast]);

  useEffect(() => {
    if (!productId) {
      setProductError("No product was selected. Please go back and choose a product to try on.");
      return;
    }
    
    const fetchProduct = async () => {
      try {
        const productRef = ref(rtdb, `products/${productId}`);
        const snapshot = await get(productRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          // Manually parse and validate to be more robust
          const parsedSizes = Array.isArray(data.sizes) && data.sizes.length > 0
                   ? data.sizes.filter((s: any): s is ProductSize => typeof s === 'string' && ALL_SIZES.includes(s.toUpperCase() as ProductSize)).map(s => s.toUpperCase() as ProductSize)
                   : ['One Size'];

          const parsedProduct: Product = {
            id: snapshot.key as string,
            name: data.name || "Unnamed Product",
            description: data.description || "",
            price: typeof data.price === 'number' ? data.price : 0,
            imageUrl: data.imageUrl || `https://placehold.co/600x800.png`,
            category: (ALL_CATEGORIES.includes(data.category) ? data.category : ALL_CATEGORIES[0]) as ProductCategory,
            sizes: parsedSizes,
            sellerId: data.sellerId || "unknown_seller",
            createdAt: data.createdAt ? new Date(data.createdAt).toISOString() : new Date().toISOString(),
          };

          if (parsedProduct.name === "Unnamed Product") {
              setProductError(`Product data for ID ${productId} is invalid or incomplete.`);
          } else {
              setProduct(parsedProduct);
          }
        } else {
          setProductError(`Could not find the product with ID: ${productId}.`);
        }
      } catch (err) {
        console.error("Error fetching product from RTDB:", err);
        setProductError("There was an error fetching the product details from the database.");
      }
    };
    
    fetchProduct();
  }, [productId]);


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError("Please select an image file.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        setUserImage(e.target?.result as string);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!userImage || !product?.imageUrl) {
        setError("Missing user photo or product image.");
        return;
    }
    setIsGenerating(true);
    setError(null);
    setGeneratedImage(null);
    
    toast({ title: "AI Generation In Progress...", description: "Our AI is creating your virtual try-on. This might take a moment!" });

    const result = await performVirtualTryOn({
      userImage: userImage,
      productImage: product.imageUrl,
      productName: product.name,
      productCategory: product.category,
    });

    if ('error' in result) {
      setError(result.error);
      toast({ title: "Generation Failed", description: result.error, variant: 'destructive' });
    } else {
      setGeneratedImage(result.generatedImage);
       toast({ title: "Success!", description: "Your virtual try-on is ready." });
    }
    setIsGenerating(false);
  };
  
  const UploadPlaceholder = ({ icon: Icon, title, description, onClick }: { icon: React.ElementType, title: string, description: string, onClick?: () => void }) => (
    <div 
        className="relative w-full aspect-[3/4] max-w-sm mx-auto rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/50 flex flex-col items-center justify-center cursor-pointer hover:bg-muted transition-colors text-center p-4"
        onClick={onClick}
    >
        <Icon className="h-12 w-12 text-muted-foreground mb-2" />
        <h3 className="font-semibold text-foreground text-lg">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );

  if (loadingAuth) {
    return (
      <div className="container mx-auto flex min-h-[calc(100vh-10rem)] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">Verifying access...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
       <div className="container mx-auto flex min-h-[calc(100vh-10rem)] items-center justify-center text-center">
        <div>
          <ShieldAlert className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground mt-2">Redirecting you to the signup page...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 md:py-12">
        <div className="text-center mb-10">
            <Sparkles className="mx-auto h-16 w-16 text-primary mb-4" />
            <h1 className="text-4xl font-headline font-bold mb-3">AI Virtual Try-On</h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">See how our clothes look on you before you buy. Upload a clear, front-facing photo of yourself for the best results.</p>
        </div>

        <div className="max-w-5xl mx-auto space-y-8">
            {productError ? (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        {productError} 
                        <Button variant="link" onClick={() => router.back()} className="p-0 h-auto ml-2">Go Back</Button>
                    </AlertDescription>
                </Alert>
            ) : !product ? (
                <div className="text-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : (
                <>
                  <Card className="shadow-lg rounded-xl">
                      <CardHeader>
                          <CardTitle>Step 1: Prepare Your Images</CardTitle>
                          <CardDescription>Upload your photo to see it with the selected product.</CardDescription>
                      </CardHeader>
                      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                          
                          {/* User Image Uploader */}
                          <div className="flex flex-col items-center gap-2">
                              {userImage ? (
                                <>
                                  <Image src={userImage} alt="Your uploaded photo" width={400} height={533} className="rounded-lg border object-cover aspect-[3/4]" />
                                  <Button variant="outline" onClick={() => setUserImage(null)}>Choose Another Photo</Button>
                                </>
                                
                              ) : (
                                <>
                                  <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    onChange={handleFileChange} 
                                    className="hidden" 
                                    accept="image/*"
                                  />
                                  <UploadPlaceholder 
                                    icon={UserIcon}
                                    title="Upload Your Photo"
                                    description="Click here to upload an image of yourself."
                                    onClick={() => fileInputRef.current?.click()}
                                  />
                                </>
                              )}
                          </div>
                          
                          {/* Product Image Display */}
                          <div className="flex flex-col items-center gap-2">
                            <div className="relative w-full aspect-[3/4] max-w-sm mx-auto rounded-lg border-2 border-muted-foreground/30 bg-muted/50 flex flex-col items-center justify-center text-center p-4">
                                <ProductImage src={product.imageUrl} alt={product.name} width={400} height={533} className="rounded-lg object-cover" />
                            </div>
                             <h3 className="font-semibold text-lg mt-2">{product.name}</h3>
                          </div>
                      </CardContent>
                  </Card>

                  <Card className="shadow-lg rounded-xl text-center">
                    <CardHeader>
                        <CardTitle>Step 2: Generate Your Try-On</CardTitle>
                        <CardDescription>You're all set! Click generate to see the magic happen.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <Button size="lg" onClick={handleGenerate} disabled={isGenerating || !userImage}>
                            {isGenerating ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
                            {isGenerating ? 'Generating...' : 'Generate Try-On'}
                        </Button>
                        {!userImage && <p className="text-sm text-muted-foreground mt-2">Please upload your photo to enable generation.</p>}
                    </CardContent>
                  </Card>


                  {error && (
                      <Alert variant="destructive" className="mt-8">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertTitle>Generation Failed</AlertTitle>
                          <AlertDescription>{error}</AlertDescription>
                      </Alert>
                  )}

                  {generatedImage && (
                      <Card className="mt-8 shadow-xl rounded-xl">
                          <CardHeader className="text-center">
                              <CardTitle className="text-3xl font-headline">Your Virtual Try-On!</CardTitle>
                          </CardHeader>
                          <CardContent className="flex flex-col items-center">
                              <Image src={generatedImage} alt="AI Generated Try-on" width={512} height={512} className="rounded-lg border shadow-md" />
                               <div className="mt-6 flex gap-4">
                                  <Button size="lg" onClick={() => { setGeneratedImage(null); setUserImage(null); }}>
                                    <Sparkles className="mr-2 h-5 w-5" />
                                    Start Over
                                  </Button>
                                  <Button size="lg" variant="outline" asChild>
                                      <a href={generatedImage} download="fashion-frenzy-try-on.png">Download Image</a>
                                  </Button>
                              </div>
                          </CardContent>
                      </Card>
                  )}
                </>
            )}
            
            <div className="text-center mt-8">
                 <Button variant="outline" onClick={() => router.push('/shop')}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Shop
                 </Button>
            </div>
        </div>
    </div>
  );
}
