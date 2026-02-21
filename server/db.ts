// @ts-nocheck
import { eq, desc, sql, and, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  generatedImages,
  InsertGeneratedImage,
  creditTransactions,
  systemSettings,
  userPromptTemplates,
  InsertUserPromptTemplate,
  promptHistory,
  InsertPromptHistory,
  favorites,
  InsertFavorite,
  aiModelConfig,
  siteSettings,
  featurePricing,
  generatedAudio,
  generatedMusic,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;
const SETTINGS_CACHE_TTL_MS = 60_000;
const signupBonusCache = {
  value: 25,
  expiresAt: 0,
};
const featurePricingCache = new Map<
  string,
  { credits: number; expiresAt: number }
>();

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function isDuplicateEntryError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "ER_DUP_ENTRY"
  );
}

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

/**
 * Get the signup bonus credits from site settings
 * Returns the configured value or 25 as default
 */
export async function getSignupBonusCredits(): Promise<number> {
  if (signupBonusCache.expiresAt > Date.now()) {
    return signupBonusCache.value;
  }

  const db = await getDb();
  if (!db) return signupBonusCache.value; // Default fallback

  try {
    const result = await db
      .select({ value: siteSettings.value })
      .from(siteSettings)
      .where(eq(siteSettings.key, "signup_bonus_credits"))
      .limit(1);

    if (result.length > 0 && result[0].value) {
      const credits = parseInt(result[0].value, 10);
      if (!isNaN(credits) && credits >= 0) {
        signupBonusCache.value = credits;
        signupBonusCache.expiresAt = Date.now() + SETTINGS_CACHE_TTL_MS;
        return credits;
      }
    }
    signupBonusCache.expiresAt = Date.now() + SETTINGS_CACHE_TTL_MS;
    return signupBonusCache.value;
  } catch (error) {
    console.error("[Database] Failed to get signup bonus credits:", error);
    return signupBonusCache.value;
  }
}

/**
 * Get feature pricing by feature key from database
 * Returns the configured credit cost or default fallback
 */
export async function getFeaturePricingByKey(
  featureKey: string,
  defaultValue: number = 50
): Promise<number> {
  const cached = featurePricingCache.get(featureKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.credits;
  }

  const db = await getDb();
  if (!db) return cached?.credits ?? defaultValue; // Default fallback

  try {
    const result = await db
      .select({
        credits: featurePricing.credits,
        isActive: featurePricing.isActive,
      })
      .from(featurePricing)
      .where(eq(featurePricing.featureKey, featureKey))
      .limit(1);

    if (result.length > 0 && result[0].isActive) {
      featurePricingCache.set(featureKey, {
        credits: result[0].credits,
        expiresAt: Date.now() + SETTINGS_CACHE_TTL_MS,
      });
      return result[0].credits;
    }
    featurePricingCache.set(featureKey, {
      credits: defaultValue,
      expiresAt: Date.now() + SETTINGS_CACHE_TTL_MS,
    });
    return defaultValue; // Default fallback
  } catch (error) {
    console.error(
      `[Database] Failed to get feature pricing for ${featureKey}:`,
      error
    );
    return cached?.credits ?? defaultValue; // Default fallback
  }
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    // Yeni kullanıcılara site ayarlarından kredit ver
    const NEW_USER_CREDITS = await getSignupBonusCredits();

    const values: InsertUser = {
      openId: user.openId,
      credits: NEW_USER_CREDITS, // Yeni kullanıcılar ayarlanan kredi ile başlasın
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized =
        field === "email" && typeof value === "string"
          ? normalizeEmail(value)
          : (value ?? null);
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const normalizedEmail = normalizeEmail(email);

  // Fast path: hit normalized unique index.
  const exactResult = await db
    .select()
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1);

  if (exactResult.length > 0) {
    return exactResult[0];
  }

  // Compatibility path: for legacy mixed-case email rows.
  const result = await db
    .select()
    .from(users)
    .where(sql`lower(${users.email}) = ${normalizedEmail}`)
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Get user by Clerk ID
 */
export async function getUserByClerkId(clerkId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Create a new user with email/password
 */
export async function createUserWithPassword(data: {
  email: string;
  name: string;
  passwordHash: string;
  emailVerificationCode?: string;
  emailVerificationCodeExpiry?: Date;
  emailVerificationClerkId?: string; // legacy
}): Promise<number> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const NEW_USER_CREDITS = await getSignupBonusCredits();
  const normalizedEmail = normalizeEmail(data.email);

  const result = await db.insert(users).values({
    email: normalizedEmail,
    name: data.name,
    passwordHash: data.passwordHash,
    loginMethod: "email",
    credits: NEW_USER_CREDITS,
    role: "user",
    emailVerified: false, // Email verification required
    emailVerificationCode: data.emailVerificationCode,
    emailVerificationCodeExpiry: data.emailVerificationCodeExpiry,
    emailVerificationClerkId: data.emailVerificationClerkId,
    lastSignedIn: new Date(),
  });

  return Number(result[0].insertId);
}

/**
 * Update user's email verification status
 */
export async function updateEmailVerificationStatus(
  userId: number,
  verified: boolean
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db
      .update(users)
      .set({
        emailVerified: verified,
        // Clear all verification data once verified
        emailVerificationCode: verified ? null : undefined,
        emailVerificationCodeExpiry: verified ? null : undefined,
        emailVerificationClerkId: verified ? null : undefined,
      })
      .where(eq(users.id, userId));
    return true;
  } catch (error) {
    console.error("[Database] Failed to update email verification:", error);
    return false;
  }
}

/**
 * Update user's email verification code
 */
export async function updateUserVerificationCode(
  userId: number,
  code: string,
  expiryMinutes: number = 15
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    const expiry = new Date(Date.now() + expiryMinutes * 60 * 1000);
    await db
      .update(users)
      .set({
        emailVerificationCode: code,
        emailVerificationCodeExpiry: expiry,
      })
      .where(eq(users.id, userId));
    return true;
  } catch (error) {
    console.error("[Database] Failed to update verification code:", error);
    return false;
  }
}

/**
 * Verify email verification code
 * Returns true if code matches and is not expired
 */
export async function verifyEmailCode(
  email: string,
  code: string
): Promise<{ valid: boolean; userId?: number; expired?: boolean }> {
  const db = await getDb();
  if (!db) return { valid: false };

  try {
    const user = await getUserByEmail(email);
    if (!user) {
      return { valid: false };
    }

    // Check if code matches
    if (user.emailVerificationCode !== code) {
      return { valid: false, userId: user.id };
    }

    // Check if code is expired
    if (
      user.emailVerificationCodeExpiry &&
      user.emailVerificationCodeExpiry < new Date()
    ) {
      return { valid: false, userId: user.id, expired: true };
    }

    return { valid: true, userId: user.id };
  } catch (error) {
    console.error("[Database] Failed to verify email code:", error);
    return { valid: false };
  }
}

/**
 * Get user by email verification Clerk ID (legacy)
 */
