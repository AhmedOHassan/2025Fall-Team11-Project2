/**
 * SnapMeal AI - Meal analysis API endpoint using OpenAI vision model
 * Copyright (C) 2025 Team11-Project2
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 * API route for analyzing meal images using OpenAI vision model.
 * This endpoint accepts image data and user preferences to provide
 * nutritional insights, allergen warnings, healthier alternatives, and delivery recommendations.
 * Also, this file handles all API endpoints for /api/analyze-meal (GET, POST, PUT, DELETE, etc.)
 *
 * @author Nolan Witt
 * @author Ahmed Hassan
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface MealAnalysisResult {
  ingredients: string[];
  nutrition: {
    calories: number;
    protein: string;
    carbs: string;
    fat: string;
    fiber?: string;
  };
  allergens: string[];
  dietary_tags: string[];
  healthScore: number;
  alternatives: string[];
  portion_analysis: string;
  confidence: number;
  warnings?: string[];
  delivery_recommendation?: string;
  delivery_options?: {
    platform: string;
    eta_minutes?: number;
    cost_estimate?: string;
  }[];
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Meal analysis API is running",
    timestamp: new Date().toISOString(),
  });
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const body = await req.json();
    const { imageBase64, userPreferences } = body;

    if (!imageBase64) {
      return NextResponse.json(
        { error: "Image data is required" },
        { status: 400 },
      );
    }

    const analysisPrompt = `Analyze this food image and provide a comprehensive nutritional analysis. Return the response as a valid JSON object with the following structure:

{
  "ingredients": ["ingredient1", "ingredient2"],
  "nutrition": {
    "calories": number,
    "protein": "Xg",
    "carbs": "Xg", 
    "fat": "Xg",
    "fiber": "Xg"
  },
  "allergens": ["allergen1", "allergen2"],
  "dietary_tags": ["vegetarian", "gluten-free"],
  "healthScore": number (1-10),
  "alternatives": ["suggestion1", "suggestion2"],
  "portion_analysis": "description of portion size",
  "confidence": number (0.0-1.0),
  "warnings": ["warning1", "warning2"],
  "delivery_recommendation": "One-paragraph recommendation for delivery (e.g., best packaging, tip for reheating, whether pickup is preferable, healthy ordering choice)",
  "delivery_options": [
    { "platform": "UberEats", "eta_minutes": 25, "cost_estimate": "$8-12" },
    { "platform": "Doordash", "eta_minutes": 20, "cost_estimate": "$7-11" }
  ]
}

User preferences: ${JSON.stringify(userPreferences || {})}

Please provide accurate nutritional estimates, helpful health insights, and a short, actionable delivery recommendation and 1-3 suggested delivery platforms with ETA/cost estimates where possible. If uncertain, return sensible defaults and set confidence accordingly.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: analysisPrompt,
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`,
              },
            },
          ],
        },
      ],
      max_tokens: 1500,
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    console.log("OpenAI response content:", content);

    let analysis: MealAnalysisResult;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : content;
      analysis = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("Failed to parse OpenAI response:", content);
      throw new Error("Invalid response format from AI");
    }

    analysis.delivery_recommendation = analysis.delivery_recommendation || "";
    analysis.delivery_options = analysis.delivery_options || [];

    if (!analysis.ingredients || !analysis.nutrition || !analysis.healthScore) {
      throw new Error("Incomplete analysis from AI");
    }

    if (userPreferences?.allergies?.length) {
      const detectedAllergens = analysis.allergens.filter((allergen) =>
        userPreferences.allergies.some((userAllergen: string) =>
          allergen.toLowerCase().includes(userAllergen.toLowerCase()),
        ),
      );

      if (detectedAllergens.length > 0) {
        analysis.warnings = analysis.warnings || [];
        analysis.warnings.push(
          `⚠️ ALLERGEN ALERT: This meal may contain ${detectedAllergens.join(", ")} which you've marked as allergies.`,
        );
      }
    }

    return NextResponse.json({
      success: true,
      analysis,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Meal analysis error:", error);

    if (error.code === "insufficient_quota") {
      return NextResponse.json(
        { error: "OpenAI API quota exceeded. Please check your billing." },
        { status: 429 },
      );
    }

    return NextResponse.json(
      { error: error.message || "Analysis failed" },
      { status: 500 },
    );
  }
}
