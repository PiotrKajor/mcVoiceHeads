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

Wymaga tylko `git` i `node` (Windows/macOS/Linux). Skrypt sam doinstaluje `pnpm`,
sklonuje/zaktualizuje Vencorda i ten plugin, zbuduje i wstrzyknie do klienta Discord.

```bash
curl -o install.mjs https://raw.githubusercontent.com/PiotrKajor/mcVoiceHeads/master/install.mjs
node install.mjs
```

Domyślnie klonuje Vencorda do `~/Vencord`. Żeby użyć innej lokalizacji (np. już istniejącego klonu):
```bash
node install.mjs /sciezka/do/Vencord
```

Zrestartuj Discorda po zakończeniu.

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

Wejdź na `https://api.mojang.com/users/profiles/minecraft/<nick>` (np. w przeglądarce albo
`curl`) — w odpowiedzi JSON pole `id` to UUID (bez myślników). Można go użyć bezpośrednio
w `userMap`.

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
