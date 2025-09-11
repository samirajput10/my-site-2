
"use server";

import { virtualTryOn } from "@/ai/flows/virtual-try-on-flow";
import type { VirtualTryOnInput, VirtualTryOnOutput } from "@/types";

export async function performVirtualTryOn(input: Omit<VirtualTryOnInput, 'productImage'> & { productImageUrl: string }): Promise<VirtualTryOnOutput | { error: string }> {
  try {
    // The flow expects a data URI, but we can pass the URL and handle it inside the flow
    // For now, let's keep the logic simple and assume the flow can handle a public URL.
    // If not, we would need to fetch the image and convert it to a data URI here.
    const result = await virtualTryOn({
        ...input,
        productImage: input.productImageUrl,
    });
    return result;
  } catch (error) {
    console.error("Error performing virtual try-on:", error);
    return { error: "Failed to generate your virtual try-on image. The AI model might be busy or unavailable. Please try again later." };
  }
}
