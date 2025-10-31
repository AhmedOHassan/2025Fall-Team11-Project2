/**
 * Unit tests for the Home page component
 *
 * @author Ahmed Hassan
 */

import {
  render,
  fireEvent,
  waitFor,
  screen,
  createEvent,
} from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import MainPage from "./page";

describe("Home page", () => {
  let originalFileReader: any;
  let fetchMock: any;

  beforeEach(() => {
    originalFileReader = (globalThis as any).FileReader;

    class MockFileReader {
      onload: ((ev?: any) => void) | null = null;
      onerror: ((ev?: any) => void) | null = null;
      result: string | null = null;
      readAsDataURL(_file: File) {
        setTimeout(() => {
          this.result = "data:image/png;base64,TEST_BASE64";
          this.onload && this.onload({ target: this });
        }, 0);
      }
    }
    vi.stubGlobal("FileReader", MockFileReader as any);

    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    if (originalFileReader) {
      (globalThis as any).FileReader = originalFileReader;
    }
  });

  it("should render the main page UI", async () => {
    render(<MainPage />);
    expect(screen.getByText(/Snap & Analyze/i)).toBeDefined();
    expect(screen.getByText(/Upload your meal photo/i)).toBeDefined();
    expect(
      screen.getByText(/Supports PNG, JPEG, WEBP, and GIF files/i),
    ).toBeDefined();
  });

  it("should allow selecting an image and show a preview", async () => {
    const { container } = render(<MainPage />);

    const input = container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    expect(input).toBeTruthy();

    const file = new File(["dummy"], "meal.png", { type: "image/png" });
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByAltText("Selected meal")).toBeInTheDocument();
    });
  });

  it("should handle file drop and show preview", async () => {
    render(<MainPage />);

    const uploadText = screen.getByText(/Upload your meal photo/i);
    const dropZone = uploadText.closest("div") as HTMLElement;
    expect(dropZone).toBeTruthy();

    const file = new File(["dummy"], "dropped.png", { type: "image/png" });

    fireEvent.drop(dropZone, {
      dataTransfer: {
        files: [file],
        items: [{ kind: "file", type: "image/png", getAsFile: () => file }],
      },
    });

    await waitFor(() => {
      expect(screen.getByAltText("Selected meal")).toBeInTheDocument();
    });
  });

  it("should handle non-image file drop and set error", async () => {
    render(<MainPage />);

    const uploadText = screen.getByText(/Upload your meal photo/i);
    const dropZone = uploadText.closest("div") as HTMLElement;
    expect(dropZone).toBeTruthy();

    const nonImage = new File(["dummy"], "notes.txt", { type: "text/plain" });

    fireEvent.drop(dropZone, {
      dataTransfer: {
        files: [nonImage],
        items: [
          { kind: "file", type: "text/plain", getAsFile: () => nonImage },
        ],
      },
    });

    await waitFor(() => {
      expect(
        screen.getByText(
          /Please select a valid image file \(PNG, JPEG, WEBP, or GIF\)/i,
        ),
      ).toBeInTheDocument();
    });
  });

  it("should call API and render analysis on successful response", async () => {
    const analysis = {
      ingredients: ["rice", "chicken"],
      nutrition: {
        calories: 500,
        protein: "30g",
        carbs: "50g",
        fat: "10g",
        fiber: "2g",
      },
      allergens: [],
      dietary_tags: [],
      healthScore: 7,
      alternatives: [],
      portion_analysis: "moderate",
      confidence: 0.9,
      warnings: [],
      delivery_recommendation: "",
      delivery_options: [],
    };

    (fetchMock as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, analysis }),
    });

    const { container } = render(<MainPage />);

    const input = container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file = new File(["dummy"], "meal.png", { type: "image/png" });
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() =>
      expect(screen.getByAltText("Selected meal")).toBeInTheDocument(),
    );

    const analyzeButton = screen.getByRole("button", {
      name: /Analyze Meal|Analyzing.../i,
    });
    fireEvent.click(analyzeButton);

    await waitFor(() => {
      expect(globalThis.fetch as any).toHaveBeenCalledWith(
        "/api/analyze-meal",
        expect.any(Object),
      );
      expect(screen.getByText(/500 calories/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/7\/10/)).toBeInTheDocument();
  });

  it("should display API error when analysis request fails", async () => {
    (fetchMock as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Analysis failed due to server" }),
    });

    const { container } = render(<MainPage />);

    const input = container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file = new File(["dummy"], "meal.png", { type: "image/png" });
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() =>
      expect(screen.getByAltText("Selected meal")).toBeInTheDocument(),
    );

    const analyzeButton = screen.getByRole("button", {
      name: /Analyze Meal|Analyzing.../i,
    });
    fireEvent.click(analyzeButton);

    await waitFor(() => {
      expect(globalThis.fetch as any).toHaveBeenCalled();
      expect(
        screen.getByText(/Analysis failed due to server/i),
      ).toBeInTheDocument();
    });
  });

  it("should set error when non-image file is selected", async () => {
    const { container } = render(<MainPage />);

    const input = container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    expect(input).toBeTruthy();

    const nonImage = new File(["dummy"], "readme.txt", { type: "text/plain" });
    fireEvent.change(input, { target: { files: [nonImage] } });

    await waitFor(() => {
      expect(
        screen.getByText(
          /Please select a valid image file \(PNG, JPEG, WEBP, or GIF\)/i,
        ),
      ).toBeInTheDocument();
    });
  });

  it("should prevent default on drag over", async () => {
    render(<MainPage />);

    const uploadText = screen.getByText(/Upload your meal photo/i);
    const dropZone = uploadText.closest("div") as HTMLElement;
    expect(dropZone).toBeTruthy();

    const evt = createEvent.dragOver(dropZone);
    evt.preventDefault = vi.fn();
    fireEvent(dropZone, evt);

    expect(evt.preventDefault).toHaveBeenCalled();
  });

  it("should show upload drop zone and open file picker when clicked", async () => {
    const { container } = render(<MainPage />);

    const uploadText = screen.getByText(/Upload your meal photo/i);
    const dropZone = uploadText.closest("div") as HTMLElement;
    expect(dropZone).toBeTruthy();

    const input = container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    expect(input).toBeTruthy();

    const clickSpy = vi.spyOn(input, "click" as any);

    fireEvent.click(dropZone);

    expect(clickSpy).toHaveBeenCalled();

    clickSpy.mockRestore();
  });

  it("should render image preview and action buttons; Change Image clicks file input", async () => {
    const { container } = render(<MainPage />);

    const input = container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file = new File(["dummy"], "meal.png", { type: "image/png" });
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByAltText("Selected meal")).toBeInTheDocument();
    });

    const changeButton = screen.getByRole("button", { name: /Change Image/i });
    const analyzeButton = screen.getByRole("button", {
      name: /Analyze Meal|Analyzing.../i,
    });
    expect(changeButton).toBeTruthy();
    expect(analyzeButton).toBeTruthy();

    const clickSpy = vi.spyOn(input, "click" as any);
    fireEvent.click(changeButton);
    expect(clickSpy).toHaveBeenCalled();

    clickSpy.mockRestore();
  });

  it("should render analysis warnings when AI returns warnings", async () => {
    const analysis = {
      ingredients: ["sauce", "noodles"],
      nutrition: {
        calories: 420,
        protein: "12g",
        carbs: "60g",
        fat: "10g",
      },
      allergens: ["Peanut sauce"],
      dietary_tags: [],
      healthScore: 4,
      alternatives: [],
      portion_analysis: "large",
      confidence: 0.75,
      warnings: [
        "ALLERGEN ALERT: Contains peanuts - avoid if allergic",
        "High sodium: consider a low-salt alternative",
      ],
      delivery_recommendation: "",
      delivery_options: [],
    };

    (fetchMock as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, analysis }),
    });

    const { container } = render(<MainPage />);

    const input = container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file = new File(["dummy"], "meal.png", { type: "image/png" });
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() =>
      expect(screen.getByAltText("Selected meal")).toBeInTheDocument(),
    );

    const analyzeButton = screen.getByRole("button", {
      name: /Analyze Meal|Analyzing.../i,
    });
    fireEvent.click(analyzeButton);

    await waitFor(() => {
      expect(
        screen.getByText(/ALLERGEN ALERT: Contains peanuts/i),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/High sodium: consider a low-salt alternative/i),
      ).toBeInTheDocument();
    });
  });

  it("should render ingredients, allergens, dietary tags, portion, alternatives and delivery info", async () => {
    const analysis = {
      ingredients: ["rice", "chicken", "scallions"],
      nutrition: {
        calories: 650,
        protein: "35g",
        carbs: "70g",
        fat: "22g",
        fiber: "3g",
      },
      allergens: ["Peanut sauce", "Shellfish"],
      dietary_tags: ["gluten-free", "high-protein"],
      healthScore: 6,
      alternatives: [
        "Use low-sodium soy sauce",
        "Replace fried chicken with grilled",
      ],
      portion_analysis: "Large portion (suitable for 2 people)",
      confidence: 0.88,
      warnings: [],
      delivery_recommendation: "Choose insulated packaging to avoid sogginess.",
      delivery_options: [
        { platform: "UberEats", eta_minutes: 25, cost_estimate: "$6-10" },
        { platform: "DoorDash", eta_minutes: 30, cost_estimate: "$5-9" },
      ],
    };

    (fetchMock as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, analysis }),
    });

    const { container } = render(<MainPage />);

    const input = container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file = new File(["dummy"], "meal.png", { type: "image/png" });
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() =>
      expect(screen.getByAltText("Selected meal")).toBeInTheDocument(),
    );

    const analyzeButton = screen.getByRole("button", {
      name: /Analyze Meal|Analyzing.../i,
    });
    fireEvent.click(analyzeButton);

    await waitFor(() => {
      expect(screen.getByText(/Identified Ingredients:/i)).toBeInTheDocument();
      expect(screen.getByText("rice")).toBeInTheDocument();
      expect(screen.getByText("chicken")).toBeInTheDocument();
      expect(screen.getByText("scallions")).toBeInTheDocument();

      expect(screen.getByText(/Potential Allergens:/i)).toBeInTheDocument();
      expect(screen.getByText("Peanut sauce")).toBeInTheDocument();
      expect(screen.getByText("Shellfish")).toBeInTheDocument();

      expect(screen.getByText(/Dietary Info:/i)).toBeInTheDocument();
      expect(screen.getByText("gluten-free")).toBeInTheDocument();
      expect(screen.getByText("high-protein")).toBeInTheDocument();

      expect(screen.getByText(/Portion:/i)).toBeInTheDocument();
      expect(
        screen.getByText(/Large portion \(suitable for 2 people\)/i),
      ).toBeInTheDocument();

      expect(
        screen.getByText(/Healthier Alternatives & Suggestions/i),
      ).toBeInTheDocument();
      expect(screen.getByText(/Use low-sodium soy sauce/i)).toBeInTheDocument();
      expect(
        screen.getByText(/Replace fried chicken with grilled/i),
      ).toBeInTheDocument();

      expect(screen.getByText(/Delivery Recommendation/i)).toBeInTheDocument();
      expect(
        screen.getByText(/Choose insulated packaging to avoid sogginess./i),
      ).toBeInTheDocument();
      expect(screen.getByText("UberEats")).toBeInTheDocument();
      expect(screen.getByText("DoorDash")).toBeInTheDocument();
      expect(screen.getByText(/25 min/)).toBeInTheDocument();
      expect(screen.getByText(/\$6-10/)).toBeInTheDocument();
    });
  });
});
