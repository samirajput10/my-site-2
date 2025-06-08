
"use server";

import { db } from '@/lib/firebase/config';
import type { Product, ProductCategory } from '@/types';
import { ALL_CATEGORIES } from '@/types';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';

export async function getAllProductsFromDB(): Promise<Product[] | { error: string }> {
  try {
    const productsRef = collection(db, 'products');
    // You might want to order them, e.g., by name or creation date
    // For now, let's fetch them as is, or you can add orderBy('name', 'asc')
    const q = query(productsRef, orderBy('createdAt', 'desc')); // Example: order by newest
    const querySnapshot = await getDocs(q);
    
    const products = querySnapshot.docs.map(doc => {
      const data = doc.data();
      // Robust mapping with defaults
      const mappedProduct: Product = {
        id: doc.id,
        name: data.name || "Unnamed Product",
        description: data.description || "",
        price: typeof data.price === 'number' ? data.price : 0,
        imageUrl: data.imageUrl || `https://placehold.co/300x450.png`,
        category: (ALL_CATEGORIES.includes(data.category) ? data.category : ALL_CATEGORIES[0]) as ProductCategory,
        sizes: Array.isArray(data.sizes) && data.sizes.length > 0 
               ? data.sizes.filter((s: any) => typeof s === 'string' && s.trim() !== '') 
               : (typeof data.sizes === 'string' && data.sizes.length > 0 
                  ? data.sizes.split(',').map((s: string) => s.trim()).filter(Boolean) 
                  : ['One Size']),
        sellerId: data.sellerId || "unknown_seller",
        createdAt: data.createdAt, // Keep as Firestore Timestamp or convert if needed
      };
      return mappedProduct;
    }).filter(product => product.name !== "Unnamed Product" || product.price !== 0); // Basic filter for invalid entries

    return products;
  } catch (error: any) {
    console.error("Error fetching all products from Firestore:", error);
    return { error: `Failed to fetch products. ${error.message}` };
  }
}
