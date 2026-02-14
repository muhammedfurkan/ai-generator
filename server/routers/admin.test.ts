import { describe, it, expect, vi, beforeEach } from "vitest";
import { appRouter } from "../routers";
import type { TrpcContext } from "../_core/context";
import * as db from "../db";

// Mock database functions
vi.mock("../db", () => ({
  getAllUsers: vi.fn(),
  getTotalUserCount: vi.fn(),
  deleteUser: vi.fn(),
  updateUserRole: vi.fn(),
  recordCreditTransaction: vi.fn(),
  getCreditTransactions: vi.fn(),
  getDashboardStats: vi.fn(),
  getSystemSetting: vi.fn(),
  updateSystemSetting: vi.fn(),
  getUserById: vi.fn(),
  addCredits: vi.fn(),
  deductCredits: vi.fn(),
  getDb: vi.fn(),
  upsertUser: vi.fn(),
  getUserByOpenId: vi.fn(),
  saveGeneratedImage: vi.fn(),
  getUserGeneratedImages: vi.fn(),
  getUserGeneratedImagesCount: vi.fn(),
}));

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@example.com",
    name: "Admin User",
    loginMethod: "google",
    role: "admin",
    credits: 1000,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return ctx;
}

describe("admin router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAllUsers", () => {
    it("should return users and total count", async () => {
      const mockUsers = [
        {
          id: 1,
          openId: "user1",
          name: "User 1",
          email: "user1@test.com",
          role: "user" as const,
          credits: 100,
          loginMethod: "google",
          createdAt: new Date(),
          updatedAt: new Date(),
          lastSignedIn: new Date(),
        },
      ];

      vi.mocked(db.getAllUsers).mockResolvedValue(mockUsers);
      vi.mocked(db.getTotalUserCount).mockResolvedValue(1);

      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.admin.getAllUsers({ limit: 50, offset: 0 });

      expect(result.users).toEqual(mockUsers);
      expect(result.total).toBe(1);
    });
  });

  describe("deleteUser", () => {
    it("should delete a user successfully", async () => {
      vi.mocked(db.deleteUser).mockResolvedValue(true);

      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.admin.deleteUser({ userId: 2 });

      expect(result.success).toBe(true);
      expect(db.deleteUser).toHaveBeenCalledWith(2);
    });

    it("should throw error if delete fails", async () => {
      vi.mocked(db.deleteUser).mockResolvedValue(false);

      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      await expect(caller.admin.deleteUser({ userId: 2 })).rejects.toThrow();
    });
  });

  describe("updateUserRole", () => {
    it("should update user role to admin", async () => {
      vi.mocked(db.updateUserRole).mockResolvedValue(true);

      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.admin.updateUserRole({
        userId: 2,
        role: "admin",
      });

      expect(result.success).toBe(true);
      expect(db.updateUserRole).toHaveBeenCalledWith(2, "admin");
    });

    it("should update user role to user", async () => {
      vi.mocked(db.updateUserRole).mockResolvedValue(true);

      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.admin.updateUserRole({
        userId: 2,
        role: "user",
      });

      expect(result.success).toBe(true);
      expect(db.updateUserRole).toHaveBeenCalledWith(2, "user");
    });
  });

  describe("addCreditsToUser", () => {
    it("should add credits and record transaction", async () => {
      const targetUser = {
        id: 2,
        openId: "user2",
        name: "User 2",
        email: "user2@test.com",
        role: "user" as const,
        credits: 50,
        loginMethod: "google",
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      };

      vi.mocked(db.getUserById).mockResolvedValue(targetUser);
      vi.mocked(db.addCredits).mockResolvedValue(true);
      vi.mocked(db.recordCreditTransaction).mockResolvedValue(true);

      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.admin.addCreditsToUser({
        userId: 2,
        amount: 100,
        reason: "Test add",
      });

      expect(result.success).toBe(true);
      expect(result.newBalance).toBe(150);
      expect(db.addCredits).toHaveBeenCalledWith(2, 100);
      expect(db.recordCreditTransaction).toHaveBeenCalledWith(
        2,
        "add",
        100,
        "Test add"
      );
    });

    it("should throw error if user not found", async () => {
      vi.mocked(db.getUserById).mockResolvedValue(undefined);

      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.admin.addCreditsToUser({
          userId: 999,
          amount: 100,
        })
      ).rejects.toThrow();
    });
  });

  describe("deductCreditsFromUser", () => {
    it("should deduct credits and record transaction", async () => {
      const targetUser = {
        id: 2,
        openId: "user2",
        name: "User 2",
        email: "user2@test.com",
        role: "user" as const,
        credits: 100,
        loginMethod: "google",
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      };

      vi.mocked(db.getUserById).mockResolvedValue(targetUser);
      vi.mocked(db.deductCredits).mockResolvedValue(true);
      vi.mocked(db.recordCreditTransaction).mockResolvedValue(true);

      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.admin.deductCreditsFromUser({
        userId: 2,
        amount: 50,
        reason: "Test deduct",
      });

      expect(result.success).toBe(true);
      expect(result.newBalance).toBe(50);
      expect(db.deductCredits).toHaveBeenCalledWith(2, 50);
    });

    it("should throw error if insufficient credits", async () => {
      const targetUser = {
        id: 2,
        openId: "user2",
        name: "User 2",
        email: "user2@test.com",
        role: "user" as const,
        credits: 30,
        loginMethod: "google",
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      };

      vi.mocked(db.getUserById).mockResolvedValue(targetUser);

      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.admin.deductCreditsFromUser({
          userId: 2,
          amount: 50,
        })
      ).rejects.toThrow("Insufficient credits");
    });
  });

  describe("getDashboardStats", () => {
    it("should return dashboard statistics", async () => {
      const mockStats = {
        totalUsers: 10,
        totalCreditsIssued: 5000,
        totalCreditsSold: 3000,
        totalGeneratedImages: 150,
      };

      vi.mocked(db.getDashboardStats).mockResolvedValue(mockStats);

      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.admin.getDashboardStats();

      expect(result).toEqual(mockStats);
    });
  });

  describe("updateSystemSetting", () => {
    it("should update system setting", async () => {
      vi.mocked(db.updateSystemSetting).mockResolvedValue(true);

      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.admin.updateSystemSetting({
        key: "package_1_price",
        value: "150",
        description: "Package 1 price in TL",
      });

      expect(result.success).toBe(true);
      expect(db.updateSystemSetting).toHaveBeenCalledWith(
        "package_1_price",
        "150",
        "Package 1 price in TL"
      );
    });
  });

  describe("bulkAddCredits", () => {
    it("should add credits to multiple users", async () => {
      const user1 = {
        id: 1,
        openId: "user1",
        name: "User 1",
        email: "user1@test.com",
        role: "user" as const,
        credits: 0,
        loginMethod: "google",
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      };

      const user2 = {
        id: 2,
        openId: "user2",
        name: "User 2",
        email: "user2@test.com",
        role: "user" as const,
        credits: 50,
        loginMethod: "google",
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      };

      vi.mocked(db.getUserById)
        .mockResolvedValueOnce(user1)
        .mockResolvedValueOnce(user2);

      vi.mocked(db.addCredits).mockResolvedValue(true);
      vi.mocked(db.recordCreditTransaction).mockResolvedValue(true);

      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.admin.bulkAddCredits({
        data: [
          { userId: 1, amount: 100, reason: "Bulk add 1" },
          { userId: 2, amount: 50, reason: "Bulk add 2" },
        ],
      });

      expect(result.results).toHaveLength(2);
      expect(result.results[0].success).toBe(true);
      expect(result.results[1].success).toBe(true);
    });
  });
});
