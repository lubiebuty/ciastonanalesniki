# 13: Logika blokady strzałek

**What to build:** Strzałka w lewo zawsze pozwala wrócić do poprzednio odpowiedzianego pytania. Strzałka w prawo prowadzi do następnego, ale jest zablokowana dopóki użytkownik nie odpowie na aktualne pytanie.

**Blocked by:** 12-question-navigation-arrows

**Status:** ready-for-agent

- [ ] Implementacja pobierania poprzedniego pytania dla strzałki w lewo
- [ ] Dodanie stanu `isAnswered` (lub podobnego) blokującego klikalność strzałki w prawo
- [ ] Odblokowanie strzałki w prawo po poprawnej/jakiejkolwiek odpowiedzi (zgodnie z załozeniami)
- [ ] Testy TDD weryfikujące disabled state prawego przycisku
