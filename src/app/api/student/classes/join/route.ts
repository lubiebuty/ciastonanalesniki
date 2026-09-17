import { NextResponse } from 'next/server';
import { requireAuthNoAgeGate } from '@/lib/api-auth';
import { getDatabase } from '@/lib/db';
import { addStudentToClass } from '@/lib/classes';

export async function POST(req: Request) {
  const authCheck = await requireAuthNoAgeGate();
  if (!authCheck.ok) {
    return authCheck.response;
  }

  try {
    const body = await req.json();
    if (!body.inviteToken || typeof body.inviteToken !== 'string') {
      return NextResponse.json({ error: 'Brak kodu zaproszenia.' }, { status: 400 });
    }

    const db = getDatabase();
    const result = await addStudentToClass(db, body.inviteToken, authCheck.userId);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ classId: result.classId, className: result.className });
  } catch (error: any) {
    console.error('Error joining class:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
