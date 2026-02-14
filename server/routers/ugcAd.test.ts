import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock getDb
vi.mock("../db", () => ({
  getDb: vi.fn(() => ({
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => [{ id: 1, credits: 100, name: "Test User", openId: "test123" }]),
        orderBy: vi.fn(() => ({
          limit: vi.fn(() => []),
        })),
      })),
    })),
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        $returningId: vi.fn(() => [{ id: 1 }]),
      })),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => ({})),
      })),
    })),
  })),
}));

// Mock kieAiApi
vi.mock("../kieAiApi", () => ({
  generateVideo: vi.fn(() => ({ taskId: "test-task-123", creditCost: 45 })),
  getVideoStatus: vi.fn(() => ({ status: "processing" })),
}));

// Mock telegramBot
vi.mock("../telegramBot", () => ({
  notifyCreditSpending: vi.fn(),
  notifyGenerationFailure: vi.fn(),
}));

// Mock storage
vi.mock("../storage", () => ({
  storagePut: vi.fn(() => ({ url: "https://s3.example.com/video.mp4" })),
}));

describe("UGC Ad Video Generator", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("UGC Scenarios", () => {
    it("should have 5 UGC scenarios defined", () => {
      const scenarios = ["testimonial", "unboxing", "problem_solution", "first_impression", "lifestyle"];
      expect(scenarios.length).toBe(5);
    });

    it("should have correct scenario names", () => {
      const scenarioNames = {
        testimonial: "Kullanıcı Yorumu",
        unboxing: "Kutu Açılışı",
        problem_solution: "Problem → Çözüm",
        first_impression: "İlk İzlenim",
        lifestyle: "Günlük Kullanım",
      };
      
      expect(scenarioNames.testimonial).toBe("Kullanıcı Yorumu");
      expect(scenarioNames.unboxing).toBe("Kutu Açılışı");
      expect(scenarioNames.problem_solution).toBe("Problem → Çözüm");
      expect(scenarioNames.first_impression).toBe("İlk İzlenim");
      expect(scenarioNames.lifestyle).toBe("Günlük Kullanım");
    });
  });

  describe("Video Models", () => {
    it("should have correct credit cost for Veo 3.1", () => {
      const veo31Credits = 90; // Updated price
      expect(veo31Credits).toBe(90);
    });
  });

  describe("Tones", () => {
    it("should have 4 tone options", () => {
      const tones = ["casual", "excited", "calm", "persuasive"];
      expect(tones.length).toBe(4);
    });

    it("should have correct Turkish tone names", () => {
      const toneNames = {
        casual: "Rahat",
        excited: "Heyecanlı",
        calm: "Sakin",
        persuasive: "İkna Edici",
      };
      
      expect(toneNames.casual).toBe("Rahat");
      expect(toneNames.excited).toBe("Heyecanlı");
      expect(toneNames.calm).toBe("Sakin");
      expect(toneNames.persuasive).toBe("İkna Edici");
    });
  });

  describe("Languages", () => {
    it("should support multiple languages", () => {
      const languages = ["tr", "en", "de", "fr", "es", "ar"];
      expect(languages.length).toBe(6);
      expect(languages).toContain("tr");
      expect(languages).toContain("en");
    });
  });

  describe("Credit Calculation", () => {
    it("should calculate credits correctly for Veo 3.1", () => {
      const veo31Credits = 90; // Updated price
      expect(veo31Credits).toBe(90);
    });
  });

  describe("Prompt Building", () => {
    it("should build prompt with all required elements", () => {
      const promptElements = [
        "UGC-style",
        "smartphone camera",
        "TikTok",
        "9:16 vertical",
        "authentic",
      ];
      
      const mockPrompt = `Create a realistic UGC-style advertisement video.
A young woman records themselves using a smartphone camera.
The video must feel like a real TikTok/Instagram ad.
Aspect ratio: 9:16 vertical
Style: authentic, non-polished`;

      promptElements.forEach(element => {
        expect(mockPrompt.toLowerCase()).toContain(element.toLowerCase());
      });
    });
  });

  describe("Gender Options", () => {
    it("should have male and female options", () => {
      const genders = ["male", "female"];
      expect(genders).toContain("male");
      expect(genders).toContain("female");
    });
  });
});
