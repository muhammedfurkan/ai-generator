import nodemailer from "nodemailer";
import crypto from "crypto";

// SMTP Configuration from environment variables
const SMTP_CONFIG = {
  host: process.env.SMTP_HOST ?? "cpmail.hostingdunyam.online",
  port: parseInt(process.env.SMTP_PORT ?? "465"),
  secure: true, // SSL/TLS
  auth: {
    user: process.env.SMTP_USER ?? "",
    pass: process.env.SMTP_PASS ?? "",
  },
};

// Email templates in Turkish
const EMAIL_TEMPLATES = {
  verification: {
    subject: "E-posta Doğrulama - Amonify",
    getHtml: (code: string, name: string) => `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>E-posta Doğrulama</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f0f23;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 40px;">
      <h1 style="color: #a855f7; font-size: 32px; margin: 0; font-weight: bold;">Amonify</h1>
      <p style="color: #9ca3af; font-size: 14px; margin-top: 8px;">AI Görsel Üretim Platformu</p>
    </div>

    <!-- Main Card -->
    <div style="background: linear-gradient(135deg, #1e1e3f 0%, #2d1f4e 100%); border-radius: 20px; padding: 40px; border: 1px solid rgba(168, 85, 247, 0.2);">
      <!-- Welcome Message -->
      <h2 style="color: #ffffff; font-size: 24px; margin: 0 0 16px 0; text-align: center;">
        Merhaba ${name}! 👋
      </h2>
      
      <p style="color: #d1d5db; font-size: 16px; line-height: 1.6; text-align: center; margin: 0 0 32px 0;">
        Amonify'a hoş geldiniz! Hesabınızı aktifleştirmek için aşağıdaki doğrulama kodunu kullanın.
      </p>

      <!-- Verification Code -->
      <div style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); border-radius: 16px; padding: 24px; text-align: center; margin-bottom: 32px;">
        <p style="color: rgba(255,255,255,0.8); font-size: 14px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">
          Doğrulama Kodunuz
        </p>
        <p style="color: #ffffff; font-size: 36px; font-weight: bold; letter-spacing: 8px; margin: 0;">
          ${code}
        </p>
      </div>

      <!-- Info -->
      <div style="background: rgba(255, 255, 255, 0.05); border-radius: 12px; padding: 16px; margin-bottom: 24px;">
        <p style="color: #9ca3af; font-size: 14px; margin: 0; text-align: center;">
          ⏰ Bu kod <strong style="color: #a855f7;">15 dakika</strong> içinde geçerliliğini yitirecektir.
        </p>
      </div>

      <!-- Warning -->
      <p style="color: #6b7280; font-size: 13px; text-align: center; margin: 0;">
        Bu e-postayı siz talep etmediyseniz, lütfen dikkate almayın.
      </p>
    </div>

    <!-- Footer -->
    <div style="text-align: center; margin-top: 32px;">
      <p style="color: #6b7280; font-size: 12px; margin: 0;">
        © ${new Date().getFullYear()} Amonify. Tüm hakları saklıdır.
      </p>
    </div>
  </div>
</body>
</html>
    `,
  },
};

/**
 * Create email transporter
 */
function createTransporter() {
  // Check if SMTP credentials are available
  if (!SMTP_CONFIG.auth.user || !SMTP_CONFIG.auth.pass) {
    console.warn("[EmailService] SMTP credentials not configured");
    return null;
  }

  return nodemailer.createTransport({
    host: SMTP_CONFIG.host,
    port: SMTP_CONFIG.port,
    secure: SMTP_CONFIG.secure,
    auth: SMTP_CONFIG.auth,
    // Add connection timeout
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
}

/**
 * Generate a 6-digit verification code
 */
export function generateVerificationCode(): string {
  return crypto.randomInt(100000, 999999).toString();
}

/**
 * Generate a secure random token for email verification
 */
export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Send verification email with code
 */
export async function sendVerificationEmail(
  to: string,
  name: string,
  code: string
): Promise<{ success: boolean; error?: string }> {
  const transporter = createTransporter();

  if (!transporter) {
    console.error("[EmailService] Cannot send email: transporter not available");
    return { success: false, error: "E-posta servisi yapılandırılmamış" };
  }

  try {
    const template = EMAIL_TEMPLATES.verification;

    await transporter.sendMail({
      from: `"Amonify" <${SMTP_CONFIG.auth.user}>`,
      to: to,
      subject: template.subject,
      html: template.getHtml(code, name),
    });

    console.log("[EmailService] Verification email sent to:", to);
    return { success: true };
  } catch (error) {
    console.error("[EmailService] Failed to send verification email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "E-posta gönderilemedi"
    };
  }
}

/**
 * Verify SMTP connection
 */
export async function verifySmtpConnection(): Promise<boolean> {
  const transporter = createTransporter();

  if (!transporter) {
    return false;
  }

  try {
    await transporter.verify();
    console.log("[EmailService] SMTP connection verified");
    return true;
  } catch (error) {
    console.error("[EmailService] SMTP connection failed:", error);
    return false;
  }
}

/**
 * Check if Email/Password authentication is enabled via environment
 * Defaults to false (Google OAuth is primary)
 */
export function isEmailPasswordAuthEnabled(): boolean {
  const enabled = process.env.EMAIL_PASSWORD_AUTH_ENABLED?.toLowerCase();
  return enabled === "true" || enabled === "1";
}

/**
 * Check if Google OAuth is enabled via environment
 * Defaults to true if not explicitly disabled
 */
export function isGoogleAuthEnabled(): boolean {
  const enabled = process.env.GOOGLE_AUTH_ENABLED?.toLowerCase();
  // Default to true if not set or if not explicitly disabled
  return enabled !== "false" && enabled !== "0";
}

/**
 * Check if email verification is enabled via environment
 * Defaults to true for security
 */
export function isEmailVerificationEnabled(): boolean {
  const enabled = process.env.EMAIL_VERIFICATION_ENABLED?.toLowerCase();
  // Default to true if not set (for security)
  if (enabled === undefined || enabled === "") {
    return true;
  }
  return enabled === "true" || enabled === "1";
}
