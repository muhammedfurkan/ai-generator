// @ts-nocheck
import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { getDb } from "../db";
import {
  users,
  referrals,
  creditTransactions,
  siteSettings,
} from "../../drizzle/schema";
import { eq, and, count, sum } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";

// Generate a unique 8-character referral code
function generateReferralCode(): string {
  return nanoid(8).toUpperCase();
}

// Default bonus amounts
const DEFAULT_REFERRER_BONUS = 50;
const DEFAULT_REFERRED_BONUS = 20;

// Helper function to check if referral system is enabled
async function isReferralSystemEnabled(): Promise<boolean> {
  const db = await getDb();
  if (!db) return true; // Default to enabled if db not available

  const [setting] = await db
    .select({ value: siteSettings.value })
    .from(siteSettings)
    .where(eq(siteSettings.key, "referral_system_enabled"));

  return setting?.value !== "false";
}

// Helper function to get bonus amounts from settings
async function getBonusAmounts(): Promise<{
  referrer: number;
  referred: number;
}> {
  const db = await getDb();
  if (!db)
    return {
      referrer: DEFAULT_REFERRER_BONUS,
      referred: DEFAULT_REFERRED_BONUS,
    };

  const settings = await db
    .select({ key: siteSettings.key, value: siteSettings.value })
    .from(siteSettings)
    .where(eq(siteSettings.key, "referral_bonus_referrer"));

  const referredSettings = await db
    .select({ value: siteSettings.value })
    .from(siteSettings)
    .where(eq(siteSettings.key, "referral_bonus_referred"));

  const referrerBonus = settings[0]?.value
    ? parseInt(settings[0].value)
    : DEFAULT_REFERRER_BONUS;
  const referredBonus = referredSettings[0]?.value
    ? parseInt(referredSettings[0].value)
    : DEFAULT_REFERRED_BONUS;

  return {
    referrer: isNaN(referrerBonus) ? DEFAULT_REFERRER_BONUS : referrerBonus,
    referred: isNaN(referredBonus) ? DEFAULT_REFERRED_BONUS : referredBonus,
  };
}

