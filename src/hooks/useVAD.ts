'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import {
  DEFAULT_VAD_CONFIG,
  computeRms,
  rmsToDb,
  isSpeechFrame,
  type ChunkState,
  type VadConfig,
} from '@/lib/vad';

export interface VADHandle {
  /** True while the student is speaking (after hangover padding). */
  isSpeaking: boolean;
  /** Current level in dBFS — drives the live meter. */
  volumeDb: number;
  /** Speech/silence accounting for the chunk in progress. */
  getChunkState: () => ChunkState;
  /** Called after a chunk boundary to start accounting afresh. */
  resetChunk: () => void;
}

/**
 * Voice Activity Detection over a live MediaStream (Ticket 05).
 *
 * The analyser only measures; the send/discard/extend rules live in `lib/vad`
 * as pure functions so they can be tested without an AudioContext. Accounting
 * is kept in refs — a 60fps counter in React state would re-render the whole
 * recorder on every frame.
 */
export function useVAD(
  stream: MediaStream | null,
  config: VadConfig = DEFAULT_VAD_CONFIG
): VADHandle {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [volumeDb, setVolumeDb] = useState(-100);

  // Null until recording starts — calling Date.now() during render is impure.
  const chunkStartRef = useRef<number | null>(null);
  const speechMsRef = useRef(0);
  const silenceRunMsRef = useRef(0);
  const lastFrameAtRef = useRef<number | null>(null);

  // Both only touch refs, so they stay referentially stable — the recorder's
  // decision interval closes over them and must not be rebuilt every frame.
  const getChunkState = useCallback(
    (): ChunkState => ({
      elapsedMs:
        chunkStartRef.current === null ? 0 : Date.now() - chunkStartRef.current,
      speechMs: speechMsRef.current,
      silenceRunMs: silenceRunMsRef.current,
    }),
    []
  );

  const resetChunk = useCallback(() => {
    chunkStartRef.current = Date.now();
    speechMsRef.current = 0;
    // Ticket 06: same init as the stream start — prevents false isSpeaking on first frame
    silenceRunMsRef.current = config.silenceHangoverMs;
    lastFrameAtRef.current = null;
  }, [config.silenceHangoverMs]);

  useEffect(() => {
    if (!stream) return;

    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    source.connect(analyser);

    const frame = new Float32Array(analyser.fftSize);
    let rafId = 0;
    let cancelled = false;

    // Reset accounting for the chunk this stream begins.
    // Ticket 06: initialise silenceRunMsRef to silenceHangoverMs (not 0) so
    // the very first frame of silence is not classified as speech. On the first
    // frame deltaMs=0 (lastFrameAt is null), so silenceRunMs stays wherever it
    // was initialised. 0 < hangoverMs → true (bug); hangoverMs < hangoverMs → false (fix).
    chunkStartRef.current = Date.now();
    speechMsRef.current = 0;
    silenceRunMsRef.current = config.silenceHangoverMs;
    lastFrameAtRef.current = null;

    const analyze = () => {
      if (cancelled) return;

      analyser.getFloatTimeDomainData(frame);
      const db = rmsToDb(computeRms(frame));

      const now = Date.now();
      // Elapsed time is measured between frames rather than assumed, so a
      // throttled background tab does not inflate the speech total.
      const deltaMs = lastFrameAtRef.current === null ? 0 : now - lastFrameAtRef.current;
      lastFrameAtRef.current = now;

      if (isSpeechFrame(db, config)) {
        speechMsRef.current += deltaMs;
        silenceRunMsRef.current = 0;
      } else {
        silenceRunMsRef.current += deltaMs;
      }

      setVolumeDb(db);
      // A pause only counts as "stopped speaking" once it outlasts the padding,
      // so natural pauses between sentences do not flip the indicator.
      setIsSpeaking(silenceRunMsRef.current < config.silenceHangoverMs);

      rafId = requestAnimationFrame(analyze);
    };

    rafId = requestAnimationFrame(analyze);

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      source.disconnect();
      audioContext.close();
    };
  }, [stream, config]);

  return { isSpeaking, volumeDb, getChunkState, resetChunk };
}
