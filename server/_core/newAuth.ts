// @ts-nocheck
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import {
  hashPassword,
  verifyPassword,
  createSessionToken,
  isValidEmail,
  isValidPassword,
} from "./passwordAuth";
import { notifyNewUserRegistration } from "../telegramBot";
import {
  generateVerificationCode,
  sendVerificationEmail,
  isEmailVerificationEnabled,
  isEmailPasswordAuthEnabled,
  isGoogleAuthEnabled,
} from "./emailService";

/**
 * Register new auth routes for email/password authentication
 * This uses our own SMTP-based email verification instead of Clerk
 */
export function registerNewAuthRoutes(app: Express) {
  // Get auth configuration endpoint
  app.get("/api/auth/config", (_req: Request, res: Response) => {
    res.json({
      emailPasswordAuthEnabled: isEmailPasswordAuthEnabled(),
      googleAuthEnabled: isGoogleAuthEnabled(),
      emailVerificationEnabled: isEmailVerificationEnabled(),
    });
  });

  // Email/Password Registration - creates user and sends verification email
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const { email, password, name } = req.body;

      // Validate inputs
      if (!email || !password || !name) {
        return res
          .status(400)
          .json({ error: "Email, şifre ve isim gereklidir" });
      }

      if (!isValidEmail(email)) {
        return res.status(400).json({ error: "Geçersiz email formatı" });
      }

      if (!isValidPassword(password)) {
        return res.status(400).json({
          error:
            "Şifre en az 8 karakter olmalı ve büyük harf, küçük harf ve rakam içermelidir",
        });
      }

      // Check if email verification is enabled
      const emailVerificationRequired = isEmailVerificationEnabled();

      // Check if user already exists
      const existingUser = await db.getUserByEmail(email);
      if (existingUser) {
        // If user exists but not verified, resend verification code
        if (!existingUser.emailVerified && emailVerificationRequired) {
          const code = generateVerificationCode();
          await db.updateUserVerificationCode(existingUser.id, code);

          const emailResult = await sendVerificationEmail(email, name, code);
          if (!emailResult.success) {
            console.error(
              "[Auth] Failed to resend verification email:",
              emailResult.error
            );
            return res
              .status(500)
              .json({ error: "Doğrulama emaili gönderilemedi" });
          }

          return res.json({
            success: true,
            requiresVerification: true,
            email,
            message: "Doğrulama kodu email adresinize gönderildi",
          });
        }
        return res.status(400).json({ error: "Bu email adresi zaten kayıtlı" });
      }

      // Hash password and create user
      const passwordHash = await hashPassword(password);

      // If email verification is disabled, create user as verified and log them in directly
      if (!emailVerificationRequired) {
        await db.createUserWithPassword({
          email,
          name,
          passwordHash,
        });

        // Mark user as verified immediately
        const newUser = await db.getUserByEmail(email);
        if (!newUser) {
          return res.status(500).json({ error: "Kullanıcı oluşturulamadı" });
        }
        await db.updateEmailVerificationStatus(newUser.id, true);

        // Notify admin about new user registration
        notifyNewUserRegistration({
          name: name,
          email: email,
          loginMethod: "email",
        }).catch(error => {
          console.error("[Auth] Failed to send new user notification:", error);
        });

        // Create session token
        const sessionToken = await createSessionToken(newUser.id, {
          name: newUser.name ?? "",
          email: newUser.email ?? "",
        });

        // Set session cookie
        const cookieOptions = getSessionCookieOptions(req);
        res.cookie(COOKIE_NAME, sessionToken, {
          ...cookieOptions,
          maxAge: ONE_YEAR_MS,
        });

        console.log("[Auth] User registered without verification (disabled):", {
          userId: newUser.id,
          email,
        });
        return res.json({
          success: true,
          requiresVerification: false,
          userId: newUser.id,
          message: "Hesabınız başarıyla oluşturuldu",
        });
      }

      // Email verification is enabled - proceed with verification flow
      // Generate verification code
      const verificationCode = generateVerificationCode();
      const codeExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      await db.createUserWithPassword({
        email,
        name,
        passwordHash,
        emailVerificationCode: verificationCode,
        emailVerificationCodeExpiry: codeExpiry,
      });

      // Send verification email
      const emailResult = await sendVerificationEmail(
        email,
        name,
        verificationCode
      );
      if (!emailResult.success) {
        console.error(
          "[Auth] Failed to send verification email:",
          emailResult.error
        );
        // User is created but email failed - they can request resend
        return res.json({
          success: true,
          requiresVerification: true,
          email,
          message:
            "Hesap oluşturuldu ancak doğrulama emaili gönderilemedi. Tekrar gönder'e tıklayın.",
        });
      }

      console.log(
        "[Auth] Registration initiated, verification email sent to:",
        email
      );
      res.json({
        success: true,
        requiresVerification: true,
        email,
        message: "Doğrulama kodu email adresinize gönderildi",
      });
    } catch (error) {
      console.error("[Auth] Registration failed", error);
      res.status(500).json({ error: "Kayıt başarısız oldu" });
    }
  });

  // Verify email with code
  app.post("/api/auth/verify-email", async (req: Request, res: Response) => {
    try {
      const { email, code } = req.body;

      if (!email || !code) {
        return res
          .status(400)
          .json({ error: "Email ve doğrulama kodu gereklidir" });
      }

      // Verify the code
      const verification = await db.verifyEmailCode(email, code);

      if (!verification.valid) {
        if (verification.expired) {
          return res
            .status(400)
            .json({
              error: "Doğrulama kodu süresi dolmuş. Lütfen yeni kod isteyin.",
            });
        }
        return res.status(400).json({ error: "Geçersiz doğrulama kodu" });
      }

      // Update user verification status
      if (!verification.userId) {
        return res.status(400).json({ error: "Kullanıcı bulunamadı" });
      }

      await db.updateEmailVerificationStatus(verification.userId, true);

      // Get user for session
      const user = await db.getUserById(verification.userId);
      if (!user) {
        return res.status(404).json({ error: "Kullanıcı bulunamadı" });
      }

      // Notify admin about new user registration
      notifyNewUserRegistration({
        name: user.name ?? email.split("@")[0],
        email: user.email ?? email,
        loginMethod: "email",
      }).catch(error => {
        console.error("[Auth] Failed to send new user notification:", error);
      });

      // Create session token
      const sessionToken = await createSessionToken(user.id, {
        name: user.name ?? "",
        email: user.email ?? "",
      });

      // Set session cookie
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, {
        ...cookieOptions,
        maxAge: ONE_YEAR_MS,
      });

      console.log("[Auth] Email verified successfully:", {
        userId: user.id,
        email,
      });
      res.json({ success: true, userId: user.id });
    } catch (error) {
      console.error("[Auth] Email verification failed", error);
      res.status(500).json({ error: "Doğrulama başarısız oldu" });
    }
  });

  // Resend verification email
  app.post(
    "/api/auth/resend-verification",
    async (req: Request, res: Response) => {
      try {
        const { email } = req.body;

        if (!email) {
          return res.status(400).json({ error: "Email gereklidir" });
        }

        const user = await db.getUserByEmail(email);
        if (!user) {
          return res.status(404).json({ error: "Kullanıcı bulunamadı" });
        }

        if (user.emailVerified) {
          return res.status(400).json({ error: "Email zaten doğrulanmış" });
        }

        // Generate new code and update
        const newCode = generateVerificationCode();
        await db.updateUserVerificationCode(user.id, newCode);

        // Send new verification email
        const emailResult = await sendVerificationEmail(
          email,
          user.name ?? email.split("@")[0],
          newCode
        );
        if (!emailResult.success) {
          console.error(
            "[Auth] Failed to resend verification email:",
            emailResult.error
          );
          return res
            .status(500)
            .json({ error: "Doğrulama emaili gönderilemedi" });
        }

        console.log("[Auth] Verification email resent to:", email);
        res.json({
          success: true,
          message: "Doğrulama kodu yeniden gönderildi",
        });
      } catch (error) {
        console.error("[Auth] Resend verification failed", error);
        res.status(500).json({ error: "Doğrulama emaili gönderilemedi" });
      }
    }
  );

  // Email/Password Login
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      // Validate inputs
      if (!email || !password) {
        return res.status(400).json({ error: "Email ve şifre gereklidir" });
      }

      // Get user by email
      const user = await db.getUserByEmail(email);
      if (!user || !user.passwordHash) {
        return res.status(401).json({ error: "Email veya şifre hatalı" });
      }

      // Verify password
      const isValid = await verifyPassword(password, user.passwordHash);
      if (!isValid) {
        return res.status(401).json({ error: "Email veya şifre hatalı" });
      }

      // Check email verification for email/password users (only if verification is enabled)
      if (
        user.loginMethod === "email" &&
        !user.emailVerified &&
        isEmailVerificationEnabled()
      ) {
        return res.status(403).json({
          error: "Email adresiniz henüz doğrulanmamış",
          requiresVerification: true,
          email: user.email,
        });
      }

      // Update last signed in
      await db.updateUserLastSignedIn(user.id);

      // Create session token
      const sessionToken = await createSessionToken(user.id, {
        name: user.name ?? "",
        email: user.email ?? "",
      });

      // Set session cookie
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, {
        ...cookieOptions,
        maxAge: ONE_YEAR_MS,
      });

      res.json({ success: true, userId: user.id });
    } catch (error) {
      console.error("[Auth] Login failed", error);
      res.status(500).json({ error: "Giriş başarısız" });
    }
  });

  // Google OAuth - Get auth URL
  app.get("/api/auth/google", async (_req: Request, res: Response) => {
    // Dynamic import to avoid loading googleapis if not needed
    const { getGoogleAuthUrl, isGoogleOAuthConfigured } =
      await import("./googleAuth");

    // Check if Google auth is enabled
    if (!isGoogleAuthEnabled()) {
      return res
        .status(403)
        .json({ error: "Google ile giriş devre dışı bırakılmış" });
    }

    // Check if Google OAuth is configured
    if (!isGoogleOAuthConfigured()) {
      return res.status(500).json({ error: "Google OAuth yapılandırılmamış" });
    }

    const authUrl = getGoogleAuthUrl();
    if (!authUrl) {
      return res.status(500).json({ error: "Google OAuth URL oluşturulamadı" });
    }

    res.json({ authUrl });
  });

  // Google OAuth Callback - Handle the callback from Google
  app.get("/api/auth/google/callback", async (req: Request, res: Response) => {
    const { getGoogleUserFromCode, isGoogleOAuthConfigured } =
      await import("./googleAuth");

    // Check if Google auth is enabled
    if (!isGoogleAuthEnabled()) {
      return res.redirect("/login?error=google_disabled");
    }

    // Check if Google OAuth is configured
    if (!isGoogleOAuthConfigured()) {
      return res.redirect("/login?error=google_not_configured");
    }

    const code = req.query.code as string;
    if (!code) {
      console.error("[Auth] Google callback: No code provided");
      return res.redirect("/login?error=no_code");
    }

    try {
      console.log("[Auth] Google callback received with code");

      // Get user info from Google
      const result = await getGoogleUserFromCode(code);
      if (!result.success || !result.user) {
        console.error("[Auth] Failed to get Google user:", result.error);
        return res.redirect(
          `/login?error=${encodeURIComponent(result.error ?? "google_auth_failed")}`
        );
      }

      const { email, name, googleId, picture } = result.user;

      // Check if user exists
      let user = await db.getUserByEmail(email);
      let isNewUser = false;

      if (!user) {
        // Create new user with Google login
        console.log("[Auth] Creating new user from Google:", {
          email,
          name,
          googleId,
        });
        await db.createUserWithGoogle({
          email,
          name,
          googleId,
          profileImage: picture,
        });
        user = await db.getUserByEmail(email);
        isNewUser = true;

        if (!user) {
          console.error("[Auth] Failed to create user from Google");
          return res.redirect("/login?error=user_creation_failed");
        }

        // Notify admin about new user registration
        notifyNewUserRegistration({
          name: name,
          email: email,
          loginMethod: "google",
        }).catch(error => {
          console.error("[Auth] Failed to send new user notification:", error);
        });
      } else {
        // Update existing user with Google ID if not set
        if (!user.googleId) {
          await db.updateUserGoogleId(user.id, googleId);
        }
        // Update last signed in
        await db.updateUserLastSignedIn(user.id);
      }

      console.log("[Auth] Google login successful:", {
        userId: user.id,
        email,
        isNewUser,
        action: isNewUser ? "REGISTERED" : "LOGGED_IN",
      });

      // Create session token
      const sessionToken = await createSessionToken(user.id, {
        name: user.name ?? "",
        email: user.email ?? "",
      });

      // Set session cookie
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, {
        ...cookieOptions,
        maxAge: ONE_YEAR_MS,
      });

      // Redirect to home page
      res.redirect("/");
    } catch (error) {
      console.error("[Auth] Google callback failed with exception:", error);
      res.redirect(
        `/login?error=${encodeURIComponent("authentication_failed")}`
      );
    }
  });

  // Logout
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    const cookieOptions = getSessionCookieOptions(req);
    // Clear our custom session cookie
    res.clearCookie(COOKIE_NAME, cookieOptions);
    console.log("[Logout] Cleared cookies via REST API:", COOKIE_NAME);
    res.json({ success: true });
  });
}
