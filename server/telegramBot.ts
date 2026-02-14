import { Telegraf, Context } from "telegraf";
import {
  addCredits,
  recordCreditTransaction,
  getUserByEmail,
  getAllUsers,
} from "./db";
import { createNotification } from "./routers/notification";
import dotenv from "dotenv";
import dns from "dns";
import https from "https";

// Force IPv4 to avoid IPv6 connectivity issues with Telegram API
dns.setDefaultResultOrder("ipv4first");

dotenv.config();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_CHAT_ID_RAW = process.env.TELEGRAM_ADMIN_CHAT_ID;
// Parse comma-separated admin chat IDs into an array
const ADMIN_CHAT_IDS: string[] = ADMIN_CHAT_ID_RAW
  ? ADMIN_CHAT_ID_RAW.split(",")
      .map(id => id.trim())
      .filter(id => id.length > 0)
  : [];

// Görsel gönderilecek chat ID'leri (kullanıcı oluşturduğu görseller için)
const SEND_CHAT_ID_RAW = process.env.TELEGRAM_SEND_CHAT_ID;
const SEND_CHAT_IDS: string[] = SEND_CHAT_ID_RAW
  ? SEND_CHAT_ID_RAW.split(",")
      .map(id => id.trim())
      .filter(id => id.length > 0)
  : [];

if (!BOT_TOKEN) {
  console.warn("[Telegram Bot] BOT_TOKEN not configured");
}

// Custom HTTPS agent with longer timeout and better connection handling
const httpsAgent = new https.Agent({
  keepAlive: true,
  keepAliveMsecs: 30000,
  timeout: 60000, // 60 second timeout
  maxSockets: 10,
  maxFreeSockets: 5,
  family: 4, // Force IPv4
});

// Create Telegraf bot with custom agent configuration
export const bot = BOT_TOKEN
  ? new Telegraf(BOT_TOKEN, {
      telegram: {
        agent: httpsAgent,
        webhookReply: false,
      },
    })
  : null;

// Track if bot is already initialized/started to prevent duplicate instances
let isBotInitialized = false;
let isBotStarted = false;

function parseCommandArgs(commandText?: string): string[] {
  if (!commandText) {
    return [];
  }

  return commandText.trim().split(/\s+/).slice(1);
}

function normalizeEmailInput(email?: string): string {
  return email?.trim().toLowerCase() || "";
}

/**
 * Initialize Telegram Bot with commands
 */