export async function getUserByEmailVerificationClerkId(clerkId: string) {
  const db = await getDb();
  if (!db) return undefined;

  try {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.emailVerificationClerkId, clerkId))
      .limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error(
      "[Database] Failed to get user by verification clerk ID:",
      error
    );
    return undefined;
  }
}

/**
 * Create or update user from Clerk (Google OAuth)
 * This function handles both login and registration:
 * 1. First checks if user exists by clerkId (existing Google user - login)
 * 2. If not found, checks by email (existing email user linking to Google - update & login)
 * 3. If neither found, creates new user (registration + login)
 */
export async function upsertClerkUser(data: {
  clerkId: string;
  email: string | null;
  name: string | null;
}): Promise<{ isNewUser: boolean }> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const NEW_USER_CREDITS = await getSignupBonusCredits();
  const normalizedEmail = data.email ? normalizeEmail(data.email) : null;

  try {
    // Step 1: Check if user exists by clerkId (existing Google user)
    const existingByClerkId = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, data.clerkId))
      .limit(1);

    if (existingByClerkId && existingByClerkId.length > 0) {
      // User already registered with Google - just update lastSignedIn (login)
      console.log(
        "[Database] Google user found by clerkId, logging in:",
        existingByClerkId[0].id
      );
      await db
        .update(users)
        .set({
          lastSignedIn: new Date(),
          // Update name if provided (might have changed in Google)
          ...(data.name ? { name: data.name } : {}),
        })
        .where(eq(users.id, existingByClerkId[0].id));
      return { isNewUser: false };
    }

    // Step 2: Check if user exists by email (existing email/password user)
    if (normalizedEmail) {
      const existingByEmail = await db
        .select()
        .from(users)
        .where(eq(users.email, normalizedEmail))
        .limit(1);

      if (existingByEmail && existingByEmail.length > 0) {
        // User registered with email, now linking Google account
        console.log(
          "[Database] Email user found, linking to Google:",
          existingByEmail[0].id
        );
        await db
          .update(users)
          .set({
            clerkId: data.clerkId,
            name: data.name ?? existingByEmail[0].name ?? undefined,
            loginMethod: "google",
            emailVerified: true, // Google accounts are pre-verified
            lastSignedIn: new Date(),
          })
          .where(eq(users.id, existingByEmail[0].id));
        return { isNewUser: false };
      }
    }

    // Step 3: User doesn't exist - create new user (registration)
    console.log(
      "[Database] No existing user found, creating new Google user:",
      data.email
    );
    await db.insert(users).values({
      clerkId: data.clerkId,
      email: normalizedEmail ?? undefined,
      name: data.name ?? undefined,
      loginMethod: "google",
      emailVerified: true, // Google accounts are pre-verified
      credits: NEW_USER_CREDITS,
      role: "user",
      lastSignedIn: new Date(),
    });
    return { isNewUser: true };
  } catch (error) {
    console.error("[Database] upsertClerkUser error:", error);
    throw error;
  }
}

/**
 * Create a new user with Google OAuth
 * Uses clerkId field to store Google ID for compatibility
 */
export async function createUserWithGoogle(data: {
  email: string;
  name: string;
  googleId: string;
  profileImage?: string;
}): Promise<number> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const NEW_USER_CREDITS = await getSignupBonusCredits();

  const result = await db.insert(users).values({
    email: normalizeEmail(data.email),
    name: data.name,
    clerkId: data.googleId, // Store Google ID in clerkId field
    loginMethod: "google",
    credits: NEW_USER_CREDITS,
    role: "user",
    emailVerified: true, // Google accounts are pre-verified
    lastSignedIn: new Date(),
  });

  return Number(result[0].insertId);
}

/**
 * Update user's Google ID (for linking existing email account to Google)
 * Uses clerkId field to store Google ID for compatibility
 */
export async function updateUserGoogleId(
  userId: number,
  googleId: string
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db
      .update(users)
      .set({
        clerkId: googleId, // Store Google ID in clerkId field
        loginMethod: "google",
        emailVerified: true, // Google accounts are pre-verified
      })
      .where(eq(users.id, userId));
    return true;
  } catch (error) {
    console.error("[Database] Failed to update Google ID:", error);
    return false;
  }
}

/**
 * Deduct credits from a user's account
 */
export async function deductCredits(
  userId: number,
  amount: number
): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot deduct credits: database not available");
    return false;
  }

  try {
    if (amount <= 0) {
      return false;
    }

    const result = await db
      .update(users)
      .set({ credits: sql`${users.credits} - ${amount}` })
      .where(and(eq(users.id, userId), sql`${users.credits} >= ${amount}`));

    return (result[0]?.affectedRows ?? 0) > 0;
  } catch (error) {
    console.error("[Database] Failed to deduct credits:", error);
    return false;
  }
}

/**
 * Save generated image metadata
 */
export async function saveGeneratedImage(
  data: InsertGeneratedImage
): Promise<number | null> {
  const db = await getDb();
  if (!db) {
    console.warn(
      "[Database] Cannot save generated image: database not available"
    );
    return null;
  }

  try {
    const result = await db.insert(generatedImages).values(data);
    return result[0]?.insertId ?? null;
  } catch (error) {
    console.error("[Database] Failed to save generated image:", error);
    return null;
  }
}

/**
 * Get user's generated images history
 */
export async function getUserGeneratedImages(
  userId: number,
  limit: number = 50
) {
  const db = await getDb();
  if (!db) {
    console.warn(
      "[Database] Cannot get generated images: database not available"
    );
    return [];
  }

  try {
    const result = await db
      .select()
      .from(generatedImages)
      .where(eq(generatedImages.userId, userId))
      .orderBy(desc(generatedImages.createdAt))
      .limit(limit);

    return result;
  } catch (error) {
    console.error("[Database] Failed to get generated images:", error);
    return [];
  }
}

/**
 * Get user's generated images count
 */
export async function getUserGeneratedImagesCount(
  userId: number
): Promise<number> {
  const db = await getDb();
  if (!db) {
    console.warn(
      "[Database] Cannot get generated images count: database not available"
    );
    return 0;
  }

  try {
    const [result] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(generatedImages)
      .where(eq(generatedImages.userId, userId));

    return Number(result?.count ?? 0);
  } catch (error) {
    console.error("[Database] Failed to get generated images count:", error);
    return 0;
  }
}

/**
 * Get a specific generated image by ID
 */
export async function getGeneratedImageById(imageId: number) {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db
      .select()
      .from(generatedImages)
      .where(eq(generatedImages.id, imageId))
      .limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to get generated image:", error);
    return null;
  }
}

/**
 * Update generated image status
 */
