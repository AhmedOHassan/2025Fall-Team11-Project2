/**
 * Main SnapMeal AI dashboard page.
 * This page provides the core functionality for uploading meal images,
 * analyzing them with AI, and displaying nutritional insights and recommendations.
 *
 * @author Ahmed Hassan
 * @author Nolan Witt
 */
"use client";

import { useState, useRef } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Alert } from "~/components/ui/alert";
import { Progress } from "~/components/ui/progress";
import { Camera, Upload, AlertTriangle, CheckCircle, Star } from "lucide-react";

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

interface AnalysisResponse {
  success: boolean;
  analysis: MealAnalysisResult;
  timestamp: string;
}

export default function MainPage() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<MealAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result as string;
        resolve(base64.split(",")[1] || "");
      };
      reader.onerror = reject;
    });
  };

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      setSelectedImage(file);
      setError(null);

      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setError("Please select a valid image file (PNG, JPEG, WEBP, or GIF)");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]!);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const analyzeMeal = async () => {
    if (!selectedImage) {
      setError("Please select an image first");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const base64Image = await convertToBase64(selectedImage);

      const response = await fetch("/api/analyze-meal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageBase64: base64Image,
          userPreferences: {
            dietary: [], // TODO: Get from user preferences
            allergies: [], // TODO: Get from user preferences
            goals: ["general-health"], // TODO: Get from user preferences
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Analysis failed");
      }

      const data: AnalysisResponse = await response.json();
      setAnalysis(data.analysis);
    } catch (err) {
      console.error("Analysis error:", err);
      setError(err instanceof Error ? err.message : "Failed to analyze meal");
    } finally {
      setLoading(false);
    }
  };

  const renderHealthScore = (score: number) => {
    const stars = [];
    const fullStars = Math.floor(score / 2);
    const hasHalfStar = score % 2 >= 1;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />,
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <Star key={i} className="h-5 w-5 fill-yellow-200 text-yellow-400" />,
        );
      } else {
        stars.push(<Star key={i} className="h-5 w-5 text-gray-300" />);
      }
    }

    return (
      <div className="flex items-center gap-1">
        {stars}
        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
          {score}/10
        </span>
      </div>
    );
  };

  return (
    <main className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-4xl font-bold text-gray-900 dark:text-white">
          Snap & Analyze
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Upload a photo of your meal to get instant nutritional insights and
          health recommendations
        </p>
      </div>

      {/* Image Upload Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Meal Image
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!imagePreview ? (
            <div
              className="cursor-pointer rounded-lg border-2 border-dashed border-gray-300 p-8 text-center transition-colors hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <p className="mb-2 text-lg font-medium">Upload your meal photo</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Drag and drop an image, or click to browse
              </p>
              <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                Supports PNG, JPEG, WEBP, and GIF files
              </p>
            </div>
          ) : (
            <div className="text-center">
              <img
                src={imagePreview}
                alt="Selected meal"
                className="mx-auto mb-4 max-h-64 max-w-full rounded-lg shadow-md"
              />
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Change Image
                </Button>
                <Button
                  onClick={analyzeMeal}
                  disabled={loading}
                  className="min-w-32"
                >
                  {loading ? "Analyzing..." : "Analyze Meal"}
                </Button>
              </div>
            </div>
          )}

          <Input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileSelect(file);
            }}
            className="hidden"
          />
        </CardContent>
      </Card>

      {/* Loading Progress */}
      {loading && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="text-center">
              <Progress value={33} className="mb-4" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                AI is analyzing your meal... This may take a few moments.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Alert className="mb-6 border-red-200 bg-red-50 dark:bg-red-900/20">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </Alert>
      )}

      {/* Analysis Results */}
      {analysis && (
        <>
          {/* Warnings */}
          {analysis.warnings && analysis.warnings.length > 0 && (
            <Alert className="mb-6 border-orange-200 bg-orange-50 dark:bg-orange-900/20">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <div>
                {analysis.warnings.map((warning, index) => (
                  <p
                    key={index}
                    className="text-orange-800 dark:text-orange-200"
                  >
                    {warning}
                  </p>
                ))}
              </div>
            </Alert>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            {/* Nutrition Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Nutritional Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center text-2xl font-bold">
                  {analysis.nutrition.calories} calories
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Protein:</span>{" "}
                    {analysis.nutrition.protein}
                  </div>
                  <div>
                    <span className="font-medium">Carbs:</span>{" "}
                    {analysis.nutrition.carbs}
                  </div>
                  <div>
                    <span className="font-medium">Fat:</span>{" "}
                    {analysis.nutrition.fat}
                  </div>
                  {analysis.nutrition.fiber && (
                    <div>
                      <span className="font-medium">Fiber:</span>{" "}
                      {analysis.nutrition.fiber}
                    </div>
                  )}
                </div>
                <div className="pt-2">
                  <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                    Health Score:
                  </p>
                  {renderHealthScore(analysis.healthScore)}
                </div>
              </CardContent>
            </Card>

            {/* Ingredients & Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>🧾 Ingredients & Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="mb-2 font-medium">Identified Ingredients:</h4>
                  <div className="flex flex-wrap gap-1">
                    {analysis.ingredients.map((ingredient, index) => (
                      <span
                        key={index}
                        className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      >
                        {ingredient}
                      </span>
                    ))}
                  </div>
                </div>

                {analysis.allergens.length > 0 && (
                  <div>
                    <h4 className="mb-2 font-medium">Potential Allergens:</h4>
                    <div className="flex flex-wrap gap-1">
                      {analysis.allergens.map((allergen, index) => (
                        <span
                          key={index}
                          className="rounded-full bg-red-100 px-2 py-1 text-xs text-red-800 dark:bg-red-900 dark:text-red-200"
                        >
                          {allergen}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {analysis.dietary_tags.length > 0 && (
                  <div>
                    <h4 className="mb-2 font-medium">Dietary Info:</h4>
                    <div className="flex flex-wrap gap-1">
                      {analysis.dietary_tags.map((tag, index) => (
                        <span
                          key={index}
                          className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800 dark:bg-green-900 dark:text-green-200"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {analysis.portion_analysis.length > 0 && (
                  <div>
                    <h4 className="mb-2 font-medium">Portion:</h4>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {analysis.portion_analysis}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Healthier Alternatives */}
          {analysis.alternatives.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>💡 Healthier Alternatives & Suggestions</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.alternatives.map((alternative, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="mt-1 text-green-600 dark:text-green-400">
                        •
                      </span>
                      <span className="text-sm">{alternative}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Delivery Recommendation */}
          {(analysis.delivery_recommendation ||
            (analysis.delivery_options &&
              analysis.delivery_options.length > 0)) && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>🚚 Delivery Recommendation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {analysis.delivery_recommendation && (
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    {analysis.delivery_recommendation}
                  </div>
                )}
                {analysis.delivery_options &&
                  analysis.delivery_options.length > 0 && (
                    <div>
                      <h4 className="mb-2 font-medium">
                        Suggested delivery options:
                      </h4>
                      <ul className="space-y-1 text-sm">
                        {analysis.delivery_options.map((opt, idx) => (
                          <li key={idx} className="flex justify-between">
                            <span>{opt.platform}</span>
                            <span className="text-gray-500">
                              {opt.eta_minutes
                                ? `${opt.eta_minutes} min`
                                : "ETA N/A"}{" "}
                              {opt.cost_estimate
                                ? `• ${opt.cost_estimate}`
                                : ""}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </main>
  );
}
