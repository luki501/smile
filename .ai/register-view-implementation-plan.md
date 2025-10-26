# Plan implementacji widoku Rejestracji (Register View)

## 1. Przegląd
Widok Rejestracji umożliwia nowym użytkownikom założenie konta w aplikacji SMile. Składa się z formularza, w którym użytkownik podaje swój adres e-mail i hasło. Po pomyślnej walidacji i utworzeniu konta, użytkownik jest automatycznie logowany i przekierowywany do strony tworzenia profilu w celu uzupełnienia dodatkowych danych.

## 2. Routing widoku
Widok będzie dostępny pod następującą ścieżką:
- **Ścieżka:** `/register`

## 3. Struktura komponentów
Struktura widoku będzie oparta na architekturze komponentowej, z wyraźnym podziałem na komponent strony (Astro) oraz komponenty interaktywne (React).

```
/src/pages/register.astro
└── /src/layouts/Layout.astro
    └── /src/components/auth/RegisterForm.tsx (client:load)
        ├── h1 ("Zarejestruj się")
        ├── form
        │   ├── /src/components/ui/Input.tsx (dla e-mail)
        │   ├── /src/components/ui/Input.tsx (dla hasła)
        │   ├── /src/components/auth/ErrorMessage.tsx (dla błędów API)
        │   └── /src/components/ui/Button.tsx (przycisk "Zarejestruj się")
```

## 4. Szczegóły komponentów
### `register.astro`
- **Opis komponentu**: Strona Astro, która renderuje główny layout aplikacji oraz interaktywny formularz rejestracji `RegisterForm.tsx`. Odpowiada za strukturę całej strony.
- **Główne elementy**: `<Layout>`, `<RegisterForm client:load />`.
- **Obsługiwane interakcje**: Brak.
- **Obsługiwana walidacja**: Brak.
- **Typy**: Brak.
- **Propsy**: Brak.

### `RegisterForm.tsx`
- **Opis komponentu**: Kluczowy komponent React, który zarządza całym procesem rejestracji. Zawiera logikę formularza, stan pól, obsługę walidacji po stronie klienta, komunikację z API Supabase oraz wyświetlanie komunikatów o błędach.
- **Główne elementy**: `form`, `Input` (dla email), `Input` (dla hasła), `Button` (do wysłania formularza), `ErrorMessage`.
- **Obsługiwane interakcje**: Wprowadzanie danych w pola formularza, wysłanie formularza.
- **Obsługiwana walidacja**: Walidacja jest delegowana do schemy Zod, która jest uruchamiana przed wysłaniem formularza.
- **Typy**: `RegisterFormViewModel`, `RegisterFormValidationSchema`.
- **Propsy**: Brak.

### `ErrorMessage.tsx`
- **Opis komponentu**: Prosty komponent do wyświetlania błędów zwróconych przez API (np. "Użytkownik już istnieje").
- **Główne elementy**: `p` lub `div` z komunikatem błędu.
- **Obsługiwane interakcje**: Brak.
- **Obsługiwana walidacja**: Brak.
- **Typy**: `string | null`.
- **Propsy**: `message: string | null`.

## 5. Typy
Do implementacji widoku wymagany jest jeden główny typ ViewModel, który będzie reprezentował dane formularza, oraz schema walidacji.

- **`RegisterFormViewModel`**: Obiekt przechowujący dane wprowadzone przez użytkownika w formularzu.
  ```typescript
  export type RegisterFormViewModel = {
    email: string;
    password: string;
  };
  ```

- **`RegisterFormValidationSchema`**: Schema Zod do walidacji `RegisterFormViewModel` po stronie klienta.
  ```typescript
  import { z } from "zod";

  export const RegisterFormValidationSchema = z.object({
    email: z.string().email({ message: "Nieprawidłowy format adresu e-mail." }),
    password: z.string().min(8, { message: "Hasło musi mieć co najmniej 8 znaków." }),
  });
  ```

## 6. Zarządzanie stanem
Stan formularza (wartości pól, błędy walidacji, stan wysyłki) będzie zarządzany wewnątrz komponentu `RegisterForm.tsx`. Zalecane jest użycie biblioteki `react-hook-form` w połączeniu z `zodResolver` do uproszczenia walidacji i obsługi stanu. Dodatkowo, zostanie stworzony customowy hook `useRegister` do enkapsulacji logiki komunikacji z API.

- **Hook `useRegister`**:
  - **Cel**: Abstrakcja logiki związanej z procesem rejestracji użytkownika.
  - **Zarządzany stan**:
    - `isLoading: boolean`: Informuje, czy żądanie do API jest w toku.
    - `error: string | null`: Przechowuje komunikat błędu z API.
  - **Funkcjonalność**: Udostępnia funkcję `register(data: RegisterFormViewModel)`, która wywołuje `supabase.auth.signUp()` i zarządza stanem `isLoading` oraz `error`. W przypadku sukcesu, wykonuje przekierowanie.

## 7. Integracja API
Integracja nie będzie korzystać z niestandardowego endpointu `/api/users/me`, lecz bezpośrednio z metody `signUp` dostarczonej przez Supabase JavaScript Client SDK.

