import { describe, it, expect, beforeEach, vi } from "vitest";
import { generationRouter } from "./generation";
import { getUserById } from "../db";

vi.mock("../db");
vi.mock("../nanoBananaApi");
vi.mock("../storage", () => ({
  storagePut: vi.fn().mockResolvedValue({
    url: "https://example.com/image.png",
  }),
}));

describe("Generation Router", () => {
  const mockUser = {
    id: 1,
    openId: "test-user",
    name: "Test User",
    email: "test@example.com",
    credits: 100,
    role: "user" as const,
    loginMethod: "test",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const mockContext = {
    user: mockUser,
    req: {} as any,
    res: {} as any,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getCredits", () => {
    it("should return user credits", async () => {
      vi.mocked(getUserById).mockResolvedValue(mockUser);

      const caller = generationRouter.createCaller(mockContext);
      const result = await caller.getCredits();

      expect(result.credits).toBe(100);
      expect(result.creditCosts).toBeDefined();
      expect(result.creditCosts["1K"]).toBe(10);
      expect(result.creditCosts["2K"]).toBe(15);
      expect(result.creditCosts["4K"]).toBe(20);
    });
  });

  describe("generateImage validation", () => {
    it("should reject empty prompt", async () => {
      vi.mocked(getUserById).mockResolvedValue(mockUser);

      const caller = generationRouter.createCaller(mockContext);

      try {
        await caller.generateImage({
          prompt: "",
          aspectRatio: "1:1",
          resolution: "1K",
        });
        expect.fail("Should have thrown error");
      } catch (error: any) {
        expect(error.message).toContain("Prompt gereklidir");
      }
    });

    it("should reject generation with insufficient credits", async () => {
      const lowCreditUser = { ...mockUser, credits: 5 };
      vi.mocked(getUserById).mockResolvedValue(lowCreditUser);

      const ctx = { ...mockContext, user: lowCreditUser };
      const caller = generationRouter.createCaller(ctx);

      try {
        await caller.generateImage({
          prompt: "Test prompt",
          aspectRatio: "1:1",
          resolution: "1K",
        });
        expect.fail("Should have thrown error");
      } catch (error: any) {
        expect(error.message).toContain("Yetersiz kredi");
      }
    });
  });
});
