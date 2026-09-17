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

    const { data: dbTopics, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    let topics = dbTopics || [];

    // Fallback if chemia is not yet seeded in database
    if (przedmiot === 'chemia' && topics.length === 0) {
      try {
        const fs = await import('fs');
        const path = await import('path');
        const chemiaFile = path.resolve(process.cwd(), 'data/chemia.json');
        if (fs.existsSync(chemiaFile)) {
          topics = JSON.parse(fs.readFileSync(chemiaFile, 'utf-8'));
        }
      } catch (err) {
        console.error('Error loading chemia.json fallback:', err);
      }
    }

    return NextResponse.json({ topics });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch topics' },
      { status: 500 }
    );
  }
}
