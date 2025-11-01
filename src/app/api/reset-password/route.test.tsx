/**
 * Unit tests for Reset Password API route.
 *
 * This file contains tests for the POST /api/reset-password endpoint,
 * covering authentication, input validation, database interactions,
 * password verification and hashing, error handling, and the success path.
 *
 * @author Ahmed Hassan
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { POST } from "./route";

vi.mock("~/server/auth", () => ({
  auth: vi.fn(),
}));
vi.mock("~/server/db", () => ({
  db: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));
vi.mock("bcrypt", () => ({
  compare: vi.fn(),
  hash: vi.fn(),
}));

import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { compare, hash } from "bcrypt";

const mockAuth = auth as any;
const mockDb = db as any;
const mockCompare = compare as any;
const mockHash = hash as any;

beforeEach(() => {
  vi.clearAllMocks();
});

describe("/api/reset-password", () => {
  it("should return 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null);

    const req = new Request("http://localhost/api/reset-password", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ currentPassword: "a", newPassword: "b" }),
    });

    const res = await POST(req as any);
    expect(res.status).toBe(401);
    const body = await (res as Response).json();
    expect(body).toEqual({ error: "Authentication required" });
  });

  it("should return 400 when required fields are missing", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } });

    const req = new Request("http://localhost/api/reset-password", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({}),
    });

    const res = await POST(req as any);
    expect(res.status).toBe(400);
    const body = await (res as Response).json();
    expect(body).toEqual({ error: "Missing fields" });
  });

  it("should return 400 when new password is too short", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } });

    const req = new Request("http://localhost/api/reset-password", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ currentPassword: "old", newPassword: "123" }),
    });

    const res = await POST(req as any);
    expect(res.status).toBe(400);
    const body = await (res as Response).json();
    expect(body).toEqual({
      error: "New password must be at least 6 characters",
    });
  });

  it("should return 404 when user not found", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u-not" } });
    mockDb.user.findUnique.mockResolvedValue(null);

    const req = new Request("http://localhost/api/reset-password", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        currentPassword: "old",
        newPassword: "newpassword",
      }),
    });

    const res = await POST(req as any);
    expect(res.status).toBe(404);
    const body = await (res as Response).json();
    expect(body).toEqual({ error: "User not found" });
  });

  it("should return 400 when account has no password set", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u2" } });
    mockDb.user.findUnique.mockResolvedValue({ id: "u2", password: null });

    const req = new Request("http://localhost/api/reset-password", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        currentPassword: "old",
        newPassword: "newpassword",
      }),
    });

    const res = await POST(req as any);
    expect(res.status).toBe(400);
    const body = await (res as Response).json();
    expect(body).toEqual({ error: "No password set for this account" });
  });

  it("should return 403 when current password is incorrect", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u3" } });
    mockDb.user.findUnique.mockResolvedValue({ id: "u3", password: "hash" });
    mockCompare.mockResolvedValue(false);

    const req = new Request("http://localhost/api/reset-password", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        currentPassword: "wrong",
        newPassword: "newpassword",
      }),
    });

    const res = await POST(req as any);
    expect(res.status).toBe(403);
    const body = await (res as Response).json();
    expect(body).toEqual({ error: "Current password is incorrect" });
  });

  it("should return 200 and update password on success", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u4" } });
    mockDb.user.findUnique.mockResolvedValue({ id: "u4", password: "oldhash" });
    mockCompare.mockResolvedValue(true);
    mockHash.mockResolvedValue("new-hash");
    mockDb.user.update.mockResolvedValue({ id: "u4" });

    const req = new Request("http://localhost/api/reset-password", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        currentPassword: "old",
        newPassword: "newpassword",
      }),
    });

    const res = await POST(req as any);
    expect(res.status).toBe(200);
    const body = await (res as Response).json();
    expect(body).toEqual({ ok: true });

    expect(mockHash).toHaveBeenCalledWith("newpassword", 10);
    expect(mockDb.user.update).toHaveBeenCalledWith({
      where: { id: "u4" },
      data: { password: "new-hash" },
    });
  });

  it("should return 500 when an unexpected error occurs", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u5" } });
    mockDb.user.findUnique.mockResolvedValue({ id: "u5", password: "old" });
    mockCompare.mockResolvedValue(true);
    mockHash.mockResolvedValue("new-hash");
    mockDb.user.update.mockRejectedValue(new Error("boom"));

    const req = new Request("http://localhost/api/reset-password", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        currentPassword: "old",
        newPassword: "newpassword",
      }),
    });

    const res = await POST(req as any);
    expect(res.status).toBe(500);
    const body = await (res as Response).json();
    expect(body.error).toMatch(/boom/i);
  });

  it("should return 400 when request JSON is invalid (missing fields)", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u6" } });

    const badReq = {
      json: vi.fn().mockRejectedValue(new Error("invalid json")),
    } as any;

    const res = await POST(badReq);
    expect(res.status).toBe(400);
    const body = await (res as Response).json();
    expect(body).toEqual({ error: "Missing fields" });
  });

  it("should return 500 with 'Server error' when thrown error has no message", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u7" } });
    mockDb.user.findUnique.mockResolvedValue({ id: "u7", password: "oldhash" });
    mockCompare.mockResolvedValue(true);
    mockHash.mockResolvedValue("new-hash");
    mockDb.user.update.mockRejectedValue({});

    const req = new Request("http://localhost/api/reset-password", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        currentPassword: "old",
        newPassword: "newpassword",
      }),
    });

    const res = await POST(req as any);
    expect(res.status).toBe(500);
    const body = await (res as Response).json();
    expect(body).toEqual({ error: "Server error" });
  });
});
