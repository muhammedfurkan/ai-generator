import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  toggleFavorite,
  isFavorited,
  getFavoriteImageIds,
  getFavoriteImages,
  toggleVideoFavorite,
  isVideoFavorited,
  getFavoriteVideoIds,
  getFavoriteVideos,
} from "../db";

export const favoritesRouter = router({
  /**
   * Toggle favorite status for an image
   */
  toggle: protectedProcedure
    .input(
      z.object({
        imageId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await toggleFavorite(ctx.user.id, input.imageId);
      return result;
    }),

  /**
   * Check if an image is favorited
   */
  isFavorited: protectedProcedure
    .input(
      z.object({
        imageId: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
      const favorited = await isFavorited(ctx.user.id, input.imageId);
      return { isFavorited: favorited };
    }),

  /**
   * Get all favorite image IDs (for quick lookup)
   */
  getFavoriteIds: protectedProcedure.query(async ({ ctx }) => {
    const imageIds = await getFavoriteImageIds(ctx.user.id);
    return { imageIds };
  }),

  /**
   * Get favorite images with full details
   */
  list: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).optional().default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      const images = await getFavoriteImages(ctx.user.id, input.limit);
      return images;
    }),

  // ============================================
  // Video Favorites
  // ============================================

  /**
   * Toggle favorite status for a video
   */
  toggleVideo: protectedProcedure
    .input(
      z.object({
        videoId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await toggleVideoFavorite(ctx.user.id, input.videoId);
      return result;
    }),

  /**
   * Check if a video is favorited
   */
  isVideoFavorited: protectedProcedure
    .input(
      z.object({
        videoId: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
      const favorited = await isVideoFavorited(ctx.user.id, input.videoId);
      return { isFavorited: favorited };
    }),

  /**
   * Get all favorite video IDs (for quick lookup)
   */
  getFavoriteVideoIds: protectedProcedure.query(async ({ ctx }) => {
    const videoIds = await getFavoriteVideoIds(ctx.user.id);
    return { videoIds };
  }),

  /**
   * Get favorite videos with full details
   */
  listVideos: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).optional().default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      const videos = await getFavoriteVideos(ctx.user.id, input.limit);
      return videos;
    }),
});
