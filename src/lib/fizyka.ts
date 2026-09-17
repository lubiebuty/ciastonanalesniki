/**
 * Fizyka domain helper — metadata for 9 chapters, variant rules,
 * progression calculation (A -> B -> C -> D), and progress tracking.
 */
import type { Topic } from './topics';
import type { UserSessionMinimal, VariantProgress, VariantMeta } from './geografia';
import { WARIANTY_METADATA } from './geografia';

export interface DzialMeta {
  numer: number;
  rzymski: string;
  nazwa: string;
  opis: string;
}

export const DZIALY_METADATA: DzialMeta[] = [
  {
    numer: 1,
    rzymski: 'I',
    nazwa: 'Wymagania przekrojowe',
    opis: 'Planowanie i interpretacja pomiarów, niepewność pomiarowa, cyfry znaczące, przedrostki i przeliczanie jednostek oraz zasady BHP.',
  },
  {
    numer: 2,
    rzymski: 'II',
    nazwa: 'Ruch i siły',
    opis: 'Względność ruchu, prędkość, przyspieszenie, wykresy ruchu, zasady dynamiki Newtona, siła wypadkowa, ciężar i tarcie.',
  },
  {
    numer: 3,
    rzymski: 'III',
    nazwa: 'Energia',
    opis: 'Praca mechaniczna, moc, energia kinetyczna i potencjalna, zasada zachowania energii mechanicznej i przemiany energii.',
  },
  {
    numer: 4,
    rzymski: 'IV',
    nazwa: 'Zjawiska cieplne',
    opis: 'Temperatura, ciepło, energia wewnętrzna, przewodnictwo cieplne, konwekcja, topnienie, krzepnięcie, parowanie i skraplanie.',
  },
  {
    numer: 5,
    rzymski: 'V',
    nazwa: 'Właściwości materii',
    opis: 'Gęstość, ciśnienie, parcie, prawo Pascala, ciśnienie hydrostatyczne i atmosferyczne, prawo Archimedesa i siła wyporu.',
  },
  {
    numer: 6,
    rzymski: 'VI',
    nazwa: 'Elektryczność',
    opis: 'Elektryzowanie ciał, ładunek elektryczny, przewodnik a izolator, obwody elektryczne, natężenie, napięcie, prawo Ohma i praca prądu.',
  },
  {
    numer: 7,
    rzymski: 'VII',
    nazwa: 'Magnetyzm',
    opis: 'Bieguny magnetyczne, pole magnetyczne Ziemi, ferromagnetyki, pole magnetyczne wokół przewodnika z prądem i elektromagnesy.',
  },
  {
    numer: 8,
    rzymski: 'VIII',
    nazwa: 'Ruch drgający i fale',
    opis: 'Wahadło, amplituda, okres, częstotliwość, fale mechaniczne, długość i prędkość fali oraz fale dźwiękowe.',
  },
  {
    numer: 9,
    rzymski: 'IX',
    nazwa: 'Optyka',
    opis: 'Prostoliniowe rozchodzenie się światła, cień i półcień, prawo odbicia, zwierciadła, załamanie światła, soczewki, pryzmat i widmo fal.',
  },
];

export { WARIANTY_METADATA };

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
  variants: Record<'A' | 'B' | 'C' | 'D', VariantProgress>;
}

/**
 * Checks if a specific question has been passed by the student.
 * Score >= 5 or is_correct === true/1 indicates success.
 */
export function isQuestionPassed(
  topic: Topic,
  userSessions: UserSessionMinimal[]
): boolean {
  return userSessions.some((s) => {
    const matches = s.topic_id === topic.id || (s.numer !== undefined && s.numer === topic.numer);
    if (!matches) return false;
    if (s.status !== 'completed') return false;
    if (s.is_correct === true || s.is_correct === 1) return true;
    if (typeof s.score === 'number' && s.score >= 5) return true;
    return false;
  });
}

