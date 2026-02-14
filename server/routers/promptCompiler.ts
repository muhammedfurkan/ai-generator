import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";
import { deductCredits, getUserById } from "../db";
import { TRPCError } from "@trpc/server";

// Input validation schema
const promptCompilerInput = z.object({
  input_tr: z.string().min(1).max(2000),
  mode: z.enum(["image", "t2v", "i2v", "universal"]).default("image"),
  aspect_ratio: z.enum(["1:1", "9:16", "16:9", "4:5"]).default("1:1"),
  style: z.enum(["realistic", "cinematic", "anime", "3d", "illustration", "product", "ugc_ad"]).default("realistic"),
  quality: z.enum(["draft", "high", "ultra"]).default("high"),
  no_identity: z.boolean().default(true),
  action: z.enum(["compile", "shorter", "detailed", "hook"]).default("compile"),
  previous_prompt: z.string().optional(),
});

// Output schema for LLM response
const promptCompilerOutput = z.object({
  master_prompt_en: z.string(),
  negative_prompt_en: z.string(),
  settings: z.object({
    mode: z.string(),
    aspect_ratio: z.string(),
    style: z.string(),
    quality: z.string(),
    camera: z.string(),
    lighting: z.string(),
    environment: z.string(),
    subject: z.string(),
    actions: z.string(),
    constraints: z.array(z.string()),
  }),
  tr_summary: z.array(z.string()),
  variants_en: z.array(z.string()),
});

const SYSTEM_PROMPT = `You are "Prompt Compiler Pro". Convert Turkish user intent into an expert-level English master prompt.

Hard rules:
• Do NOT mention any real person or attempt to match an identifiable person.
• If user asks "same as X person / celebrity / exact face", refuse that part and produce a similar style prompt with a new original character.
• Do NOT output disallowed content. If user requests explicit sexual content, refuse and suggest safe alternatives (e.g., fashion, glamour, romance without explicitness).
• Prefer clear structure, short powerful sentences, no fluff.
• If information is missing, infer reasonable defaults without asking questions.

Output must be in this exact JSON schema:
{
  "master_prompt_en": "string",
  "negative_prompt_en": "string",
  "settings": {
    "mode": "image|t2v|i2v|universal",
    "aspect_ratio": "1:1|9:16|16:9|4:5",
    "style": "string",
    "quality": "draft|high|ultra",
    "camera": "string",
    "lighting": "string",
    "environment": "string",
    "subject": "string",
    "actions": "string",
    "constraints": ["string", "string"]
  },
  "tr_summary": ["string", "string", "string"],
  "variants_en": ["string", "string", "string"]
}

Prompt quality guidelines:
• Include: subject, action, environment, composition, camera/lens, lighting, texture/material realism, mood, color palette, and realism constraints.
• Add model-friendly tags only when helpful (cinematic, photorealistic, ultra-detailed).
• Negative prompt should cover: artifacts, deformations, extra limbs, bad anatomy, watermark, text, low-res, oversharpen, noise, weird hands, logo, UI elements, signature.
• For video: include shot list, motion description, camera movement, duration suggestion, and continuity constraints.

Style-specific guidelines:
• realistic: photorealistic, natural lighting, subtle details, real-world textures
• cinematic: film grain, dramatic lighting, wide aspect ratio, movie-like composition
• anime: anime style, vibrant colors, clean lines, expressive features
• 3d: 3D render, octane render, unreal engine, volumetric lighting
• illustration: digital art, concept art, detailed illustration
• product: product photography, studio lighting, clean background, commercial quality
• ugc_ad: UGC style, authentic, relatable, vertical format, social media ready

Quality levels:
• draft: quick generation, basic details
• high: detailed, refined, professional quality
• ultra: maximum detail, 8K, hyper-realistic, masterpiece quality`;

const SHORTER_PROMPT = `Make the following prompt more concise while keeping the essential elements. Remove redundant descriptions and keep it under 100 words. Return the same JSON structure with shortened prompts.`;

const DETAILED_PROMPT = `Expand the following prompt with more specific details about lighting, textures, atmosphere, and composition. Add professional photography/cinematography terms. Return the same JSON structure with expanded prompts.`;

const HOOK_PROMPT = `Add a viral hook element to this video prompt. Include: attention-grabbing opening (first 1-2 seconds), dynamic camera movement, trending visual effect, and emotional trigger. Make it optimized for TikTok/Instagram Reels. Return the same JSON structure with hook-enhanced prompts.`;

// Kredi maliyeti
const PROMPT_COMPILER_CREDIT_COST = 1;

