/**
 * Geografia domain helper — metadata for 13 chapters, variant rules,
 * progression calculation (A -> B -> C -> D), and progress tracking.
 */
import type { Topic } from './topics';

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
    nazwa: 'Mapa Polski',
    opis: 'Skala mapy, znaki umowne, hipsometria, plany i pomiary w terenie.',
  },
  {
    numer: 2,
    rzymski: 'II',
    nazwa: 'Krajobrazy Polski',
    opis: 'Pasowy układ rzeźby, krainy geograficzne, formy terenu i wpływ człowieka.',
  },
  {
    numer: 3,
    rzymski: 'III',
    nazwa: 'Lądy i oceany na Ziemi',
    opis: 'Siatka geograficzna, kontynenty, oceany, bieguny i wielkie odkrycia.',
  },
  {
    numer: 4,
    rzymski: 'IV',
    nazwa: 'Krajobrazy świata',
    opis: 'Strefowość i piętrowość klimatyczno-roślinna, lasy, sawanny, pustynie i tundra.',
  },
  {
    numer: 5,
    rzymski: 'V',
    nazwa: 'Ruchy Ziemi',
    opis: 'Ruch obrotowy i obiegowy, następstwo dnia i nocy, pory roku i strefy oświetlenia.',
  },
  {
    numer: 6,
    rzymski: 'VI',
    nazwa: 'Współrzędne geograficzne',
    opis: 'Odczytywanie i wyznaczanie współrzędnych na mapie oraz w terenie (GPS i kompas).',
  },
  {
    numer: 7,
    rzymski: 'VII',
    nazwa: 'Geografia Europy',
    opis: 'Granice, ukształtowanie, klimat, integracja europejska, ludność i gospodarka.',
  },
  {
    numer: 8,
    rzymski: 'VIII',
    nazwa: 'Sąsiedzi Polski',
    opis: 'Środowisko przyrodnicze, relacje międzynarodowe, gospodarka i dziedzictwo sąsiadów.',
  },
  {
    numer: 9,
    rzymski: 'IX',
    nazwa: 'Środowisko przyrodnicze Polski na tle Europy',
    opis: 'Klimat przejściowy, zlodowacenia, wody Bałtyku, rzeki, gleby i ochrona przyrody.',
  },
  {
    numer: 10,
    rzymski: 'X',
    nazwa: 'Społeczeństwo i gospodarka Polski na tle Europy',
    opis: 'Demografia, migracje, urbanizacja, struktura przemysłu, rolnictwo i usługi.',
  },
  {
    numer: 11,
    rzymski: 'XI',
    nazwa: 'Relacje między elementami środowiska geograficznego',
    opis: 'Ochrona przeciwpowodziowa, energetyka, rozwój metropolii i turystyka w regionach.',
  },
  {
    numer: 12,
    rzymski: 'XII',
    nazwa: 'Własny region',
    opis: 'Środowisko lokalne, mapy tematyczne, źródła danych i projektowanie wycieczek.',
  },
  {
    numer: 13,
    rzymski: 'XIII',
    nazwa: 'Mała ojczyzna',
    opis: 'Tożsamość lokalna, walory okolicy, planowanie działań i obserwacje w terenie.',
  },
];

export interface VariantMeta {
  kod: 'A' | 'B' | 'C' | 'D';
  nazwa: string;
  pelnaNazwa: string;
  opis: string;
}

export const WARIANTY_METADATA: Record<'A' | 'B' | 'C' | 'D', VariantMeta> = {
  A: {
    kod: 'A',
    nazwa: 'Pytania ogólne',
    pelnaNazwa: 'Wariant A — Pytania ogólne (koncepcyjne)',
    opis: '2 pytania otwierające temat. Sprawdzają rozumienie idei zjawiska bez wchodzenia w szczegóły.',
  },
  B: {
    kod: 'B',
    nazwa: 'Pytania szczegółowe',
    pelnaNazwa: 'Wariant B — Pytania szczegółowe (per podpunkt)',
    opis: 'Jedno pytanie na każdy podpunkt podstawy programowej z pułapką merytoryczną.',
  },
  C: {
    kod: 'C',
    nazwa: 'Pytania integrujące',
    pelnaNazwa: 'Wariant C — Pytania integrujące',
    opis: 'Łączenie 2-3 podpunktów naraz oraz szacowanie „na oko” przed sprawdzeniem faktów.',
  },
  D: {
    kod: 'D',
    nazwa: 'Znajdź i wytłumacz błąd',
    pelnaNazwa: 'Wariant D — „Znajdź i wytłumacz błąd”',
    opis: 'Weryfikacja wypowiedzi rówieśnika — uwaga: nie zawsze jest błąd, czasem zdanie jest poprawne!',
  },
};

export interface VariantProgress {
  variant: 'A' | 'B' | 'C' | 'D';
  total: number;
  passed: number;
  isUnlocked: boolean;
  isCompleted: boolean;
}

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

export interface UserSessionMinimal {
  id?: string;
  topic_id?: string;
  numer?: number;
  status?: string;
  score?: number;
  is_correct?: boolean | number;
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
 * Computes progress and unlock state across all 13 chapters.
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
 * Resolves the next question in learning order.
 * - For geography: follows Dział 1..13 -> Variant A -> B -> C -> D.
 *   Finds the first unlocked variant with an uncompleted question, or the question right after the current one.
 * - For math/polish: finds the question directly after the current one, or the first uncompleted question.
 */
export function getNextTopic(
  topics: Topic[],
  userSessions: UserSessionMinimal[],
  currentTopicNumerOrId?: number | string,
  przedmiot: string = 'geografia'
): Topic | null {
  if (!topics || topics.length === 0) return null;

  if (przedmiot === 'geografia') {
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

  // Math / Polish logic
  const sorted = [...topics].sort((a, b) => a.numer - b.numer);

  if (currentTopicNumerOrId !== undefined) {
    const currentIndex = sorted.findIndex(
      (t) => t.id === currentTopicNumerOrId || t.numer === currentTopicNumerOrId
    );
    if (currentIndex !== -1 && currentIndex < sorted.length - 1) {
      return sorted[currentIndex + 1];
    }
  }

  const unpassed = sorted.find((t) => !isQuestionPassed(t, userSessions));
  return unpassed || sorted[0];
}

