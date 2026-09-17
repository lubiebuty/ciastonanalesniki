import type { Database } from './db';
import { v4 as uuidv4 } from 'uuid';
import { User } from './users';

export interface Class {
  id: string;
  teacher_id: string;
  name: string;
  invite_token: string;
  created_at: string;
}

export interface ClassMembership {
  class_id: string;
  student_id: string;
  joined_at: string;
}

export interface StudentProgress extends User {
  sessionCount?: number;
}

export async function createClass(db: Database, teacherId: string, name: string): Promise<Class> {
  const newClass = {
    id: uuidv4(),
    teacher_id: teacherId,
    name,
    invite_token: uuidv4(),
  };

  const { data, error } = await db
    .from('classes')
    .insert(newClass)
    .select('*')
    .single();

  if (error || !data) {
    throw new Error(`Failed to create class: ${error?.message}`);
  }

  return data as Class;
}

export async function listClassesForTeacher(db: Database, teacherId: string): Promise<Class[]> {
  const { data, error } = await db
    .from('classes')
    .select('*')
    .eq('teacher_id', teacherId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to list classes for teacher: ${error.message}`);
  }

  return data as Class[];
}

export async function listClassesForStudent(db: Database, studentId: string): Promise<Class[]> {
  const { data, error } = await db
    .from('class_memberships')
    .select('classes(*)')
    .eq('student_id', studentId)
    .order('joined_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to list classes for student: ${error.message}`);
  }

  // Supabase join returns { classes: { ... } }
  return (data || []).map((row: any) => row.classes) as Class[];
}

export async function addStudentToClass(db: Database, inviteToken: string, studentId: string): Promise<{ success: boolean; error?: string; classId?: string; className?: string }> {
  // 1. Find class by invite token
  const { data: cls, error: classError } = await db
    .from('classes')
    .select('id, name, teacher_id')
    .eq('invite_token', inviteToken)
    .single();

  if (classError || !cls) {
    return { success: false, error: 'Nieprawidłowy kod zaproszenia.' };
  }

  // 2. Prevent teacher from joining their own class
  if (cls.teacher_id === studentId) {
    return { success: false, error: 'Nie możesz dołączyć do własnej klasy jako uczeń.' };
  }

  // 3. Check if already a member
  const { data: existing, error: memError } = await db
    .from('class_memberships')
    .select('*')
    .eq('class_id', cls.id)
    .eq('student_id', studentId)
    .single();

  if (existing) {
    return { success: true, classId: cls.id, className: cls.name }; // Already joined, treat as success
  }

  if (memError && memError.code !== 'PGRST116') {
    return { success: false, error: memError.message };
  }

  // 4. Add to class
  const { error: insertError } = await db
    .from('class_memberships')
    .insert({
      class_id: cls.id,
      student_id: studentId,
    });

  if (insertError) {
    return { success: false, error: `Błąd podczas dołączania: ${insertError.message}` };
  }

  return { success: true, classId: cls.id, className: cls.name };
}

export async function listStudentsInClass(db: Database, classId: string, teacherId: string): Promise<StudentProgress[]> {
  // 1. Verify ownership
  const { data: cls, error: clsError } = await db
    .from('classes')
    .select('teacher_id')
    .eq('id', classId)
    .single();

  if (clsError || !cls || cls.teacher_id !== teacherId) {
    throw new Error('Brak dostępu do tej klasy.');
  }

  // 2. Get students
  const { data, error } = await db
    .from('class_memberships')
    .select('users(*)')
    .eq('class_id', classId);

  if (error) {
    throw new Error(`Błąd pobierania uczniów: ${error.message}`);
  }

  const students = (data || []).map((row: any) => row.users) as StudentProgress[];

  // Note: Session counting and progress will be implemented alongside Ticket 21/22
  // We can enrich it here if needed later by fetching session counts per student.
  
  return students;
}
