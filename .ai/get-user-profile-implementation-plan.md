# API Endpoint Implementation Plan: Get User Profile

## 1. Przegląd punktu końcowego
Ten punkt końcowy (`GET /api/users/me`) służy do pobierania publicznych danych profilowych aktualnie uwierzytelnionego użytkownika. Zwraca kluczowe informacje, takie jak imię, nazwisko, data urodzenia i wzrost, które są przechowywane w tabeli `users`.

## 2. Szczegóły żądania
-   **Metoda HTTP**: `GET`
-   **Struktura URL**: `/api/users/me`
-   **Parametry**:
    -   Wymagane: Brak
    -   Opcjonalne: Brak
-   **Request Body**: Brak

## 3. Wykorzystywane typy
Do strukturyzacji danych odpowiedzi zostanie wykorzystany istniejący typ DTO:
-   `UserProfileDto` z `src/types.ts`

```typescript:src/types.ts
export type UserProfileDto = Pick<
	Tables<"users">,
	"id" | "first_name" | "last_name" | "date_of_birth" | "height_cm" | "updated_at"
>;
```

## 4. Szczegóły odpowiedzi
-   **Odpowiedź sukcesu (`200 OK`)**:
    ```json
    {
      "id": "c3e4b9e2-6d7c-4a3b-8f9a-0e1d2c3b4a5f",
      "first_name": "John",
      "last_name": "Doe",
      "date_of_birth": "1990-01-15",
      "height_cm": 180,
      "updated_at": "2025-10-15T10:00:00Z"
    }
    ```
-   **Odpowiedzi błędów**:
    -   `401 Unauthorized`: Użytkownik nie jest uwierzytelniony.
    -   `404 Not Found`: Profil użytkownika nie został znaleziony w bazie danych.
    -   `500 Internal Server Error`: Wystąpił nieoczekiwany błąd serwera.

## 5. Przepływ danych
1.  Żądanie `GET` trafia do punktu końcowego `/api/users/me`.
2.  Middleware Astro weryfikuje token JWT użytkownika i umieszcza sesję oraz klienta Supabase w `Astro.locals`.
3.  Handler `GET` w `src/pages/api/users/me.ts` jest wywoływany.
4.  Handler sprawdza, czy `locals.session` istnieje. Jeśli nie, zwraca `401`.
5.  Handler wywołuje funkcję `getUserProfile` z nowego serwisu `userService`, przekazując klienta Supabase (`locals.supabase`) i ID użytkownika (`locals.session.user.id`).
6.  Serwis `userService` wykonuje zapytanie `SELECT` do tabeli `users` w bazie danych Supabase, filtrując po `id` użytkownika.
7.  Baza danych (z uwzględnieniem polityki RLS) zwraca dane profilu do serwisu.
8.  Serwis zwraca dane do handlera API.
9.  Handler API formatuje odpowiedź jako `UserProfileDto` i zwraca ją do klienta z kodem `200 OK`.

## 6. Względy bezpieczeństwa
-   **Uwierzytelnianie**: Dostęp do tego punktu końcowego jest ściśle ograniczony do uwierzytelnionych użytkowników. Weryfikacja sesji w middleware jest kluczowym elementem zabezpieczającym.
-   **Autoryzacja**: Supabase RLS (Row-Level Security) jest skonfigurowane dla tabeli `users`. Polityka `"Users can manage their own user data"` zapewnia, że zapytanie może zwrócić tylko i wyłącznie dane należące do uwierzytelnionego użytkownika (`auth.uid() = id`), co zapobiega dostępowi do danych innych osób.

## 7. Obsługa błędów
-   **Brak uwierzytelnienia**: Jeśli `Astro.locals.session` jest `null`, handler natychmiast zwróci odpowiedź JSON z komunikatem o błędzie i statusem `401`.
-   **Profil nie znaleziony**: Jeśli zapytanie do bazy danych nie zwróci żadnych wyników, funkcja serwisowa zwróci `null`. Handler API zinterpretuje to jako brak zasobu i zwróci odpowiedź z komunikatem o błędzie i statusem `404`.
-   **Błędy serwera**: Wszelkie inne błędy, np. problemy z połączeniem z bazą danych, będą przechwytywane w bloku `try...catch`. Zostanie zalogowany szczegółowy błąd na serwerze, a do klienta zostanie wysłana generyczna odpowiedź z kodem `500`.

## 8. Rozważania dotyczące wydajności
-   Zapytanie do bazy danych jest bardzo proste (odczyt jednego wiersza po kluczu głównym) i powinno być wysoce wydajne.
-   Tabela `users` ma indeks na kolumnie `id` (klucz główny), co gwarantuje szybkie wyszukiwanie.
-   Nie przewiduje się problemów z wydajnością dla tego punktu końcowego.

## 9. Etapy wdrożenia
1.  **Utworzenie pliku serwisu**: Stworzyć nowy plik `src/lib/services/userService.ts`.
2.  **Implementacja logiki serwisu**: W `userService.ts` zaimplementować asynchroniczną funkcję `getUserProfile(supabase: SupabaseClient, userId: string): Promise<UserProfileDto | null>`. Funkcja ta wykona zapytanie do tabeli `users` i zwróci dane profilu lub `null`, jeśli nie zostanie znaleziony.
3.  **Utworzenie pliku endpointu**: Stworzyć nowy plik `src/pages/api/users/me.ts`.
4.  **Implementacja handlera GET**:
    -   Dodać `export const prerender = false;`
    -   Zaimplementować asynchroniczną funkcję `export async function GET({ locals }: APIContext)`.
    -   Pobrać `session` i `supabase` z `locals`.
    -   Sprawdzić, czy sesja istnieje; jeśli nie, zwrócić `401`.
    -   Wywołać `userService.getUserProfile` z ID użytkownika z sesji.
    -   Obsłużyć odpowiedź z serwisu: zwrócić `200 OK` z danymi, jeśli profil istnieje, lub `404 Not Found`, jeśli nie.
    -   Dodać obsługę błędów `try...catch` i zwracać `500 Internal Server Error` w razie niepowodzenia.
