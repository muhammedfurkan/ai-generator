export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  kieAiApiKey: process.env.KIE_AI_API_KEY ?? "",
  clerkSecretKey: process.env.CLERK_SECRET_KEY ?? "",
  clerkPublishableKey: process.env.VITE_CLERK_PUBLISHABLE_KEY ?? "",
  forgeApiKey: process.env.FORGE_API_KEY ?? "",
  forgeApiUrl: process.env.FORGE_API_URL ?? "",
  // SMTP Configuration for email verification
  smtpHost: process.env.SMTP_HOST ?? "",
  smtpPort: parseInt(process.env.SMTP_PORT ?? "465"),
  smtpUser: process.env.SMTP_USER ?? "",
  smtpPass: process.env.SMTP_PASS ?? "",
  // Authentication toggles
  emailPasswordAuthEnabled:
    process.env.EMAIL_PASSWORD_AUTH_ENABLED?.toLowerCase() === "true" ||
    process.env.EMAIL_PASSWORD_AUTH_ENABLED === "1",
  googleAuthEnabled:
    process.env.GOOGLE_AUTH_ENABLED !== "false" &&
    process.env.GOOGLE_AUTH_ENABLED !== "0", // Default: true
  // Audio AI providers
  minimaxApiKey: process.env.MINIMAX_API_KEY ?? "",
  elevenlabsApiKey: process.env.ELEVENLABS_API_KEY ?? "",
};