export async function updateGeneratedImageStatus(
  imageId: number,
  status: "pending" | "processing" | "completed" | "failed",
  data?: { generatedImageUrl?: string; errorMessage?: string }
) {
  const db = await getDb();
  if (!db) return false;

  try {
    const updateData: Record<string, unknown> = { status };
    if (data?.generatedImageUrl)
      updateData.generatedImageUrl = data.generatedImageUrl;
    if (data?.errorMessage) updateData.errorMessage = data.errorMessage;
    if (status === "completed" || status === "failed") {
      updateData.completedAt = new Date();
    }

    await db
      .update(generatedImages)
      .set(updateData)
      .where(eq(generatedImages.id, imageId));
    return true;
  } catch (error) {
    console.error("[Database] Failed to update image status:", error);
    return false;
  }
}

/**
 * Get pending images for a user (includes both pending and processing)
 */
export async function getPendingImages(userId: number) {
  const db = await getDb();
  if (!db) return [];

  try {
    const result = await db
      .select()
      .from(generatedImages)
      .where(
        and(
          eq(generatedImages.userId, userId),
          inArray(generatedImages.status, ["pending", "processing"])
        )
      )
      .orderBy(desc(generatedImages.createdAt));
    return result;
  } catch (error) {
    console.error("[Database] Failed to get pending images:", error);
    return [];
  }
}

/**
 * Refund credits to a user's account (for failed operations)
 */
export async function refundCredits(
  userId: number,
  amount: number,
  reason: string
): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot refund credits: database not available");
    return false;
  }

  try {
    if (amount <= 0) {
      return false;
    }

    const refundResult = await db.transaction(async tx => {
      const user = await tx
        .select({ credits: users.credits })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (user.length === 0) {
        return null;
      }

      const balanceBefore = Number(user[0].credits ?? 0);
      const balanceAfter = balanceBefore + amount;

      await tx
        .update(users)
        .set({ credits: sql`${users.credits} + ${amount}` })
        .where(eq(users.id, userId));

      await tx.insert(creditTransactions).values({
        userId,
        type: "add",
        amount,
        reason: `İade: ${reason}`,
        balanceBefore,
        balanceAfter,
      });

      return { balanceAfter };
    });

    if (!refundResult) {
      console.error("[Database] Cannot refund credits: user not found");
      return false;
    }

    console.log(
      `[Database] Refunded ${amount} credits to user ${userId}. New balance: ${refundResult.balanceAfter}`
    );
    return true;
  } catch (error) {
    console.error("[Database] Failed to refund credits:", error);
    return false;
  }
}

/**
 * Add credits to a user's account (admin operation)
 */
export async function addCredits(
  userId: number,
  amount: number
): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot add credits: database not available");
    return false;
  }

  try {
    if (amount <= 0) {
      return false;
    }

    const result = await db
      .update(users)
      .set({ credits: sql`${users.credits} + ${amount}` })
      .where(eq(users.id, userId));

    return (result[0]?.affectedRows ?? 0) > 0;
  } catch (error) {
    console.error("[Database] Failed to add credits:", error);
    return false;
  }
}

/**
 * Get all users with pagination
 */
export async function getAllUsers(limit: number = 50, offset: number = 0) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get users: database not available");
    return [];
  }

  try {
    const userList = await db
      .select()
      .from(users)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(users.createdAt));

    return userList;
  } catch (error) {
    console.error("[Database] Failed to get users:", error);
    return [];
  }
}

/**
 * Get total user count
 */
export async function getTotalUserCount(): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  try {
    const result = await db.select({ count: sql`COUNT(*)` }).from(users);
    return Number(result[0]?.count) || 0;
  } catch (error) {
    console.error("[Database] Failed to get user count:", error);
    return 0;
  }
}

/**
 * Delete user and all related data
 */
export async function deleteUser(userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.delete(users).where(eq(users.id, userId));
    return true;
  } catch (error) {
    console.error("[Database] Failed to delete user:", error);
    return false;
  }
}

/**
 * Update user role
 */
export async function updateUserRole(
  userId: number,
  role: "admin" | "user"
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.update(users).set({ role }).where(eq(users.id, userId));
    return true;
  } catch (error) {
    console.error("[Database] Failed to update user role:", error);
    return false;
  }
}

/**
 * Update user's last signed in timestamp
 */
export async function updateUserLastSignedIn(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    await db
      .update(users)
      .set({ lastSignedIn: new Date() })
      .where(eq(users.id, userId));
  } catch (error) {
    console.error("[Database] Failed to update last signed in:", error);
  }
}

/**
 * Record credit transaction
 * @param userId - User ID
 * @param type - Transaction type: "add", "deduct", or "purchase"
 * @param amount - Credit amount
 * @param reason - Reason for the transaction
 * @param providedBalanceBefore - Optional: If provided, use this instead of fetching from DB
 * @param providedBalanceAfter - Optional: If provided, use this instead of calculating
 */
export async function recordCreditTransaction(
  userId: number,
  type: "add" | "deduct" | "purchase",
  amount: number,
  reason: string,
  providedBalanceBefore?: number,
  providedBalanceAfter?: number
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    let balanceBefore: number;
    let balanceAfter: number;

    if (
      providedBalanceBefore !== undefined &&
      providedBalanceAfter !== undefined
    ) {
      // Use provided values (for cases where credit was already updated)
      balanceBefore = providedBalanceBefore;
      balanceAfter = providedBalanceAfter;
    } else {
      // Fetch current balance and calculate (legacy behavior)
      const user = await getUserById(userId);
      if (!user) return false;

      balanceBefore = user.credits;
      balanceAfter =
        type === "deduct" ? balanceBefore - amount : balanceBefore + amount;
    }

    await db.insert(creditTransactions).values({
      userId,
      type,
      amount,
      reason,
      balanceBefore,
      balanceAfter,
    });

    return true;
  } catch (error) {
    console.error("[Database] Failed to record transaction:", error);
    return false;
  }
}

/**
 * Get credit transactions for a user
 */
export async function getCreditTransactions(
  userId: number,
  limit: number = 50
) {
  const db = await getDb();
  if (!db) return [];

  try {
    const transactions = await db
      .select()
      .from(creditTransactions)
      .where(eq(creditTransactions.userId, userId))
      .limit(limit)
      .orderBy(desc(creditTransactions.createdAt));

    return transactions;
  } catch (error) {
    console.error("[Database] Failed to get transactions:", error);
    return [];
  }
}

/**
 * Get system setting
 */
export async function getSystemSetting(key: string): Promise<string | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db
      .select({ value: systemSettings.value })
      .from(systemSettings)
      .where(eq(systemSettings.key, key))
      .limit(1);
    return result.length > 0 ? result[0].value : null;
  } catch (error) {
    console.error("[Database] Failed to get system setting:", error);
    return null;
  }
}

// User Prompt Templates
export async function createUserPromptTemplate(
  template: InsertUserPromptTemplate
): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(userPromptTemplates).values(template);
  return result[0].insertId;
}

export async function getUserPromptTemplates(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(userPromptTemplates)
    .where(eq(userPromptTemplates.userId, userId))
    .orderBy(desc(userPromptTemplates.createdAt));
}

