# Dokument wymagań produktu (PRD) - SMile
## 1. Przegląd produktu
SMile to aplikacja webowa zaprojektowana w celu wsparcia pacjentów chorych na stwardnienie rozsiane (SM) poprzez umożliwienie im codziennego monitorowania kluczowych wskaźników zdrowotnych. Aplikacja skupia się na prostocie i użyteczności, pozwalając na rejestrowanie wagi, ciśnienia krwi oraz objawów neurologicznych. Dane są prezentowane w formie przejrzystych wykresów, co ułatwia śledzenie postępów i trendów w czasie. Projekt jest realizowany w architekturze online-only, z wykorzystaniem Supabase jako backendu do autentykacji i przechowywania danych. Aplikacja jest optymalizowana pod kątem przeglądarki Chrome na urządzeniach mobilnych.

## 2. Problem użytkownika
Pacjenci z diagnozą stwardnienia rozsianego (SM) muszą regularnie monitorować swój stan zdrowia, aby efektywnie zarządzać chorobą i dostarczać lekarzom precyzyjnych danych. Brak prostego, scentralizowanego narzędzia do codziennego śledzenia wagi, ciśnienia krwi i specyficznych objawów neurologicznych utrudnia identyfikację wzorców, ocenę skuteczności leczenia oraz szybkie reagowanie na niepokojące zmiany. Pacjenci potrzebują dedykowanej aplikacji, która pozwoli im w łatwy sposób rejestrować i wizualizować te dane, dając poczucie kontroli nad chorobą i ułatwiając komunikację z personelem medycznym.

## 3. Wymagania funkcjonalne
- FW-01: Uwierzytelnianie użytkownika:
  - System logowania i rejestracji oparty na adresie e-mail i haśle.
  - Bezpieczeństwo zapewnione przez Supabase Auth.
- FW-02: Profil użytkownika:
  - Możliwość stworzenia i edycji profilu zawierającego dane: Imię, Nazwisko, Data urodzenia, E-mail, Wzrost (w cm).
  - Wzrost jest niezbędny do obliczania wskaźnika BMI.
- FW-03: Rejestracja wagi:
  - Możliwość dodawania, odczytu, edycji i usuwania (CRUD) rekordów wagi.
  - Każdy rekord zawiera datę i wartość wagi w kg.
  - Walidacja wprowadzanych danych (waga w zakresie 10-99 kg).
- FW-04: Rejestracja ciśnienia krwi:
  - Możliwość operacji CRUD na rekordach ciśnienia krwi.
  - Każdy rekord zawiera datę, ciśnienie skurczowe (SYS), rozkurczowe (DIA) i puls (PULSE).
  - Walidacja uniemożliwiająca wprowadzenie wartości czterocyfrowych.
- FW-05: Rejestracja objawów neurologicznych:
  - Możliwość operacji CRUD na rekordach objawów.
  - Model danych `SymptomRecord` zawiera: `Id`, `Date`, `BodyPart`, `PainType`, `Description`.
  - Wartości dla `BodyPart` i `PainType` pochodzą ze zdefiniowanych list (enum).
- FW-06: Wizualizacja danych:
  - Wykres liniowy przedstawiający historię wagi w czasie, z dodatkową informacją o BMI.
  - Wykres liniowy przedstawiający historię ciśnienia krwi (SYS, DIA) w czasie.
  - Na obu wykresach widoczna nakładka z 5-dniową średnią kroczącą.
- FW-07: Filtrowanie danych:
  - Możliwość filtrowania danych na wykresach według predefiniowanych zakresów czasowych: tydzień, miesiąc, kwartał, rok.
  - Wyświetlanie średniej wartości dla wybranego okresu.
- FW-08: Wymagania niefunkcjonalne:
  - Aplikacja działa wyłącznie w trybie online.
  - Interfejs jest responsywny i zoptymalizowany pod kątem przeglądarki Chrome na urządzeniach mobilnych.
  - Używany jest wyłącznie system metryczny (kg, cm).

## 4. Granice produktu
- Funkcjonalności w zakresie MVP:
  - Uwierzytelnianie i profil użytkownika.
  - Pełne zarządzanie (CRUD) pomiarami wagi i ciśnienia.
  - Pełne zarządzanie (CRUD) objawami neurologicznymi.
  - Wizualizacja danych w formie wykresów z filtrowaniem i średnią kroczącą.
