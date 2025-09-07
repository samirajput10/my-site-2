
'use server';
/**
 * @fileOverview AI agent that generates a virtual try-on image.
 *
 * - virtualTryOn - A function that generates an image of a person wearing a specified garment.
 * - VirtualTryOnInput - The input type for the function.
 * - VirtualTryOnOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const VirtualTryOnInputSchema = z.object({
  userImage: z
    .string()
    .describe(
      "A photo of the user, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  productImage: z.string().describe(
      "A photo of the product (e.g., a shirt, dress), as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
  ),
  productName: z.string().describe("The name of the product."),
  productCategory: z.string().describe("The category of the product (e.g., 'Tops', 'Dresses').")
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


export async function virtualTryOn(
  input: VirtualTryOnInput
): Promise<VirtualTryOnOutput> {
  return virtualTryOnFlow(input);
}

const virtualTryOnFlow = ai.defineFlow(
  {
    name: 'virtualTryOnFlow',
    inputSchema: VirtualTryOnInputSchema,
    outputSchema: VirtualTryOnOutputSchema,
  },
  async (input) => {
    
    // Note: Using a specific model known for image-to-image tasks.
    const { media } = await ai.generate({
        model: 'googleai/gemini-2.5-flash-image-preview',
        prompt: [
            { media: { url: input.userImage, contentType: 'image/jpeg' } },
            { media: { url: input.productImage, contentType: 'image/png' } }, // Assuming product images might have transparency
            { text: `Create a realistic image of the person in the first photo wearing the clothing item from the second photo, which is a ${input.productName} (${input.productCategory}). The final image should show the person clearly wearing the garment. Maintain the original person's pose and background as much as possible.` },
        ],
        config: {
            // This is crucial for models that can return multiple types of media.
            responseModalities: ['IMAGE'],
        },
    });

    if (!media?.url) {
      throw new Error("The AI model did not return an image. Please try again.");
    }

    return {
      generatedImage: media.url,
    };
  }
);
