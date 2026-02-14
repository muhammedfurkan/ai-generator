import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { notifications } from "../../drizzle/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export const notificationRouter = router({
  list: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(50).default(20), offset: z.number().min(0).default(0) }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const limit = input?.limit ?? 20;
      const offset = input?.offset ?? 0;
      return await db.select().from(notifications).where(eq(notifications.userId, ctx.user.id)).orderBy(desc(notifications.createdAt)).limit(limit).offset(offset);
    }),

  getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
    const result = await db.select({ count: sql<number>`count(*)` }).from(notifications).where(and(eq(notifications.userId, ctx.user.id), eq(notifications.isRead, false)));
    return result[0]?.count ?? 0;
  }),

  markAsRead: protectedProcedure
    .input(z.object({ notificationId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const [notification] = await db.select().from(notifications).where(and(eq(notifications.id, input.notificationId), eq(notifications.userId, ctx.user.id)));
      if (!notification) throw new TRPCError({ code: "NOT_FOUND", message: "Bildirim bulunamadı" });
      await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, input.notificationId));
      return { success: true };
    }),

  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
    await db.update(notifications).set({ isRead: true }).where(and(eq(notifications.userId, ctx.user.id), eq(notifications.isRead, false)));
    return { success: true };
  }),

  delete: protectedProcedure
    .input(z.object({ notificationId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const [notification] = await db.select().from(notifications).where(and(eq(notifications.id, input.notificationId), eq(notifications.userId, ctx.user.id)));
      if (!notification) throw new TRPCError({ code: "NOT_FOUND", message: "Bildirim bulunamadı" });
      await db.delete(notifications).where(eq(notifications.id, input.notificationId));
      return { success: true };
    }),

  clearAll: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
    await db.delete(notifications).where(eq(notifications.userId, ctx.user.id));
    return { success: true };
  }),
});

export async function createNotification(params: {
  userId: number;
  type: "generation_complete" | "low_credits" | "welcome" | "referral_bonus" | "system" | "credit_added";
  title: string;
  message: string;
  data?: Record<string, unknown>;
  actionUrl?: string;
}) {
  try {
    const db = await getDb();
    if (!db) return false;
    await db.insert(notifications).values({
      userId: params.userId,
      type: params.type,
      title: params.title,
      message: params.message,
      data: params.data ? JSON.stringify(params.data) : null,
      actionUrl: params.actionUrl,
    });
    console.log(`[Notification] Created notification for user ${params.userId}: ${params.title}`);
    return true;
  } catch (error) {
    console.error("[Notification] Failed to create notification:", error);
    return false;
  }
}

export async function checkLowCredits(userId: number, currentCredits: number) {
  if (currentCredits <= 50 && currentCredits > 0) {
    const db = await getDb();
    if (!db) return;
    const recentNotification = await db.select().from(notifications).where(and(eq(notifications.userId, userId), eq(notifications.type, "low_credits"), sql`${notifications.createdAt} > DATE_SUB(NOW(), INTERVAL 24 HOUR)`)).limit(1);
    if (recentNotification.length === 0) {
      await createNotification({
        userId,
        type: "low_credits",
        title: "Krediniz Azalıyor! 💳",
        message: `Hesabınızda ${currentCredits} kredi kaldı. Kesintisiz kullanım için kredi yükleyin.`,
        actionUrl: "/packages",
      });
    }
  }
}
