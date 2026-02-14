import { router, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  getAllUsers,
  getTotalUserCount,
  deleteUser,
  updateUserRole,
  recordCreditTransaction,
  getCreditTransactions,
  getDashboardStats,
  getSystemSetting,
  updateSystemSetting,
  getUserById,
  addCredits,
  deductCredits,
} from "../db";

// Admin-only procedure wrapper
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
  return next({ ctx });
});

export const adminRouter = router({
  // ============ USER MANAGEMENT ============

  /**
   * Get all users with pagination
   */
  getAllUsers: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      const users = await getAllUsers(input.limit, input.offset);
      const total = await getTotalUserCount();
      return { users, total };
    }),

  /**
   * Delete a user
   */
  deleteUser: adminProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ input }) => {
      const success = await deleteUser(input.userId);
      if (!success) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      return { success: true };
    }),

  /**
   * Update user role
   */
  updateUserRole: adminProcedure
    .input(
      z.object({
        userId: z.number(),
        role: z.enum(["admin", "user"]),
      })
    )
    .mutation(async ({ input }) => {
      const success = await updateUserRole(input.userId, input.role);
      if (!success) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      return { success: true };
    }),

  // ============ CREDIT MANAGEMENT ============

  /**
   * Add credits to user
   */
  addCreditsToUser: adminProcedure
    .input(
      z.object({
        userId: z.number(),
        amount: z.number().min(1),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const user = await getUserById(input.userId);
      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const success = await addCredits(input.userId, input.amount);
      if (!success) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }

      // Record transaction
      await recordCreditTransaction(
        input.userId,
        "add",
        input.amount,
        input.reason || "Admin added credits"
      );

      return { success: true, newBalance: user.credits + input.amount };
    }),

  /**
   * Deduct credits from user
   */
  deductCreditsFromUser: adminProcedure
    .input(
      z.object({
        userId: z.number(),
        amount: z.number().min(1),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const user = await getUserById(input.userId);
      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (user.credits < input.amount) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Insufficient credits",
        });
      }

      const success = await deductCredits(input.userId, input.amount);
      if (!success) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }

      // Record transaction
      await recordCreditTransaction(
        input.userId,
        "deduct",
        input.amount,
        input.reason || "Admin deducted credits"
      );

      return { success: true, newBalance: user.credits - input.amount };
    }),

  /**
   * Get credit transactions for a user
   */
  getCreditTransactions: adminProcedure
    .input(
      z.object({
        userId: z.number(),
        limit: z.number().min(1).max(100).default(50),
      })
    )
    .query(async ({ input }) => {
      const transactions = await getCreditTransactions(
        input.userId,
        input.limit
      );
      return transactions;
    }),

  /**
   * Bulk add credits from CSV
   */
  bulkAddCredits: adminProcedure
    .input(
      z.object({
        data: z.array(
          z.object({
            userId: z.number(),
            amount: z.number().min(1),
            reason: z.string().optional(),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      const results = [];

      for (const item of input.data) {
        try {
          const user = await getUserById(item.userId);
          if (!user) {
            results.push({
              userId: item.userId,
              success: false,
              error: "User not found",
            });
            continue;
          }

          const success = await addCredits(item.userId, item.amount);
          if (success) {
            await recordCreditTransaction(
              item.userId,
              "add",
              item.amount,
              item.reason || "Bulk credit addition"
            );
            results.push({
              userId: item.userId,
              success: true,
              newBalance: user.credits + item.amount,
            });
          } else {
            results.push({
              userId: item.userId,
              success: false,
              error: "Failed to add credits",
            });
          }
        } catch (error) {
          results.push({
            userId: item.userId,
            success: false,
            error: String(error),
          });
        }
      }

      return { results };
    }),

  // ============ STATISTICS ============

  /**
   * Get dashboard statistics
   */
  getDashboardStats: adminProcedure.query(async () => {
    const stats = await getDashboardStats();
    return stats;
  }),

  // ============ SYSTEM SETTINGS ============

  /**
   * Get system setting
   */
  getSystemSetting: adminProcedure
    .input(z.object({ key: z.string() }))
    .query(async ({ input }) => {
      const value = await getSystemSetting(input.key);
      return { value };
    }),

  /**
   * Update system setting
   */
  updateSystemSetting: adminProcedure
    .input(
      z.object({
        key: z.string(),
        value: z.string(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const success = await updateSystemSetting(
        input.key,
        input.value,
        input.description
      );
      if (!success) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
      return { success: true };
    }),

  /**
   * Get all system settings
   */
  getAllSystemSettings: adminProcedure.query(async () => {
    // This would require a getAllSystemSettings function in db.ts
    // For now, return empty array
    return [];
  }),
});
