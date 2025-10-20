# API Endpoint Implementation Plan: Create Weight Record

## 1. Przegląd punktu końcowego
Ten punkt końcowy umożliwia uwierzytelnionemu użytkownikowi dodanie nowego rekordu pomiaru wagi. Przyjmuje datę pomiaru oraz wagę w kilogramach, a po pomyślnym zapisaniu w bazie danych zwraca nowo utworzony obiekt rekordu.

## 2. Szczegóły żądania
-   **Metoda HTTP**: `POST`
-   **Struktura URL**: `/api/weight`
-   **Request Body**: Ciało żądania musi być w formacie JSON i zawierać następujące pola:
    ```json
    {
      "date": "YYYY-MM-DD",
      "weight_kg": number
    }
    ```
-   **Parametry**:
    -   Wymagane: `date`, `weight_kg`
    -   Opcjonalne: Brak

## 3. Wykorzystywane typy
-   **Command Model**: `CreateWeightRecordCommand` (`src/types.ts`) - Definiuje strukturę danych wejściowych dla tworzenia rekordu.
-   **DTO**: `WeightRecordDto` (`src/types.ts`) - Definiuje strukturę danych zwracanych przez API po pomyślnym utworzeniu rekordu.

## 4. Szczegóły odpowiedzi
-   **Odpowiedź sukcesu**:
    -   **Kod statusu**: `201 Created`
    -   **Ciało odpowiedzi**: Obiekt JSON reprezentujący nowo utworzony rekord wagi, zgodny z typem `WeightRecordDto`.
        ```json
        {
          "id": 1,
          "date": "2025-10-16",
          "weight_kg": 76.0
        }
        ```
-   **Odpowiedzi błędów**:
    -   `400 Bad Request`: Błędy walidacji danych wejściowych.
    -   `401 Unauthorized`: Użytkownik nie jest uwierzytelniony.
    -   `500 Internal Server Error`: Wewnętrzny błąd serwera, np. problem z bazą danych.

## 5. Przepływ danych
1.  Klient wysyła żądanie `POST` na adres `/api/weight` z danymi w ciele żądania.
2.  Middleware Astro (`src/middleware/index.ts`) przechwytuje żądanie, weryfikuje sesję użytkownika za pomocą `context.locals.supabase` i dołącza dane użytkownika do `context.locals.user`. Jeśli sesja jest nieprawidłowa, żądanie jest odrzucane.
3.  Handler API w `src/pages/api/weight.ts` jest wywoływany.
4.  Handler sprawdza, czy `context.locals.user` istnieje. Jeśli nie, zwraca odpowiedź `401 Unauthorized`.
5.  Ciało żądania jest walidowane przy użyciu schemy Zod zdefiniowanej dla `CreateWeightRecordCommand`. W przypadku błędu walidacji zwracana jest odpowiedź `400 Bad Request`.
6.  Handler wywołuje funkcję `createWeightRecord` z nowego serwisu `src/lib/services/weightService.ts`, przekazując klienta Supabase (`context.locals.supabase`), ID użytkownika (`context.locals.user.id`) oraz zwalidowane dane.
7.  Serwis `weightService` wykonuje operację `insert` na tabeli `weight_records` w bazie danych Supabase.
8.  Po pomyślnym zapisie, serwis zwraca nowo utworzony rekord do handlera.
9.  Handler formatuje odpowiedź i odsyła ją do klienta z kodem statusu `201 Created`.

## 6. Względy bezpieczeństwa
-   **Uwierzytelnianie**: Dostęp do punktu końcowego jest chroniony i wymaga aktywnej sesji użytkownika, która jest weryfikowana przez middleware Astro.
-   **Autoryzacja**: Identyfikator użytkownika (`user_id`) do zapisu rekordu jest pobierany wyłącznie z zaufanego obiektu sesji po stronie serwera (`context.locals.user`). Zapobiega to możliwości tworzenia rekordów w imieniu innych użytkowników.
-   **Walidacja danych**: Ścisła walidacja danych wejściowych za pomocą Zod chroni przed niepoprawnymi danymi i potencjalnymi atakami (np. SQL Injection, mimo że Supabase SDK parametryzuje zapytania).

## 7. Obsługa błędów
-   **Błąd walidacji (400)**: Zwracany, gdy dane wejściowe nie przejdą walidacji Zod (brakujące pola, złe typy, niepoprawny format). Odpowiedź powinna zawierać szczegóły błędu.
-   **Brak autoryzacji (401)**: Zwracany, gdy middleware nie znajdzie aktywnej sesji użytkownika.
-   **Błąd serwera (500)**: Zwracany w przypadku niepowodzenia operacji zapisu do bazy danych lub innego nieoczekiwanego błędu po stronie serwera. Szczegóły błędu powinny być logowane na serwerze.

## 8. Rozważania dotyczące wydajności
Operacja jest prostym zapisem (`INSERT`) do bazy danych, co jest wysoce zoptymalizowane w PostgreSQL. Oczekuje się bardzo wysokiej wydajności. Indeksy na kolumnach `user_id` i `date` w tabeli `weight_records` zapewnią szybkie odpytywanie danych w przyszłości, ale nie mają krytycznego wpływu na wydajność samej operacji tworzenia.

## 9. Etapy wdrożenia
1.  **Utworzenie pliku serwisu**: Stwórz nowy plik `src/lib/services/weightService.ts`.
2.  **Implementacja logiki serwisu**: W `weightService.ts` zaimplementuj funkcję `createWeightRecord(supabase, userId, data)`, która będzie odpowiedzialna za dodanie rekordu do tabeli `weight_records` i zwróci nowo utworzony obiekt.
3.  **Utworzenie pliku endpointu**: Stwórz nowy plik `src/pages/api/weight.ts`.
4.  **Definicja schemy Zod**: W `weight.ts` zdefiniuj schemę walidacji Zod dla `CreateWeightRecordCommand`, uwzględniając typy, formaty i wymagane pola.
5.  **Implementacja handlera POST**: W `weight.ts` zaimplementuj handler `POST`, który:
    a.  Pobiera obiekt użytkownika z `context.locals.user`.
    b.  Waliduje ciało żądania przy użyciu zdefiniowanej schemy Zod.
    c.  Wywołuje funkcję `createWeightRecord` z serwisu.
    d.  Obsługuje błędy i zwraca odpowiednie kody statusu.
    e.  W przypadku sukcesu, zwraca odpowiedź `201 Created` z danymi nowego rekordu.
6.  **Eksport konfiguracji**: Upewnij się, że plik `weight.ts` eksportuje `export const prerender = false;`, aby zapewnić dynamiczne renderowanie.
