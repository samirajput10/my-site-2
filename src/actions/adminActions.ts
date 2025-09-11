
"use server";

import { generateProductDetailsFromImage, type GenerateProductDetailsFromImageInput, type GenerateProductDetailsFromImageOutput } from "@/ai/flows/generate-product-details-flow";

export async function getProductDetailsFromImage(input: GenerateProductDetailsFromImageInput): Promise<GenerateProductDetailsFromImageOutput | { error: string }> {
  try {
    const result = await generateProductDetailsFromImage(input);
    return result;
  } catch (error) {
    console.error("Error generating product details:", error);
    return { error: "Failed to generate product details from image. Please try again." };
  }
}
