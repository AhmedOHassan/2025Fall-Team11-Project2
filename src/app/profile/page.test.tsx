/**
 * Unit tests for Profile Page.
 *
 * This file contains tests for rendering the profile header and account details,
 * password reset validation, user interactions, API integration (fetch),
 * error handling, busy/loading state, and navigation back to the main page.
 *
 * @author Ahmed Hassan
 */
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProfilePage from "./page";
import { useSession } from "next-auth/react";

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
  return { useSession: vi.fn() };
});

describe("ProfilePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    if ((global as any).fetch) vi.restoreAllMocks();

    (useSession as any).mockReturnValue({
      data: { user: { name: "Test User", email: "test@example.com" } },
      status: "authenticated",
    });
  });

  it("should render the profile header and account details", () => {
    render(<ProfilePage />);
    expect(screen.getByText(/My Profile/i)).toBeInTheDocument();
    const accountEls = screen.getAllByText(/Account Details/i);
    expect(accountEls.length).toBeGreaterThan(0);
    expect(screen.getByText(/Full name:/i)).toBeInTheDocument();
    expect(screen.getByText(/Test User/i)).toBeInTheDocument();
    expect(screen.getByText(/Email:/i)).toBeInTheDocument();
    expect(screen.getByText(/test@example.com/i)).toBeInTheDocument();
  });

  it("should render loading state when session status is loading", () => {
    useSession.mockReturnValue({ data: null, status: "loading" });
    render(<ProfilePage />);
    expect(screen.getByText(/Loading profile…/i)).toBeInTheDocument();
  });

  it("should navigate to /home when Back to Home clicked", async () => {
    render(<ProfilePage />);
    const btn = screen.getByRole("button", { name: /Back to Home/i });
    await userEvent.click(btn);
    expect(pushMock).toHaveBeenCalledWith("/home");
  });

  it("should show error when new password is too short", async () => {
    render(<ProfilePage />);
    fireEvent.change(screen.getByLabelText(/Current password/i), {
      target: { value: "current" },
    });
    fireEvent.change(screen.getByLabelText(/^New password$/i), {
      target: { value: "123" },
    });
    fireEvent.change(screen.getByLabelText(/Confirm new password/i), {
      target: { value: "123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Update password/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/New password must be at least 6 characters\./i),
      ).toBeInTheDocument();
    });
  });

  it("should show error when new password and confirmation do not match", async () => {
    render(<ProfilePage />);
    fireEvent.change(screen.getByLabelText(/Current password/i), {
      target: { value: "current" },
    });
    fireEvent.change(screen.getByLabelText(/^New password$/i), {
      target: { value: "123456" },
    });
    fireEvent.change(screen.getByLabelText(/Confirm new password/i), {
      target: { value: "abcdef" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Update password/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/New password and confirmation do not match\./i),
      ).toBeInTheDocument();
    });
  });

  it("should show success and clear inputs on successful reset", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({}),
      } as any),
    );

    render(<ProfilePage />);
    fireEvent.change(screen.getByLabelText(/Current password/i), {
      target: { value: "currentpass" },
    });
    fireEvent.change(screen.getByLabelText(/^New password$/i), {
      target: { value: "newpassword" },
    });
    fireEvent.change(screen.getByLabelText(/Confirm new password/i), {
      target: { value: "newpassword" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Update password/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/Password updated successfully\./i),
      ).toBeInTheDocument();
      expect(screen.getByLabelText(/Current password/i)).toHaveValue("");
      expect(screen.getByLabelText(/^New password$/i)).toHaveValue("");
      expect(screen.getByLabelText(/Confirm new password/i)).toHaveValue("");
    });
  });

  it("should show server error message when API returns non-ok", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: vi.fn().mockResolvedValue({ error: "Bad current password" }),
      } as any),
    );

    render(<ProfilePage />);
    fireEvent.change(screen.getByLabelText(/Current password/i), {
      target: { value: "wrong" },
    });
    fireEvent.change(screen.getByLabelText(/^New password$/i), {
      target: { value: "newpassword" },
    });
    fireEvent.change(screen.getByLabelText(/Confirm new password/i), {
      target: { value: "newpassword" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Update password/i }));

    await waitFor(() => {
      expect(screen.getByText(/Bad current password/i)).toBeInTheDocument();
    });
  });

  it("should show network error when fetch throws and reset busy flag", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("boom")));

    render(<ProfilePage />);
    const submit = screen.getByRole("button", { name: /Update password/i });

    fireEvent.change(screen.getByLabelText(/Current password/i), {
      target: { value: "current" },
    });
    fireEvent.change(screen.getByLabelText(/^New password$/i), {
      target: { value: "newpassword" },
    });
    fireEvent.change(screen.getByLabelText(/Confirm new password/i), {
      target: { value: "newpassword" },
    });
    fireEvent.click(submit);

    await waitFor(() => {
      expect(
        screen.getByText(/Network error\. Please try again\./i),
      ).toBeInTheDocument();
      expect(submit).not.toBeDisabled();
    });
  });

  it("should show error when submitting empty fields", async () => {
    const { container } = render(<ProfilePage />);
    const form = container.querySelector("form") as HTMLFormElement | null;
    expect(form).toBeTruthy();

    fireEvent.submit(form!);

    await waitFor(() =>
      expect(
        screen.getByText(/All fields are required\./i),
      ).toBeInTheDocument(),
    );
  });

  it("should show generic 'Failed to reset password.' when API returns non-ok without error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: vi.fn().mockResolvedValue({}),
      } as any),
    );

    render(<ProfilePage />);
    fireEvent.change(screen.getByLabelText(/Current password/i), {
      target: { value: "current" },
    });
    fireEvent.change(screen.getByLabelText(/^New password$/i), {
      target: { value: "newpassword" },
    });
    fireEvent.change(screen.getByLabelText(/Confirm new password/i), {
      target: { value: "newpassword" },
    });

    const submit = screen.getByRole("button", { name: /Update password/i });
    fireEvent.click(submit);

    await waitFor(() => {
      expect(
        screen.getByText(/Failed to reset password\./i),
      ).toBeInTheDocument();
      expect(submit).not.toBeDisabled();
    });
  });

  it("should show generic 'Failed to reset password.' when res.json throws and response is non-ok", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: vi.fn().mockRejectedValue(new Error("broken-json")),
      } as any),
    );

    render(<ProfilePage />);
    fireEvent.change(screen.getByLabelText(/Current password/i), {
      target: { value: "current" },
    });
    fireEvent.change(screen.getByLabelText(/^New password$/i), {
      target: { value: "newpassword" },
    });
    fireEvent.change(screen.getByLabelText(/Confirm new password/i), {
      target: { value: "newpassword" },
    });

    const submit = screen.getByRole("button", { name: /Update password/i });
    fireEvent.click(submit);

    await waitFor(() => {
      expect(
        screen.getByText(/Failed to reset password\./i),
      ).toBeInTheDocument();
      expect(submit).not.toBeDisabled();
    });
  });

  it("should reset busy flag after successful reset (button re-enabled)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({}),
      } as any),
    );

    render(<ProfilePage />);
    fireEvent.change(screen.getByLabelText(/Current password/i), {
      target: { value: "currentpass" },
    });
    fireEvent.change(screen.getByLabelText(/^New password$/i), {
      target: { value: "newpassword" },
    });
    fireEvent.change(screen.getByLabelText(/Confirm new password/i), {
      target: { value: "newpassword" },
    });

    const submit = screen.getByRole("button", { name: /Update password/i });
    fireEvent.click(submit);

    await waitFor(() => {
      expect(
        screen.getByText(/Password updated successfully\./i),
      ).toBeInTheDocument();
      expect(submit).not.toBeDisabled();
    });
  });

  it("should reset busy flag after a non-ok response (button re-enabled)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: vi.fn().mockResolvedValue({ error: "oops" }),
      } as any),
    );

    render(<ProfilePage />);
    fireEvent.change(screen.getByLabelText(/Current password/i), {
      target: { value: "current" },
    });
    fireEvent.change(screen.getByLabelText(/^New password$/i), {
      target: { value: "newpassword" },
    });
    fireEvent.change(screen.getByLabelText(/Confirm new password/i), {
      target: { value: "newpassword" },
    });

    const submit = screen.getByRole("button", { name: /Update password/i });
    fireEvent.click(submit);

    await waitFor(() => {
      expect(screen.getByText(/oops/i)).toBeInTheDocument();
      expect(submit).not.toBeDisabled();
    });
  });
});
