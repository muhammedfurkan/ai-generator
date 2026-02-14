import { describe, it, expect, vi } from "vitest";
import { notificationRouter, createNotification, checkLowCredits } from "./notification";

vi.mock("../db", () => ({
  getDb: vi.fn().mockResolvedValue({
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    offset: vi.fn().mockResolvedValue([]),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockResolvedValue([{ insertId: 1 }]),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
  }),
}));

describe("Notification Router", () => {
  it("should have list procedure", () => {
    expect(notificationRouter._def.procedures.list).toBeDefined();
  });

  it("should have getUnreadCount procedure", () => {
    expect(notificationRouter._def.procedures.getUnreadCount).toBeDefined();
  });

  it("should have markAsRead procedure", () => {
    expect(notificationRouter._def.procedures.markAsRead).toBeDefined();
  });

  it("should have markAllAsRead procedure", () => {
    expect(notificationRouter._def.procedures.markAllAsRead).toBeDefined();
  });

  it("should have delete procedure", () => {
    expect(notificationRouter._def.procedures.delete).toBeDefined();
  });

  it("should have clearAll procedure", () => {
    expect(notificationRouter._def.procedures.clearAll).toBeDefined();
  });
});

describe("createNotification helper", () => {
  it("should be a function", () => {
    expect(typeof createNotification).toBe("function");
  });

  it("should accept valid notification params", async () => {
    const params = {
      userId: 1,
      type: "generation_complete" as const,
      title: "Test Title",
      message: "Test Message",
      data: { imageId: 123 },
      actionUrl: "/gallery",
    };
    const result = await createNotification(params);
    expect(typeof result).toBe("boolean");
  });

  it("should accept all notification types", async () => {
    const types = ["generation_complete", "low_credits", "welcome", "referral_bonus", "system", "credit_added"] as const;
    for (const type of types) {
      const result = await createNotification({ userId: 1, type, title: `Test ${type}`, message: `Test message for ${type}` });
      expect(typeof result).toBe("boolean");
    }
  });
});

describe("checkLowCredits helper", () => {
  it("should be a function", () => {
    expect(typeof checkLowCredits).toBe("function");
  });

  it("should not throw for valid inputs", async () => {
    await expect(checkLowCredits(1, 50)).resolves.not.toThrow();
    await expect(checkLowCredits(1, 25)).resolves.not.toThrow();
    await expect(checkLowCredits(1, 100)).resolves.not.toThrow();
  });

  it("should handle zero credits", async () => {
    await expect(checkLowCredits(1, 0)).resolves.not.toThrow();
  });
});
