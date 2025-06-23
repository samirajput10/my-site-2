
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, serverTimestamp, query, where, getDocs, orderBy, type Timestamp, doc, deleteDoc } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { LayoutDashboard, PlusCircle, Package, Loader2, AlertTriangle, ShieldAlert, ListChecks, Trash2 } from 'lucide-react';

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
import { useToast } from "@/hooks/use-toast";
import { auth, db, storage } from '@/lib/firebase/config';
import type { Product, ProductCategory, ProductSize } from '@/types';
import { ALL_CATEGORIES, ALL_SIZES } from '@/types';
import { useCurrency } from '@/contexts/CurrencyContext';

interface NewProductForm {
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  category: string;
  sizes: string;
}

export default function SellerDashboardPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { formatPrice } = useCurrency();
  
  const [formState, setFormState] = useState<NewProductForm>({
    name: '', description: '', price: '', imageUrl: '', category: '', sizes: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isSeller, setIsSeller] = useState<boolean | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sellerProducts, setSellerProducts] = useState<Product[]>([]);
  const [listingLoading, setListingLoading] = useState(true);
  const [listingError, setListingError] = useState<string | null>(null);

  const [isDeleting, setIsDeleting] = useState(false);
  const [productToDeleteId, setProductToDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const fetchSellerProducts = async (userId: string) => {
      setListingLoading(true);
      setListingError(null);
      try {
        const productsRef = collection(db, 'products');
        const q = query(productsRef, where('sellerId', '==', userId), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);

        const products = querySnapshot.docs.map(doc => {
          const data = doc.data();
          const createdAtTimestamp = data.createdAt as Timestamp;

          let parsedSizes: ProductSize[] = [];
          if (Array.isArray(data.sizes)) {
            parsedSizes = data.sizes.map(s => String(s).trim()).filter(s => ALL_SIZES.includes(s as ProductSize)) as ProductSize[];
          } else if (typeof data.sizes === 'string' && data.sizes.length > 0) {
            parsedSizes = data.sizes.split(',').map(s => s.trim()).filter(s => ALL_SIZES.includes(s as ProductSize)) as ProductSize[];
          }
          
          const mappedProduct: Product = {
            id: doc.id,
            name: data.name || "Unnamed Product",
            description: data.description || "",
            price: typeof data.price === 'number' ? data.price : 0,
            imageUrl: data.imageUrl || `https://placehold.co/300x400.png`,
            category: (ALL_CATEGORIES.includes(data.category) ? data.category : ALL_CATEGORIES[0]) as ProductCategory,
            sizes: parsedSizes.length > 0 ? parsedSizes : ['One Size'],
            sellerId: data.sellerId || userId,
            createdAt: createdAtTimestamp ? createdAtTimestamp.toDate().toISOString() : undefined,
          };
          return mappedProduct;
        }).filter(product => product.name !== "Unnamed Product" || product.price !== 0);
        
        setSellerProducts(products);
      } catch (error: any) {
        console.error("Error fetching seller products:", error);
        const userMessage = "Failed to load your products. Check Firestore security rules.";
        setListingError(userMessage);
        toast({ title: "Error", description: userMessage, variant: "destructive" });
      } finally {
        setListingLoading(false);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        const userProfileString = localStorage.getItem(`userProfile_${user.uid}`);
        const userProfile = userProfileString ? JSON.parse(userProfileString) : {};
        if (userProfile.role === 'seller') {
          setIsSeller(true);
          fetchSellerProducts(user.uid);
        } else {
          setIsSeller(false);
          setListingLoading(false);
        }
      } else {
        setIsSeller(false);
        setListingLoading(false);
      }
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, [toast]);

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
        toast({ title: "Uploading Image..." });
        const sRef = storageRef(storage, `products/${Date.now()}_${imageFile.name}`);
        await uploadBytes(sRef, imageFile);
        finalImageUrl = await getDownloadURL(sRef);
      }

      const newProductDoc = {
        name: formState.name,
        description: formState.description,
        price: parseFloat(formState.price),
        imageUrl: finalImageUrl || 'https://placehold.co/300x400.png',
        category: formState.category as ProductCategory,
        sizes: formState.sizes.split(',').map(s => s.trim()).filter(Boolean),
        sellerId: currentUser.uid,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'products'), newProductDoc);
      
      toast({ title: "Product Added", description: `${formState.name} is now listed.` });
      setFormState({ name: '', description: '', price: '', imageUrl: '', category: '', sizes: '' });
      setImageFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      const tempNewProduct: Product = {
        id: 'temp-id-' + Date.now(), // Placeholder ID
        ...newProductDoc,
        price: newProductDoc.price,
        createdAt: new Date().toISOString(),
      };
      setSellerProducts(prev => [tempNewProduct, ...prev]);

    } catch (error) {
      console.error("Error adding product:", error);
      toast({ title: "Failed to Add Product", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!currentUser) return;
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, "products", productId));
      toast({ title: "Product Deleted" });
      setSellerProducts(prev => prev.filter(p => p.id !== productId));
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({ title: "Deletion Failed", variant: "destructive" });
    } finally {
      setIsDeleting(false);
      setProductToDeleteId(null);
    }
  };

  useEffect(() => {
    if (!loadingAuth && !currentUser) {
      router.push('/login');
    }
  }, [loadingAuth, currentUser, router]);

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
      <div className="container mx-auto flex min-h-[calc(100vh-10rem)] items-center justify-center">
        <ShieldAlert className="h-16 w-16 text-destructive" />
        <p className="ml-4 text-lg text-muted-foreground">Redirecting to login...</p>
      </div>
    );
  }
  
  if (isSeller === false) { 
    return (
      <div className="container mx-auto flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center text-center">
        <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-3xl font-bold mb-2">Access Denied</h1>
        <p className="text-muted-foreground mb-6">You do not have permission to view this page.</p>
        <Button onClick={() => router.push('/')} size="lg">Go to Homepage</Button>
      </div>
    );
  }
  
  if (isSeller === null) {
      return null;
  }

  return (
    <div className="container mx-auto py-8 md:py-12">
      <div className="text-center mb-10">
        <LayoutDashboard className="mx-auto h-16 w-16 text-primary mb-4" />
        <h1 className="text-4xl font-headline font-bold mb-3">Seller Dashboard</h1>
        <p className="text-lg text-muted-foreground">Manage your products and sales.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="md:col-span-1 shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="text-xl flex items-center"><Package className="mr-2 h-5 w-5"/>Product Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-secondary/50 rounded-md">
              <span className="font-medium">Active Listings</span>
              <span className="text-primary font-bold text-lg">{sellerProducts.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 shadow-xl rounded-xl">
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
                  <Label htmlFor="sizes">Sizes (comma-separated) *</Label>
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
      </div>

      <Card className="mt-8 shadow-lg rounded-xl">
        <CardHeader><CardTitle className="text-xl flex items-center"><ListChecks className="mr-2 h-5 w-5"/>Your Listed Products</CardTitle></CardHeader>
        <CardContent>
          {listingLoading && <div className="flex justify-center py-8"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>}
          {listingError && <div className="text-destructive text-center py-8">{listingError}</div>}
          {!listingLoading && !listingError && sellerProducts.length === 0 && <p className="text-center text-muted-foreground py-8">You haven't listed any products yet.</p>}
          {!listingLoading && !listingError && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sellerProducts.map(product => (
                <Card key={product.id} className="flex flex-col">
                  <img src={product.imageUrl} alt={product.name} className="w-full h-64 object-cover rounded-t-lg" onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/300x400.png`; }} />
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
