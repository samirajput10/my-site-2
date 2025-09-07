
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Camera, Sparkles, ArrowLeft, AlertTriangle } from 'lucide-react';
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

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [product, setProduct] = useState<Product | null>(null);
  const [productError, setProductError] = useState<string | null>(null);
  
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
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

  useEffect(() => {
    const getCameraPermission = async () => {
      if (typeof window !== 'undefined' && 'mediaDevices' in navigator) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          setHasCameraPermission(true);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (err) {
          console.error('Error accessing camera:', err);
          setHasCameraPermission(false);
        }
      } else {
        setHasCameraPermission(false);
      }
    };
    getCameraPermission();
  }, []);

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
      }
    }
  };

  const handleGenerate = async () => {
    if (!capturedImage || !product?.imageUrl) {
        setError("Missing user photo or product image.");
        return;
    }
    setIsGenerating(true);
    setError(null);
    setGeneratedImage(null);
    
    toast({ title: "AI Generation In Progress...", description: "Our AI is creating your virtual try-on. This might take a moment!" });

    const result = await performVirtualTryOn({
      userImage: capturedImage,
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
  
  const CameraView = () => (
    <Card className="shadow-lg rounded-xl text-center">
        <CardHeader>
            <CardTitle>Step 1: Take Your Photo</CardTitle>
            <CardDescription>Position yourself in good lighting for the best result.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="relative w-full max-w-md mx-auto aspect-video rounded-lg overflow-hidden bg-muted border">
                <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                {hasCameraPermission === false && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white p-4">
                        <AlertTriangle className="h-8 w-8 mb-2"/>
                        <p className="font-semibold">Camera Access Denied</p>
                        <p className="text-sm text-center">Please enable camera permissions in your browser settings to use this feature.</p>
                    </div>
                )}
            </div>
        </CardContent>
        <div className="p-6 pt-0">
            <Button size="lg" onClick={captureImage} disabled={hasCameraPermission !== true}>
                <Camera className="mr-2 h-5 w-5" />
                Capture Photo
            </Button>
        </div>
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
                {capturedImage && <Image src={capturedImage} alt="Your captured photo" width={400} height={300} className="rounded-lg mx-auto border" />}
                <Button variant="outline" onClick={() => setCapturedImage(null)}>Retake Photo</Button>
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
        <canvas ref={canvasRef} className="hidden"></canvas>
        
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
                  {!capturedImage ? <CameraView /> : <GenerationView />}

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
                                  <Button size="lg" onClick={() => setGeneratedImage(null)}>
                                    <Sparkles className="mr-2 h-5 w-5" />
                                    Try Another
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
