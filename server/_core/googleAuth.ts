/**
 * Google OAuth2 Service
 * Official Google OAuth2 implementation using googleapis
 */
import { google } from "googleapis";
import { Agent } from "https";

// Google OAuth2 Configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID ?? "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET ?? "";
const GOOGLE_REDIRECT_URI =
  process.env.GOOGLE_REDIRECT_URI ??
  "http://localhost:3000/api/auth/google/callback";

// Create an HTTPS agent that forces IPv4 to avoid timeout issues
const httpsAgent = new Agent({
  family: 4, // Force IPv4
  keepAlive: true,
  timeout: 15000,
});

// Configure global Google API options
google.options({
  // Retry requests up to 3 times on failure
  retry: true,
  retryConfig: {
    retry: 3,
    retryDelay: 1000,
    statusCodesToRetry: [
      [100, 199],
      [408, 408],
      [429, 429],
      [500, 599],
    ],
    onRetryAttempt: (err: any) => {
      console.log(`[GoogleAuth] Retrying request due to: ${err.message}`);
    },
  },
  timeout: 15000, // Increased timeout to 15 seconds
});

// OAuth2 Scopes
const SCOPES = [
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
];

/**
 * Create OAuth2 client
 */
export function createOAuth2Client() {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    console.warn("[GoogleAuth] Google OAuth credentials not configured");
    return null;
  }

  const client = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI
  );

  // Directly assign agent to transporter defaults to ensure it's used
  // This bypasses potential issues where global options aren't picked up
  if (client.transporter && client.transporter.defaults) {
    // @ts-ignore - types might be slightly off for internal properties
    client.transporter.defaults.agent = httpsAgent;
    // @ts-ignore
    client.transporter.defaults.timeout = 15000;
  }

  return client;
}

/**
 * Generate Google OAuth authorization URL
 */
export function getGoogleAuthUrl(): string | null {
  const oauth2Client = createOAuth2Client();
  if (!oauth2Client) {
    return null;
  }

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent", // Always show consent screen to get refresh token
  });

  return authUrl;
}

/**
 * Exchange authorization code for tokens and get user info
 */
export async function getGoogleUserFromCode(code: string): Promise<{
  success: boolean;
  user?: {
    email: string;
    name: string;
    picture?: string;
    googleId: string;
  };
  error?: string;
}> {
  const oauth2Client = createOAuth2Client();
  if (!oauth2Client) {
    return { success: false, error: "Google OAuth not configured" };
  }

  try {
    console.log("[GoogleAuth] Exchanging code for tokens...");

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    console.log("[GoogleAuth] Tokens obtained, fetching user info...");

    // Get user info
    const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: "v2",
    });

    const userInfo = await oauth2.userinfo.get();
    const { email, name, picture, id } = userInfo.data;

    if (!email || !id) {
      return {
        success: false,
        error: "Could not retrieve user email from Google",
      };
    }

    console.log("[GoogleAuth] User info retrieved:", {
      email,
      name,
      googleId: id,
    });

    return {
      success: true,
      user: {
        email,
        name: name ?? email.split("@")[0],
        picture: picture ?? undefined,
        googleId: id,
      },
    };
  } catch (error) {
    console.error("[GoogleAuth] Error getting user from code:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to authenticate with Google",
    };
  }
}

/**
 * Check if Google OAuth is properly configured
 */
export function isGoogleOAuthConfigured(): boolean {
  return !!(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET);
}

/**
 * Check if Google Auth is enabled via environment
 */
export function isGoogleAuthEnabled(): boolean {
  const enabled = process.env.GOOGLE_AUTH_ENABLED?.toLowerCase();
  return enabled === "true" || enabled === "1";
}