/**
 * Computes progress and unlock state across all 9 physics chapters.
 * Progression rules:
 * - Dział 1 is unlocked initially.
 * - Dział N is unlocked when Dział N-1 is completed.
 * - Within a Dział:
 *   - Variant A is unlocked if Dział is unlocked.
 *   - Variant B is unlocked once all questions in A are passed.
 *   - Variant C is unlocked once all questions in B are passed.
 *   - Variant D is unlocked once all questions in C are passed.
 */
export function computeAllDzialyProgress(
  topics: Topic[],
  userSessions: UserSessionMinimal[]
): DzialProgress[] {
  const result: DzialProgress[] = [];
  let previousDzialCompleted = true;

  for (const meta of DZIALY_METADATA) {
    const dzialTopics = topics.filter((t) => t.dzial_numer === meta.numer);
    const variantsList: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];

    const variantsProgress: Record<'A' | 'B' | 'C' | 'D', VariantProgress> = {
      A: { variant: 'A', total: 0, passed: 0, isUnlocked: false, isCompleted: false },
      B: { variant: 'B', total: 0, passed: 0, isUnlocked: false, isCompleted: false },
      C: { variant: 'C', total: 0, passed: 0, isUnlocked: false, isCompleted: false },
      D: { variant: 'D', total: 0, passed: 0, isUnlocked: false, isCompleted: false },
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

    const dzialUnlocked = meta.numer === 1 || previousDzialCompleted;

    // Sequential unlocking within chapter
    variantsProgress.A.isUnlocked = dzialUnlocked;
    variantsProgress.B.isUnlocked = dzialUnlocked && variantsProgress.A.isCompleted;
    variantsProgress.C.isUnlocked = dzialUnlocked && variantsProgress.B.isCompleted;
    variantsProgress.D.isUnlocked = dzialUnlocked && variantsProgress.C.isCompleted;

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

    previousDzialCompleted = isCompleted;
  }

  return result;
}

/**
 * Resolves the next physics question in learning order.
 * Follows Dział 1..9 -> Variant A -> B -> C -> D.
 */
export function getNextTopic(
  topics: Topic[],
  userSessions: UserSessionMinimal[],
  currentTopicNumerOrId?: number | string,
  _przedmiot: string = 'fizyka'
): Topic | null {
  if (!topics || topics.length === 0) return null;

  const dzialyProgress = computeAllDzialyProgress(topics, userSessions);

  // If currentTopicNumerOrId is given, check if candidate right after it is unlocked
  if (currentTopicNumerOrId !== undefined) {
    const currentIndex = topics.findIndex(
      (t) => t.id === currentTopicNumerOrId || t.numer === currentTopicNumerOrId
    );
    if (currentIndex !== -1 && currentIndex < topics.length - 1) {
      const candidate = topics[currentIndex + 1];
      const candidateDzial = dzialyProgress.find((d) => d.numer === candidate.dzial_numer);
      const candidateVariant = candidate.wariant as 'A' | 'B' | 'C' | 'D' | undefined;
      if (
        candidateDzial &&
        candidateVariant &&
        candidateDzial.variants[candidateVariant]?.isUnlocked
      ) {
        return candidate;
      }
    }
  }

  // Otherwise find the first unlocked chapter and variant with an unpassed question
  for (const dzial of dzialyProgress) {
    if (!dzial.isUnlocked) continue;
    const dzialTopics = topics.filter((t) => t.dzial_numer === dzial.numer);
    const variantsList: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];

    for (const v of variantsList) {
      const vProg = dzial.variants[v];
      if (!vProg.isUnlocked) continue;

      const vTopics = dzialTopics.filter((t) => t.wariant === v);
      const unpassed = vTopics.find((t) => !isQuestionPassed(t, userSessions));
      if (unpassed) {
        return unpassed;
      }
    }
  }

  return topics[0];
}
