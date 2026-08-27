# Symulator Matury Ustnej — Język Polski

Symulacja **Zadania 1** (lektura obowiązkowa) ustnej matury z polskiego: uczeń
nagrywa wypowiedź monologową, komisja (LLM) zadaje 1–3 pytania, a całość jest
oceniana według czterech kryteriów CKE w skali 0–22.

## Zakres MVP

- Symulowane jest **wyłącznie Zadanie 1**. Zadanie 2 (materiał literacki /
  nieliteracki / ikoniczny) jest poza zakresem.
- Skala **0–22**, nie oficjalna 0–30 — bo obejmuje tylko jedno zadanie.
- Tempo rozmowy (nagraj → wyślij → czekaj → następne) jest wolniejsze niż
  prawdziwe 5 minut przy komisji. Znane ograniczenie, komunikowane w UI.
- Audio **nigdy nie jest przechowywane** — plik tymczasowy jest kasowany
  natychmiast po transkrypcji.

## Uruchomienie

```bash
npm install
cp .env.local.example .env.local   # uzupełnij klucze
npm run seed                        # zasila tabelę topics z ../base/
npm run dev
```

Wymagane zmienne środowiskowe (`.env.local`):

| Zmienna | Opis |
| --- | --- |
| `GROQ_API_KEY` | klucz do Groq (STT + LLM) |
| `GROQ_STT_MODEL` | np. `whisper-large-v3-turbo` |
| `GROQ_LLM_MODEL` | np. `llama-3.3-70b-versatile` |
| `DATABASE_PATH` | ścieżka pliku SQLite |
| `AUTH_SECRET` / `NEXTAUTH_SECRET` | sekret NextAuth |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Google OAuth |
| `LANGFUSE_PUBLIC_KEY`, `LANGFUSE_SECRET_KEY` | opcjonalne — tracing |

Żaden identyfikator modelu nie jest zaszyty w kodzie. `GET /api/health` pinguje
oba modele i rozróżnia przyczynę awarii: 404 (model wycofany), 401/403 (zły
klucz), 429 (limit).

## Skrypty

| Polecenie | Działanie |
| --- | --- |
| `npm run dev` / `build` / `start` | serwer deweloperski / produkcyjny build |
| `npm test` | testy (vitest) |
| `npm run type-check` | `tsc --noEmit` |
| `npm run lint` | eslint |
| `npm run seed` / `db:reset` | zasilenie / przebudowa bazy |
| `npm run validate` | **harness golden set — patrz niżej** |

## ⚠️ Bramka walidacyjna — wyniki są obecnie ukryte

Obietnica „obiektywnej oceny" jest prawdziwa tylko wtedy, gdy pipeline zmierzono
względem transkrypcji ocenionych ręcznie przez polonistę. Dopóki to nie nastąpi,
`src/lib/validation-gate.ts` **blokuje pokazywanie punktacji uczniom** — ocena
się wykonuje i zapisuje, ale UI pokazuje wyjaśnienie zamiast liczb.

Bramka jest zamknięta, gdy zachodzi którykolwiek z warunków:

- harness nigdy nie był uruchomiony,
- `data/golden-set.json` ma `"synthetic": true`,
- zbiór liczy mniej niż 15 transkrypcji,
- którekolwiek kryterium przekroczyło próg MAD,
- LLM nie zgodził się z nauczycielem co do błędu kardynalnego.

**Aby ją otworzyć:**

1. Zastąp fixture'y w `data/golden-set.json` **15–20 prawdziwymi** transkrypcjami
   z ocenami nauczyciela (schemat opisany w polu `_README` tego pliku).
2. Ustaw `"synthetic": false`.
3. Uruchom `npm run validate` — musi zakończyć się kodem 0.

Aktualne fixture'y (4 sztuki) są **wymyślone**. Sprawdzają, że harness działa
end-to-end; nie dowodzą niczego o zgodności z oceną człowieka.

Progi akceptacji (średnia bezwzględna rozbieżność na kryterium) są
udokumentowane w `scripts/validate-golden-set.ts`.

## Architektura

Jedna aplikacja Next.js (frontend + API routes), bez osobnego backendu Node.
SQLite przez `better-sqlite3`, z wolumenem Dockera dla trwałości.

```
src/lib/          logika domenowa (db, evaluation, vad, llm, langfuse, gates)
src/app/api/      API routes
src/components/   UI
scripts/          seed + harness walidacyjny
data/             baza SQLite, golden set
```

### Nagrywanie (tickety 04 + 05)

`MediaRecorder` jest **restartowany** dla każdego fragmentu, a nie uruchamiany
raz z `timeslice`: tylko pierwszy blob ciągłego strumienia ma poprawny nagłówek
kontenera, więc kolejne byłyby samodzielnie nieodkodowywalne przez Whisper.

Moment cięcia wybiera `decideChunk` (`src/lib/vad.ts`), nie stały timer:

| Decyzja | Kiedy |
| --- | --- |
| `discard` | w oknie nie było mowy — nie wysyłamy, nie płacimy |
| `extend` | mowy mniej niż ~10 s (minimum rozliczeniowe Groq) albo uczeń wciąż mówi |
| `send` | dość mowy i naturalna pauza |

`extend` jest mechanizmem batchowania — sklejanie gotowych blobów webm jest
niemożliwe (patrz wyżej), więc „łączenie" polega na **nieprzerywaniu** nagrania.

### Ocena (ticket 08)

Cztery osobne kryteria + kaskada zerowania, liczone **po stronie serwera** —
LLM nigdy nie zwraca sumy. Błąd kardynalny za Zadanie 1 jest niemożliwy dla
lektur typu `FRAGMENT` (zgodnie z rubryką CKE).

## Znane luki

- `data/golden-set.json` zawiera 4 syntetyczne fixture'y zamiast 15–20
  prawdziwych — bramka walidacyjna jest z tego powodu zamknięta.
- Dane źródłowe (`../base/`) zawierają 48 zagadnień obejmujących 11 lektur,
  wszystkie typu `CAŁOŚĆ`. Ścieżka `FRAGMENT` jest zaimplementowana i pokryta
  testami, ale nie występuje w realnych danych.
