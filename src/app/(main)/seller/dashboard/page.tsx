
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { ref as dbRef, set, serverTimestamp, query, orderByChild, get, remove, push } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { LayoutDashboard, PlusCircle, Package, Loader2, AlertTriangle, ShieldAlert, ListChecks, Trash2, DollarSign, BarChart2, ServerCrash } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { auth, rtdb, storage } from '@/lib/firebase/config';
import type { Product, ProductCategory, ProductSize } from '@/types';
import { ALL_CATEGORIES, ALL_SIZES } from '@/types';
import { useCurrency } from '@/contexts/CurrencyContext';
import Image from 'next/image';
import { getAllProductsFromDB } from '@/actions/productActions';

interface NewProductForm {
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  category: string;
  sizes: string;
}

const recommendedDbRules = `{
  "rules": {
    "products": {
      ".read": "true",
      // Only authenticated users (admins) can write
      ".write": "auth != null",
       // Index for efficient querying by creation date
      ".indexOn": "createdAt"
    },
    "userTryOnCounts": {
      "$uid": {
        // Users can only read/write their own try-on count
        ".read": "auth != null && auth.uid === $uid",
        ".write": "auth != null && auth.uid === $uid"
      }
    }
  }
}`;

export default function AdminPanelPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { formatPrice } = useCurrency();
  
  const [formState, setFormState] = useState<NewProductForm>({
    name: '', description: '', price: '', imageUrl: '', category: '', sizes: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentUser, setCurrentUser] = useState<User | { uid: string } | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [listingLoading, setListingLoading] = useState(true);
  const [listingError, setListingError] = useState<string | null>(null);

  const [isDeleting, setIsDeleting] = useState(false);
  const [productToDeleteId, setProductToDeleteId] = useState<string | null>(null);

  const fetchAllProducts = useCallback(async () => {
    setListingLoading(true);
    setListingError(null);
    try {
      const result = await getAllProductsFromDB();
      if ('error' in result) {
         if (result.error.includes('permission-denied') || result.error.includes('PERMISSION_DENIED')) {
            const permissionError = (
                <>
                    Your database security rules are blocking access.
                    <br />
                    Please update your Realtime Database rules in the Firebase Console to allow access.
                    <br />
                    <strong>Recommended rules for development:</strong>
                    <pre className="mt-2 p-2 bg-gray-800 text-white rounded-md text-xs whitespace-pre-wrap">{recommendedDbRules}</pre>
                </>
            );
             setListingError(permissionError as any);
        } else {
            setListingError(result.error);
        }
        setAllProducts([]);
      } else {
        setAllProducts(result);
      }
    } catch (error: any) {
      console.error("Error fetching all products:", error);
      const userMessage = "Failed to load products. Check your network or Firebase configuration.";
      setListingError(userMessage);
      toast({ title: "Error", description: userMessage, variant: "destructive" });
    } finally {
      setListingLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const mockAdminSession = sessionStorage.getItem('loggedInUser');
    if (mockAdminSession) {
        const adminUser = JSON.parse(mockAdminSession);
        setCurrentUser(adminUser);
        setIsAdmin(true);
        setLoadingAuth(false);
        fetchAllProducts(); 
        return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        // For this demo, we assume the logged in user via Firebase is a regular user, not admin
        // The admin flow is handled by the mock session logic above.
        setIsAdmin(false); 
      } else {
        setIsAdmin(false);
        router.push('/login');
      }
      setLoadingAuth(false);
    });

    return () => unsubscribe();
  }, [fetchAllProducts, router]);


  useEffect(() => {
    if (imageFile) {
      const objectUrl = URL.createObjectURL(imageFile);
      setPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else if (formState.imageUrl) {
        setPreviewUrl(formState.imageUrl);
    } else {
        setPreviewUrl(null);
    }
  }, [imageFile, formState.imageUrl]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
    if (name === 'imageUrl' && value) {
      setImageFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
      setFormState(prev => ({ ...prev, imageUrl: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!formState.name || !formState.price || !formState.category || !formState.sizes) {
      toast({ title: "Missing Fields", description: "Please fill all required fields.", variant: "destructive" });
      return;
    }
    
    setIsSubmitting(true);
    try {
      let finalImageUrl = formState.imageUrl;

      if (imageFile) {
        toast({ title: "Uploading Image...", description: "Your image is being uploaded to secure storage." });
        const sRef = storageRef(storage, `products/${currentUser.uid}/${Date.now()}_${imageFile.name}`);
        const uploadTask = await uploadBytes(sRef, imageFile);
        finalImageUrl = await getDownloadURL(uploadTask.ref);
        toast({ title: "Image Upload Complete!", description: "A link to your image has been generated." });
      }
      
      if (!finalImageUrl) {
        toast({ title: "Image Error", description: "Please provide an image by uploading or entering a URL.", variant: "destructive" });
        setIsSubmitting(false);
        return;
      }

      const productsListRef = dbRef(rtdb, 'products');
      const newProductRef = push(productsListRef);

      const parsedSizes = formState.sizes.split(',')
        .map(s => s.trim().toUpperCase())
        .filter(s => ALL_SIZES.includes(s as ProductSize));
      
      if (parsedSizes.length === 0 && formState.sizes.trim() !== '') {
          toast({ title: "Invalid Sizes", description: `Please use valid, comma-separated sizes from: ${ALL_SIZES.join(', ')}`, variant: "destructive" });
          setIsSubmitting(false);
          return;
      }

      const newProductData = {
        name: formState.name,
        description: formState.description,
        price: parseFloat(formState.price),
        imageUrl: finalImageUrl,
        category: formState.category as ProductCategory,
        sizes: parsedSizes.length > 0 ? parsedSizes : ['One Size'],
        sellerId: currentUser.uid,
        createdAt: serverTimestamp(),
      };

      await set(newProductRef, newProductData);
      
      toast({ title: "Product Added", description: `Your product has been successfully listed.` });
      setFormState({ name: '', description: '', price: '', imageUrl: '', category: '', sizes: '' });
      setImageFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      fetchAllProducts();

    } catch (error: any) {
      console.error("Error adding product:", error);
      let errorMessage = "Failed to add product. Please try again.";
      if (error.code) {
        switch (error.code) {
          case 'storage/unauthorized':
            errorMessage = "Image upload failed. You don't have permission. Please check your Firebase Storage security rules.";
            break;
          case 'storage/canceled':
            errorMessage = "Image upload was canceled.";
            break;
          case 'storage/unknown':
            errorMessage = "An unknown error occurred during image upload. Please check your network and Firebase configuration.";
            break;
          case 'permission-denied':
             errorMessage = "Permission denied. Check your Realtime Database security rules to ensure you have write access.";
             break;
        }
      }
      toast({ title: "Failed to Add Product", description: errorMessage, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!currentUser) return;
    setIsDeleting(true);
    try {
      await remove(dbRef(rtdb, `products/${productId}`));
      toast({ title: "Product Deleted" });
      setAllProducts(prev => prev.filter(p => p.id !== productId));
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({ title: "Deletion Failed", description: "Could not delete product. Check database rules.", variant: "destructive" });
    } finally {
      setIsDeleting(false);
      setProductToDeleteId(null);
    }
  };

  if (loadingAuth) {
    return (
      <div className="container mx-auto flex min-h-[calc(100vh-10rem)] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">Verifying access...</p>
      </div>
    );
  }

  if (isAdmin === false) { 
    return (
      <div className="container mx-auto flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center text-center">
        <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-3xl font-bold mb-2">Access Denied</h1>
        <p className="text-muted-foreground mb-6">You do not have permission to view this page.</p>
        <Button onClick={() => router.push('/')} size="lg">Go to Homepage</Button>
      </div>
    );
  }
  
  if (isAdmin === null || !currentUser) {
      return (
        <div className="container mx-auto flex min-h-[calc(100vh-10rem)] items-center justify-center">
            <ShieldAlert className="h-16 w-16 text-destructive" />
            <p className="ml-4 text-lg text-muted-foreground">Redirecting to login...</p>
        </div>
      );
  }

  return (
    <div className="container mx-auto py-8 md:py-12">
      <div className="text-center mb-10">
        <LayoutDashboard className="mx-auto h-16 w-16 text-primary mb-4" />
        <h1 className="text-4xl font-headline font-bold mb-3">Admin Panel</h1>
        <p className="text-lg text-muted-foreground">Manage all products on the platform.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <Card className="shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="text-xl flex items-center"><Package className="mr-2 h-5 w-5"/>Product Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-secondary/50 rounded-md">
              <span className="font-medium">Total Products</span>
              <span className="text-primary font-bold text-lg">{listingLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : allProducts.length}</span>
            </div>
             <div className="flex justify-between items-center p-3 bg-secondary/50 rounded-md">
              <span className="font-medium">Total Sales (Mock)</span>
              <span className="text-primary font-bold text-lg">125</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-2 shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="text-xl flex items-center"><DollarSign className="mr-2 h-5 w-5"/>Sales & Payouts (Mock Data)</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-secondary/50 rounded-md">
                <Label className="text-sm text-muted-foreground">Total Revenue</Label>
                <p className="text-2xl font-bold text-primary">{formatPrice(7850.50)}</p>
              </div>
              <div className="p-4 bg-secondary/50 rounded-md">
                <Label className="text-sm text-muted-foreground">Next Estimated Payout</Label>
                <p className="text-2xl font-bold text-primary">{formatPrice(1230.00)}</p>
              </div>
          </CardContent>
          <CardFooter className="p-4">
            <Button variant="outline" className="w-full">
              <BarChart2 className="mr-2 h-4 w-4" /> View Detailed Analytics
            </Button>
          </CardFooter>
        </Card>
      </div>


      <Card className="w-full shadow-xl rounded-xl">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center"><PlusCircle className="mr-2 h-6 w-6 text-primary" />Add New Product</CardTitle>
          <CardDescription>Valid categories are: {ALL_CATEGORIES.join(', ')}.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="name">Product Name *</Label>
                <Input id="name" name="name" value={formState.name} onChange={handleChange} required disabled={isSubmitting} />
              </div>
              <div>
                <Label htmlFor="price">Price (USD) *</Label>
                <Input id="price" name="price" type="number" value={formState.price} onChange={handleChange} required step="0.01" min="0.01" disabled={isSubmitting}/>
              </div>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" value={formState.description} onChange={handleChange} disabled={isSubmitting}/>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="category">Category *</Label>
                <Input id="category" name="category" value={formState.category} onChange={handleChange} list="category-options" required disabled={isSubmitting}/>
                <datalist id="category-options">{ALL_CATEGORIES.map(cat => <option key={cat} value={cat} />)}</datalist>
              </div>
              <div>
                <Label htmlFor="sizes">Sizes (comma-separated, uppercase) *</Label>
                <Input id="sizes" name="sizes" value={formState.sizes} onChange={handleChange} required disabled={isSubmitting}/>
              </div>
            </div>
            <div>
              <Label htmlFor="image-upload">Product Image</Label>
              <Input id="image-upload" type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" disabled={isSubmitting} />
              <p className="text-sm text-muted-foreground mt-2">Or enter image URL:</p>
              <Input id="imageUrl" name="imageUrl" value={formState.imageUrl} onChange={handleChange} disabled={isSubmitting || !!imageFile} />
              {previewUrl && <img src={previewUrl} alt="Preview" width={100} height={133} className="rounded-md border object-cover mt-2 w-[100px] h-[133px]" />}
            </div>
            <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 animate-spin" /> : <PlusCircle className="mr-2" />}
              {isSubmitting ? 'Adding...' : 'Add Product'}
            </Button>
          </CardContent>
        </form>
      </Card>
      

      <Card className="mt-8 shadow-lg rounded-xl">
        <CardHeader><CardTitle className="text-xl flex items-center"><ListChecks className="mr-2 h-5 w-5"/>All Listed Products</CardTitle></CardHeader>
        <CardContent>
          {listingLoading && <div className="flex justify-center py-8"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>}
          
          {listingError && (
             <Alert variant="destructive" className="mt-4">
                <ServerCrash className="h-4 w-4" />
                <AlertTitle>Error Loading Products</AlertTitle>
                <AlertDescription>{listingError}</AlertDescription>
            </Alert>
          )}

          {!listingLoading && !listingError && allProducts.length === 0 && <p className="text-center text-muted-foreground py-8">There are no products listed on the platform yet.</p>}
          
          {!listingLoading && !listingError && allProducts.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {allProducts.map(product => (
                <Card key={product.id} className="flex flex-col">
                  <Image src={product.imageUrl} alt={product.name} width={300} height={400} className="w-full h-64 object-cover rounded-t-lg" onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/300x400.png`; }} />
                  <CardContent className="p-4 flex-grow">
                    <h3 className="font-semibold truncate">{product.name}</h3>
                    <p className="text-xl font-bold text-primary mt-1">{formatPrice(product.price)}</p>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Button variant="destructive" size="sm" className="w-full" onClick={() => setProductToDeleteId(product.id)} disabled={isDeleting && productToDeleteId === product.id}>
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {productToDeleteId && (
        <AlertDialog open={!!productToDeleteId} onOpenChange={(isOpen) => !isOpen && setProductToDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>This will permanently delete the product.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setProductToDeleteId(null)} disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => { if (productToDeleteId) handleDeleteProduct(productToDeleteId); }} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                {isDeleting ? <Loader2 className="mr-2 animate-spin"/> : null} Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}

    

    