import "dotenv/config";
import dns from "dns";
import express, { Request, Response } from "express";
import { createServer } from "http";
import net from "net";

// Force Node.js to prefer IPv4 over IPv6 for DNS resolution
// This fixes timeout issues with some external APIs
dns.setDefaultResultOrder("ipv4first");
import path from "path";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerNewAuthRoutes } from "./newAuth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { storagePut } from "../storage";
import { nanoid } from "nanoid";
import { initializeTelegramBot, startTelegramBot } from "../telegramBot";
import { startVideoStatusUpdater } from "../videoStatusUpdater";
// @ts-ignore - busboy doesn't have TypeScript definitions
import busboy from "busboy";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  // ⚠️ IMPORTANT: Stripe webhook MUST be registered BEFORE express.json()
  // Stripe needs raw body to verify webhook signatures
  const stripeWebhookRouter = (await import("../routes/stripeWebhook")).default;
  app.use(stripeWebhookRouter);

  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "250mb" }));
  app.use(express.urlencoded({ limit: "250mb", extended: true }));

  // Static file serving for local uploads
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // New auth routes (email/password + Clerk)
  registerNewAuthRoutes(app);

  // OAuth callback under /api/oauth/callback (legacy Manus OAuth - keep for backward compatibility)
  registerOAuthRoutes(app);

  // File upload endpoint for reference images
  app.post("/api/upload", async (req: Request, res: Response) => {
    try {
      // Get auth context (without info parameter)
      const context = await createContext({ req, res } as any);
      if (!context.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const userId = context.user.id;

      // Parse multipart form data
      const bb = busboy({ headers: req.headers });
      let fileBuffer: Buffer | null = null;
      let fileName = "";
      let mimeType = "";
      let hasError = false; // Flag to prevent double response

      bb.on("file", (fieldname: string, file: NodeJS.ReadableStream, info: any) => {
        fileName = info.filename;
        mimeType = info.mimeType;
        const chunks: Buffer[] = [];

        file.on("data", (data: Buffer) => {
          chunks.push(data);
        });

        file.on("end", () => {
          fileBuffer = Buffer.concat(chunks);
        });
      });

      bb.on("close", async () => {
        // Don't process if there was an error
        if (hasError) {
          return;
        }

        if (!fileBuffer) {
          if (!res.headersSent) {
            return res.status(400).json({ error: "No file provided" });
          }
          return;
        }

        try {
          // Sanitize filename - remove Turkish characters and special chars
          const sanitizedFileName = fileName
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
            .replace(/ğ/g, 'g')
            .replace(/Ğ/g, 'G')
            .replace(/ı/g, 'i')
            .replace(/İ/g, 'I')
            .replace(/ö/g, 'o')
            .replace(/Ö/g, 'O')
            .replace(/ü/g, 'u')
            .replace(/Ü/g, 'U')
            .replace(/ş/g, 's')
            .replace(/Ş/g, 'S')
            .replace(/ç/g, 'c')
            .replace(/Ç/g, 'C')
            .replace(/[^a-zA-Z0-9.-]/g, '_'); // Replace other special chars with underscore

          // Upload to storage (supports Cloudinary, S3, R2 based on STORAGE_PROVIDER env)
          const storageProvider = process.env.STORAGE_PROVIDER || 'cloudinary';
          const storageKey = `${userId}/references/${nanoid()}-${sanitizedFileName}`;
          const { url } = await storagePut(storageKey, fileBuffer, mimeType);

          console.log(`[Upload] File uploaded successfully via ${storageProvider}:`, url);
          if (!res.headersSent) {
            return res.json({ url });
          }
        } catch (error) {
          console.error("[Upload] Error uploading file:", error);
          if (!res.headersSent) {
            return res.status(500).json({ error: "Upload failed" });
          }
        }
      });

      // Handle busboy errors (e.g., incomplete uploads, cancelled requests)
      bb.on("error", (err: Error) => {
        hasError = true;
        // Only log a short warning, not full stack trace (these are usually client-side cancellations)
        console.warn(`[Upload] Incomplete upload from user ${userId}: ${err.message}`);
        if (!res.headersSent) {
          return res.status(400).json({ error: "File upload failed - incomplete or cancelled" });
        }
      });

      req.pipe(bb);
    } catch (error) {
      console.error("[Upload] Error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Shopier OSB (Otomatik Sipariş Bildirimi) Callback
  const shopierCallbackRouter = (await import("../routes/shopierCallback")).default;
  app.use(shopierCallbackRouter);


  // Shopier Callback & Return URL
  // Handle POST (Bildirim/Notification from Shopier)
  app.post("/payment/callback", async (req: Request, res: Response) => {
    try {
      const apiKey = process.env.SHOPIER_API_KEY;
      const apiSecret = process.env.SHOPIER_API_SECRET || "null";

      if (!apiKey) {
        console.error("Shopier API key missing in callback");
        return res.status(500).send("Configuration error");
      }

      // @ts-ignore
      const { default: Shopier } = await import("@efesoroglu/shopier-api");
      const shopier = new Shopier(apiKey, apiSecret, "TRY");

      // Shopier callback validation
      let result;
      try {
        result = shopier.callback(req.body);
      } catch (err: any) {
        console.error("Shopier signature validation failed:", err.message);
        return res.status(400).send(err.message);
      }

      if (result && result.success) {
        const merchantOrderId = result.order_id;
        const shopierOrderId = result.payment_id;

        console.log(`[Shopier] Payment successful for order ${merchantOrderId}`);

        const { getDb } = await import("../db");
        const { users, creditTransactions, shopierOrders } = await import("../../drizzle/schema");
        const { eq } = await import("drizzle-orm");

        const db = await getDb();
        const [order] = await db.select().from(shopierOrders).where(eq(shopierOrders.merchantOrderId, merchantOrderId)).limit(1);

        if (order) {
          if (order.status !== 'success') {
            await db.update(shopierOrders).set({
              status: 'success',
              shopierOrderId: shopierOrderId ? shopierOrderId.toString() : null,
              updatedAt: new Date()
            }).where(eq(shopierOrders.id, order.id));

            const [user] = await db.select().from(users).where(eq(users.id, order.userId)).limit(1);
            if (user) {
              const newBalance = user.credits + order.creditsAmount;
              await db.update(users).set({ credits: newBalance }).where(eq(users.id, user.id));

              await db.insert(creditTransactions).values({
                userId: user.id,
                type: 'purchase',
                amount: order.creditsAmount,
                reason: `Kredi paketi satın alma (#${order.id})`,
                balanceBefore: user.credits,
                balanceAfter: newBalance,
                createdAt: new Date()
              });

              console.log(`[Shopier] Credits added to user ${user.id}: +${order.creditsAmount}`);
            }
          }
        }
      }
      res.status(200).send("OK");
    } catch (error) {
      console.error("[Shopier] Callback error:", error);
      res.status(500).send("Internal Server Error");
    }
  });

  // Handle GET (Redirection back from Shopier to user's browser)
  app.get("/payment/callback", (req: Request, res: Response) => {
    // Redirect user to a success page or home on the frontend
    res.redirect("/profile?payment=success");
  });

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // Sitemap.xml endpoint
  app.get("/sitemap.xml", async (req: Request, res: Response) => {
    try {
      const { getDb } = await import("../db");
      const { seoSettings, globalSeoConfig } = await import("../../drizzle/schema");
      const { eq } = await import("drizzle-orm");

      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      // Get all active pages
      const pages = await db
        .select()
        .from(seoSettings)
        .where(eq(seoSettings.isActive, true));

      // Get global config for sitemap settings
      const [globalConfig] = await db.select().from(globalSeoConfig).limit(1);

      // Base URL
      const baseUrl = "https://nanoinf.com";

      // Generate sitemap XML
      let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
      xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

      // Add homepage
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/</loc>\n`;
      xml += `    <changefreq>daily</changefreq>\n`;
      xml += `    <priority>1.0</priority>\n`;
      xml += `  </url>\n`;

      // Add all pages
      for (const page of pages) {
        if (page.robotsIndex && page.pageSlug !== "home") {
          xml += `  <url>\n`;
          xml += `    <loc>${baseUrl}/${page.pageSlug}</loc>\n`;

          // Convert updatedAt to Date if it's a string (database may return string)
          const updatedDate = page.updatedAt instanceof Date
            ? page.updatedAt
            : new Date(page.updatedAt);
          xml += `    <lastmod>${updatedDate.toISOString().split('T')[0]}</lastmod>\n`;

          xml += `    <changefreq>weekly</changefreq>\n`;
          xml += `    <priority>0.8</priority>\n`;
          xml += `  </url>\n`;
        }
      }

      xml += `</urlset>`;

      res.set("Content-Type", "application/xml");
      res.send(xml);
    } catch (error) {
      console.error("Sitemap generation error:", error);
      res.status(500).send("Error generating sitemap");
    }
  });

  // Robots.txt endpoint
  app.get("/robots.txt", async (req: Request, res: Response) => {
    try {
      const { getDb } = await import("../db");
      const { globalSeoConfig } = await import("../../drizzle/schema");

      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }
      const [globalConfig] = await db.select().from(globalSeoConfig).limit(1);

      // robotsTxt is stored in the database but not in the type, use default
      let robotsTxt = `User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /admin/\n\nSitemap: https://nanoinf.com/sitemap.xml`;

      res.set("Content-Type", "text/plain");
      res.send(robotsTxt);
    } catch (error) {
      console.error("Robots.txt error:", error);
      // Return default robots.txt on error
      res.set("Content-Type", "text/plain");
      res.send(`User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /admin/\n\nSitemap: https://nanoinf.com/sitemap.xml`);
    }
  });
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });

  // Global unhandled rejection handler to prevent crashes from Telegram bot errors
  process.on('unhandledRejection', (reason: any, promise) => {
    // Check if this is a Telegram error from blocked users
    if (reason?.response?.error_code === 403 && reason?.response?.description?.includes('blocked by the user')) {
      console.warn('[Telegram Bot] User has blocked the bot - continuing operation');
      return;
    }

    // Check if this is a Telegram-related error
    const errorString = String(reason);
    if (errorString.includes('TelegramError') || errorString.includes('Telegram Bot') || errorString.includes('telegraf')) {
      console.error('[Telegram Bot] Unhandled error:', {
        error_code: reason?.response?.error_code,
        description: reason?.response?.description || reason?.message || errorString
      });
      return; // Don't crash the app for Telegram errors
    }

    // For other errors, log but continue
    console.error('[App] Unhandled rejection:', reason);
  });

  // Initialize and start Telegram Bot
  initializeTelegramBot();
  startTelegramBot().catch(console.error);

  // Start video status updater background job
  startVideoStatusUpdater();
}

startServer().catch(console.error);
