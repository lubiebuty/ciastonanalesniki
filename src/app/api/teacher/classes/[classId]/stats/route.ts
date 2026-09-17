import { NextResponse } from 'next/server';
import { requireTeacher } from '@/lib/api-auth';
import { getDatabase } from '@/lib/db';

export async function GET(
  req: Request, 
  { params }: { params: Promise<{ classId: string }> }
) {
  const authCheck = await requireTeacher();
  if (!authCheck.ok) {
    return authCheck.response;
  }

  try {
    const { classId } = await params;
    const db = getDatabase();
    
    // 1. Check if class belongs to this teacher
    const { data: cls, error: clsError } = await db
      .from('classes')
      .select('*')
      .eq('id', classId)
      .eq('teacher_id', authCheck.userId)
      .single();

    if (clsError || !cls) {
      return NextResponse.json({ error: 'Nie znaleziono klasy lub brak dostępu.' }, { status: 404 });
    }

    // 2. Fetch all student IDs in the class
    const { data: memberships, error: memError } = await db
      .from('class_memberships')
      .select('student_id')
      .eq('class_id', classId);

    if (memError) {
      return NextResponse.json({ error: 'Błąd pobierania uczniów.' }, { status: 500 });
    }

    const studentIds = (memberships || []).map(m => m.student_id);

    if (studentIds.length === 0) {
      return NextResponse.json({ scores: [] });
    }

    // 3. Fetch all completed sessions and their scores for these students
    const { data: sessions, error: sessionsError } = await db
      .from('sessions')
      .select(`
        id, created_at, user_id, topic_id,
        topics(numer, przedmiot, pytanie, dzial_nazwa, dzial_numer, wariant),
        session_scores(score)
      `)
      .eq('status', 'completed')
      .in('user_id', studentIds)
      .order('created_at', { ascending: true });

    if (sessionsError) {
      return NextResponse.json({ error: 'Błąd pobierania wyników sesji.' }, { status: 500 });
    }

    // Process the data: return a flat list of { date, score, studentId }
    const validScores = (sessions || []).map(s => {
      const scoreObj = Array.isArray(s.session_scores) ? s.session_scores[0] : s.session_scores;
      const topicObj = Array.isArray(s.topics) ? s.topics[0] : s.topics;
      
      if (scoreObj && scoreObj.score !== undefined) {
        return {
          id: s.id,
          created_at: s.created_at,
          user_id: s.user_id,
          topic_id: s.topic_id,
          topic_numer: topicObj?.numer || '?',
          topic_przedmiot: topicObj?.przedmiot || 'Nieznany',
          topic_pytanie: topicObj?.pytanie || 'Brak treści',
          topic_dzial_nazwa: topicObj?.dzial_nazwa || 'Nieznany dział',
          topic_dzial_numer: topicObj?.dzial_numer || 0,
          topic_wariant: topicObj?.wariant || 'Brak',
          score: scoreObj.score
        };
      }
      return null;
    }).filter(Boolean);

    return NextResponse.json({ 
      scores: validScores
    });
  } catch (error: any) {
    console.error('Error fetching class stats:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
