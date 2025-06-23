
"use server";

import { rtdb } from '@/lib/firebase/config';
import type { Product, ProductCategory } from '@/types';
import { ALL_CATEGORIES } from '@/types';
import { ref, get, query, orderByChild } from 'firebase/database';

export async function getAllProductsFromDB(): Promise<Product[] | { error: string }> {
  try {
    const productsRef = ref(rtdb, 'products');
    // Note: For this query to be efficient, you must define an index in your Realtime Database rules.
    // ".indexOn": "createdAt"
    const q = query(productsRef, orderByChild('createdAt'));
    const snapshot = await get(q);

    if (!snapshot.exists()) {
      return [];
    }

    const productsData = snapshot.val();
    const products = Object.keys(productsData).map(key => {
      const data = productsData[key];
      const mappedProduct: Product = {
        id: key,
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
        createdAt: data.createdAt ? new Date(data.createdAt).toISOString() : undefined,
      };
      return mappedProduct;
    }).filter(product => product.name !== "Unnamed Product" || product.price !== 0);

    // RTDB returns items in ascending order, so we reverse the array for "newest first"
    return products.reverse();
  } catch (error: any) {
    console.error("Error fetching all products from Realtime Database:", error);
    return { error: `Failed to fetch products. ${error.message}` };
  }
}
