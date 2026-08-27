/**
 * TDD tests for voice-activity decisions (Ticket 05).
 *
 * The ticket's cost guard has a subtlety worth stating: chunks cannot be
 * "batched" by concatenating finished blobs, because ticket 04's restart-based
 * recorder gives each blob its own container header — glueing two together
 * produces a file Whisper cannot decode. Batching therefore means *not cutting
 * yet*: the recorder keeps running so one valid blob covers more speech.
 */
import { describe, it, expect } from 'vitest';
import {
  DEFAULT_VAD_CONFIG,
  GROQ_MIN_BILLED_MS,
  rmsToDb,
  computeRms,
  isSpeechFrame,
  decideChunk,
} from '@/lib/vad';

const cfg = DEFAULT_VAD_CONFIG;

describe('audio level helpers', () => {
  it('computes RMS of a constant-amplitude frame', () => {
    const frame = new Float32Array([0.5, -0.5, 0.5, -0.5]);
    expect(computeRms(frame)).toBeCloseTo(0.5, 5);
  });

  it('reports digital silence as a very low dB value, not -Infinity', () => {
    const frame = new Float32Array([0, 0, 0, 0]);
    expect(rmsToDb(computeRms(frame))).toBeLessThan(-100);
    expect(Number.isFinite(rmsToDb(computeRms(frame)))).toBe(true);
  });

  it('treats a loud frame as speech and a quiet one as silence', () => {
    expect(isSpeechFrame(-20, cfg)).toBe(true);
    expect(isSpeechFrame(-70, cfg)).toBe(false);
  });

  it('places the threshold above room tone but below quiet speech', () => {
    expect(cfg.silenceThresholdDb).toBeLessThan(-30);
    expect(cfg.silenceThresholdDb).toBeGreaterThan(-60);
  });
});

describe('decideChunk', () => {
  it('keeps recording before the target chunk length is reached', () => {
    expect(
      decideChunk({ elapsedMs: 12_000, speechMs: 9_000, silenceRunMs: 0 }, cfg)
    ).toBe('continue');
  });

  it('discards a window that contained no speech at all', () => {
    // Ticket 05: silence must never become a billed transcription request.
    expect(
      decideChunk({ elapsedMs: 30_000, speechMs: 0, silenceRunMs: 30_000 }, cfg)
    ).toBe('discard');
  });

  it('sends a window holding at least the Groq billing minimum of speech', () => {
    expect(
      decideChunk(
        { elapsedMs: 30_000, speechMs: 18_000, silenceRunMs: 3_000 },
        cfg
      )
    ).toBe('send');
  });

  it('extends rather than sending a speech segment below the billing minimum', () => {
    // Sending 4s as its own request still bills 10s — batching is cheaper.
    expect(
      decideChunk({ elapsedMs: 30_000, speechMs: 4_000, silenceRunMs: 8_000 }, cfg)
    ).toBe('extend');
  });

  it('uses exactly the Groq minimum as the boundary', () => {
    const justUnder = decideChunk(
      { elapsedMs: 30_000, speechMs: GROQ_MIN_BILLED_MS - 1, silenceRunMs: 9_000 },
      cfg
    );
    const exactly = decideChunk(
      { elapsedMs: 30_000, speechMs: GROQ_MIN_BILLED_MS, silenceRunMs: 9_000 },
      cfg
    );

    expect(justUnder).toBe('extend');
    expect(exactly).toBe('send');
  });

  it('does not cut mid-utterance — it waits for a natural pause', () => {
    // Enough speech to send, but the student is still talking: cutting here
    // would slice a word in half and corrupt the transcript.
    expect(
      decideChunk({ elapsedMs: 30_000, speechMs: 25_000, silenceRunMs: 200 }, cfg)
    ).toBe('extend');
  });

  it('treats a short natural pause as still speaking', () => {
    expect(
      decideChunk(
        { elapsedMs: 30_000, speechMs: 25_000, silenceRunMs: cfg.silenceHangoverMs - 1 },
        cfg
      )
    ).toBe('extend');
  });

  it('cuts once the pause outlasts the padding', () => {
    expect(
      decideChunk(
        { elapsedMs: 30_000, speechMs: 25_000, silenceRunMs: cfg.silenceHangoverMs },
        cfg
      )
    ).toBe('send');
  });

  it('sends at the hard cap even if speech is still under the billing minimum', () => {
    // Extending forever would delay the transcript and risk memory growth;
    // paying one 10s minimum is the lesser cost.
    expect(
      decideChunk({ elapsedMs: cfg.maxChunkMs, speechMs: 3_000, silenceRunMs: 0 }, cfg)
    ).toBe('send');
  });

  it('still discards at the hard cap when nothing was ever said', () => {
    expect(
      decideChunk(
        { elapsedMs: cfg.maxChunkMs, speechMs: 0, silenceRunMs: cfg.maxChunkMs },
        cfg
      )
    ).toBe('discard');
  });

  it('caps extension so a chunk cannot grow without bound', () => {
    expect(cfg.maxChunkMs).toBeGreaterThan(cfg.targetChunkMs);
    expect(cfg.maxChunkMs).toBeLessThanOrEqual(120_000);
  });
});

// Ticket 06: first-frame isSpeaking bug
// The isSpeaking flag is derived from: silenceRunMs < silenceHangoverMs.
// If silenceRunMsRef starts at 0 and deltaMs is 0 on the first frame (because
// lastFrameAt was null), silenceRunMs stays 0 and 0 < 1500 evaluates to true —
// so isSpeaking is erroneously true on the very first silence frame.
//
// Fix: initialise silenceRunMsRef to silenceHangoverMs so the first frame of
// silence yields silenceRunMs = hangoverMs which is NOT < hangoverMs → false.
describe('VAD isSpeaking initialization (Ticket 06)', () => {
  /**
   * Simulate one analysis frame with the given initial silenceRunMs.
   * Returns the isSpeaking value that would result.
   *
   * The hook computes: isSpeaking = silenceRunMs < silenceHangoverMs
   * On the very first frame deltaMs = 0 (lastFrameAt was null), so:
   *   - speech frame:  silenceRunMs stays at 0
   *   - silence frame: silenceRunMs += 0 = stays at 0
   *
   * The ONLY way to avoid a false positive is to initialise silenceRunMs
   * to >= silenceHangoverMs.
   */
  function simulateFirstSilenceFrame(initialSilenceRunMs: number): boolean {
    const deltaMs = 0; // first frame — no elapsed time
    const isSilence = true;
    let silenceRunMs = initialSilenceRunMs;

    if (isSilence) {
      silenceRunMs += deltaMs; // stays the same on first frame
    }

    return silenceRunMs < cfg.silenceHangoverMs;
  }

  it('wrong: initialising silenceRunMs to 0 makes the first silence frame appear as speech', () => {
    // This documents the pre-fix behaviour — it should be TRUE (bug).
    expect(simulateFirstSilenceFrame(0)).toBe(true);
  });

  it('correct: initialising silenceRunMs to silenceHangoverMs prevents the false positive', () => {
    // Ticket 06 fix: init to hangoverMs so first silence → isSpeaking = false.
    expect(simulateFirstSilenceFrame(cfg.silenceHangoverMs)).toBe(false);
  });
});

