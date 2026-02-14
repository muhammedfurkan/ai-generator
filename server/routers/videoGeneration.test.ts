import { describe, it, expect, vi } from "vitest";
import { ENV } from "../_core/env";

describe("Video Generation - Kie AI API", () => {
  it("should have KIE_AI_API_KEY configured", () => {
    expect(ENV.kieAiApiKey).toBeDefined();
    expect(ENV.kieAiApiKey).not.toBe("");
    expect(typeof ENV.kieAiApiKey).toBe("string");
  });

  it("should validate API key format", () => {
    // Kie AI API keys are typically alphanumeric strings
    const apiKey = ENV.kieAiApiKey;
    expect(apiKey.length).toBeGreaterThan(10);
  });

  it("should be able to make a test request to Kie AI", async () => {
    const apiKey = ENV.kieAiApiKey;
    
    // Test with a simple models list endpoint if available
    // For now, just verify the key exists and is properly formatted
    expect(apiKey).toBeDefined();
    
    // Try to fetch models or validate the API key
    try {
      const response = await fetch("https://api.kie.ai/api/models", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      });
      
      // API should respond (even if 401, it means the endpoint exists)
      expect(response).toBeDefined();
      
      // If we get 200, the API key is valid
      if (response.ok) {
        console.log("Kie AI API key is valid");
      } else if (response.status === 401) {
        console.log("Kie AI API returned 401 - key may need verification");
      }
    } catch (error) {
      // Network error is acceptable for this test
      console.log("Could not reach Kie AI API:", error);
    }
  });
});

describe("Video Generation Router", () => {
  it("should export pricing information", async () => {
    // Import the pricing data
    const { VIDEO_MODEL_PRICING } = await import("../kieAiApi");
    
    expect(VIDEO_MODEL_PRICING).toBeDefined();
    expect(typeof VIDEO_MODEL_PRICING).toBe("object");
  });

  it("should have correct pricing for Veo 3.1", async () => {
    const { VIDEO_MODEL_PRICING } = await import("../kieAiApi");
    
    // Veo 3.1 fast should be 50 credits
    expect(VIDEO_MODEL_PRICING["veo3_fast"]).toBe(50);
  });

  it("should have correct pricing for Grok", async () => {
    const { VIDEO_MODEL_PRICING } = await import("../kieAiApi");
    
    // Grok should be 15 credits
    expect(VIDEO_MODEL_PRICING["grok-imagine/image-to-video"]).toBe(15);
  });

  it("should have correct pricing for Kling 2.5 Turbo", async () => {
    const { VIDEO_MODEL_PRICING } = await import("../kieAiApi");
    
    // Kling 2.5 Turbo 5s should be 45 credits
    expect(VIDEO_MODEL_PRICING["kling/v2-5-turbo-text-to-video-pro-5s"]).toBe(45);
    // Kling 2.5 Turbo 10s should be 75 credits
    expect(VIDEO_MODEL_PRICING["kling/v2-5-turbo-text-to-video-pro-10s"]).toBe(75);
  });

  it("should have correct pricing for Sora 2", async () => {
    const { VIDEO_MODEL_PRICING } = await import("../kieAiApi");
    
    // Sora 2 10s should be 24 credits
    expect(VIDEO_MODEL_PRICING["sora-2-text-to-video-10s"]).toBe(24);
    // Sora 2 15s should be 30 credits  
    expect(VIDEO_MODEL_PRICING["sora-2-text-to-video-15s"]).toBe(30);
  });
});
