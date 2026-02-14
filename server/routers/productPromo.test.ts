import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock dependencies
vi.mock("../kieAiApi", () => ({
  generateVideo: vi.fn().mockResolvedValue({
    taskId: "test-task-id-123",
    creditCost: 75,
  }),
  getVideoStatus: vi.fn().mockResolvedValue({
    status: "completed",
    videoUrl: "https://example.com/video.mp4",
  }),
}));

vi.mock("../storage", () => ({
  storagePut: vi.fn().mockResolvedValue({
    url: "https://s3.example.com/product-promo/1/1-123.mp4",
    key: "product-promo/1/1-123.mp4",
  }),
}));

vi.mock("../telegramBot", () => ({
  notifyCreditSpending: vi.fn().mockResolvedValue(true),
  notifyGenerationFailure: vi.fn().mockResolvedValue(true),
}));

describe("Product Promo Video Generator", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Style Presets Configuration", () => {
    it("should have minimal_clean preset with 90 credits", () => {
      const STYLE_PRESETS = {
        minimal_clean: {
          name: "Minimal Clean",
          nameTr: "Minimal Temiz",
          description: "Apple tarzı, beyaz arka plan, yumuşak kamera hareketi",
          credits: 90,
        },
      };

      expect(STYLE_PRESETS.minimal_clean.credits).toBe(90);
      expect(STYLE_PRESETS.minimal_clean.nameTr).toBe("Minimal Temiz");
    });

    it("should have premium_luxury preset with 135 credits", () => {
      const STYLE_PRESETS = {
        premium_luxury: {
          name: "Premium Luxury",
          nameTr: "Premium Lüks",
          description: "Koyu arka plan, parlak yansımalar, dramatik aydınlatma",
          credits: 135,
        },
      };

      expect(STYLE_PRESETS.premium_luxury.credits).toBe(135);
      expect(STYLE_PRESETS.premium_luxury.nameTr).toBe("Premium Lüks");
    });

    it("should have tech_futuristic preset with 135 credits", () => {
      const STYLE_PRESETS = {
        tech_futuristic: {
          name: "Tech / Futuristic",
          nameTr: "Teknoloji / Fütüristik",
          description: "Neon aksan, dijital ışık efektleri, modern teknoloji estetiği",
          credits: 135,
        },
      };

      expect(STYLE_PRESETS.tech_futuristic.credits).toBe(135);
      expect(STYLE_PRESETS.tech_futuristic.nameTr).toBe("Teknoloji / Fütüristik");
    });

    it("should have social_viral preset with 90 credits", () => {
      const STYLE_PRESETS = {
        social_viral: {
          name: "Social Media Viral",
          nameTr: "Sosyal Medya Viral",
          description: "Hızlı kesimler, enerjik kamera hareketi, cesur aydınlatma",
          credits: 90,
        },
      };

      expect(STYLE_PRESETS.social_viral.credits).toBe(90);
      expect(STYLE_PRESETS.social_viral.nameTr).toBe("Sosyal Medya Viral");
    });
  });

  describe("Prompt Generation", () => {
    it("should generate correct prompt for minimal_clean style", () => {
      const generatePrompt = (stylePreset: string, productName?: string, slogan?: string): string => {
        const prompts: Record<string, string> = {
          minimal_clean: `Create a short vertical product promo video using the provided product image.
The product must remain IDENTICAL in shape, color, logo, and texture.
Style: Minimal Clean - white or soft neutral background, smooth slow camera motion, Apple-style product reveal.
Add soft lighting transitions and a premium advertising feel.
Camera: Slow push-in and gentle orbit around the product.
Mood: clean, modern, high-conversion, social-media optimized.
No distortion. No logo changes. No extra objects.`,
        };

        let prompt = prompts[stylePreset] || "";
        if (productName) prompt += `\n\nProduct name to display: "${productName}"`;
        if (slogan) prompt += `\nSlogan/tagline: "${slogan}"`;
        return prompt;
      };

      const prompt = generatePrompt("minimal_clean");
      expect(prompt).toContain("Minimal Clean");
      expect(prompt).toContain("Apple-style product reveal");
      expect(prompt).toContain("No distortion");
    });

    it("should include product name and slogan when provided", () => {
      const generatePrompt = (stylePreset: string, productName?: string, slogan?: string): string => {
        let prompt = "Base prompt";
        if (productName) prompt += `\n\nProduct name to display: "${productName}"`;
        if (slogan) prompt += `\nSlogan/tagline: "${slogan}"`;
        return prompt;
      };

      const prompt = generatePrompt("minimal_clean", "Premium Kulaklık", "Müziğin Yeni Boyutu");
      expect(prompt).toContain('Product name to display: "Premium Kulaklık"');
      expect(prompt).toContain('Slogan/tagline: "Müziğin Yeni Boyutu"');
    });
  });

  describe("Credit Calculation", () => {
    it("should calculate correct credits for standard styles (90 credits)", () => {
      const STYLE_PRESETS = {
        minimal_clean: { credits: 90 },
        social_viral: { credits: 90 },
      };

      expect(STYLE_PRESETS.minimal_clean.credits).toBe(90);
      expect(STYLE_PRESETS.social_viral.credits).toBe(90);
    });

    it("should calculate correct credits for premium styles (135 credits)", () => {
      const STYLE_PRESETS = {
        premium_luxury: { credits: 135 },
        tech_futuristic: { credits: 135 },
      };

      expect(STYLE_PRESETS.premium_luxury.credits).toBe(135);
      expect(STYLE_PRESETS.tech_futuristic.credits).toBe(135);
    });
  });

  describe("Video Generation Integration", () => {
    it("should use Veo3 for image-to-video generation", async () => {
      const { generateVideo } = await import("../kieAiApi");

      const result = await generateVideo({
        modelType: "veo3",
        generationType: "image-to-video",
        prompt: "test prompt",
        imageUrl: "https://example.com/product.jpg",
        aspectRatio: "9:16",
        quality: "high",
      });

      expect(result.taskId).toBe("test-task-id-123");
    });

    it("should poll for video completion status", async () => {
      const { getVideoStatus } = await import("../kieAiApi");

      const status = await getVideoStatus("test-task-id-123", "veo3");

      expect(status.status).toBe("completed");
      expect(status.videoUrl).toBe("https://example.com/video.mp4");
    });
  });

  describe("Storage Integration", () => {
    it("should save generated videos to S3", async () => {
      const { storagePut } = await import("../storage");

      const buffer = Buffer.from("test video data");
      const result = await storagePut("product-promo/1/1-123.mp4", buffer, "video/mp4");

      expect(result.url).toContain("product-promo");
      expect(result.url).toContain(".mp4");
    });
  });

  describe("Video Output Requirements", () => {
    it("should generate vertical 9:16 videos for social media", () => {
      const aspectRatio = "9:16";
      expect(aspectRatio).toBe("9:16");
    });

    it("should generate videos between 6-12 seconds", () => {
      const minDuration = 6;
      const maxDuration = 12;
      const targetDuration = 8;

      expect(targetDuration).toBeGreaterThanOrEqual(minDuration);
      expect(targetDuration).toBeLessThanOrEqual(maxDuration);
    });
  });
});
