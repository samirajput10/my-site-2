import type { Product, ProductCategory, ProductSize } from '@/types';

const PLACEHOLDER_IMAGE_URL = 'https://placehold.co/';

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Elegant Summer Maxi Dress',
    description: 'A beautiful and flowy maxi dress perfect for summer evenings. Made from lightweight, breathable fabric.',
    price: 79.99,
    imageUrl: `${PLACEHOLDER_IMAGE_URL}300x450.png`,
    category: 'Dresses',
    sizes: ['S', 'M', 'L'],
  },
  {
    id: '2',
    name: 'Classic Cotton Tee',
    description: 'A comfortable and versatile cotton t-shirt. A wardrobe staple available in various colors.',
    price: 24.99,
    imageUrl: `${PLACEHOLDER_IMAGE_URL}300x450.png`,
    category: 'Tops',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
  },
  {
    id: '3',
    name: 'Slim Fit Denim Jeans',
    description: 'Stylish slim-fit jeans made with stretch denim for maximum comfort and a modern look.',
    price: 89.99,
    imageUrl: `${PLACEHOLDER_IMAGE_URL}300x450.png`,
    category: 'Pants',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: '4',
    name: 'Leather Crossbody Bag',
    description: 'A chic and practical leather crossbody bag with multiple compartments. Perfect for everyday use.',
    price: 120.00,
    imageUrl: `${PLACEHOLDER_IMAGE_URL}300x450.png`,
    category: 'Accessories',
    sizes: ['One Size'],
  },
  {
    id: '5',
    name: 'Comfortable Ankle Boots',
    description: 'Stylish and comfortable ankle boots, perfect for autumn and winter seasons. Features a side zipper.',
    price: 150.00,
    imageUrl: `${PLACEHOLDER_IMAGE_URL}300x450.png`,
    category: 'Shoes',
    sizes: ['S', 'M', 'L'], // Typically shoe sizes are numbers, but using SML for consistency in mock data
  },
  {
    id: '6',
    name: 'Lightweight Trench Coat',
    description: 'A classic lightweight trench coat, ideal for transitional weather. Water-resistant material.',
    price: 135.50,
    imageUrl: `${PLACEHOLDER_IMAGE_URL}300x450.png`,
    category: 'Outerwear',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: '7',
    name: 'Silk Scarf',
    description: 'Luxurious silk scarf with a vibrant print. Adds a touch of elegance to any outfit.',
    price: 45.00,
    imageUrl: `${PLACEHOLDER_IMAGE_URL}300x450.png`,
    category: 'Accessories',
    sizes: ['One Size'],
  },
  {
    id: '8',
    name: 'Knit Sweater',
    description: 'Cozy knit sweater made from a soft wool blend. Perfect for chilly days.',
    price: 65.00,
    imageUrl: `${PLACEHOLDER_IMAGE_URL}300x450.png`,
    category: 'Tops',
    sizes: ['S', 'M', 'L'],
  },
  {
    id: '9',
    name: 'High-Waisted Trousers',
    description: 'Elegant high-waisted trousers with a wide-leg cut. Suitable for office or casual wear.',
    price: 70.00,
    imageUrl: `${PLACEHOLDER_IMAGE_URL}300x450.png`,
    category: 'Pants',
    sizes: ['XS', 'S', 'M'],
  },
  {
    id: '10',
    name: 'Minimalist Sneakers',
    description: 'Clean and minimalist sneakers for a casual, modern look. Comfortable for all-day wear.',
    price: 95.00,
    imageUrl: `${PLACEHOLDER_IMAGE_URL}300x450.png`,
    category: 'Shoes',
    sizes: ['M', 'L', 'XL'],
  },
];

export const getProductById = (id: string): Product | undefined => {
  return mockProducts.find(product => product.id === id);
};

export const getProducts = (filters?: { category?: ProductCategory, searchQuery?: string }): Product[] => {
  let products = mockProducts;
  if (filters?.category) {
    products = products.filter(p => p.category === filters.category);
  }
  if (filters?.searchQuery) {
    products = products.filter(p => p.name.toLowerCase().includes(filters.searchQuery!.toLowerCase()));
  }
  return products;
};
