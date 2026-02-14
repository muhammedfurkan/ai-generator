import { describe, it, expect } from "vitest";
import { appRouter } from "../routers";
import type { Context } from "../_core/context";

describe("Favorites Router", () => {
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

  describe("toggle", () => {
    it("should toggle favorite status", async () => {
      // Assuming imageId 1 exists
      const result = await caller.favorites.toggle({ imageId: 1 });

      expect(result).toHaveProperty("isFavorited");
      expect(typeof result.isFavorited).toBe("boolean");
    });

    it("should toggle back to original state", async () => {
      // First toggle
      const firstResult = await caller.favorites.toggle({ imageId: 1 });
      const firstState = firstResult.isFavorited;

      // Second toggle
      const secondResult = await caller.favorites.toggle({ imageId: 1 });
      const secondState = secondResult.isFavorited;

      // Should be opposite
      expect(secondState).toBe(!firstState);
    });
  });

  describe("getFavoriteIds", () => {
    it("should return array of favorite image IDs", async () => {
      const result = await caller.favorites.getFavoriteIds();

      expect(result).toHaveProperty("imageIds");
      expect(Array.isArray(result.imageIds)).toBe(true);
    });
  });

  describe("list", () => {
    it("should return favorite images list", async () => {
      const result = await caller.favorites.list({ limit: 10 });

      expect(Array.isArray(result)).toBe(true);
    });

    it("should respect limit parameter", async () => {
      const result = await caller.favorites.list({ limit: 5 });

      expect(result.length).toBeLessThanOrEqual(5);
    });
  });

  describe("isFavorited", () => {
    it("should check if image is favorited", async () => {
      // Add to favorites first
      await caller.favorites.toggle({ imageId: 1 });

      const result = await caller.favorites.isFavorited({ imageId: 1 });

      expect(result).toHaveProperty("isFavorited");
      expect(typeof result.isFavorited).toBe("boolean");
    });
  });

  describe("integration", () => {
    it("should add to favorites and appear in list", async () => {
      // Toggle to add
      const toggleResult = await caller.favorites.toggle({ imageId: 2 });

      if (toggleResult.isFavorited) {
        // Check if appears in list
        const listResult = await caller.favorites.list({ limit: 100 });
        const found = listResult.some((img: any) => img.id === 2);

        expect(found).toBe(true);

        // Check if appears in IDs
        const idsResult = await caller.favorites.getFavoriteIds();
        expect(idsResult.imageIds).toContain(2);
      }
    });
  });
});
