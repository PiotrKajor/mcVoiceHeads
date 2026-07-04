<div align="center">

# 🎧 mcVoiceHeads

**Userplugin Vencorda — podmienia awatary wybranych osób na Discordzie na twarze ich skinów z Minecrafta.**

Awatar w spoczynku jest półprzezroczysty, a gdy dana osoba mówi na kanale głosowym, płynnie jaśnieje do pełnej nieprzezroczystości.

![Platforma](https://img.shields.io/badge/Windows%20%7C%20macOS%20%7C%20Linux-2a3245?style=for-the-badge)
&nbsp;
![Licencja](https://img.shields.io/badge/licencja-GPL--3.0-3ddc84?style=for-the-badge)
&nbsp;
![Wymaga](https://img.shields.io/badge/wymaga-Vencord-5865F2?style=for-the-badge)

</div>

---

## Co to robi

Mapujesz Discord ID znajomych na UUID ich kont Minecraft. Plugin podmienia ich awatary
na Discordzie na głowy ze skina (domyślnie przez `mc-heads.net`), a gdy mówią na kanale
głosowym, awatar płynnie przechodzi z półprzezroczystego spoczynku do pełnych kolorów.

## Funkcje

- 🪖 Podmiana awatara na głowę skina Minecraft (dowolny szablon URL, domyślnie `mc-heads.net`)
- 🗣️ Płynne jaśnienie awatara przy mówieniu na kanale głosowym (opacity + przejście ~150ms)
- 🎯 Zakres podmiany: wszędzie albo tylko w widoku kanału głosowego
- 🟢 Opcjonalne ukrycie natywnej zielonej obwódki mówienia Discorda
- 🌐 Efekt opacity opcjonalnie też dla niezmapowanych uczestników
- ⚙️ Wszystko konfigurowalne z poziomu ustawień Vencorda, bez edycji kodu

---

## Instalacja (automatyczna)

Wymaga tylko **`git`** i **`node`** (Windows/macOS/Linux) w PATH. Skrypt `install.mjs`
sam doinstaluje `pnpm`, sklonuje/zaktualizuje Vencorda i ten plugin, zbuduje wszystko
i wstrzyknie do klienta Discord.

### Krok po kroku

1. Sprawdź, że masz `git` i `node` (Node.js 18+):
   ```bash
   git --version
   node --version
   ```
   Jeśli któregoś brakuje: [git-scm.com](https://git-scm.com/downloads) i [nodejs.org](https://nodejs.org/).

2. Pobierz skrypt instalacyjny:
   ```bash
   curl -o install.mjs https://raw.githubusercontent.com/PiotrKajor/mcVoiceHeads/master/install.mjs
   ```
   **Windows (PowerShell)**, jeśli nie masz `curl`:
   ```powershell
   Invoke-WebRequest https://raw.githubusercontent.com/PiotrKajor/mcVoiceHeads/master/install.mjs -OutFile install.mjs
   ```

3. Uruchom go:
   ```bash
   node install.mjs
   ```

### Co się wtedy dzieje (kolejno)

1. Sprawdza, czy `pnpm` jest dostępny — jeśli nie, próbuje `corepack enable`, a gdy to
   zawiedzie, `npm install -g pnpm`.
2. Jeśli katalog docelowy Vencorda nie istnieje — klonuje `Vendicated/Vencord`.
3. Klonuje ten plugin do `src/userplugins/mcVoiceHeads/` (albo `git pull`, jeśli już tam jest).
4. Odpala po kolei `pnpm install`, `pnpm build`, `pnpm inject` wewnątrz katalogu Vencorda.

Cały output tych komend widzisz na żywo w terminalu — jeśli coś się wysypie (np. brak
uprawnień, brak Discorda), zobaczysz dokładnie na którym kroku i dlaczego.

### Własna lokalizacja Vencorda

Domyślnie skrypt klonuje/używa `~/Vencord`. Żeby wskazać inną lokalizację (np. już
istniejący klon):
```bash
node install.mjs /sciezka/do/Vencord
```
```powershell
node install.mjs C:\Users\Ty\Vencord
```

### Po instalacji

`pnpm inject` zapyta o ścieżkę do klienta Discord, jeśli nie wykryje jej automatycznie —
wskaż folder instalacji (np. `%LOCALAPPDATA%\Discord` na Windows). Na końcu **zrestartuj
Discorda całkowicie** (nie tylko odśwież okno) i włącz plugin w ustawieniach — patrz
sekcja [Włączenie pluginu](#włączenie-pluginu) niżej.

## Budowanie (ręcznie)

1. Zainstaluj `pnpm` (jeśli nie masz): `corepack enable` albo `npm install -g pnpm`.
2. Sklonuj Vencorda i wejdź do repo:
   ```bash
   git clone https://github.com/Vendicated/Vencord
   cd Vencord
   ```
3. Sklonuj to repo bezpośrednio do `src/userplugins/mcVoiceHeads/`:
   ```bash
   git clone https://github.com/PiotrKajor/mcVoiceHeads src/userplugins/mcVoiceHeads
   ```
4. Zainstaluj zależności i zbuduj:
   ```bash
   pnpm install
   pnpm build
   ```
5. Wstrzyknij Vencorda do klienta Discord:
   ```bash
   pnpm inject
   ```
   Postępuj zgodnie z instrukcjami (wskaż lokalizację Discorda) i zrestartuj klienta.

## Włączenie pluginu

Ustawienia Discorda → Vencord → Pluginy → znajdź **McVoiceHeads** → włącz. Kliknij ikonę
koła zębatego przy pluginie, żeby otworzyć jego ustawienia.

## Ustawienia

- **userMap** — mapowanie Discord ID → UUID Minecrafta jako JSON, np.:
  ```json
  {
    "123456789012345678": "069a79f4-44e9-4726-a5be-fca90e38aaf5",
    "987654321098765432": "8667ba71b85a4004af54457a9734eed7"
  }
  ```
  UUID może być z myślnikami lub bez — zostanie znormalizowane automatycznie. Nieprawidłowy
  JSON albo UUID zgłosi błąd walidacji przy zapisie.
- **restrictToVoiceView** — jeśli włączone, podmiana działa tylko wtedy, gdy dana osoba
  aktualnie jest na kanale głosowym; jeśli wyłączone (domyślnie), awatar jest podmieniony
  wszędzie (wiadomości, lista członków, profil...).
- **avatarUrlTemplate** — szablon URL, `{uuid}` zostanie zastąpione UUID gracza. Domyślnie
  `https://mc-heads.net/avatar/{uuid}/128`.
- **idleOpacity** — nieprzezroczystość awatara w spoczynku (domyślnie 45%).
- **hideNativeSpeakingRing** — ukrywa natywną zieloną obwódkę Discorda na podmienionych
  kafelkach (domyślnie włączone).
- **applyToAllParticipants** — stosuje efekt opacity/mówienia też do niezmapowanych osób
  (na ich oryginalnych awatarach), nie tylko do tych z listy `userMap`.

## Jak znaleźć UUID gracza po nicku

Publiczne API Mojanga zwraca UUID na podstawie aktualnego nicku gracza.

```bash
curl -s https://api.mojang.com/users/profiles/minecraft/<nick>
```

Przykład dla gracza `Notch`:
```bash
curl -s https://api.mojang.com/users/profiles/minecraft/Notch
```
zwraca:
```json
{"id":"069a79f444e94726a5befca90e38aaf5","name":"Notch"}
```
Pole `id` to szukany UUID (bez myślników) — wklej je bezpośrednio jako wartość w `userMap`:
```json
{"123456789012345678": "069a79f444e94726a5befca90e38aaf5"}
```

**Windows (PowerShell):**
```powershell
Invoke-RestMethod https://api.mojang.com/users/profiles/minecraft/<nick>
```

**Samo pole `id`, jeśli masz `jq`:**
```bash
curl -s https://api.mojang.com/users/profiles/minecraft/<nick> | jq -r .id
```

**Gdy gracz nie istnieje** — API zwraca pusty body (HTTP 204):
```bash
curl -s -o /dev/null -w "%{http_code}\n" https://api.mojang.com/users/profiles/minecraft/<nick>
# 204 = zły nick albo gracz nie istnieje
```
API działa po **aktualnym** nicku, nie po historii nazw — jeśli gracz niedawno się
przemianował, sprawdź jego obecny nick (np. na Namemc) zanim odpytasz Mojanga.

## Ponowne budowanie po aktualizacji Vencorda

Najprościej: uruchom ponownie `node install.mjs [ścieżka-do-Vencorda]` — zaktualizuje
i przebuduje wszystko.

Ręcznie:
```bash
git pull
pnpm install
pnpm build
pnpm inject
```
Katalog `src/userplugins/mcVoiceHeads/` nie jest częścią repo Vencorda, więc `git pull`
w Vencordzie go nie ruszy — trzeba osobno zaktualizować plugin
(`git -C src/userplugins/mcVoiceHeads pull`) i przebudować.

---

## Najczęstsze problemy

| Problem | Rozwiązanie |
|---|---|
| Efekt jaśnienia przy mówieniu nie działa | Klasy CSS Discorda są hashowane i zmieniają się między wersjami. Otwórz DevTools (Ctrl+Shift+I), znajdź faktyczną klasę elementu mówiącego uczestnika i podmień selektor `[class*="speaking"]` w stałej `CSS` w `index.tsx`. |
| `pnpm inject` nie widzi Discorda | Uruchom Discorda przynajmniej raz przed instalacją; jeśli instalator Vencorda pyta o ścieżkę, wskaż ją ręcznie. |
| Awatar się nie zmienił mimo poprawnego `userMap` | Sprawdź walidację ustawienia (czerwony komunikat = zły JSON/UUID) i czy Discord ID jest poprawne (Ustawienia → Zaawansowane → Tryb dewelopera, potem PPM na osobę → Kopiuj ID użytkownika). |

## Wymagania

- Klient Discord (desktop) z zainstalowanym Vencordem
- **Node.js** i **git** (do budowania/instalacji)
- UUID kont Minecraft osób, których awatar chcesz podmienić

## Licencja

[GPL-3.0-or-later](LICENSE) — zgodnie z licencją Vencorda, którego to jest plugin.
