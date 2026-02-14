import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { ugcAdVideos, users } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { generateVideo, getVideoStatus } from "../kieAiApi";
import { notifyCreditSpending, notifyGenerationFailure } from "../telegramBot";
import { storagePut } from "../storage";

// UGC Senaryo tanımları
const UGC_SCENARIOS = {
  testimonial: {
    name: "Testimonial",
    nameTr: "Kullanıcı Yorumu",
    description: "Gerçek kullanıcı deneyimi paylaşımı",
    promptTemplate: `A real person records a testimonial video using their smartphone camera, selfie-style.
They speak naturally and casually about their experience with the product.
Opening: "I've been using this for a few days and..."
The video feels like a genuine TikTok review, not scripted.`,
  },
  unboxing: {
    name: "Unboxing",
    nameTr: "Kutu Açılışı",
    description: "İlk açılış ve tepki videosu",
    promptTemplate: `A real person records an unboxing video using their smartphone camera.
They open the product package naturally, showing genuine first reaction.
The camera captures their excitement and curiosity.
Natural pauses and authentic reactions are essential.`,
  },
  problem_solution: {
    name: "Problem → Solution",
    nameTr: "Problem → Çözüm",
    description: "Sorunu tanımlayıp ürünü çözüm olarak gösterir",
    promptTemplate: `A real person records a problem-solution style video using their smartphone.
They first describe a relatable problem they had.
Then they show how the product solved that problem.
The transition feels natural and convincing, like advice from a friend.`,
  },
  first_impression: {
    name: "First Impression",
    nameTr: "İlk İzlenim",
    description: "Dürüst ve meraklı ilk deneyim",
    promptTemplate: `A real person records their honest first impression of a product.
They examine the product with genuine curiosity.
Their tone is authentic - not overly positive or negative.
They share what they notice and how they feel about it.`,
  },
  lifestyle: {
    name: "Lifestyle Usage",
    nameTr: "Günlük Kullanım",
    description: "Günlük rutinde ürün kullanımı",
    promptTemplate: `A real person records themselves using the product in their daily routine.
The setting is a real home environment with natural lighting.
The product usage feels organic and integrated into their life.
No staging - just authentic everyday use captured on phone.`,
  },
};

// Ton tanımları
const TONES = {
  casual: {
    name: "Casual",
    nameTr: "Rahat",
    description: "Arkadaşça ve doğal konuşma",
    modifier: "Speak in a relaxed, friendly manner like talking to a friend.",
  },
  excited: {
    name: "Excited",
    nameTr: "Heyecanlı",
    description: "Enerjik ve coşkulu",
    modifier: "Show genuine excitement and enthusiasm, energetic delivery.",
  },
  calm: {
    name: "Calm",
    nameTr: "Sakin",
    description: "Güven veren ve rahatlatıcı",
    modifier: "Speak calmly and reassuringly, building trust through composure.",
  },
  persuasive: {
    name: "Persuasive",
    nameTr: "İkna Edici",
    description: "Güçlü ve etkileyici",
    modifier: "Use convincing language and confident delivery to persuade viewers.",
  },
};

// Dil tanımları
const LANGUAGES = {
  tr: { name: "Türkçe", code: "tr" },
  en: { name: "English", code: "en" },
  de: { name: "Deutsch", code: "de" },
  fr: { name: "Français", code: "fr" },
  es: { name: "Español", code: "es" },
  ar: { name: "العربية", code: "ar" },
};

// Model tanımları - Sadece Veo 3.1 kullanılıyor
const VIDEO_MODELS = {
  veo31: {
    name: "Veo 3.1",
    description: "Güçlü diyalog gerçekçiliği, doğal yüz ifadeleri",
    credits: 90, // base price
    modelId: "veo-3",
    promptModifier: `Model optimization: Veo 3.1
- Strong dialogue realism
- Natural facial expressions
- Raw phone camera look
- Slight handheld movement`,
  },
};

