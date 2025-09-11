
"use server";

import { db } from '@/lib/firebase/config';
import type { Product, ProductCategory, ProductSize } from '@/types';
import { ALL_CATEGORIES, ALL_SIZES } from '@/types';
import { collection, getDocs, doc, getDoc, query, orderBy, limit } from "firebase/firestore";

// Helper to ensure imageUrls is always a non-empty array
const ensureImageUrls = (data: any): string[] => {
    if (Array.isArray(data.imageUrls) && data.imageUrls.length > 0) {
        return data.imageUrls.filter(Boolean); // Filter out any empty strings
    }
    if (typeof data.imageUrl === 'string' && data.imageUrl) {
        return [data.imageUrl]; // Legacy support
    }
    return [`https://placehold.co/300x450.png`]; // Fallback
};

export async function getAllProductsFromDB(): Promise<Product[] | { error: string }> {
  try {
    const productsRef = collection(db, "products");
    const q = query(productsRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return [];
    }

    const products = querySnapshot.docs.map(doc => {
      const data = doc.data();
      
      let parsedSizes: ProductSize[] = [];
      if (Array.isArray(data.sizes)) {
        parsedSizes = data.sizes
          .map(s => String(s).trim())
          .filter(s => ALL_SIZES.includes(s as ProductSize)) as ProductSize[];
      } else if (typeof data.sizes === 'string' && data.sizes.length > 0) {
        parsedSizes = data.sizes.split(',')
          .map(s => s.trim())
          .filter(s => ALL_SIZES.includes(s as ProductSize)) as ProductSize[];
      }
      
      const mappedProduct: Product = {
        id: doc.id,
        name: data.name || "Unnamed Product",
        description: data.description || "",
        price: typeof data.price === 'number' ? data.price : 0,
        imageUrls: ensureImageUrls(data),
        category: (ALL_CATEGORIES.includes(data.category) ? data.category : ALL_CATEGORIES[0]) as ProductCategory,
        sizes: parsedSizes.length > 0 ? parsedSizes : ['One Size'],
        sellerId: data.sellerId || "unknown_seller",
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
      };
      return mappedProduct;
    }).filter(product => product.name !== "Unnamed Product" || product.price !== 0);

    return products;
  } catch (error: any) {
    console.error("Error fetching all products from Firestore:", error);
    return { error: `Failed to fetch products. ${error.message}` };
  }
}

export async function getProductFromDB(productId: string): Promise<Product | null | { error: string }> {
  try {
    const productRef = doc(db, "products", productId);
    const docSnap = await getDoc(productRef);

    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data();
      
    let parsedSizes: ProductSize[] = [];
    if (Array.isArray(data.sizes)) {
      parsedSizes = data.sizes
        .map(s => String(s).trim())
        .filter(s => ALL_SIZES.includes(s as ProductSize)) as ProductSize[];
    } else if (typeof data.sizes === 'string' && data.sizes.length > 0) {
      parsedSizes = data.sizes.split(',')
        .map(s => s.trim())
        .filter(s => ALL_SIZES.includes(s as ProductSize)) as ProductSize[];
    }
    
    const mappedProduct: Product = {
      id: docSnap.id,
      name: data.name || "Unnamed Product",
      description: data.description || "",
      price: typeof data.price === 'number' ? data.price : 0,
      imageUrls: ensureImageUrls(data),
      category: (ALL_CATEGORIES.includes(data.category) ? data.category : ALL_CATEGORIES[0]) as ProductCategory,
      sizes: parsedSizes.length > 0 ? parsedSizes : ['One Size'],
      sellerId: data.sellerId || "unknown_seller",
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
    };

    return mappedProduct;

  } catch (error: any) {
     console.error("Error fetching product from Firestore:", error);
    return { error: `Failed to fetch product details. ${error.message}` };
  }
}
