/**
 * SnapMeal AI - Login page component tests
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
 * Unit tests for Login Page.
 *
 * This file contains tests for rendering the login form,
 * input validation, user interactions, and submission logic
 * (including signIn behavior, error handling, busy/loading state,
 * and navigation to the main page).
 *
 * @author Ahmed Hassan
 */
import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LoginPage from "./page";
import { signIn as signInMock } from "next-auth/react";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({
    push: pushMock,
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  })),
}));

vi.mock("next-auth/react", () => {
  return { signIn: vi.fn() };
});

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    if ((global as any).fetch) vi.restoreAllMocks();
  });

  it("should render the form fields", () => {
    render(<LoginPage />);
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Login/i })).toBeInTheDocument();
  });

  it("should allow typing in the inputs", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);
    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Password/i);

    await user.type(emailInput, "user@gmail.com");
    await user.type(passwordInput, "supersecret");

    expect(emailInput).toHaveValue("user@gmail.com");
    expect(passwordInput).toHaveValue("supersecret");
  });

  it("should call signIn and navigate to /home on successful signIn", async () => {
    signInMock.mockResolvedValue({ ok: true } as any);

    render(<LoginPage />);
    const user = userEvent.setup();
    const email = screen.getByLabelText(/Email/i);
    const pw = screen.getByLabelText(/Password/i);
    const submit = screen.getByRole("button", { name: /Login/i });

    await user.type(email, "good@gmail.com");
    await user.type(pw, "validpass");
    await user.click(submit);

    await waitFor(() => {
      expect(signInMock).toHaveBeenCalledWith(
        "credentials",
        expect.objectContaining({ redirect: false, email: "good@gmail.com" }),
      );
      expect(pushMock).toHaveBeenCalledWith("/home");
    });
  });

  it("should show error when signIn returns null", async () => {
    signInMock.mockResolvedValue(null);

    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "nores@gmail.com" },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "pwd" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Login/i }));

    await waitFor(() => {
      expect(
        screen.getByText(
          /Either email or password is incorrect\. Please try again\./i,
        ),
      ).toBeInTheDocument();
      expect(pushMock).not.toHaveBeenCalled();
    });
  });

  it("should show error when signIn returns an error field", async () => {
    signInMock.mockResolvedValue({ error: "Invalid credentials" } as any);

    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "bad@gmail.com" },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "pwd" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Login/i }));

    await waitFor(() => {
      expect(
        screen.getByText(
          /Either email or password is incorrect\. Please try again\./i,
        ),
      ).toBeInTheDocument();
      expect(pushMock).not.toHaveBeenCalled();
    });
  });

  it("should navigate to /home when signIn returns url or status", async () => {
    signInMock.mockResolvedValue({ url: "/some" } as any);

    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "url@gmail.com" },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "pwd" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Login/i }));

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/home");
    });
  });

  it("should reset busy flag after a thrown signIn error", async () => {
    signInMock.mockRejectedValue(new Error("boom"));

    render(<LoginPage />);
    const email = screen.getByLabelText(/Email/i);
    const pw = screen.getByLabelText(/Password/i);
    const submit = screen.getByRole("button", { name: /Login/i });

    fireEvent.change(email, { target: { value: "err@gmail.com" } });
    fireEvent.change(pw, { target: { value: "pwd" } });
    fireEvent.click(submit);

    await waitFor(() => {
      expect(
        screen.getByText(/Login error\. Please try again later\./i),
      ).toBeInTheDocument();
      expect(submit).not.toBeDisabled();
    });
  });

  it("should have a link to the signup page", () => {
    render(<LoginPage />);
    const link = screen.getByText(/Create account/i).closest("a");
    expect(link).toHaveAttribute("href", "/signup");
  });

  it("should show generic 'Login failed' when signIn returns a non-successful response without error/url", async () => {
    signInMock.mockResolvedValue({ status: 400 } as any);

    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "nogo@gmail.com" },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "badpass" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Login/i }));

    await waitFor(() => {
      expect(
        screen.getByText(
          /Login failed\. Either email or password is incorrect\./i,
        ),
      ).toBeInTheDocument();
      expect(pushMock).not.toHaveBeenCalled();
    });
  });

  it("should show loading state when signIn is pending and call signIn with email+password", async () => {
    let resolveSignIn: (value: any) => void;
    const pending = new Promise((res) => (resolveSignIn = res));
    signInMock.mockReturnValue(pending as any);

    render(<LoginPage />);
    const user = userEvent.setup();
    const email = screen.getByLabelText(/Email/i);
    const pw = screen.getByLabelText(/Password/i);
    const submit = screen.getByRole("button", { name: /Login/i });

    await user.type(email, "loading@gmail.com");
    await user.type(pw, "loadingpass");
    await user.click(submit);

    expect(submit).toBeDisabled();
    expect(submit).toHaveTextContent(/Logging in\.\.\./i);

    expect(signInMock).toHaveBeenCalledWith(
      "credentials",
      expect.objectContaining({
        redirect: false,
        email: "loading@gmail.com",
        password: "loadingpass",
      }),
    );

    resolveSignIn!({ ok: true } as any);

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/home");
    });
  });
});
