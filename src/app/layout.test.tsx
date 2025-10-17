/**
 * Unit tests for RootLayout.
 *
 * Tests that the layout renders its children and footer, while mocking
 * AuthProvider and Header so tests stay focused and deterministic.
 *
 * @author Ahmed Hassan
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import RootLayout from "./layout";

vi.mock("next/font/google", () => {
  return {
    __esModule: true,
    Geist: (_opts: any) => ({ variable: "--font-geist-sans" }),
  };
});

vi.mock("~/components/authProvider", () => {
  return {
    __esModule: true,
    default: ({ children }: any) => (
      <div data-testid="auth-provider">{children}</div>
    ),
  };
});

vi.mock("~/components/header", () => {
  return {
    __esModule: true,
    default: () => <header data-testid="site-header">Header</header>,
  };
});

describe("RootLayout", () => {
  it("should render children inside layout and includes footer", async () => {
    const element = await RootLayout({
      children: <div data-testid="child">page body</div>,
    } as any);

    render(element);

    expect(screen.getByTestId("site-header")).toBeInTheDocument();

    expect(screen.getByTestId("child")).toHaveTextContent("page body");

    expect(
      screen.getByText(/© 2025 SnapMeal AI\. All rights reserved\./i),
    ).toBeInTheDocument();
  });
});
