
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { LayoutDashboard, PlusCircle, Package, Loader2, AlertTriangle, ShieldAlert, ListChecks, Trash2, DollarSign, BarChart2, ServerCrash, KeyRound, Sparkles, Wand2, Image as ImageIcon, Edit } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
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
import { auth, db, storage } from '@/lib/firebase/config';
import type { Product, ProductCategory, ProductSize } from '@/types';
import { ALL_CATEGORIES, ALL_SIZES } from '@/types';
import { useCurrency } from '@/contexts/CurrencyContext';
import Image from 'next/image';
import { getAllProductsFromDB, updateProductInDB } from '@/actions/productActions';
import { getProductDetailsFromImage } from '@/actions/adminActions';

interface ProductFormState {
  name: string;
  description: string;
  price: string;
  imageUrls: string[];
  category: string;
  sizes: string;
  stock: string;
}

const recommendedDbRules = `{
  "rules": {
    "service cloud.firestore": {
      "match /databases/{database}/documents": {
        // Products can be read by anyone, but only written by authenticated users (admins)
        "match /products/{productId}": {
          "allow read": true;
          "allow create, update, delete": if request.auth != null;
        },
        // Users can only read/write their own credits document
        "match /userCredits/{userId}": {
          "allow read, write": if request.auth != null && request.auth.uid == userId;
        }
      }
    }
  }
}`;

