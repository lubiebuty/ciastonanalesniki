/**
 * TDD Tests for src/lib/config.ts
 * Tests env-var config for AI models — written BEFORE implementation.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('Config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('reads GROQ_API_KEY from environment', async () => {
    process.env.GROQ_API_KEY = 'test-groq-key';
    process.env.GROQ_STT_MODEL = 'whisper-large-v3';
    process.env.GROQ_LLM_MODEL = 'llama-3.3-70b-versatile';
    const { getConfig } = await import('@/lib/config');
    const config = getConfig();
    expect(config.groqApiKey).toBe('test-groq-key');
  });

  it('reads GROQ_STT_MODEL from environment', async () => {
    process.env.GROQ_API_KEY = 'test-groq-key';
    process.env.GROQ_STT_MODEL = 'whisper-large-v3-turbo';
    process.env.GROQ_LLM_MODEL = 'llama-3.3-70b-versatile';
    const { getConfig } = await import('@/lib/config');
    const config = getConfig();
    expect(config.groqSttModel).toBe('whisper-large-v3-turbo');
  });

  it('reads GROQ_LLM_MODEL from environment', async () => {
    process.env.GROQ_API_KEY = 'test-groq-key';
    process.env.GROQ_STT_MODEL = 'whisper-large-v3';
    process.env.GROQ_LLM_MODEL = 'llama-3.3-70b-versatile';
    const { getConfig } = await import('@/lib/config');
    const config = getConfig();
    expect(config.groqLlmModel).toBe('llama-3.3-70b-versatile');
  });

  it('throws if GROQ_API_KEY is missing', async () => {
    delete process.env.GROQ_API_KEY;
    process.env.GROQ_STT_MODEL = 'whisper-large-v3';
    process.env.GROQ_LLM_MODEL = 'llama-3.3-70b-versatile';
    const { getConfig } = await import('@/lib/config');
    expect(() => getConfig()).toThrow('GROQ_API_KEY');
  });

  it('throws if GROQ_STT_MODEL is missing', async () => {
    process.env.GROQ_API_KEY = 'test-key';
    delete process.env.GROQ_STT_MODEL;
    process.env.GROQ_LLM_MODEL = 'llama-3.3-70b-versatile';
    const { getConfig } = await import('@/lib/config');
    expect(() => getConfig()).toThrow('GROQ_STT_MODEL');
  });

  it('throws if GROQ_LLM_MODEL is missing', async () => {
    process.env.GROQ_API_KEY = 'test-key';
    process.env.GROQ_STT_MODEL = 'whisper-large-v3';
    delete process.env.GROQ_LLM_MODEL;
    const { getConfig } = await import('@/lib/config');
    expect(() => getConfig()).toThrow('GROQ_LLM_MODEL');
  });

  it('does not hardcode any model strings', async () => {
    process.env.GROQ_API_KEY = 'key';
    process.env.GROQ_STT_MODEL = 'custom-stt-model';
    process.env.GROQ_LLM_MODEL = 'custom-llm-model';
    const { getConfig } = await import('@/lib/config');
    const config = getConfig();
    expect(config.groqSttModel).toBe('custom-stt-model');
    expect(config.groqLlmModel).toBe('custom-llm-model');
  });
});
