/**
 * User management operations — creation, token management, age confirmation.
 */
import type { Database } from './db';
import { v4 as uuidv4 } from 'uuid';

export interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  tokens: number;
  age_confirmed: number;
  created_at: string;
  role: 'student' | 'teacher';
}

export interface TokenResult {
  success: boolean;
  remainingTokens: number;
}

/**
 * Finds an existing user by email, or creates a new one with 10 free tokens.
 * Idempotent — calling multiple times with the same email won't create duplicates.
 */
export async function findOrCreateUser(
  db: Database,
  profile: { email: string; name?: string | null; image?: string | null }
): Promise<User> {
  const { data: existing, error: findError } = await db
    .from('users')
    .select('*')
    .eq('email', profile.email)
    .single();

  if (findError && findError.code !== 'PGRST116') {
    throw new Error(`Failed to find user: ${findError.message}`);
  }

  let user = existing as User | undefined;

  if (!user) {
    const id = uuidv4();
    const newUser = {
      id,
      email: profile.email,
      name: profile.name || null,
      image: profile.image || null,
      tokens: 10,
      age_confirmed: 0,
      role: 'student',
    };

    const { error: insertError } = await db
      .from('users')
      .insert(newUser);

    if (insertError) {
      // If concurrent insert occurs, try fetching again
      if (insertError.code === '23505') {
        const { data: concurrentUser } = await db
          .from('users')
          .select('*')
          .eq('email', profile.email)
          .single();
        if (concurrentUser) user = concurrentUser as User;
      } else {
        throw new Error(`Failed to create user: ${insertError.message}`);
      }
    } else {
      // Retrieve the newly created user
      const { data: created, error: getError } = await db
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (getError || !created) {
        throw new Error(`Failed to retrieve newly created user: ${getError?.message}`);
      }
      user = created as User;
    }
  }

  // Ticket 13: Sprawdzenie allowlisty i nadanie roli nauczyciela na stałe
  if (user && user.role !== 'teacher') {
    const allowlistRes = await db
      .from('teacher_allowlist')
      .select('email')
      .eq('email', user.email)
      .single();

    const allowlistEntry = allowlistRes?.data;

    if (allowlistEntry) {
      const { error: updateError } = await db
        .from('users')
        .update({ role: 'teacher' })
        .eq('id', user.id);
      
      if (!updateError) {
        user.role = 'teacher';
      }
    }
  }

  return user!;
}

/**
 * Deducts 1 token from the user's balance.
 * Returns success=false if the user has 0 tokens.
 */
export async function deductToken(db: Database, userId: string): Promise<TokenResult> {
  const { data: user, error: findError } = await db
    .from('users')
    .select('tokens')
    .eq('id', userId)
    .single();

  if (findError || !user) {
    return { success: false, remainingTokens: 0 };
  }

  if (user.tokens <= 0) {
    return { success: false, remainingTokens: user.tokens };
  }

  const { data: updated, error: updateError } = await db
    .from('users')
    .update({ tokens: user.tokens - 1 })
    .eq('id', userId)
    .select('tokens')
    .single();

  if (updateError || !updated) {
    throw new Error(`Failed to deduct token: ${updateError?.message}`);
  }

  return { success: true, remainingTokens: updated.tokens };
}

/**
 * Gets a user by their ID.
 */
export async function getUserById(db: Database, userId: string): Promise<User | undefined> {
  const { data: user, error } = await db
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return undefined;
    }
    throw new Error(`Failed to get user: ${error.message}`);
  }

  return user as User;
}

/**
 * Confirms the user's age self-declaration.
 */
export async function confirmAge(db: Database, userId: string): Promise<void> {
  const { error } = await db
    .from('users')
    .update({ age_confirmed: 1 })
    .eq('id', userId);

  if (error) {
    throw new Error(`Failed to confirm age: ${error.message}`);
  }
}

/**
 * Adds tokens to the user's balance.
 */
export async function addTokens(db: Database, userId: string, count: number): Promise<TokenResult> {
  const { data: user, error: findError } = await db
    .from('users')
    .select('tokens')
    .eq('id', userId)
    .single();

  if (findError || !user) {
    return { success: false, remainingTokens: 0 };
  }

  const newTotal = (user.tokens ?? 0) + count;

  const { data: updated, error: updateError } = await db
    .from('users')
    .update({ tokens: newTotal })
    .eq('id', userId)
    .select('tokens')
    .single();

  if (updateError || !updated) {
    throw new Error(`Failed to add tokens: ${updateError?.message}`);
  }

  return { success: true, remainingTokens: updated.tokens };
}

/**
 * Deducts multiple tokens from user balance (e.g. -51 penalty for unpressing cwaniak button).
 */
export async function deductMultipleTokens(db: Database, userId: string, count: number): Promise<TokenResult> {
  const { data: user, error: findError } = await db
    .from("users")
    .select("tokens")
    .eq("id", userId)
    .single();

  if (findError || !user) {
    return { success: false, remainingTokens: 0 };
  }

  const newTotal = Math.max(0, (user.tokens ?? 0) - count);

  const { data: updated, error: updateError } = await db
    .from("users")
    .update({ tokens: newTotal })
    .eq("id", userId)
    .select("tokens")
    .single();

  if (updateError || !updated) {
    throw new Error(`Failed to deduct tokens: ${updateError?.message}`);
  }

  return { success: true, remainingTokens: updated.tokens };
}
