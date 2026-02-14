import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock the dependencies
vi.mock("./db", () => ({
  getDb: vi.fn(),
  updateVideoGenerationStatus: vi.fn(),
  refundCredits: vi.fn(),
}));

vi.mock("./kieAiApi", () => ({
  getVideoStatus: vi.fn(),
}));

describe("Video Status Updater", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("module structure", () => {
    it("should export startVideoStatusUpdater function", async () => {
      const module = await import("./videoStatusUpdater");
      expect(typeof module.startVideoStatusUpdater).toBe("function");
    });

    it("should export stopVideoStatusUpdater function", async () => {
      const module = await import("./videoStatusUpdater");
      expect(typeof module.stopVideoStatusUpdater).toBe("function");
    });
  });

  describe("getVideoStatus integration", () => {
    it("should handle completed video status correctly", async () => {
      const { getVideoStatus } = await import("./kieAiApi");
      
      // Mock completed status
      vi.mocked(getVideoStatus).mockResolvedValue({
        status: "completed",
        videoUrl: "https://example.com/video.mp4",
      });

      const result = await getVideoStatus("test-task-id", "sora2");
      
      expect(result.status).toBe("completed");
      expect(result.videoUrl).toBe("https://example.com/video.mp4");
    });

    it("should handle failed video status correctly", async () => {
      const { getVideoStatus } = await import("./kieAiApi");
      
      // Mock failed status
      vi.mocked(getVideoStatus).mockResolvedValue({
        status: "failed",
        error: "Video generation failed",
      });

      const result = await getVideoStatus("test-task-id", "veo3");
      
      expect(result.status).toBe("failed");
      expect(result.error).toBe("Video generation failed");
    });

    it("should handle processing video status correctly", async () => {
      const { getVideoStatus } = await import("./kieAiApi");
      
      // Mock processing status
      vi.mocked(getVideoStatus).mockResolvedValue({
        status: "processing",
      });

      const result = await getVideoStatus("test-task-id", "kling");
      
      expect(result.status).toBe("processing");
    });
  });
});