export async function deleteUserPromptTemplate(
  templateId: number,
  userId: number
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const result = await db
    .delete(userPromptTemplates)
    .where(
      and(
        eq(userPromptTemplates.id, templateId),
        eq(userPromptTemplates.userId, userId)
      )
    );

  return result[0].affectedRows > 0;
}

/**
 * Update system setting
 */
export async function updateSystemSetting(
  key: string,
  value: string,
  description?: string
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    const existing = await db
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.key, key))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(systemSettings)
        .set({ value, description })
        .where(eq(systemSettings.key, key));
    } else {
      await db.insert(systemSettings).values({ key, value, description });
    }

    return true;
  } catch (error) {
    console.error("[Database] Failed to update system setting:", error);
    return false;
  }
}

/**
 * Get dashboard statistics
 */
export async function getDashboardStats() {
  const db = await getDb();
  if (!db) {
    return {
      totalUsers: 0,
      totalCreditsIssued: 0,
      totalCreditsSold: 0,
      totalGeneratedImages: 0,
    };
  }

  try {
    const [
      totalUsers,
      totalCreditsIssued,
      totalCreditsSold,
      totalGeneratedImages,
    ] = await Promise.all([
      db.select({ count: sql`COUNT(*)` }).from(users),
      db
        .select({ sum: sql`SUM(amount)` })
        .from(creditTransactions)
        .where(eq(creditTransactions.type, "add")),
      db
        .select({ sum: sql`SUM(amount)` })
        .from(creditTransactions)
        .where(eq(creditTransactions.type, "purchase")),
      db.select({ count: sql`COUNT(*)` }).from(generatedImages),
    ]);

    return {
      totalUsers: Number(totalUsers[0]?.count) || 0,
      totalCreditsIssued: Number(totalCreditsIssued[0]?.sum) || 0,
      totalCreditsSold: Number(totalCreditsSold[0]?.sum) || 0,
      totalGeneratedImages: Number(totalGeneratedImages[0]?.count) || 0,
    };
  } catch (error) {
    console.error("[Database] Failed to get dashboard stats:", error);
    return {
      totalUsers: 0,
      totalCreditsIssued: 0,
      totalCreditsSold: 0,
      totalGeneratedImages: 0,
    };
  }
}

/**
 * Save or update prompt history
 * If the exact same prompt exists, increment usage count and update lastUsedAt
 * Otherwise, create a new entry
 */
export async function savePromptHistory(
  userId: number,
  prompt: string,
  aspectRatio: string,
  resolution: string
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    // Check if exact same prompt exists
    const existing = await db
      .select()
      .from(promptHistory)
      .where(
        and(
          eq(promptHistory.userId, userId),
          eq(promptHistory.prompt, prompt),
          eq(promptHistory.aspectRatio, aspectRatio),
          eq(promptHistory.resolution, resolution)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      // Update existing: increment usage count and update lastUsedAt
      await db
        .update(promptHistory)
        .set({
          usageCount: existing[0].usageCount + 1,
          lastUsedAt: new Date(),
        })
        .where(eq(promptHistory.id, existing[0].id));
    } else {
      // Create new entry
      await db.insert(promptHistory).values({
        userId,
        prompt,
        aspectRatio,
        resolution,
        usageCount: 1,
      });
    }

    return true;
  } catch (error) {
    console.error("[Database] Failed to save prompt history:", error);
    return false;
  }
}

/**
 * Get prompt history for a user
 * Ordered by lastUsedAt (most recent first)
 */
export async function getPromptHistory(userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];

  try {
    const history = await db
      .select()
      .from(promptHistory)
      .where(eq(promptHistory.userId, userId))
      .limit(limit)
      .orderBy(desc(promptHistory.lastUsedAt));

    return history;
  } catch (error) {
    console.error("[Database] Failed to get prompt history:", error);
    return [];
  }
}

/**
 * Delete a prompt history entry
 */
export async function deletePromptHistory(
  historyId: number,
  userId: number
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    const result = await db
      .delete(promptHistory)
      .where(
        and(eq(promptHistory.id, historyId), eq(promptHistory.userId, userId))
      );

    return result[0].affectedRows > 0;
  } catch (error) {
    console.error("[Database] Failed to delete prompt history:", error);
    return false;
  }
}

/**
 * Clear all prompt history for a user
 */
export async function clearPromptHistory(userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.delete(promptHistory).where(eq(promptHistory.userId, userId));

    return true;
  } catch (error) {
    console.error("[Database] Failed to clear prompt history:", error);
    return false;
  }
}

/**
 * Toggle favorite status for an image
 * If already favorited, remove it. Otherwise, add it.
 */
export async function toggleFavorite(
  userId: number,
  imageId: number
): Promise<{ isFavorited: boolean }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const deleted = await db
      .delete(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.imageId, imageId)));

    if ((deleted[0]?.affectedRows ?? 0) > 0) {
      return { isFavorited: false };
    }

    try {
      await db.insert(favorites).values({
        userId,
        imageId,
      });
      return { isFavorited: true };
    } catch (error) {
      if (isDuplicateEntryError(error)) {
        return { isFavorited: true };
      }
      throw error;
    }
  } catch (error) {
    console.error("[Database] Failed to toggle favorite:", error);
    throw error;
  }
}

/**
 * Check if an image is favorited by user
 */
export async function isFavorited(
  userId: number,
  imageId: number
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    const result = await db
      .select({ id: favorites.id })
      .from(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.imageId, imageId)))
      .limit(1);

    return result.length > 0;
  } catch (error) {
    console.error("[Database] Failed to check favorite status:", error);
    return false;
  }
}

/**
 * Get all favorite image IDs for a user
 */
export async function getFavoriteImageIds(userId: number): Promise<number[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const result = await db
      .select({ imageId: favorites.imageId })
      .from(favorites)
      .where(eq(favorites.userId, userId));

    return result.map(r => r.imageId);
  } catch (error) {
    console.error("[Database] Failed to get favorite image IDs:", error);
    return [];
  }
}

/**
 * Get favorite images for a user (with full image details)
 */
export async function getFavoriteImages(userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];

  try {
    const result = await db
      .select({
        id: generatedImages.id,
        userId: generatedImages.userId,
        prompt: generatedImages.prompt,
        referenceImageUrl: generatedImages.referenceImageUrl,
        generatedImageUrl: generatedImages.generatedImageUrl,
        aspectRatio: generatedImages.aspectRatio,
        resolution: generatedImages.resolution,
        creditsCost: generatedImages.creditsCost,
        taskId: generatedImages.taskId,
        createdAt: generatedImages.createdAt,
        favoritedAt: favorites.createdAt,
      })
      .from(favorites)
      .innerJoin(generatedImages, eq(favorites.imageId, generatedImages.id))
      .where(eq(favorites.userId, userId))
      .limit(limit)
      .orderBy(desc(favorites.createdAt));

    return result;
  } catch (error) {
    console.error("[Database] Failed to get favorite images:", error);
    return [];
  }
}

// ============================================
// AI Characters Functions
// ============================================

import {
  aiCharacters,
  InsertAiCharacter,
  aiCharacterImages,
  InsertAiCharacterImage,
} from "../drizzle/schema";

