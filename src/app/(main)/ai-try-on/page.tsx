
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Upload, Sparkles, ArrowLeft, AlertTriangle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { getProductById } from '@/data/products';
import { performVirtualTryOn } from '@/actions/tryOnActions';
import type { Product } from '@/types';
import { ProductImage } from '@/components/products/ProductImage';
import Image from 'next/image';

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
  
  const productId = searchParams.get('productId');

  useEffect(() => {
    if (!productId) {
      setProductError("No product was selected. Please go back and choose a product to try on.");
      return;
    }
    const foundProduct = getProductById(productId);
    if (!foundProduct) {
        setProductError(`Could not find the product with ID: ${productId}.`);
    } else {
        setProduct(foundProduct);
    }
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
  
  const UploadView = () => (
    <Card className="shadow-lg rounded-xl text-center">
        <CardHeader>
            <CardTitle>Step 1: Upload Your Photo</CardTitle>
            <CardDescription>Choose a clear, well-lit photo of yourself for the best result.</CardDescription>
        </CardHeader>
        <CardContent>
            <div 
              className="relative w-full max-w-md mx-auto aspect-video rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/50 flex flex-col items-center justify-center cursor-pointer hover:bg-muted transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*"
              />
              <Upload className="h-12 w-12 text-muted-foreground mb-2" />
              <p className="font-semibold text-foreground">Click to upload an image</p>
              <p className="text-sm text-muted-foreground">PNG, JPG, or WEBP</p>
            </div>
        </CardContent>
    </Card>
  );

  const GenerationView = () => (
     <Card className="shadow-lg rounded-xl">
        <CardHeader>
            <CardTitle>Step 2: Generate Your Try-On</CardTitle>
            <CardDescription>You're all set! Click generate to see the magic happen.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="text-center space-y-3">
                <h3 className="font-semibold text-lg">Your Photo</h3>
                {userImage && <Image src={userImage} alt="Your uploaded photo" width={400} height={300} className="rounded-lg mx-auto border object-cover" />}
                <Button variant="outline" onClick={() => setUserImage(null)}>Choose Another</Button>
            </div>
            <div className="text-center space-y-3">
                <h3 className="font-semibold text-lg">Product</h3>
                {product && <ProductImage src={product.imageUrl} alt={product.name} width={400} height={300} className="rounded-lg mx-auto" />}
            </div>
        </CardContent>
        <div className="p-6 pt-0 text-center">
            <Button size="lg" onClick={handleGenerate} disabled={isGenerating}>
                {isGenerating ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
                {isGenerating ? 'Generating...' : 'Generate Try-On'}
            </Button>
        </div>
    </Card>
  );

  return (
    <div className="container mx-auto py-8 md:py-12">
        <div className="text-center mb-10">
            <Sparkles className="mx-auto h-16 w-16 text-primary mb-4" />
            <h1 className="text-4xl font-headline font-bold mb-3">AI Virtual Try-On</h1>
            <p className="text-lg text-muted-foreground">See how our clothes look on you before you buy.</p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
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
                  {!userImage ? <UploadView /> : <GenerationView />}

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
