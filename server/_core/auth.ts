// @ts-nocheck
import { ForbiddenError } from "@shared/_core/errors";
import { COOKIE_NAME, UNAUTHED_ERR_MSG } from "@shared/const";
import { parse as parseCookieHeader } from "cookie";
import type { Request } from "express";
import type { User } from "../../drizzle/schema";
import * as db from "../db";
import { verifySessionToken } from "./passwordAuth";
import { sdk } from "./sdk";
import { verifyClerkSessionToken } from "./clerkAuth";
import { notifyNewUserRegistration } from "../telegramBot";

/**
 * Authenticate a request using:
 * 1. Our custom session cookie (email/password login)
 * 2. Clerk session cookie (__session)
 * 3. Legacy Manus OAuth (fallback)
 */
export async function authenticateRequest(req: Request): Promise<User> {
  // Parse cookies
  const cookieHeader = req.headers.cookie;
  const cookies = new Map(
    Object.entries(parseCookieHeader(cookieHeader ?? ""))
  );
  const sessionCookie = cookies.get(COOKIE_NAME);
  const clerkSessionCookie = cookies.get("__session");

  // console.log("[Auth] Request authentication:", {
  //   hasCookieHeader: !!cookieHeader,
  //   cookieName: COOKIE_NAME,
  //   hasSessionCookie: !!sessionCookie,
  //   hasClerkSession: !!clerkSessionCookie,
  //   allCookies: Array.from(cookies.keys()),
  //   path: req.path,
  // });

  // Try our custom session cookie first (email/password login)
  if (sessionCookie) {
    try {
      const sessionData = await verifySessionToken(sessionCookie);
      console.log("[Auth] Custom session verification result:", {
        hasSessionData: !!sessionData,
        userId: sessionData?.userId,
      });
      if (sessionData) {
        const user = await db.getUserById(sessionData.userId);
        if (user) {
          // console.log("[Auth] User authenticated via custom session:", { userId: user.id, email: user.email });
          return user;
        }
      }
    } catch (error) {
      console.log(
        "[Auth] Custom session auth failed:",
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  // Try Clerk session cookie
  if (clerkSessionCookie) {
    try {
      const clerkUser = await verifyClerkSessionToken(clerkSessionCookie);
      if (clerkUser) {
        // console.log("[Auth] Clerk session verified:", { clerkUserId: clerkUser.userId });

        // Get or create user in our database
        let user = await db.getUserByClerkId(clerkUser.userId);

        if (!user && clerkUser.email) {
          // Create user if doesn't exist
          console.log("[Auth] Creating new user from Clerk session:", {
            email: clerkUser.email,
          });
          await db.upsertClerkUser({
            clerkId: clerkUser.userId,
            email: clerkUser.email,
            name: clerkUser.name || clerkUser.email.split("@")[0],
          });
          user = await db.getUserByClerkId(clerkUser.userId);

          // Send Telegram notification for new user
          if (user) {
            notifyNewUserRegistration({
              name: clerkUser.name || clerkUser.email.split("@")[0],
              email: clerkUser.email,
              loginMethod: "google",
            }).catch(error => {
              console.error(
                "[Auth] Failed to send new user notification:",
                error
              );
            });
          }
        }

        if (user) {
          // console.log("[Auth] User authenticated via Clerk session:", { userId: user.id, email: user.email });
          return user;
        }
      }
    } catch (error) {
      console.log(
        "[Auth] Clerk session auth failed:",
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  // Fall back to legacy Manus OAuth
  try {
    const user = await sdk.authenticateRequest(req);
    // console.log("[Auth] User authenticated via legacy OAuth:", { userId: user.id });
    return user;
  } catch (error) {
    console.log("[Auth] All auth methods failed");
    throw ForbiddenError(UNAUTHED_ERR_MSG);
  }
}
