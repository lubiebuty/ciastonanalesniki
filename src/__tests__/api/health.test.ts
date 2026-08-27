import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/config', () => ({
  getConfig: vi.fn(() => ({
    groqApiKey: 'test-key',
    groqSttModel: 'whisper-large-v3',
    groqLlmModel: 'llama-3.3-70b-versatile',
  })),
}));

describe('GET /api/health — DB connectivity (Ticket 08)', () => {
  beforeEach(() => {
    vi.resetModules();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ id: 'model-id' }),
    });
  });

  it('reports db.ok === true and status healthy when the database responds', async () => {
    vi.doMock('@/lib/db', () => ({
      getDatabase: () => ({
        from: () => ({
          select: () => ({
            limit: () => Promise.resolve({ error: null }),
          }),
        }),
      }),
    }));

    const { GET } = await import('@/app/api/health/route');
    const response = await GET();
    const body = await response.json();

    expect(body.db).toBeDefined();
    expect(body.db.ok).toBe(true);
    expect(body.status).toBe('healthy');
    expect(response.status).toBe(200);
  });

  it('reports db.ok === false and an overall unhealthy status when the database is unreachable', async () => {
    vi.doMock('@/lib/db', () => ({
      getDatabase: () => ({
        from: () => ({
          select: () => ({
            limit: () => Promise.resolve({ error: new Error('disk I/O error') }),
          }),
        }),
      }),
    }));

    const { GET } = await import('@/app/api/health/route');
    const response = await GET();
    const body = await response.json();

    expect(body.db.ok).toBe(false);
    expect(body.status).toBe('unhealthy');
    expect(body.stt.ok).toBe(true);
    expect(body.llm.ok).toBe(true);
    expect(response.status).toBe(503);
  });
});