export const promptCompilerRouter = router({
  // Kredi maliyetini getir
  getCreditCost: protectedProcedure.query(() => {
    return { creditCost: PROMPT_COMPILER_CREDIT_COST };
  }),

  compile: protectedProcedure
    .input(promptCompilerInput)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      
      // Kredi kontrolü
      const user = await getUserById(userId);
      if (!user || user.credits < PROMPT_COMPILER_CREDIT_COST) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "INSUFFICIENT_CREDITS",
        });
      }
      
      // Kredi düş
      const deducted = await deductCredits(userId, PROMPT_COMPILER_CREDIT_COST);
      if (!deducted) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Kredi düşürülemedi",
        });
      }
      let systemPrompt = SYSTEM_PROMPT;
      let userPrompt = "";

      // Build user prompt based on action
      if (input.action === "compile") {
        userPrompt = `Convert this Turkish description to a professional prompt:

User Input (TR): "${input.input_tr}"

Settings requested:
- Mode: ${input.mode}
- Aspect Ratio: ${input.aspect_ratio}
- Style: ${input.style}
- Quality: ${input.quality}
- No real person identity: ${input.no_identity}

Generate the master prompt following all guidelines.`;
      } else if (input.action === "shorter" && input.previous_prompt) {
        systemPrompt = SYSTEM_PROMPT + "\n\n" + SHORTER_PROMPT;
        userPrompt = `Previous prompt to shorten:\n${input.previous_prompt}`;
      } else if (input.action === "detailed" && input.previous_prompt) {
        systemPrompt = SYSTEM_PROMPT + "\n\n" + DETAILED_PROMPT;
        userPrompt = `Previous prompt to expand:\n${input.previous_prompt}`;
      } else if (input.action === "hook" && input.previous_prompt) {
        systemPrompt = SYSTEM_PROMPT + "\n\n" + HOOK_PROMPT;
        userPrompt = `Previous video prompt to add hook:\n${input.previous_prompt}`;
      } else {
        userPrompt = `Convert this Turkish description to a professional prompt:

User Input (TR): "${input.input_tr}"

Settings requested:
- Mode: ${input.mode}
- Aspect Ratio: ${input.aspect_ratio}
- Style: ${input.style}
- Quality: ${input.quality}
- No real person identity: ${input.no_identity}

Generate the master prompt following all guidelines.`;
      }

      try {
        const response = await invokeLLM({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "prompt_compiler_output",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  master_prompt_en: { type: "string", description: "The main English prompt" },
                  negative_prompt_en: { type: "string", description: "Negative prompt for unwanted elements" },
                  settings: {
                    type: "object",
                    properties: {
                      mode: { type: "string" },
                      aspect_ratio: { type: "string" },
                      style: { type: "string" },
                      quality: { type: "string" },
                      camera: { type: "string" },
                      lighting: { type: "string" },
                      environment: { type: "string" },
                      subject: { type: "string" },
                      actions: { type: "string" },
                      constraints: { type: "array", items: { type: "string" } },
                    },
                    required: ["mode", "aspect_ratio", "style", "quality", "camera", "lighting", "environment", "subject", "actions", "constraints"],
                    additionalProperties: false,
                  },
                  tr_summary: { type: "array", items: { type: "string" } },
                  variants_en: { type: "array", items: { type: "string" } },
                },
                required: ["master_prompt_en", "negative_prompt_en", "settings", "tr_summary", "variants_en"],
                additionalProperties: false,
              },
            },
          },
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
          throw new Error("Empty response from LLM");
        }

        // Handle both string and array content types
        const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
        const parsed = JSON.parse(contentStr);
        return {
          success: true,
          data: parsed,
        };
      } catch (error) {
        console.error("Prompt compiler error:", error);
        return {
          success: false,
          error: "Prompt oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.",
        };
      }
    }),

  // Get demo prompts
  getDemos: protectedProcedure.query(() => {
    return [
      {
        id: "cappadocia",
        title: "Kapadokya Reels",
        input_tr: "Kapadokya'da gün batımında, peri bacaları arasında yürüyen şık bir kadın, sinematik, sıcak tonlar, drone çekimi",
        mode: "t2v" as const,
        aspect_ratio: "9:16" as const,
        style: "cinematic" as const,
        quality: "ultra" as const,
      },
      {
        id: "ugc",
        title: "Ürün UGC Reklam",
        input_tr: "Genç bir kadın elinde kahve fincanı tutuyor, mutlu gülümsüyor, doğal ışık, ev ortamı, samimi ve gerçekçi",
        mode: "t2v" as const,
        aspect_ratio: "9:16" as const,
        style: "ugc_ad" as const,
        quality: "high" as const,
      },
      {
        id: "influencer",
        title: "AI Influencer Fotoğraf",
        input_tr: "Profesyonel stüdyo çekimi, moda fotoğrafı, zarif poz, yumuşak stüdyo ışığı, minimalist arka plan",
        mode: "image" as const,
        aspect_ratio: "4:5" as const,
        style: "realistic" as const,
        quality: "ultra" as const,
      },
    ];
  }),
});
