/**
 * API route for analyzing meal images using OpenAI vision model.
 * This endpoint accepts image data and user preferences to provide
 * nutritional insights, allergen warnings, and healthier alternatives.
 * 
 * @author SnapMeal AI Team
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Response schema for type safety
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
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Meal analysis API is running",
    timestamp: new Date().toISOString(),
  });
}

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { imageBase64, userPreferences } = body;

    if (!imageBase64) {
      return NextResponse.json(
        { error: "Image data is required" },
        { status: 400 }
      );
    }

    // Construct the analysis prompt
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
  "warnings": ["warning1", "warning2"]
}

User preferences: ${JSON.stringify(userPreferences || {})}

Please provide accurate nutritional estimates and helpful health insights. If you cannot clearly identify the food, indicate this in the confidence score and warnings.`;

    // Call OpenAI API with vision model
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // Using the latest vision model
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: analysisPrompt
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`
              }
            }
          ]
        }
      ],
      max_tokens: 1500,
      temperature: 0.3 // Lower temperature for more consistent results
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    // Parse the JSON response
    let analysis: MealAnalysisResult;
    try {
      // Clean the response in case there's extra text around the JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : content;
      analysis = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("Failed to parse OpenAI response:", content);
      throw new Error("Invalid response format from AI");
    }

    // Validate the response structure
    if (!analysis.ingredients || !analysis.nutrition || !analysis.healthScore) {
      throw new Error("Incomplete analysis from AI");
    }

    // Add user-specific warnings based on preferences
    if (userPreferences?.allergies?.length) {
      const detectedAllergens = analysis.allergens.filter(allergen =>
        userPreferences.allergies.some((userAllergen: string) =>
          allergen.toLowerCase().includes(userAllergen.toLowerCase())
        )
      );
      
      if (detectedAllergens.length > 0) {
        analysis.warnings = analysis.warnings || [];
        analysis.warnings.push(`⚠️ ALLERGEN ALERT: This meal may contain ${detectedAllergens.join(', ')} which you've marked as allergies.`);
      }
    }

    return NextResponse.json({
      success: true,
      analysis,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error("Meal analysis error:", error);
    
    if (error.code === 'insufficient_quota') {
      return NextResponse.json(
        { error: "OpenAI API quota exceeded. Please check your billing." },
        { status: 429 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || "Analysis failed" },
      { status: 500 }
    );
  }
}