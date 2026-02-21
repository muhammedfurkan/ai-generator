// @ts-nocheck
import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { getDb } from "../db";
import {
  users,
  creditPackages,
  stripeOrders,
  creditTransactions,
} from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import Stripe from "stripe";

// Initialize Stripe
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  console.warn(
    "⚠️  STRIPE_SECRET_KEY is not set. Stripe payments will not work."
  );
}

const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: "2024-12-18.acacia",
      typescript: true,
    })
  : null;

function normalizeStripeCurrency(currency?: string | null): string | undefined {
  if (!currency) return undefined;
  return currency.trim().toUpperCase();
}

function formatMinorAmountToDecimal(
  amount?: number | null
): string | undefined {
  if (typeof amount !== "number" || !Number.isFinite(amount)) return undefined;
  return (amount / 100).toFixed(2);
}

export const stripeRouter = router({
  /**
   * Get Stripe Publishable Key
   * Frontend için Stripe initialization key'i döndürür
   */
  getPublishableKey: publicProcedure.query(() => {
    const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY;
    if (!publishableKey) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Stripe publishable key is not configured.",
      });
    }
    return { publishableKey };
  }),

  /**
   * Create Stripe Checkout Session
   * Kullanıcı bir kredi paketi satın almak istediğinde checkout session oluşturur
   */
  createCheckoutSession: protectedProcedure
    .input(
      z.object({
        packageId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!stripe) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Stripe is not configured. Please contact support.",
        });
      }

      const db = await getDb();
      const user = ctx.user;

      console.log(
        `[Stripe] Creating checkout for user ${user.id}, package ${input.packageId}`
      );

      // Get package details
      const [pkg] = await db
        .select()
        .from(creditPackages)
        .where(
          and(
            eq(creditPackages.id, input.packageId),
            eq(creditPackages.isActive, true)
          )
        )
        .limit(1);

      if (!pkg) {
        console.error(
          `[Stripe] Package not found or inactive: ${input.packageId}`
        );

        // Debug: Check if package exists but is inactive
        const [inactivePkg] = await db
          .select()
          .from(creditPackages)
          .where(eq(creditPackages.id, input.packageId))
          .limit(1);

        if (inactivePkg) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              "Bu paket şu anda aktif değil. Lütfen başka bir paket seçin.",
          });
        }

        throw new TRPCError({
          code: "NOT_FOUND",
          message:
            "Paket bulunamadı. Lütfen sayfayı yenileyin ve tekrar deneyin.",
        });
      }

      console.log(
        `[Stripe] Package found: ${pkg.name} (${pkg.credits} credits, ${pkg.price} TRY)`
      );

      // Create order record
      const insertResult = await db.insert(stripeOrders).values({
        userId: user.id,
        packageId: pkg.id,
        creditsAmount: pkg.credits,
        price: pkg.price.toString(),
        currency: "TRY",
        status: "pending",
      });

      // Get the inserted ID from the MySQL result
      // Drizzle returns [ResultSetHeader, ...] for MySQL inserts
      const resultHeader = insertResult[0] as { insertId: number | bigint };
      const insertId = resultHeader?.insertId;

      if (!insertId) {
        console.error(
          "[Stripe] Failed to create order - no insertId returned",
          insertResult
        );
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Sipariş oluşturulamadı. Lütfen tekrar deneyin.",
        });
      }

      const orderId = Number(insertId);
      console.log(`[Stripe] Order created with ID: ${orderId}`);

      // Create Stripe Checkout Session
      // Get the base URL from environment or construct it
      const baseUrl =
        process.env.LOCAL_BASE_URL ||
        `http://localhost:${process.env.APP_PORT || 3000}`;

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        locale: "auto",
        customer_email: user.email || undefined,
        client_reference_id: orderId.toString(),
        // Adaptive Pricing: Stripe otomatik olarak kullanıcının ülkesine göre
        // fiyatı yerel para birimine çevirir (örn: TR -> TRY, DE -> EUR, US -> USD)
        // https://docs.stripe.com/payments/checkout/adaptive-pricing
        adaptive_pricing: {
          enabled: true,
        },
        line_items: [
          {
            price_data: {
              currency: "try", // Ana para birimi TRY, Stripe otomatik dönüştürür
              product_data: {
                name: pkg.name,
                description: pkg.description || `${pkg.credits} kredi paketi`,
              },
              unit_amount: Math.round(parseFloat(pkg.price.toString()) * 100), // Convert to kuruş (cents)
            },
            quantity: 1,
          },
        ],
        metadata: {
          orderId: orderId.toString(),
          userId: user.id.toString(),
          packageId: pkg.id.toString(),
          credits: pkg.credits.toString(),
          originalCurrency: "TRY", // Orijinal para birimini kaydet
          originalAmount: pkg.price.toString(),
        },
        success_url: `${baseUrl}/packages?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/packages?canceled=true`,
      });

      // Update order with session ID
      await db
        .update(stripeOrders)
        .set({
          stripeSessionId: session.id,
          stripeCustomerId: session.customer as string | null,
        })
        .where(eq(stripeOrders.id, orderId));

      console.log(`[Stripe] Checkout session created: ${session.id}`);

      return {
        sessionId: session.id,
        url: session.url,
      };
    }),

  /**
   * Get order status
   * Kullanıcı ödeme sonrası durumu kontrol edebilsin
   */
  getOrderStatus: protectedProcedure
    .input(
      z.object({
        sessionId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();

      const [order] = await db
        .select()
        .from(stripeOrders)
        .where(
          and(
            eq(stripeOrders.stripeSessionId, input.sessionId),
            eq(stripeOrders.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (!order) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Sipariş bulunamadı.",
        });
      }

      return {
        status: order.status,
        credits: order.creditsAmount,
        price: order.price,
        currency: order.currency,
        completedAt: order.completedAt,
      };
    }),

  /**
   * Webhook handler - This will be called by Stripe
   * NOT a tRPC procedure - will be handled by Express route
   */
  handleWebhook: publicProcedure
    .input(
      z.object({
        signature: z.string(),
        payload: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      if (!stripe) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Stripe is not configured.",
        });
      }

      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
      if (!webhookSecret) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Webhook secret is not configured.",
        });
      }

      let event: Stripe.Event;

      try {
        event = stripe.webhooks.constructEvent(
          input.payload,
          input.signature,
          webhookSecret
        );
      } catch (err) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Webhook signature verification failed: ${err instanceof Error ? err.message : "Unknown error"}`,
        });
      }

      const db = await getDb();

      // Handle the event
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as Stripe.Checkout.Session;

          // Get order ID from metadata
          const orderId = session.metadata?.orderId;
          if (!orderId) {
            console.error("No orderId in session metadata");
            break;
          }

          // Update order status
          const [order] = await db
            .select()
            .from(stripeOrders)
            .where(eq(stripeOrders.id, parseInt(orderId)))
            .limit(1);

          if (!order) {
            console.error(`Order not found: ${orderId}`);
            break;
          }

          const presentmentCurrency =
            normalizeStripeCurrency(
              session.presentment_details?.presentment_currency
            ) || normalizeStripeCurrency(session.currency);
          const presentmentPrice =
            formatMinorAmountToDecimal(
              session.presentment_details?.presentment_amount
            ) || formatMinorAmountToDecimal(session.amount_total);

          // Update order to success
          await db
            .update(stripeOrders)
            .set({
              status: "success",
              stripePaymentIntentId: session.payment_intent as string,
              stripeCustomerId: session.customer as string,
              currency: presentmentCurrency || order.currency,
              price: presentmentPrice || order.price,
              completedAt: new Date(),
            })
            .where(eq(stripeOrders.id, order.id));

          // Get user current credits
          const [user] = await db
            .select()
            .from(users)
            .where(eq(users.id, order.userId))
            .limit(1);

          if (!user) {
            console.error(`User not found: ${order.userId}`);
            break;
          }

          // Get package to check for bonus
          const [pkg] = await db
            .select()
            .from(creditPackages)
            .where(eq(creditPackages.id, order.packageId))
            .limit(1);

          // Calculate credits with bonus
          let creditsToAdd = order.creditsAmount;
          if (pkg && pkg.bonus && pkg.bonus > 0) {
            creditsToAdd = Math.floor(
              order.creditsAmount * (1 + pkg.bonus / 100)
            );
            console.log(
              `📈 Bonus applied: ${order.creditsAmount} + ${pkg.bonus}% = ${creditsToAdd} credits`
            );
          }

          const oldCredits = user.credits;
          const newCredits = oldCredits + creditsToAdd;

          // Add credits to user
          await db
            .update(users)
            .set({ credits: newCredits })
            .where(eq(users.id, order.userId));

          // Create credit transaction record
          await db.insert(creditTransactions).values({
            userId: order.userId,
            type: "purchase",
            amount: creditsToAdd,
            reason:
              pkg && pkg.bonus && pkg.bonus > 0
                ? `Stripe - ${order.creditsAmount} kredi (+%${pkg.bonus} bonus = ${creditsToAdd} kredi) satın alındı (Paket ID: ${order.packageId})`
                : `Stripe - ${creditsToAdd} kredi satın alındı (Paket ID: ${order.packageId})`,
            balanceBefore: oldCredits,
            balanceAfter: newCredits,
          });

          console.log(
            `✅ Payment successful for order ${orderId}. Added ${creditsToAdd} credits to user ${order.userId}`
          );
          break;
        }

        case "checkout.session.async_payment_succeeded": {
          // Handle async payment success (e.g., bank transfers)
          const session = event.data.object as Stripe.Checkout.Session;
          const orderId = session.metadata?.orderId;

          if (orderId) {
            const presentmentCurrency =
              normalizeStripeCurrency(
                session.presentment_details?.presentment_currency
              ) || normalizeStripeCurrency(session.currency);
            const presentmentPrice =
              formatMinorAmountToDecimal(
                session.presentment_details?.presentment_amount
              ) || formatMinorAmountToDecimal(session.amount_total);

            await db
              .update(stripeOrders)
              .set({
                status: "success",
                completedAt: new Date(),
                ...(presentmentCurrency
                  ? { currency: presentmentCurrency }
                  : {}),
                ...(presentmentPrice ? { price: presentmentPrice } : {}),
              })
              .where(eq(stripeOrders.id, parseInt(orderId)));
          }
          break;
        }

        case "checkout.session.async_payment_failed": {
          // Handle async payment failure
          const session = event.data.object as Stripe.Checkout.Session;
          const orderId = session.metadata?.orderId;

          if (orderId) {
            await db
              .update(stripeOrders)
              .set({
                status: "failed",
                errorMessage: "Async payment failed",
              })
              .where(eq(stripeOrders.id, parseInt(orderId)));
          }
          break;
        }

        case "payment_intent.payment_failed": {
          const paymentIntent = event.data.object as Stripe.PaymentIntent;

          // Find order by payment intent
          const [order] = await db
            .select()
            .from(stripeOrders)
            .where(eq(stripeOrders.stripePaymentIntentId, paymentIntent.id))
            .limit(1);

          if (order) {
            await db
              .update(stripeOrders)
              .set({
                status: "failed",
                errorMessage:
                  paymentIntent.last_payment_error?.message || "Payment failed",
              })
              .where(eq(stripeOrders.id, order.id));
          }
          break;
        }

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      return { received: true };
    }),
});
