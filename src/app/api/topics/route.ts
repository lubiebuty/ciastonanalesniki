/**
 * Topics API route — GET returns all available topics.
 */
import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const przedmiot = searchParams.get('przedmiot');

    const db = getDatabase();
    let query = db.from('topics').select('*').order('numer', { ascending: true });

    if (przedmiot) {
      query = query.eq('przedmiot', przedmiot);
    }

    const { data: topics, error } = await query;

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
