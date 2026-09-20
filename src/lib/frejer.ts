import type { Topic } from './topics';
import type { UserSessionMinimal, VariantProgress } from './geografia';

export const AVAILABLE_FLASHCARDS = [
  "Rozdzial_4_Don_t_Drink_That_.jpg",
  "Rozdzial_4_He_s_Not_Coming.jpg",
  "Rozdzial_4_One_Week_to_Live.jpg",
  "Rozdzial_4_The_Author.jpg",
  "Rozdzial_4_The_Olympian.jpg",
  "Rozdzial_4_The_Rumspringa.jpg",
  "Rozdzial_5_Bionic_Man.jpg",
  "Rozdzial_5_Brian_s_Friend.jpg",
  "Rozdzial_5_Love_at_First_Sight.jpg",
  "Rozdzial_5_The_Befuddled_Puppy_Owner.jpg",
  "Rozdzial_5_The_Other_Jonas.jpg",
  "Rozdzial_5_The_Stanley_Cup.jpg",
  "Rozdzial_6_Prince_Akeem.jpg",
  "Rozdzial_6_The_Cheap_Trick.jpg",
  "Rozdzial_6_The_Lottery.jpg",
  "Rozdzial_6_The_Missing_Cat.jpg",
  "Rozdzial_6_The_Rorschach.jpg",
  "Rozdzial_7_The_Lifeguard.jpg",
  "Rozdzial_7_The_Scuba_Diver.jpg"
];

export function getFlashcardImagePath(topic: { pytanie?: string; dzial_numer?: number }) {
  if (!topic || !topic.pytanie) return null;
  const nameMatch = topic.pytanie.match(/[„"]([^”"]+)[”"]/);
  if (!nameMatch) return null;
  const name = nameMatch[1];
  const nameNormalized = name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  
  const matchedFile = AVAILABLE_FLASHCARDS.find(f => {
    const fNormalized = f.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    return fNormalized.includes(nameNormalized) && f.includes(`Rozdzial_${topic.dzial_numer}`);
  });
  return matchedFile ? `/fiszki_zagrywki/${matchedFile}` : null;
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
    if (s.is_correct === true || s.is_correct === 1) return true;
    if (typeof s.score === 'number' && s.score >= 5) return true;
    return false;
  });
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