- Funkcjonalności poza zakresem MVP:
  - Import i eksport danych.
  - Pobieranie danych z zewnętrznych źródeł/urządzeń.
  - Lista leków i przypomnienia o ich zażyciu.
  - Tryb offline.
  - Zbieranie technicznych metryk wydajnościowych aplikacji.

## 5. Historyjki użytkowników
### 5.1. Zarządzanie kontem i profilem
- ID: US-001
- Tytuł: Rejestracja nowego użytkownika
- Opis: Jako nowy użytkownik, chcę móc założyć konto w aplikacji przy użyciu adresu e-mail i hasła, aby uzyskać dostęp do jej funkcjonalności.
- Kryteria akceptacji:
  - 1. Formularz rejestracji zawiera pola na adres e-mail i hasło.
  - 2. Walidacja sprawdza poprawność formatu adresu e-mail.
  - 3. Po pomyślnej rejestracji użytkownik jest automatycznie zalogowany i przekierowany do strony tworzenia profilu.
  - 4. W przypadku nieudanej rejestracji (np. e-mail już istnieje) wyświetlany jest czytelny komunikat o błędzie.

- ID: US-002
- Tytuł: Logowanie do aplikacji
- Opis: Jako zarejestrowany użytkownik, chcę móc zalogować się do aplikacji przy użyciu mojego e-maila i hasła, aby kontynuować monitorowanie mojego stanu zdrowia.
- Kryteria akceptacji:
  - 1. Formularz logowania zawiera pola na adres e-mail i hasło.
  - 2. Po pomyślnym zalogowaniu użytkownik jest przekierowany na główny pulpit aplikacji.
  - 3. W przypadku podania błędnych danych logowania wyświetlany jest stosowny komunikat.

- ID: US-003
- Tytuł: Tworzenie profilu użytkownika
- Opis: Jako nowy, zalogowany użytkownik, chcę uzupełnić mój profil o podstawowe dane (imię, nazwisko, data urodzenia, wzrost), aby aplikacja mogła poprawnie funkcjonować i np. obliczać BMI.
- Kryteria akceptacji:
  - 1. Formularz profilu zawiera pola: Imię, Nazwisko, Data urodzenia, Wzrost (w cm).
  - 2. Pole e-mail jest pobierane z danych logowania i jest nieedytowalne.
  - 3. Po zapisaniu profilu, jestem przekierowywany na główny pulpit.
  - 4. Dopóki profil nie zostanie uzupełniony, nie mam dostępu do innych funkcji aplikacji.

- ID: US-004
- Tytuł: Edycja profilu użytkownika
- Opis: Jako użytkownik, chcę mieć możliwość edycji danych w moim profilu, aby móc je zaktualizować w razie potrzeby.
- Kryteria akceptacji:
  - 1. Mogę uzyskać dostęp do edycji mojego profilu z poziomu menu aplikacji.
  - 2. Wszystkie pola (oprócz adresu e-mail) są edytowalne.
  - 3. Zmiany są zapisywane po kliknięciu przycisku "Zapisz".

### 5.2. Zarządzanie pomiarami
- ID: US-005
- Tytuł: Dodawanie nowego pomiaru wagi
- Opis: Jako użytkownik, chcę móc codziennie rejestrować moją wagę, aby śledzić jej zmiany w czasie.
- Kryteria akceptacji:
  - 1. Formularz dodawania wagi zawiera pole na wartość w kg oraz datę pomiaru (domyślnie dzisiejsza).
  - 2. Wprowadzona wartość jest walidowana i musi mieścić się w zakresie 10-99 kg.
  - 3. Po zapisaniu, nowy rekord jest widoczny w historii pomiarów.

- ID: US-006
- Tytuł: Dodawanie nowego pomiaru ciśnienia krwi
- Opis: Jako użytkownik, chcę móc rejestrować moje dzienne pomiary ciśnienia krwi, aby monitorować pracę układu krążenia.
- Kryteria akceptacji:
  - 1. Formularz zawiera pola na ciśnienie skurczowe (SYS), rozkurczowe (DIA), puls (PULSE) oraz datę.
  - 2. Wprowadzane wartości nie mogą być czterocyfrowe.
  - 3. Po zapisaniu, nowy rekord jest widoczny w historii.

