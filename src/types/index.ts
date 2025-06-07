export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: ProductCategory;
  sizes: ProductSize[];
  sellerId?: string; // Optional for now
};

export type ProductCategory = "Tops" | "Dresses" | "Pants" | "Accessories" | "Shoes" | "Outerwear";
export const ALL_CATEGORIES: ProductCategory[] = ["Tops", "Dresses", "Pants", "Accessories", "Shoes", "Outerwear"];

export type ProductSize = "XS" | "S" | "M" | "L" | "XL" | "One Size";
export const ALL_SIZES: ProductSize[] = ["XS", "S", "M", "L", "XL", "One Size"];

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
