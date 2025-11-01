/**
 * SnapMeal AI - Root layout component tests
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
