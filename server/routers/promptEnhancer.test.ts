import { describe, it, expect } from "vitest";
import { appRouter } from "../routers";
import type { Context } from "../_core/context";

describe("Prompt Enhancer Router", () => {
  const mockContext: Context = {
    user: {
      id: 1,
      openId: "test-user",
      name: "Test User",
      email: "test@example.com",
      loginMethod: "google",
      role: "user",
      credits: 100,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {} as any,
    res: {} as any,
  };

  const caller = appRouter.createCaller(mockContext);

  describe("enhance", () => {
    it("should enhance a short prompt", async () => {
      const result = await caller.promptEnhancer.enhance({
        prompt: "mountain",
      });

      expect(result).toHaveProperty("original");
      expect(result).toHaveProperty("enhanced");
      expect(result.original).toBe("mountain");
      expect(result.enhanced.length).toBeGreaterThan(result.original.length);
    }, 15000); // 15 second timeout

    it("should enhance Turkish prompt", async () => {
      const result = await caller.promptEnhancer.enhance({
        prompt: "dağ",
      });

      expect(result).toHaveProperty("original");
      expect(result).toHaveProperty("enhanced");
      expect(result.original).toBe("dağ");
      expect(result.enhanced.length).toBeGreaterThan(result.original.length);
      // Should be in English
      expect(result.enhanced.toLowerCase()).toContain("mountain");
    }, 15000); // 15 second timeout

    it("should enhance simple prompt to detailed one", async () => {
      const result = await caller.promptEnhancer.enhance({
        prompt: "cat",
      });

      expect(result.enhanced.length).toBeGreaterThan(50);
      // Should contain quality enhancers
      const lowerEnhanced = result.enhanced.toLowerCase();
      const hasQualityWords = 
        lowerEnhanced.includes("detailed") ||
        lowerEnhanced.includes("professional") ||
        lowerEnhanced.includes("8k") ||
        lowerEnhanced.includes("quality");
      
      expect(hasQualityWords).toBe(true);
    }, 15000); // 15 second timeout

    it("should reject empty prompt", async () => {
      await expect(
        caller.promptEnhancer.enhance({ prompt: "" })
      ).rejects.toThrow();
    });

    it("should reject very long prompt", async () => {
      const longPrompt = "a".repeat(501);
      
      await expect(
        caller.promptEnhancer.enhance({ prompt: longPrompt })
      ).rejects.toThrow();
    });
  });
});
