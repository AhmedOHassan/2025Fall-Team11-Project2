/**
 * Unit tests for Home Page.
 *
 * Tests ensure the hero text, "How It Works" section, and benefit cards
 * render correctly. next/image is mocked to keep tests fast and deterministic.
 *
 * @author Ahmed Hassan
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import HomePage from "./page";

vi.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => {
    return <img {...props} alt={props.alt || "mock-image"} />;
  },
}));

describe("HomePage", () => {
  it("should render hero heading and intro paragraph", () => {
    render(<HomePage />);
    expect(
      screen.getByRole("heading", {
        name: /Your Meal, Decoded\. Your Health, Empowered\./i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        /SnapMeal AI revolutionizes your relationship with food/i,
      ),
    ).toBeInTheDocument();
  });

  it("should render 'How It Works' section and three steps", () => {
    render(<HomePage />);
    expect(
      screen.getByRole("heading", { name: /How It Works/i }),
    ).toBeInTheDocument();

    expect(screen.getByText(/\b1\b/)).toBeInTheDocument();
    expect(screen.getByText(/\b2\b/)).toBeInTheDocument();
    expect(screen.getByText(/\b3\b/)).toBeInTheDocument();
  });

  it("should render benefits cards for stakeholders", () => {
    render(<HomePage />);
    expect(
      screen.getByRole("heading", { name: /Benefits for Everyone/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/For Customers/i)).toBeInTheDocument();
    expect(
      screen.getByText(/For Restaurants & Platforms/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/For Healthcare Partners/i)).toBeInTheDocument();
  });

  it("renders a hero image with alt text", () => {
    render(<HomePage />);
    const img = screen.getByAltText(/Hero background|mock-image/i);
    expect(img).toBeInTheDocument();
  });
});
