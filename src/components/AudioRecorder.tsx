'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useVAD } from '@/hooks/useVAD';
import { DEFAULT_VAD_CONFIG, decideChunk, type ChunkDecision } from '@/lib/vad';

interface AudioRecorderProps {
  sessionId: string;
  phase: 'monologue' | 'answer';
  questionId?: string;
  onTranscript: (text: string, chunkIndex: number) => void;
  onStatusChange: (status: 'idle' | 'recording' | 'processing') => void;
  isActive: boolean;
}

/** How often the chunk boundary rules are evaluated. */
const DECISION_INTERVAL_MS = 500;

/**
 * Restart-based recorder with voice-activity gating (Tickets 04 and 05).
 *
 * Ticket 04: a fresh MediaRecorder is started for every chunk instead of one
 * `.start(timeslice)` stream, because only the first blob of a continuous
 * stream carries a valid container header — later ones are undecodable alone.
 *
 * Ticket 05: the cut point is chosen by `decideChunk` rather than a fixed
 * 30-second timer, so silence is dropped before it costs an STT request and
 * short speech is batched past Groq's ~10-second billing minimum.
 */
export default function AudioRecorder({
  sessionId,
  phase,
  questionId,
  onTranscript,
  onStatusChange,
  isActive,
}: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState<'idle' | 'recording' | 'processing'>('idle');
  const [chunks, setChunks] = useState<string[]>([]);
  const [discardedChunks, setDiscardedChunks] = useState(0);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunkIndexRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isRecordingRef = useRef(false);
  // Set immediately before `.stop()` so `ondataavailable` knows whether the
  // finished blob should be uploaded or dropped.
  const pendingActionRef = useRef<'send' | 'discard'>('send');

  const { isSpeaking, volumeDb, getChunkState, resetChunk } = useVAD(
    stream,
    DEFAULT_VAD_CONFIG
  );

  const updateStatus = useCallback(
    (s: 'idle' | 'recording' | 'processing') => {
      setStatus(s);
      onStatusChange(s);
    },
    [onStatusChange]
  );

  const sendChunk = useCallback(
    async (blob: Blob) => {
      updateStatus('processing');
      const currentIndex = chunkIndexRef.current++;

      const formData = new FormData();
      formData.append('audio', blob, `chunk-${currentIndex}.webm`);
      formData.append('sessionId', sessionId);
      formData.append('chunkIndex', String(currentIndex));
      formData.append('phase', phase);
      if (questionId) formData.append('questionId', questionId);

      try {
        const res = await fetch('/api/transcribe', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();

        if (data.text) {
          setChunks((prev) => [...prev, data.text]);
          onTranscript(data.text, currentIndex);
        }
      } catch (error) {
        console.error('Transcription error:', error);
      }

      if (isRecordingRef.current) updateStatus('recording');
      else updateStatus('idle');
    },
    [sessionId, phase, questionId, onTranscript, updateStatus]
  );

  /** Starts a fresh recorder over the existing stream (new container header). */
  const startNewRecorder = useCallback(() => {
    if (!streamRef.current) return;

    const recorder = new MediaRecorder(streamRef.current, {
      mimeType: 'audio/webm;codecs=opus',
    });

    recorder.ondataavailable = (event) => {
      if (event.data.size === 0) return;

      if (pendingActionRef.current === 'discard') {
        // Silence never reaches Groq — this is the whole point of ticket 05.
        setDiscardedChunks((n) => n + 1);
        return;
      }
      sendChunk(event.data);
    };

    recorder.start();
    mediaRecorderRef.current = recorder;
    resetChunk();
  }, [sendChunk, resetChunk]);

  /** Cuts the current chunk, then immediately opens the next one. */
  const cutChunk = useCallback(
    (action: Exclude<ChunkDecision, 'continue' | 'extend'>) => {
      pendingActionRef.current = action;

      if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      if (isRecordingRef.current) {
        startNewRecorder();
      }
    },
    [startNewRecorder]
  );

  const startRecording = useCallback(async () => {
    try {
      const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = micStream;
      setStream(micStream);
      chunkIndexRef.current = 0;
      setChunks([]);
      setDiscardedChunks(0);
      isRecordingRef.current = true;
      setIsRecording(true);
      updateStatus('recording');

      startNewRecorder();

      intervalRef.current = setInterval(() => {
        const decision = decideChunk(getChunkState(), DEFAULT_VAD_CONFIG);
        if (decision === 'send' || decision === 'discard') {
          cutChunk(decision);
        }
        // 'continue' and 'extend' both mean: leave the recorder running.
      }, DECISION_INTERVAL_MS);
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  }, [startNewRecorder, cutChunk, updateStatus, getChunkState]);

  const stopRecording = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    isRecordingRef.current = false;

    // Flush the final partial chunk — upload it only if it holds speech, so
    // stopping during silence does not bill a request.
    const finalState = getChunkState();
    pendingActionRef.current = finalState.speechMs > 0 ? 'send' : 'discard';

    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    mediaRecorderRef.current = null;

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setStream(null);
    setIsRecording(false);

    // Ticket 04: the final chunk's ondataavailable either uploads (and its
    // own completion handler already restores 'idle') or is discarded as
    // silence — the discard branch never touches status on its own, so it
    // must be set here or the "next question" button stays disabled forever.
    if (pendingActionRef.current === 'discard') {
      updateStatus('idle');
    }
  }, [getChunkState, updateStatus]);

  // Ticket 04: Release the microphone if the page unmounts mid-recording.
  // Stopping the recorder BEFORE the tracks prevents late ondataavailable
  // callbacks from triggering a /api/transcribe request after unmount.
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      isRecordingRef.current = false;

      // Detach the handler first so the final ondataavailable does not upload
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.ondataavailable = null;
        if (mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
        mediaRecorderRef.current = null;
      }

      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  if (!isActive) return null;

  const meterWidth = Math.max(
    0,
    Math.min(100, ((volumeDb + 70) / 70) * 100)
  );

  return (
    <div className="space-y-4 font-sketch">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        {!isRecording ? (
          <button
            onClick={startRecording}
            className="w-full sm:w-auto flex items-center justify-center gap-3 rounded-2xl border-[3px] border-slate-900 bg-white hover:bg-amber-50 text-slate-900 px-6 py-4 font-extrabold text-base sm:text-lg shadow-[4px_4px_0px_#0f172a] transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#0f172a] cursor-pointer"
          >
            {/* Hand-drawn mic icon */}
            <svg
              viewBox="0 0 24 28"
              className="w-6 h-6 stroke-slate-900 fill-none"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="7" y="2" width="10" height="14" rx="5" fill="#ffffff" />
              <path d="M 4 11 C 4 19 20 19 20 11" />
              <line x1="12" y1="19" x2="12" y2="24" />
              <line x1="7" y1="24" x2="17" y2="24" />
            </svg>
            <span className="uppercase tracking-wider">Rozpocznij nagrywanie</span>
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="w-full sm:w-auto flex items-center justify-center gap-3 rounded-2xl border-[3px] border-slate-900 bg-rose-500 hover:bg-rose-600 text-white px-6 py-4 font-extrabold text-base sm:text-lg shadow-[4px_4px_0px_#0f172a] transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#0f172a] cursor-pointer animate-pulse"
          >
            <span className="w-3.5 h-3.5 bg-white rounded-xs" />
            <span className="uppercase tracking-wider">Zakończ nagrywanie</span>
          </button>
        )}

        {/* Live capture indicator */}
        {isRecording && (
          <div className="flex items-center gap-3 bg-white border-2 border-slate-900 rounded-xl px-4 py-2 text-sm shadow-[3px_3px_0px_#0f172a]">
            <div className="flex items-end gap-1 h-5 w-24">
              {[...Array(12)].map((_, i) => {
                const baseHeight = 25;
                const scale = isSpeaking ? (meterWidth / 100) : 0.15;
                const waveFactor = Math.sin((i / 11) * Math.PI);
                const randomOffset = isSpeaking ? (Math.sin(Date.now() / 100 + i) * 10) : 0;
                
                const heightPercentage = Math.max(
                  15,
                  baseHeight + (scale * 75 * waveFactor) + randomOffset
                );

                return (
                  <div
                    key={i}
                    style={{ height: `${heightPercentage}%` }}
                    className={`w-1.5 rounded-full transition-all duration-75 ${
                      isSpeaking ? 'bg-slate-900' : 'bg-slate-300'
                    }`}
                  />
                );
              })}
            </div>
            
            <div className="flex items-center min-w-[70px]">
              {isSpeaking ? (
                <span className="text-slate-900 font-extrabold text-sm uppercase">
                  Mówisz...
                </span>
              ) : (
                <span className="text-slate-400 font-bold text-sm uppercase">
                  Cisza
                </span>
              )}
            </div>
          </div>
        )}

        {status === 'processing' && (
          <div className="flex items-center gap-2 rounded-xl bg-white border-2 border-slate-900 text-slate-900 px-3.5 py-2 text-sm font-extrabold shadow-[2px_2px_0px_#0f172a]">
            <div className="w-3.5 h-3.5 border-2 border-slate-900 border-t-amber-500 rounded-full animate-spin" />
            Przetwarzanie głosu...
          </div>
        )}
      </div>

      {chunks.length > 0 && (
        <div className="sketch-box p-4 space-y-1.5 bg-amber-50/40">
          <p className="text-xs uppercase font-extrabold text-slate-600 tracking-wider">
            Transkrypcja mowy na żywo:
          </p>
          <p className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed font-sketch">
            "{chunks.join(' ')}"
          </p>
        </div>
      )}
    </div>
  );
}