export async function initializeTelegramBot() {
  if (isBotInitialized) {
    console.log("[Telegram Bot] Already initialized, skipping...");
    return;
  }
  if (!bot) {
    console.warn("[Telegram Bot] Bot not initialized - token missing");
    return;
  }

  // Middleware to check admin access
  const adminOnly = (ctx: Context, next: () => Promise<void>) => {
    const chatId = ctx.chat?.id.toString();
    // Allow if no admins configured or if user is in admin list
    if (
      ADMIN_CHAT_IDS.length > 0 &&
      (!chatId || !ADMIN_CHAT_IDS.includes(chatId))
    ) {
      ctx.reply("❌ Yalnızca admin bu komutu kullanabilir.");
      return;
    }
    return next();
  };

  /**
   * /start - Welcome message
   */
  bot.command("start", ctx => {
    ctx.reply(
      `\ud83d\udc4b Ho\u015fgeldin! nanoinfluencer Kredi Y\u00f6netim Botu\n\n` +
        `Kullan\u0131labilir komutlar:\n` +
        `/addcredit <email> <amount> [reason] - Kredi ekle\n` +
        `/deductcredit <email> <amount> [reason] - Kredi \u00e7\u0131kar\n` +
        `/userinfo <email> - Kullan\u0131c\u0131 bilgisi\n` +
        `/broadcast <mesaj> - T\u00fcm kullan\u0131c\u0131lara bildirim\n` +
        `/notify <email> <mesaj> - Tek kullan\u0131c\u0131ya bildirim\n` +
        `/help - Yard\u0131m\n\n` +
        `\u00d6rnek:\n` +
        `/addcredit ahmet@example.com 100 Paket sat\u0131\u015f\u0131`
    );
  });

  /**
   * /help - Help message
   */
  bot.command("help", ctx => {
    ctx.reply(
      `\ud83d\udcd6 *Komut Rehberi*\n\n` +
        `*Kredi \u0130\u015flemleri:*\n` +
        `/addcredit <email> <amount> [reason]\n` +
        `  Kullan\u0131c\u0131ya kredi ekler\n` +
        `  \u00d6rnek: /addcredit ahmet@example.com 100 Paket sat\u0131\u015f\u0131\n\n` +
        `/deductcredit <email> <amount> [reason]\n` +
        `  Kullan\u0131c\u0131dan kredi \u00e7\u0131kar\n` +
        `  \u00d6rnek: /deductcredit user@mail.com 50 Geri \u00f6deme\n\n` +
        `*Bilgi Sorgulama:*\n` +
        `/userinfo <email>\n` +
        `  Kullan\u0131c\u0131 bilgisini g\u00f6ster\n` +
        `  \u00d6rnek: /userinfo contact@domain.com\n\n` +
        `*\u0130statistikler:*\n` +
        `/stats - G\u00fcnl\u00fck istatistikleri g\u00f6r\n\n` +
        `*Bildirim G\u00f6nderme:*\n` +
        `/broadcast <mesaj>\n` +
        `  T\u00fcm kullan\u0131c\u0131lara bildirim g\u00f6nder\n` +
        `  \u00d6rnek: /broadcast Yeni \u00f6zellikler eklendi!\n\n` +
        `/notify <email> <mesaj>\n` +
        `  Tek kullan\u0131c\u0131ya bildirim g\u00f6nder\n` +
        `  \u00d6rnek: /notify ahmet@example.com Krediniz y\u00fcklendi!\n\n` +
        `*Sistem:*\n` +
        `/start - Ba\u015fla\n` +
        `/help - Bu mesaj`,
      { parse_mode: "Markdown" }
    );
  });

  /**
   * /addcredit - Add credits to user by email (optimized)
   */
  bot.command("addcredit", adminOnly, async ctx => {
    // Hızlı yanıt - işleniyor mesajı
    const processingMsg = await ctx.reply("⏳ İşleniyor...");

    try {
      const args = parseCommandArgs(ctx.message?.text);

      if (args.length < 2) {
        await ctx.telegram.editMessageText(
          ctx.chat!.id,
          processingMsg.message_id,
          undefined,
          "❌ Kullanım: /addcredit <email> <amount> [reason]\nÖrnek: /addcredit ahmet@example.com 100 Paket satışı"
        );
        return;
      }

      const email = normalizeEmailInput(args[0]);
      const amount = parseInt(args[1], 10);
      const reason =
        args.slice(2).join(" ") || "Telegram Bot tarafından eklendi";

      // Hızlı validasyon
      if (!email || !email.includes("@")) {
        await ctx.telegram.editMessageText(
          ctx.chat!.id,
          processingMsg.message_id,
          undefined,
          "❌ Geçerli bir email adresi girin"
        );
        return;
      }

      if (isNaN(amount) || amount <= 0) {
        await ctx.telegram.editMessageText(
          ctx.chat!.id,
          processingMsg.message_id,
          undefined,
          "❌ Amount 0'dan büyük bir sayı olmalı"
        );
        return;
      }

      // Kullanıcıyı bul
      const user = await getUserByEmail(email);
      if (!user) {
        await ctx.telegram.editMessageText(
          ctx.chat!.id,
          processingMsg.message_id,
          undefined,
          `❌ Email ${email} bulunamadı`
        );
        return;
      }

      // Önceki bakiyeyi kaydet (transaction kaydı için)
      const balanceBefore = user.credits;

      // Önce kredi ekle
      const success = await addCredits(user.id, amount);

      if (!success) {
        await ctx.telegram.editMessageText(
          ctx.chat!.id,
          processingMsg.message_id,
          undefined,
          `❌ Kredi eklenirken hata oluştu`
        );
        return;
      }

      // Yeni bakiyeyi hesapla
      const newBalance = balanceBefore + amount;

      // Kredi eklendikten sonra transaction kaydı oluştur (doğru bakiye bilgileriyle)
      await recordCreditTransaction(
        user.id,
        "add",
        amount,
        reason,
        balanceBefore,
        newBalance
      );

      // Kullanıcıya web bildirimi gönder
      await createNotification({
        userId: user.id,
        type: "credit_added",
        title: "💰 Kredi Yüklendi",
        message: `Hesabınıza ${amount} kredi eklendi. Yeni bakiyeniz: ${newBalance} kredi. Sebep: ${reason}`,
      });

      await ctx.telegram.editMessageText(
        ctx.chat!.id,
        processingMsg.message_id,
        undefined,
        `✅ *Kredi Eklendi*\n\n` +
          `👤 Kullanıcı: ${user.name || "Bilinmiyor"} (${email})\n` +
          `➕ Eklenen Kredi: ${amount}\n` +
          `💰 Yeni Bakiye: ${newBalance}\n` +
          `📝 Sebep: ${reason}`,
        { parse_mode: "Markdown" }
      );
    } catch (error) {
      console.error("[Telegram Bot] Error in addcredit:", error);
      try {
        await ctx.telegram.editMessageText(
          ctx.chat!.id,
          processingMsg.message_id,
          undefined,
          "❌ Hata oluştu: " + String(error)
        );
      } catch {
        ctx.reply("❌ Hata oluştu: " + String(error));
      }
    }
  });

  /**
   * /deductcredit - Deduct credits from user by email
   */
  bot.command("deductcredit", adminOnly, async ctx => {
    try {
      const args = parseCommandArgs(ctx.message?.text);

      if (args.length < 2) {
        ctx.reply(
          "❌ Kullanım: /deductcredit <email> <amount> [reason]\n" +
            "Örnek: /deductcredit user@mail.com 50 Geri ödeme"
        );
        return;
      }

      const email = normalizeEmailInput(args[0]);
      const amount = parseInt(args[1], 10);
      const reason =
        args.slice(2).join(" ") || "Telegram Bot tarafından çıkarıldı";

      if (!email || !email.includes("@")) {
        ctx.reply("❌ Geçerli bir email adresi girin");
        return;
      }

      if (isNaN(amount)) {
        ctx.reply("❌ Amount sayı olmalı");
        return;
      }

      if (amount <= 0) {
        ctx.reply("❌ Amount 0'dan büyük olmalı");
        return;
      }

      // Get user info by email
      const user = await getUserByEmail(email);
      if (!user) {
        ctx.reply(`❌ Email ${email} bulunamadı`);
        return;
      }

      if (user.credits < amount) {
        ctx.reply(
          `❌ Yetersiz kredi\n` +
            `Mevcut: ${user.credits}\n` +
            `İstenen: ${amount}`
        );
        return;
      }

      // Deduct credits using the addCredits function with negative amount
      const success = await addCredits(user.id, -amount);
      if (!success) {
        ctx.reply(`❌ Kredi çıkarılırken hata oluştu`);
        return;
      }

      // Record transaction
      await recordCreditTransaction(user.id, "deduct", amount, reason);

      const newBalance = user.credits - amount;

      // Kullanıcıya web bildirimi gönder
      await createNotification({
        userId: user.id,
        type: "system",
        title: "💳 Kredi Düşüldü",
        message: `Hesabınızdan ${amount} kredi düşüldü. Yeni bakiyeniz: ${newBalance} kredi. Sebep: ${reason}`,
      });

      ctx.reply(
        `✅ *Kredi Çıkarıldı*\n\n` +
          `👤 Kullanıcı: ${user.name || "Bilinmiyor"} (${email})\n` +
          `➖ Çıkarılan Kredi: ${amount}\n` +
          `💰 Yeni Bakiye: ${newBalance}\n` +
          `📝 Sebep: ${reason}`,
        { parse_mode: "Markdown" }
      );
    } catch (error) {
      console.error("[Telegram Bot] Error in deductcredit:", error);
      ctx.reply("❌ Hata oluştu: " + String(error));
    }
  });

  /**
   * /stats - Get daily statistics
   */
  bot.command("stats", adminOnly, async (ctx: any) => {
    try {
      // Bu fonksiyon daha sonra veritabanından gerçek istatistikleri çekecek
      ctx.reply(
        `📊 *Günlük İstatistikler*\n\n` +
          `📅 Tarih: ${new Date().toLocaleDateString("tr-TR")}\n\n` +
          `ℹ️ Detaylı istatistikler için admin panelini ziyaret edin.`,
        { parse_mode: "Markdown" }
      );
    } catch (error) {
      console.error("[Telegram Bot] Error in stats:", error);
      ctx.reply("❌ Hata oluştu: " + String(error));
    }
  });

  /**
   * /userinfo - Get user information by email
   */
  bot.command("userinfo", adminOnly, async (ctx: any) => {
    try {
      const args = parseCommandArgs(ctx.message?.text);

      if (args.length < 1) {
        ctx.reply(
          "❌ Kullanım: /userinfo <email>\nÖrnek: /userinfo ahmet@example.com"
        );
        return;
      }

      const email = normalizeEmailInput(args[0]);

      if (!email || !email.includes("@")) {
        ctx.reply("❌ Geçerli bir email adresi girin");
        return;
      }

      const user = await getUserByEmail(email);
      if (!user) {
        ctx.reply(`❌ Email ${email} bulunamadı`);
        return;
      }

      const createdDate = new Date(user.createdAt).toLocaleDateString("tr-TR");
      const lastSignedDate = new Date(user.lastSignedIn).toLocaleDateString(
        "tr-TR"
      );

      ctx.reply(
        `👤 *Kullanıcı Bilgisi*\n\n` +
          `📧 Email: ${user.email}\n` +
          `Ad: ${user.name || "Bilinmiyor"}\n` +
          `💰 Kredi: ${user.credits}\n` +
          `👑 Rol: ${user.role === "admin" ? "Admin" : "Kullanıcı"}\n` +
          `📱 Giriş Yöntemi: ${user.loginMethod}\n` +
          `📅 Kayıt Tarihi: ${createdDate}\n` +
          `🕐 Son Giriş: ${lastSignedDate}`,
        { parse_mode: "Markdown" }
      );
    } catch (error) {
      console.error("[Telegram Bot] Error in userinfo:", error);
      ctx.reply("❌ Hata oluştu: " + String(error));
    }
  });

  /**
   * /broadcast - Send notification to all users
   */
  bot.command("broadcast", adminOnly, async (ctx: any) => {
    try {
      const args = parseCommandArgs(ctx.message?.text);
      const message = args.join(" ");

      if (!message || message.length < 5) {
        ctx.reply(
          "\u274c Kullan\u0131m: /broadcast <mesaj>\n\u00d6rnek: /broadcast Yeni \u00f6zellikler eklendi!"
        );
        return;
      }

      ctx.reply(
        "\u23f3 T\u00fcm kullan\u0131c\u0131lara bildirim g\u00f6nderiliyor..."
      );

      // Get all users
      const allUsers = await getAllUsers(10000, 0);
      let successCount = 0;
      let failCount = 0;

      for (const user of allUsers) {
        try {
          await createNotification({
            userId: user.id,
            type: "system",
            title: "\ud83d\udce2 Duyuru",
            message: message,
          });
          successCount++;
        } catch (error) {
          failCount++;
        }
      }

      ctx.reply(
        `\u2705 *Toplu Bildirim G\u00f6nderildi*\n\n` +
          `\ud83d\udce8 Ba\u015far\u0131l\u0131: ${successCount} kullan\u0131c\u0131\n` +
          `\u274c Ba\u015far\u0131s\u0131z: ${failCount} kullan\u0131c\u0131\n` +
          `\ud83d\udcdd Mesaj: ${message}`,
        { parse_mode: "Markdown" }
      );
    } catch (error) {
      console.error("[Telegram Bot] Error in broadcast:", error);
      ctx.reply("\u274c Hata olu\u015ftu: " + String(error));
    }
  });

  /**
   * /notify - Send notification to a specific user
   */
  bot.command("notify", adminOnly, async (ctx: any) => {
    try {
      const args = parseCommandArgs(ctx.message?.text);

      if (args.length < 2) {
        ctx.reply(
          "\u274c Kullan\u0131m: /notify <email> <mesaj>\n\u00d6rnek: /notify ahmet@example.com Krediniz y\u00fcklendi!"
        );
        return;
      }

      const email = normalizeEmailInput(args[0]);
      const message = args.slice(1).join(" ");

      if (!email || !email.includes("@")) {
        ctx.reply("\u274c Ge\u00e7erli bir email adresi girin");
        return;
      }

      if (message.length < 3) {
        ctx.reply("\u274c Mesaj en az 3 karakter olmal\u0131d\u0131r");
        return;
      }

      const user = await getUserByEmail(email);
      if (!user) {
        ctx.reply(`\u274c Email ${email} bulunamad\u0131`);
        return;
      }

      await createNotification({
        userId: user.id,
        type: "system",
        title: "\ud83d\udce9 Mesaj",
        message: message,
      });

      ctx.reply(
        `\u2705 *Bildirim G\u00f6nderildi*\n\n` +
          `\ud83d\udc64 Kullan\u0131c\u0131: ${user.name || user.email}\n` +
          `\ud83d\udcdd Mesaj: ${message}`,
        { parse_mode: "Markdown" }
      );
    } catch (error) {
      console.error("[Telegram Bot] Error in notify:", error);
      ctx.reply("\u274c Hata olu\u015ftu: " + String(error));
    }
  });

  /**
   * Handle all other messages
   */
  bot.on("message", (ctx: any) => {
    // Ignore if it's a command (already handled above)
    const text = "text" in ctx.message ? ctx.message.text : null;
    if (text?.startsWith("/")) {
      return;
    }

    ctx.reply("ℹ️ Bilinmeyen komut. Yardım için /help yazın.");
  });

  // Error handling - prevent crashes from blocked users and other errors
  bot.catch((err: any, ctx: any) => {
    const errorCode = err?.response?.error_code;
    const errorDescription =
      err?.response?.description || err?.message || String(err);

    // Handle common Telegram errors gracefully
    if (errorCode === 403 && errorDescription.includes("blocked by the user")) {
      console.warn(
        `[Telegram Bot] User ${ctx?.chat?.id || "unknown"} has blocked the bot`
      );
      return; // Don't try to reply to blocked users
    }

    if (errorCode === 400 && errorDescription.includes("chat not found")) {
      console.warn(
        `[Telegram Bot] Chat not found: ${ctx?.chat?.id || "unknown"}`
      );
      return;
    }

    console.error("[Telegram Bot] Unhandled error:", {
      error_code: errorCode,
      description: errorDescription,
      chat_id: ctx?.chat?.id,
    });

    // Try to reply, but catch any error (user might have blocked the bot)
    try {
      ctx.reply("❌ Beklenmeyen hata oluştu").catch(() => {
        console.warn("[Telegram Bot] Could not send error message to user");
      });
    } catch {
      // Ignore - user might have blocked the bot
    }
  });

  isBotInitialized = true;
  console.log("[Telegram Bot] Bot initialized successfully");
}

