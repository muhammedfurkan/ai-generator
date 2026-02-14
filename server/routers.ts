import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { generationRouter } from "./routers/generation";
import { userRouter } from "./routers/user";
import { adminRouter } from "./routers/admin";
import { userTemplatesRouter } from "./routers/userTemplates";
import { promptHistoryRouter } from "./routers/promptHistory";
import { favoritesRouter } from "./routers/favorites";
import { promptEnhancerRouter } from "./routers/promptEnhancer";
import { aiCharactersRouter } from "./routers/aiCharacters";
import { videoGenerationRouter } from "./routers/videoGeneration";
import { viralAppsRouter } from "./routers/viralApps";
import { upscaleRouter } from "./routers/upscale";
import { feedbackRouter } from "./routers/feedback";
import { referralRouter } from "./routers/referral";
import { notificationRouter } from "./routers/notification";
import { blogRouter } from "./routers/blog";
import { multiAngleRouter } from "./routers/multiAngle";
import { productPromoRouter } from "./routers/productPromo";
import { ugcAdRouter } from "./routers/ugcAd";
import { adminPanelRouter } from "./routers/adminPanel";
import { skinEnhancementRouter } from "./routers/skinEnhancement";
import { seoRouter } from "./routers/seo";
import { logoRouter } from "./routers/logo";
import { promptCompilerRouter } from "./routers/promptCompiler";
import { settingsRouter } from "./routers/settings";
import { shopierRouter } from "./routers/shopier";
import { stripeRouter } from "./routers/stripe";
import { modalCardsRouter } from "./routers/modalCards";

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      // Clear our custom session cookie
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      // Clear Clerk session cookie
      ctx.res.clearCookie('__session', { ...cookieOptions, maxAge: -1 });
      console.log('[Logout] Cleared cookies:', COOKIE_NAME, '__session');
      return {
        success: true,
      } as const;
    }),
  }),
  generation: generationRouter,
  user: userRouter,
  admin: adminRouter,
  userTemplates: userTemplatesRouter,
  promptHistory: promptHistoryRouter,
  favorites: favoritesRouter,
  promptEnhancer: promptEnhancerRouter,
  aiCharacters: aiCharactersRouter,
  videoGeneration: videoGenerationRouter,
  viralApps: viralAppsRouter,
  upscale: upscaleRouter,
  feedback: feedbackRouter,
  referral: referralRouter,
  notification: notificationRouter,
  blog: blogRouter,
  multiAngle: multiAngleRouter,
  productPromo: productPromoRouter,
  ugcAd: ugcAdRouter,
  adminPanel: adminPanelRouter,
  skinEnhancement: skinEnhancementRouter,
  seo: seoRouter,
  logo: logoRouter,
  promptCompiler: promptCompilerRouter,
  settings: settingsRouter,
  shopier: shopierRouter,
  stripe: stripeRouter,
  modalCards: modalCardsRouter,
});

export type AppRouter = typeof appRouter;
