
import { z } from 'zod';

export type ProductCategory = "Tops" | "Dresses" | "Pants" | "Accessories" | "Shoes" | "Outerwear";
export const ALL_CATEGORIES: ProductCategory[] = ["Tops", "Dresses", "Pants", "Accessories", "Shoes", "Outerwear"];

export type ProductSize = "XS" | "S" | "M" | "L" | "XL" | "One Size";
export const ALL_SIZES: ProductSize[] = ["XS", "S", "M", "L", "XL", "One Size"];

export type Product = {
  id: string; // Firestore document ID when fetched
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: ProductCategory;
  sizes: ProductSize[];
  sellerId: string; 
  createdAt?: string; // Serialized Firestore Timestamp (ISO string)
};

// Zod schema for validating Product data, can be used in Genkit flows.
export const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.number(),
  imageUrl: z.string(),
  category: z.enum(ALL_CATEGORIES),
  sizes: z.array(z.enum(ALL_SIZES)),
  sellerId: z.string(),
  createdAt: z.string().optional(),
});

export type CartItem = Product & {
  quantity: number;
};

export type WishlistItem = Product;

export type Filters = {
  categories: ProductCategory[];
  sizes: ProductSize[];
  priceRange: { min: number; max: number };
  searchQuery?: string;
};