- ID: US-007
- Tytuł: Dodawanie nowego rekordu objawów neurologicznych
- Opis: Jako użytkownik, chcę rejestrować nietypowe objawy neurologiczne, gdy tylko wystąpią, aby mieć pełen obraz stanu zdrowia.
- Kryteria akceptacji:
  - 1. Formularz zawiera pola: Data, Część ciała (`BodyPart`), Rodzaj bólu/odczucia (`PainType`), Opis.
  - 2. Pola `BodyPart` i `PainType` to listy rozwijane z predefiniowanymi wartościami.
  - 3. Po zapisaniu, nowy objaw jest widoczny na liście historii objawów.

- ID: US-008
- Tytuł: Edycja istniejącego pomiaru
- Opis: Jako użytkownik, chcę mieć możliwość poprawienia błędnie wprowadzonego rekordu pomiaru (wagi, ciśnienia lub objawu).
- Kryteria akceptacji:
  - 1. Każdy rekord na liście historycznej ma opcję "Edytuj".
  - 2. Kliknięcie "Edytuj" otwiera formularz wypełniony danymi wybranego rekordu.
  - 3. Po zapisaniu zmian, rekord na liście jest zaktualizowany.

- ID: US-009
- Tytuł: Usuwanie istniejącego pomiaru
- Opis: Jako użytkownik, chcę mieć możliwość usunięcia rekordu, który został wprowadzony przez pomyłkę lub jest już nieaktualny.
- Kryteria akceptacji:
  - 1. Każdy rekord na liście historycznej ma opcję "Usuń".
  - 2. Przed usunięciem rekordu wyświetlane jest okno dialogowe z prośbą o potwierdzenie operacji.
  - 3. Po potwierdzeniu, rekord jest trwale usuwany z bazy danych i znika z widoku historii.

### 5.3. Analiza i przegląd danych
- ID: US-010
- Tytuł: Przeglądanie historii wagi na wykresie
- Opis: Jako użytkownik, chcę widzieć wykres zmian mojej wagi w czasie, aby móc analizować trendy i widzieć obliczone BMI.
- Kryteria akceptacji:
  - 1. Na pulpicie głównym znajduje się wykres liniowy prezentujący wagę (oś Y) w funkcji czasu (oś X).
  - 2. Pod wykresem lub w dymku (tooltip) widoczna jest wartość BMI obliczona dla danego pomiaru.
  - 3. Domyślnie wykres pokazuje dane z ostatniego miesiąca.

- ID: US-011
- Tytuł: Przeglądanie historii ciśnienia krwi na wykresie
- Opis: Jako użytkownik, chcę widzieć wykres zmian mojego ciśnienia krwi (SYS i DIA), aby obserwować jego wahania.
- Kryteria akceptacji:
  - 1. Na pulpicie głównym znajduje się wykres liniowy z dwiema seriami danych: SYS i DIA.
  - 2. Domyślnie wykres pokazuje dane z ostatniego miesiąca.

- ID: US-012
- Tytuł: Filtrowanie danych na wykresach
- Opis: Jako użytkownik, chcę móc zmieniać zakres czasowy danych prezentowanych na wykresach, aby analizować dane z różnych okresów.
- Kryteria akceptacji:
  - 1. Nad wykresami znajduje się przełącznik (combobox/przyciski) pozwalający wybrać okres: tydzień, miesiąc, kwartał, rok.
  - 2. Po wybraniu okresu, wykresy automatycznie się aktualizują, pokazując dane z wybranego zakresu.
  - 3. Obok przełącznika wyświetlana jest średnia wartość pomiarów (wagi i ciśnienia) dla wybranego okresu.

- ID: US-013
- Tytuł: Analiza średniej kroczącej
- Opis: Jako użytkownik, chcę widzieć na wykresach linię 5-dniowej średniej kroczącej, aby lepiej zrozumieć ogólny trend i zniwelować wpływ pojedynczych wahań.
- Kryteria akceptacji:
  - 1. Na wykresach wagi i ciśnienia krwi widoczna jest dodatkowa, wygładzona linia reprezentująca 5-dniową średnią kroczącą.
  - 2. Linię tę można opcjonalnie włączyć/wyłączyć.

## 6. Metryki sukcesu
- Metryka jakościowa: Zadowolenie żony Doroty na poziomie 90% lub wyższym, mierzone subiektywną oceną po prezentacji MVP.
- Metryka ilościowa: Odsetek dni, w których użytkownik dokonał co najmniej jednego pomiaru (wagi lub ciśnienia), jako wskaźnik zaangażowania i regularności korzystania z aplikacji. Wartość docelowa zostanie ustalona po pierwszym miesiącu użytkowania.
