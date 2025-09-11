
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
  imageUrls: string[];
  category: ProductCategory;
  sizes: ProductSize[];
  stock: number; // Added stock quantity
  sellerId: string; 
  createdAt?: string; // Serialized Firestore Timestamp (ISO string)
};

// Zod schema for validating Product data, can be used in Genkit flows.
export const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.number(),
  imageUrls: z.array(z.string()),
  category: z.enum(ALL_CATEGORIES),
  sizes: z.array(z.enum(ALL_SIZES)),
  stock: z.number().int().min(0), // Added stock validation
  sellerId: z.string(),
  createdAt: z.string().optional(),
});

export type CartItem = Product & {
  quantity: number;
};

export type WishlistItem = Product;

// Types for Virtual Try-On Flow
export const VirtualTryOnInputSchema = z.object({
  userImage: z
    .string()
    .describe(
      "A photo of the user, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  productImage: z.string().describe(
      "A photo of the product (e.g., a necklace, ring), as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
  ),
  productName: z.string().describe("The name of the product."),
  productCategory: z.string().describe("The category of the product (e.g., 'Necklaces', 'Rings').")
});
export type VirtualTryOnInput = z.infer<typeof VirtualTryOnInputSchema>;

export const VirtualTryOnOutputSchema = z.object({
  generatedImage: z
    .string()
    .describe(
      "The generated try-on image as a data URI, including MIME type and Base64 encoding."
    ),
});
export type VirtualTryOnOutput = z.infer<typeof VirtualTryOnOutputSchema>;
