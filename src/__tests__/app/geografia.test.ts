import { describe, it, expect } from 'vitest';
import {
  DZIALY_METADATA,
  WARIANTY_METADATA,
  computeAllDzialyProgress,
  isQuestionPassed,
  getNextTopic,
} from '@/lib/geografia';
import type { Topic } from '@/lib/topics';

// Mock sample topics representing Dział 1 and Dział 2 structure
const sampleGeografiaTopics: Topic[] = [
  // Dział 1 - Wariant A (2 questions)
  { id: 'geo-1', numer: 201, pytanie: 'A1', odpowiedz: 'Ans', przedmiot: 'geografia', dzial_numer: 1, wariant: 'A', numer_pytania: 1 },
  { id: 'geo-2', numer: 202, pytanie: 'A2', odpowiedz: 'Ans', przedmiot: 'geografia', dzial_numer: 1, wariant: 'A', numer_pytania: 2 },
  // Dział 1 - Wariant B (2 questions)
  { id: 'geo-3', numer: 203, pytanie: 'B1', odpowiedz: 'Ans', przedmiot: 'geografia', dzial_numer: 1, wariant: 'B', numer_pytania: 1 },
  { id: 'geo-4', numer: 204, pytanie: 'B2', odpowiedz: 'Ans', przedmiot: 'geografia', dzial_numer: 1, wariant: 'B', numer_pytania: 2 },
  // Dział 1 - Wariant C (1 question)
  { id: 'geo-5', numer: 205, pytanie: 'C1', odpowiedz: 'Ans', przedmiot: 'geografia', dzial_numer: 1, wariant: 'C', numer_pytania: 1 },
  // Dział 1 - Wariant D (1 question)
  { id: 'geo-6', numer: 206, pytanie: 'D1', odpowiedz: 'Ans', przedmiot: 'geografia', dzial_numer: 1, wariant: 'D', numer_pytania: 1 },

  // Dział 2 - Wariant A (2 questions)
  { id: 'geo-7', numer: 207, pytanie: 'D2-A1', odpowiedz: 'Ans', przedmiot: 'geografia', dzial_numer: 2, wariant: 'A', numer_pytania: 1 },
  { id: 'geo-8', numer: 208, pytanie: 'D2-A2', odpowiedz: 'Ans', przedmiot: 'geografia', dzial_numer: 2, wariant: 'A', numer_pytania: 2 },
  // Dział 2 - Wariant B (1 question)
  { id: 'geo-9', numer: 209, pytanie: 'D2-B1', odpowiedz: 'Ans', przedmiot: 'geografia', dzial_numer: 2, wariant: 'B', numer_pytania: 1 },
];

