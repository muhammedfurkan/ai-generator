import { describe, it, expect, vi, beforeEach } from "vitest";
import { VIRAL_APP_TEMPLATES } from "../../shared/const";

describe("viralApps router", () => {
  describe("VIRAL_APP_TEMPLATES", () => {
    it("should have at least 4 templates", () => {
      expect(VIRAL_APP_TEMPLATES.length).toBeGreaterThanOrEqual(4);
    });

    it("should have required fields for each template", () => {
      VIRAL_APP_TEMPLATES.forEach((template) => {
        expect(template).toHaveProperty("id");
        expect(template).toHaveProperty("title");
        expect(template).toHaveProperty("description");
        expect(template).toHaveProperty("prompt");
        expect(template).toHaveProperty("credits");
        expect(template).toHaveProperty("category");
      });
    });

    it("should have unique ids", () => {
      const ids = VIRAL_APP_TEMPLATES.map((t) => t.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should have valid credit values", () => {
      VIRAL_APP_TEMPLATES.forEach((template) => {
        expect(template.credits).toBeGreaterThan(0);
        expect(Number.isInteger(template.credits)).toBe(true);
      });
    });

    it("should have at least one popular template", () => {
      const popularTemplates = VIRAL_APP_TEMPLATES.filter((t) => t.popular);
      expect(popularTemplates.length).toBeGreaterThan(0);
    });

    it("should have non-empty prompts", () => {
      VIRAL_APP_TEMPLATES.forEach((template) => {
        expect(template.prompt.length).toBeGreaterThan(10);
      });
    });
  });

  describe("template categories", () => {
    it("should have valid categories", () => {
      const validCategories = ["Duygusal", "Romantik", "Eğlence", "Dönüşüm", "Sanat", "Sinematik", "Moda"];
      VIRAL_APP_TEMPLATES.forEach((template) => {
        expect(validCategories).toContain(template.category);
      });
    });
  });
});
