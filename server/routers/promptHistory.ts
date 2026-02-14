import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  savePromptHistory,
  getPromptHistory,
  deletePromptHistory,
  clearPromptHistory,
} from "../db";

export const promptHistoryRouter = router({
  /**
   * Save prompt to history (called automatically after successful generation)
   */
  save: protectedProcedure
    .input(
      z.object({
        prompt: z.string().min(1),
        aspectRatio: z.string(),
        resolution: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const success = await savePromptHistory(
        ctx.user.id,
        input.prompt,
        input.aspectRatio,
        input.resolution
      );

      if (!success) {
        throw new Error("Failed to save prompt history");
      }

      return { success: true };
    }),

  /**
   * Get user's prompt history
   */
  list: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).optional().default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      const history = await getPromptHistory(ctx.user.id, input.limit);
      return history;
    }),

  /**
   * Delete a specific prompt from history
   */
  delete: protectedProcedure
    .input(
      z.object({
        historyId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const success = await deletePromptHistory(input.historyId, ctx.user.id);

      if (!success) {
        throw new Error("Failed to delete prompt history");
      }

      return { success: true };
    }),

  /**
   * Clear all prompt history for the user
   */
  clearAll: protectedProcedure.mutation(async ({ ctx }) => {
    const success = await clearPromptHistory(ctx.user.id);

    if (!success) {
      throw new Error("Failed to clear prompt history");
    }

    return { success: true };
  }),
});
