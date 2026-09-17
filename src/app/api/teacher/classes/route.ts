import { NextResponse } from 'next/server';
import { requireTeacher } from '@/lib/api-auth';
import { getDatabase } from '@/lib/db';
import { createClass, listClassesForTeacher } from '@/lib/classes';

export async function GET() {
  const authCheck = await requireTeacher();
  if (!authCheck.ok) {
    return authCheck.response;
  }

  try {
    const db = getDatabase();
    const classes = await listClassesForTeacher(db, authCheck.userId);
    return NextResponse.json({ classes });
  } catch (error: any) {
    console.error('Error fetching classes:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const authCheck = await requireTeacher();
  if (!authCheck.ok) {
    return authCheck.response;
  }

  try {
    const body = await req.json();
    if (!body.name || typeof body.name !== 'string') {
      return NextResponse.json({ error: 'Nazwa klasy jest wymagana.' }, { status: 400 });
    }

    const db = getDatabase();
    const newClass = await createClass(db, authCheck.userId, body.name);
    return NextResponse.json({ class: newClass });
  } catch (error: any) {
    console.error('Error creating class:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