describe('Geografia Domain Logic & 4-Variant Progression', () => {
  it('has exactly 13 działy metadata in correct sequence', () => {
    expect(DZIALY_METADATA).toHaveLength(13);
    expect(DZIALY_METADATA[0].nazwa).toBe('Mapa Polski');
    expect(DZIALY_METADATA[12].nazwa).toBe('Mała ojczyzna');
  });

  it('contains all 4 variants: A, B, C, D with full descriptions', () => {
    expect(WARIANTY_METADATA.A.nazwa).toBe('Pytania ogólne');
    expect(WARIANTY_METADATA.B.nazwa).toBe('Pytania szczegółowe');
    expect(WARIANTY_METADATA.C.nazwa).toBe('Pytania integrujące');
    expect(WARIANTY_METADATA.D.nazwa).toBe('Znajdź i wytłumacz błąd');
  });

  it('validates 4-variant structure and dzial assignments for topics', () => {
    for (const q of sampleGeografiaTopics) {
      expect(q.dzial_numer).toBeGreaterThanOrEqual(1);
      expect(q.dzial_numer).toBeLessThanOrEqual(13);
      expect(['A', 'B', 'C', 'D']).toContain(q.wariant);
      expect(q.pytanie).toBeTruthy();
      expect(q.odpowiedz).toBeTruthy();
    }
  });

  it('evaluates whether a question is passed based on session score or is_correct', () => {
    const mockTopic: Topic = {
      id: 'topic-1',
      numer: 201,
      pytanie: 'Test?',
      odpowiedz: 'Ans',
      przedmiot: 'geografia',
    };

    expect(isQuestionPassed(mockTopic, [])).toBe(false);
    expect(
      isQuestionPassed(mockTopic, [
        { topic_id: 'topic-1', status: 'completed', score: 4, is_correct: false },
      ])
    ).toBe(false);
    expect(
      isQuestionPassed(mockTopic, [
        { topic_id: 'topic-1', status: 'completed', score: 8, is_correct: true },
      ])
    ).toBe(true);
    expect(
      isQuestionPassed(mockTopic, [
        { numer: 201, status: 'completed', score: 6, is_correct: false },
      ])
    ).toBe(true);
  });

  it('enforces sequential unlocking: Dział 1 unlocked, Variant A unlocked, B locked until A completed', () => {
    const topics = sampleGeografiaTopics.filter((t) => t.dzial_numer === 1);
    const progressInitial = computeAllDzialyProgress(topics, []);

    const d1 = progressInitial[0];
    expect(d1.isUnlocked).toBe(true);
    expect(d1.variants.A.isUnlocked).toBe(true);
    expect(d1.variants.B.isUnlocked).toBe(false);
    expect(d1.variants.C.isUnlocked).toBe(false);
    expect(d1.variants.D.isUnlocked).toBe(false);

    // Dział 2 should be locked initially because Dział 1 is not completed
    const d2 = progressInitial[1];
    expect(d2.isUnlocked).toBe(false);
    expect(d2.variants.A.isUnlocked).toBe(false);
  });

  it('unlocks Variant B when all Variant A questions are passed in Dział 1', () => {
    const topics = sampleGeografiaTopics.filter((t) => t.dzial_numer === 1);
    const varATopics = topics.filter((t) => t.wariant === 'A');

    const sessions = varATopics.map((t) => ({
      topic_id: t.id,
      numer: t.numer,
      status: 'completed',
      score: 10,
      is_correct: true,
    }));

    const progress = computeAllDzialyProgress(topics, sessions);
    const d1 = progress[0];

    expect(d1.variants.A.isCompleted).toBe(true);
    expect(d1.variants.B.isUnlocked).toBe(true);
    expect(d1.variants.C.isUnlocked).toBe(false);
  });

  it('unlocks Dział 2 only when Dział 1 is 100% completed (all A, B, C, D passed)', () => {
    const topics = sampleGeografiaTopics.filter((t) => (t.dzial_numer ?? 0) <= 2);
    const d1Topics = topics.filter((t) => (t.dzial_numer ?? 0) === 1);

    const d1Sessions = d1Topics.map((t) => ({
      topic_id: t.id,
      numer: t.numer,
      status: 'completed',
      score: 9,
      is_correct: true,
    }));

    const progress = computeAllDzialyProgress(topics, d1Sessions);
    const d1 = progress[0];
    const d2 = progress[1];

    expect(d1.isCompleted).toBe(true);
    expect(d1.percentage).toBe(100);
    expect(d2.isUnlocked).toBe(true);
    expect(d2.variants.A.isUnlocked).toBe(true);
    expect(d2.variants.B.isUnlocked).toBe(false);
  });

  it('getNextTopic picks the first unlocked question for a new student', () => {
    const next = getNextTopic(sampleGeografiaTopics, [], undefined, 'geografia');
    expect(next).not.toBeNull();
    expect(next?.dzial_numer).toBe(1);
    expect(next?.wariant).toBe('A');
    expect(next?.numer_pytania).toBe(1);
  });

  it('getNextTopic picks the next question in the variant after solving previous one', () => {
    const firstQuestion = sampleGeografiaTopics[0];
    const sessions = [
      {
        topic_id: firstQuestion.id,
        numer: firstQuestion.numer,
        status: 'completed',
        score: 9,
        is_correct: true,
      },
    ];

    const next = getNextTopic(sampleGeografiaTopics, sessions, firstQuestion.id, 'geografia');
    expect(next).not.toBeNull();
    expect(next?.dzial_numer).toBe(1);
    expect(next?.wariant).toBe('A');
    expect(next?.numer_pytania).toBe(2);
  });

  it('getNextTopic progresses from Wariant A to Wariant B1 once all A questions are passed', () => {
    const d1Topics = sampleGeografiaTopics.filter((t) => t.dzial_numer === 1);
    const varATopics = d1Topics.filter((t) => t.wariant === 'A');

    const sessions = varATopics.map((t) => ({
      topic_id: t.id,
      numer: t.numer,
      status: 'completed',
      score: 10,
      is_correct: true,
    }));

    const next = getNextTopic(sampleGeografiaTopics, sessions, varATopics[1].id, 'geografia');
    expect(next).not.toBeNull();
    expect(next?.dzial_numer).toBe(1);
    expect(next?.wariant).toBe('B');
    expect(next?.numer_pytania).toBe(1);
  });
});
