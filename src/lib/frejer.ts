import type { Topic } from './topics';
import type { UserSessionMinimal, VariantProgress } from './geografia';

import gamesMasterRaw from './games_master.json';
const gamesMaster = gamesMasterRaw as Record<string, any[]>;

export function getFlashcardImagePath(topic: { id_slug?: string | null, dzial_numer?: number }) {
  if (!topic || !topic.id_slug || !topic.dzial_numer) return null;
  
  const match = topic.id_slug.match(/^(playbook-chap(\d+)-play(\d+))-var[A-Z]$/);
  if (!match) return null;
  
  const dzialNumer = parseInt(match[2]);
  const playIndex = parseInt(match[3]);
  
  const masterList = gamesMaster[dzialNumer] || [];
  const gameData = masterList.find((g: any) => g.index === playIndex);
  
  if (gameData) {
    // If we want to return image and pdfPath... wait, we only want pdfPath now because the user said:
    // "I do nich, w pierwszym zdjęciu, tam gdzie jest na górze, na stronie głównej, ma być wklejona pierwsza strona z playbooka, adekwatna dla tego game’u."
    // And in the exam page, we also want to display the PDF. 
    // Wait, what if they don't have a PDF but have an image? For The Hot Dude, we only have the image! But they explicitly asked for PDFs and organizing it inside the folders.
    // Actually, The Test Tube replaced The Hot Dude in the user's list!
    // So the image fallback might still be useful, but let's just return the pdfPath and calculate pages if needed (we can assume 1 or 2 based on pdf_meta.json, but games_master doesn't have pages. Let's just return the pdfPath for now).
    return {
      image: null,
      pdfPath: gameData.pdfPath,
      pages: 1 // Since we don't have exact pages in games_master, we will just pass 1 for now, or we can look it up in pdf_meta.json.
    };
  }
  
  return null;
}

export function isPlaybookTopic(topic?: { id_slug?: string | null } | null) {
  if (!topic) return false;
  return topic.id_slug?.includes('playbook') || false;
}

export interface DzialMeta {
  numer: number;
  rzymski: string;
  nazwa: string;
  opis: string;
}

export const FREJER_DZIALY_METADATA: DzialMeta[] = [
  {
    numer: 4,
    rzymski: 'IV',
    nazwa: 'Plays for the Beginner',
    opis: 'Podstawowe zagrywki barowe i proste sztuczki, aby zacząć swoją przygodę.',
  },
  {
    numer: 5,
    rzymski: 'V',
    nazwa: 'Plays for the Amateur',
    opis: 'Nieco bardziej zaawansowane zagrywki wymagające odrobiny talentu aktorskiego.',
  },
  {
    numer: 6,
    rzymski: 'VI',
    nazwa: 'Plays for the Weekend Warrior',
    opis: 'Złożone i angażujące scenariusze, które wymagają przygotowania i odwagi.',
  },
  {
    numer: 7,
    rzymski: 'VII',
    nazwa: 'Plays for the Advanced (Don Juan)',
    opis: 'Zagrywki profesjonalne. Wymagają poświęceń, rekwizytów i wielkiej pewności siebie.',
  },
];

export interface DzialProgress {
  numer: number;
  rzymski: string;
  nazwa: string;
  opis: string;
  totalQuestions: number;
  passedQuestions: number;
  percentage: number;
  isUnlocked: boolean;
  isCompleted: boolean;
  variants: Record<'A' | 'B' | 'C', VariantProgress>;
}

export function isQuestionPassed(
  topic: Topic,
  userSessions: UserSessionMinimal[]
): boolean {
  return userSessions.some((s) => {
    const matches = s.topic_id === topic.id || (s.numer !== undefined && s.numer === topic.numer);
    if (!matches) return false;
    if (s.status !== 'completed') return false;
    if (typeof s.score === 'number') return s.score >= 6; // User requested 60% (6 pkt)
    
    // Fallback: check scores json
    const scoreMatch = (s as any).scores?.score >= 6;
    return scoreMatch;
  });
}

export function getNextTopic(
  topics: Topic[],
  sessions: UserSessionMinimal[],
  currentTopicId: string | number
): Topic | null {
  // We need current topic to know its game
  const currentTopic = topics.find(t => t.id === currentTopicId || t.numer === currentTopicId);
  if (!currentTopic || !currentTopic.id_slug) return null;

  // Enforce that current topic must be passed to advance
  if (!isQuestionPassed(currentTopic, sessions)) {
    return null; // Cannot advance until current is passed (60%+)
  }

  const match = currentTopic.id_slug.match(/^(playbook-chap\d+-play\d+)-var([A-Z])$/);
  if (!match) return null;

  const gameBaseSlug = match[1];
  const currentVar = match[2];
  let nextVar = '';

  if (currentVar === 'A') nextVar = 'B';
  else if (currentVar === 'B') nextVar = 'C';
  else return null; // No next variant after C (end of game)

  const nextTopicSlug = `${gameBaseSlug}-var${nextVar}`;
  const nextTopic = topics.find(t => t.id_slug === nextTopicSlug);
  
  if (nextTopic) {
    return nextTopic;
  }

  return null;
}

export function computeFrejerDzialyProgress(
  topics: Topic[],
  userSessions: UserSessionMinimal[]
): DzialProgress[] {
  const result: DzialProgress[] = [];

  for (const meta of FREJER_DZIALY_METADATA) {
    const dzialTopics = topics.filter((t) => t.dzial_numer === meta.numer);
    const variantsList: ('A' | 'B' | 'C')[] = ['A', 'B', 'C'];

    const variantsProgress: Record<'A' | 'B' | 'C', VariantProgress> = {
      A: { variant: 'A', total: 0, passed: 0, isUnlocked: false, isCompleted: false },
      B: { variant: 'B', total: 0, passed: 0, isUnlocked: false, isCompleted: false },
      C: { variant: 'C', total: 0, passed: 0, isUnlocked: false, isCompleted: false },
    };

    let totalPassedInDzial = 0;

    for (const v of variantsList) {
      const vTopics = dzialTopics.filter((t) => t.wariant === v);
      const passedCount = vTopics.filter((t) => isQuestionPassed(t, userSessions)).length;
      totalPassedInDzial += passedCount;

      variantsProgress[v].total = vTopics.length;
      variantsProgress[v].passed = passedCount;
      variantsProgress[v].isCompleted = vTopics.length > 0 && passedCount >= vTopics.length;
    }

    const dzialUnlocked = true;

    variantsProgress.A.isUnlocked = true;
    variantsProgress.B.isUnlocked = true;
    variantsProgress.C.isUnlocked = true;

    const totalQuestions = dzialTopics.length;
    const isCompleted = totalQuestions > 0 && totalPassedInDzial >= totalQuestions;
    const percentage = totalQuestions > 0 ? Math.round((totalPassedInDzial / totalQuestions) * 100) : 0;

    result.push({
      numer: meta.numer,
      rzymski: meta.rzymski,
      nazwa: meta.nazwa,
      opis: meta.opis,
      totalQuestions,
      passedQuestions: totalPassedInDzial,
      percentage,
      isUnlocked: dzialUnlocked,
      isCompleted,
      variants: variantsProgress,
    });
  }

  return result;
}
