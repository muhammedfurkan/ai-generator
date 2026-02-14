import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number, role: "admin" | "user" = "user"): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `user-${userId}`,
    email: `user${userId}@example.com`,
    name: `User ${userId}`,
    loginMethod: "manus",
    role,
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

describe("User Router - Add Credits", () => {
  it("should reject non-admin users", async () => {
    const ctx = createAuthContext(1, "user");
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.user.addCredits({
        userId: 2,
        amount: 50,
      });
      expect.fail("Should have thrown FORBIDDEN error");
    } catch (error: any) {
      expect(error.code).toBe("FORBIDDEN");
      expect(error.message).toContain("admin yetkisi");
    }
  });

  it("should reject invalid user ID", async () => {
    const ctx = createAuthContext(1, "admin");
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.user.addCredits({
        userId: 99999, // Non-existent user
        amount: 50,
      });
      expect.fail("Should have thrown NOT_FOUND error");
    } catch (error: any) {
      expect(error.code).toBe("NOT_FOUND");
      expect(error.message).toContain("bulunamadi");
    }
  });

  it("should validate input parameters", async () => {
    const ctx = createAuthContext(1, "admin");
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.user.addCredits({
        userId: 0, // Invalid: must be positive
        amount: 50,
      });
      expect.fail("Should have thrown validation error");
    } catch (error: any) {
      expect(error.code).toBe("BAD_REQUEST");
    }
  });

  it("should validate positive amount", async () => {
    const ctx = createAuthContext(1, "admin");
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.user.addCredits({
        userId: 2,
        amount: -10, // Invalid: must be positive
      });
      expect.fail("Should have thrown validation error");
    } catch (error: any) {
      expect(error.code).toBe("BAD_REQUEST");
    }
  });
});
