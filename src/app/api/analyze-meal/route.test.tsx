/**
 * Tests for the meal analysis API endpoint.
 * These tests verify the OpenAI integration functionality.
 *
 * @author Nolan Witt
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("~/server/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("openai", () => {
  const createMock = vi.fn();
  const sharedClient = { chat: { completions: { create: createMock } } };
  return {
    default: vi.fn().mockImplementation(() => sharedClient),
    __esModule: true,
    __createMock: createMock,
  };
});

import { GET, POST } from "./route";
import { auth } from "~/server/auth";

const mockAuth = auth as any;

const getMockOpenAI = async () => {
  const mod: any = await import("openai");
  return mod.__createMock as jest.MockedFunction<any> | any;
};

describe("/api/analyze-meal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET", () => {
    it("should return health check status", async () => {
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe("ok");
      expect(data.message).toBe("Meal analysis API is running");
      expect(data.timestamp).toBeDefined();
    });
  });

  describe("POST", () => {
    it("should return 401 for unauthenticated requests", async () => {
      mockAuth.mockResolvedValue(null);

      const request = new Request("http://localhost/api/analyze-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: "test-image-data" }),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Authentication required");
    });

    it("should return 400 for invalid request data", async () => {
      mockAuth.mockResolvedValue({ user: { id: "test-user" } });

      const request = new Request("http://localhost/api/analyze-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Image data is required");
    });

    it("should return 200 and parsed analysis on successful OpenAI response", async () => {
      mockAuth.mockResolvedValue({ user: { id: "u1" } });

      const create = await getMockOpenAI();
      const analysis = {
        ingredients: ["rice", "chicken"],
        nutrition: {
          calories: 500,
          protein: "30g",
          carbs: "50g",
          fat: "10g",
          fiber: "2g",
        },
        allergens: ["Peanut sauce"],
        dietary_tags: ["gluten-free"],
        healthScore: 7,
        alternatives: ["grilled chicken"],
        portion_analysis: "moderate",
        confidence: 0.9,
        warnings: [],
        delivery_recommendation: "Pack separately; avoid sogginess.",
        delivery_options: [
          { platform: "UberEats", eta_minutes: 20, cost_estimate: "$8-12" },
        ],
      };

      create.mockResolvedValue({
        choices: [{ message: { content: JSON.stringify(analysis) } }],
      });

      const request = new Request("http://localhost/api/analyze-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: "ok", userPreferences: {} }),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.analysis).toBeDefined();
      expect(data.analysis.ingredients).toEqual(
        expect.arrayContaining(["rice", "chicken"]),
      );
      expect(data.analysis.nutrition.calories).toBe(500);
      expect(Array.isArray(data.analysis.delivery_options)).toBe(true);
    });

    it("should return 500 when OpenAI returns no content", async () => {
      mockAuth.mockResolvedValue({ user: { id: "u1" } });
      const create = await getMockOpenAI();

      create.mockResolvedValue({
        choices: [{ message: {} }],
      });

      const request = new Request("http://localhost/api/analyze-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: "ok" }),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toMatch(/No response from OpenAI/i);
    });

    it("should return 500 when OpenAI returns unparsable content", async () => {
      mockAuth.mockResolvedValue({ user: { id: "u1" } });
      const create = await getMockOpenAI();

      create.mockResolvedValue({
        choices: [{ message: { content: "I am not JSON" } }],
      });

      const request = new Request("http://localhost/api/analyze-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: "ok" }),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toMatch(/Invalid response format from AI/i);
    });

    it("should return 429 when OpenAI reports insufficient_quota", async () => {
      mockAuth.mockResolvedValue({ user: { id: "u1" } });
      const create = await getMockOpenAI();

      const err: any = new Error("quota");
      err.code = "insufficient_quota";
      create.mockRejectedValue(err);

      const request = new Request("http://localhost/api/analyze-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: "ok" }),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.error).toMatch(/quota exceeded/i);
    });

    it("should add allergen warning when user preferences match detected allergens", async () => {
      mockAuth.mockResolvedValue({ user: { id: "u1" } });
      const create = await getMockOpenAI();

      const analysis = {
        ingredients: ["sauce", "noodles"],
        nutrition: { calories: 400, protein: "10g", carbs: "60g", fat: "8g" },
        allergens: ["Peanut sauce"],
        dietary_tags: [],
        healthScore: 5,
        alternatives: [],
        portion_analysis: "large",
        confidence: 0.8,
      };

      create.mockResolvedValue({
        choices: [{ message: { content: JSON.stringify(analysis) } }],
      });

      const request = new Request("http://localhost/api/analyze-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: "ok",
          userPreferences: { allergies: ["peanut"] },
        }),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.analysis.warnings).toBeDefined();
      expect(
        data.analysis.warnings.some((w: string) => /ALLERGEN ALERT/i.test(w)),
      ).toBe(true);
    });
  });
});
