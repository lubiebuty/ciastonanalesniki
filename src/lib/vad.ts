/**
 * Voice-activity decisions for the recording pipeline (Ticket 05).
 *
 * Kept as pure functions, separate from the React hook, so the cost-guard rules
 * can be tested without an AudioContext.
 *
 * Cost model: Groq bills speech-to-text with a ~10-second minimum per request.
 * Cutting silence aggressively into many short fragments therefore *raises* the
 * bill — three 4-second requests cost 30 billed seconds, while one 12-second
 * request costs 12. The guard below batches short speech instead of sending it.
 */

/** Groq bills a minimum of ~10 seconds per STT request. */
export const GROQ_MIN_BILLED_MS = 10_000;

export interface VadConfig {
  /** Frames quieter than this count as silence. */
  silenceThresholdDb: number;
  /** How long a pause must last before it counts as a real pause, not a breath. */
  silenceHangoverMs: number;
  /** Preferred chunk length — the earliest point a cut is considered. */
  targetChunkMs: number;
  /** Hard ceiling on a chunk, so "extend" cannot run forever. */
  maxChunkMs: number;
  /** Speech below this is batched rather than sent (Groq billing minimum). */
  minSpeechMs: number;
}

export const DEFAULT_VAD_CONFIG: VadConfig = {
  // Quiet room tone sits near -60 dBFS; quiet speech lands around -35 dBFS.
  silenceThresholdDb: -45,
  // Long enough to ride through the pause between sentences, short enough that
  // the student is not left waiting after they finish.
  silenceHangoverMs: 1_500,
  targetChunkMs: 30_000,
  maxChunkMs: 90_000,
  minSpeechMs: GROQ_MIN_BILLED_MS,
};

/** Root-mean-square amplitude of a time-domain frame. */
export function computeRms(frame: Float32Array): number {
  if (frame.length === 0) return 0;

  let sum = 0;
  for (let i = 0; i < frame.length; i++) {
    sum += frame[i] * frame[i];
  }
  return Math.sqrt(sum / frame.length);
}

/** Converts RMS amplitude to dBFS, flooring digital silence instead of -Infinity. */
export function rmsToDb(rms: number): number {
  return 20 * Math.log10(Math.max(rms, 1e-10));
}

export function isSpeechFrame(db: number, config: VadConfig): boolean {
  return db > config.silenceThresholdDb;
}

export interface ChunkState {
  /** Time since this chunk started recording. */
  elapsedMs: number;
  /** Speech time accumulated within this chunk. */
  speechMs: number;
  /** Length of the silence run currently in progress (0 while speaking). */
  silenceRunMs: number;
}

export type ChunkDecision =
  /** Keep recording into the same blob. */
  | 'continue'
  /** Cut here and upload this blob. */
  | 'send'
  /** Cut here and throw the blob away — it holds no speech. */
  | 'discard'
  /** Past the target length, but cutting now would be wasteful or clumsy. */
  | 'extend';

/**
 * Decides what to do at a chunk boundary.
 *
 * `extend` is the batching mechanism: the recorder is left running so the next
 * boundary sees one longer blob. Concatenating already-finished blobs is not an
 * option — each carries its own container header (ticket 04).
 */
export function decideChunk(state: ChunkState, config: VadConfig): ChunkDecision {
  const { elapsedMs, speechMs, silenceRunMs } = state;

  if (elapsedMs < config.targetChunkMs) {
    return 'continue';
  }

  // Pure silence is never worth a request, no matter how long it ran.
  if (speechMs === 0) {
    return 'discard';
  }

  // At the ceiling, take the blob as it is. Paying one 10-second minimum beats
  // delaying the transcript and letting the buffer grow unbounded.
  if (elapsedMs >= config.maxChunkMs) {
    return 'send';
  }

  // Below the billing minimum: batching with the audio still to come is cheaper
  // than a short request that gets rounded up anyway.
  if (speechMs < config.minSpeechMs) {
    return 'extend';
  }

  // Enough speech to justify a request, but the student has not paused — cutting
  // mid-word would corrupt the transcript. Wait for the padding to elapse.
  if (silenceRunMs < config.silenceHangoverMs) {
    return 'extend';
  }

  return 'send';
}
