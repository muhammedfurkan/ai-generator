const fs = require('fs');

const path = 'server/routers/adminPanel.ts';
let code = fs.readFileSync(path, 'utf8');

const getKieModelsPricingCode = `
  getKieModelsPricing: adminProcedure
    .input(
      z.object({
        pageNum: z.number().default(1),
        pageSize: z.number().default(100),
        modelDescription: z.string().optional(),
        interfaceType: z.string().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      try {
        const res = await fetch("https://api.kie.ai/client/v1/model-pricing/page", {
          method: "POST",
          headers: {
            "accept": "application/json, text/plain, */*",
            "content-type": "application/json",
            "authorization": "335db144-9458-448b-81fe-f2c410f6078b",
          },
          body: JSON.stringify({
            pageNum: input?.pageNum || 1,
            pageSize: input?.pageSize || 1000,
            modelDescription: input?.modelDescription || "",
            interfaceType: input?.interfaceType || "",
          }),
        });
        const data = await res.json();
        return data.data?.records || [];
      } catch (error) {
        console.error("Error fetching Kie models", error);
        return [];
      }
    }),

  updateFeaturePricingBulk: adminProcedure
    .input(
      z.array(
        z.object({
          id: z.number(),
          credits: z.number().min(0).optional(),
          featureName: z.string().optional(),
          description: z.string().optional(),
          isActive: z.boolean().optional(),
        })
      )
    )
    .mutation(async ({ ctx, input }) => {
      const db = await requireAdminDb();
      for (const item of input) {
        const { id, ...updateData } = item;
        await db
          .update(featurePricing)
          .set(updateData)
          .where(eq(featurePricing.id, id));
      }
      return { success: true };
    }),
`;

code = code.replace(
  "// ============ FEATURE PRICING ============", 
  "// ============ FEATURE PRICING ============\n" + getKieModelsPricingCode
);

fs.writeFileSync(path, code);
