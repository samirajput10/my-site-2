
import { z } from 'zod';

export type ProductCategory = "T-Shirts" | "Dresses" | "Pants" | "Jackets" | "Skirts" | "Loungewear" | "Tracksuits" | "Menswear" | "Childwear";
export const ALL_CATEGORIES: ProductCategory[] = ["T-Shirts", "Dresses", "Pants", "Jackets", "Skirts", "Loungewear", "Tracksuits", "Menswear", "Childwear"];

export type ProductSize = "XS" | "S" | "M" | "L" | "XL" | "XXL" | "One Size";
export const ALL_SIZES: ProductSize[] = ["XS", "S", "M", "L", "XL", "XXL", "One Size"];

export type ProductSeason = "Summer" | "Winter";
export const ALL_SEASONS: ProductSeason[] = ["Summer", "Winter"];

export type ChildAgeRange = "0-1Y" | "1-2Y" | "2-4Y" | "4-6Y" | "6-8Y" | "8-10Y";
export const ALL_AGE_RANGES: ChildAgeRange[] = ["0-1Y", "1-2Y", "2-4Y", "4-6Y", "6-8Y", "8-10Y"];

export type ProductColor = "Black" | "White" | "Gray" | "Red" | "Blue" | "Green" | "Yellow" | "Purple" | "Pink" | "Orange" | "Brown" | "Beige" | "Multi-color";
export const ALL_COLORS: ProductColor[] = ["Black", "White", "Gray", "Red", "Blue", "Green", "Yellow", "Purple", "Pink", "Orange", "Brown", "Beige", "Multi-color"];


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
  color?: ProductColor; // Added color
  season?: ProductSeason; // Added season
  ageRange?: ChildAgeRange; // New: Age range for childwear
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
  color: z.enum(ALL_COLORS).optional(),
  season: z.enum(ALL_SEASONS).optional(),
  ageRange: z.enum(ALL_AGE_RANGES).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type CartItem = Product & {
  quantity: number;
};

export type WishlistItem = Product;
