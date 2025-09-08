
'use server';
/**
 * @fileOverview AI agent that generates a virtual try-on image.
 *
 * - virtualTryOn - A function that generates an image of a person wearing a specified piece of jewelry.
 */

import {ai} from '@/ai/genkit';
import type { VirtualTryOnInput, VirtualTryOnOutput } from '@/types';
import { VirtualTryOnInputSchema, VirtualTryOnOutputSchema } from '@/types';


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
            // Added contentType for better model reliability
            { media: { url: input.userImage, contentType: 'image/jpeg' } },
            { media: { url: input.productImage, contentType: 'image/png' } }, // Assuming product images might have transparency
            { text: `Create a realistic image of the person in the first photo wearing the jewelry item from the second photo, which is a ${input.productName} (${input.productCategory}). The final image should show the person clearly wearing the piece of jewelry. Maintain the original person's pose and background as much as possible.` },
        ],
        config: {
            // This is crucial for models that can return multiple types of media.
            responseModalities: ['IMAGE'],
             safetySettings: [
              {
                category: 'HARM_CATEGORY_HARASSMENT',
                threshold: 'BLOCK_NONE',
              },
               {
                category: 'HARM_CATEGORY_HATE_SPEECH',
                threshold: 'BLOCK_NONE',
              },
               {
                category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                threshold: 'BLOCK_NONE',
              },
               {
                category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                threshold: 'BLOCK_NONE',
              },
            ]
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

