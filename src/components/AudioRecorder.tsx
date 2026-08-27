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
    <div className="space-y-3.5">
      <div className="flex items-center gap-3 flex-wrap">
        {!isRecording ? (
          <button
            onClick={startRecording}
            className="flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 font-semibold text-xs shadow-xs transition-colors active:scale-95 cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span>Rozpocznij nagrywanie</span>
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 font-semibold text-xs shadow-xs transition-colors active:scale-95 cursor-pointer"
          >
            <span className="w-2 h-2 rounded-xs bg-white" />
            <span>Zakończ nagrywanie</span>
          </button>
        )}

        {/* Live capture indicator */}
        {isRecording && (
          <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs shadow-2xs">
            <div className="flex items-end gap-0.5 h-4 w-20">
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
                    className={`w-1 rounded-full transition-all duration-75 ${
                      isSpeaking ? 'bg-slate-900' : 'bg-slate-300'
                    }`}
                  />
                );
              })}
            </div>
            
            <div className="flex items-center min-w-[80px]">
              {isSpeaking ? (
                <span className="text-slate-900 font-bold text-xs">
                  Mówisz...
                </span>
              ) : (
                <span className="text-slate-400 text-xs">
                  Cisza
                </span>
              )}
            </div>
          </div>
        )}

        {status === 'processing' && (
          <div className="flex items-center gap-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 px-2.5 py-1 text-xs font-medium">
            <div className="w-2 h-2 border border-slate-400 border-t-slate-900 rounded-full animate-spin" />
            Przetwarzanie głosu...
          </div>
        )}
      </div>

      {isRecording && (
        <div className="space-y-1">
          <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-100 ${
                isSpeaking ? 'bg-slate-900' : 'bg-slate-300'
              }`}
              style={{ width: `${meterWidth}%` }}
            />
          </div>
          {discardedChunks > 0 && (
            <p className="text-[11px] text-slate-400">
              Pominięto {discardedChunks}{' '}
              {discardedChunks === 1 ? 'fragment ciszy' : 'fragmentów ciszy'}.
            </p>
          )}
        </div>
      )}

      {chunks.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-1 shadow-xs">
          <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
            Transkrypcja mowy na żywo:
          </p>
          <p className="text-xs font-medium text-slate-800 leading-relaxed">{chunks.join(' ')}</p>
        </div>
      )}
    </div>
  );
}
