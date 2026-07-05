# mcVoiceHeads

Nakładka głosowa Discorda, która dla wybranych osób pokazuje **głowę ich skina Minecraft** zamiast awatara Discorda. Idealna na serwery MC — od razu widać po skinie, kto mówi.

*A Discord voice overlay showing the Minecraft skin head (via [mc-heads.net](https://mc-heads.net)) instead of the Discord avatar for mapped users. Fork of [Overlayed](https://github.com/overlayeddev/overlayed).*

## Instalacja

Pobierz instalator z [**Releases**](https://github.com/PiotrKajor/mcVoiceHeads/releases):

| System | Plik |
|--------|------|
| Windows | `mcVoiceHeads_x.y.z_x64-setup.exe` |
| Linux | `.deb` / `.AppImage` |
| macOS | `.dmg` |

> Buildy nie są podpisane certyfikatem — Windows SmartScreen pokaże ostrzeżenie („Więcej informacji" → „Uruchom mimo to"), a na macOS trzeba zezwolić w Ustawieniach prywatności.

## Konfiguracja

1. Uruchom aplikację i zaloguj przez Discord (standardowy flow Overlayed).
2. Wejdź w **Settings → Configuration → Minecraft skin heads**.
3. Wpisz mapowanie JSON: Discord ID → nick albo UUID Minecraft:

```json
{
  "123456789012345678": "Notch",
  "987654321098765432": "069a79f4-44e9-4726-a5be-fca90e38aaf5"
}
```

- **Discord ID** skopiujesz po włączeniu trybu dewelopera w Discordzie (Ustawienia → Zaawansowane → Tryb dewelopera → PPM na użytkowniku → „Kopiuj ID użytkownika").
- **Nick MC** wystarczy — UUID nie jest potrzebny (mc-heads.net rozwiązuje nick sam). UUID znajdziesz np. na [NameMC](https://namemc.com) albo przez API Mojanga: `https://api.mojang.com/users/profiles/minecraft/<nick>`.
- Nieprawidłowy wpis podświetla się na czerwono i nie jest zapisywany; niezmapowani użytkownicy mają zwykły awatar Discorda.

Wszystko poza podmianą awatarów — wskaźnik mówienia, mute/deaf, przezroczystość, przypinanie — działa jak w Overlayed.

## Development

```bash
npm_config_force=true pnpm install   # zależność @types/github-script wymaga node 20; force przy nowszym node
pnpm start --filter=desktop          # dev (wymaga Rust + webkit2gtk na Linuksie)
pnpm build:desktop:unsigned          # build instalatora bez podpisu
cd apps/desktop && node --experimental-strip-types tests/parseUserMap.test.ts   # testy logiki mapowania
```

Wydania buduje GitHub Actions po wypchnięciu tagu `v*` (workflow `release.yaml`, draft do ręcznej publikacji).

## Licencja i pochodzenie

Fork [overlayeddev/overlayed](https://github.com/overlayeddev/overlayed) (**AGPL-3.0** — pełne źródła w tym repo). Cała baza nakładki (Tauri + React) pochodzi z Overlayed; ten fork dodaje wyłącznie mapowanie Discord ID → skin i podmianę URL awatara (`apps/desktop/src/utils/parseUserMap.ts`, `user.tsx`, zakładka ustawień).

Pierwsze wcielenie projektu — userplugin Vencorda — jest zachowane na gałęzi [`vencord-plugin`](https://github.com/PiotrKajor/mcVoiceHeads/tree/vencord-plugin).