/**
 * Create a new AI character
 */
export async function createAiCharacter(data: {
  userId: number;
  name: string;
  characterImageUrl: string;
  description?: string;
  gender?: string;
  style?: string;
}): Promise<number | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.insert(aiCharacters).values({
      userId: data.userId,
      name: data.name,
      characterImageUrl: data.characterImageUrl,
      description: data.description || null,
      gender: data.gender || null,
      style: data.style || null,
    });

    return result[0].insertId;
  } catch (error) {
    console.error("[Database] Failed to create AI character:", error);
    return null;
  }
}

/**
 * Get all AI characters for a user
 */
export async function getUserAiCharacters(userId: number) {
  const db = await getDb();
  if (!db) return [];

  try {
    const characters = await db
      .select()
      .from(aiCharacters)
      .where(eq(aiCharacters.userId, userId))
      .orderBy(desc(aiCharacters.createdAt));

    return characters;
  } catch (error) {
    console.error("[Database] Failed to get AI characters:", error);
    return [];
  }
}

/**
 * Get a single AI character by ID
 */
export async function getAiCharacterById(characterId: number, userId: number) {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db
      .select()
      .from(aiCharacters)
      .where(
        and(eq(aiCharacters.id, characterId), eq(aiCharacters.userId, userId))
      )
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to get AI character:", error);
    return null;
  }
}

/**
 * Update an AI character
 */
export async function updateAiCharacter(
  characterId: number,
  userId: number,
  data: {
    name?: string;
    description?: string;
    gender?: string;
    style?: string;
    characterImageUrl?: string;
  }
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.gender !== undefined) updateData.gender = data.gender;
    if (data.style !== undefined) updateData.style = data.style;
    if (data.characterImageUrl !== undefined)
      updateData.characterImageUrl = data.characterImageUrl;

    if (Object.keys(updateData).length === 0) return true;

    const result = await db
      .update(aiCharacters)
      .set(updateData)
      .where(
        and(eq(aiCharacters.id, characterId), eq(aiCharacters.userId, userId))
      );

    return result[0].affectedRows > 0;
  } catch (error) {
    console.error("[Database] Failed to update AI character:", error);
    return false;
  }
}

/**
 * Delete an AI character
 */
export async function deleteAiCharacter(
  characterId: number,
  userId: number
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    const result = await db
      .delete(aiCharacters)
      .where(
        and(eq(aiCharacters.id, characterId), eq(aiCharacters.userId, userId))
      );

    return result[0].affectedRows > 0;
  } catch (error) {
    console.error("[Database] Failed to delete AI character:", error);
    return false;
  }
}

/**
 * Increment usage count for a character
 */
export async function incrementCharacterUsage(
  characterId: number
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db
      .update(aiCharacters)
      .set({
        usageCount: sql`${aiCharacters.usageCount} + 1`,
      })
      .where(eq(aiCharacters.id, characterId));

    return true;
  } catch (error) {
    console.error("[Database] Failed to increment character usage:", error);
    return false;
  }
}

/**
 * Save a generated image for an AI character
 */
export async function saveAiCharacterImage(data: {
  characterId: number;
  userId: number;
  prompt: string;
  referenceImageUrl?: string;
  generatedImageUrl: string;
  aspectRatio: string;
  resolution: string;
  creditsCost: number;
  taskId?: string;
}): Promise<number | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.insert(aiCharacterImages).values({
      characterId: data.characterId,
      userId: data.userId,
      prompt: data.prompt,
      referenceImageUrl: data.referenceImageUrl || null,
      generatedImageUrl: data.generatedImageUrl,
      aspectRatio: data.aspectRatio,
      resolution: data.resolution,
      creditsCost: data.creditsCost,
      taskId: data.taskId || null,
    });

    return result[0].insertId;
  } catch (error) {
    console.error("[Database] Failed to save AI character image:", error);
    return null;
  }
}

/**
 * Get generated images for a character
 */
export async function getAiCharacterImages(
  characterId: number,
  userId: number,
  limit: number = 50
) {
  const db = await getDb();
  if (!db) return [];

  try {
    const images = await db
      .select()
      .from(aiCharacterImages)
      .where(
        and(
          eq(aiCharacterImages.characterId, characterId),
          eq(aiCharacterImages.userId, userId)
        )
      )
      .limit(limit)
      .orderBy(desc(aiCharacterImages.createdAt));

    return images;
  } catch (error) {
    console.error("[Database] Failed to get AI character images:", error);
    return [];
  }
}

/**
 * Get all AI character images for a user (across all characters)
 */
export async function getAllAiCharacterImages(
  userId: number,
  limit: number = 50
) {
  const db = await getDb();
  if (!db) return [];

  try {
    const images = await db
      .select({
        id: aiCharacterImages.id,
        characterId: aiCharacterImages.characterId,
        characterName: aiCharacters.name,
        userId: aiCharacterImages.userId,
        prompt: aiCharacterImages.prompt,
        referenceImageUrl: aiCharacterImages.referenceImageUrl,
        generatedImageUrl: aiCharacterImages.generatedImageUrl,
        aspectRatio: aiCharacterImages.aspectRatio,
        resolution: aiCharacterImages.resolution,
        creditsCost: aiCharacterImages.creditsCost,
        taskId: aiCharacterImages.taskId,
        createdAt: aiCharacterImages.createdAt,
      })
      .from(aiCharacterImages)
      .innerJoin(
        aiCharacters,
        eq(aiCharacterImages.characterId, aiCharacters.id)
      )
      .where(eq(aiCharacterImages.userId, userId))
      .limit(limit)
      .orderBy(desc(aiCharacterImages.createdAt));

    return images;
  } catch (error) {
    console.error("[Database] Failed to get all AI character images:", error);
    return [];
  }
}

/**
 * Toggle character public status
 */
export async function toggleCharacterPublic(
  characterId: number,
  userId: number
): Promise<{ isPublic: boolean } | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    // Get current status
    const character = await db
      .select({ isPublic: aiCharacters.isPublic })
      .from(aiCharacters)
      .where(
        and(eq(aiCharacters.id, characterId), eq(aiCharacters.userId, userId))
      )
      .limit(1);

    if (character.length === 0) return null;

    const newStatus = !character[0].isPublic;

    await db
      .update(aiCharacters)
      .set({ isPublic: newStatus })
      .where(
        and(eq(aiCharacters.id, characterId), eq(aiCharacters.userId, userId))
      );

    return { isPublic: newStatus };
  } catch (error) {
    console.error(
      "[Database] Failed to toggle character public status:",
      error
    );
    return null;
  }
}

/**
 * Get public characters (for community showcase)
 */
