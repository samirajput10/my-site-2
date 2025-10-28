
"use server";

import { db } from '@/lib/firebase/config';
import type { Product, ProductCategory, ProductSeason, ProductSize, ChildAgeRange, ProductColor } from '@/types';
import { ALL_CATEGORIES, ALL_SEASONS, ALL_SIZES, ALL_AGE_RANGES, ALL_COLORS } from '@/types';
import { collection, getDocs, doc, getDoc, query, orderBy, limit, updateDoc, serverTimestamp } from "firebase/firestore";

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
        originalPrice: typeof data.originalPrice === 'number' ? data.originalPrice : undefined,
        imageUrls: ensureImageUrls(data),
        category: (ALL_CATEGORIES.includes(data.category) ? data.category : ALL_CATEGORIES[0]) as ProductCategory,
        sizes: parsedSizes.length > 0 ? parsedSizes : ['One Size'],
        stock: typeof data.stock === 'number' ? data.stock : 0,
        sellerId: data.sellerId || "unknown_seller",
        color: (ALL_COLORS.includes(data.color) ? data.color : undefined) as ProductColor | undefined,
        season: (ALL_SEASONS.includes(data.season) ? data.season : undefined) as ProductSeason | undefined,
        ageRange: (ALL_AGE_RANGES.includes(data.ageRange) ? data.ageRange : undefined) as ChildAgeRange | undefined,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : undefined,
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
      originalPrice: typeof data.originalPrice === 'number' ? data.originalPrice : undefined,
      imageUrls: ensureImageUrls(data),
      category: (ALL_CATEGORIES.includes(data.category) ? data.category : ALL_CATEGORIES[0]) as ProductCategory,
      sizes: parsedSizes.length > 0 ? parsedSizes : ['One Size'],
      stock: typeof data.stock === 'number' ? data.stock : 10, // Default to 10 if not set
      sellerId: data.sellerId || "unknown_seller",
      color: (ALL_COLORS.includes(data.color) ? data.color : undefined) as ProductColor | undefined,
      season: (ALL_SEASONS.includes(data.season) ? data.season : undefined) as ProductSeason | undefined,
      ageRange: (ALL_AGE_RANGES.includes(data.ageRange) ? data.ageRange : undefined) as ChildAgeRange | undefined,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : undefined,
    };

    return mappedProduct;

  } catch (error: any) {
     console.error("Error fetching product from Firestore:", error);
    return { error: `Failed to fetch product details. ${error.message}` };
  }
}

export async function updateProductInDB(productId: string, updatedData: Partial<Product>): Promise<{ success: boolean; error?: string }> {
    try {
        const productRef = doc(db, "products", productId);
        
        // Construct the data object for Firestore, ensuring correct types
        const dataToUpdate: any = { ...updatedData };
        
        // Convert price, stock and original price back to numbers if they are strings
        if (typeof dataToUpdate.price === 'string') {
            dataToUpdate.price = parseFloat(dataToUpdate.price);
        }
         if (typeof dataToUpdate.originalPrice === 'string') {
            dataToUpdate.originalPrice = parseFloat(dataToUpdate.originalPrice);
        } else if (dataToUpdate.originalPrice === '' || dataToUpdate.originalPrice === undefined) {
             dataToUpdate.originalPrice = null; // Use null to remove from Firestore if empty
        }

        if (typeof dataToUpdate.stock === 'string') {
            dataToUpdate.stock = parseInt(dataToUpdate.stock, 10);
        }

        // Handle sizes array
        if (typeof dataToUpdate.sizes === 'string') {
             const parsedSizes = dataToUpdate.sizes.split(',')
                .map((s: string) => s.trim())
                .filter((s: string) => ALL_SIZES.includes(s as ProductSize));
            dataToUpdate.sizes = parsedSizes.length > 0 ? parsedSizes : ['One Size'];
        }

        if (dataToUpdate.season === '') {
            dataToUpdate.season = null;
        }

        if (dataToUpdate.ageRange === '') {
            dataToUpdate.ageRange = null;
        }

        if (dataToUpdate.color === '') {
            dataToUpdate.color = null;
        }

        // Remove id from the data object as it shouldn't be updated
        delete dataToUpdate.id;
        
        // Add a server timestamp for the update
        dataToUpdate.updatedAt = serverTimestamp();

        await updateDoc(productRef, dataToUpdate);

        return { success: true };
    } catch (error: any) {
        console.error("Error updating product in Firestore:", error);
        return { success: false, error: `Failed to update product. ${error.message}` };
    }
}
