import { NextResponse } from 'next/server';
import { requireTeacher } from '@/lib/api-auth';
import { getDatabase } from '@/lib/db';

export async function GET(
  req: Request, 
  { params }: { params: Promise<{ classId: string, studentId: string, topicId: string }> }
) {
  const authCheck = await requireTeacher();
  if (!authCheck.ok) {
    return authCheck.response;
  }

  try {
    const { classId, studentId, topicId } = await params;
    const db = getDatabase();
    
    // 1. Verify that class belongs to teacher and student is in it
    const { data: membership, error: memError } = await db
      .from('class_memberships')
      .select('class_id, classes(teacher_id)')
      .eq('class_id', classId)
      .eq('student_id', studentId)
      .single();

    const teacherId = Array.isArray(membership?.classes) 
      ? (membership.classes as any[])[0]?.teacher_id 
      : (membership?.classes as any)?.teacher_id;

    if (memError || !membership || teacherId !== authCheck.userId) {
      return NextResponse.json({ error: 'Brak dostępu lub uczeń nie należy do klasy.' }, { status: 403 });
    }

    // 2. Fetch the topic
    const { data: topic, error: topicError } = await db
      .from('topics')
      .select('*')
      .eq('id', topicId)
      .single();

    if (topicError || !topic) {
      return NextResponse.json({ error: 'Zadanie nie zostało znalezione.' }, { status: 404 });
    }

    // 3. Fetch all sessions for this student and topic
    const { data: sessions, error: sessionsError } = await db
      .from('sessions')
      .select(`
        id, created_at, status, user_id,
        session_scores(is_correct, score, feedback)
      `)
      .eq('user_id', studentId)
      .eq('topic_id', topicId)
      .order('created_at', { ascending: true });

    if (sessionsError) {
      return NextResponse.json({ error: 'Błąd podczas pobierania sesji.' }, { status: 500 });
    }

    // 4. Fetch transcripts for all these sessions
    const sessionIds = (sessions || []).map(s => s.id);
    let transcripts: any[] = [];
    
    if (sessionIds.length > 0) {
      const { data: transcriptsData, error: transcriptsError } = await db
        .from('session_transcripts')
        .select('*')
        .in('session_id', sessionIds)
        .order('chunk_index', { ascending: true });
        
      if (!transcriptsError && transcriptsData) {
        transcripts = transcriptsData;
      }
    }

    // Assemble the payload
    const groupedAttempts = (sessions || []).map(session => {
      const sessionTranscripts = transcripts.filter(t => t.session_id === session.id);
      return {
        ...session,
        transcripts: sessionTranscripts
      };
    });

    return NextResponse.json({ 
      topic,
      attempts: groupedAttempts
    });
  } catch (error: any) {
    console.error('Error fetching topic attempts:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
