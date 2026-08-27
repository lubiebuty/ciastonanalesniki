/**
 * Age self-declaration API (Ticket 02).
 *
 * The intended users are 17–18-year-olds: minors under Polish civil law, but
 * above the 16-year RODO threshold for information-society services. The account
 * is only marked confirmed on an affirmative declaration — a negative answer is
 * refused rather than silently recorded.
 */
import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { confirmAge } from '@/lib/users';
import { requireAuthNoAgeGate } from '@/lib/api-auth';

export async function POST(request: Request) {
  try {
    const authResult = await requireAuthNoAgeGate();

    if (!authResult.ok) return authResult.response;

    const body = await request.json().catch(() => ({}));
    const { isAtLeast16 } = body as { isAtLeast16?: unknown };

    if (typeof isAtLeast16 !== 'boolean') {
      return NextResponse.json(
        { error: 'Wymagane pole isAtLeast16 (true/false).' },
        { status: 400 }
      );
    }

    if (!isAtLeast16) {
      return NextResponse.json(
        {
          error:
            'Korzystanie z symulatora wymaga ukończenia 16 lat. Poproś rodzica lub opiekuna o kontakt.',
        },
        { status: 403 }
      );
    }

    const db = getDatabase();
    confirmAge(db, authResult.userId);

    return NextResponse.json({ ageConfirmed: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Age confirmation failed' },
      { status: 500 }
    );
  }
}
