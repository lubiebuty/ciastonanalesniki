import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/user/cwaniak-odcisk/route";

vi.mock("@/lib/api-auth", () => ({
  requireAuthNoAgeGate: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  getDatabase: vi.fn().mockReturnValue({}),
}));

vi.mock("@/lib/users", () => ({
  deductMultipleTokens: vi.fn(),
}));

import { requireAuthNoAgeGate } from "@/lib/api-auth";
import { deductMultipleTokens } from "@/lib/users";

describe("POST /api/user/cwaniak-odcisk", () => {
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

  it("deducts 51 tokens if unpressed", async () => {
    (requireAuthNoAgeGate as any).mockResolvedValueOnce({
      ok: true,
      userId: "u-123",
      email: "test@example.com",
    });
    (deductMultipleTokens as any).mockResolvedValueOnce({
      success: true,
      remainingTokens: 9,
    });

    const res = await POST();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.tokens).toBe(9);
    expect(json.deducted).toBe(51);
    expect(deductMultipleTokens).toHaveBeenCalledWith(expect.anything(), "u-123", 51);
  });
});
