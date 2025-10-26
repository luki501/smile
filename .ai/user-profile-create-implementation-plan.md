# API Endpoint Implementation Plan: Create User Profile

## 1. Przegląd punktu końcowego
Ten punkt końcowy umożliwia nowo zarejestrowanym i uwierzytelnionym użytkownikom utworzenie swojego profilu publicznego. Jest to operacja jednorazowa, wywoływana zazwyczaj podczas procesu onboardingu. Endpoint przyjmuje podstawowe dane użytkownika i zapisuje je w tabeli `users`, powiązanej z kontem `auth.users` w Supabase.

## 2. Szczegóły żądania
-   **Metoda HTTP**: `POST`
-   **Struktura URL**: `/api/users/me`
-   **Request Body**:
    -   **Typ**: `application/json`
    -   **Struktura**:
        ```json
        {
          "first_name": "string",
          "last_name": "string",
          "date_of_birth": "string (YYYY-MM-DD)",
          "height_cm": "integer"
        }
        ```
-   **Parametry**:
    -   **Wymagane**: `first_name`, `last_name`, `date_of_birth`, `height_cm`.
    -   **Opcjonalne**: Brak.

## 3. Wykorzystywane typy
-   **Command Model (Request)**: `CreateUserProfileCommand` (do zdefiniowania w `src/types.ts`)
    ```typescript
    export type CreateUserProfileCommand = Pick<
    	TablesInsert<"users">,
    	"first_name" | "last_name" | "date_of_birth" | "height_cm"
    >;
    ```
-   **DTO (Response)**: `UserProfileDto` (istniejący w `src/types.ts`)

## 4. Szczegóły odpowiedzi
-   **Odpowiedź sukcesu (`201 Created`)**:
    -   **Content-Type**: `application/json`
    -   **Body**: Obiekt `UserProfileDto` reprezentujący nowo utworzony profil.
        ```json
        {
            "id": "uuid-string-of-the-user",
            "first_name": "John",
            "last_name": "Doe",
            "date_of_birth": "1990-01-15",
            "height_cm": 180,
            "updated_at": null
        }
        ```
-   **Odpowiedzi błędów**:
    -   `400 Bad Request`: Szczegóły błędu walidacji.
    -   `401 Unauthorized`: Pusta odpowiedź.
    -   `409 Conflict`: Komunikat o istniejącym profilu.
    -   `500 Internal Server Error`: Ogólny komunikat o błędzie serwera.

## 5. Przepływ danych
1.  Klient wysyła żądanie `POST` na `/api/users/me` z danymi profilu w ciele.
2.  Middleware Astro (`src/middleware/index.ts`) weryfikuje token JWT i umieszcza dane użytkownika w `Astro.locals.user`.
3.  Handler endpointu w `src/pages/api/users/me.ts` jest wywoływany.
4.  Handler sprawdza, czy `Astro.locals.user` istnieje. Jeśli nie, zwraca `401`.
5.  Ciało żądania jest walidowane przy użyciu schemy Zod `createUserProfileSchema`. W przypadku błędu zwracane jest `400`.
6.  Handler wywołuje funkcję `createUserProfile(userId, createCommand)` z serwisu `userService`.
7.  `userService.createUserProfile`:
    a. Sprawdza w tabeli `users`, czy profil dla `userId` już istnieje. Jeśli tak, rzuca błąd (np. `ConflictError`), który zostanie przechwycony przez handler i przetłumaczony na `409 Conflict`.
    b. Jeśli profil nie istnieje, wstawia nowy rekord do tabeli `users` używając klienta Supabase.
    c. Zwraca nowo utworzony profil.
8.  Handler endpointu otrzymuje dane profilu z serwisu.
9.  Handler zwraca odpowiedź `201 Created` z danymi profilu w formacie `UserProfileDto`.

## 6. Względy bezpieczeństwa
-   **Uwierzytelnianie**: Dostęp do endpointu jest chroniony przez mechanizm Supabase Auth. Każde żądanie musi zawierać prawidłowy token JWT.
-   **Autoryzacja**: Logika endpointu musi zapewnić, że użytkownik może utworzyć profil tylko dla siebie. Identyfikator użytkownika (`id`) musi być pobierany wyłącznie z zaufanego źródła po stronie serwera (`Astro.locals.user.id`), a nie z parametrów żądania.
-   **Walidacja danych**: Wszystkie dane wejściowe muszą być rygorystycznie walidowane za pomocą Zod, aby zapobiec atakom (np. SQL Injection) i zapewnić spójność danych, zgodnie ze schemą bazy danych.

## 7. Obsługa błędów
-   **`400 Bad Request`**: Zwracany, gdy walidacja Zod dla ciała żądania nie powiodła się. Odpowiedź powinna zawierać szczegóły błędu.
-   **`401 Unauthorized`**: Zwracany, gdy żądanie nie zawiera poprawnego tokenu uwierzytelniającego lub sesja wygasła (`Astro.locals.user` jest niezdefiniowane).
-   **`409 Conflict`**: Zwracany, gdy `userService` wykryje, że profil dla danego `userId` już istnieje.
-   **`500 Internal Server Error`**: Zwracany w przypadku nieoczekiwanych błędów po stronie serwera, np. problemów z połączeniem z bazą danych Supabase. Błąd powinien być logowany na serwerze.

## 8. Rozważania dotyczące wydajności
-   Operacja jest prosta (jeden odczyt w celu sprawdzenia istnienia i jeden zapis). Nie przewiduje się problemów z wydajnością.
-   Zapytanie sprawdzające istnienie profilu powinno być wykonane na indeksowanej kolumnie `id`, co Supabase zapewnia domyślnie dla kluczy głównych.

## 9. Etapy wdrożenia
1.  **Aktualizacja typów**: W pliku `src/types.ts` dodać nowy eksportowany typ `CreateUserProfileCommand`.
2.  **Walidacja**: W pliku `src/lib/validators/userValidators.ts` zdefiniować i wyeksportować nowy schemat Zod `createUserProfileSchema` do walidacji danych wejściowych.
3.  **Logika serwisowa**: W `src/lib/services/userService.ts` zaimplementować nową asynchroniczną funkcję `createUserProfile(userId: string, data: CreateUserProfileCommand)`. Funkcja ta powinna sprawdzać istnienie użytkownika i tworzyć nowy profil, zwracając `UserProfileDto`.
4.  **Implementacja endpointu**: W pliku `src/pages/api/users/me.ts` utworzyć handler dla metody `POST`.
5.  **Logika handlera**: W handlerze `POST`:
    a. Zabezpieczyć endpoint, sprawdzając obecność `Astro.locals.user`.
    b. Zwalidować ciało żądania za pomocą `createUserProfileSchema`.
    c. Wywołać `userService.createUserProfile`.
    d. Zaimplementować obsługę błędów (try-catch) dla `ConflictError` i innych potencjalnych wyjątków.
    e. Zwrócić odpowiedź `201 Created` z nowym profilem lub odpowiedni kod błędu.
