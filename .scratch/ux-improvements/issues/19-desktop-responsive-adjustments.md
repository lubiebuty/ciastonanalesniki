# 19: Dostosowanie widoków do usuniętego sidebara

**What to build:** Dopracowanie widoku na desktopie dla wyboru przedmiotów oraz pełnoekranowych pytań – wyśrodkowanie treści, ograniczenie maksymalnej szerokości (max-width), aby mimo braku sidebara aplikacja nie rozciągała się nienaturalnie.

**Blocked by:** 18-desktop-remove-sidebar, 07-subjects-tiles-layout, 12-question-navigation-arrows

**Status:** ready-for-agent

- [ ] Dodanie `max-w-4xl` lub `max-w-7xl` (wg uznania) do głównych kontenerów na stronach `/subjects` i w widoku pytań
- [ ] Upewnienie się, że elementy nawigacyjne (strzałki) są nadal na krawędziach ekranu (lub krawędziach kontenera)
- [ ] Weryfikacja ułożenia przycisków i kafelków, by nie były zbyt szerokie
- [ ] Test responsywności CSS
