// @ts-nocheck
import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import {
  users,
  creditPackages,
  shopierOrders,
  creditTransactions,
} from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
// @ts-ignore
import Shopier from "@efesoroglu/shopier-api";

export const shopierRouter = router({
  initiatePayment: protectedProcedure
    .input(
      z.object({
        packageId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      const user = ctx.user;

      // 1. Get package
      const [pkg] = await db
        .select()
        .from(creditPackages)
        .where(eq(creditPackages.id, input.packageId))
        .limit(1);

      if (!pkg || !pkg.isActive) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Paket bulunamadı veya aktif değil.",
        });
      }

      // 2. Generate merchant order ID (unique)
      // We'll create a DB record first to get an ID? Or use a random string.
      // Better to insert 'pending' then use that ID.
      // But shopier requires unique order ID.
      // Let's create a partial record or just use timestamp-random.
      const merchantOrderId = `ORD-${user.id}-${Date.now()}`;

      // 3. Create shopier client
      const apiKey = process.env.SHOPIER_API_KEY;
      const apiSecret = process.env.SHOPIER_API_SECRET || "null"; // Allow missing secret as per user request (some integrations might not use it or use key as secret)

      if (!apiKey) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Shopier API API key is missing.",
        });
      }

      const shopier = new Shopier(apiKey, apiSecret, "TRY");

      // 4. Set buyer info
      // user.name might be null
      const fullName = user.name || "Misafir Kullanici";
      const names = fullName.trim().split(" ");
      const firstName = names[0];
      const lastName = names.slice(1).join(" ") || "Kullanici";

      const buyerEmail = user.email || "no-email@example.com";
      const buyerPhone = "05555555555"; // Dummy if not collected

      // Note: shopier library uses 'id' as the order ID (platform_order_id)
      shopier.setBuyer({
        id: merchantOrderId,
        product_name: pkg.name,
        first_name: firstName,
        last_name: lastName,
        email: buyerEmail,
        phone: buyerPhone,
      });

      // 5. Billing/Shipping
      const addressData = {
        billing_address: "Dijital Hizmet",
        billing_city: "Istanbul",
        billing_country: "Turkey",
        billing_postcode: "34000",
      };

      shopier.setOrderBilling(addressData);
      shopier.setOrderShipping({
        ...addressData,
        shipping_address: addressData.billing_address,
        shipping_city: addressData.billing_city,
        shipping_country: addressData.billing_country,
        shipping_postcode: addressData.billing_postcode,
      });

      // 6. Generate Payment Page HTML
      // payment(amount)
      const paymentPageHtml = shopier.payment(pkg.price.toString());

      // 7. Save order to DB
      await db.insert(shopierOrders).values({
        userId: user.id,
        packageId: pkg.id,
        creditsAmount: pkg.credits,
        price: pkg.price.toString(),
        merchantOrderId: merchantOrderId,
        status: "pending",
      });

      return {
        html: paymentPageHtml,
      };
    }),
});
