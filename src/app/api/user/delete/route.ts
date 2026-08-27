/**
 * User data deletion API — RODO Art. 17 (Right to Erasure).
 *
 * Ticket 01: uses requireAuth() instead of auth() directly, so the age-gate
 * is enforced here too. An unconfirmed-age user cannot delete their account
 * without first confirming age — which, if they are under 16, cannot be done.
 */
import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { deleteAllUserData } from '@/lib/sessions';
import { requireAuth } from '@/lib/api-auth';

export async function DELETE() {
  try {
    const authResult = await requireAuth();
    if (!authResult.ok) return authResult.response;

    const db = getDatabase();
    await deleteAllUserData(db, authResult.userId);

    return NextResponse.json({
      message: 'Wszystkie Twoje dane zostały usunięte.',
      deleted: true,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Deletion failed' },
      { status: 500 }
    );
  }
}
