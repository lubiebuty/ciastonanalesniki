/**
 * Chemia domain helper — metadata for 10 chapters, variant rules,
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
    nazwa: 'Substancje i ich właściwości',
    opis: 'Właściwości fizyczne i chemiczne, mieszaniny jednorodne i niejednorodne, metody rozdzielania, gęstość i zasady BHP.',
  },
  {
    numer: 2,
    rzymski: 'II',
    nazwa: 'Wewnętrzna budowa materii',
    opis: 'Atomy, cząsteczki, budowa atomu, układ okresowy, wiązania kowalencyjne i jonowe oraz wartościowość pierwiastków.',
  },
  {
    numer: 3,
    rzymski: 'III',
    nazwa: 'Reakcje chemiczne',
    opis: 'Zjawiska fizyczne a reakcje chemiczne, bilansowanie równań, prawo zachowania masy, reakcje egzo- i endotermiczne oraz rola katalizatora.',
  },
  {
    numer: 4,
    rzymski: 'IV',
    nazwa: 'Tlen, wodór i ich związki chemiczne. Powietrze',
    opis: 'Właściwości i otrzymywanie tlenu i wodoru, skład i zanieczyszczenia powietrza, tlenki, gazy szlachetne i efekt cieplarniany.',
  },
  {
    numer: 5,
    rzymski: 'V',
    nazwa: 'Woda i roztwory wodne',
    opis: 'Budowa dipolowa cząsteczki wody, rozpuszczanie, roztwory nasycone i nienasycone, krzywe rozpuszczalności i obliczanie stężenia procentowego.',
  },
  {
    numer: 6,
    rzymski: 'VI',
    nazwa: 'Wodorotlenki i kwasy',
    opis: 'Dysocjacja elektrolityczna, skala pH i wskaźniki kwasowo-zasadowe, właściwości, otrzymywanie i zastosowania kwasów oraz wodorotlenków.',
  },
  {
    numer: 7,
    rzymski: 'VII',
    nazwa: 'Sole',
    opis: 'Budowa i nazewnictwo soli, reakcje zobojętniania, zapis cząsteczkowy i jonowy, metody otrzymywania i reakcje strąceniowe.',
  },
  {
    numer: 8,
    rzymski: 'VIII',
    nazwa: 'Związki węgla z wodorem – węglowodory',
    opis: 'Szeregi homologiczne alkanów, alkenów i alkinów, reakcje spalania, addycja bromu, polimeryzacja oraz frakcje ropy naftowej.',
  },
  {
    numer: 9,
    rzymski: 'IX',
    nazwa: 'Pochodne węglowodorów',
    opis: 'Alkohole (metanol, etanol, glicerol), kwasy karboksylowe, reakcja estryfikacji, estry i ich właściwości w życiu codziennym.',
  },
  {
    numer: 10,
    rzymski: 'X',
    nazwa: 'Substancje chemiczne o znaczeniu biologicznym',
    opis: 'Budowa i właściwości tłuszczów, białka (wiązanie peptydowe, denaturacja) oraz węglowodany (glukoza, sacharoza, skrobia, celuloza).',
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
 * Computes progress and unlock state across all 10 chemistry chapters.
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
 * Resolves the next chemistry question in learning order.
 * Follows Dział 1..10 -> Variant A -> B -> C -> D.
 */
export function getNextTopic(
  topics: Topic[],
  userSessions: UserSessionMinimal[],
  currentTopicNumerOrId?: number | string,
  _przedmiot: string = 'chemia'
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
