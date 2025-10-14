import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import SignUpPage from "./page";
import { act } from "react-dom/test-utils";

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

describe("SignUpPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    if (global.fetch) vi.restoreAllMocks();
  });

  it("should render the form fields", () => {
    render(<SignUpPage />);
    expect(screen.getByLabelText(/Full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Create account/i }),
    ).toBeInTheDocument();
  });

  it("should allow typing in the inputs", async () => {
    const user = userEvent.setup();
    render(<SignUpPage />);
    const nameInput = screen.getByLabelText(/Full name/i);
    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Password/i);

    await user.type(nameInput, "Test User");
    await user.type(emailInput, "test@gmail.com");
    await user.type(passwordInput, "secret123");

    expect(nameInput).toHaveValue("Test User");
    expect(emailInput).toHaveValue("test@gmail.com");
    expect(passwordInput).toHaveValue("secret123");
  });

  it("should show validation error when fields are missing", async () => {
    const { container } = render(<SignUpPage />);
    const form = container.querySelector("form");
    expect(form).toBeTruthy();

    fireEvent.submit(form!);

    await waitFor(() => {
      expect(
        screen.getByText(/Name, Email, and password are required\./i),
      ).toBeInTheDocument();
      expect(pushMock).not.toHaveBeenCalled();
    });
  });

  it("should show password length validation error and prevent submission", async () => {
    const user = userEvent.setup();
    render(<SignUpPage />);
    const nameInput = screen.getByLabelText(/Full name/i);
    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const submitButton = screen.getByRole("button", {
      name: /Create account/i,
    });

    await user.type(nameInput, "Test User");
    await user.type(emailInput, "test@gmail.com");
    await user.type(passwordInput, "123");
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/Password must be at least 6 characters\./i),
      ).toBeInTheDocument();
      expect(pushMock).not.toHaveBeenCalled();
    });
  });

  it("should show loading state when submitting", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  status: 201,
                  json: () => Promise.resolve({ ok: true }),
                }),
              50,
            ),
          ),
      ),
    );

    render(<SignUpPage />);
    const nameInput = screen.getByLabelText(/Full name/i);
    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const submitButton = screen.getByRole("button", {
      name: /Create account/i,
    });

    await user.type(nameInput, "Test User");
    await user.type(emailInput, "test@gmail.com");
    await user.type(passwordInput, "secret123");
    await user.click(submitButton);

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
      expect(submitButton).toHaveTextContent(/Creating.../i);
    });
  });

  it("should handle duplicate user and show error", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        status: 409,
        json: vi.fn().mockResolvedValue({ error: "User exists" }),
      } as any),
    );

    render(<SignUpPage />);
    const nameInput = screen.getByLabelText(/Full name/i);
    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const submitButton = screen.getByRole("button", {
      name: /Create account/i,
    });

    await user.type(nameInput, "Test User");
    await user.type(emailInput, "dup@gmail.com");
    await user.type(passwordInput, "secret123");
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/User already exists with this email\./i),
      ).toBeInTheDocument();
      expect(pushMock).not.toHaveBeenCalled();
    });
  });

  it("should show success state and 'Go to Login now' pushes /login", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        status: 201,
        json: vi.fn().mockResolvedValue({ ok: true }),
      } as any),
    );

    render(<SignUpPage />);
    const nameInput = screen.getByLabelText(/Full name/i);
    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const submitButton = screen.getByRole("button", {
      name: /Create account/i,
    });

    await user.type(nameInput, "Good User");
    await user.type(emailInput, "good@gmail.com");
    await user.type(passwordInput, "strongpassword");
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/Account created successfully/i),
      ).toBeInTheDocument();
    });

    const goToLoginButton = screen.getByRole("button", {
      name: /Go to Login now/i,
    });
    await user.click(goToLoginButton);

    expect(pushMock).toHaveBeenCalledWith("/login");
  });

  it("should show generic error when fetch throws (network error)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));

    render(<SignUpPage />);
    const name = screen.getByLabelText(/Full name/i);
    const email = screen.getByLabelText(/Email/i);
    const pw = screen.getByLabelText(/Password/i);
    const submit = screen.getByRole("button", { name: /Create account/i });

    fireEvent.change(name, { target: { value: "Net User" } });
    fireEvent.change(email, { target: { value: "net@gmail.com" } });
    fireEvent.change(pw, { target: { value: "validpass" } });
    fireEvent.click(submit);

    await waitFor(() => {
      expect(screen.getByText(/Signup error\./i)).toBeInTheDocument();
      expect(submit).not.toBeDisabled();
    });
  });

  it("should show server-provided error when response includes body.error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        status: 500,
        json: vi.fn().mockResolvedValue({ error: "Something went wrong" }),
      } as any),
    );

    render(<SignUpPage />);
    fireEvent.change(screen.getByLabelText(/Full name/i), {
      target: { value: "S" },
    });
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "s@e.com" },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "validpass" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Create account/i }));

    await waitFor(() => {
      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
    });
  });

  it("should reset busy flag after server error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        status: 500,
        json: vi.fn().mockResolvedValue({}),
      } as any),
    );

    render(<SignUpPage />);
    const name = screen.getByLabelText(/Full name/i);
    const email = screen.getByLabelText(/Email/i);
    const pw = screen.getByLabelText(/Password/i);
    const submit = screen.getByRole("button", { name: /Create account/i });

    fireEvent.change(name, { target: { value: "Busy User" } });
    fireEvent.change(email, { target: { value: "busy@gmail.com" } });
    fireEvent.change(pw, { target: { value: "validpass" } });
    fireEvent.click(submit);

    await waitFor(() => {
      expect(
        screen.getByText(/Signup failed\.|Signup error\./i) ||
          screen.getByText(/Signup failed\./i),
      );
      expect(submit).not.toBeDisabled();
    });
  });

  it("should have a link to the login page", () => {
    render(<SignUpPage />);
    const link = screen.getByText(/Already have an account\?/i).closest("a");
    expect(link).toHaveAttribute("href", "/login");
  });

  it("should start an interval when signup succeeds and show initial countdown 3", async () => {
    const setIntervalSpy = vi.spyOn(window, "setInterval");

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        status: 201,
        json: vi.fn().mockResolvedValue({}),
      } as any),
    );

    const { unmount } = render(<SignUpPage />);
    const nameInput = screen.getByLabelText(/Full name/i) as HTMLInputElement;
    const emailInput = screen.getByLabelText(/Email/i) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(
      /Password/i,
    ) as HTMLInputElement;
    const submitButton = screen.getByRole("button", {
      name: /Create account/i,
    });

    fireEvent.change(nameInput, { target: { value: "Timer User" } });
    fireEvent.change(emailInput, { target: { value: "timer@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "validpass" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/Account created successfully/i),
      ).toBeInTheDocument();
    });

    expect(screen.getByText(/\b3\b/)).toBeInTheDocument();

    expect(setIntervalSpy).toHaveBeenCalled();
    const found = setIntervalSpy.mock.calls.some((call) => call[1] === 1000);
    expect(found).toBe(true);

    setIntervalSpy.mockRestore();
    unmount();
  });
});
