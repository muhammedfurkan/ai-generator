import { createClerkClient, verifyToken } from "@clerk/backend";
import { ENV } from "./env";

/**
 * Initialize Clerk client with secret key
 */
export function getClerkClient() {
  if (!ENV.clerkSecretKey) {
    throw new Error("CLERK_SECRET_KEY is not configured");
  }
  return createClerkClient({
    secretKey: ENV.clerkSecretKey,
  });
}

/**
 * Verify Clerk __session cookie token (JWT)
 * This is the primary method for authenticating Clerk users
 */
export async function verifyClerkSessionToken(sessionToken: string): Promise<{
  userId: string;
  email: string | null;
  name: string | null;
} | null> {
  try {
    if (!ENV.clerkSecretKey) {
      console.warn("[ClerkAuth] CLERK_SECRET_KEY not configured");
      return null;
    }

    // Verify the JWT token from __session cookie
    const verifiedToken = await verifyToken(sessionToken, {
      secretKey: ENV.clerkSecretKey,
    });

    if (!verifiedToken || !verifiedToken.sub) {
      console.log("[ClerkAuth] Token verification failed - no sub claim");
      return null;
    }

    const clerkUserId = verifiedToken.sub;
    // console.log("[ClerkAuth] Token verified, userId:", clerkUserId);

    // Get user details from Clerk
    const clerk = getClerkClient();
    const user = await clerk.users.getUser(clerkUserId);

    return {
      userId: user.id,
      email: user.emailAddresses[0]?.emailAddress ?? null,
      name: user.firstName
        ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ""}`
        : user.username ?? null,
    };
  } catch (error) {
    console.warn("[ClerkAuth] Session token verification failed:", error instanceof Error ? error.message : String(error));
    return null;
  }
}

/**
 * Verify Clerk session token (legacy - for session ID)
 */
export async function verifyClerkToken(token: string): Promise<{
  userId: string;
  email: string | null;
  name: string | null;
} | null> {
  try {
    const clerk = getClerkClient();
    const session = await clerk.sessions.getSession(token);

    if (!session || !session.userId) {
      return null;
    }

    // Get user details
    const user = await clerk.users.getUser(session.userId);

    return {
      userId: user.id,
      email: user.emailAddresses[0]?.emailAddress ?? null,
      name: user.firstName
        ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ""}`
        : user.username ?? null,
    };
  } catch (error) {
    console.warn("[ClerkAuth] Token verification failed", String(error));
    return null;
  }
}

/**
 * Get user from Clerk by ID
 */
export async function getClerkUser(userId: string) {
  try {
    const clerk = getClerkClient();
    return await clerk.users.getUser(userId);
  } catch (error) {
    console.warn("[ClerkAuth] Failed to get user", String(error));
    return null;
  }
}

/**
 * Create a Clerk user for email verification purposes
 * This creates a user in Clerk and triggers email verification
 */
export async function createClerkUserForVerification(data: {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}): Promise<{
  success: boolean;
  clerkUserId?: string;
  error?: string;
  needsVerification?: boolean;
}> {
  try {
    const clerk = getClerkClient();

    // Create user in Clerk with email/password
    // Clerk will automatically send verification email if enabled in dashboard
    const user = await clerk.users.createUser({
      emailAddress: [data.email],
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      skipPasswordChecks: true, // We already validated the password
    });

    console.log("[ClerkAuth] Created Clerk user for verification:", user.id);

    // Check if email needs verification
    const primaryEmail = user.emailAddresses.find(e => e.emailAddress === data.email);
    const needsVerification = primaryEmail?.verification?.status !== "verified";

    return {
      success: true,
      clerkUserId: user.id,
      needsVerification
    };
  } catch (error: unknown) {
    const err = error as { errors?: Array<{ code: string; message: string }> };
    console.error("[ClerkAuth] Failed to create user for verification:", error);

    // Handle specific Clerk errors
    if (err.errors && err.errors.length > 0) {
      const clerkError = err.errors[0];
      if (clerkError.code === "form_identifier_exists") {
        return { success: false, error: "Bu email adresi zaten kayıtlı" };
      }
      return { success: false, error: clerkError.message };
    }

    return { success: false, error: "Email doğrulama başlatılamadı" };
  }
}

/**
 * Check if a Clerk user's email is verified
 */
export async function checkClerkEmailVerification(clerkUserId: string): Promise<{
  verified: boolean;
  email?: string;
}> {
  try {
    const clerk = getClerkClient();
    const user = await clerk.users.getUser(clerkUserId);

    const primaryEmail = user.emailAddresses[0];
    const verified = primaryEmail?.verification?.status === "verified";

    return {
      verified,
      email: primaryEmail?.emailAddress
    };
  } catch (error) {
    console.error("[ClerkAuth] Failed to check email verification:", error);
    return { verified: false };
  }
}

/**
 * Resend verification email for a Clerk user
 * Note: In Clerk, verification emails are managed via the frontend SDK.
 * This function checks if the user needs verification.
 */
export async function resendClerkVerificationEmail(clerkUserId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const clerk = getClerkClient();
    const user = await clerk.users.getUser(clerkUserId);

    const primaryEmail = user.emailAddresses[0];
    if (!primaryEmail) {
      return { success: false, error: "Email adresi bulunamadı" };
    }

    if (primaryEmail.verification?.status === "verified") {
      return { success: false, error: "Email zaten doğrulanmış" };
    }

    // Note: Clerk Backend SDK doesn't support programmatic email resending.
    // Users should use the Clerk frontend SDK's prepareVerification method
    // or click the resend button in the UI.
    // Here we just confirm the user needs verification.

    console.log("[ClerkAuth] User needs email verification:", clerkUserId);
    return { success: true };
  } catch (error) {
    console.error("[ClerkAuth] Failed to check verification status:", error);
    return { success: false, error: "Doğrulama durumu kontrol edilemedi" };
  }
}

/**
 * Delete a Clerk user (cleanup for failed registrations)
 */
export async function deleteClerkUser(clerkUserId: string): Promise<boolean> {
  try {
    const clerk = getClerkClient();
    await clerk.users.deleteUser(clerkUserId);
    console.log("[ClerkAuth] Deleted Clerk user:", clerkUserId);
    return true;
  } catch (error) {
    console.error("[ClerkAuth] Failed to delete Clerk user:", error);
    return false;
  }
}
