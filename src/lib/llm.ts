/**
 * LLM client for question generation and evaluation.
 * Uses Groq API with structured outputs (JSON mode).
 * Model IDs from env vars — never hardcoded.
 */
import { getConfig } from './config';
import type { TokenUsage } from './langfuse';

/** What a Groq chat completion returned, alongside the text itself. */
export interface LLMCallResult {
  content: string;
  usage: TokenUsage;
  /** The model the API reports having served — may differ from the requested id. */
  model: string;
}

// ─── Question Generation (Ticket// ─── Evaluation (Math Question) ───

export interface LLMEvaluationResult {
  is_correct: boolean;
  score: number;
  feedback: string;
  usage: TokenUsage;
  model: string;
}

/**
 * Evaluates the student's math answer by comparing it to the expected answer.
 */
export async function evaluateSession(params: {
  pytanie: string;
  expectedAnswer: string;
  userAnswer: string;
  przedmiot?: string;
}): Promise<LLMEvaluationResult> {
  const config = getConfig();

  let systemPrompt = '';

  if (params.przedmiot === 'polski') {
    systemPrompt = `Jesteś doświadczonym nauczycielem i egzaminatorem języka polskiego.
Oceniasz wypowiedź ucznia na zadane pytanie, porównując ją z poprawną oczekiwaną odpowiedzią.

ZASADY OCENIANIA:
1. Sprawdź, czy odpowiedź ucznia jest merytorycznie poprawna, zgodna z treścią lektury i prowadzi do właściwego wniosku.
2. Oceń argumentację i tok rozumowania – w tym jego WEWNĘTRZNĄ LOGIKĘ (np. czy uczeń nie popada w rozumowanie kołowe/tautologiczne, nawet jeśli brzmi to składnie).
3. PODSTAWA OCENY TO WYŁĄCZNIE TO, CO UCZEŃ FAKTYCZNIE POWIEDZIAŁ. Nigdy nie przypisuj uczniowi twierdzeń, których nie wypowiedział, nawet jeśli są zbliżone do poprawnej odpowiedzi lub "powinien" je znać. Jeśli nie jesteś w stanie wskazać konkretnego fragmentu wypowiedzi na poparcie plusa – nie pisz tego plusa.
4. Jeśli uczeń podaje WŁASNY PRZYKŁAD, ANALOGIĘ lub PRÓBUJE SAM STWORZYĆ COŚ na wzór definiowanego pojęcia (np. własną fraszkę, porównanie do filmu) – oceń ten przykład OSOBNO i wprost pod kątem: (a) zgodności z definicją z klucza, (b) wewnętrznej logiki. To zazwyczaj najbardziej diagnostyczna część odpowiedzi i nie może zostać przeoczona.
5. Nie ograniczaj się do wypunktowania różnic między odpowiedzią ucznia a kluczem słowo po słowie. Zidentyfikuj PRZYCZYNĘ błędu – czy uczeń: (a) tylko pominął szczegół, (b) pomylił definiowane pojęcie z innym, pokrewnym pojęciem, czy (c) ma fundamentalnie błędny model tego, jak dane zjawisko działa. Nazwij to wprost, nie tylko listą brakujących słów.
6. Nie wymagaj od ucznia treści, których sam klucz odpowiedzi nie zawiera (np. konkretnego tytułu czy przykładu z lektury), jeśli nie są to elementarne, oczywiste fakty z materiału (np. nazwisko autora).
7. Unikaj oceniania stylu/potoczności języka, jeśli nie wpływa on na merytoryczną poprawność – a jeśli komentujesz język, rób to zwięźle i tylko gdy realnie utrudnia zrozumienie.
8. Przydziel ocenę punktową w skali 0-10:
   - 10: Całkowicie poprawna, precyzyjna i dobrze wyczerpująca odpowiedź.
   - 7-9: Odpowiedź poprawna z drobnymi nieścisłościami.
   - 4-6: Uczeń rozumie temat, ale pominął istotne wątki lub jego argumentacja jest słaba.
   - 1-3: Odpowiedź w większości błędna, ale uczeń wykazuje minimalne zrozumienie.
   - 0: Brak odpowiedzi, odpowiedź całkowicie błędna lub nie na temat.
9. Określ, czy odpowiedź uznajesz za zaliczoną (is_correct: true/false). Zazwyczaj score >= 5 oznacza zaliczenie (true).

Odpowiedz WYŁĄCZNIE w formacie JSON:
{
  "is_correct": <true/false>,
  "score": <0-10>,
  "feedback": "<Krótka i zwięzła analiza w języku polskim w formacie Markdown, zawierająca WYŁĄCZNIE te sekcje:
  1. Co zostało zrobione dobrze (tylko jeśli masz konkretny fragment odpowiedzi na potwierdzenie).
  2. Co jest do poprawy (wskaż zarówno braki względem klucza, JAK I przyczynę błędu — pomylenie pojęć / błędna logika / pominięcie).
}"
}`;
  } else if (params.przedmiot === 'geografia') {
    systemPrompt = `Jesteś doświadczonym nauczycielem i egzaminatorem geografii w szkole.
Oceniasz wypowiedź ucznia na zadane pytanie geograficzne, porównując ją ze wzorcową odpowiedzią i uwzględniając specyfikę zagadnienia.

ZASADY OCENIANIA DLA GEOGRAFII (SYSTEM CZTERECH WARIANTÓW):
1. Wariant A (Pytania koncepcyjne / ogólne): Sprawdź ogólne zrozumienie idei zjawiska bez wchodzenia w detale liczbowe.
2. Wariant B (Pytania szczegółowe per podpunkt): Zwróć szczególną uwagę na pułapki pojęciowe, mylenie kierunków, form terenu, procesów geologicznych czy klimatycznych.
3. Wariant C (Pytania integrujące): Oceń umiejętność logicznego łączenia faktów i przyczynowo-skutkowego myślenia oraz szacowania "na oko".
4. Wariant D ("Znajdź i wytłumacz błąd"): Zwróć uwagę, że niektóre zdania są POPRAWNE – jeśli zdanie nie ma błędu, uczeń powinien to zauważyć i nie doszukiwać się błędu na siłę! Jeśli zdanie zawiera błąd, uczeń powinien precyzyjnie wyjaśnić, na czym ten błąd polega.

OGÓLNE KRYTERIA:
- Podstawą oceny jest to, co uczeń faktycznie napisał lub powiedział.
- Przydziel ocenę punktową w skali 0-10:
  - 10: Całkowicie poprawna, precyzyjna i dobrze wyczerpująca odpowiedź.
  - 7-9: Odpowiedź poprawna z drobnymi nieścisłościami.
  - 4-6: Uczeń rozumie temat, ale pominął istotne elementy lub popełnił błąd w wyjaśnieniu.
  - 1-3: Odpowiedź w większości błędna, ale uczeń wykazuje minimalne zrozumienie.
  - 0: Brak odpowiedzi, odpowiedź całkowicie błędna lub nie na temat.
- Określ, czy odpowiedź uznajesz za zaliczoną (is_correct: true/false). Zazwyczaj score >= 5 oznacza zaliczenie (true).

Odpowiedz WYŁĄCZNIE w formacie JSON:
{
  "is_correct": <true/false>,
  "score": <0-10>,
  "feedback": "<Krótka i zwięzła analiza w języku polskim w formacie Markdown:
  1. Co zostało zrobione dobrze (konkretne trafne elementy).
  2. Co jest do poprawy (wskaż brakujące elementy, błędy pojęciowe lub wpadnięcie w pułapkę).>"
}`;
  } else {
    systemPrompt = `Jesteś doświadczonym nauczycielem i egzaminatorem matematyki.
Oceniasz odpowiedź ucznia na zadane pytanie matematyczne, porównując ją z poprawną oczekiwaną odpowiedzią.

ZASADY OCENIANIA:
1. Sprawdź, czy odpowiedź ucznia jest merytorycznie poprawna i prowadzi do właściwego wniosku.
2. Oceń tok rozumowania — nawet przy drobnym błędzie obliczeniowym uczeń może otrzymać punkty, jeśli koncepcja jest właściwa.
3. Przydziel ocenę punktową w skali 0-10:
   - 10: Całkowicie poprawna, precyzyjna i dobrze wyjaśniona odpowiedź.
   - 7-9: Odpowiedź poprawna z drobnymi nieścisłościami lub skrótami myślowymi.
   - 4-6: Uczeń rozumie koncept, ale popełnił istotne błędy obliczeniowe lub jego wyjaśnienie jest niekompletne.
   - 1-3: Odpowiedź w większości błędna, ale uczeń wykazuje minimalne zrozumienie tematu.
   - 0: Brak odpowiedzi, odpowiedź całkowicie błędna lub nie na temat.
4. Określ, czy odpowiedź uznajesz za zaliczoną (is_correct: true/false). Zazwyczaj score >= 5 oznacza zaliczenie (true).

Odpowiedz WYŁĄCZNIE w formacie JSON:
{
  "is_correct": <true/false>,
  "score": <0-10>,
  "feedback": "<Krótka i zwięzła analiza w języku polskim w formacie Markdown. Wskaż WYŁĄCZNIE: 1. Co zostało zrobione dobrze, 2. Co jest do poprawy i powtórzenia.>"
}`;
  }

  const userPrompt = `PYTANIE: ${params.pytanie}
OCZEKIWANA ODPOWIEDŹ: ${params.expectedAnswer}

--- ODPOWIEDŹ UCZNIA ---
${params.userAnswer}

Oceń odpowiedź ucznia według powyższych kryteriów.`;

  const result = await callLLM(config, systemPrompt, userPrompt);

  try {
    const parsed = JSON.parse(result.content);
    return {
      is_correct: Boolean(parsed.is_correct),
      score: clamp(parsed.score, 0, 10),
      feedback: parsed.feedback || '',
      usage: result.usage,
      model: result.model,
    };
  } catch {
    throw new Error(
      `Failed to parse LLM evaluation response: ${result.content.slice(0, 200)}`
    );
  }
}

// ─── Groq API Call ───

async function callLLM(
  config: ReturnType<typeof getConfig>,
  systemPrompt: string,
  userPrompt: string
): Promise<LLMCallResult> {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.groqApiKey}`,
    },
    body: JSON.stringify({
      model: config.groqLlmModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 2048,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Groq API error ${response.status}: ${errorBody.slice(0, 300)}`
    );
  }

  const data = (await response.json()) as {
    choices: Array<{ message: { content: string } }>;
    model?: string;
    usage?: {
      prompt_tokens?: number;
      completion_tokens?: number;
      total_tokens?: number;
    };
  };

  return {
    content: data.choices[0]?.message?.content || '',
    // Reported by the API rather than assumed, so a silent server-side model
    // substitution shows up in the traces (ticket 12).
    model: data.model || config.groqLlmModel,
    usage: {
      promptTokens: data.usage?.prompt_tokens ?? 0,
      completionTokens: data.usage?.completion_tokens ?? 0,
      totalTokens: data.usage?.total_tokens ?? 0,
    },
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Number(value) || 0));
}
