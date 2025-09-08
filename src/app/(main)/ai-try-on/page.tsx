
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Upload, Sparkles, ArrowLeft, AlertTriangle, User as UserIcon, ShieldAlert, ServerCrash, Gem } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { performVirtualTryOn } from '@/actions/tryOnActions';
import type { Product } from '@/types';
import { ProductImage } from '@/components/products/ProductImage';
import Image from 'next/image';
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase/config';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { Progress } from '@/components/ui/progress';
import { getProductFromDB } from '@/actions/productActions';

const TRY_ON_LIMIT = 4;

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

export default function AiTryOnPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [product, setProduct] = useState<Product | null>(null);
  const [productError, setProductError] = useState<React.ReactNode | null>(null);
  
  const [userImage, setUserImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  const [availableCredits, setAvailableCredits] = useState(0);
  
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
      } else {
        const fetchCredits = async () => {
            const userCreditsRef = doc(db, `userCredits/${user.uid}`);
            const docSnap = await getDoc(userCreditsRef);
            if (docSnap.exists()) {
                setAvailableCredits(docSnap.data().credits || 0);
            } else {
                // If user has no record, they are new. Give them credits.
                await setDoc(userCreditsRef, { credits: TRY_ON_LIMIT });
                setAvailableCredits(TRY_ON_LIMIT);
            }
        };
        fetchCredits();
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
        const result = await getProductFromDB(productId);
        if (result && 'error' in result) {
            if (result.error.includes('permission-denied') || result.error.includes('PERMISSION_DENIED')) {
                const permissionError = (
                    <>
                        Your database security rules are blocking access. Update your <strong>Firestore rules</strong> in Firebase to allow public read access for products.
                        <br /><br />
                        <strong>Recommended rules:</strong>
                        <pre className="mt-2 p-2 bg-gray-800 text-white rounded-md text-xs whitespace-pre-wrap">{recommendedDbRules}</pre>
                    </>
                );
                setProductError(permissionError);
            } else {
                 setProductError("There was an error fetching the product details from the database.");
            }
        } else if (result) {
            if ((result as Product).name === "Unnamed Product") {
              setProductError(`Product data for ID ${productId} is invalid or incomplete.`);
            } else {
              setProduct(result as Product);
            }
        } else {
            setProductError(`Could not find the product with ID: ${productId}.`);
        }
      } catch (err: any) {
        console.error("Error fetching product:", err);
        setProductError("An unexpected error occurred while fetching product details.");
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
    if (!userImage || !product?.imageUrl || !currentUser) {
        setError("Missing user photo, product image, or user session.");
        return;
    }
     if (availableCredits <= 0) {
      setError("You have no more virtual try-on credits.");
      toast({ title: "No Credits Left", description: "You cannot generate more try-ons.", variant: 'destructive' });
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedImage(null);
    
    toast({ title: "AI Generation In Progress...", description: "Our AI is creating your virtual try-on. This might take a moment!" });

    try {
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

            // Decrement credits on success
            const userCreditsRef = doc(db, `userCredits/${currentUser.uid}`);
            await updateDoc(userCreditsRef, { credits: increment(-1) });
            setAvailableCredits(prev => Math.max(0, prev - 1));
        }

    } catch(e) {
        setError("An unexpected error occurred during generation.");
        toast({ title: "Generation Failed", description: "Please try again later.", variant: 'destructive' });
    } finally {
        setIsGenerating(false);
    }
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

  const hasReachedLimit = availableCredits <= 0;

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
          <ShieldAlert className="h-16 w-16 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold">You need to be logged in to use this feature.</h1>
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
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">See how our jewelry looks on you before you buy. Upload a clear, front-facing photo of yourself for the best results.</p>
        </div>

        <div className="max-w-5xl mx-auto space-y-8">
             <Card className="shadow-lg rounded-xl">
              <CardHeader>
                <CardTitle>Your Try-On Credits</CardTitle>
                <CardDescription>Each new account starts with {TRY_ON_LIMIT} free virtual try-ons. Place an order to reset them!</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                    <Progress value={(availableCredits / TRY_ON_LIMIT) * 100} className="w-full" />
                    <p className="text-sm text-muted-foreground text-center">
                        You have {availableCredits} of {TRY_ON_LIMIT} try-on credits remaining.
                    </p>
                </div>
              </CardContent>
            </Card>

            {productError ? (
                <Alert variant="destructive" className="text-left">
                    <ServerCrash className="h-4 w-4" />
                    <AlertTitle>Error Loading Product</AlertTitle>
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
                          <CardDescription>Upload your photo to see it with the selected piece.</CardDescription>
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
                         <Button size="lg" onClick={handleGenerate} disabled={isGenerating || !userImage || hasReachedLimit}>
                            {isGenerating ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
                            {isGenerating ? 'Generating...' : hasReachedLimit ? 'No Credits Left' : `Generate Try-On (${availableCredits} left)`}
                        </Button>
                        {!userImage && <p className="text-sm text-muted-foreground mt-2">Please upload your photo to enable generation.</p>}
                        {hasReachedLimit && !isGenerating && <p className="text-sm text-destructive mt-2">You have used all your try-on credits. Place an order to get more!</p>}
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
                                      <a href={generatedImage} download="dazelle-try-on.png">Download Image</a>
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