// Prompt oluşturma fonksiyonu
function buildUgcPrompt(params: {
  scenario: keyof typeof UGC_SCENARIOS;
  gender: "male" | "female";
  language: string;
  tone: keyof typeof TONES;
  model: keyof typeof VIDEO_MODELS;
  productName?: string;
  keyBenefit?: string;
}): string {
  const scenarioTemplate = UGC_SCENARIOS[params.scenario].promptTemplate;
  const toneModifier = TONES[params.tone].modifier;
  const modelModifier = VIDEO_MODELS[params.model].promptModifier;
  const languageName = LANGUAGES[params.language as keyof typeof LANGUAGES]?.name || "Turkish";
  const genderText = params.gender === "male" ? "a young man" : "a young woman";

  let prompt = `Create a realistic UGC-style advertisement video.

${genderText} records themselves using a smartphone camera.
The video must feel like a real TikTok/Instagram ad.

${scenarioTemplate}

${toneModifier}

The person speaks naturally in ${languageName}.
${params.productName ? `Product: ${params.productName}` : ""}
${params.keyBenefit ? `Key benefit to mention: ${params.keyBenefit}` : ""}

STRICT UGC RULES:
- Video must feel like recorded on a PHONE
- Natural imperfections are REQUIRED
- Slight camera shake allowed
- Non-perfect framing is GOOD
- Natural pauses, human pacing

DO NOT:
- create cinematic shots
- over-polish
- make influencer-style glamour videos

Environment: real home, real lighting, imperfect framing
Style: raw, authentic, non-polished, social-media-native

VIDEO STRUCTURE:
SCENE 1 – HOOK (2–3s): Person holding phone selfie-style, immediate attention grab
SCENE 2 – EXPERIENCE (4–7s): Person talks about product naturally, real-life environment
SCENE 3 – CTA (2–4s): Soft call-to-action, looks like advice not ad

${modelModifier}

Aspect ratio: 9:16 vertical
Duration: 8-15 seconds`;

  return prompt;
}

