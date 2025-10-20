# API Endpoint Implementation Plan: Update Weight Record

## 1. Przegląd punktu końcowego
Ten dokument opisuje plan wdrożenia punktu końcowego API `PUT /api/weight/{id}`, który umożliwia zalogowanym użytkownikom aktualizację istniejącego rekordu wagi. Punkt końcowy będzie odpowiedzialny za walidację danych wejściowych, weryfikację uprawnień użytkownika oraz aktualizację odpowiedniego rekordu w bazie danych Supabase.

## 2. Szczegóły żądania
- **Metoda HTTP**: `PUT`
- **Struktura URL**: `/api/weight/{id}`
- **Parametry**:
  - **Parametry ścieżki (wymagane)**:
    - `id` (number): Unikalny identyfikator rekordu wagi, który ma zostać zaktualizowany.
- **Request Body**:
  - **Typ**: `application/json`
  - **Struktura**: Obiekt zgodny z typem `UpdateWeightRecordCommand`.
    ```json
    {
      "date": "2025-10-15",
      "weight_kg": 75.2
    }
    ```

## 3. Wykorzystywane typy
- **Command Model (Request Body)**: `UpdateWeightRecordCommand` z `src/types.ts`
- **DTO (Response Body)**: `WeightRecordDto` z `src/types.ts`

## 4. Szczegóły odpowiedzi
- **Odpowiedź sukcesu (`200 OK`)**: Zwraca zaktualizowany obiekt rekordu wagi.
  ```json
  {
    "id": 1,
    "date": "2025-10-15",
    "weight_kg": 75.2
  }
  ```
- **Odpowiedzi błędów**:
  - `400 Bad Request`: Błędy walidacji danych wejściowych.
  - `401 Unauthorized`: Użytkownik nie jest uwierzytelniony.
  - `403 Forbidden`: Użytkownik nie ma uprawnień do modyfikacji tego zasobu.
  - `404 Not Found`: Rekord o podanym `id` nie został znaleziony.
  - `500 Internal Server Error`: Wewnętrzny błąd serwera.

## 5. Przepływ danych
1. Klient wysyła żądanie `PUT` na adres `/api/weight/{id}` z tokenem uwierzytelniającym i danymi w ciele żądania.
2. Middleware Astro weryfikuje token i dołącza obiekt użytkownika do `context.locals.user`.
3. Handler API w `src/pages/api/weight/[id].ts` jest wywoływany.
4. Handler sprawdza, czy `context.locals.user` istnieje (uwierzytelnienie).
5. Dane wejściowe (`id` z parametru ścieżki i ciało żądania) są walidowane przy użyciu schemy Zod.
6. Handler wywołuje funkcję `updateWeightRecord` z serwisu `weightService`.
7. Funkcja `updateWeightRecord` w `src/lib/services/weightService.ts` wykonuje zapytanie `UPDATE` do tabeli `weight_records` w bazie Supabase. Zapytanie zawiera klauzulę `WHERE`, aby upewnić się, że rekord o podanym `id` należy do zalogowanego użytkownika (`user_id`).
8. Jeśli zapytanie zaktualizuje 0 wierszy (rekord nie istnieje lub nie należy do użytkownika), serwis zwraca odpowiedni status.
9. Jeśli aktualizacja się powiedzie, serwis zwraca zaktualizowane dane.
10. Handler API formatuje odpowiedź (sukces lub błąd) i odsyła ją do klienta z odpowiednim kodem statusu HTTP.

## 6. Względy bezpieczeństwa
- **Uwierzytelnianie**: Dostęp do punktu końcowego musi być chroniony. Każde żądanie musi być uwierzytelnione za pomocą mechanizmu Supabase. Handler API musi odrzucić żądania bez prawidłowej sesji użytkownika (`context.locals.user`).
- **Autoryzacja**: Użytkownik może modyfikować wyłącznie własne rekordy wagi. Logika serwisu musi rygorystycznie egzekwować tę zasadę poprzez filtrowanie zapytań do bazy danych po `user_id` zalogowanego użytkownika.
- **Walidacja danych**: Wszystkie dane wejściowe (parametry ścieżki, ciało żądania) muszą być walidowane za pomocą Zod, aby zapobiec atakom typu SQL Injection i zapewnić integralność danych.

## 7. Obsługa błędów
- **Błędy walidacji (400)**: Zod wygeneruje szczegółowe komunikaty o błędach, które zostaną zwrócone w odpowiedzi API.
- **Brak uwierzytelnienia (401)**: Jeśli `context.locals.user` jest `null`, zwrócony zostanie błąd 401.
- **Brak uprawnień (403)**: Jeśli zapytanie `UPDATE` nie znajdzie rekordu pasującego do `id` i `user_id`, co oznacza próbę modyfikacji cudzych danych, zwrócony zostanie błąd 403.
- **Nie znaleziono zasobu (404)**: Zanim nastąpi próba aktualizacji, sprawdzane jest istnienie rekordu. Jeśli nie istnieje, zwracany jest błąd 404.
- **Błędy serwera (500)**: Wszelkie błędy zgłoszone przez klienta Supabase lub inne nieprzewidziane wyjątki zostaną przechwycone, zalogowane po stronie serwera, a klient otrzyma ogólną odpowiedź o błędzie 500.

## 8. Rozważania dotyczące wydajności
- Zapytanie `UPDATE` do bazy danych będzie indeksowane po kluczu głównym (`id`) i potencjalnie po kluczu obcym (`user_id`), co zapewni wysoką wydajność operacji.
- Wolumen danych jest niewielki, więc nie przewiduje się problemów z wydajnością.

## 9. Etapy wdrożenia
1.  **Utworzenie serwisu**:
    -   Utwórz nowy plik `src/lib/services/weightService.ts`.
    -   Zaimplementuj w nim funkcję `updateWeightRecord(supabase, userId, recordId, data)`, która będzie zawierać logikę aktualizacji rekordu wagi w Supabase. Funkcja powinna obsługiwać przypadki, gdy rekord nie istnieje lub nie należy do użytkownika.
2.  **Utworzenie pliku trasy API**:
    -   Utwórz nowy plik `src/pages/api/weight/[id].ts`.
3.  **Implementacja handlera `PUT`**:
    -   W pliku `[id].ts` dodaj `export const prerender = false;`.
    -   Zaimplementuj asynchroniczną funkcję `PUT({ params, request, context })`.
    -   Sprawdź uwierzytelnienie, weryfikując `context.locals.user`.
4.  **Dodanie walidacji Zod**:
    -   Zdefiniuj schemę Zod do walidacji parametru `params.id` oraz ciała żądania (`request.json()`).
    -   Sprawdź poprawność danych wejściowych przy użyciu zdefiniowanej schemy.
5.  **Integracja z serwisem**:
    -   W handlerze `PUT`, po pomyślnej walidacji, wywołaj funkcję `updateWeightRecord` z odpowiednimi parametrami.
6.  **Obsługa odpowiedzi**:
    -   Na podstawie wyniku zwróconego z serwisu, skonstruuj i zwróć odpowiednią odpowiedź `Response` z właściwym kodem statusu (200, 400, 401, 403, 404, 500).
    -   Zaimplementuj globalną obsługę błędów przy użyciu bloku `try...catch` do przechwytywania nieoczekiwanych wyjątków.
