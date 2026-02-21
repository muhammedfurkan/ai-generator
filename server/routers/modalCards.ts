// @ts-nocheck
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { modalCards } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export const modalCardsRouter = router({
  // Public endpoint - Tüm aktif kartları getir
  getAll: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];

    const cards = await db
      .select()
      .from(modalCards)
      .where(eq(modalCards.isActive, true))
      .orderBy(modalCards.sortOrder);

    return cards;
  }),

  // Admin endpoint - Tüm kartları getir (aktif/pasif hepsi)
  getAllAdmin: protectedProcedure
    .input(z.object({}).optional())
    .query(async ({ ctx }) => {
      // Verify admin
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized");
      }

      const db = await getDb();
      if (!db) return [];

      const cards = await db
        .select()
        .from(modalCards)
        .orderBy(modalCards.sortOrder);

      return cards;
    }),

  // Admin endpoint - Kart oluştur
  create: protectedProcedure
    .input(
      z.object({
        cardKey: z.string(),
        title: z.string(),
        description: z.string().optional(),
        imageDesktop: z.string().optional(),
        imageMobile: z.string().optional(),
        badge: z.string().optional(),
        badgeColor: z.string().optional(),
        path: z.string().optional(),
        category: z.enum(["images", "videos", "tools"]),
        isFeatured: z.boolean().default(false),
        sortOrder: z.number().default(0),
        isActive: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify admin
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized");
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [card] = await db.insert(modalCards).values(input);

      return { success: true, id: card.insertId };
    }),

  // Admin endpoint - Kart güncelle
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        cardKey: z.string().optional(),
        title: z.string().optional(),
        description: z.string().optional(),
        imageDesktop: z.string().optional(),
        imageMobile: z.string().optional(),
        badge: z.string().optional(),
        badgeColor: z.string().optional(),
        path: z.string().optional(),
        category: z.enum(["images", "videos", "tools"]).optional(),
        isFeatured: z.boolean().optional(),
        sortOrder: z.number().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify admin
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized");
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const { id, ...updateData } = input;

      await db.update(modalCards).set(updateData).where(eq(modalCards.id, id));

      return { success: true };
    }),

  // Admin endpoint - Kart sil
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // Verify admin
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized");
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.delete(modalCards).where(eq(modalCards.id, input.id));

      return { success: true };
    }),

  // Admin endpoint - Görsel yükle
  uploadImage: protectedProcedure
    .input(
      z.object({
        cardId: z.number(),
        imageType: z.enum(["desktop", "mobile"]),
        imageUrl: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify admin
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized");
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const updateData =
        input.imageType === "desktop"
          ? { imageDesktop: input.imageUrl }
          : { imageMobile: input.imageUrl };

      await db
        .update(modalCards)
        .set(updateData)
        .where(eq(modalCards.id, input.cardId));

      return { success: true };
    }),
});
