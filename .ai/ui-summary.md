<conversation_summary>
<decisions>
1. Zostaje wdrożony obowiązkowy przepływ tworzenia profilu dla nowych użytkowników, blokujący dostęp do innych części aplikacji do momentu uzupełnienia wymaganych danych (imię, nazwisko, data urodzenia, wzrost).
2. Główny pulpit aplikacji zostanie zaprojektowany tak, aby na górze prezentować kluczowe wykresy (waga, ciśnienie) z filtrami czasowymi, a poniżej skondensowane listy ostatnich pomiarów z każdej kategorii.
3. Zostanie zaimplementowana nawigacja oparta na dolnym pasku (Tab Bar) zoptymalizowana pod kątem urządzeń mobilnych, zapewniająca dostęp do Pulpitu, Historii, dodawania danych i Profilu.
4. Do zarządzania stanem serwera zostanie wykorzystana biblioteka `TanStack Query` (React Query) w celu obsługi pobierania danych, buforowania, synchronizacji oraz stanów ładowania i błędów.
5. Operacje edycji i usuwania rekordów będą realizowane poprzez menu kontekstowe na listach oraz modale potwierdzające, zgodnie z przepływami zdefiniowanymi w API.
6. Zostanie wdrożona ujednolicona strategia obsługi błędów: powiadomienia typu "toast" dla błędów ogólnych, komunikaty inline przy polach formularzy dla błędów walidacji oraz przekierowanie do logowania przy błędach autoryzacji.
7. Zostaną zastosowane techniki "Optimistic UI" dla operacji CRUD w celu poprawy odczuwalnej wydajności aplikacji.
8. Walidacja formularzy po stronie klienta będzie realizowana za pomocą bibliotek `React Hook Form` i `Zod`, z schematami walidacji odzwierciedlającymi reguły API.
9. Do tworzenia interaktywnych i responsywnych wykresów zostanie użyta biblioteka `Recharts` lub `Chart.js`.
10. Stany ładowania danych w interfejsie będą wizualizowane przy użyciu komponentów "skeleton loader".
</decisions>
<matched_recommendations>
1. **Przepływ dla nowego użytkownika (Rekomendacja 1):** Potwierdzono konieczność bezwzględnego przekierowania do formularza profilu po rejestracji i zablokowania dostępu do reszty aplikacji, co jest kluczowe dla logiki biznesowej (np. obliczania BMI).
2. **Nawigacja mobilna (Rekomendacja 3):** Zdecydowano się na dolny pasek nawigacyjny jako główny element nawigacyjny, co jest standardem w aplikacjach mobilnych i najlepiej odpowiada wymaganiom responsywności.
3. **Zarządzanie stanem serwera (Rekomendacja 4):** Wybór `TanStack Query` jest strategiczną decyzją, która wpłynie na uproszczenie logiki pobierania danych, buforowania i synchronizacji z API w całej aplikacji.
4. **Strategia obsługi błędów i stanów ładowania (Rekomendacje 6 i 10):** Ustalono kompleksowe podejście do informowania użytkownika o stanie aplikacji, wykorzystując toasty, komunikaty inline oraz skeleton loaders, co zapewni spójne i czytelne doświadczenie użytkownika.
5. **Walidacja formularzy (Rekomendacja 8):** Przyjęcie `React Hook Form` i `Zod` do walidacji po stronie klienta zapewni natychmiastową informację zwrotną dla użytkownika i zmniejszy liczbę niepoprawnych zapytań do API.
</matched_recommendations>
<ui_architecture_planning_summary>
### Główne wymagania dotyczące architektury UI
Architektura interfejsu użytkownika musi wspierać wszystkie funkcjonalności zdefiniowane w PRD, w tym uwierzytelnianie, zarządzanie profilem, operacje CRUD na trzech typach danych (waga, ciśnienie krwi, objawy) oraz wizualizację danych na wykresach. Interfejs musi być zaprojektowany w podejściu "mobile-first" i zoptymalizowany dla przeglądarki Chrome na urządzeniach mobilnych, wykorzystując komponenty z biblioteki Shadcn/ui na frameworku Astro z React.

