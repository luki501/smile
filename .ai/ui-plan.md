# Architektura UI dla SMile

## 1. Przegląd struktury UI

Architektura interfejsu użytkownika (UI) dla aplikacji SMile została zaprojektowana z myślą o podejściu "mobile-first", aby zapewnić optymalne doświadczenie na urządzeniach mobilnych z przeglądarką Chrome. Struktura opiera się na kilku kluczowych widokach, które obsługują wszystkie funkcjonalności zdefiniowane w wymaganiach produktu (PRD), w tym uwierzytelnianie, zarządzanie profilem, operacje CRUD na danych zdrowotnych (waga, ciśnienie, objawy) oraz ich wizualizację.

Centralnym elementem nawigacji jest dolny pasek (Tab Bar), który zapewnia stały i szybki dostęp do głównych sekcji aplikacji: Pulpitu, Historii pomiarów oraz Profilu użytkownika. Kluczową decyzją architektoniczną jest wymuszenie na nowych użytkownikach uzupełnienia profilu zaraz po rejestracji, co jest niezbędne do poprawnego działania funkcji, takich jak obliczanie BMI. Architektura w pełni wykorzystuje zaplanowane API, a do zarządzania stanem serwera, walidacji formularzy i obsługi błędów zostaną użyte nowoczesne biblioteki, takie jak TanStack Query, React Hook Form i Zod.

## 2. Lista widoków

### Widok Rejestracji (Register View)
- **Ścieżka:** `/register`
- **Główny cel:** Umożliwienie nowemu użytkownikowi założenia konta za pomocą adresu e-mail i hasła.
- **Kluczowe informacje do wyświetlenia:** Formularz rejestracyjny.
- **Kluczowe komponenty widoku:** `Form`, `Input` (dla e-mail i hasła), `Button`, `ErrorMessage`.
- **UX, dostępność i względy bezpieczeństwa:** Walidacja formatu adresu e-mail i siły hasła po stronie klienta. Po pomyślnej rejestracji, użytkownik jest automatycznie logowany i przekierowywany do widoku tworzenia profilu.

### Widok Logowania (Login View)
- **Ścieżka:** `/login`
- **Główny cel:** Umożliwienie zarejestrowanemu użytkownikowi zalogowania się do aplikacji.
- **Kluczowe informacje do wyświetlenia:** Formularz logowania.
- **Kluczowe komponenty widoku:** `Form`, `Input` (dla e-mail i hasła), `Button`, `ErrorMessage`.
- **UX, dostępność i względy bezpieczeństwa:** Wyraźny komunikat w przypadku podania błędnych danych. Po pomyślnym zalogowaniu, użytkownik jest przekierowywany na Pulpit.

### Widok Tworzenia/Edycji Profilu (Profile Form View)
- **Ścieżka:** `/profile`
- **Główny cel:** Zbieranie i aktualizacja danych profilowych użytkownika. Uzupełnienie profilu jest obowiązkowe dla nowych użytkowników i blokuje dostęp do innych części aplikacji.
- **Kluczowe informacje do wyświetlenia:** Formularz z polami: Imię, Nazwisko, Data urodzenia, Wzrost (cm). Adres e-mail jest wyświetlany, ale nieedytowalny.
- **Kluczowe komponenty widoku:** `Form`, `Input`, `DatePicker`, `Button`.
- **UX, dostępność i względy bezpieczeństwa:** Walidacja danych po stronie klienta (np. data nie może być z przyszłości). Dostęp do tego widoku jest chroniony i wymaga autentykacji.

### Pulpit (Dashboard View)
- **Ścieżka:** `/`
- **Główny cel:** Prezentacja zwizualizowanych danych zdrowotnych, umożliwiająca szybką analizę trendów i przegląd ostatnich pomiarów.
- **Kluczowe informacje do wyświetlenia:**
  - Wykres liniowy historii wagi z obliczonym BMI i 5-dniową średnią kroczącą.
  - Wykres liniowy historii ciśnienia krwi (SYS/DIA) z 5-dniową średnią kroczącą.
  - Filtry zakresu czasowego (tydzień, miesiąc, kwartał, rok) dla obu wykresów.
  - Skondensowana lista ostatnich pomiarów z każdej kategorii.
- **Kluczowe komponenty widoku:** `ChartComponent`, `DateRangeFilter`, `SummaryCard`, `RecentMeasurementsList`, `SkeletonLoader`.
- **UX, dostępność i względy bezpieczeństwa:** Wyświetlanie "szkieletów" interfejsu (skeleton loaders) podczas ładowania danych. Obsługa pustego stanu z wezwaniem do działania (CTA) dla nowych użytkowników. Dostęp chroniony autentykacją.

