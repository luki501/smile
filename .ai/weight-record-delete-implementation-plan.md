## 1. Przegląd punktu końcowego
Ten punkt końcowy interfejsu API umożliwia uwierzytelnionym użytkownikom usuwanie własnych, wcześniej zarejestrowanych rekordów wagi. Operacja jest idempotentna i nieodwracalna.

## 2. Szczegóły żądania
-   **Metoda HTTP**: `DELETE`
-   **Struktura URL**: `/api/weight/{id}`
-   **Parametry**:
    -   **Wymagane**:
        -   `id` (parametr ścieżki): Unikalny identyfikator (liczba całkowita) rekordu wagi, który ma zostać usunięty.
    -   **Opcjonalne**: Brak.
-   **Request Body**: Brak.

## 3. Wykorzystywane typy
Implementacja tego punktu końcowego nie wymaga definiowania ani używania żadnych specyficznych typów DTO (Data Transfer Objects) ani modeli poleceń (Command Models), ponieważ żądanie i odpowiedź nie zawierają ciała (payload).

## 4. Szczegóły odpowiedzi
-   **Odpowiedź sukcesu**:
    -   **Kod stanu**: `204 No Content`
    -   **Ciało odpowiedzi**: Brak.
-   **Odpowiedzi błędów**:
    -   `400 Bad Request`: Parametr `{id}` w ścieżce URL jest nieprawidłowy (np. nie jest liczbą).
    -   `401 Unauthorized`: Użytkownik nie jest uwierzytelniony.
    -   `403 Forbidden`: Użytkownik nie ma uprawnień do usunięcia tego rekordu (rekord należy do innego użytkownika).
    -   `404 Not Found`: Rekord wagi o podanym `{id}` nie został znaleziony.
    -   `500 Internal Server Error`: Wewnętrzny błąd serwera, np. problem z połączeniem z bazą danych.

## 5. Przepływ danych
1.  Klient wysyła żądanie `DELETE` na adres `/api/weight/{id}`.
2.  Middleware Astro (`src/middleware/index.ts`) przechwytuje żądanie, weryfikuje sesję użytkownika w Supabase i dołącza obiekt użytkownika oraz klienta Supabase do `Astro.locals`. Jeśli sesja jest nieprawidłowa, zwraca `401 Unauthorized`.
3.  Handler endpointa `DELETE` w `src/pages/api/weight/[id].ts` jest wywoływany.
4.  Endpoint dokonuje walidacji parametru `id` z `Astro.params` przy użyciu `zod`, aby upewnić się, że jest to poprawna, dodatnia liczba całkowita. W przypadku błędu walidacji zwraca `400 Bad Request`.
5.  Handler wywołuje funkcję `deleteWeightRecord` z nowo utworzonego serwisu `weightService`, przekazując `userId` zalogowanego użytkownika, `recordId` z parametru ścieżki oraz instancję klienta Supabase z `Astro.locals`.
6.  Funkcja `deleteWeightRecord` w serwisie najpierw wyszukuje rekord w tabeli `weight_records` po `recordId`.
7.  Jeśli rekord nie zostanie znaleziony, serwis rzuca błąd `NotFoundError`.
8.  Jeśli rekord zostanie znaleziony, serwis sprawdza, czy pole `user_id` rekordu jest zgodne z `userId` przekazanym do funkcji. Jeśli nie, rzuca błąd `ForbiddenError`.
9.  Jeśli weryfikacja uprawnień przebiegnie pomyślnie, serwis wykonuje operację `DELETE` w bazie danych Supabase.
10. Handler endpointa w bloku `try...catch` przechwytuje błędy z serwisu i mapuje je na odpowiednie odpowiedzi HTTP (`404 Not Found`, `403 Forbidden`). W przypadku innych błędów zwraca `500 Internal Server Error`.
11. Po pomyślnym usunięciu rekordu przez serwis, handler zwraca odpowiedź `204 No Content`.

## 6. Względy bezpieczeństwa
-   **Uwierzytelnianie**: Dostęp jest ściśle kontrolowany przez middleware Astro, który sprawdza ważność sesji Supabase przed przekazaniem żądania do handlera.
-   **Autoryzacja**: Logika autoryzacji jest zaimplementowana w warstwie serwisowej. Każda próba usunięcia rekordu jest poprzedzona sprawdzeniem, czy zalogowany użytkownik jest jego właścicielem. Zapobiega to możliwości usunięcia danych innego użytkownika.
-   **Walidacja danych wejściowych**: Parametr `id` jest walidowany za pomocą `zod`, co chroni przed błędami przetwarzania i potencjalnymi atakami (np. próbami wstrzyknięcia złośliwego kodu, chociaż klient Supabase sam w sobie parametryzuje zapytania).

## 7. Rozważania dotyczące wydajności
-   Operacja usunięcia jest wykonywana na podstawie klucza głównego (`id`) tabeli `weight_records`, co jest operacją bardzo wydajną i szybką.
-   Wyszukiwanie rekordu przed usunięciem również odbywa się po kluczu głównym, co minimalizuje obciążenie bazy danych.
-   Nie przewiduje się problemów z wydajnością dla tego punktu końcowego przy normalnym użytkowaniu.

## 8. Etapy wdrożenia
1.  **Utworzenie serwisu**: Utwórz nowy plik `src/lib/services/weightService.ts`.
2.  **Implementacja logiki usuwania**: W pliku `weightService.ts` zaimplementuj asynchroniczną funkcję `deleteWeightRecord(userId: string, recordId: number, supabase: SupabaseClient)`.
    -   Funkcja powinna najpierw pobrać rekord o danym `recordId`.
    -   Jeśli rekord nie istnieje, funkcja powinna rzucić niestandardowy błąd (np. `NotFoundError`).
    -   Jeśli `record.user_id` nie pasuje do `userId`, funkcja powinna rzucić błąd `ForbiddenError`.
    -   Jeśli wszystko się zgadza, funkcja powinna usunąć rekord i obsłużyć ewentualne błędy z bazy danych.
3.  **Utworzenie pliku endpointa**: Utwórz dynamiczny plik endpointa API Astro: `src/pages/api/weight/[id].ts`.
4.  **Implementacja handlera DELETE**: W nowo utworzonym pliku zaimplementuj handler `DELETE`.
    -   Dodaj `export const prerender = false;`
    -   Zdefiniuj schemat walidacji `zod` dla parametru `id`.
    -   Pobierz `id` z `Astro.params` i przeprowadź walidację.
    -   Pobierz `user` i `supabase` z `Astro.locals`.
    -   Zaimplementuj blok `try...catch` do wywołania `weightService.deleteWeightRecord` i obsługi błędów.
    -   Mapuj błędy rzucone przez serwis na odpowiednie kody statusu HTTP.
    -   W przypadku sukcesu, zwróć `new Response(null, { status: 204 })`.
