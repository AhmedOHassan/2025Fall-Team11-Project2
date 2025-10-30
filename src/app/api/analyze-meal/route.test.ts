/**
 * Tests for the meal analysis API endpoint.
 * These tests verify the OpenAI integration functionality.
 *
 * @author Nolan Witt
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "./route";
import { auth } from "~/server/auth";

vi.mock("~/server/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("openai", () => ({
  default: vi.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: vi.fn(),
      },
    },
  })),
}));

const mockAuth = auth as any;

const getMockOpenAI = () => {
  const OpenAI = vi.mocked(await import("openai")).default;
  const instance = new OpenAI();
  return instance.chat.completions.create as any;
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

      const response = await POST(request);
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

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Image data is required");
    });

    it("should analyze a meal successfully", async () => {
      mockAuth.mockResolvedValue({ user: { id: "test-user" } });

      const mockCreate = await getMockOpenAI();
      mockCreate.mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify({
                ingredients: ["chicken", "broccoli"],
                nutrition: {
                  calories: 350,
                  protein: "30g",
                  carbs: "15g",
                  fat: "18g",
                  fiber: "5g",
                },
                allergens: [],
                dietary_tags: ["gluten-free"],
                healthScore: 8,
                alternatives: ["Add brown rice for more fiber"],
                portion_analysis: "Standard serving",
                confidence: 0.9,
              }),
            },
          },
        ],
      });

      const request = new Request("http://localhost/api/analyze-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: "test-image-data",
          userPreferences: { dietary: ["gluten-free"] },
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.analysis).toBeDefined();
      expect(data.analysis.ingredients).toEqual(["chicken", "broccoli"]);
    });

    it("should handle OpenAI parsing errors", async () => {
      mockAuth.mockResolvedValue({ user: { id: "test-user" } });

      const mockCreate = await getMockOpenAI();
      mockCreate.mockResolvedValue({
        choices: [
          {
            message: {
              content: "This is not valid JSON",
            },
          },
        ],
      });

      const request = new Request("http://localhost/api/analyze-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: "test-image-data",
          userPreferences: {},
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Invalid response format from AI");
    });
  });
});
