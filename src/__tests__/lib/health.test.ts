import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/config', () => ({
  getConfig: vi.fn(() => ({
    groqApiKey: 'test-key',
    groqSttModel: 'whisper-large-v3',
    groqLlmModel: 'llama-3.3-70b-versatile',
  })),
}));

describe('Health Check Logic (Supabase)', () => {
  beforeEach(() => {
    vi.resetModules();
    global.fetch = vi.fn();
  });

  it('returns healthy status when both models respond OK', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ id: 'model-id' }),
    });

    const { checkHealth } = await import('@/lib/health');
    const result = await checkHealth();

    expect(result.status).toBe('healthy');
    expect(result.stt.ok).toBe(true);
    expect(result.llm.ok).toBe(true);
  });

  it('returns unhealthy when STT model returns 404', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    }).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ id: 'llm-model' }),
    });

    const { checkHealth } = await import('@/lib/health');
    const result = await checkHealth();

    expect(result.status).toBe('unhealthy');
    expect(result.stt.ok).toBe(false);
    expect(result.stt.error).toContain('404');
  });

  it('returns unhealthy when LLM model returns 404', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ id: 'stt-model' }),
    }).mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    });

    const { checkHealth } = await import('@/lib/health');
    const result = await checkHealth();

    expect(result.status).toBe('unhealthy');
    expect(result.llm.ok).toBe(false);
  });

  it('handles network errors gracefully', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('Network error')
    );

    const { checkHealth } = await import('@/lib/health');
    const result = await checkHealth();

    expect(result.status).toBe('unhealthy');
    expect(result.stt.ok).toBe(false);
    expect(result.stt.error).toContain('Network error');
  });

  describe('diagnosing the cause of a failed ping', () => {
    it('names model retirement on a 404', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      const { checkHealth } = await import('@/lib/health');
      const result = await checkHealth();

      expect(result.status).toBe('unhealthy');
      expect(result.stt.error).toMatch(/wycofan|retired/i);
    });

    it('names the credentials, not the model, on a 401', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      });

      const { checkHealth } = await import('@/lib/health');
      const result = await checkHealth();

      expect(result.status).toBe('unhealthy');
      expect(result.stt.error).toMatch(/GROQ_API_KEY/);
    });

    it('reports a rate limit as its own cause', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
      });

      const { checkHealth } = await import('@/lib/health');
      const result = await checkHealth();

      expect(result.stt.error).toMatch(/limit/i);
    });
  });

  describe('Database health check (Ticket 08)', () => {
    it('returns a db status field in the health result', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({}),
      });

      const { checkHealth } = await import('@/lib/health');
      const result = await checkHealth();

      expect(result).toHaveProperty('db');
    });

    it('db.ok is true when a healthy Database is passed', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({}),
      });

      const healthyDb = {
        from: () => ({
          select: () => ({
            limit: () => Promise.resolve({ error: null }),
          }),
        }),
      };

      const { checkHealth } = await import('@/lib/health');
      const result = await checkHealth(healthyDb as any);

      expect(result.db.ok).toBe(true);
    });

    it('db.ok is false when db query returns error', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({}),
      });

      const brokenDb = {
        from: () => ({
          select: () => ({
            limit: () => Promise.resolve({ error: new Error('disk I/O error') }),
          }),
        }),
      };

      const { checkHealth } = await import('@/lib/health');
      const result = await checkHealth(brokenDb as any);

      expect(result.db.ok).toBe(false);
      expect(result.db.error).toMatch(/disk I\/O error/i);
    });

    it('overall status is unhealthy when db is unavailable', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({}),
      });

      const brokenDb = {
        from: () => {
          throw new Error('no such file');
        },
      };

      const { checkHealth } = await import('@/lib/health');
      const result = await checkHealth(brokenDb as any);

      expect(result.status).toBe('unhealthy');
    });
  });
});
