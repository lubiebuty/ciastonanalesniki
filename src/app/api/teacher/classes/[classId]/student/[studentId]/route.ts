import { NextResponse } from 'next/server';
import { requireTeacher } from '@/lib/api-auth';
import { getDatabase } from '@/lib/db';
import { getUserById } from '@/lib/users';

export async function GET(req: Request, { params }: { params: Promise<{ classId: string, studentId: string }> }) {
  const authCheck = await requireTeacher();
  if (!authCheck.ok) {
    return authCheck.response;
  }

  try {
    const { classId, studentId } = await params;
    const db = getDatabase();
    
    // 1. Verify that class belongs to teacher and student is in it
    const { data: membership, error: memError } = await db
      .from('class_memberships')
      .select('class_id, classes(teacher_id)')
      .eq('class_id', classId)
      .eq('student_id', studentId)
      .single();

    // Handle Supabase type inference which might type it as an array
    const teacherId = Array.isArray(membership?.classes) 
      ? (membership.classes as any[])[0]?.teacher_id 
      : (membership?.classes as any)?.teacher_id;

    if (memError || !membership || teacherId !== authCheck.userId) {
      return NextResponse.json({ error: 'Brak dostępu lub uczeń nie należy do klasy.' }, { status: 403 });
    }

    // 2. Get student profile
    const student = await getUserById(db, studentId);

    // 3. Get student sessions & scores
    const { data: sessions, error: sesError } = await db
      .from('sessions')
      .select(`
        id, topic_id, created_at, status, 
        topics(przedmiot, numer, pytanie),
        session_scores(is_correct, score)
      `)
      .eq('user_id', studentId)
      .order('created_at', { ascending: false });

    if (sesError) {
      return NextResponse.json({ error: 'Błąd pobierania sesji.' }, { status: 500 });
    }

    return NextResponse.json({ 
      student,
      sessions 
    });
  } catch (error: any) {
    console.error('Error fetching student details:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