export async function getPublicCharacters(
  limit: number = 50,
  offset: number = 0
) {
  const db = await getDb();
  if (!db) return [];

  try {
    const characters = await db
      .select({
        id: aiCharacters.id,
        name: aiCharacters.name,
        characterImageUrl: aiCharacters.characterImageUrl,
        description: aiCharacters.description,
        gender: aiCharacters.gender,
        style: aiCharacters.style,
        usageCount: aiCharacters.usageCount,
        createdAt: aiCharacters.createdAt,
        userName: users.name,
      })
      .from(aiCharacters)
      .innerJoin(users, eq(aiCharacters.userId, users.id))
      .where(eq(aiCharacters.isPublic, true))
      .limit(limit)
      .offset(offset)
      .orderBy(desc(aiCharacters.usageCount));

    return characters;
  } catch (error) {
    console.error("[Database] Failed to get public characters:", error);
    return [];
  }
}

/**
 * Get popular public characters (top by usage count)
 */
export async function getPopularCharacters(limit: number = 8) {
  const db = await getDb();
  if (!db) return [];

  try {
    const characters = await db
      .select({
        id: aiCharacters.id,
        name: aiCharacters.name,
        characterImageUrl: aiCharacters.characterImageUrl,
        description: aiCharacters.description,
        style: aiCharacters.style,
        usageCount: aiCharacters.usageCount,
        userName: users.name,
      })
      .from(aiCharacters)
      .innerJoin(users, eq(aiCharacters.userId, users.id))
      .where(eq(aiCharacters.isPublic, true))
      .limit(limit)
      .orderBy(desc(aiCharacters.usageCount));

    return characters;
  } catch (error) {
    console.error("[Database] Failed to get popular characters:", error);
    return [];
  }
}

/**
 * Get total count of public characters
 */
export async function getPublicCharactersCount(): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  try {
    const result = await db
      .select({ count: sql`COUNT(*)` })
      .from(aiCharacters)
      .where(eq(aiCharacters.isPublic, true));

    return Number(result[0]?.count) || 0;
  } catch (error) {
    console.error("[Database] Failed to get public characters count:", error);
    return 0;
  }
}

// ============================================
// Video Generation Functions
// ============================================

import {
  videoGenerations,
  InsertVideoGeneration,
  VideoGeneration,
} from "../drizzle/schema";

/**
 * Create a new video generation record
 */
export async function createVideoGeneration(data: {
  userId: number;
  prompt: string;
  referenceImageUrl?: string;
  model: string;
  mode: string;
  duration: number;
  quality?: string;
  hasAudio?: boolean;
  creditsCost: number;
  taskId?: string;
}): Promise<number | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.insert(videoGenerations).values({
      userId: data.userId,
      prompt: data.prompt,
      referenceImageUrl: data.referenceImageUrl || null,
      model: data.model,
      mode: data.mode,
      duration: data.duration,
      quality: data.quality || null,
      hasAudio: data.hasAudio || false,
      creditsCost: data.creditsCost,
      taskId: data.taskId || null,
      status: "pending",
    });

    return result[0].insertId;
  } catch (error) {
    console.error("[Database] Failed to create video generation:", error);
    return null;
  }
}

/**
 * Update video generation status
 */
export async function updateVideoGenerationStatus(
  id: number,
  status: "pending" | "processing" | "completed" | "failed",
  data?: {
    videoUrl?: string;
    thumbnailUrl?: string;
    errorMessage?: string;
    taskId?: string;
  }
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    const updateData: Record<string, unknown> = { status };

    if (data?.videoUrl) {
      updateData.videoUrl = data.videoUrl;
    }
    if (data?.thumbnailUrl) {
      updateData.thumbnailUrl = data.thumbnailUrl;
    }
    if (data?.errorMessage) {
      updateData.errorMessage = data.errorMessage;
    }
    if (data?.taskId) {
      updateData.taskId = data.taskId;
    }
    if (status === "completed" || status === "failed") {
      updateData.completedAt = new Date();
    }

    await db
      .update(videoGenerations)
      .set(updateData)
      .where(eq(videoGenerations.id, id));

    return true;
  } catch (error) {
    console.error(
      "[Database] Failed to update video generation status:",
      error
    );
    return false;
  }
}

/**
 * Get video generation by ID
 */
export async function getVideoGenerationById(
  id: number
): Promise<VideoGeneration | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db
      .select()
      .from(videoGenerations)
      .where(eq(videoGenerations.id, id))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to get video generation:", error);
    return null;
  }
}

/**
 * Get video generation by task ID
 */
export async function getVideoGenerationByTaskId(
  taskId: string
): Promise<VideoGeneration | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db
      .select()
      .from(videoGenerations)
      .where(eq(videoGenerations.taskId, taskId))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error(
      "[Database] Failed to get video generation by task ID:",
      error
    );
    return null;
  }
}

/**
 * Get user's video generations
 */
export async function getUserVideoGenerations(
  userId: number,
  limit: number = 50,
  offset: number = 0
) {
  const db = await getDb();
  if (!db) return [];

  try {
    const videos = await db
      .select()
      .from(videoGenerations)
      .where(eq(videoGenerations.userId, userId))
      .limit(limit)
      .offset(offset)
      .orderBy(desc(videoGenerations.createdAt));

    return videos;
  } catch (error) {
    console.error("[Database] Failed to get user video generations:", error);
    return [];
  }
}

/**
 * Get pending video generations (for status polling)
 */
export async function getPendingVideoGenerations(limit: number = 100) {
  const db = await getDb();
  if (!db) return [];

  try {
    const videos = await db
      .select()
      .from(videoGenerations)
      .where(sql`${videoGenerations.status} IN ('pending', 'processing')`)
      .limit(limit)
      .orderBy(videoGenerations.createdAt);

    return videos;
  } catch (error) {
    console.error("[Database] Failed to get pending video generations:", error);
    return [];
  }
}

/**
 * Get user's video generation count
 */
export async function getUserVideoCount(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  try {
    const result = await db
      .select({ count: sql`COUNT(*)` })
      .from(videoGenerations)
      .where(eq(videoGenerations.userId, userId));

    return Number(result[0]?.count) || 0;
  } catch (error) {
    console.error("[Database] Failed to get user video count:", error);
    return 0;
  }
}

// ============================================
// Upscale History Functions
// ============================================

import {
  upscaleHistory,
  InsertUpscaleHistory,
  UpscaleHistory,
} from "../drizzle/schema";

/**
 * Create a new upscale history record
 */
export async function createUpscaleHistory(data: {
  userId: number;
  originalImageUrl: string;
  upscaleFactor: string;
  creditsCost: number;
  taskId?: string;
  status?: string;
}): Promise<number | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.insert(upscaleHistory).values({
      userId: data.userId,
      originalImageUrl: data.originalImageUrl,
      upscaleFactor: data.upscaleFactor,
      creditsCost: data.creditsCost,
      taskId: data.taskId || null,
      status: data.status || "pending",
    });

    return result[0].insertId;
  } catch (error) {
    console.error("[Database] Failed to create upscale history:", error);
    return null;
  }
}

/**
 * Update upscale history record
 */
