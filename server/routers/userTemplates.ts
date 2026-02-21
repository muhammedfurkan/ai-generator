import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import {
  createUserPromptTemplate,
  getUserPromptTemplates,
  deleteUserPromptTemplate,
} from "../db";

export const userTemplatesRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1, "Başlık gereklidir").max(255),
        description: z.string().optional(),
        prompt: z.string().min(1, "Prompt gereklidir"),
        category: z.string().optional(),
        aspectRatio: z.enum([
          "1:1",
          "16:9",
          "9:16",
          "4:3",
          "3:4",
          "3:2",
          "2:3",
        ]),
        resolution: z.enum(["1K", "2K", "4K"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      try {
        const templateId = await createUserPromptTemplate({
          userId,
          title: input.title,
          description: input.description || null,
          prompt: input.prompt,
          category: input.category || null,
          aspectRatio: input.aspectRatio,
          resolution: input.resolution,
        });

        return {
          success: true,
          templateId,
        };
      } catch (error) {
        console.error("[UserTemplates] Failed to create template:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Şablon kaydedilemedi",
        });
      }
    }),

  list: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;

    try {
      const templates = await getUserPromptTemplates(userId);
      return templates;
    } catch (error) {
      console.error("[UserTemplates] Failed to list templates:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Şablonlar yüklenemedi",
      });
    }
  }),

  delete: protectedProcedure
    .input(
      z.object({
        templateId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      try {
        const deleted = await deleteUserPromptTemplate(
          input.templateId,
          userId
        );

        if (!deleted) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Şablon bulunamadı veya silinemiyor",
          });
        }

        return {
          success: true,
        };
      } catch (error) {
        console.error("[UserTemplates] Failed to delete template:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Şablon silinemedi",
        });
      }
    }),
});