/**
 * Start polling the bot
 */

/**
 * Sleep utility for retry backoff
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Escape Markdown special characters to prevent Parse Mode errors
 */
function escapeMarkdown(text: string): string {
  if (!text) return "";
  // Escape special characters for Markdown V1: _ * [ `
  return text.replace(/([_*\[`])/g, "\\$1");
}

/**
 * Send Telegram message using native HTTPS module (bypasses node-fetch issues)
 */
function sendTelegramMessageNative(
  chatId: string,
  message: string
): Promise<boolean> {
  return new Promise(resolve => {
    const postData = JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: "Markdown",
    });

    const options = {
      hostname: "api.telegram.org",
      port: 443,
      path: `/bot${BOT_TOKEN}/sendMessage`,
      method: "POST",
      timeout: 30000,
      family: 4, // Force IPv4
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(postData),
      },
    };

    const req = https.request(options, res => {
      let data = "";
      res.on("data", chunk => {
        data += chunk;
      });
      res.on("end", () => {
        try {
          const response = JSON.parse(data);

          // Check Telegram API response - must have ok: true
          if (res.statusCode === 200 && response.ok === true) {
            console.log(
              "[Telegram Bot] Message delivered, message_id:",
              response.result?.message_id
            );
            resolve(true);
          } else {
            console.error("[Telegram Bot] API returned error:", {
              statusCode: res.statusCode,
              ok: response.ok,
              error_code: response.error_code,
              description: response.description,
            });
            resolve(false);
          }
        } catch (parseError) {
          console.error("[Telegram Bot] Failed to parse response:", data);
          resolve(false);
        }
      });
    });

    req.on("error", (e: any) => {
      console.error("[Telegram Bot] Request error:", e.code || e.message);
      resolve(false);
    });

    req.on("timeout", () => {
      console.error("[Telegram Bot] Request timed out");
      req.destroy();
      resolve(false);
    });

    req.write(postData);
    req.end();
  });
}

/**
 * Send Telegram photo using native HTTPS module
 */
function sendTelegramPhotoNative(
  chatId: string,
  photoUrl: string,
  caption: string
): Promise<boolean> {
  return new Promise(resolve => {
    const postData = JSON.stringify({
      chat_id: chatId,
      photo: photoUrl,
      caption: caption,
      parse_mode: "Markdown",
    });

    const options = {
      hostname: "api.telegram.org",
      port: 443,
      path: `/bot${BOT_TOKEN}/sendPhoto`,
      method: "POST",
      timeout: 30000,
      family: 4, // Force IPv4
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(postData),
      },
    };

    const req = https.request(options, res => {
      let data = "";
      res.on("data", chunk => {
        data += chunk;
      });
      res.on("end", () => {
        try {
          const response = JSON.parse(data);

          // Check Telegram API response - must have ok: true
          if (res.statusCode === 200 && response.ok === true) {
            console.log(
              "[Telegram Bot] Photo delivered, message_id:",
              response.result?.message_id
            );
            resolve(true);
          } else {
            console.error("[Telegram Bot] Photo API returned error:", {
              statusCode: res.statusCode,
              ok: response.ok,
              error_code: response.error_code,
              description: response.description,
            });
            resolve(false);
          }
        } catch (parseError) {
          console.error("[Telegram Bot] Failed to parse photo response:", data);
          resolve(false);
        }
      });
    });

    req.on("error", (e: any) => {
      console.error("[Telegram Bot] Photo request error:", e.code || e.message);
      resolve(false);
    });

    req.on("timeout", () => {
      console.error("[Telegram Bot] Photo request timed out");
      req.destroy();
      resolve(false);
    });

    req.write(postData);
    req.end();
  });
}

/**
 * Send notification to admin with retry mechanism using native HTTPS
 */
export async function sendAdminNotification(
  message: string,
  maxRetries: number = 3
) {
  if (!BOT_TOKEN || ADMIN_CHAT_IDS.length === 0) {
    console.warn(
      "[Telegram Bot] Cannot send notification - bot token or admin chat ID not configured"
    );
    return false;
  }

  // Send notification to all admin chat IDs
  const results: boolean[] = [];

  for (const chatId of ADMIN_CHAT_IDS) {
    let success = false;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(
          `[Telegram Bot] Sending notification to ${chatId} (attempt ${attempt}/${maxRetries})...`
        );
        success = await sendTelegramMessageNative(chatId, message);

        if (success) {
          console.log(
            `[Telegram Bot] Admin notification sent successfully to ${chatId}`
          );
          break;
        }

        // If not successful, retry with backoff
        if (attempt < maxRetries) {
          const backoffTime = Math.pow(2, attempt) * 1000;
          console.log(`[Telegram Bot] Retrying in ${backoffTime / 1000}s...`);
          await sleep(backoffTime);
        }
      } catch (error: any) {
        console.warn(
          `[Telegram Bot] Attempt ${attempt}/${maxRetries} failed for ${chatId}:`,
          error.message
        );

        if (attempt < maxRetries) {
          const backoffTime = Math.pow(2, attempt) * 1000;
          console.log(`[Telegram Bot] Retrying in ${backoffTime / 1000}s...`);
          await sleep(backoffTime);
        }
      }
    }

    results.push(success);

    if (!success) {
      console.error(
        `[Telegram Bot] Failed to send admin notification to ${chatId} after all retries`
      );
    }
  }

  // Return true if at least one notification was sent successfully
  const anySuccess = results.some(r => r);
  if (anySuccess) {
    console.log(
      `[Telegram Bot] Admin notifications sent: ${results.filter(r => r).length}/${ADMIN_CHAT_IDS.length} successful`
    );
  } else {
    console.error(
      "[Telegram Bot] Failed to send admin notification to all admins"
    );
  }

  return anySuccess;
}

/**
 * Notify admin about new user registration
 */
export async function notifyNewUserRegistration(user: {
  name: string | null;
  email: string | null;
  loginMethod: string | null;
}) {
  const message =
    `🆕 *Yeni Kullanıcı Kaydı*\n\n` +
    `👤 Ad: ${escapeMarkdown(user.name || "Bilinmiyor")}\n` +
    `📧 Email: ${escapeMarkdown(user.email || "Bilinmiyor")}\n` +
    `📱 Giriş Yöntemi: ${escapeMarkdown(user.loginMethod || "Bilinmiyor")}\n` +
    `📅 Tarih: ${escapeMarkdown(new Date().toLocaleString("tr-TR"))}`;

  return await sendAdminNotification(message);
}

/**
 * Notify admin about credit spending
 */
export async function notifyCreditSpending(data: {
  userName: string | null;
  userEmail: string | null;
  creditsSpent: number;
  creditsRemaining: number;
  action: string;
}) {
  const message =
    `💸 *Kredi Harcaması*\n\n` +
    `👤 Kullanıcı: ${escapeMarkdown(data.userName || "Bilinmiyor")}\n` +
    `📧 Email: ${escapeMarkdown(data.userEmail || "Bilinmiyor")}\n` +
    `➖ Harcanan: ${data.creditsSpent} kredi\n` +
    `💰 Kalan: ${data.creditsRemaining} kredi\n` +
    `🎯 İşlem: ${escapeMarkdown(data.action)}\n` +
    `📅 Tarih: ${escapeMarkdown(new Date().toLocaleString("tr-TR"))}`;

  return await sendAdminNotification(message);
}

/**
 * Notify admin about credit refund
 */
export async function notifyCreditRefund(data: {
  userName: string | null;
  userEmail: string | null;
  creditsRefunded: number;
  creditsNew: number;
  reason: string;
}) {
  const message =
    `🔄 *Kredi İadesi*\n\n` +
    `👤 Kullanıcı: ${escapeMarkdown(data.userName || "Bilinmiyor")}\n` +
    `📧 Email: ${escapeMarkdown(data.userEmail || "Bilinmiyor")}\n` +
    `➕ İade Edilen: ${data.creditsRefunded} kredi\n` +
    `💰 Yeni Bakiye: ${data.creditsNew} kredi\n` +
    `📝 Sebep: ${escapeMarkdown(data.reason)}\n` +
    `📅 Tarih: ${escapeMarkdown(new Date().toLocaleString("tr-TR"))}`;

  return await sendAdminNotification(message);
}

/**
 * Notify admin about package purchase
 */
export async function notifyPackagePurchase(data: {
  userName: string | null;
  userEmail: string | null;
  packageName: string;
  creditsAdded: number;
  price: number;
  paymentMethod: string;
}) {
  const message =
    `💳 *Paket Satın Alımı*\n\n` +
    `👤 Kullanıcı: ${escapeMarkdown(data.userName || "Bilinmiyor")}\n` +
    `📧 Email: ${escapeMarkdown(data.userEmail || "Bilinmiyor")}\n` +
    `📦 Paket: ${escapeMarkdown(data.packageName)}\n` +
    `➕ Eklenen Kredi: ${data.creditsAdded}\n` +
    `💵 Fiyat: ${data.price} TL\n` +
    `💳 Ödeme: ${escapeMarkdown(data.paymentMethod)}\n` +
    `📅 Tarih: ${escapeMarkdown(new Date().toLocaleString("tr-TR"))}`;

  return await sendAdminNotification(message);
}

/**
 * Notify admin about low credits warning
 */
export async function notifyLowCredits(data: {
  userName: string | null;
  userEmail: string | null;
  creditsRemaining: number;
}) {
  const message =
    `⚠️ *Düşük Kredi Uyarısı*\n\n` +
    `👤 Kullanıcı: ${data.userName || "Bilinmiyor"}\n` +
    `📧 Email: ${data.userEmail || "Bilinmiyor"}\n` +
    `💰 Kalan Kredi: ${data.creditsRemaining}\n` +
    `📅 Tarih: ${new Date().toLocaleString("tr-TR")}`;

  return await sendAdminNotification(message);
}

/**
 * Notify admin about video generation completion
 */
export async function notifyVideoComplete(data: {
  userName: string | null;
  userEmail: string | null;
  model: string;
  duration: number;
  status: "completed" | "failed";
}) {
  const emoji = data.status === "completed" ? "🎬" : "❌";
  const statusText = data.status === "completed" ? "Tamamlandı" : "Başarısız";

  const message =
    `${emoji} *Video ${statusText}*\n\n` +
    `👤 Kullanıcı: ${escapeMarkdown(data.userName || "Bilinmiyor")}\n` +
    `📧 Email: ${escapeMarkdown(data.userEmail || "Bilinmiyor")}\n` +
    `🎬 Model: ${escapeMarkdown(data.model)}\n` +
    `⏱ Süre: ${data.duration}s\n` +
    `📅 Tarih: ${escapeMarkdown(new Date().toLocaleString("tr-TR"))}`;

  return await sendAdminNotification(message);
}

/**
 * Notify admin about system errors
 */
export async function notifyError(data: {
  errorType: string;
  errorMessage: string;
  context?: string;
  userId?: number;
  userEmail?: string;
}) {
  const message =
    `🚨 *Sistem Hatası*\n\n` +
    `⚠️ Tür: ${escapeMarkdown(data.errorType)}\n` +
    `📝 Hata: ${escapeMarkdown(data.errorMessage)}\n` +
    (data.context ? `📍 Konum: ${escapeMarkdown(data.context)}\n` : "") +
    (data.userId ? `👤 User ID: ${data.userId}\n` : "") +
    (data.userEmail ? `📧 Email: ${escapeMarkdown(data.userEmail)}\n` : "") +
    `📅 Tarih: ${escapeMarkdown(new Date().toLocaleString("tr-TR"))}`;

  return await sendAdminNotification(message);
}

/**
 * Notify admin about API errors
 */
export async function notifyApiError(data: {
  apiName: string;
  endpoint?: string;
  statusCode?: number;
  errorMessage: string;
  userId?: number;
  userEmail?: string;
}) {
  const message =
    `🔴 *API Hatası*\n\n` +
    `🌐 API: ${escapeMarkdown(data.apiName)}\n` +
    (data.endpoint ? `🔗 Endpoint: ${escapeMarkdown(data.endpoint)}\n` : "") +
    (data.statusCode ? `📊 Status: ${data.statusCode}\n` : "") +
    `📝 Hata: ${escapeMarkdown(data.errorMessage)}\n` +
    (data.userId ? `👤 User ID: ${data.userId}\n` : "") +
    (data.userEmail ? `📧 Email: ${escapeMarkdown(data.userEmail)}\n` : "") +
    `📅 Tarih: ${escapeMarkdown(new Date().toLocaleString("tr-TR"))}`;

  return await sendAdminNotification(message);
}

/**
 * Notify admin about generation failures
 */
export async function notifyGenerationFailure(data: {
  generationType: "image" | "video" | "upscale" | "ai-character" | "logo";
  errorMessage: string;
  userId?: number;
  userEmail?: string;
  prompt?: string;
  creditsRefunded?: number;
}) {
  const typeNames: Record<string, string> = {
    image: "Görsel",
    video: "Video",
    upscale: "Upscale",
    "ai-character": "AI Karakter",
    logo: "Logo",
  };

  const message =
    `❌ *${typeNames[data.generationType]} Üretim Hatası*\n\n` +
    `📝 Hata: ${escapeMarkdown(data.errorMessage)}\n` +
    (data.userId ? `👤 User ID: ${data.userId}\n` : "") +
    (data.userEmail ? `📧 Email: ${escapeMarkdown(data.userEmail)}\n` : "") +
    (data.prompt
      ? `💬 Prompt: ${escapeMarkdown(data.prompt.substring(0, 100))}...\n`
      : "") +
    (data.creditsRefunded
      ? `🔄 İade Edilen: ${data.creditsRefunded} kredi\n`
      : "") +
    `📅 Tarih: ${escapeMarkdown(new Date().toLocaleString("tr-TR"))}`;

  return await sendAdminNotification(message);
}

export async function startTelegramBot(maxRetries: number = 3) {
  if (!bot) {
    console.warn("[Telegram Bot] Cannot start - bot not initialized");
    return;
  }

  if (isBotStarted) {
    console.log("[Telegram Bot] Already started, skipping...");
    return;
  }

  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(
        `[Telegram Bot] Starting bot (attempt ${attempt}/${maxRetries})...`
      );

      // Launch bot with dropPendingUpdates to skip old messages (prevents errors from blocked users)
      await bot.launch({
        dropPendingUpdates: true,
      });

      isBotStarted = true;
      console.log("[Telegram Bot] Bot started successfully");

      // Enable graceful stop
      process.once("SIGINT", () => bot.stop("SIGINT"));
      process.once("SIGTERM", () => bot.stop("SIGTERM"));
      return; // Success, exit function
    } catch (error: any) {
      lastError = error;
      const errorCode = error?.code || error?.errno || "";
      const isRetryable =
        [
          "ETIMEDOUT",
          "ECONNRESET",
          "ECONNREFUSED",
          "ENOTFOUND",
          "EAI_AGAIN",
        ].includes(errorCode) ||
        error?.message?.includes("timeout") ||
        error?.message?.includes("network");

      console.warn(
        `[Telegram Bot] Start attempt ${attempt}/${maxRetries} failed:`,
        errorCode || error.message
      );

      if (isRetryable && attempt < maxRetries) {
        // Exponential backoff: 3s, 6s, 12s
        const backoffTime = Math.pow(2, attempt) * 1500;
        console.log(`[Telegram Bot] Retrying in ${backoffTime / 1000}s...`);
        await sleep(backoffTime);
      } else if (!isRetryable) {
        // Non-retryable error, don't retry
        console.error("[Telegram Bot] Non-retryable error, giving up:", error);
        break;
      }
    }
  }

  console.error("[Telegram Bot] Failed to start after all retries:", lastError);
  console.log(
    "[Telegram Bot] Bot will run without polling. Admin notifications may still work."
  );
}

/**
 * Send generated image to Telegram channels
 * This sends user-created images to specified chat IDs (TELEGRAM_SEND_CHAT_ID)
 */
export async function sendGeneratedImageToTelegram(
  data: {
    imageUrl: string;
    userName: string | null;
    userEmail: string | null;
    prompt: string;
    resolution: string;
    aspectRatio: string;
    aiModel: string;
  },
  maxRetries: number = 3
): Promise<boolean> {
  if (!BOT_TOKEN || SEND_CHAT_IDS.length === 0) {
    console.log(
      "[Telegram Bot] Cannot send generated image - bot token or TELEGRAM_SEND_CHAT_ID not configured"
    );
    return false;
  }

  const caption =
    `🎨 *Yeni Görsel Oluşturuldu*\n\n` +
    `👤 Kullanıcı: ${escapeMarkdown(data.userName || "Bilinmiyor")}\n` +
    `📧 Email: ${escapeMarkdown(data.userEmail || "Bilinmiyor")}\n` +
    `🤖 Model: ${escapeMarkdown(data.aiModel)}\n` +
    `📐 Çözünürlük: ${escapeMarkdown(data.resolution)}\n` +
    `📏 En Boy Oranı: ${escapeMarkdown(data.aspectRatio)}\n` +
    `💬 Prompt: ${escapeMarkdown(data.prompt.length > 200 ? data.prompt.substring(0, 200) + "..." : data.prompt)}\n` +
    `📅 Tarih: ${new Date().toLocaleString("tr-TR")}`;

  // Send to all configured chat IDs
  const results: boolean[] = [];

  for (const chatId of SEND_CHAT_IDS) {
    let success = false;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(
          `[Telegram Bot] Sending generated image to ${chatId} (attempt ${attempt}/${maxRetries})...`
        );
        success = await sendTelegramPhotoNative(chatId, data.imageUrl, caption);

        if (success) {
          console.log(
            `[Telegram Bot] Generated image sent successfully to ${chatId}`
          );
          break;
        }

        // If not successful, retry with backoff
        if (attempt < maxRetries) {
          const backoffTime = Math.pow(2, attempt) * 1000;
          console.log(`[Telegram Bot] Retrying in ${backoffTime / 1000}s...`);
          await sleep(backoffTime);
        }
      } catch (error: any) {
        console.warn(
          `[Telegram Bot] Attempt ${attempt}/${maxRetries} failed for ${chatId}:`,
          error.message
        );

        if (attempt < maxRetries) {
          const backoffTime = Math.pow(2, attempt) * 1000;
          console.log(`[Telegram Bot] Retrying in ${backoffTime / 1000}s...`);
          await sleep(backoffTime);
        }
      }
    }

    results.push(success);

    if (!success) {
      console.error(
        `[Telegram Bot] Failed to send generated image to ${chatId} after all retries`
      );
    }
  }

  // Return true if at least one send was successful
  const anySuccess = results.some(r => r);
  if (anySuccess) {
    console.log(
      `[Telegram Bot] Generated images sent: ${results.filter(r => r).length}/${SEND_CHAT_IDS.length} successful`
    );
  } else {
    console.error(
      "[Telegram Bot] Failed to send generated image to all channels"
    );
  }

  return anySuccess;
}
