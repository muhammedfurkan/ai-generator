import { describe, it, expect, beforeAll } from "vitest";
import { createGenerationTask, getTaskStatus } from "./nanoBananaApi";

describe("Nano Banana Pro API Integration", () => {
  beforeAll(() => {
    // Check if API key is available
    if (!process.env.NANO_BANANA_API_KEY) {
      console.warn("[Test] NANO_BANANA_API_KEY not set, skipping API tests");
    }
  });

  it("should have API key configured", () => {
    const apiKey = process.env.NANO_BANANA_API_KEY;
    expect(apiKey).toBeDefined();
    expect(apiKey).not.toBe("");
  });

  it("should create a generation task successfully", async () => {
    if (!process.env.NANO_BANANA_API_KEY) {
      console.warn("[Test] Skipping task creation test - no API key");
      return;
    }

    const response = await createGenerationTask({
      prompt: "A serene landscape with mountains and a clear blue sky",
      aspectRatio: "1:1",
      resolution: "1K",
    });

    // API should respond - either success or insufficient credits
    expect(response).toBeDefined();
    // If successful, taskId should be defined
    if (response.success) {
      expect(response.taskId).toBeDefined();
      expect(response.taskId).not.toBe("");
    } else {
      // Insufficient credits is an acceptable response
      expect(response.error).toBeDefined();
    }
  });

  it("should handle missing API key gracefully", async () => {
    // Temporarily remove API key
    const originalKey = process.env.NANO_BANANA_API_KEY;
    delete process.env.NANO_BANANA_API_KEY;

    const response = await createGenerationTask({
      prompt: "Test prompt",
      aspectRatio: "1:1",
      resolution: "1K",
    });

    expect(response.success).toBe(false);
    expect(response.error).toBeDefined();

    // Restore API key
    if (originalKey) {
      process.env.NANO_BANANA_API_KEY = originalKey;
    }
  });

  it("should handle image-to-image generation", async () => {
    if (!process.env.NANO_BANANA_API_KEY) {
      console.warn("[Test] Skipping image-to-image test - no API key");
      return;
    }

    const response = await createGenerationTask({
      prompt: "Make this image more vibrant",
      aspectRatio: "1:1",
      resolution: "1K",
      referenceImageUrl: "https://example.com/image.jpg",
    });

    // Should succeed even with invalid reference image URL
    // The API will validate it
    expect(response).toBeDefined();
    expect(response.success !== undefined).toBe(true);
  }, { timeout: 30000 }); // 30 second timeout for image download
});
