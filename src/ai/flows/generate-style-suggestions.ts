'use server';

/**
 * @fileOverview AI agent that generates personalized fashion suggestions based on a text prompt.
 *
 * - generateStyleSuggestions - A function that generates fashion suggestions.
 * - GenerateStyleSuggestionsInput - The input type for the generateStyleSuggestions function.
 * - GenerateStyleSuggestionsOutput - The return type for the generateStyleSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateStyleSuggestionsInputSchema = z.object({
  prompt: z
    .string()
    .describe(
      'A text prompt describing the desired style or occasion for the fashion suggestions.'
    ),
});
export type GenerateStyleSuggestionsInput = z.infer<
  typeof GenerateStyleSuggestionsInputSchema
>;

const GenerateStyleSuggestionsOutputSchema = z.object({
  suggestions: z
    .string()
    .describe('Personalized fashion suggestions based on the input prompt.'),
});
export type GenerateStyleSuggestionsOutput = z.infer<
  typeof GenerateStyleSuggestionsOutputSchema
>;

export async function generateStyleSuggestions(
  input: GenerateStyleSuggestionsInput
): Promise<GenerateStyleSuggestionsOutput> {
  return generateStyleSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateStyleSuggestionsPrompt',
  input: {schema: GenerateStyleSuggestionsInputSchema},
  output: {schema: GenerateStyleSuggestionsOutputSchema},
  prompt: `You are a personal fashion stylist. Based on the user's prompt, generate personalized fashion suggestions.

Prompt: {{{prompt}}}`,
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
