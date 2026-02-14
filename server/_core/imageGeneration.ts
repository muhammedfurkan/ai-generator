/**
 * Image generation helper using internal ImageService
 *
 * Example usage:
 *   const { url: imageUrl } = await generateImage({
 *     prompt: "A serene landscape with mountains"
 *   });
 *
 * For editing:
 *   const { url: imageUrl } = await generateImage({
 *     prompt: "Add a rainbow to this landscape",
 *     originalImages: [{
 *       url: "https://example.com/original.jpg",
 *       mimeType: "image/jpeg"
 *     }]
 *   });
 */
import { createGenerationTask, pollTaskCompletion } from "../nanoBananaApi";
import { storagePut } from "../storage";
import { nanoid } from "nanoid";

export type GenerateImageOptions = {
  prompt: string;
  originalImages?: Array<{
    url?: string;
    b64Json?: string;
    mimeType?: string;
  }>;
};

export type GenerateImageResponse = {
  url?: string;
};

export async function generateImage(
  options: GenerateImageOptions
): Promise<GenerateImageResponse> {
  const referenceImageUrl = options.originalImages?.[0]?.url;

  console.log(`[ImageGeneration] Starting generation with prompt: "${options.prompt.substring(0, 50)}..."`);
  if (referenceImageUrl) {
    console.log(`[ImageGeneration] Using reference image: ${referenceImageUrl}`);
  }

  // Create task using Nano Banana API (previously known as Nano Banana Pro)
  // We default to 1:1 aspect ratio and 2K resolution for standard enhancements
  const taskResponse = await createGenerationTask({
    prompt: options.prompt,
    aspectRatio: "1:1", // Default to square if not specified
    resolution: "2K",   // Good balance of quality and speed
    referenceImageUrl,
    model: "nano-banana-pro",
  });

  if (!taskResponse.success) {
    throw new Error(taskResponse.error || "Failed to create generation task");
  }

  const taskId = taskResponse.taskId;
  console.log(`[ImageGeneration] Task created with ID: ${taskId}, polling for completion...`);

  // Poll for completion (this might take 10-20 seconds)
  const externalImageUrl = await pollTaskCompletion(taskId);

  if (!externalImageUrl) {
    throw new Error("Image generation failed or timed out during polling");
  }

  console.log(`[ImageGeneration] Generation successful, downloading from: ${externalImageUrl}`);

  // Download and save to our storage (S3/R2) to persist it and standardized URL
  const imageResponse = await fetch(externalImageUrl);
  if (!imageResponse.ok) {
    throw new Error(`Failed to download generated image: ${imageResponse.statusText}`);
  }

  const arrayBuffer = await imageResponse.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const fileName = `generated/${nanoid()}.png`;
  // Use image/png as default for generated images
  const { url } = await storagePut(
    fileName,
    buffer,
    "image/png"
  );

  console.log(`[ImageGeneration] Image saved to storage: ${url}`);

  return { url };
}
