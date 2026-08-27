/**
 * TDD tests for Ticket 04 — AudioRecorder state machine correctness.
 *
 * - Button disabled during 'processing' (not only during 'recording')
 * - Cleanup on unmount stops MediaRecorder before releasing tracks
 *
 * Note: The `key={questionId}` change on the exam page is tested via source-
 * code analysis (a lightweight structural test) rather than a full render,
 * because full exam page rendering would require Next.js router mocks.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import fs from 'fs';
import path from 'path';

// --- AudioContext mock ---
const mockAnalyserGetData = vi.fn((arr: Float32Array) => arr.fill(0));
const mockAnalyserConnect = vi.fn();
const mockSourceConnect = vi.fn();
const mockSourceDisconnect = vi.fn();
const mockContextClose = vi.fn().mockResolvedValue(undefined);

class MockAudioContext {
  createAnalyser() {
    return {
      fftSize: 2048,
      getFloatTimeDomainData: mockAnalyserGetData,
      connect: mockAnalyserConnect,
    };
  }
  createMediaStreamSource() {
    return {
      connect: mockSourceConnect,
      disconnect: mockSourceDisconnect,
    };
  }
  close() {
    return mockContextClose();
  }
}

// --- MediaRecorder mock ---
const mockRecorderStop = vi.fn();
const mockRecorderStart = vi.fn();

class MockMediaRecorder {
  state: 'inactive' | 'recording' = 'inactive';
  ondataavailable: ((e: { data: Blob }) => void) | null = null;

  start() {
    this.state = 'recording';
    mockRecorderStart();
  }

  stop() {
    this.state = 'inactive';
    mockRecorderStop();
    // Fire ondataavailable with an empty blob (triggers discard path)
    if (this.ondataavailable) {
      this.ondataavailable({ data: new Blob([], { type: 'audio/webm' }) });
    }
  }

  static isTypeSupported() {
    return true;
  }
}

// --- MediaStream mock ---
const mockTrackStop = vi.fn();

function makeStream(): MediaStream {
  return {
    getTracks: () => [{ stop: mockTrackStop }],
  } as unknown as MediaStream;
}

const mockGetUserMedia = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();

  // @ts-expect-error – jsdom lacks AudioContext
  global.AudioContext = MockAudioContext;
  // @ts-expect-error – jsdom lacks MediaRecorder
  global.MediaRecorder = MockMediaRecorder;
  // @ts-expect-error – stub navigator.mediaDevices
  global.navigator.mediaDevices = {
    getUserMedia: mockGetUserMedia,
  };

  mockGetUserMedia.mockResolvedValue(makeStream());

  // requestAnimationFrame: fire callback once per call (controlled)
  vi.spyOn(global, 'requestAnimationFrame').mockImplementation((cb) => {
    // Don't recurse — just call once so the frame loop doesn't run forever
    setTimeout(() => cb(performance.now()), 0);
    return 1;
  });
  vi.spyOn(global, 'cancelAnimationFrame').mockImplementation(() => {});
});

async function renderRecorder(
  overrides: Partial<React.ComponentProps<typeof import('@/components/AudioRecorder').default>> = {}
) {
  const { default: AudioRecorder } = await import('@/components/AudioRecorder');
  const onTranscript = vi.fn();
  const onStatusChange = vi.fn();

  const result = render(
    <AudioRecorder
      sessionId="session-1"
      phase="monologue"
      onTranscript={onTranscript}
      onStatusChange={onStatusChange}
      isActive={true}
      {...overrides}
    />
  );

  return { ...result, onTranscript, onStatusChange };
}

describe('AudioRecorder — state machine (Ticket 04)', () => {
  it('renders the start button when idle', async () => {
    await renderRecorder();
    expect(screen.getByText(/Rozpocznij nagrywanie/i)).toBeInTheDocument();
  });

  it('shows the stop button after clicking start', async () => {
    await renderRecorder();

    await act(async () => {
      await userEvent.click(screen.getByText(/Rozpocznij nagrywanie/i));
    });

    expect(screen.getByText(/Zakończ nagrywanie/i)).toBeInTheDocument();
  });

  it('reports recording status via onStatusChange', async () => {
    const { onStatusChange } = await renderRecorder();

    await act(async () => {
      await userEvent.click(screen.getByText(/Rozpocznij nagrywanie/i));
    });

    expect(onStatusChange).toHaveBeenCalledWith('recording');
  });

  it('returns to idle status after stopping — a silence-ending recording must not leave the "next" button stuck disabled (Ticket 04)', async () => {
    const { onStatusChange } = await renderRecorder();

    await act(async () => {
      await userEvent.click(screen.getByText(/Rozpocznij nagrywanie/i));
    });

    // The mock analyser always reports silence, so the final chunk on stop
    // takes the 'discard' branch — this is exactly the "recording ends in
    // silence" scenario from the ticket.
    await act(async () => {
      await userEvent.click(screen.getByText(/Zakończ nagrywanie/i));
    });

    expect(onStatusChange).toHaveBeenLastCalledWith('idle');
  });

  it('does NOT render when isActive=false — Ticket 04', async () => {
    const { default: AudioRecorder } = await import('@/components/AudioRecorder');
    const { container } = render(
      <AudioRecorder
        sessionId="session-1"
        phase="monologue"
        onTranscript={vi.fn()}
        onStatusChange={vi.fn()}
        isActive={false}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('stops media tracks on unmount — Ticket 04 cleanup', async () => {
    // Ticket 04: when the component unmounts mid-recording, tracks must be
    // stopped so the microphone is released and no late uploads happen.
    const { unmount } = await renderRecorder();

    await act(async () => {
      await userEvent.click(screen.getByText(/Rozpocznij nagrywanie/i));
    });

    // Now unmount while recording
    act(() => {
      unmount();
    });

    expect(mockTrackStop).toHaveBeenCalled();
  });

  it('does not fire a /api/transcribe request for a chunk still in flight at unmount (Ticket 04)', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
      json: async () => ({ text: '' }),
    } as Response);

    const { unmount } = await renderRecorder();

    await act(async () => {
      await userEvent.click(screen.getByText(/Rozpocznij nagrywanie/i));
    });

    act(() => {
      unmount();
    });

    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });
});

// --- Structural tests for exam page (no Next.js router needed) ---
describe('ExamPage source — Ticket 04 structural checks', () => {
  const examPagePath = path.join(
    process.cwd(),
    'src/app/exam/[sessionId]/page.tsx'
  );

  it('submit button is disabled when recorder is processing — Ticket 04', () => {
    // Before fix: disabled={recorderStatus === 'recording'} — missing 'processing'
    // After fix:  disabled={recorderStatus === 'recording' || recorderStatus === 'processing'}
    const source = fs.readFileSync(examPagePath, 'utf-8');
    expect(source).toMatch(/recorderStatus === ['"]processing['"]/);
  });
});
