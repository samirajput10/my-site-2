
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { LayoutDashboard, PlusCircle, Package, Loader2, AlertTriangle, ShieldAlert } from 'lucide-react';
import { auth } from '@/lib/firebase/config';
import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';

interface NewProductForm {
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  category: string;
  sizes: string; // Comma-separated
}

export default function SellerDashboardPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [formState, setFormState] = useState<NewProductForm>({
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    category: '',
    sizes: '',
  });
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isSeller, setIsSeller] = useState<boolean | null>(null); // null for loading, true/false for status
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        // Check role from localStorage - FOR PROTOTYPING ONLY
        // In a real app, this should come from a secure backend source (e.g., Firestore user document custom claims)
        const userProfileString = localStorage.getItem(`userProfile_${user.uid}`);
        if (userProfileString) {
          try {
            const userProfile = JSON.parse(userProfileString);
            if (userProfile.role === 'seller') {
              setIsSeller(true);
            } else {
              setIsSeller(false);
            }
          } catch (e) {
            console.error("Error parsing user profile from localStorage", e);
            setIsSeller(false); // Default to not seller on error
          }
        } else {
          // If no profile in localStorage, assume not a seller for safety.
          // This could happen if user clears localStorage or signup didn't save it.
          setIsSeller(false); 
        }
      } else {
        setIsSeller(false); // No user logged in
      }
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("New Product Data:", formState);
    toast({
      title: "Product Submitted (Mock)",
      description: `${formState.name} has been submitted for review. This is a demo feature.`,
    });
    setFormState({ name: '', description: '', price: '', imageUrl: '', category: '', sizes: '' });
  };

  // Use useEffect for redirection to prevent attempting to update during render
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
    // This state will be brief as the useEffect above will redirect.
    // Showing a message can improve UX.
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
                <span className="text-primary font-bold text-lg">120</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-secondary/50 rounded-md">
                <span className="font-medium">Pending Orders</span>
                <span className="text-primary font-bold text-lg">15</span>
              </div>
               <div className="flex justify-between items-center p-3 bg-secondary/50 rounded-md">
                <span className="font-medium">Total Sales</span>
                <span className="text-accent font-bold text-lg">$5,670.00</span>
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
                Fill in the details to list a new item in your store.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name" className="text-base">Product Name</Label>
                    <Input id="name" name="name" value={formState.name} onChange={handleChange} placeholder="e.g., Summer Floral Dress" required className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="price" className="text-base">Price ($)</Label>
                    <Input id="price" name="price" type="number" value={formState.price} onChange={handleChange} placeholder="e.g., 49.99" required className="mt-1" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description" className="text-base">Description</Label>
                  <Textarea id="description" name="description" value={formState.description} onChange={handleChange} placeholder="Describe your product..." rows={4} required className="mt-1" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="category" className="text-base">Category</Label>
                    <Input id="category" name="category" value={formState.category} onChange={handleChange} placeholder="e.g., Dresses, Tops" required className="mt-1" />
                  </div>
                   <div>
                    <Label htmlFor="sizes" className="text-base">Sizes (comma-separated)</Label>
                    <Input id="sizes" name="sizes" value={formState.sizes} onChange={handleChange} placeholder="e.g., S, M, L, XL" required className="mt-1" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="imageUrl" className="text-base">Image URL</Label>
                  <Input id="imageUrl" name="imageUrl" value={formState.imageUrl} onChange={handleChange} placeholder="https://example.com/image.jpg" required className="mt-1" />
                </div>
                <Button type="submit" size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground">
                  <PlusCircle className="mr-2 h-5 w-5" />
                  Add Product
                </Button>
              </CardContent>
            </form>
          </Card>
        </div>
         <Card className="mt-8 shadow-lg rounded-xl">
            <CardHeader>
              <CardTitle className="text-xl">Manage Existing Products</CardTitle>
              <CardDescription>
                Product listing and management tools will be available here soon.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground italic">Feature under development.</p>
            </CardContent>
          </Card>
      </div>
    );
  }

  // Fallback for isSeller === null, if somehow reached despite loadingAuth.
  return (
    <div className="container mx-auto flex min-h-[calc(100vh-10rem)] items-center justify-center py-12">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
       <p className="ml-4 text-lg text-muted-foreground">Loading dashboard...</p>
    </div>
  );
}
