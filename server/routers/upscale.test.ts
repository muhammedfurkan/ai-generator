import { describe, it, expect } from "vitest";
import { calculateUpscaleCreditCost, UPSCALE_PRICING } from "../kieAiApi";

describe("Upscale Feature", () => {
  describe("UPSCALE_PRICING", () => {
    it("should have pricing for all upscale factors", () => {
      expect(UPSCALE_PRICING).toHaveProperty("1");
      expect(UPSCALE_PRICING).toHaveProperty("2");
      expect(UPSCALE_PRICING).toHaveProperty("4");
      expect(UPSCALE_PRICING).toHaveProperty("8");
    });

    it("should have correct credit values", () => {
      expect(UPSCALE_PRICING["1"]).toBe(15);
      expect(UPSCALE_PRICING["2"]).toBe(15);
      expect(UPSCALE_PRICING["4"]).toBe(30);
      expect(UPSCALE_PRICING["8"]).toBe(60);
    });
  });

  describe("calculateUpscaleCreditCost", () => {
    it("should return correct cost for 1x upscale", () => {
      expect(calculateUpscaleCreditCost("1")).toBe(15);
    });

    it("should return correct cost for 2x upscale", () => {
      expect(calculateUpscaleCreditCost("2")).toBe(15);
    });

    it("should return correct cost for 4x upscale", () => {
      expect(calculateUpscaleCreditCost("4")).toBe(30);
    });

    it("should return correct cost for 8x upscale", () => {
      expect(calculateUpscaleCreditCost("8")).toBe(60);
    });

    it("should return default cost for unknown factor", () => {
      // @ts-ignore - testing invalid input
      expect(calculateUpscaleCreditCost("16")).toBe(15);
    });
  });

  describe("Upscale pricing logic", () => {
    it("should have higher cost for higher resolution", () => {
      expect(UPSCALE_PRICING["4"]).toBeGreaterThan(UPSCALE_PRICING["2"]);
      expect(UPSCALE_PRICING["8"]).toBeGreaterThan(UPSCALE_PRICING["4"]);
    });

    it("should have 1x and 2x at same price (quality enhancement)", () => {
      expect(UPSCALE_PRICING["1"]).toBe(UPSCALE_PRICING["2"]);
    });

    it("should have 8x at double the price of 4x", () => {
      expect(UPSCALE_PRICING["8"]).toBe(UPSCALE_PRICING["4"] * 2);
    });
  });
});
