# API Endpoint Implementation Plan: Update User Profile

## 1. Przegląd punktu końcowego

Ten dokument opisuje plan wdrożenia punktu końcowego `PUT /api/users/me`. Punkt końcowy umożliwia uwierzytelnionemu użytkownikowi aktualizację danych swojego profilu, takich jak imię, nazwisko, data urodzenia i wzrost.

## 2. Szczegóły żądania

-   **Metoda HTTP**: `PUT`
-   **Struktura URL**: `/api/users/me`
-   **Typ treści**: `application/json`
-   **Request Body**: Obiekt JSON zawierający pola do zaktualizowania. Wszystkie pola są opcjonalne, ale co najmniej jedno musi być obecne.

    ```json
    {
      "first_name": "John",
      "last_name": "Doe",
      "date_of_birth": "1990-01-15",
      "height_cm": 180
    }
    ```

## 3. Wykorzystywane typy

-   **Command Model**: `UpdateUserProfileCommand` z `src/types.ts` zostanie użyty do zdefiniowania struktury ciała żądania.
-   **DTO**: `UserProfileDto` z `src/types.ts` posłuży do zdefiniowania struktury odpowiedzi.

## 4. Szczegóły odpowiedzi

-   **Pomyślna odpowiedź (`200 OK`)**: Zwraca zaktualizowany obiekt profilu użytkownika w formacie `UserProfileDto`.

    ```json
    {
      "id": "user-uuid-1234",
      "first_name": "John",
      "last_name": "Doe",
      "date_of_birth": "1990-01-15",
      "height_cm": 180,
      "updated_at": "2025-10-20T10:00:00Z"
    }
    ```

-   **Odpowiedzi błędów**:
    -   `400 Bad Request`: Błąd walidacji danych wejściowych.
    -   `401 Unauthorized`: Użytkownik nie jest uwierzytelniony.
    -   `500 Internal Server Error`: Wewnętrzny błąd serwera.

## 5. Przepływ danych

1.  Klient wysyła żądanie `PUT` na adres `/api/users/me` z danymi do aktualizacji w ciele żądania.
2.  Middleware Astro weryfikuje sesję użytkownika przy użyciu klienta Supabase. Jeśli sesja jest nieprawidłowa, żądanie jest odrzucane (co skutkuje kodem 401).
3.  Handler API w `src/pages/api/users/me.ts` odbiera żądanie.
4.  Dane z ciała żądania są walidowane za pomocą schematu Zod. W przypadku błędu walidacji zwracany jest błąd `400`.
5.  Handler wywołuje funkcję `updateUserProfile` z serwisu `userService`, przekazując ID uwierzytelnionego użytkownika (z `context.locals.user.id`) oraz zwalidowane dane.
6.  Funkcja `updateUserProfile` w `userService` wykonuje zapytanie `UPDATE` do tabeli `users` w bazie danych Supabase, używając `supabase.from('users').update(data).eq('id', userId)`.
7.  Po pomyślnej aktualizacji, `userService` zwraca zaktualizowane dane użytkownika.
8.  Handler API formatuje dane do postaci `UserProfileDto` i wysyła je z kodem statusu `200 OK`.

## 6. Względy bezpieczeństwa

-   **Uwierzytelnianie**: Dostęp do punktu końcowego musi być ograniczony tylko do uwierzytelnionych użytkowników. Zostanie to zapewnione przez middleware Astro, który weryfikuje token sesji Supabase.
-   **Autoryzacja**: Użytkownik może modyfikować wyłącznie własny profil. ID użytkownika do aktualizacji musi być pobrane z obiektu sesji (`context.locals.user.id`), a nie z ciała żądania czy parametrów URL.
-   **Walidacja danych**: Wszystkie dane wejściowe zostaną rygorystycznie zwalidowane za pomocą Zod, aby zapobiec zapisywaniu nieprawidłowych danych i potencjalnym atakom (np. XSS, chociaż ryzyko jest niskie).

## 7. Obsługa błędów

-   **Błędy walidacji (400)**: Jeśli dane wejściowe nie przejdą walidacji Zod, odpowiedź będzie zawierać szczegółowe informacje o błędach.
-   **Brak uwierzytelnienia (401)**: Jeśli `context.locals.user` jest `null`, zostanie zwrócony błąd `401 Unauthorized`.
-   **Błędy serwera (500)**: Wszelkie błędy zgłoszone przez Supabase podczas operacji na bazie danych zostaną przechwycone, zalogowane w konsoli serwera i zwrócone jako ogólny błąd `500 Internal Server Error`.

## 8. Rozważania dotyczące wydajności

Operacja `UPDATE` na pojedynczym wierszu w bazie danych jest wysoce wydajna i nie przewiduje się żadnych wąskich gardeł wydajnościowych dla tego punktu końcowego przy normalnym obciążeniu.

## 9. Etapy wdrożenia

1.  **Utworzenie schematu walidacji Zod**: W nowym pliku `src/lib/validators/userValidators.ts` zdefiniować schemat Zod dla `UpdateUserProfileCommand`.
2.  **Aktualizacja `userService`**:
    -   W pliku `src/lib/services/userService.ts` dodać nową funkcję `updateUserProfile`.
    -   Funkcja ta powinna przyjmować `userId` oraz dane do aktualizacji (`UpdateUserProfileCommand`) jako argumenty.
    -   Implementacja powinna wykorzystywać klienta Supabase do wykonania operacji `UPDATE` w tabeli `users`.
    -   Funkcja powinna zwracać zaktualizowany profil użytkownika lub zgłaszać błąd.
3.  **Implementacja handlera API**:
    -   W pliku `src/pages/api/users/me.ts` zaimplementować handler dla metody `PUT`.
    -   Dodać `export const prerender = false;`.
    -   Sprawdzić, czy użytkownik jest zalogowany (`context.locals.user`).
    -   Pobrać i zwalidować ciało żądania za pomocą wcześniej utworzonego schematu Zod.
    -   Wywołać `userService.updateUserProfile` z odpowiednimi danymi.
    -   Zwrócić pomyślną odpowiedź (`200 OK`) ze zaktualizowanymi danymi lub odpowiedni kod błędu.
