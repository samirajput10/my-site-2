
'use server';

/**
 * @fileOverview AI agent that generates personalized clothing suggestions and recommends products.
 *
 * - generateStyleSuggestions - A function that generates clothing suggestions and product recommendations.
 * - GenerateStyleSuggestionsInput - The input type for the function.
 * - GenerateStyleSuggestionsOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { getAllProductsFromDB } from '@/actions/productActions';
import { ProductSchema } from '@/types';

const GenerateStyleSuggestionsInputSchema = z.object({
  prompt: z
    .string()
    .describe(
      'A text prompt describing the desired style or occasion for the clothing suggestions.'
    ),
});
export type GenerateStyleSuggestionsInput = z.infer<
  typeof GenerateStyleSuggestionsInputSchema
>;

const GenerateStyleSuggestionsOutputSchema = z.object({
  suggestions: z
    .string()
    .describe('Personalized clothing suggestions based on the input prompt.'),
  recommendedProducts: z.array(ProductSchema).optional().describe('A list of up to 4 recommended products from the store that match the style advice.'),
});
export type GenerateStyleSuggestionsOutput = z.infer<
  typeof GenerateStyleSuggestionsOutputSchema
>;

/**
 * Tool to find relevant products from the database based on a search query.
 * The AI model will decide when to call this tool.
 */
const findProductsTool = ai.defineTool(
  {
    name: 'findProducts',
    description: 'Finds relevant clothing from the store catalog based on a description or category.',
    inputSchema: z.object({
      query: z.string().describe('A search query describing the products to find, like "blue summer dress" or "formal black pants".'),
    }),
    outputSchema: z.object({
        products: z.array(ProductSchema).describe('A list of products that match the query.'),
    }),
  },
  async (input) => {
    console.log(`[findProducts tool] Searching for: ${input.query}`);
    const allProductsResult = await getAllProductsFromDB();
    if ('error' in allProductsResult) {
      console.error("Error fetching products in tool:", allProductsResult.error);
      return { products: [] };
    }
    
    const query = input.query.toLowerCase();
    const keywords = query.split(' ').filter(kw => kw.length > 2);

    const relevantProducts = allProductsResult.filter(product => {
      const productText = `${product.name} ${product.description} ${product.category}`.toLowerCase();
      // Check if all keywords are present in the product info
      return keywords.every(kw => productText.includes(kw));
    }).slice(0, 4); // Return a max of 4 products to avoid overloading the AI's context window

    console.log(`[findProducts tool] Found ${relevantProducts.length} products.`);
    return { products: relevantProducts };
  }
);


export async function generateStyleSuggestions(
  input: GenerateStyleSuggestionsInput
): Promise<GenerateStyleSuggestionsOutput> {
  return generateStyleSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateStyleSuggestionsPrompt',
  input: {schema: GenerateStyleSuggestionsInputSchema},
  output: {schema: GenerateStyleSuggestionsOutputSchema},
  tools: [findProductsTool],
  prompt: `You are a personal stylist for an e-commerce clothing store called Velbric. Based on the user's prompt, generate personalized clothing suggestions.

After giving the style advice, you MUST use the findProducts tool to find relevant products from the store catalog to recommend to the user. Include these products in the 'recommendedProducts' field of your response.

User Prompt: {{{prompt}}}`,
});

const generateStyleSuggestionsFlow = ai.defineFlow(
  {
    name: 'generateStyleSuggestionsFlow',
    inputSchema: GenerateStyleSuggestionsInputSchema,
    outputSchema: GenerateStyleSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
