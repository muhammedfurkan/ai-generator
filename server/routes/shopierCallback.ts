// @ts-nocheck
/**
 * Shopier OSB (Otomatik Sipariş Bildirimi) Callback Handler
 * Shopier'dan gelen sipariş bildirimlerini işler ve kullanıcıya kredi ekler
 */
import { Router, Request, Response } from "express";
import crypto from "crypto";
import { getDb } from "../db";
import {
  users,
  creditPackages,
  creditTransactions,
  shopierOrders,
} from "../../drizzle/schema";
import { eq } from "drizzle-orm";

const router = Router();

// Shopier OSB kimlik bilgileri
const OSB_USERNAME =
  process.env.SHOPIER_OSB_USERNAME || "39dff5545eca64e64f729d98b36f0775";
const OSB_PASSWORD =
  process.env.SHOPIER_OSB_PASSWORD || "b789fc5d42828ba59975556a2701318f";

/**
 * Shopier OSB Callback Endpoint
 * POST /osbcallback
 */
router.post("/osbcallback", async (req: Request, res: Response) => {
  try {
    console.log("[Shopier OSB] Received callback:", req.body);

    // Shopier'dan gelen parametreler
    const {
      platform_order_id,
      API_key,
      API_secret,
      buyer_email,
      buyer_name,
      buyer_phone,
      product_name,
      product_type,
      total_order_price,
      currency,
      installment,
      status,
      payment_status,
      custom_field_1, // Kullanıcı ID'si veya email
      custom_field_2, // Paket ID'si
      custom_field_3,
    } = req.body;

    // OSB kimlik doğrulama
    if (API_key !== OSB_USERNAME || API_secret !== OSB_PASSWORD) {
      console.error("[Shopier OSB] Invalid credentials");
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Sipariş durumu kontrolü - sadece başarılı ödemeleri işle
    if (status !== "success" || payment_status !== "paid") {
      console.log(
        `[Shopier OSB] Order not successful: status=${status}, payment_status=${payment_status}`
      );
      return res.json({ success: true, message: "Order status not processed" });
    }

    const db = await getDb();
    if (!db) {
      console.error("[Shopier OSB] Database not available");
      return res.status(500).json({ error: "Database error" });
    }

    // Sipariş daha önce işlenmiş mi kontrol et
    const [existingOrder] = await db
      .select()
      .from(shopierOrders)
      .where(eq(shopierOrders.platformOrderId, platform_order_id))
      .limit(1);

    if (existingOrder && existingOrder.status === "completed") {
      console.log(
        `[Shopier OSB] Order already processed: ${platform_order_id}`
      );
      return res.json({ success: true, message: "Order already processed" });
    }

    // Kullanıcıyı bul (email ile)
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, buyer_email))
      .limit(1);

    if (!user) {
      console.error(`[Shopier OSB] User not found: ${buyer_email}`);

      // Siparişi "pending" olarak kaydet
      if (!existingOrder) {
        await db.insert(shopierOrders).values({
          platformOrderId: platform_order_id,
          userId: null,
          packageId: custom_field_2 ? parseInt(custom_field_2) : null,
          buyerEmail: buyer_email,
          buyerName: buyer_name,
          buyerPhone: buyer_phone,
          productName: product_name,
          totalOrderPrice: total_order_price,
          currency: currency || "TRY",
          status: "pending",
          paymentStatus: payment_status,
        });
      }

      return res.status(404).json({ error: "User not found" });
    }

    // Paket ID'si varsa paketi bul ve kredileri al
    let creditsToAdd = 0;
    let packageId: number | null = null;
    let pkg: any = null;

    if (custom_field_2) {
      packageId = parseInt(custom_field_2);
      [pkg] = await db
        .select()
        .from(creditPackages)
        .where(eq(creditPackages.id, packageId))
        .limit(1);

      if (pkg) {
        creditsToAdd = pkg.credits;

        // Apply bonus if exists
        if (pkg.bonus && pkg.bonus > 0) {
          const bonusCredits = Math.floor(pkg.credits * (pkg.bonus / 100));
          creditsToAdd = pkg.credits + bonusCredits;
          console.log(
            `[Shopier OSB] Bonus applied: ${pkg.credits} + ${pkg.bonus}% = ${creditsToAdd} credits`
          );
        }
      } else {
        console.warn(`[Shopier OSB] Package not found: ${packageId}`);
      }
    }

    // Eğer paket bulunamadıysa, product_name'den kredi miktarını çıkarmaya çalış
    if (creditsToAdd === 0) {
      const creditMatch = product_name.match(/(\d+)\s*kredi/i);
      if (creditMatch) {
        creditsToAdd = parseInt(creditMatch[1]);
      }
    }

    if (creditsToAdd === 0) {
      console.error(
        `[Shopier OSB] Could not determine credits for order: ${platform_order_id}`
      );
      return res.status(400).json({ error: "Could not determine credits" });
    }

    // Kullanıcıya kredi ekle
    const oldBalance = user.credits;
    const newBalance = oldBalance + creditsToAdd;

    await db
      .update(users)
      .set({ credits: newBalance })
      .where(eq(users.id, user.id));

    // Kredi işlemi kaydı oluştur
    await db.insert(creditTransactions).values({
      userId: user.id,
      type: "purchase",
      amount: creditsToAdd,
      reason:
        pkg && pkg.bonus && pkg.bonus > 0
          ? `Shopier sipariş - ${product_name} (+%${pkg.bonus} bonus = ${creditsToAdd} kredi) (${platform_order_id})`
          : `Shopier sipariş - ${product_name} (${platform_order_id})`,
      balanceBefore: oldBalance,
      balanceAfter: newBalance,
    });

    // Shopier siparişini kaydet veya güncelle
    const orderData = {
      platformOrderId: platform_order_id,
      userId: user.id,
      packageId: packageId,
      buyerEmail: buyer_email,
      buyerName: buyer_name,
      buyerPhone: buyer_phone,
      productName: product_name,
      totalOrderPrice: total_order_price,
      currency: currency || "TRY",
      status: "completed" as const,
      paymentStatus: payment_status,
    };

    if (existingOrder) {
      await db
        .update(shopierOrders)
        .set(orderData)
        .where(eq(shopierOrders.id, existingOrder.id));
    } else {
      await db.insert(shopierOrders).values(orderData);
    }

    console.log(
      `[Shopier OSB] Successfully processed order ${platform_order_id}: +${creditsToAdd} credits for user ${user.email}`
    );

    // Shopier'a başarılı yanıt dön
    return res.json({
      success: true,
      message: "Order processed successfully",
      credits_added: creditsToAdd,
    });
  } catch (error) {
    console.error("[Shopier OSB] Error processing callback:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * Test endpoint - OSB'nin çalışıp çalışmadığını kontrol etmek için
 * GET /osbcallback/test
 */
router.get("/osbcallback/test", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Shopier OSB Callback endpoint is working",
    timestamp: new Date().toISOString(),
  });
});

export default router;
