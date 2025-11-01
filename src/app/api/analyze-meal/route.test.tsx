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

    // ==================== NEW TEST COVERAGE ====================

    // ========== NETWORK & API ERROR HANDLING ==========
    it("should return 500 for OpenAI rate limit error (429)", async () => {
      mockAuth.mockResolvedValue({ user: { id: "u1" } });
      const create = await getMockOpenAI();

      const err: any = new Error("Rate limit exceeded");
      err.code = "rate_limit_exceeded";
      err.status = 429;
      create.mockRejectedValue(err);

      const request = new Request("http://localhost/api/analyze-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: "test-data" }),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBeDefined();
    });

    it("should handle connection timeout from OpenAI", async () => {
      mockAuth.mockResolvedValue({ user: { id: "u1" } });
      const create = await getMockOpenAI();

      const err = new Error("Connection timeout");
      (err as any).code = "ETIMEDOUT";
      create.mockRejectedValue(err);

      const request = new Request("http://localhost/api/analyze-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: "test-data" }),
      });

      const response = await POST(request as any);
      expect(response.status).toBe(500);
    });

    it("should handle DNS resolution failure", async () => {
      mockAuth.mockResolvedValue({ user: { id: "u1" } });
      const create = await getMockOpenAI();

      const err = new Error("getaddrinfo ENOTFOUND api.openai.com");
      (err as any).code = "ENOTFOUND";
      create.mockRejectedValue(err);

      const request = new Request("http://localhost/api/analyze-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: "test-data" }),
      });

      const response = await POST(request as any);
      expect(response.status).toBe(500);
    });

    it("should handle connection refused error", async () => {
      mockAuth.mockResolvedValue({ user: { id: "u1" } });
      const create = await getMockOpenAI();

      const err = new Error("Connection refused");
      (err as any).code = "ECONNREFUSED";
      create.mockRejectedValue(err);

      const request = new Request("http://localhost/api/analyze-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: "test-data" }),
      });

      const response = await POST(request as any);
      expect(response.status).toBe(500);
    });

    it("should handle server error response (500) from OpenAI", async () => {
      mockAuth.mockResolvedValue({ user: { id: "u1" } });
      const create = await getMockOpenAI();

      const err: any = new Error("Internal Server Error");
      err.status = 500;
      err.code = "server_error";
      create.mockRejectedValue(err);

      const request = new Request("http://localhost/api/analyze-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: "test-data" }),
      });

      const response = await POST(request as any);
      expect(response.status).toBe(500);
    });

    it("should handle service unavailable error (503) from OpenAI", async () => {
      mockAuth.mockResolvedValue({ user: { id: "u1" } });
      const create = await getMockOpenAI();

      const err: any = new Error("Service Unavailable");
      err.status = 503;
      err.code = "service_unavailable";
      create.mockRejectedValue(err);

      const request = new Request("http://localhost/api/analyze-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: "test-data" }),
      });

      const response = await POST(request as any);
      expect(response.status).toBe(500);
    });

    it("should handle invalid API key error (401) from OpenAI", async () => {
      mockAuth.mockResolvedValue({ user: { id: "u1" } });
      const create = await getMockOpenAI();

      const err: any = new Error("Invalid API Key");
      err.status = 401;
      err.code = "invalid_api_key";
      create.mockRejectedValue(err);

      const request = new Request("http://localhost/api/analyze-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: "test-data" }),
      });

      const response = await POST(request as any);
      expect(response.status).toBe(500);
    });

    // ========== INPUT EDGE CASES ==========
    it("should handle empty imageBase64 string", async () => {
      mockAuth.mockResolvedValue({ user: { id: "u1" } });

      const request = new Request("http://localhost/api/analyze-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: "" }),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Image data is required");
    });

    it("should handle null imageBase64", async () => {
      mockAuth.mockResolvedValue({ user: { id: "u1" } });

      const request = new Request("http://localhost/api/analyze-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: null }),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(400);
    });

    it("should handle undefined imageBase64", async () => {
      mockAuth.mockResolvedValue({ user: { id: "u1" } });

      const request = new Request("http://localhost/api/analyze-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userPreferences: {} }),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(400);
    });

    it("should handle malformed JSON in request body", async () => {
      mockAuth.mockResolvedValue({ user: { id: "u1" } });

      const request = new Request("http://localhost/api/analyze-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{ invalid json }",
      });

      const response = await POST(request as any);
      expect(response.status).toBe(500);
    });

    it("should handle very large imageBase64 string", async () => {
      mockAuth.mockResolvedValue({ user: { id: "u1" } });
      const create = await getMockOpenAI();

      // Simulate a very large base64 string
      const largeImage = "a".repeat(100000);

      const analysis = {
        ingredients: ["item"],
        nutrition: { calories: 100, protein: "5g", carbs: "20g", fat: "2g" },
        allergens: [],
        dietary_tags: [],
        healthScore: 5,
        alternatives: [],
        portion_analysis: "small",
        confidence: 0.5,
      };

      create.mockResolvedValue({
        choices: [{ message: { content: JSON.stringify(analysis) } }],
      });

      const request = new Request("http://localhost/api/analyze-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: largeImage }),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.analysis).toBeDefined();
    });

    it("should handle userPreferences as null", async () => {
      mockAuth.mockResolvedValue({ user: { id: "u1" } });
      const create = await getMockOpenAI();

      const analysis = {
        ingredients: ["rice"],
        nutrition: { calories: 300, protein: "10g", carbs: "60g", fat: "3g" },
        allergens: [],
        dietary_tags: [],
        healthScore: 6,
        alternatives: [],
        portion_analysis: "moderate",
        confidence: 0.8,
      };

      create.mockResolvedValue({
        choices: [{ message: { content: JSON.stringify(analysis) } }],
      });

      const request = new Request("http://localhost/api/analyze-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: "data", userPreferences: null }),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(200);
    });

    // ========== OUTPUT VALIDATION & RESPONSE STRUCTURE ==========
    it("should always include timestamp in response", async () => {
      mockAuth.mockResolvedValue({ user: { id: "u1" } });
      const create = await getMockOpenAI();

      const analysis = {
        ingredients: ["chicken"],
        nutrition: { calories: 250, protein: "30g", carbs: "5g", fat: "10g" },
        allergens: [],
        dietary_tags: [],
        healthScore: 7,
        alternatives: [],
        portion_analysis: "small",
        confidence: 0.9,
      };

      create.mockResolvedValue({
        choices: [{ message: { content: JSON.stringify(analysis) } }],
      });

      const request = new Request("http://localhost/api/analyze-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: "data" }),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(data.timestamp).toBeDefined();
      expect(typeof data.timestamp).toBe("string");
      expect(new Date(data.timestamp).getTime()).toBeGreaterThan(0);
    });

    it("should ensure analysis contains all required fields", async () => {
      mockAuth.mockResolvedValue({ user: { id: "u1" } });
      const create = await getMockOpenAI();

      const analysis = {
        ingredients: ["pasta", "tomato"],
        nutrition: { calories: 450, protein: "15g", carbs: "70g", fat: "8g" },
        allergens: ["gluten"],
        dietary_tags: [],
        healthScore: 6,
        alternatives: ["whole wheat pasta"],
        portion_analysis: "standard",
        confidence: 0.85,
      };

      create.mockResolvedValue({
        choices: [{ message: { content: JSON.stringify(analysis) } }],
      });

      const request = new Request("http://localhost/api/analyze-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: "data" }),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(data.analysis).toBeDefined();
      expect(data.analysis.ingredients).toBeDefined();
      expect(Array.isArray(data.analysis.ingredients)).toBe(true);
      expect(data.analysis.nutrition).toBeDefined();
      expect(data.analysis.nutrition.calories).toBeDefined();
      expect(data.analysis.healthScore).toBeDefined();
      expect(data.analysis.allergens).toBeDefined();
    });

    it("should handle missing optional fields in GPT response", async () => {
      mockAuth.mockResolvedValue({ user: { id: "u1" } });
      const create = await getMockOpenAI();

      const analysis = {
        ingredients: ["burger"],
        nutrition: { calories: 600, protein: "20g", carbs: "50g", fat: "25g" },
        allergens: [],
        dietary_tags: [],
        healthScore: 4,
        alternatives: [],
        portion_analysis: "large",
        confidence: 0.7,
        // Missing warnings, delivery_recommendation, delivery_options
      };

      create.mockResolvedValue({
        choices: [{ message: { content: JSON.stringify(analysis) } }],
      });

      const request = new Request("http://localhost/api/analyze-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: "data" }),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.analysis.delivery_recommendation).toBe("");
      expect(Array.isArray(data.analysis.delivery_options)).toBe(true);
    });

    it("should validate healthScore is within valid range (1-10)", async () => {
      mockAuth.mockResolvedValue({ user: { id: "u1" } });
      const create = await getMockOpenAI();

      const analysis = {
        ingredients: ["salad"],
        nutrition: { calories: 150, protein: "8g", carbs: "20g", fat: "5g" },
        allergens: [],
        dietary_tags: ["vegan"],
        healthScore: 9,
        alternatives: [],
        portion_analysis: "small",
        confidence: 0.95,
      };

      create.mockResolvedValue({
        choices: [{ message: { content: JSON.stringify(analysis) } }],
      });

      const request = new Request("http://localhost/api/analyze-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: "data" }),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.analysis.healthScore).toBeGreaterThanOrEqual(1);
      expect(data.analysis.healthScore).toBeLessThanOrEqual(10);
    });

    it("should ensure confidence is a valid number between 0 and 1", async () => {
      mockAuth.mockResolvedValue({ user: { id: "u1" } });
      const create = await getMockOpenAI();

      const analysis = {
        ingredients: ["item"],
        nutrition: { calories: 200, protein: "10g", carbs: "30g", fat: "5g" },
        allergens: [],
        dietary_tags: [],
        healthScore: 5,
        alternatives: [],
        portion_analysis: "medium",
        confidence: 0.75,
      };

      create.mockResolvedValue({
        choices: [{ message: { content: JSON.stringify(analysis) } }],
      });

      const request = new Request("http://localhost/api/analyze-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: "data" }),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(typeof data.analysis.confidence).toBe("number");
      expect(data.analysis.confidence).toBeGreaterThanOrEqual(0);
      expect(data.analysis.confidence).toBeLessThanOrEqual(1);
    });

    it("should validate nutrition data structure", async () => {
      mockAuth.mockResolvedValue({ user: { id: "u1" } });
      const create = await getMockOpenAI();

      const analysis = {
        ingredients: ["pasta"],
        nutrition: {
          calories: 400,
          protein: "12g",
          carbs: "75g",
          fat: "8g",
          fiber: "3g",
        },
        allergens: ["gluten"],
        dietary_tags: [],
        healthScore: 5,
        alternatives: [],
        portion_analysis: "medium",
        confidence: 0.8,
      };

      create.mockResolvedValue({
        choices: [{ message: { content: JSON.stringify(analysis) } }],
      });

      const request = new Request("http://localhost/api/analyze-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: "data" }),
      });

      const response = await POST(request as any);
      const data = await response.json();

      const nutrition = data.analysis.nutrition;
      expect(typeof nutrition.calories).toBe("number");
      expect(typeof nutrition.protein).toBe("string");
      expect(typeof nutrition.carbs).toBe("string");
      expect(typeof nutrition.fat).toBe("string");
    });

    // ========== INCOMPLETE/INVALID ANALYSIS RESPONSE ==========
    it("should reject analysis missing ingredients", async () => {
      mockAuth.mockResolvedValue({ user: { id: "u1" } });
      const create = await getMockOpenAI();

      const incompleteAnalysis = {
        // Missing ingredients
        nutrition: { calories: 300, protein: "10g", carbs: "50g", fat: "5g" },
        allergens: [],
        dietary_tags: [],
        healthScore: 5,
        alternatives: [],
        portion_analysis: "medium",
        confidence: 0.7,
      };

      create.mockResolvedValue({
        choices: [
          { message: { content: JSON.stringify(incompleteAnalysis) } },
        ],
      });

      const request = new Request("http://localhost/api/analyze-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: "data" }),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toMatch(/Incomplete analysis/i);
    });

    it("should reject analysis missing nutrition data", async () => {
      mockAuth.mockResolvedValue({ user: { id: "u1" } });
      const create = await getMockOpenAI();

      const incompleteAnalysis = {
        ingredients: ["item"],
        // Missing nutrition
        allergens: [],
        dietary_tags: [],
        healthScore: 5,
        alternatives: [],
        portion_analysis: "medium",
        confidence: 0.7,
      };

      create.mockResolvedValue({
        choices: [
          { message: { content: JSON.stringify(incompleteAnalysis) } },
        ],
      });

      const request = new Request("http://localhost/api/analyze-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: "data" }),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(500);
    });

    it("should reject analysis missing healthScore", async () => {
      mockAuth.mockResolvedValue({ user: { id: "u1" } });
      const create = await getMockOpenAI();

      const incompleteAnalysis = {
        ingredients: ["item"],
        nutrition: { calories: 300, protein: "10g", carbs: "50g", fat: "5g" },
        allergens: [],
        dietary_tags: [],
        // Missing healthScore
        alternatives: [],
        portion_analysis: "medium",
        confidence: 0.7,
      };

      create.mockResolvedValue({
        choices: [
          { message: { content: JSON.stringify(incompleteAnalysis) } },
        ],
      });

      const request = new Request("http://localhost/api/analyze-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: "data" }),
      });

      const response = await POST(request as any);
      expect(response.status).toBe(500);
    });

    // ========== MALFORMED GPT RESPONSE HANDLING ==========
    it("should handle GPT response with JSON in markdown code block", async () => {
      mockAuth.mockResolvedValue({ user: { id: "u1" } });
      const create = await getMockOpenAI();

      const markdownJson = `
\`\`\`json
{
  "ingredients": ["item"],
  "nutrition": { "calories": 200, "protein": "10g", "carbs": "30g", "fat": "5g" },
  "allergens": [],
  "dietary_tags": [],
  "healthScore": 5,
  "alternatives": [],
  "portion_analysis": "medium",
  "confidence": 0.8
}
\`\`\`
      `;

      create.mockResolvedValue({
        choices: [{ message: { content: markdownJson } }],
      });

      const request = new Request("http://localhost/api/analyze-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: "data" }),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(200);
    });

    it("should handle GPT response with extra text before JSON", async () => {
      mockAuth.mockResolvedValue({ user: { id: "u1" } });
      const create = await getMockOpenAI();

      const textWithJson = `
Here's the analysis:
{
  "ingredients": ["chicken", "rice"],
  "nutrition": { "calories": 400, "protein": "25g", "carbs": "50g", "fat": "10g" },
  "allergens": [],
  "dietary_tags": [],
  "healthScore": 7,
  "alternatives": [],
  "portion_analysis": "medium",
  "confidence": 0.85
}
      `;

      create.mockResolvedValue({
        choices: [{ message: { content: textWithJson } }],
      });

      const request = new Request("http://localhost/api/analyze-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: "data" }),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.analysis.ingredients).toContain("chicken");
    });

    // ========== ALLERGEN MATCHING ==========
    it("should handle case-insensitive allergen matching", async () => {
      mockAuth.mockResolvedValue({ user: { id: "u1" } });
      const create = await getMockOpenAI();

      const analysis = {
        ingredients: ["peanut oil", "noodles"],
        nutrition: { calories: 350, protein: "12g", carbs: "60g", fat: "8g" },
        allergens: ["PEANUT"],
        dietary_tags: [],
        healthScore: 5,
        alternatives: [],
        portion_analysis: "medium",
        confidence: 0.8,
      };

      create.mockResolvedValue({
        choices: [{ message: { content: JSON.stringify(analysis) } }],
      });

      const request = new Request("http://localhost/api/analyze-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: "data",
          userPreferences: { allergies: ["peanut"] },
        }),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(
        data.analysis.warnings.some((w: string) => /ALLERGEN ALERT/i.test(w)),
      ).toBe(true);
    });

    it("should handle multiple user allergies with multiple detected allergens", async () => {
      mockAuth.mockResolvedValue({ user: { id: "u1" } });
      const create = await getMockOpenAI();

      const analysis = {
        ingredients: ["nuts", "shellfish", "milk"],
        nutrition: { calories: 500, protein: "15g", carbs: "40g", fat: "20g" },
        allergens: ["Walnut", "Shrimp", "Dairy"],
        dietary_tags: [],
        healthScore: 4,
        alternatives: [],
        portion_analysis: "large",
        confidence: 0.9,
      };

      create.mockResolvedValue({
        choices: [{ message: { content: JSON.stringify(analysis) } }],
      });

      const request = new Request("http://localhost/api/analyze-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: "data",
          userPreferences: { allergies: ["walnut", "shellfish", "milk"] },
        }),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.analysis.warnings).toBeDefined();
      expect(data.analysis.warnings.length).toBeGreaterThan(0);
    });

    it("should not add allergen warning when no matching allergies", async () => {
      mockAuth.mockResolvedValue({ user: { id: "u1" } });
      const create = await getMockOpenAI();

      const analysis = {
        ingredients: ["rice", "chicken"],
        nutrition: { calories: 400, protein: "20g", carbs: "50g", fat: "8g" },
        allergens: ["None detected"],
        dietary_tags: [],
        healthScore: 7,
        alternatives: [],
        portion_analysis: "medium",
        confidence: 0.85,
      };

      create.mockResolvedValue({
        choices: [{ message: { content: JSON.stringify(analysis) } }],
      });

      const request = new Request("http://localhost/api/analyze-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: "data",
          userPreferences: { allergies: ["peanut", "shellfish"] },
        }),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      const allergenWarnings = data.analysis.warnings?.filter((w: string) =>
        /ALLERGEN ALERT/i.test(w),
      );
      expect(allergenWarnings?.length || 0).toBe(0);
    });

    // ========== RESPONSE ARRAYS VALIDATION ==========
    it("should ensure ingredients array is not empty", async () => {
      mockAuth.mockResolvedValue({ user: { id: "u1" } });
      const create = await getMockOpenAI();

      const analysis = {
        ingredients: ["egg", "bread", "butter"],
        nutrition: { calories: 300, protein: "12g", carbs: "45g", fat: "10g" },
        allergens: [],
        dietary_tags: [],
        healthScore: 6,
        alternatives: [],
        portion_analysis: "medium",
        confidence: 0.8,
      };

      create.mockResolvedValue({
        choices: [{ message: { content: JSON.stringify(analysis) } }],
      });

      const request = new Request("http://localhost/api/analyze-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: "data" }),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(Array.isArray(data.analysis.ingredients)).toBe(true);
      expect(data.analysis.ingredients.length).toBeGreaterThan(0);
    });

    it("should handle delivery_options as array", async () => {
      mockAuth.mockResolvedValue({ user: { id: "u1" } });
      const create = await getMockOpenAI();

      const analysis = {
        ingredients: ["burger"],
        nutrition: { calories: 600, protein: "25g", carbs: "50g", fat: "20g" },
        allergens: [],
        dietary_tags: [],
        healthScore: 5,
        alternatives: [],
        portion_analysis: "large",
        confidence: 0.8,
        delivery_options: [
          { platform: "UberEats", eta_minutes: 25, cost_estimate: "$10-15" },
          { platform: "DoorDash", eta_minutes: 20, cost_estimate: "$9-14" },
          { platform: "Grubhub", eta_minutes: 30, cost_estimate: "$11-16" },
        ],
      };

      create.mockResolvedValue({
        choices: [{ message: { content: JSON.stringify(analysis) } }],
      });

      const request = new Request("http://localhost/api/analyze-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: "data" }),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(Array.isArray(data.analysis.delivery_options)).toBe(true);
      expect(data.analysis.delivery_options.length).toBeGreaterThanOrEqual(0);
    });
  });
});
