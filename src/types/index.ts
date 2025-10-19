
import { z } from 'zod';

export type ProductCategory = "Necklaces" | "Rings" | "Bracelets" | "Earrings" | "Anklets" | "Body Jewelry";
export const ALL_CATEGORIES: ProductCategory[] = ["Necklaces", "Rings", "Bracelets", "Earrings", "Anklets", "Body Jewelry"];

export type ProductSize = "6" | "7" | "8" | "9" | "Adjustable" | "One Size";
export const ALL_SIZES: ProductSize[] = ["6", "7", "8", "9", "Adjustable", "One Size"];

export type Product = {
  id: string; // Firestore document ID when fetched
  name: string;
  description: string;
  price: number;
  originalPrice?: number; // Price before discount
  imageUrls: string[];
  category: ProductCategory;
  sizes: ProductSize[];
  stock: number; // Added stock quantity
  sellerId: string; 
  createdAt?: string; // Serialized Firestore Timestamp (ISO string)
  updatedAt?: string; // Serialized Firestore Timestamp (ISO string)
};

// Zod schema for validating Product data, can be used in Genkit flows.
export const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.number(),
  originalPrice: z.number().optional(),
  imageUrls: z.array(z.string()),
  category: z.enum(ALL_CATEGORIES),
  sizes: z.array(z.enum(ALL_SIZES)),
  stock: z.number().int().min(0),
  sellerId: z.string(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type CartItem = Product & {
  quantity: number;
};

export type WishlistItem = Product;
