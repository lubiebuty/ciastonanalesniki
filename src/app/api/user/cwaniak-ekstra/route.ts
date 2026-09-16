import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { addTokens } from '@/lib/users';
import { requireAuthNoAgeGate } from '@/lib/api-auth';

export async function POST() {
  try {
    const authResult = await requireAuthNoAgeGate();

    if (!authResult.ok) {
      return authResult.response;
    }

    const db = getDatabase();
    const result = await addTokens(db, authResult.userId, 50);

    return NextResponse.json({
      success: true,
      tokens: result.remainingTokens,
      added: 50,
      message: 'BUM! Dodano 50 tokenów dla Cwaniaka Ekstra!'
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Nie udało się dodać tokenów' },
      { status: 500 }
    );
  }
}
