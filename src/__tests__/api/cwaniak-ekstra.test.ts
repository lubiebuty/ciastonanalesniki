import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/user/cwaniak-ekstra/route";

vi.mock("@/lib/api-auth", () => ({
  requireAuthNoAgeGate: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  getDatabase: vi.fn().mockReturnValue({}),
}));

vi.mock("@/lib/users", () => ({
  addTokens: vi.fn(),
}));

import { requireAuthNoAgeGate } from "@/lib/api-auth";
import { addTokens } from "@/lib/users";

describe("POST /api/user/cwaniak-ekstra", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 if unauthenticated", async () => {
    (requireAuthNoAgeGate as any).mockResolvedValueOnce({
      ok: false,
      response: new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 }),
    });

    const res = await POST();
    expect(res.status).toBe(401);
  });

  it("adds 50 tokens and returns success if authenticated", async () => {
    (requireAuthNoAgeGate as any).mockResolvedValueOnce({
      ok: true,
      userId: "u-123",
      email: "test@example.com",
    });
    (addTokens as any).mockResolvedValueOnce({
      success: true,
      remainingTokens: 60,
    });

    const res = await POST();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.tokens).toBe(60);
    expect(json.added).toBe(50);
    expect(addTokens).toHaveBeenCalledWith(expect.anything(), "u-123", 50);
  });
});