export async function updateUpscaleHistory(
  id: number,
  data: {
    status?: string;
    upscaledImageUrl?: string;
    errorMessage?: string;
    completedAt?: Date;
  }
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    const updateData: Record<string, unknown> = {};

    if (data.status) updateData.status = data.status;
    if (data.upscaledImageUrl)
      updateData.upscaledImageUrl = data.upscaledImageUrl;
    if (data.errorMessage) updateData.errorMessage = data.errorMessage;
    if (data.completedAt) updateData.completedAt = data.completedAt;

    await db
      .update(upscaleHistory)
      .set(updateData)
      .where(eq(upscaleHistory.id, id));

    return true;
  } catch (error) {
    console.error("[Database] Failed to update upscale history:", error);
    return false;
  }
}

/**
 * Get upscale history by task ID
 */
export async function getUpscaleHistoryByTaskId(
  taskId: string,
  userId: number
) {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db
      .select()
      .from(upscaleHistory)
      .where(
        and(
          eq(upscaleHistory.taskId, taskId),
          eq(upscaleHistory.userId, userId)
        )
      )
      .limit(1);

    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error(
      "[Database] Failed to get upscale history by task ID:",
      error
    );
    return null;
  }
}

/**
 * Get upscale history by ID
 */
export async function getUpscaleHistoryById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db
      .select()
      .from(upscaleHistory)
      .where(and(eq(upscaleHistory.id, id), eq(upscaleHistory.userId, userId)))
      .limit(1);

    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get upscale history by ID:", error);
    return null;
  }
}

/**
 * Get upscale history list for a user
 */
export async function getUpscaleHistoryList(
  userId: number,
  limit: number = 20,
  offset: number = 0
) {
  const db = await getDb();
  if (!db) return [];

  try {
    const result = await db
      .select()
      .from(upscaleHistory)
      .where(eq(upscaleHistory.userId, userId))
      .limit(limit)
      .offset(offset)
      .orderBy(desc(upscaleHistory.createdAt));

    return result;
  } catch (error) {
    console.error("[Database] Failed to get upscale history list:", error);
    return [];
  }
}

// ============================================
// Video Favorites Functions
// ============================================

import { videoFavorites } from "../drizzle/schema";

/**
 * Toggle favorite status for a video
 * If already favorited, remove it. Otherwise, add it.
 */
export async function toggleVideoFavorite(
  userId: number,
  videoId: number
): Promise<{ isFavorited: boolean }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const deleted = await db
      .delete(videoFavorites)
      .where(
        and(
          eq(videoFavorites.userId, userId),
          eq(videoFavorites.videoId, videoId)
        )
      );

    if ((deleted[0]?.affectedRows ?? 0) > 0) {
      return { isFavorited: false };
    }

    try {
      await db.insert(videoFavorites).values({
        userId,
        videoId,
      });
      return { isFavorited: true };
    } catch (error) {
      if (isDuplicateEntryError(error)) {
        return { isFavorited: true };
      }
      throw error;
    }
  } catch (error) {
    console.error("[Database] Failed to toggle video favorite:", error);
    throw error;
  }
}

/**
 * Check if a video is favorited by user
 */
export async function isVideoFavorited(
  userId: number,
  videoId: number
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    const result = await db
      .select({ id: videoFavorites.id })
      .from(videoFavorites)
      .where(
        and(
          eq(videoFavorites.userId, userId),
          eq(videoFavorites.videoId, videoId)
        )
      )
      .limit(1);

    return result.length > 0;
  } catch (error) {
    console.error("[Database] Failed to check video favorite:", error);
    return false;
  }
}

/**
 * Get all favorite video IDs for a user
 */
export async function getFavoriteVideoIds(userId: number): Promise<number[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const result = await db
      .select({ videoId: videoFavorites.videoId })
      .from(videoFavorites)
      .where(eq(videoFavorites.userId, userId));

    return result.map(r => r.videoId);
  } catch (error) {
    console.error("[Database] Failed to get favorite video IDs:", error);
    return [];
  }
}

/**
 * Get favorite videos for a user (with full video details)
 */
export async function getFavoriteVideos(userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];

  try {
    const result = await db
      .select({
        id: videoGenerations.id,
        userId: videoGenerations.userId,
        prompt: videoGenerations.prompt,
        referenceImageUrl: videoGenerations.referenceImageUrl,
        videoUrl: videoGenerations.videoUrl,
        thumbnailUrl: videoGenerations.thumbnailUrl,
        model: videoGenerations.model,
        mode: videoGenerations.mode,
        duration: videoGenerations.duration,
        quality: videoGenerations.quality,
        hasAudio: videoGenerations.hasAudio,
        creditsCost: videoGenerations.creditsCost,
        status: videoGenerations.status,
        taskId: videoGenerations.taskId,
        createdAt: videoGenerations.createdAt,
        favoritedAt: videoFavorites.createdAt,
      })
      .from(videoFavorites)
      .innerJoin(
        videoGenerations,
        eq(videoFavorites.videoId, videoGenerations.id)
      )
      .where(eq(videoFavorites.userId, userId))
      .limit(limit)
      .orderBy(desc(videoFavorites.createdAt));

    return result;
  } catch (error) {
    console.error("[Database] Failed to get favorite videos:", error);
    return [];
  }
}
export async function recordVideoFavorite(
  userId: number,
  videoId: number
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    try {
      await db.insert(videoFavorites).values({
        userId,
        videoId,
      });
    } catch (error) {
      if (!isDuplicateEntryError(error)) {
        throw error;
      }
    }
    return true;
  } catch (error) {
    console.error("[Database] Failed to record video favorite:", error);
    return false;
  }
}

export async function removeVideoFavorite(
  userId: number,
  videoId: number
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db
      .delete(videoFavorites)
      .where(
        and(
          eq(videoFavorites.userId, userId),
          eq(videoFavorites.videoId, videoId)
        )
      );

    return true;
  } catch (error) {
    console.error("[Database] Failed to remove video favorite:", error);
    return false;
  }
}

export async function getVideoFavorites(userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];

  try {
    const favorites = await db
      .select({
        id: videoFavorites.id,
        createdAt: videoFavorites.createdAt,
        video: videoGenerations,
      })
      .from(videoFavorites)
      .innerJoin(
        videoGenerations,
        eq(videoFavorites.videoId, videoGenerations.id)
      )
      .where(eq(videoFavorites.userId, userId))
      .orderBy(desc(videoFavorites.createdAt))
      .limit(limit);

    return favorites;
  } catch (error) {
    console.error("[Database] Failed to get video favorites:", error);
    return [];
  }
}

/**
 * Update AI Model Stats
 */
