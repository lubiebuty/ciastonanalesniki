/**
 * Topics API route — GET returns all available topics.
 */
import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';

export async function GET() {
  try {
    const db = getDatabase();
    const topics = db.prepare('SELECT * FROM topics ORDER BY numer').all();

    return NextResponse.json({ topics });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch topics' },
      { status: 500 }
    );
  }
}
