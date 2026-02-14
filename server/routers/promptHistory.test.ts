import { describe, it, expect, beforeEach } from "vitest";
import { appRouter } from "../routers";
import type { Context } from "../_core/context";
import {
  savePromptHistory,
  getPromptHistory,
  deletePromptHistory,
  clearPromptHistory,
} from "../db";

describe("Prompt History Router", () => {
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

  describe("save", () => {
    it("should save prompt to history", async () => {
      const result = await caller.promptHistory.save({
        prompt: "A beautiful sunset over mountains",
        aspectRatio: "16:9",
        resolution: "2K",
      });

      expect(result.success).toBe(true);
    });

    it("should reject empty prompt", async () => {
      await expect(
        caller.promptHistory.save({
          prompt: "",
          aspectRatio: "1:1",
          resolution: "1K",
        })
      ).rejects.toThrow();
    });
  });

  describe("list", () => {
    it("should return prompt history list", async () => {
      // First save a prompt
      await caller.promptHistory.save({
        prompt: "Test prompt for listing",
        aspectRatio: "1:1",
        resolution: "1K",
      });

      const history = await caller.promptHistory.list({ limit: 10 });

      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBeGreaterThan(0);
      expect(history[0]).toHaveProperty("prompt");
      expect(history[0]).toHaveProperty("aspectRatio");
      expect(history[0]).toHaveProperty("resolution");
      expect(history[0]).toHaveProperty("usageCount");
    });

    it("should respect limit parameter", async () => {
      const history = await caller.promptHistory.list({ limit: 5 });

      expect(history.length).toBeLessThanOrEqual(5);
    });
  });

  describe("delete", () => {
    it("should delete a specific prompt from history", async () => {
      // Save a prompt first
      await caller.promptHistory.save({
        prompt: "Prompt to be deleted",
        aspectRatio: "1:1",
        resolution: "1K",
      });

      // Get the history to find the ID
      const history = await caller.promptHistory.list({ limit: 1 });
      const historyId = history[0]?.id;

      if (historyId) {
        const result = await caller.promptHistory.delete({ historyId });
        expect(result.success).toBe(true);
      }
    });
  });

  describe("clearAll", () => {
    it("should clear all prompt history for user", async () => {
      // Save some prompts
      await caller.promptHistory.save({
        prompt: "Prompt 1",
        aspectRatio: "1:1",
        resolution: "1K",
      });
      await caller.promptHistory.save({
        prompt: "Prompt 2",
        aspectRatio: "16:9",
        resolution: "2K",
      });

      // Clear all
      const result = await caller.promptHistory.clearAll();
      expect(result.success).toBe(true);

      // Verify history is empty
      const history = await caller.promptHistory.list({ limit: 10 });
      expect(history.length).toBe(0);
    });
  });

  describe("usage count increment", () => {
    it("should increment usage count when same prompt is used again", async () => {
      const testPrompt = {
        prompt: "Repeated prompt test",
        aspectRatio: "1:1" as const,
        resolution: "1K" as const,
      };

      // Save first time
      await caller.promptHistory.save(testPrompt);

      // Get initial usage count
      let history = await caller.promptHistory.list({ limit: 1 });
      const initialCount = history[0]?.usageCount || 0;

      // Save again with same prompt
      await caller.promptHistory.save(testPrompt);

      // Check usage count increased
      history = await caller.promptHistory.list({ limit: 1 });
      const newCount = history[0]?.usageCount || 0;

      expect(newCount).toBe(initialCount + 1);
    });
  });
});
