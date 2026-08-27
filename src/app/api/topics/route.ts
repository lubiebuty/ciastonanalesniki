/**
 * Topics API route — GET returns all available topics.
 */
import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';

export async function GET() {
  try {
    const db = getDatabase();
    const { data: topics, error } = await db
      .from('topics')
      .select('*')
      .order('numer', { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ topics });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch topics' },
      { status: 500 }
    );
  }
}
