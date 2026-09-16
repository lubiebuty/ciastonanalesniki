import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/db";
import { deductMultipleTokens } from "@/lib/users";
import { requireAuthNoAgeGate } from "@/lib/api-auth";

export async function POST() {
  try {
    const authResult = await requireAuthNoAgeGate();

    if (!authResult.ok) {
      return authResult.response;
    }

    const db = getDatabase();
    const result = await deductMultipleTokens(db, authResult.userId, 51);

    return NextResponse.json({
      success: true,
      tokens: result.remainingTokens,
      deducted: 51,
      message: "Odcisnąłeś przycisk! Kara dla cwaniaczka: -51 tokenów!"
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to deduct tokens" },
      { status: 500 }
    );
  }
}
