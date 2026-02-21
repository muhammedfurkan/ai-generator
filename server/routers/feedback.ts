import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { feedbacks } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { notifyOwner } from "../_core/notification";
import { TRPCError } from "@trpc/server";

export const feedbackRouter = router({
  // Submit feedback
  submit: protectedProcedure
    .input(
      z.object({
        type: z.enum(["bug", "suggestion", "complaint", "other"]),
        description: z
          .string()
          .min(10, "Açıklama en az 10 karakter olmalıdır")
          .max(2000),
        screenshotUrl: z.string().url().optional(),
        pageUrl: z.string().optional(),
        userAgent: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const userId = ctx.user.id;

      // Insert feedback
      const [result] = await db.insert(feedbacks).values({
        userId,
        type: input.type,
        description: input.description,
        screenshotUrl: input.screenshotUrl,
        pageUrl: input.pageUrl,
        userAgent: input.userAgent,
      });

      // Notify owner via Telegram
      const typeLabels = {
        bug: "🐛 Hata Bildirimi",
        suggestion: "💡 Öneri",
        complaint: "😤 Şikayet",
        other: "📝 Diğer",
      };

      await notifyOwner({
        title: typeLabels[input.type],
        content: `**Kullanıcı:** ${ctx.user.name || ctx.user.email || "Anonim"}\n**Sayfa:** ${input.pageUrl || "Belirtilmemiş"}\n\n**Açıklama:**\n${input.description}${input.screenshotUrl ? `\n\n**Ekran Görüntüsü:** ${input.screenshotUrl}` : ""}`,
      });

      return { success: true, id: result.insertId };
    }),

  // Get user's feedback history
  myFeedbacks: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database not available",
      });
    }

    const userId = ctx.user.id;

    const userFeedbacks = await db
      .select()
      .from(feedbacks)
      .where(eq(feedbacks.userId, userId))
      .orderBy(desc(feedbacks.createdAt))
      .limit(20);

    return userFeedbacks;
  }),
});
