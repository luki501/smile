# API Endpoint Implementation Plan: 
weight-records-get-implementation-plan.md

## 1. Przegląd punktu końcowego
Celem tego punktu końcowego jest dostarczenie klientowi paginowanej listy historycznych rekordów wagi dla uwierzytelnionego użytkownika. Dane będą posortowane chronologicznie, od najnowszego do najstarszego rekordu.

## 2. Szczegóły żądania
- **Metoda HTTP**: `GET`
- **Struktura URL**: `/api/weight`
- **Parametry**:
  - **Opcjonalne Query Parameters**:
    - `page` (number, default: 1): Numer strony do pobrania.
    - `pageSize` (number, default: 30): Liczba rekordów na stronie.
- **Request Body**: Brak

## 3. Wykorzystywane typy
- `PaginatedResponseDto<WeightRecordDto>`: Główny typ odpowiedzi, zawierający dane i informacje o paginacji.
- `WeightRecordDto`: Obiekt transferu danych dla pojedynczego rekordu wagi.
- `PaginationDto`: Obiekt zawierający szczegóły paginacji (`page`, `pageSize`, `total`).

## 4. Szczegóły odpowiedzi
- **Sukces (200 OK)**: Zwraca obiekt `PaginatedResponseDto<WeightRecordDto>`.
  ```json
  {
    "data": [
      {
        "id": 101,
        "date": "2025-10-15",
        "weight_kg": 75.5
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 30,
      "total": 1
    }
  }
  ```
- **Błędy**:
  - `400 Bad Request`: Nieprawidłowe parametry zapytania.
  - `401 Unauthorized`: Użytkownik nie jest uwierzytelniony.
  - `500 Internal Server Error`: Wewnętrzny błąd serwera.

## 5. Przepływ danych
1.  Klient wysyła żądanie `GET` na adres `/api/weight`.
2.  Middleware Astro weryfikuje token JWT i dołącza dane użytkownika do `context.locals`. Jeśli weryfikacja nie powiedzie się, zwraca `401 Unauthorized`.
3.  Handler API `GET` w `src/pages/api/weight/index.ts` jest wywoływany.
4.  Handler parsuje i waliduje parametry `page` i `pageSize` przy użyciu schemy Zod. W przypadku błędu walidacji zwraca `400 Bad Request`.
5.  Handler wywołuje funkcję serwisową, np. `getWeightRecords(userId, page, pageSize)`, z nowo utworzonego `src/lib/services/weightService.ts`, przekazując ID uwierzytelnionego użytkownika oraz parametry paginacji.
6.  Funkcja serwisowa `getWeightRecords` wykonuje dwa zapytania do bazy danych Supabase:
    a. Jedno zapytanie do zliczenia całkowitej liczby rekordów wagi dla danego `user_id`.
    b. Drugie zapytanie do pobrania właściwej strony danych, używając `limit` (`pageSize`) i `offset` (`(page - 1) * pageSize`), filtrując po `user_id` i sortując po `date` malejąco.
7.  Serwis zwraca pobrane dane oraz całkowitą liczbę rekordów do handlera API.
8.  Handler API formatuje dane do struktury `PaginatedResponseDto<WeightRecordDto>` i zwraca odpowiedź JSON z kodem statusu `200 OK`.

## 6. Względy bezpieczeństwa
- **Autoryzacja**: Dostęp do punktu końcowego musi być ograniczony tylko do uwierzytelnionych użytkowników. Middleware Astro będzie odpowiedzialne za weryfikację sesji.
- **Izolacja danych**: Kluczowe jest, aby każde zapytanie do bazy danych zawierało warunek `WHERE user_id = :authenticated_user_id`, aby uniemożliwić jednemu użytkownikowi dostęp do danych innego. `user_id` musi pochodzić wyłącznie z zaufanego źródła (sesji), a nie z parametrów żądania.

## 7. Obsługa błędów
- **Błędy walidacji (400)**: Jeśli `page` lub `pageSize` są nieprawidłowe (np. ujemne, nie-liczbowe), Zod zwróci błąd, a serwer odpowie `400 Bad Request` ze szczegółami błędu.
- **Brak uwierzytelnienia (401)**: Middleware zwróci `401`, jeśli użytkownik nie jest zalogowany.
- **Błędy serwera (500)**: Wszelkie błędy podczas wykonywania zapytania do bazy danych (np. problem z połączeniem) będą przechwytywane w bloku `try...catch`. Zostaną zalogowane po stronie serwera, a klient otrzyma odpowiedź `500 Internal Server Error` z ogólnym komunikatem.

## 8. Rozważania dotyczące wydajności
- **Indeksowanie bazy danych**: Należy upewnić się, że kolumny `user_id` i `date` w tabeli `weight_records` są zindeksowane, aby zapewnić wysoką wydajność zapytań, zwłaszcza przy dużej ilości danych.
- **Paginacja**: Implementacja paginacji po stronie serwera jest kluczowa, aby uniknąć przesyłania dużych ilości danych i obciążania zarówno serwera, jak i klienta.

## 9. Etapy wdrożenia
1.  **Utworzenie serwisu**: Stwórz nowy plik `src/lib/services/weightService.ts`.
2.  **Implementacja logiki pobierania danych**: W `weightService.ts` zaimplementuj asynchroniczną funkcję `getWeightRecords(supabase: SupabaseClient, userId: string, page: number, pageSize: number)`.
    -   Funkcja powinna obliczyć `offset`.
    -   Wykonać zapytanie do Supabase o całkowitą liczbę rekordów dla użytkownika.
    -   Wykonać drugie zapytanie o pobranie paginowanych danych (`select().eq('user_id', userId).order('date', { ascending: false }).range(offset, offset + pageSize - 1)`).
    -   Zwrócić obiekt zawierający `data` i `total`.
3.  **Utworzenie pliku API**: Stwórz nowy plik `src/pages/api/weight/index.ts`.
4.  **Implementacja handlera GET**: W `index.ts` wyeksportuj handler `GET: APIRoute`.
5.  **Walidacja Zod**: Zdefiniuj schemę Zod do walidacji `page` i `pageSize` z `URL.searchParams`. Zastosuj wartości domyślne.
6.  **Integracja z serwisem**: W handlerze `GET`, po pomyślnej walidacji, pobierz `supabase` i `user` z `context.locals`. Wywołaj funkcję `getWeightRecords` z serwisu.
7.  **Formatowanie odpowiedzi**: Zbuduj obiekt `PaginatedResponseDto` na podstawie wyników z serwisu.
8.  **Zwrócenie odpowiedzi**: Zwróć odpowiedź w formacie JSON używając `new Response(JSON.stringify(responseDto))`.
9.  **Obsługa błędów**: Owiń logikę handlera w blok `try...catch`, aby obsłużyć ewentualne błędy i zwrócić odpowiedź `500`.