export default function AdminPanelPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { formatPrice } = useCurrency();
  
  const [formState, setFormState] = useState<ProductFormState>({
    name: '', description: '', price: '', imageUrls: ['', '', ''], category: '', sizes: '', stock: '10',
  });
  const [imageFiles, setImageFiles] = useState<(File | null)[]>([null, null, null]);
  const [previewUrls, setPreviewUrls] = useState<(string | null)[]>([null, null, null]);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [aiImageUrl, setAiImageUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const [currentUser, setCurrentUser] = useState<User | { uid: string } | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [listingLoading, setListingLoading] = useState(true);
  const [listingError, setListingError] = useState<string | React.ReactNode | null>(null);

  const [isDeleting, setIsDeleting] = useState(false);
  const [productToDeleteId, setProductToDeleteId] = useState<string | null>(null);
  
  const [currentApiKey, setCurrentApiKey] = useState('');

  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [editFormState, setEditFormState] = useState<Partial<ProductFormState>>({});
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    setCurrentApiKey(process.env.GEMINI_API_KEY || 'Not Set');
  }, []);

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
                    Please update your <strong>Firestore rules</strong> in the Firebase Console to allow access.
                    <br />
                    <strong>Recommended rules:</strong>
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
    const newPreviewUrls = [...previewUrls];
    let changed = false;

    imageFiles.forEach((file, index) => {
        if (file) {
            const objectUrl = URL.createObjectURL(file);
            newPreviewUrls[index] = objectUrl;
            changed = true;
        }
    });

    if (changed) {
        setPreviewUrls(newPreviewUrls);
    }

    return () => {
        newPreviewUrls.forEach(url => {
            if (url && url.startsWith('blob:')) {
                URL.revokeObjectURL(url);
            }
        });
    };
  }, [imageFiles]);

  // When a product is selected for editing, populate the edit form state
  useEffect(() => {
    if (productToEdit) {
      setEditFormState({
        name: productToEdit.name,
        description: productToEdit.description,
        price: String(productToEdit.price),
        imageUrls: [...productToEdit.imageUrls, ...Array(3 - productToEdit.imageUrls.length).fill('')],
        category: productToEdit.category,
        sizes: productToEdit.sizes.join(', '),
        stock: String(productToEdit.stock),
      });
    } else {
      setEditFormState({});
    }
  }, [productToEdit]);


  const handleGenerateDetails = async () => {
    if (!aiImageUrl) {
        toast({ title: 'Image URL Missing', description: 'Please paste an image URL to generate details.', variant: 'destructive'});
        return;
    }
    setIsGenerating(true);
    toast({ title: 'AI Generation Started', description: 'The AI is creating product details...'});
    try {
        const result = await getProductDetailsFromImage({ imageUrl: aiImageUrl });
        if ('error' in result) {
            toast({ title: 'AI Generation Failed', description: result.error, variant: 'destructive' });
        } else {
            setFormState({
                name: result.name,
                description: result.description,
                category: result.category,
                imageUrls: [aiImageUrl, '', ''],
                price: '', 
                sizes: '', 
                stock: '10',
            });
            setImageFiles([null, null, null]);
            setPreviewUrls([aiImageUrl, null, null]);
            toast({ title: 'AI Generation Complete!', description: 'Product details have been filled in the form below.' });
        }
    } catch (error) {
        console.error('Error generating details', error);
        toast({ title: 'An Unexpected Error Occurred', description: 'Please check the console for details.', variant: 'destructive'});
    } finally {
        setIsGenerating(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleEditUrlChange = (index: number, value: string) => {
    const newUrls = [...(editFormState.imageUrls || ['', '', ''])];
    newUrls[index] = value;
    setEditFormState(prev => ({ ...prev, imageUrls: newUrls }));
  };

  const handleUrlChange = (index: number, value: string) => {
      const newUrls = [...formState.imageUrls];
      newUrls[index] = value;
      setFormState(prev => ({...prev, imageUrls: newUrls}));
      if (value) {
          const newImageFiles = [...imageFiles];
          newImageFiles[index] = null;
          setImageFiles(newImageFiles);

          const newPreviewUrls = [...previewUrls];
          newPreviewUrls[index] = value;
          setPreviewUrls(newPreviewUrls);
      }
  };

  const handleFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const newFiles = [...imageFiles];
      newFiles[index] = e.target.files[0];
      setImageFiles(newFiles);

      const newUrls = [...formState.imageUrls];
      newUrls[index] = '';
      setFormState(prev => ({...prev, imageUrls: newUrls}));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!formState.name || !formState.price || !formState.category || !formState.sizes || !formState.stock) {
      toast({ title: "Missing Fields", description: "Please fill all required fields.", variant: "destructive" });
      return;
    }
    
    setIsSubmitting(true);
    try {
      let finalImageUrls = [...formState.imageUrls];

      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        if(file){
           toast({ title: `Uploading Image ${i+1}...`, description: "Your image is being uploaded to secure storage." });
           const sRef = storageRef(storage, `products/${currentUser.uid}/${Date.now()}_${file.name}`);
           const uploadTask = await uploadBytes(sRef, file);
           finalImageUrls[i] = await getDownloadURL(uploadTask.ref);
           toast({ title: `Image ${i+1} Upload Complete!`, description: "A link to your image has been generated." });
        }
      }
      
      const filteredImageUrls = finalImageUrls.filter(url => url && url.trim() !== '');

      if (filteredImageUrls.length === 0) {
        toast({ title: "Image Error", description: "Please provide at least one image by uploading or entering a URL.", variant: "destructive" });
        setIsSubmitting(false);
        return;
      }

      const productsCollectionRef = collection(db, 'products');

      const parsedSizes = formState.sizes.split(',')
        .map(s => s.trim())
        .filter(s => ALL_SIZES.includes(s as ProductSize));
      
      if (parsedSizes.length === 0 && formState.sizes.trim() !== '' && formState.sizes.trim().toLowerCase() !== 'one size') {
          toast({ title: "Invalid Sizes", description: `Please use valid, comma-separated sizes from: ${ALL_SIZES.join(', ')}`, variant: "destructive" });
          setIsSubmitting(false);
          return;
      }

      const newProductData = {
        name: formState.name,
        description: formState.description,
        price: parseFloat(formState.price),
        imageUrls: filteredImageUrls,
        category: formState.category as ProductCategory,
        sizes: parsedSizes.length > 0 ? parsedSizes : ['One Size'],
        stock: parseInt(formState.stock, 10),
        sellerId: currentUser.uid,
        createdAt: serverTimestamp(),
      };

      await addDoc(productsCollectionRef, newProductData);
      
      toast({ title: "Product Added", description: `Your product has been successfully listed.` });
      setFormState({ name: '', description: '', price: '', imageUrls: ['', '', ''], category: '', sizes: '', stock: '10' });
      setImageFiles([null, null, null]);
      setPreviewUrls([null, null, null]);
      fileInputRefs.current.forEach(input => {
        if(input) input.value = '';
      });
      
      fetchAllProducts();

    } catch (error: any) {
      console.error("Error adding product:", error);
      let errorMessage = "Failed to add product. Please try again.";
      if (error.code) {
        switch (error.code) {
          case 'storage/unauthorized':
            errorMessage = "Image upload failed. You don't have permission. Please check your Firebase Storage security rules.";
            break;
          case 'permission-denied':
             errorMessage = "Permission denied. Check your Firestore security rules to ensure you have write access.";
             break;
        }
      }
      toast({ title: "Failed to Add Product", description: errorMessage, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!productToEdit) return;

    setIsUpdating(true);
    const result = await updateProductInDB(productToEdit.id, editFormState as Partial<Product>);
    
    if (result.success) {
      toast({ title: "Product Updated", description: "The product details have been saved." });
      setProductToEdit(null); // Close the dialog
      fetchAllProducts(); // Refresh the list
    } else {
      toast({ title: "Update Failed", description: result.error, variant: "destructive" });
    }
    setIsUpdating(false);
  };


  const handleDeleteProduct = async (productId: string) => {
    if (!currentUser) return;
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, "products", productId));
      toast({ title: "Product Deleted" });
      setAllProducts(prev => prev.filter(p => p.id !== productId));
    } catch (error: any) {
      console.error("Error deleting product:", error);
      let errMsg = "Could not delete product. Check Firestore rules.";
      if (error.code === 'permission-denied') {
          errMsg = "Permission denied. You do not have the necessary rights to delete this product.";
      }
      toast({ title: "Deletion Failed", description: errMsg, variant: "destructive" });
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

       <Card className="w-full shadow-xl rounded-xl mb-8">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center"><KeyRound className="mr-2 h-6 w-6 text-primary" />Manage API Key</CardTitle>
          <CardDescription>Your Gemini API key is required for AI features to work.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 dark:bg-blue-900/20 dark:border-blue-500/30 dark:text-blue-200">
                <h4 className="font-semibold flex items-center"><ShieldAlert className="w-4 h-4 mr-2" />How to Set Your API Key</h4>
                <div className="text-sm mt-2 space-y-1">
                <p>To enable AI features like product detail generation, you must set the `GEMINI_API_KEY` variable in your project's <strong>.env</strong> file.</p>
                <p>After updating the file, you must <strong>restart or redeploy</strong> your application for the change to take effect.</p>
                </div>
            </div>
        </CardContent>
       </Card>

      <Card className="w-full shadow-xl rounded-xl mb-8">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center"><Wand2 className="mr-2 h-6 w-6 text-primary"/>Generate with AI</CardTitle>
          <CardDescription>Paste an image URL to have AI generate the product name, description, and category for you.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                id="ai-image-url"
                placeholder="https://example.com/image.jpg"
                value={aiImageUrl}
                onChange={(e) => setAiImageUrl(e.target.value)}
                disabled={isGenerating}
                className="flex-grow"
              />
              <Button onClick={handleGenerateDetails} disabled={isGenerating} className="sm:w-auto">
                {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                {isGenerating ? 'Generating...' : 'Generate Details'}
              </Button>
            </div>
        </CardContent>
      </Card>


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
                <Label htmlFor="price">Price (PKR) *</Label>
                <Input id="price" name="price" type="number" value={formState.price} onChange={handleChange} required step="1" min="1" disabled={isSubmitting}/>
              </div>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" value={formState.description} onChange={handleChange} disabled={isSubmitting}/>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="category">Category *</Label>
                <Input id="category" name="category" value={formState.category} onChange={handleChange} list="category-options" required disabled={isSubmitting}/>
                <datalist id="category-options">{ALL_CATEGORIES.map(cat => <option key={cat} value={cat} />)}</datalist>
              </div>
              <div>
                <Label htmlFor="sizes">Sizes (comma-separated, or "One Size") *</Label>
                <Input id="sizes" name="sizes" value={formState.sizes} onChange={handleChange} required disabled={isSubmitting}/>
              </div>
               <div>
                <Label htmlFor="stock">Stock Quantity *</Label>
                <Input id="stock" name="stock" type="number" value={formState.stock} onChange={handleChange} required min="0" disabled={isSubmitting}/>
              </div>
            </div>
            <div>
              <Label>Product Images (up to 3)</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                {[0, 1, 2].map(index => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center gap-2">
                        <ImageIcon className="h-4 w-4 text-muted-foreground" />
                        <Label htmlFor={`image-url-${index}`} className="text-sm">Image {index + 1}</Label>
                    </div>
                    <Input
                      id={`image-upload-${index}`}
                      type="file"
                      ref={(el) => (fileInputRefs.current[index] = el)}
                      onChange={(e) => handleFileChange(index, e)}
                      accept="image/*"
                      disabled={isSubmitting}
                    />
                    <p className="text-xs text-muted-foreground text-center">Or enter URL:</p>
                    <Input
                      id={`image-url-${index}`}
                      name={`imageUrl-${index}`}
                      value={formState.imageUrls[index]}
                      onChange={(e) => handleUrlChange(index, e.target.value)}
                      disabled={isSubmitting || !!imageFiles[index]}
                      placeholder={`Image URL ${index + 1}`}
                    />
                    {previewUrls[index] && (
                        <div className="relative w-[100px] h-[133px]">
                            <Image src={previewUrls[index] as string} alt={`Preview ${index+1}`} layout="fill" className="rounded-md border object-cover mt-2" />
                        </div>
                    )}
                  </div>
                ))}
              </div>
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
                  <div className="relative w-full aspect-[3/4] rounded-t-lg overflow-hidden">
                    <Image src={product.imageUrls[0]} alt={product.name} layout="fill" className="object-cover" onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/300x400.png`; }} />
                  </div>
                  <CardContent className="p-4 flex-grow">
                    <h3 className="font-semibold truncate">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">Stock: {product.stock}</p>
                    <p className="text-xl font-bold text-primary mt-1">{formatPrice(product.price)}</p>
                  </CardContent>
                   <CardFooter className="p-4 pt-0 grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" className="w-full" onClick={() => setProductToEdit(product)}>
                      <Edit className="mr-2 h-4 w-4" /> Update
                    </Button>
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

      {/* Delete Confirmation Dialog */}
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

      {/* Update Product Dialog */}
      <Dialog open={!!productToEdit} onOpenChange={(isOpen) => !isOpen && setProductToEdit(null)}>
        <DialogContent className="sm:max-w-2xl">
          {productToEdit && (
            <>
              <DialogHeader>
                <DialogTitle>Update {productToEdit.name}</DialogTitle>
                <DialogDescription>
                  Make changes to the product details below. Click save when you're done.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleUpdateSubmit} className="max-h-[70vh] overflow-y-auto pr-6 space-y-4">
                  <div>
                    <Label htmlFor="edit-name">Product Name *</Label>
                    <Input id="edit-name" name="name" value={editFormState.name || ''} onChange={handleEditFormChange} required disabled={isUpdating} />
                  </div>
                  <div>
                    <Label htmlFor="edit-price">Price (PKR) *</Label>
                    <Input id="edit-price" name="price" type="number" value={editFormState.price || ''} onChange={handleEditFormChange} required disabled={isUpdating} />
                  </div>
                  <div>
                    <Label htmlFor="edit-description">Description</Label>
                    <Textarea id="edit-description" name="description" value={editFormState.description || ''} onChange={handleEditFormChange} disabled={isUpdating} />
                  </div>
                   <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="edit-category">Category *</Label>
                        <Input id="edit-category" name="category" value={editFormState.category || ''} onChange={handleEditFormChange} list="category-options" required disabled={isUpdating} />
                      </div>
                      <div>
                        <Label htmlFor="edit-sizes">Sizes *</Label>
                        <Input id="edit-sizes" name="sizes" value={editFormState.sizes || ''} onChange={handleEditFormChange} required disabled={isUpdating} />
                      </div>
                      <div>
                        <Label htmlFor="edit-stock">Stock *</Label>
                        <Input id="edit-stock" name="stock" type="number" value={editFormState.stock || ''} onChange={handleEditFormChange} required disabled={isUpdating} />
                      </div>
                    </div>
                     <div>
                        <Label>Product Image URLs</Label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {[0, 1, 2].map(index => (
                            <Input
                            key={index}
                            id={`edit-image-url-${index}`}
                            name={`imageUrl-${index}`}
                            value={editFormState.imageUrls?.[index] || ''}
                            onChange={(e) => handleEditUrlChange(index, e.target.value)}
                            disabled={isUpdating}
                            placeholder={`Image URL ${index + 1}`}
                            />
                        ))}
                        </div>
                    </div>
              
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline" disabled={isUpdating}>
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={isUpdating}>
                   {isUpdating ? <Loader2 className="mr-2 animate-spin" /> : 'Save Changes'}
                </Button>
              </DialogFooter>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