export async function updateAiModelStats(
  modelKey: string,
  success: boolean,
  renderTimeMs?: number,
  costUsd?: number
) {
  const db = await getDb();
  if (!db) return;

  try {
    const { aiModelConfig } = await import("../drizzle/schema");

    // Normalize model key if needed (e.g. replace dashes with underscores for consistency if that's the convention)
    // For now we'll assume keys are consistent.

    // Check if model exists
    const model = await db
      .select()
      .from(aiModelConfig)
      .where(eq(aiModelConfig.modelKey, modelKey))
      .limit(1);

    if (model.length === 0) {
      // If model doesn't exist in config, we could optionally create it or just ignore
      // For proper stats we should probably ensure it exists.
      // Let's create a stub if it doesn't exist
      await db.insert(aiModelConfig).values({
        modelKey,
        modelName: modelKey.replace(/_/g, " ").replace(/-/g, " ").toUpperCase(),
        modelType:
          modelKey.includes("video") ||
          modelKey.includes("veo") ||
          modelKey.includes("kling") ||
          modelKey.includes("grok") ||
          modelKey.includes("sora")
            ? "video"
            : "image",
        provider: "system",
        totalRequests: 1,
        successfulRequests: success ? 1 : 0,
        failedRequests: success ? 0 : 1,
        avgRenderTimeMs: success && renderTimeMs ? renderTimeMs : 0,
        totalCostUsd: costUsd ? String(costUsd) : "0",
      });
      return;
    }

    const currentReqs = model[0].totalRequests || 0;
    const currentSuccess = model[0].successfulRequests || 0;
    const currentFailed = model[0].failedRequests || 0;
    const currentAvgTime = model[0].avgRenderTimeMs || 0;
    const currentTotalCost = Number(model[0].totalCostUsd || 0);
    const costPerRequest = Number(model[0].costPerRequest || 0);

    const newReqs = currentReqs + 1;
    const newSuccess = success ? currentSuccess + 1 : currentSuccess;
    const newFailed = success ? currentFailed : currentFailed + 1;

    // Calculate new average render time
    let newAvgTime = currentAvgTime;
    if (renderTimeMs && success) {
      // Avoid division by zero
      const validSuccessCount = newSuccess > 0 ? newSuccess : 1;
      // Weighted average: ((old_avg * old_success) + new_time) / new_success
      newAvgTime = Math.round(
        (currentAvgTime * currentSuccess + renderTimeMs) / validSuccessCount
      );
    }

    const actualCost =
      costUsd !== undefined ? costUsd : success ? costPerRequest : 0;
    const newTotalCost = currentTotalCost + actualCost;

    await db
      .update(aiModelConfig)
      .set({
        totalRequests: newReqs,
        successfulRequests: newSuccess,
        failedRequests: newFailed,
        avgRenderTimeMs: newAvgTime,
        totalCostUsd: String(newTotalCost),
      })
      .where(eq(aiModelConfig.modelKey, modelKey));
  } catch (error) {
    console.error("[Database] Failed to update AI model stats:", error);
  }
}

export async function getAiModelConfig(modelKey: string) {
  const db = await getDb();
  if (!db) return null;
  try {
    const { aiModelConfig } = await import("../drizzle/schema");
    const [model] = await db
      .select()
      .from(aiModelConfig)
      .where(eq(aiModelConfig.modelKey, modelKey))
      .limit(1);
    return model ?? null;
  } catch {
    return null;
  }
}

// ─── Audio Generation ─────────────────────────────────────────────────────────

export async function createAudioGeneration(data: {
  userId: number;
  text: string;
  provider: "minimax" | "elevenlabs";
  model: string;
  voiceId: string;
  language?: string;
  speed?: number;
  creditsCost: number;
}): Promise<number | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.insert(generatedAudio).values({
      userId: data.userId,
      text: data.text,
      provider: data.provider,
      model: data.model,
      voiceId: data.voiceId,
      language: data.language ?? null,
      speed: data.speed ? String(data.speed) : "1.00",
      creditsCost: data.creditsCost,
      status: "pending",
    });
    return result[0].insertId;
  } catch (error) {
    console.error("[Database] Failed to create audio generation:", error);
    return null;
  }
}

export async function updateAudioGenerationStatus(
  id: number,
  status: "pending" | "processing" | "completed" | "failed",
  data?: { audioUrl?: string; durationMs?: number; errorMessage?: string }
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    const updateData: Record<string, unknown> = { status };
    if (data?.audioUrl) updateData.audioUrl = data.audioUrl;
    if (data?.durationMs != null) updateData.durationMs = data.durationMs;
    if (data?.errorMessage) updateData.errorMessage = data.errorMessage;
    if (status === "completed" || status === "failed") {
      updateData.completedAt = sql`NOW()`;
    }

    await db
      .update(generatedAudio)
      .set(updateData)
      .where(eq(generatedAudio.id, id));
    return true;
  } catch (error) {
    console.error(
      "[Database] Failed to update audio generation status:",
      error
    );
    return false;
  }
}

export async function getUserAudioGenerations(
  userId: number,
  limit = 50,
  offset = 0
) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(generatedAudio)
    .where(eq(generatedAudio.userId, userId))
    .orderBy(desc(generatedAudio.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function getUserAudioCount(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const result = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(generatedAudio)
    .where(eq(generatedAudio.userId, userId));
  return Number(result[0]?.count ?? 0);
}

export async function getAudioGenerationById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(generatedAudio)
    .where(eq(generatedAudio.id, id))
    .limit(1);
  return result[0] ?? null;
}

// ─── Music Generation ─────────────────────────────────────────────────────────

export async function createMusicGeneration(data: {
  userId: number;
  lyrics: string;
  prompt?: string;
  model?: string;
  creditsCost: number;
}): Promise<number | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.insert(generatedMusic).values({
      userId: data.userId,
      lyrics: data.lyrics,
      prompt: data.prompt ?? null,
      model: data.model ?? "music-2.5",
      creditsCost: data.creditsCost,
      status: "pending",
    });
    return result[0].insertId;
  } catch (error) {
    console.error("[Database] Failed to create music generation:", error);
    return null;
  }
}

export async function updateMusicGenerationStatus(
  id: number,
  status: "pending" | "processing" | "completed" | "failed",
  data?: { audioUrl?: string; durationMs?: number; errorMessage?: string }
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    const updateData: Record<string, unknown> = { status };
    if (data?.audioUrl) updateData.audioUrl = data.audioUrl;
    if (data?.durationMs != null) updateData.durationMs = data.durationMs;
    if (data?.errorMessage) updateData.errorMessage = data.errorMessage;
    if (status === "completed" || status === "failed") {
      updateData.completedAt = sql`NOW()`;
    }

    await db
      .update(generatedMusic)
      .set(updateData)
      .where(eq(generatedMusic.id, id));
    return true;
  } catch (error) {
    console.error(
      "[Database] Failed to update music generation status:",
      error
    );
    return false;
  }
}

export async function getUserMusicGenerations(
  userId: number,
  limit = 50,
  offset = 0
) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(generatedMusic)
    .where(eq(generatedMusic.userId, userId))
    .orderBy(desc(generatedMusic.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function getUserMusicCount(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const result = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(generatedMusic)
    .where(eq(generatedMusic.userId, userId));
  return Number(result[0]?.count ?? 0);
}

export async function getMusicGenerationById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(generatedMusic)
    .where(eq(generatedMusic.id, id))
    .limit(1);
  return result[0] ?? null;
}
