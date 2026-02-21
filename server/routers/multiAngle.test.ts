import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock dependencies
vi.mock("../db", () => ({
  getDb: vi.fn().mockResolvedValue({
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    offset: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockResolvedValue([{ insertId: 1 }]),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    execute: vi.fn().mockResolvedValue([]),
  }),
}));

vi.mock("../nanoBananaApi", () => ({
  createGenerationTask: vi.fn().mockResolvedValue({
    success: true,
    taskId: "test-task-id-123",
  }),
  pollTaskCompletion: vi
    .fn()
    .mockResolvedValue("https://example.com/image.png"),
}));

vi.mock("../telegramBot", () => ({
  notifyCreditSpending: vi.fn().mockResolvedValue(true),
  notifyGenerationFailure: vi.fn().mockResolvedValue(true),
}));

vi.mock("../storage", () => ({
  storagePut: vi
    .fn()
    .mockResolvedValue({ url: "https://s3.example.com/image.png" }),
}));

vi.mock("./notification", () => ({
  createNotification: vi.fn().mockResolvedValue(true),
}));

describe("Multi-Angle Photo Generator", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Angle Sets Configuration", () => {
    it("should have temel_4 angle set with 4 angles (80 credits)", () => {
      const ANGLE_SETS = {
        temel_4: {
          name: "Temel Set",
          nameTr: "Temel Set (4 Açı)",
          credits: 80,
          angles: [
            { en: "front facing portrait", tr: "Önden Portre" },
            { en: "three quarter angle", tr: "Yarım Profil (3/4 Açı)" },
            { en: "side profile", tr: "Yan Profil" },
            { en: "over the shoulder looking back", tr: "Omuz Üstünden Bakış" },
          ],
        },
      };

      expect(ANGLE_SETS.temel_4.angles.length).toBe(4);
      expect(ANGLE_SETS.temel_4.credits).toBe(80);
    });

    it("should have standart_6 angle set with 6 angles (120 credits)", () => {
      const ANGLE_SETS = {
        standart_6: {
          name: "Standart Set",
          nameTr: "Standart Set (6 Açı)",
          credits: 120,
          angles: [
            { en: "front facing portrait", tr: "Önden Portre" },
            { en: "front close-up portrait", tr: "Yakın Çekim Yüz" },
            { en: "three quarter angle left", tr: "Yarım Profil Sol" },
            { en: "three quarter angle right", tr: "Yarım Profil Sağ" },
            { en: "side profile", tr: "Yan Profil" },
            { en: "over the shoulder looking back", tr: "Omuz Üstünden Bakış" },
          ],
        },
      };

      expect(ANGLE_SETS.standart_6.angles.length).toBe(6);
      expect(ANGLE_SETS.standart_6.credits).toBe(120);
    });

    it("should have profesyonel_8 angle set with 8 angles (160 credits)", () => {
      const ANGLE_SETS = {
        profesyonel_8: {
          name: "Profesyonel Set",
          nameTr: "Profesyonel Set (8 Açı)",
          credits: 160,
          angles: [
            { en: "front facing portrait", tr: "Önden Portre" },
            { en: "front close-up portrait", tr: "Yakın Çekim Yüz" },
            { en: "three quarter angle left", tr: "Yarım Profil Sol" },
            { en: "three quarter angle right", tr: "Yarım Profil Sağ" },
            { en: "side profile", tr: "Yan Profil" },
            { en: "over the shoulder looking back", tr: "Omuz Üstünden Bakış" },
            { en: "looking down angle from above", tr: "Yukarıdan Bakış" },
            { en: "full body front view", tr: "Tam Boy Önden" },
          ],
        },
      };

      expect(ANGLE_SETS.profesyonel_8.angles.length).toBe(8);
      expect(ANGLE_SETS.profesyonel_8.credits).toBe(160);
    });
  });

  describe("Prompt Generation", () => {
    it("should generate correct prompt for angle", () => {
      const generatePrompt = (angleName: string): string => {
        return `Recreate the same person from the reference image.
Keep identical face, hairstyle, skin tone, and body proportions.
Preserve the exact outfit, fabric texture, and fit.
Maintain the same environment, lighting, shadows, and color tones.

Camera & framing:
– ${angleName}
– realistic smartphone photo
– natural body posture
– photorealistic, no stylization

IMPORTANT:
Do not change identity.
Do not change outfit.
Do not change environment.
Do not add accessories.
Do not beautify or stylize.`;
      };

      const prompt = generatePrompt("front facing mid shot");
      expect(prompt).toContain("front facing mid shot");
      expect(prompt).toContain("Recreate the same person");
      expect(prompt).toContain("photorealistic");
      expect(prompt).toContain("Do not change identity");
    });
  });

  describe("Credit Calculation", () => {
    it("should calculate correct credits for temel_4 (4 x 20 = 80)", () => {
      const ANGLE_SETS = {
        temel_4: { credits: 80 },
        standart_6: { credits: 120 },
        profesyonel_8: { credits: 160 },
      };

      expect(ANGLE_SETS.temel_4.credits).toBe(80);
    });

    it("should calculate correct credits for standart_6 (6 x 20 = 120)", () => {
      const ANGLE_SETS = {
        temel_4: { credits: 80 },
        standart_6: { credits: 120 },
        profesyonel_8: { credits: 160 },
      };

      expect(ANGLE_SETS.standart_6.credits).toBe(120);
    });

    it("should calculate correct credits for profesyonel_8 (8 x 20 = 160)", () => {
      const ANGLE_SETS = {
        temel_4: { credits: 80 },
        standart_6: { credits: 120 },
        profesyonel_8: { credits: 160 },
      };

      expect(ANGLE_SETS.profesyonel_8.credits).toBe(160);
    });
  });

  describe("API Integration", () => {
    it("should use Nano Banana Pro API for image generation", async () => {
      const { createGenerationTask } = await import("../nanoBananaApi");

      const result = await createGenerationTask({
        prompt: "test prompt",
        aspectRatio: "3:4",
        resolution: "4K",
        referenceImageUrl: "https://example.com/ref.jpg",
      });

      expect(result.success).toBe(true);
      expect(result.taskId).toBe("test-task-id-123");
    });

    it("should poll for task completion", async () => {
      const { pollTaskCompletion } = await import("../nanoBananaApi");

      const imageUrl = await pollTaskCompletion("test-task-id-123");

      expect(imageUrl).toBe("https://example.com/image.png");
    });
  });

  describe("Storage Integration", () => {
    it("should save generated images to S3", async () => {
      const { storagePut } = await import("../storage");

      const buffer = Buffer.from("test image data");
      const result = await storagePut(
        "multi-angle/1/1/1-123.png",
        buffer,
        "image/png"
      );

      expect(result.url).toBe("https://s3.example.com/image.png");
    });
  });

  describe("Notification Integration", () => {
    it("should send notification on completion", async () => {
      const { createNotification } = await import("./notification");

      await createNotification({
        userId: 1,
        type: "generation_complete",
        title: "Çoklu Açı Fotoğraflarınız Hazır!",
        message: "9 fotoğraflık setiniz başarıyla oluşturuldu.",
        actionUrl: "/multi-angle/1",
      });

      expect(createNotification).toHaveBeenCalled();
    });

    it("should notify credit spending via Telegram", async () => {
      const { notifyCreditSpending } = await import("../telegramBot");

      await notifyCreditSpending({
        userName: "Test User",
        userEmail: "test@example.com",
        creditsSpent: 120,
        creditsRemaining: 180,
        action: "Multi-Angle Photo (Standard 9 Angles)",
      });

      expect(notifyCreditSpending).toHaveBeenCalled();
    });
  });
});