export const referralRouter = router({
  // Get or create user's referral code
  getMyReferralCode: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database not available",
      });
    }

    const userId = ctx.user.id;

    // Check if user already has a referral code
    const [user] = await db
      .select({ referralCode: users.referralCode })
      .from(users)
      .where(eq(users.id, userId));

    if (user?.referralCode) {
      return { referralCode: user.referralCode };
    }

    // Generate new referral code
    let referralCode = generateReferralCode();
    let attempts = 0;
    const maxAttempts = 10;

    // Ensure uniqueness
    while (attempts < maxAttempts) {
      const [existing] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.referralCode, referralCode));

      if (!existing) break;
      referralCode = generateReferralCode();
      attempts++;
    }

    if (attempts >= maxAttempts) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Could not generate unique referral code",
      });
    }

    // Update user with new referral code
    await db.update(users).set({ referralCode }).where(eq(users.id, userId));

    return { referralCode };
  }),

  // Get referral statistics
  getMyStats: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database not available",
      });
    }

    const userId = ctx.user.id;

    // Count successful referrals
    const [stats] = await db
      .select({
        totalReferrals: count(referrals.id),
        totalBonusEarned: sum(referrals.referrerBonusAmount),
      })
      .from(referrals)
      .where(
        and(
          eq(referrals.referrerId, userId),
          eq(referrals.referrerBonusGiven, true)
        )
      );

    // Get list of referred users
    const referredUsers = await db
      .select({
        id: referrals.id,
        referredId: referrals.referredId,
        bonusGiven: referrals.referrerBonusGiven,
        bonusAmount: referrals.referrerBonusAmount,
        createdAt: referrals.createdAt,
        userName: users.name,
        userEmail: users.email,
      })
      .from(referrals)
      .innerJoin(users, eq(referrals.referredId, users.id))
      .where(eq(referrals.referrerId, userId))
      .orderBy(referrals.createdAt);

    return {
      totalReferrals: Number(stats?.totalReferrals || 0),
      totalBonusEarned: Number(stats?.totalBonusEarned || 0),
      referredUsers: referredUsers.map(u => ({
        id: u.id,
        name: u.userName || u.userEmail || "Anonim",
        bonusGiven: u.bonusGiven,
        bonusAmount: u.bonusAmount,
        createdAt: u.createdAt,
      })),
    };
  }),

  // Validate a referral code (public - for registration flow)
  validateCode: publicProcedure
    .input(z.object({ code: z.string().min(1) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const [referrer] = await db
        .select({ id: users.id, name: users.name })
        .from(users)
        .where(eq(users.referralCode, input.code.toUpperCase()));

      if (!referrer) {
        return { valid: false, referrerName: null };
      }

      return { valid: true, referrerName: referrer.name || "Bir kullanıcı" };
    }),

  // Apply referral code to current user (called after registration)
  applyReferralCode: protectedProcedure
    .input(z.object({ code: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      // Check if referral system is enabled
      const isEnabled = await isReferralSystemEnabled();
      if (!isEnabled) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Referans sistemi şu an aktif değil",
        });
      }

      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const userId = ctx.user.id;
      const code = input.code.toUpperCase();

      // Get bonus amounts from settings
      const bonusAmounts = await getBonusAmounts();
      const REFERRER_BONUS = bonusAmounts.referrer;
      const REFERRED_BONUS = bonusAmounts.referred;

      // Check if user already has a referrer
      const [currentUser] = await db
        .select({ referredBy: users.referredBy })
        .from(users)
        .where(eq(users.id, userId));

      if (currentUser?.referredBy) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Zaten bir referans kodunuz var",
        });
      }

      // Find referrer
      const [referrer] = await db
        .select({ id: users.id, credits: users.credits })
        .from(users)
        .where(eq(users.referralCode, code));

      if (!referrer) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Geçersiz referans kodu",
        });
      }

      // Cannot refer yourself
      if (referrer.id === userId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Kendi kodunuzu kullanamazsınız",
        });
      }

      // Get current user's credits
      const [userCredits] = await db
        .select({ credits: users.credits })
        .from(users)
        .where(eq(users.id, userId));

      // Create referral record
      await db.insert(referrals).values({
        referrerId: referrer.id,
        referredId: userId,
        referralCode: code,
        referrerBonusGiven: true,
        referredBonusGiven: true,
        referrerBonusAmount: REFERRER_BONUS,
        referredBonusAmount: REFERRED_BONUS,
      });

      // Update referredBy field
      await db
        .update(users)
        .set({ referredBy: referrer.id })
        .where(eq(users.id, userId));

      // Give bonus to referrer
      await db
        .update(users)
        .set({ credits: referrer.credits + REFERRER_BONUS })
        .where(eq(users.id, referrer.id));

      // Record referrer transaction
      await db.insert(creditTransactions).values({
        userId: referrer.id,
        type: "add",
        amount: REFERRER_BONUS,
        reason: `Referans bonusu - Yeni kullanıcı davet edildi`,
        balanceBefore: referrer.credits,
        balanceAfter: referrer.credits + REFERRER_BONUS,
      });

      // Give bonus to referred user
      const currentCredits = userCredits?.credits || 0;
      await db
        .update(users)
        .set({ credits: currentCredits + REFERRED_BONUS })
        .where(eq(users.id, userId));

      // Record referred user transaction
      await db.insert(creditTransactions).values({
        userId: userId,
        type: "add",
        amount: REFERRED_BONUS,
        reason: `Hoş geldin bonusu - Referans kodu kullanıldı`,
        balanceBefore: currentCredits,
        balanceAfter: currentCredits + REFERRED_BONUS,
      });

      return {
        success: true,
        bonusReceived: REFERRED_BONUS,
        message: `Tebrikler! ${REFERRED_BONUS} kredi kazandınız!`,
      };
    }),

  // Get referral bonus info
  getBonusInfo: publicProcedure.query(async () => {
    const isEnabled = await isReferralSystemEnabled();
    const bonusAmounts = await getBonusAmounts();

    return {
      enabled: isEnabled,
      referrerBonus: bonusAmounts.referrer,
      referredBonus: bonusAmounts.referred,
    };
  }),

  // Check if referral system is enabled
  isEnabled: publicProcedure.query(async () => {
    return { enabled: await isReferralSystemEnabled() };
  }),
});
