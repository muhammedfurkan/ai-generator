import { protectedProcedure, router } from "../_core/trpc";
import {
  getUserById,
  getUserGeneratedImagesCount,
  addCredits,
  getCreditTransactions,
} from "../db";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const userRouter = router({
  /**
   * Get current user profile
   */
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const user = await getUserById(ctx.user.id);

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Kullanıcı bulunamadı",
      });
    }

    const generatedCount = await getUserGeneratedImagesCount(ctx.user.id);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      credits: user.credits,
      generatedCount,
      createdAt: user.createdAt,
      lastSignedIn: user.lastSignedIn,
      referredBy: user.referredBy,
      loginMethod: user.loginMethod,
    };
  }),

  /**
   * Add credits to a user (admin only)
   */
  /**
   * Get user's payment/transaction history
   */
  getPaymentHistory: protectedProcedure
    .input(
      z
        .object({
          limit: z.number().int().positive().max(100).optional().default(50),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit || 50;
      const transactions = await getCreditTransactions(ctx.user.id, limit);

      return transactions.map(t => ({
        id: t.id,
        type: t.type,
        amount: t.amount,
        reason: t.reason,
        balanceBefore: t.balanceBefore,
        balanceAfter: t.balanceAfter,
        createdAt: t.createdAt,
      }));
    }),

  /**
   * Add credits to a user (admin only)
   */
  addCredits: protectedProcedure
    .input(
      z.object({
        userId: z.number().int().positive(),
        amount: z.number().int().positive(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is admin
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Bu islem icin admin yetkisi gereklidir",
        });
      }

      const targetUser = await getUserById(input.userId);
      if (!targetUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Kullanici bulunamadi",
        });
      }

      const success = await addCredits(input.userId, input.amount);
      if (!success) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Kredi yuklenmesi basarisiz oldu",
        });
      }

      const updatedUser = await getUserById(input.userId);
      return {
        success: true,
        newCredits: updatedUser?.credits || 0,
      };
    }),
});
