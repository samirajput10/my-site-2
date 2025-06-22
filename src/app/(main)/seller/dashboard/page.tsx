
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { LayoutDashboard, PlusCircle, Package, Loader2, AlertTriangle, ShieldAlert, ListChecks, Beaker, Trash2 } from 'lucide-react';
import { auth, db, storage } from '@/lib/firebase/config';
import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, serverTimestamp, query, where, getDocs, orderBy, type Timestamp, doc, deleteDoc } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import type { Product, ProductCategory, ProductSize } from '@/types';
import { ALL_CATEGORIES } from '@/types';
import { ProductImage } from '@/components/products/ProductImage';
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
import Image from 'next/image';

interface NewProductForm {
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  category: string;
  sizes: string; // Comma-separated
}

interface DummyProductData {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: ProductCategory;
  sizes: ProductSize[];
  sellerId: string;
}

export default function SellerDashboardPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [formState, setFormState] = useState<NewProductForm>({
    name: '',
    description: '',
    price: '',
    imageUrl: 'https://placehold.co/300x400.png',
    category: '',
    sizes: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(formState.imageUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isSeller, setIsSeller] = useState<boolean | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sellerProducts, setSellerProducts] = useState<Product[]>([]);
  const [listingLoading, setListingLoading] = useState(false);
  const [listingError, setListingError] = useState<string | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [productToDeleteId, setProductToDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (imageFile) {
      setPreviewUrl(URL.createObjectURL(imageFile));
    } else {
      setPreviewUrl(formState.imageUrl);
    }
  }, [imageFile, formState.imageUrl]);

  const fetchSellerProducts = useCallback(async (user: User) => {
    if (!user) return;
    setListingLoading(true);
    setListingError(null);
    try {
      const productsRef = collection(db, 'products');
      const q = query(productsRef, where('sellerId', '==', user.uid), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const products = querySnapshot.docs.map(doc => {
        const data = doc.data();
        const createdAtTimestamp = data.createdAt as Timestamp;
        
        const mappedProduct: Product = {
          id: doc.id,
          name: data.name || "Unnamed Product",
          description: data.description || "",
          price: typeof data.price === 'number' ? data.price : 0,
          imageUrl: data.imageUrl || `https://placehold.co/300x400.png`,
          category: (ALL_CATEGORIES.includes(data.category) ? data.category : ALL_CATEGORIES[0]) as ProductCategory,
          sizes: Array.isArray(data.sizes) && data.sizes.length > 0 
                 ? data.sizes.filter((s: any) => typeof s === 'string' && s.trim() !== '') 
                 : (typeof data.sizes === 'string' && data.sizes.length > 0 
                    ? data.sizes.split(',').map((s: string) => s.trim()).filter(Boolean) 
                    : ['One Size']),
          sellerId: data.sellerId || user.uid,
          createdAt: createdAtTimestamp ? createdAtTimestamp.toDate().toISOString() : undefined,
        };
        return mappedProduct;
      }).filter(product => product.name !== "Unnamed Product" || product.price !== 0);
      
      setSellerProducts(products);
    } catch (error: any) {
      console.error("Error fetching seller products:", error);
      let userMessage = "Failed to load your products. Please try again or check your browser console for details.";
      if (error && error.code === 'permission-denied') {
        userMessage = "Permission denied. Please check your Firestore security rules to allow access to products. The browser console may have more details.";
      } else if (error && error.message) {
        userMessage = `Failed to load products: ${error.message}. Check browser console for full details.`;
      }
      setListingError(userMessage);
      toast({ title: "Error Loading Products", description: userMessage, variant: "destructive" });
    } finally {
      setListingLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        const userProfileString = localStorage.getItem(`userProfile_${user.uid}`);
        if (userProfileString) {
          try {
            const userProfile = JSON.parse(userProfileString);
            if (userProfile.role === 'seller') {
              setIsSeller(true);
              fetchSellerProducts(user); 
            } else {
              setIsSeller(false);
            }
          } catch (e) {
            console.error("Error parsing user profile from localStorage", e);
            setIsSeller(false);
          }
        } else {
          setIsSeller(false);
        }
      } else {
        setIsSeller(false);
      }
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, [fetchSellerProducts]);

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
      const file = e.target.files[0];
      setImageFile(file);
      setFormState(prev => ({ ...prev, imageUrl: '' }));
    } else {
      setImageFile(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentUser || !isSeller) {
      toast({ title: "Error", description: "You must be a logged-in seller to add products.", variant: "destructive" });
      return;
    }
    if (!formState.name || !formState.price || !formState.category || !formState.sizes) {
        toast({ title: "Missing Fields", description: "Please fill in all required fields (Name, Price, Category, Sizes).", variant: "destructive" });
        return;
    }
     if (parseFloat(formState.price) <= 0) {
        toast({ title: "Invalid Price", description: "Price must be greater than zero.", variant: "destructive" });
        return;
    }
    if (!ALL_CATEGORIES.includes(formState.category as ProductCategory)) {
        toast({ title: "Invalid Category", description: `Please select a valid category. You entered: ${formState.category}. Valid categories are: ${ALL_CATEGORIES.join(', ')}.`, variant: "destructive" });
        return;
    }

    setIsSubmitting(true);
    try {
      let finalImageUrl = formState.imageUrl;

      if (imageFile) {
        toast({ title: "Uploading Image...", description: "Please wait while your image is being uploaded." });
        const sRef = storageRef(storage, `products/${Date.now()}_${imageFile.name}`);
        await uploadBytes(sRef, imageFile);
        finalImageUrl = await getDownloadURL(sRef);
      }
      
      if (!finalImageUrl) {
        finalImageUrl = 'https://placehold.co/300x400.png';
      }

      const productData = {
        name: formState.name,
        description: formState.description,
        price: parseFloat(formState.price),
        imageUrl: finalImageUrl,
        category: formState.category as ProductCategory,
        sizes: formState.sizes.split(',').map(s => s.trim()).filter(Boolean),
        sellerId: currentUser.uid,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'products'), productData);
      
      toast({
        title: "Product Added",
        description: `${formState.name} has been successfully listed.`,
      });
      setFormState({ name: '', description: '', price: '', imageUrl: 'https://placehold.co/300x400.png', category: '', sizes: '' });
      setImageFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      if (currentUser) { 
        fetchSellerProducts(currentUser);
      }
    } catch (error) {
      console.error("Error adding product to Firestore:", error);
      toast({
        title: "Failed to Add Product",
        description: "There was an error listing your product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateDummyProducts = (sellerId: string): DummyProductData[] => {
    const products: DummyProductData[] = [];
    const baseNames = [
      "Urban Chic", "Boho Dream", "Classic Comfort", "Modern Edge", "Minimalist Style",
      "Vintage Charm", "Sporty Look", "Elegant Evening", "Casual Day", "Work Ready",
      "Weekend Vibes", "Street Smart", "Artisan Craft", "Eco Friendly", "Luxury Touch",
      "Summer Breeze", "Winter Warmth", "Autumn Hues", "Spring Bloom", "Midnight Glam"
    ];
    const itemTypesByCategory: Record<ProductCategory, string[]> = {
      "Tops": ["Blouse", "T-Shirt", "Tank", "Sweater", "Shirt"],
      "Dresses": ["Maxi Dress", "Midi Dress", "Mini Dress", "Sundress", "Evening Gown"],
      "Pants": ["Jeans", "Trousers", "Leggings", "Shorts", "Culottes"],
      "Accessories": ["Scarf", "Belt", "Hat", "Bag", "Necklace"],
      "Shoes": ["Sneakers", "Boots", "Sandals", "Heels", "Loafers"],
      "Outerwear": ["Jacket", "Coat", "Blazer", "Cardigan", "Vest"]
    };

    for (let i = 0; i < 20; i++) {
      const category = ALL_CATEGORIES[i % ALL_CATEGORIES.length];
      const itemTypes = itemTypesByCategory[category];
      const itemType = itemTypes[i % itemTypes.length];
      const baseName = baseNames[i % baseNames.length];
      
      let productSizes: ProductSize[];
      if (category === 'Accessories') {
        productSizes = ['One Size'];
      } else if (category === 'Shoes') {
        const shoeSizes: ProductSize[] = ['S', 'M', 'L']; 
        productSizes = [shoeSizes[i % shoeSizes.length]];
      } else {
        const availableSizes: ProductSize[] = ['XS', 'S', 'M', 'L', 'XL'];
        productSizes = [availableSizes[i % availableSizes.length]];
        if (i % 2 === 0 && productSizes.length < 3) productSizes.push(availableSizes[(i+1) % availableSizes.length]);
        if (i % 3 === 0 && productSizes.length < 3) productSizes.push(availableSizes[(i+2) % availableSizes.length]);
        productSizes = [...new Set(productSizes)]; 
      }

      products.push({
        name: `${baseName} ${itemType} No. ${i + 1}`,
        description: `Discover the ${itemType.toLowerCase()} from our exclusive ${baseName} line. This piece, number ${i + 1}, offers unparalleled style and comfort.`,
        price: parseFloat((Math.random() * 180 + 20).toFixed(2)), 
        imageUrl: `https://placehold.co/300x400.png?text=${encodeURIComponent(itemType)}+${i + 1}`,
        category: category,
        sizes: productSizes,
        sellerId: sellerId,
      });
    }
    return products;
  };

  const handleSeedProducts = async () => {
    if (!currentUser) {
      toast({ title: "Authentication Error", description: "You must be logged in to seed products.", variant: "destructive" });
      return;
    }
    setIsSeeding(true);
    toast({ title: "Seeding Process Started", description: "Attempting to add 20 dummy products to the database..." });

    const dummyProductsData = generateDummyProducts(currentUser.uid);
    let successCount = 0;
    let errorCount = 0;

    for (const productData of dummyProductsData) {
      try {
        await addDoc(collection(db, 'products'), {
          ...productData, 
          createdAt: serverTimestamp(),
        });
        successCount++;
      } catch (error) {
        console.error("Error adding one product to Firestore during seeding:", error);
        errorCount++;
      }
    }

    if (successCount > 0) {
      toast({
        title: "Seeding Successful",
        description: `${successCount} products added to the database. ${errorCount > 0 ? `${errorCount} products failed to add.` : ''}`,
      });
      fetchSellerProducts(currentUser); 
    } else if (errorCount > 0) {
       toast({
        title: "Seeding Failed",
        description: "No products were added. Please check the browser console for errors.",
        variant: "destructive",
      });
    } else {
       toast({
        title: "Seeding Info",
        description: "Seeding process initiated, but no products were processed or outcome unclear.",
        variant: "default", 
      });
    }
    setIsSeeding(false);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!currentUser) {
      toast({ title: "Error", description: "Authentication required.", variant: "destructive" });
      return;
    }
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, "products", productId));
      toast({
        title: "Product Deleted",
        description: "The product has been successfully removed.",
      });
      fetchSellerProducts(currentUser); // Refresh list
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        title: "Deletion Failed",
        description: "Could not delete the product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setProductToDeleteId(null); // Close dialog by resetting the ID
    }
  };

  useEffect(() => {
    if (!loadingAuth && !currentUser) {
      toast({ title: "Access Denied", description: "Please login to view the seller dashboard.", variant: "destructive"});
      router.push('/login');
    }
  }, [loadingAuth, currentUser, router, toast]);

  if (loadingAuth) {
    return (
      <div className="container mx-auto flex min-h-[calc(100vh-10rem)] items-center justify-center py-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">Verifying access...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
         <div className="container mx-auto flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center py-12 text-center">
            <ShieldAlert className="h-16 w-16 text-destructive mb-4" />
            <h1 className="text-3xl font-bold mb-2">Access Denied</h1>
            <p className="text-muted-foreground mb-6">You must be logged in to view this page. Redirecting to login...</p>
      </div>
    );
  }
  
  if (isSeller === false) { 
    return (
      <div className="container mx-auto flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center py-12 text-center">
        <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-3xl font-bold mb-2">Access Denied</h1>
        <p className="text-muted-foreground mb-6">You do not have permission to view the seller dashboard. This area is for registered sellers only.</p>
        <Button onClick={() => router.push('/')} size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">Go to Homepage</Button>
      </div>
    );
  }
  
  if (isSeller === true) {
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
              <div className="flex justify-between items-center p-3 bg-secondary/50 rounded-md">
                <span className="font-medium">Pending Orders</span>
                <span className="text-primary font-bold text-lg">0</span>
              </div>
               <div className="flex justify-between items-center p-3 bg-secondary/50 rounded-md">
                <span className="font-medium">Total Sales</span>
                <span className="text-accent font-bold text-lg">$0.00</span>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 shadow-xl rounded-xl">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center">
                <PlusCircle className="mr-2 h-6 w-6 text-primary" />
                Add New Product
              </CardTitle>
              <CardDescription>
                Fill in the details to list a new item in your store. Use comma-separated values for sizes (e.g. S,M,L).
                 Valid categories are: {ALL_CATEGORIES.join(', ')}.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name" className="text-base">Product Name *</Label>
                    <Input id="name" name="name" value={formState.name} onChange={handleChange} placeholder="e.g., Summer Floral Dress" required className="mt-1" disabled={isSubmitting} />
                  </div>
                  <div>
                    <Label htmlFor="price" className="text-base">Price ($) *</Label>
                    <Input id="price" name="price" type="number" value={formState.price} onChange={handleChange} placeholder="e.g., 49.99" required className="mt-1" step="0.01" min="0.01" disabled={isSubmitting}/>
                  </div>
                </div>
                <div>
                  <Label htmlFor="description" className="text-base">Description</Label>
                  <Textarea id="description" name="description" value={formState.description} onChange={handleChange} placeholder="Describe your product..." rows={4} className="mt-1" disabled={isSubmitting}/>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="category" className="text-base">Category *</Label>
                    <Input id="category" name="category" value={formState.category} onChange={handleChange} placeholder={`e.g., ${ALL_CATEGORIES[0]}`} list="category-options" required className="mt-1" disabled={isSubmitting}/>
                    <datalist id="category-options">
                        {ALL_CATEGORIES.map(cat => <option key={cat} value={cat} />)}
                    </datalist>
                  </div>
                   <div>
                    <Label htmlFor="sizes" className="text-base">Sizes (comma-separated) *</Label>
                    <Input id="sizes" name="sizes" value={formState.sizes} onChange={handleChange} placeholder="e.g., S, M, L, XL or One Size" required className="mt-1" disabled={isSubmitting}/>
                  </div>
                </div>
                <div>
                  <Label htmlFor="image-upload" className="text-base">Product Image</Label>
                  <Input
                    id="image-upload"
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/png, image/jpeg, image/webp"
                    className="mt-1 file:text-primary file:font-semibold"
                    disabled={isSubmitting}
                  />
                  <p className="text-sm text-muted-foreground mt-2">Or enter image URL below:</p>
                  <Input
                    id="imageUrl"
                    name="imageUrl"
                    value={formState.imageUrl}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                    className="mt-1"
                    disabled={isSubmitting || !!imageFile}
                  />
                  {previewUrl && (
                     <div className="mt-2">
                        <Image
                            src={previewUrl}
                            alt="Preview"
                            width={100}
                            height={133}
                            className="rounded-md border object-cover w-[100px] h-[133px]"
                        />
                    </div>
                  )}
                </div>
                <Button type="submit" size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <PlusCircle className="mr-2 h-5 w-5" />}
                  {isSubmitting ? 'Adding Product...' : 'Add Product'}
                </Button>
              </CardContent>
            </form>
          </Card>
        </div>

        <Card className="mt-8 shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="text-xl flex items-center"><ListChecks className="mr-2 h-5 w-5"/>Your Listed Products</CardTitle>
            <CardDescription>
              View and manage products you have listed. Click delete to remove a product.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {listingLoading && (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="ml-4 text-muted-foreground">Loading your products...</p>
              </div>
            )}
            {listingError && (
              <div className="text-center py-8 text-destructive bg-destructive/10 p-4 rounded-md">
                <AlertTriangle className="mx-auto h-12 w-12 mb-2" />
                <p className="font-semibold">Error Loading Products</p>
                <p className="text-sm">{listingError}</p>
              </div>
            )}
            {!listingLoading && !listingError && sellerProducts.length === 0 && (
              <p className="text-muted-foreground text-center py-8">You haven&apos;t listed any products yet. Add one using the form above!</p>
            )}
            {!listingLoading && !listingError && sellerProducts.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sellerProducts.map(product => (
                  <Card key={product.id} className="flex flex-col">
                    <CardHeader className="p-0">
                        <ProductImage 
                          src={product.imageUrl} 
                          alt={product.name} 
                          width={300}
                          height={400} 
                          className="w-full h-64 object-cover rounded-t-lg" 
                          aiHint={`${product.category.toLowerCase()} ${product.name.split(' ')[0].toLowerCase()}`} 
                        />
                    </CardHeader>
                    <CardContent className="p-4 flex-grow">
                      <h3 className="text-lg font-semibold truncate" title={product.name}>{product.name}</h3>
                      <p className="text-sm text-muted-foreground">{product.category}</p>
                      <p className="text-xl font-bold text-primary mt-1">${product.price.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground mt-1">Sizes: {product.sizes.join(', ')}</p>
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          className="w-full" 
                          onClick={() => setProductToDeleteId(product.id)}
                          disabled={isDeleting && productToDeleteId === product.id}
                        >
                          {isDeleting && productToDeleteId === product.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Trash2 className="mr-2 h-4 w-4" />}
                          Delete
                        </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {productToDeleteId && (
          <AlertDialog open={!!productToDeleteId} onOpenChange={(isOpen) => { if (!isOpen) setProductToDeleteId(null); }}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the product
                  from the database.
                </description>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setProductToDeleteId(null)} disabled={isDeleting}>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                    onClick={() => { if (productToDeleteId) handleDeleteProduct(productToDeleteId) }} 
                    disabled={isDeleting} 
                    className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                 >
                  {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                  Yes, delete product
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        <Card className="mt-8 shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <Beaker className="mr-2 h-5 w-5 text-primary" />
              Developer Tools
            </CardTitle>
            <CardDescription>
              Utilities for development and testing. Use with caution.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleSeedProducts} disabled={isSeeding || !currentUser} variant="destructive" className="w-full sm:w-auto">
              {isSeeding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Beaker className="mr-2 h-4 w-4" />}
              Seed 20 Dummy Products
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              This will add 20 dummy products to the Firestore database under your seller ID.
              Intended for development purposes only. Refresh product list if needed.
            </p>
          </CardContent>
        </Card>

      </div>
    );
  }

  // Fallback for when isSeller is null (still loading auth/profile)
  return (
    <div className="container mx-auto flex min-h-[calc(100vh-10rem)] items-center justify-center py-12">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
       <p className="ml-4 text-lg text-muted-foreground">Loading dashboard...</p>
    </div>
  );
}
