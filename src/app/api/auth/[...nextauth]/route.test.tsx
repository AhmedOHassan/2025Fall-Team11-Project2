/**
 * Tests for the nextauth route handlers.
 *
 * @author Ahmed Hassan
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("~/server/auth", () => {
  const { NextResponse } = require("next/server");
  return {
    handlers: {
      GET: vi.fn(() => NextResponse.json({ ok: true, method: "GET" })),
      POST: vi.fn((req: any) =>
        NextResponse.json({
          ok: true,
          method: "POST",
          url: req?.url ?? null,
        }),
      ),
    },
  };
});

import { GET, POST } from "./route";
import { handlers } from "~/server/auth";

const mockedHandlers = handlers as any;

describe("nextauth route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should re-export handlers.GET and handlers.POST", () => {
    expect(GET).toBe(mockedHandlers.GET);
    expect(POST).toBe(mockedHandlers.POST);
  });

  it("should delegate GET to handlers.GET and return JSON response", async () => {
    const res = await GET();
    expect(mockedHandlers.GET).toHaveBeenCalled();
    const data = await (res as Response).json();
    expect(data).toEqual({ ok: true, method: "GET" });
  });

  it("should delegate POST to handlers.POST with the request and return JSON response", async () => {
    const req = new Request("http://localhost/api/auth/callback", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ foo: "bar" }),
    });

    const res = await POST(req as any);
    expect(mockedHandlers.POST).toHaveBeenCalledWith(req);
    const data = await (res as Response).json();
    expect(data.ok).toBe(true);
    expect(data.method).toBe("POST");
    expect(data.url).toBe("http://localhost/api/auth/callback");
  });
});
