import { NextResponse } from 'next/server';
import { requireTeacher } from '@/lib/api-auth';
import { getDatabase } from '@/lib/db';
import { listStudentsInClass } from '@/lib/classes';

export async function GET(req: Request, { params }: { params: Promise<{ classId: string }> }) {
  const authCheck = await requireTeacher();
  if (!authCheck.ok) {
    return authCheck.response;
  }

  try {
    const { classId } = await params;
    const db = getDatabase();
    
    // Check if class belongs to this teacher and fetch details
    const { data: cls, error: clsError } = await db
      .from('classes')
      .select('*')
      .eq('id', classId)
      .eq('teacher_id', authCheck.userId)
      .single();

    if (clsError || !cls) {
      return NextResponse.json({ error: 'Nie znaleziono klasy lub brak dostępu.' }, { status: 404 });
    }

    const students = await listStudentsInClass(db, classId, authCheck.userId);

    return NextResponse.json({ 
      class: cls,
      students 
    });
  } catch (error: any) {
    console.error('Error fetching class details:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
