/**
 * Transcribe API — receives audio chunk, transcribes via Groq Whisper,
 * immediately deletes the temp audio file (RODO compliance).
 */
import { NextRequest, NextResponse } from 'next/server';
import { getConfig } from '@/lib/config';
import { getDatabase } from '@/lib/db';
import { saveTranscriptChunk } from '@/lib/sessions';
import { requireAuth, requireSessionOwner } from '@/lib/api-auth';
import fs from 'fs';
import path from 'path';
import os from 'os';

// App Router route handlers stream the request body — there is no bodyParser to
// disable (the Pages Router `config.api.bodyParser` export is ignored here).
// fs/os access requires the Node runtime, and STT round-trips need headroom.
export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  let tempFilePath: string | null = null;

  try {
    const authResult = await requireAuth();
    if (!authResult.ok) return authResult.response;

    const formData = await request.formData();
    const audioFile = formData.get('audio') as File | null;
    const sessionId = formData.get('sessionId') as string | null;
    const chunkIndex = parseInt(formData.get('chunkIndex') as string || '0', 10);
    const phase = (formData.get('phase') as string || 'monologue') as 'monologue' | 'answer';
    const questionId = formData.get('questionId') as string | null;

    if (!audioFile || !sessionId) {
      return NextResponse.json(
        { error: 'audio file and sessionId are required' },
        { status: 400 }
      );
    }

    // Reject an upload aimed at somebody else's session before spending a
    // paid STT call on it.
    const ownerDb = getDatabase();
    const owner = await requireSessionOwner(ownerDb, sessionId, authResult.userId);
    if (!owner.ok) return owner.response;

    // Save to temp file
    const tempDir = os.tmpdir();
    tempFilePath = path.join(tempDir, `matura-audio-${Date.now()}-${chunkIndex}.webm`);
    const arrayBuffer = await audioFile.arrayBuffer();
    fs.writeFileSync(tempFilePath, Buffer.from(arrayBuffer));

    // Transcribe via Groq Whisper
    const appConfig = getConfig();
    const transcription = await transcribeWithGroq(
      tempFilePath,
      appConfig.groqApiKey,
      appConfig.groqSttModel
    );

    // RODO: Delete temp audio file immediately
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
      tempFilePath = null;
    }

    // Save verbatim transcript (no cleaning/normalization)
    const db = getDatabase();
    await saveTranscriptChunk(db, sessionId, transcription, chunkIndex);

    return NextResponse.json({
      text: transcription,
      chunkIndex,
    });
  } catch (error) {
    // RODO: Ensure temp file is always deleted, even on error
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Transcription failed' },
      { status: 500 }
    );
  }
}

async function transcribeWithGroq(
  filePath: string,
  apiKey: string,
  model: string
): Promise<string> {
  const fileBuffer = fs.readFileSync(filePath);
  const blob = new Blob([fileBuffer], { type: 'audio/webm' });

  const formData = new FormData();
  formData.append('file', blob, path.basename(filePath));
  formData.append('model', model);
  formData.append('language', 'pl');
  formData.append('response_format', 'json');

  const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq STT error ${response.status}: ${errorText.slice(0, 300)}`);
  }

  const result = (await response.json()) as { text: string };
  return result.text;
}
