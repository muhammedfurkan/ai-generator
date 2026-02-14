import { describe, it, expect, vi, beforeAll } from "vitest";
import { Telegraf } from "telegraf";

describe("Telegram Bot Integration", () => {
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

  beforeAll(() => {
    if (!BOT_TOKEN) {
      console.warn("[Test] TELEGRAM_BOT_TOKEN not configured");
    }
  });

  it("should validate bot token format", () => {
    if (!BOT_TOKEN) {
      console.warn("[Test] Skipping token validation - token not set");
      return;
    }

    // Telegram bot token format: numeric:alphanumeric
    const tokenRegex = /^\d+:[A-Za-z0-9_-]+$/;
    expect(tokenRegex.test(BOT_TOKEN)).toBe(true);
  });

  it("should initialize Telegraf bot with valid token", async () => {
    if (!BOT_TOKEN) {
      console.warn("[Test] Skipping bot initialization - token not set");
      return;
    }

    try {
      const bot = new Telegraf(BOT_TOKEN);
      // Test if bot can get info (this validates the token)
      const botInfo = await bot.telegram.getMe();
      expect(botInfo).toBeDefined();
      expect(botInfo.id).toBeDefined();
      expect(botInfo.username).toBeDefined();
      console.log(`[Test] Bot initialized: @${botInfo.username}`);
    } catch (error) {
      console.error("[Test] Bot initialization failed:", error);
      throw error;
    }
  });

  it("should have valid admin chat ID format if provided", () => {
    const ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID;

    if (!ADMIN_CHAT_ID) {
      console.warn("[Test] TELEGRAM_ADMIN_CHAT_ID not set (optional)");
      return;
    }

    // Chat ID should be numeric (can be negative for groups)
    const chatIdRegex = /^-?\d+$/;
    expect(chatIdRegex.test(ADMIN_CHAT_ID)).toBe(true);
  });

  it("should handle bot token environment variable correctly", () => {
    expect(BOT_TOKEN).toBeDefined();
    expect(BOT_TOKEN?.length).toBeGreaterThan(0);
    expect(BOT_TOKEN).toContain(":");
  });
});
