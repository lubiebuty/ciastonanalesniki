import { NextResponse } from 'next/server';
import { requireTeacher } from '@/lib/api-auth';
import { getDatabase } from '@/lib/db';

export async function GET() {
  const authCheck = await requireTeacher();
  if (!authCheck.ok) {
    return authCheck.response;
  }

  try {
    const db = getDatabase();
    
    // 1. Get all classes owned by this teacher
    const { data: classes, error: classesError } = await db
      .from('classes')
      .select('id')
      .eq('teacher_id', authCheck.userId);
      
    if (classesError || !classes) {
      return NextResponse.json({ error: 'Błąd pobierania klas.' }, { status: 500 });
    }
    
    const classIds = classes.map(c => c.id);
    if (classIds.length === 0) {
      return NextResponse.json({ live: [] });
    }

    // 2. Get all students in these classes
    const { data: memberships, error: memError } = await db
      .from('class_memberships')
      .select('student_id, users(name, email)')
      .in('class_id', classIds);

    if (memError || !memberships) {
      return NextResponse.json({ error: 'Błąd pobierania uczniów.' }, { status: 500 });
    }

    // Deduplicate students (a student might be in multiple classes of this teacher)
    const studentsMap = new Map<string, any>();
    for (const mem of memberships) {
      if (!studentsMap.has(mem.student_id)) {
        studentsMap.set(mem.student_id, mem.users);
      }
    }
    const studentIds = Array.from(studentsMap.keys());

    if (studentIds.length === 0) {
      return NextResponse.json({ live: [] });
    }

    // 3. Get recent sessions for these students (we'll fetch recent ones and pick the latest in JS)
    // To optimize, maybe we just fetch sessions from the last 24 hours.
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const { data: sessions, error: sesError } = await db
      .from('sessions')
      .select('id, user_id, status, created_at, topics(przedmiot, numer, pytanie)')
      .in('user_id', studentIds)
      .gte('created_at', oneDayAgo)
      .order('created_at', { ascending: false });

    if (sesError) {
      return NextResponse.json({ error: 'Błąd pobierania sesji.' }, { status: 500 });
    }

    const latestSessions = new Map<string, any>();
    for (const ses of sessions || []) {
      if (!latestSessions.has(ses.user_id)) {
        latestSessions.set(ses.user_id, ses);
      }
    }

    // 4. Combine data for the response
    const liveData = studentIds.map(studentId => {
      const student = studentsMap.get(studentId);
      const session = latestSessions.get(studentId);
      return {
        studentId,
        name: student.name || 'Nieznany',
        email: student.email,
        session: session ? {
          id: session.id,
          status: session.status,
          createdAt: session.created_at,
          topic: session.topics ? `${session.topics.przedmiot} - Pytanie ${session.topics.numer}` : 'Brak danych',
        } : null
      };
    });

    // Sort: Active sessions first, then completed, then no session
    liveData.sort((a, b) => {
      if (a.session && !b.session) return -1;
      if (!a.session && b.session) return 1;
      if (!a.session && !b.session) return 0;
      
      const aIsActive = ['active', 'monologue', 'qa', 'evaluating'].includes(a.session!.status);
      const bIsActive = ['active', 'monologue', 'qa', 'evaluating'].includes(b.session!.status);
      
      if (aIsActive && !bIsActive) return -1;
      if (!aIsActive && bIsActive) return 1;
      
      return new Date(b.session!.createdAt).getTime() - new Date(a.session!.createdAt).getTime();
    });

    return NextResponse.json({ live: liveData });
  } catch (error: any) {
    console.error('Error fetching live data:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
