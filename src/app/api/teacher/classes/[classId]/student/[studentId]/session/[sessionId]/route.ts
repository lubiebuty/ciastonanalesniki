import { NextResponse } from 'next/server';
import { requireTeacher } from '@/lib/api-auth';
import { getDatabase } from '@/lib/db';

export async function GET(
  req: Request, 
  { params }: { params: Promise<{ classId: string, studentId: string, sessionId: string }> }
) {
  const authCheck = await requireTeacher();
  if (!authCheck.ok) {
    return authCheck.response;
  }

  try {
    const { classId, studentId, sessionId } = await params;
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

    // 2. Get session and ensure it belongs to the student
    const { data: sessionData, error: sessionError } = await db
      .from('sessions')
      .select(`
        id, created_at, status, user_id,
        topics(przedmiot, numer, pytanie),
        session_scores(is_correct, score, feedback)
      `)
      .eq('id', sessionId)
      .single();

    if (sessionError || !sessionData || sessionData.user_id !== studentId) {
      return NextResponse.json({ error: 'Sesja nie została znaleziona lub nie należy do ucznia.' }, { status: 404 });
    }

    // 3. Get transcripts
    const { data: transcripts, error: transcriptError } = await db
      .from('session_transcripts')
      .select('*')
      .eq('session_id', sessionId)
      .order('chunk_index', { ascending: true });

    if (transcriptError) {
      return NextResponse.json({ error: 'Błąd podczas pobierania transkryptu.' }, { status: 500 });
    }

    return NextResponse.json({ 
      session: sessionData,
      transcripts: transcripts || []
    });
  } catch (error: any) {
    console.error('Error fetching student session details:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