export const ugcAdRouter = router({
  // Senaryo ve seçenekleri getir
  getOptions: protectedProcedure.query(() => {
    return {
      scenarios: Object.entries(UGC_SCENARIOS).map(([id, data]) => ({
        id,
        name: data.name,
        nameTr: data.nameTr,
        description: data.description,
      })),
      tones: Object.entries(TONES).map(([id, data]) => ({
        id,
        name: data.name,
        nameTr: data.nameTr,
        description: data.description,
      })),
      languages: Object.entries(LANGUAGES).map(([id, data]) => ({
        id,
        name: data.name,
        code: data.code,
      })),
      models: Object.entries(VIDEO_MODELS).map(([id, data]) => ({
        id,
        name: data.name,
        description: data.description,
        credits: data.credits,
      })),
      genders: [
        { id: "male", name: "Male", nameTr: "Erkek" },
        { id: "female", name: "Female", nameTr: "Kadın" },
      ],
    };
  }),

  // UGC video oluştur
  create: protectedProcedure
    .input(
      z.object({
        productImageUrl: z.string().optional(),
        productVideoUrl: z.string().optional(),
        videoModel: z.enum(["veo31"]),
        ugcScenario: z.enum(["testimonial", "unboxing", "problem_solution", "first_impression", "lifestyle"]),
        characterGender: z.enum(["male", "female"]),
        language: z.string().default("tr"),
        tone: z.enum(["casual", "excited", "calm", "persuasive"]),
        productName: z.string().optional(),
        keyBenefit: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      // Veritabanı bağlantısı
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });

      // Kredi kontrolü
      const modelConfig = VIDEO_MODELS[input.videoModel];
      const creditsCost = modelConfig.credits;

      const [user] = await db.select().from(users).where(eq(users.id, userId));
      if (!user || user.credits < creditsCost) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Yetersiz kredi. Bu işlem ${creditsCost} kredi gerektiriyor.`,
        });
      }

      // Prompt oluştur
      const prompt = buildUgcPrompt({
        scenario: input.ugcScenario,
        gender: input.characterGender,
        language: input.language,
        tone: input.tone,
        model: input.videoModel,
        productName: input.productName,
        keyBenefit: input.keyBenefit,
      });

      // Video oluşturma isteği gönder (Veo 3.1 Fast)
      const videoResult = await generateVideo({
        prompt,
        imageUrl: input.productImageUrl,
        modelType: "veo3",
        generationType: input.productImageUrl ? "image-to-video" : "text-to-video",
        aspectRatio: "9:16",
        duration: "10",
        quality: "fast", // Veo 3.1 Fast mode
      });

      if (!videoResult.taskId) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Video oluşturma başlatılamadı",
        });
      }

      // Kredi düş
      await db
        .update(users)
        .set({ credits: user.credits - creditsCost })
        .where(eq(users.id, userId));

      // Veritabanına kaydet
      const [newVideo] = await db
        .insert(ugcAdVideos)
        .values({
          userId,
          productImageUrl: input.productImageUrl || null,
          productVideoUrl: input.productVideoUrl || null,
          videoModel: input.videoModel,
          ugcScenario: input.ugcScenario,
          characterGender: input.characterGender,
          language: input.language,
          tone: input.tone,
          productName: input.productName || null,
          keyBenefit: input.keyBenefit || null,
          taskId: videoResult.taskId,
          prompt,
          creditsCost,
          status: "processing",
        })
        .$returningId();

      // Telegram bildirimi
      notifyCreditSpending({
        userName: user.name || user.openId,
        userEmail: null,
        creditsSpent: creditsCost,
        creditsRemaining: user.credits - creditsCost,
        action: `UGC Ad Video (${modelConfig.name})`,
      });

      return {
        id: newVideo.id,
        taskId: videoResult.taskId,
        creditsCost,
        status: "processing",
      };
    }),

  // Video durumunu kontrol et
  getStatus: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const [video] = await db
        .select()
        .from(ugcAdVideos)
        .where(eq(ugcAdVideos.id, input.id));

      if (!video) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Video bulunamadı" });
      }

      if (video.userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Bu videoya erişim yetkiniz yok" });
      }

      // Eğer hala işleniyorsa, API'den durumu kontrol et
      if (video.status === "processing" && video.taskId) {
        const modelType = "veo3"; // UGC Ad sadece Veo 3.1 kullanıyor
        const statusResult = await getVideoStatus(video.taskId, modelType);

        if (statusResult.status === "completed" && statusResult.videoUrl) {
          // Video URL'ini S3'e kaydet
          const response = await fetch(statusResult.videoUrl);
          const videoBuffer = Buffer.from(await response.arrayBuffer());
          const fileKey = `ugc-videos/${video.userId}/${video.id}-${Date.now()}.mp4`;
          const { url: s3Url } = await storagePut(fileKey, videoBuffer, "video/mp4");

          // Veritabanını güncelle
          await db
            .update(ugcAdVideos)
            .set({
              status: "completed",
              generatedVideoUrl: s3Url,
              completedAt: new Date(),
            })
            .where(eq(ugcAdVideos.id, video.id));

          return {
            ...video,
            status: "completed" as const,
            generatedVideoUrl: s3Url,
          };
        } else if (statusResult.status === "failed") {
          // Hata durumunu kaydet
          await db
            .update(ugcAdVideos)
            .set({
              status: "failed",
              errorMessage: statusResult.error || "Video oluşturma başarısız",
            })
            .where(eq(ugcAdVideos.id, video.id));

          // Hata bildirimi
          notifyGenerationFailure({
            generationType: "video",
            errorMessage: statusResult.error || "Unknown error",
            userId: video.userId,
          });

          return {
            ...video,
            status: "failed" as const,
            errorMessage: statusResult.error,
          };
        }
      }

      return video;
    }),

  // Kullanıcının videolarını listele
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    const videos = await db
      .select()
      .from(ugcAdVideos)
      .where(eq(ugcAdVideos.userId, ctx.user.id))
      .orderBy(desc(ugcAdVideos.createdAt))
      .limit(50);

    return videos;
  }),

  // Video silme
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const [video] = await db
        .select()
        .from(ugcAdVideos)
        .where(eq(ugcAdVideos.id, input.id));

      if (!video) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Video bulunamadı" });
      }

      if (video.userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Bu videoyu silme yetkiniz yok" });
      }

      await db.delete(ugcAdVideos).where(eq(ugcAdVideos.id, input.id));

      return { success: true };
    }),
});