### Kluczowe widoki, ekrany i przepływy użytkownika
- **Przepływ uwierzytelniania:**
  - `Rejestracja` -> `Logowanie` -> (dla nowego użytkownika) -> `Wymuszone tworzenie profilu` -> `Pulpit`.
- **Główne widoki aplikacji:**
  1. **Pulpit (Dashboard):** Centralny ekran z wizualizacjami danych (wykresy wagi i ciśnienia) pobieranymi z endpointów `/api/charts/*`. Umożliwia filtrowanie danych wg okresu i wyświetla podsumowania ostatnich pomiarów. Zawiera wyraźne wezwanie do akcji (CTA) w celu dodania nowych danych.
  2. **Historia:** Widok z zakładkami lub segmentami dla każdego typu pomiaru (Waga, Ciśnienie, Objawy). Wyświetla paginowane listy danych pobierane z endpointów `/api/weight`, `/api/blood-pressure` i `/api/symptoms`. Każdy wpis umożliwia edycję i usunięcie.
  3. **Formularze (Dodaj/Edytuj):** Implementowane jako modale lub osobne strony do tworzenia i aktualizacji rekordów, komunikujące się z odpowiednimi endpointami API (POST/PUT).
  4. **Profil Użytkownika:** Ekran umożliwiający edycję danych profilowych (imię, nazwisko, data urodzenia, wzrost) poprzez endpoint `PUT /api/users/me`.
- **Nawigacja:** Główna nawigacja oparta na dolnym pasku (Tab Bar) zawierającym ikony: `Pulpit`, `Historia`, `Dodaj` (+), `Profil`.

### Strategia integracji z API i zarządzania stanem
- **Zarządzanie stanem serwera:** `TanStack Query` będzie centralnym narzędziem do zarządzania cyklem życia danych z API. Będzie odpowiedzialne za pobieranie, buforowanie, unieważnianie i synchronizację danych, co znacząco uprości logikę komponentów.
- **Zarządzanie stanem klienta:** Stan po stronie klienta (np. stan formularzy, otwarte modale) będzie zarządzany lokalnie w komponentach za pomocą hooków React (`useState`, `useReducer`).
- **Walidacja formularzy:** `React Hook Form` w połączeniu z `Zod` zapewni walidację po stronie klienta, spójną z regułami zdefiniowanymi w API, dając użytkownikowi natychmiastową informację zwrotną.
- **Wydajność:** Zostaną zaimplementowane techniki "Optimistic UI", aby operacje zapisu wydawały się natychmiastowe.

### Kwestie dotyczące responsywności, dostępności i bezpieczeństwa
- **Responsywność:** Architektura będzie oparta na podejściu mobile-first z wykorzystaniem `Tailwind CSS`. Komponenty `Shadcn/ui` zapewnią responsywność "out-of-the-box".
- **Dostępność (A11y):** Zostanie położony nacisk na użycie semantycznego HTML oraz dostępnych komponentów z biblioteki `Shadcn/ui`.
- **Bezpieczeństwo:** Uwierzytelnianie jest obsługiwane przez Supabase (JWT). Zadaniem UI jest bezpieczne zarządzanie tokenem (za pośrednictwem klienta Supabase), dołączanie go do każdego żądania API oraz obsługa błędów autoryzacji (401/403) poprzez globalne przekierowanie użytkownika na stronę logowania.
</ui_architecture_planning_summary>
<unresolved_issues>
Na obecnym etapie wszystkie kluczowe kwestie dotyczące architektury UI zostały zaadresowane, a rekomendacje przyjęte. Nie zidentyfikowano nierozwiązanych problemów wymagających dalszych wyjaśnień.
</unresolved_issues>
</conversation_summary>
