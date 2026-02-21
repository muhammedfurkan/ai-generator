// @ts-nocheck
import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { blogPosts } from "../../drizzle/schema";
import { eq, desc, and, like, sql } from "drizzle-orm";
import { getDb } from "../db";

// Admin check middleware
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Admin yetkisi gerekli",
    });
  }
  return next({ ctx });
});

// Generate slug from title
function generateSlug(title: string): string {
  return (
    title
      .toLowerCase()
      // Büyük Türkçe karakterler (toLowerCase sonrası)
      .replace(/İ/gi, "i")
      .replace(/I/g, "i")
      // Küçük Türkçe karakterler
      .replace(/ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/ş/g, "s")
      .replace(/ı/g, "i")
      .replace(/ö/g, "o")
      .replace(/ç/g, "c")
      // Türkçe toLowerCase bazen noktalı i üretir (i̇), bunu temizle
      .replace(/i̇/g, "i")
      // Alfanumerik olmayan karakterleri tire ile değiştir
      .replace(/[^a-z0-9]+/g, "-")
      // Baş ve sondaki tireleri kaldır
      .replace(/^-+|-+$/g, "")
      // Ardışık tireleri tek tireye indir
      .replace(/-+/g, "-")
  );
}

export const blogRouter = router({
  // Public: List published blog posts
  list: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(10),
        offset: z.number().min(0).default(0),
        category: z.string().optional(),
        search: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        return { posts: [], total: 0 };
      }

      const conditions = [eq(blogPosts.status, "published")];

      if (input.category && input.category !== "Tümü") {
        conditions.push(eq(blogPosts.category, input.category));
      }

      if (input.search) {
        conditions.push(like(blogPosts.title, `%${input.search}%`));
      }

      const posts = await db
        .select()
        .from(blogPosts)
        .where(and(...conditions))
        .orderBy(desc(blogPosts.publishedAt))
        .limit(input.limit)
        .offset(input.offset);

      const [countResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(blogPosts)
        .where(and(...conditions));

      return {
        posts,
        total: countResult?.count || 0,
      };
    }),

  // Public: Get single blog post by slug
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Veritabanı bağlantısı yok",
        });
      }

      const [post] = await db
        .select()
        .from(blogPosts)
        .where(
          and(eq(blogPosts.slug, input.slug), eq(blogPosts.status, "published"))
        )
        .limit(1);

      if (!post) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Blog yazısı bulunamadı",
        });
      }

      // Increment view count
      await db
        .update(blogPosts)
        .set({ viewCount: sql`${blogPosts.viewCount} + 1` })
        .where(eq(blogPosts.id, post.id));

      return post;
    }),

  // Public: Get categories
  getCategories: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      return ["Tümü"];
    }

    const categories = await db
      .selectDistinct({ category: blogPosts.category })
      .from(blogPosts)
      .where(eq(blogPosts.status, "published"));

    return ["Tümü", ...categories.map((c: { category: string }) => c.category)];
  }),

  // Admin: List all blog posts (including drafts)
  adminList: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
        status: z
          .enum(["all", "draft", "published", "archived"])
          .default("all"),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        return { posts: [], total: 0 };
      }

      const conditions = [];

      if (input.status !== "all") {
        conditions.push(eq(blogPosts.status, input.status));
      }

      const posts = await db
        .select()
        .from(blogPosts)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(blogPosts.updatedAt))
        .limit(input.limit)
        .offset(input.offset);

      const [countResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(blogPosts)
        .where(conditions.length > 0 ? and(...conditions) : undefined);

      return {
        posts,
        total: countResult?.count || 0,
      };
    }),

  // Admin: Get single post by ID (for editing)
  adminGetById: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Veritabanı bağlantısı yok",
        });
      }

      const [post] = await db
        .select()
        .from(blogPosts)
        .where(eq(blogPosts.id, input.id))
        .limit(1);

      if (!post) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Blog yazısı bulunamadı",
        });
      }

      return post;
    }),

  // Admin: Create new blog post
  create: adminProcedure
    .input(
      z.object({
        title: z.string().min(1).max(255),
        description: z.string().min(1),
        content: z.string().min(1),
        coverImage: z.string().optional(),
        category: z.string().min(1),
        author: z.string().default("Nano Influencer"),
        readTime: z.string().default("5 dk"),
        status: z.enum(["draft", "published"]).default("draft"),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Veritabanı bağlantısı yok",
        });
      }

      const slug = generateSlug(input.title);

      // Check if slug exists
      const [existing] = await db
        .select({ id: blogPosts.id })
        .from(blogPosts)
        .where(eq(blogPosts.slug, slug))
        .limit(1);

      const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

      const [result] = await db.insert(blogPosts).values({
        title: input.title,
        slug: finalSlug,
        description: input.description,
        content: input.content,
        coverImage: input.coverImage || null,
        category: input.category,
        author: input.author,
        readTime: input.readTime,
        status: input.status,
        publishedAt: input.status === "published" ? new Date() : null,
      });

      return { id: result.insertId, slug: finalSlug };
    }),

  // Admin: Update blog post
  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(1).max(255).optional(),
        description: z.string().min(1).optional(),
        content: z.string().min(1).optional(),
        coverImage: z.string().optional(),
        category: z.string().min(1).optional(),
        author: z.string().optional(),
        readTime: z.string().optional(),
        status: z.enum(["draft", "published", "archived"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Veritabanı bağlantısı yok",
        });
      }

      const { id, ...updates } = input;

      // Get current post
      const [current] = await db
        .select()
        .from(blogPosts)
        .where(eq(blogPosts.id, id))
        .limit(1);

      if (!current) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Blog yazısı bulunamadı",
        });
      }

      // If title changed, update slug
      let newSlug = current.slug;
      if (updates.title && updates.title !== current.title) {
        newSlug = generateSlug(updates.title);
        const [existing] = await db
          .select({ id: blogPosts.id })
          .from(blogPosts)
          .where(
            and(eq(blogPosts.slug, newSlug), sql`${blogPosts.id} != ${id}`)
          )
          .limit(1);
        if (existing) {
          newSlug = `${newSlug}-${Date.now()}`;
        }
      }

      // If status changed to published, set publishedAt
      const publishedAt =
        updates.status === "published" && current.status !== "published"
          ? new Date()
          : current.publishedAt;

      await db
        .update(blogPosts)
        .set({
          ...updates,
          slug: newSlug,
          publishedAt,
        })
        .where(eq(blogPosts.id, id));

      return { success: true, slug: newSlug };
    }),

  // Admin: Delete blog post
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Veritabanı bağlantısı yok",
        });
      }

      const [post] = await db
        .select({ id: blogPosts.id })
        .from(blogPosts)
        .where(eq(blogPosts.id, input.id))
        .limit(1);

      if (!post) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Blog yazısı bulunamadı",
        });
      }

      await db.delete(blogPosts).where(eq(blogPosts.id, input.id));

      return { success: true };
    }),
});
