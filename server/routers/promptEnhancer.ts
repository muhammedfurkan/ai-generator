import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";

export const promptEnhancerRouter = router({
  /**
   * Enhance a short prompt into a detailed, high-quality prompt
   */
  enhance: protectedProcedure
    .input(
      z.object({
        prompt: z.string().min(1).max(500),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `You are an expert AI image prompt engineer. Your task is to enhance short, simple prompts into detailed, high-quality prompts that will generate stunning images.

Guidelines:
- Keep the core subject/concept from the original prompt
- Add artistic details: lighting, composition, style, mood, colors
- Add quality enhancers: "highly detailed", "professional", "masterpiece", "8k"
- Add camera/art style if relevant: "cinematic", "digital art", "oil painting", "photograph"
- Keep it under 200 words
- Always output in English, even if input is in another language
- Be creative but stay relevant to the original concept
- Don't add watermarks or text in the image

Examples:
Input: "dağ"
Output: "Majestic snow-capped mountain peak at golden hour, dramatic clouds, crystal clear alpine lake reflection, professional landscape photography, highly detailed, 8k resolution, cinematic composition"

Input: "kedi"
Output: "Adorable fluffy cat with bright green eyes, soft natural lighting, sitting on a cozy windowsill, professional pet photography, shallow depth of field, highly detailed fur texture, warm colors, 8k quality"

Input: "sunset beach"
Output: "Breathtaking tropical beach sunset, vibrant orange and pink sky, gentle waves, palm trees silhouette, golden hour lighting, professional landscape photography, highly detailed, cinematic composition, 8k resolution, serene atmosphere"`,
            },
            {
              role: "user",
              content: `Enhance this prompt: "${input.prompt}"`,
            },
          ],
        });

        const content = response.choices[0]?.message?.content;
        const enhancedPrompt = typeof content === 'string' ? content.trim() : null;

        if (!enhancedPrompt) {
          throw new Error("Failed to enhance prompt");
        }

        return {
          original: input.prompt,
          enhanced: enhancedPrompt,
        };
      } catch (error) {
        console.error("[Prompt Enhancer] Error:", error);
        throw new Error("Prompt iyileştirilemedi. Lütfen tekrar deneyin.");
      }
    }),
});