- **Endpoint**: `supabase.auth.signUp(credentials)`
- **Metoda**: Wywołanie funkcji w bibliotece klienckiej.
- **Typ żądania (`credentials`)**:
  ```typescript
  {
    email: string,
    password: string
  }
  ```
  (Odwzorowuje `RegisterFormViewModel`)
- **Typ odpowiedzi (sukces)**: `{ data: { user, session }, error: null }`. Po otrzymaniu tej odpowiedzi, użytkownik jest zalogowany, a aplikacja powinna go przekierować.
- **Typ odpowiedzi (błąd)**: `{ data: { user: null, session: null }, error: AuthError }`. Obiekt `error` zawiera szczegóły błędu.

## 8. Interakcje użytkownika
- **Wprowadzanie danych**: Użytkownik wpisuje swój adres e-mail i hasło w odpowiednie pola formularza.
- **Wysyłanie formularza**: Użytkownik klika przycisk "Zarejestruj się".
  - **Wynik (sukces)**: Dane są poprawne, konto zostaje utworzone, a użytkownik jest przekierowany na stronę `/profile/create`. Przycisk jest w stanie `disabled` na czas operacji.
  - **Wynik (błąd walidacji)**: Dane są niepoprawne. Pod polami z błędami wyświetlane są odpowiednie komunikaty. Wysłanie formularza jest blokowane.
  - **Wynik (błąd API)**: Wystąpił błąd po stronie serwera (np. e-mail jest już zajęty). Pod formularzem wyświetlany jest ogólny komunikat o błędzie.

## 9. Warunki i walidacja
Walidacja danych odbywa się po stronie klienta przed próbą wysłania żądania do serwera.

- **Pole `email`**:
  - **Warunek**: Musi być poprawnym formatem adresu e-mail (np. `user@example.com`).
  - **Komponent**: `RegisterForm.tsx`.
  - **Wpływ na interfejs**: Jeśli warunek nie jest spełniony, pod polem wyświetla się komunikat "Nieprawidłowy format adresu e-mail.". Przycisk "Zarejestruj się" jest nieaktywny.
- **Pole `password`**:
  - **Warunek**: Musi zawierać co najmniej 8 znaków.
  - **Komponent**: `RegisterForm.tsx`.
  - **Wpływ na interfejs**: Jeśli warunek nie jest spełniony, pod polem wyświetla się komunikat "Hasło musi mieć co najmniej 8 znaków.". Przycisk "Zarejestruj się" jest nieaktywny.

## 10. Obsługa błędów
- **Błędy walidacji**: Obsługiwane przez `react-hook-form` i `zodResolver`. Komunikaty są wyświetlane bezpośrednio pod odpowiednimi polami formularza.
- **Błędy API**:
  - **Email już istnieje**: Supabase zwróci błąd. Hook `useRegister` przechwyci go i ustawi stan błędu. Komponent `ErrorMessage` wyświetli komunikat: "Użytkownik o tym adresie e-mail już istnieje.".
  - **Błąd sieci/serwera**: W przypadku problemów z połączeniem, zostanie wyświetlony ogólny komunikat: "Wystąpił nieoczekiwany błąd. Spróbuj ponownie później.".
- **Stan ładowania**: Podczas komunikacji z API przycisk "Zarejestruj się" będzie nieaktywny, aby zapobiec wielokrotnemu wysyłaniu formularza.

## 11. Kroki implementacji
1.  Utworzenie pliku strony `src/pages/register.astro`.
2.  Zaimplementowanie w nim podstawowej struktury z komponentem `<Layout>` i osadzenie miejsca na formularz.
3.  Stworzenie komponentu React `src/components/auth/RegisterForm.tsx` i osadzenie go w `register.astro` z dyrektywą `client:load`.
4.  Zdefiniowanie typów `RegisterFormViewModel` oraz schemy `RegisterFormValidationSchema` w dedykowanym pliku walidatora (np. `src/lib/validators/authValidators.ts`).
5.  Zaimplementowanie logiki formularza w `RegisterForm.tsx` z użyciem `react-hook-form` i `zodResolver`.
6.  Stworzenie interfejsu formularza przy użyciu komponentów z biblioteki Shadcn/ui (`Input`, `Button`, `Label`).
7.  Utworzenie customowego hooka `src/lib/hooks/useRegister.ts`, który będzie zawierał logikę wywołania `supabase.auth.signUp`.
8.  Zintegrowanie hooka `useRegister` z komponentem `RegisterForm.tsx` w funkcji `onSubmit`.
9.  Implementacja obsługi stanów `isLoading` (dezaktywacja przycisku) oraz `error` (wyświetlanie komunikatu błędu).
10. Zaimplementowanie logiki przekierowania do `/profile/create` po pomyślnej rejestracji.
11. Przeprowadzenie testów manualnych: pomyślna rejestracja, próba rejestracji na istniejący e-mail, walidacja pól.
12. Stylizacja komponentów zgodnie z systemem designu aplikacji przy użyciu Tailwind CSS.
