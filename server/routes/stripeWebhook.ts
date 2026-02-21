// @ts-nocheck
import express from "express";
import Stripe from "stripe";
import { getDb } from "../db";
import { stripeOrders, users, creditTransactions } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

const router = express.Router();

// Initialize Stripe
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
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

/**
 * Stripe Webhook Handler
 * This endpoint receives events from Stripe webhooks
 * Important: This must use express.raw() for body parsing, not express.json()
 */
router.post(
  "/stripe/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    if (!stripe) {
      console.error("Stripe is not configured");
      return res.status(500).json({ error: "Stripe not configured" });
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("STRIPE_WEBHOOK_SECRET is not set");
      return res.status(500).json({ error: "Webhook secret not configured" });
    }

    const sig = req.headers["stripe-signature"];
    if (!sig) {
      return res.status(400).json({ error: "No signature header" });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      console.error(
        `Webhook signature verification failed:`,
        err instanceof Error ? err.message : err
      );
      return res
        .status(400)
        .json({
          error: `Webhook Error: ${err instanceof Error ? err.message : "Unknown error"}`,
        });
    }

    try {
      const db = await getDb();

      // Handle different event types
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as Stripe.Checkout.Session;
          console.log(`✅ Checkout session completed: ${session.id}`);

          // Get order ID from client_reference_id or metadata
          const orderId =
            session.client_reference_id || session.metadata?.orderId;
          if (!orderId) {
            console.error("No orderId found in session");
            break;
          }

          // Get order
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

          // If payment is already completed, skip
          if (order.status === "success") {
            console.log(`Order ${orderId} already processed`);
            break;
          }

          // Update order status to processing first
          await db
            .update(stripeOrders)
            .set({
              status: "processing",
              stripePaymentIntentId: session.payment_intent as string,
              stripeCustomerId: session.customer as string,
              currency: presentmentCurrency || order.currency,
              price: presentmentPrice || order.price,
            })
            .where(eq(stripeOrders.id, order.id));

          // Get user
          const [user] = await db
            .select()
            .from(users)
            .where(eq(users.id, order.userId))
            .limit(1);

          if (!user) {
            console.error(`User not found: ${order.userId}`);
            await db
              .update(stripeOrders)
              .set({ status: "failed", errorMessage: "User not found" })
              .where(eq(stripeOrders.id, order.id));
            break;
          }

          const oldCredits = user.credits;
          const newCredits = oldCredits + order.creditsAmount;

          // Add credits to user
          await db
            .update(users)
            .set({ credits: newCredits })
            .where(eq(users.id, order.userId));

          // Create credit transaction
          await db.insert(creditTransactions).values({
            userId: order.userId,
            type: "purchase",
            amount: order.creditsAmount,
            reason: `Stripe ödeme - ${order.creditsAmount} kredi (Paket ID: ${order.packageId})`,
            balanceBefore: oldCredits,
            balanceAfter: newCredits,
          });

          // Mark order as successful
          await db
            .update(stripeOrders)
            .set({
              status: "success",
              completedAt: new Date(),
              currency: presentmentCurrency || order.currency,
              price: presentmentPrice || order.price,
            })
            .where(eq(stripeOrders.id, order.id));

          console.log(
            `✅ Payment successful: Order ${orderId} - Added ${order.creditsAmount} credits to user ${order.userId}`
          );

          // TODO: Optionally send email notification or push notification to user
          break;
        }

        case "checkout.session.async_payment_succeeded": {
          const session = event.data.object as Stripe.Checkout.Session;
          const orderId =
            session.client_reference_id || session.metadata?.orderId;

          if (orderId) {
            const presentmentCurrency =
              normalizeStripeCurrency(
                session.presentment_details?.presentment_currency
              ) || normalizeStripeCurrency(session.currency);
            const presentmentPrice =
              formatMinorAmountToDecimal(
                session.presentment_details?.presentment_amount
              ) || formatMinorAmountToDecimal(session.amount_total);

            console.log(`✅ Async payment succeeded for order ${orderId}`);
            // This event fires after async payment methods complete (e.g., bank transfers)
            // The credits should already be added in checkout.session.completed
            // Just update the status if needed
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
          const session = event.data.object as Stripe.Checkout.Session;
          const orderId =
            session.client_reference_id || session.metadata?.orderId;

          if (orderId) {
            const db = await getDb();
            await db
              .update(stripeOrders)
              .set({
                status: "failed",
                errorMessage: "Async payment failed",
              })
              .where(eq(stripeOrders.id, parseInt(orderId)));

            console.error(`❌ Async payment failed for order ${orderId}`);
          }
          break;
        }

        case "payment_intent.payment_failed": {
          const paymentIntent = event.data.object as Stripe.PaymentIntent;

          // Try to find order by payment intent ID
          const db = await getDb();
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

            console.error(
              `❌ Payment failed for order ${order.id}: ${paymentIntent.last_payment_error?.message}`
            );
          }
          break;
        }

        case "charge.refunded": {
          const charge = event.data.object as Stripe.Charge;

          // Handle refund - deduct credits from user
          const db = await getDb();
          const [order] = await db
            .select()
            .from(stripeOrders)
            .where(
              eq(
                stripeOrders.stripePaymentIntentId,
                charge.payment_intent as string
              )
            )
            .limit(1);

          if (order && order.status === "success") {
            // Get user
            const [user] = await db
              .select()
              .from(users)
              .where(eq(users.id, order.userId))
              .limit(1);

            if (user) {
              const oldCredits = user.credits;
              const newCredits = Math.max(0, oldCredits - order.creditsAmount); // Don't go below 0

              // Deduct credits
              await db
                .update(users)
                .set({ credits: newCredits })
                .where(eq(users.id, order.userId));

              // Create transaction
              await db.insert(creditTransactions).values({
                userId: order.userId,
                type: "deduct",
                amount: order.creditsAmount,
                reason: `Stripe iade - ${order.creditsAmount} kredi iade edildi`,
                balanceBefore: oldCredits,
                balanceAfter: newCredits,
              });

              // Update order status
              await db
                .update(stripeOrders)
                .set({ status: "refunded" })
                .where(eq(stripeOrders.id, order.id));

              console.log(
                `🔄 Refund processed for order ${order.id}: Deducted ${order.creditsAmount} credits from user ${order.userId}`
              );
            }
          }
          break;
        }

        default:
          console.log(`ℹ️  Unhandled Stripe event type: ${event.type}`);
      }

      // Return 200 to acknowledge receipt
      res.json({ received: true });
    } catch (error) {
      console.error("Error processing webhook:", error);
      res.status(500).json({ error: "Webhook processing failed" });
    }
  }
);

export default router;
