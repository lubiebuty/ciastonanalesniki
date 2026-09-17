import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (!authResult.ok) return authResult.response;

    const db = getDatabase();
    
    // Fetch 1 random question for each dzial (1, 2, 3) from wariant A
    const selectedTopics = [];
    
    for (let i = 1; i <= 3; i++) {
      const { data, error } = await db
        .from('topics')
        .select('*')
        .eq('dzial_numer', i)
        // Try to match 'A' or 'a' 
        .ilike('wariant', 'a%')
        // Order randomly
        // Since PostgREST doesn't support random out of the box in simple queries without a function,
        // we fetch a small pool and randomize in JS.
        .limit(20);

      if (error) {
        console.error(`Error fetching for dzial ${i}:`, error.message);
        continue;
      }

      if (data && data.length > 0) {
        // Pick one at random
        const randomTopic = data[Math.floor(Math.random() * data.length)];
        selectedTopics.push(randomTopic);
      }
    }

    if (selectedTopics.length === 0) {
      return NextResponse.json({ error: 'Nie znaleziono pasujących pytań w bazie.' }, { status: 404 });
    }

    return NextResponse.json({ topics: selectedTopics }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate debil game' },
      { status: 500 }
    );
  }
}