### Widok Historii (History View)
- **Ścieżka:** `/history`
- **Główny cel:** Umożliwienie przeglądania, edycji i usuwania wszystkich historycznych rekordów pomiarów.
- **Kluczowe informacje do wyświetlenia:** Paginowane listy wszystkich pomiarów, podzielone na zakładki: Waga, Ciśnienie Krwi, Objawy.
- **Kluczowe komponenty widoku:** `Tabs`, `PaginatedList`, `MeasurementListItem` z menu kontekstowym (opcje Edytuj/Usuń).
- **UX, dostępność i względy bezpieczeństwa:** Użycie paginacji lub "lazy loading" dla optymalizacji wydajności przy dużej liczbie rekordów. Każda akcja modyfikacji (edycja, usunięcie) jest inicjowana z menu kontekstowego i obsługiwana przez odpowiednie modale.

### Modal Dodawania/Edycji Pomiaru (Measurement Form Modal)
- **Ścieżka:** - (komponent modalny)
- **Główny cel:** Zapewnienie szybkiego i skoncentrowanego interfejsu do dodawania lub edycji pojedynczego rekordu bez opuszczania bieżącego widoku.
- **Kluczowe informacje do wyświetlenia:** Formularz z polami specyficznymi dla danego typu pomiaru (np. Waga, Data).
- **Kluczowe komponenty widoku:** `Modal`, `Form`, `Input`, `DatePicker`, `Button`.
- **UX, dostępność i względy bezpieczeństwa:** Walidacja danych formularza po stronie klienta. Po pomyślnym zapisie, dane w tle (na wykresach/listach) są automatycznie odświeżane (unieważnienie query).

## 3. Mapa podróży użytkownika

**Przepływ dla nowego użytkownika:**
1.  **Rejestracja (`/register`):** Użytkownik tworzy konto.
2.  **Tworzenie profilu (`/profile`):** Po udanej rejestracji następuje automatyczne przekierowanie do formularza profilu. Dostęp do reszty aplikacji jest zablokowany do czasu jego uzupełnienia.
3.  **Pulpit (`/`):** Po zapisaniu profilu użytkownik trafia na Pulpit, który jest w stanie "pustym" i zachęca do dodania pierwszego pomiaru.
4.  **Dodawanie pomiaru (Modal):** Użytkownik używa centralnego przycisku `(+)` w nawigacji, aby otworzyć modal i dodać swój pierwszy rekord.
5.  **Analiza danych (`/`):** Nowy rekord pojawia się na wykresie i liście ostatnich pomiarów na Pulpicie.

**Przepływ dla powracającego użytkownika:**
1.  **Logowanie (`/login`):** Użytkownik loguje się i jest przekierowywany na Pulpit.
2.  **Przeglądanie danych (`/`):** Użytkownik analizuje swoje aktualne wykresy i trendy.
3.  **Zarządzanie historią (`/history`):** Użytkownik przechodzi do Historii, aby przejrzeć pełną listę swoich pomiarów, gdzie może edytować lub usunąć dowolny wpis za pomocą menu kontekstowego i modali.

## 4. Układ i struktura nawigacji

- **Nawigacja główna (Mobile-First):** Aplikacja wykorzystuje dolny pasek nawigacyjny (Tab Bar) z czterema głównymi elementami:
  1.  **Pulpit:** Link do `/`.
  2.  **Historia:** Link do `/history`.
  3.  **Dodaj (+):** Przycisk akcji, który otwiera modal wyboru typu pomiaru do dodania.
  4.  **Profil:** Link do `/profile`, gdzie można edytować dane i się wylogować.
- **Nawigacja kontekstowa:** Operacje takie jak edycja, usuwanie czy dodawanie danych są obsługiwane przez komponenty modalne, które nakładają się na bieżący widok, co pozwala użytkownikowi zachować kontekst swojej pracy.
- **Ochrona ścieżek:** Dostęp do wszystkich widoków z wyjątkiem `/login` i `/register` jest chroniony i wymaga aktywnej sesji użytkownika. Dodatkowo, middleware aplikacji weryfikuje, czy profil użytkownika został uzupełniony, zanim udzieli dostępu do Pulpitu i Historii.

## 5. Kluczowe komponenty

- **`ChartComponent`:** Reużywalny komponent do wizualizacji danych liniowych, używany na Pulpicie do wyświetlania historii wagi i ciśnienia.
- **`PaginatedList`:** Komponent do renderowania list danych z obsługą paginacji, kluczowy dla widoku Historii.
- **`MeasurementListItem`:** Komponent reprezentujący pojedynczy element na liście w Historii, zawierający dane oraz menu kontekstowe do zarządzania wpisem.
- **`MeasurementFormModal`:** Modal z formularzem do tworzenia i edycji rekordów pomiarów, zapewniający spójny UX dla operacji CRUD.
- **`ConfirmationModal`:** Generyczny modal używany do potwierdzania operacji destrukcyjnych, takich jak usuwanie rekordu, w celu zapobiegania błędom użytkownika.
- **`SkeletonLoader`:** Komponent używany do wizualizacji stanu ładowania danych, poprawiający postrzeganą wydajność aplikacji na Pulpicie i w Historii.
- **`Layout`:** Główny komponent struktury, który zawiera stałe elementy interfejsu, takie jak dolny pasek nawigacyjny, i renderuje zawartość poszczególnych widoków.
