
'use server';

/**
 * @fileOverview AI agent that generates product details from an image URL.
 *
 * - generateProductDetailsFromImage - A function that generates a product name, description, and category from an image.
 * - GenerateProductDetailsFromImageInput - The input type for the function.
 * - GenerateProductDetailsFromImageOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { ALL_CATEGORIES } from '@/types';

export const GenerateProductDetailsFromImageInputSchema = z.object({
  imageUrl: z
    .string()
    .url()
    .describe(
      'The public URL of the product image to analyze.'
    ),
});
export type GenerateProductDetailsFromImageInput = z.infer<
  typeof GenerateProductDetailsFromImageInputSchema
>;

export const GenerateProductDetailsFromImageOutputSchema = z.object({
  name: z.string().describe('A creative and descriptive name for the product.'),
  description: z.string().describe('A compelling and detailed description for the product.'),
  category: z.enum(ALL_CATEGORIES).describe('The most fitting category for the product.'),
});
export type GenerateProductDetailsFromImageOutput = z.infer<
  typeof GenerateProductDetailsFromImageOutputSchema
>;

export async function generateProductDetailsFromImage(
  input: GenerateProductDetailsFromImageInput
): Promise<GenerateProductDetailsFromImageOutput> {
  return generateProductDetailsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateProductDetailsPrompt',
  input: {schema: GenerateProductDetailsFromImageInputSchema},
  output: {schema: GenerateProductDetailsFromImageOutputSchema},
  prompt: `You are an expert e-commerce merchandiser for a jewelry store called Lustra.
  
Analyze the following image of a jewelry product and generate a product name, description, and select the best category.
The category must be one of the following: ${ALL_CATEGORIES.join(', ')}.

The tone should be elegant, appealing, and descriptive, suitable for a high-quality jewelry brand.

Image: {{media url=imageUrl}}`,
});

const generateProductDetailsFlow = ai.defineFlow(
  {
    name: 'generateProductDetailsFlow',
    inputSchema: GenerateProductDetailsFromImageInputSchema,
    outputSchema: GenerateProductDetailsFromImageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
