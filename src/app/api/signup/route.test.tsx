/**
 * Unit tests for the /api/signup.
 *
 * This file contains tests for missing fields, duplicate user handling,
 * and successful signup (password hashing + user creation).
 *
 * @author Ahmed Hassan
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { POST } from "./route";
import { db } from "~/server/db";
import { hash } from "bcrypt";

vi.mock("bcrypt", () => {
  return {
    __esModule: true,
    hash: vi.fn(),
  };
});

vi.mock("~/server/db", () => {
  return {
    __esModule: true,
    db: {
      user: {
        findUnique: vi.fn(),
        create: vi.fn(),
      },
    },
  };
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/signup", () => {
  it("should return 400 when required fields are missing", async () => {
    const req = new Request("http://localhost/api/signup", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({}),
    });

    const res = await POST(req as any);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toEqual({ error: "Missing fields" });
  });

  it("should return 409 when user already exists", async () => {
    (db.user.findUnique as any).mockResolvedValue({
      id: "existing-id",
      email: "dup@gmail.com",
    });

    const req = new Request("http://localhost/api/signup", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email: "dup@gmail.com",
        password: "pw",
        name: "Dup",
      }),
    });

    const res = await POST(req as any);
    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body).toEqual({ error: "User exists" });

    expect(db.user.findUnique).toHaveBeenCalledWith({
      where: { email: "dup@gmail.com" },
    });
  });

  it("should hash password, create user and return 201 on success", async () => {
    (db.user.findUnique as any).mockResolvedValue(null);
    (hash as any).mockResolvedValue("hashed-password");
    (db.user.create as any).mockResolvedValue({
      id: "new-user-id",
      email: "new@gmail.com",
    });

    const payload = {
      email: "new@gmail.com",
      password: "plainpw",
      name: "New User",
    };
    const req = new Request("http://localhost/api/signup", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    const res = await POST(req as any);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body).toEqual({ ok: true, userId: "new-user-id" });

    expect(hash).toHaveBeenCalledWith("plainpw", 10);
    expect(db.user.create).toHaveBeenCalledWith({
      data: {
        email: "new@gmail.com",
        name: "New User",
        password: "hashed-password",
      },
    });
  });
});
