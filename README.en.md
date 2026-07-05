<div align="center">

<sub><a href="README.md">Polski</a> · <b>English</b></sub>

# 🎧 mcVoiceHeads

**A Vencord userplugin — replaces the Discord avatars of chosen people with the faces of their Minecraft skins.**

The avatar is semi-transparent while idle, and when that person speaks in a voice channel it smoothly brightens to full opacity.

![Platform](https://img.shields.io/badge/Windows%20%7C%20macOS%20%7C%20Linux-2a3245?style=for-the-badge)
&nbsp;
![License](https://img.shields.io/badge/license-GPL--3.0-3ddc84?style=for-the-badge)
&nbsp;
![Requires](https://img.shields.io/badge/requires-Vencord-5865F2?style=for-the-badge)

</div>

---

## What it does

You map your friends' Discord IDs to the UUIDs of their Minecraft accounts. The plugin
replaces their Discord avatars with their skin heads (via `mc-heads.net` by default), and
when they speak in a voice channel the avatar smoothly transitions from a semi-transparent
idle state to full color.

## Features

- 🪖 Replaces the avatar with a Minecraft skin head (any URL template, `mc-heads.net` by default)
- 🏷️ Each mapping accepts a **UUID or a Minecraft nickname** (the avatar service, e.g. `mc-heads.net`, resolves the nick)
- 🗣️ Smooth brightening of the avatar when speaking in a voice channel (opacity + a ~150ms transition)
- 🪟 A floating, draggable **voice-channel panel** — participants as Minecraft heads with a live speaking highlight (inspired by [Overlayed](https://github.com/overlayeddev/overlayed))
- 🔇 **Mute and deafen** indicators on the panel — grayscale avatar + an icon
- 🎯 Replacement scope: everywhere, or only in the voice-channel view
- 🟢 Optionally hides Discord's native green speaking ring
- 🌐 The opacity effect optionally applies to unmapped participants too
- ⚙️ Everything is configurable from Vencord's settings, no code editing

---

## Installation (automatic)

Requires only **`git`** and **`node`** (Windows/macOS/Linux) in PATH. The `install.mjs`
script installs `pnpm` for you, clones/updates Vencord and this plugin, builds everything
and injects it into the Discord client.

### One click (easiest)

Download the launcher for your OS and run it — it checks `node`/`git`, downloads the latest
`install.mjs` and runs the whole installation. You still need **`git`** and **`node`** (18+)
installed.

- **Windows** — download [`install.bat`](https://raw.githubusercontent.com/PiotrKajor/mcVoiceHeads/master/install.bat) and double-click it.
- **macOS** — download [`install.command`](https://raw.githubusercontent.com/PiotrKajor/mcVoiceHeads/master/install.command) and double-click it. On first run Gatekeeper may block it — right-click the file → **Open** → **Open**. (Or from a terminal: `chmod +x install.command && ./install.command`.)
- **Linux** — download [`install.sh`](https://raw.githubusercontent.com/PiotrKajor/mcVoiceHeads/master/install.sh) and run: `bash install.sh` (or `chmod +x install.sh && ./install.sh`).

During the process the installer asks you to **close Discord completely** before injecting —
see the notes in the [Via terminal](#via-terminal) section below. Advanced: you can pass a
custom Vencord path to the launcher as an argument (e.g. `install.bat C:\Users\You\Vencord`).

### Via terminal

1. Make sure you have `git` and `node` (Node.js 18+):
   ```bash
   git --version
   node --version
   ```
   If either is missing: [git-scm.com](https://git-scm.com/downloads) and [nodejs.org](https://nodejs.org/).

2. Download the install script:
   ```bash
   curl -o install.mjs https://raw.githubusercontent.com/PiotrKajor/mcVoiceHeads/master/install.mjs
   ```
   **Windows (PowerShell)**, if you don't have `curl`:
   ```powershell
   Invoke-WebRequest https://raw.githubusercontent.com/PiotrKajor/mcVoiceHeads/master/install.mjs -OutFile install.mjs
   ```

3. Run it:
   ```bash
   node install.mjs
   ```

### What happens then (in order)

1. Checks whether `pnpm` is available — if not, it tries `corepack enable`, and when that
   fails, `npm install -g pnpm`.
2. If the target Vencord directory doesn't exist — it clones `Vendicated/Vencord`.
3. Clones this plugin into `src/userplugins/mcVoiceHeads/` (or `git pull`, if it's already there).
4. Runs `pnpm install`, then `pnpm build`.
5. **Stops and asks you to close Discord** (press Enter to continue) — only then does it run
   `pnpm inject`. Injection requires Discord not to be running (not even in the system tray),
   otherwise the Vencord installer reports an error like "Cannot patch because Discord's files
   are used by a different process".

You see the live output of all these commands in the terminal — if something breaks (e.g.
missing permissions, Discord was still running in the background), you'll see exactly which
step failed and why. On such an error the Vencord installer can still exit without reporting
a failure to the system — **always check the log**, not just the last line. If there's an
error, just close Discord and manually repeat only that step in the Vencord directory:
`pnpm inject`.

### Custom Vencord location

By default the script clones/uses `~/Vencord`. To point it at another location (e.g. an
existing clone):
```bash
node install.mjs /path/to/Vencord
```
```powershell
node install.mjs C:\Users\You\Vencord
```

### After installation

`pnpm inject` will ask for the path to the Discord client if it can't detect it
automatically — point it at the install folder (e.g. `%LOCALAPPDATA%\Discord` on Windows).
Finally, **restart Discord completely** (not just a window refresh) and enable the plugin in
the settings — see the [Enabling the plugin](#enabling-the-plugin) section below.

## Building (manually)

1. Install `pnpm` (if you don't have it): `corepack enable` or `npm install -g pnpm`.
2. Clone Vencord and enter the repo:
   ```bash
   git clone https://github.com/Vendicated/Vencord
   cd Vencord
   ```
3. Clone this repo directly into `src/userplugins/mcVoiceHeads/`:
   ```bash
   git clone https://github.com/PiotrKajor/mcVoiceHeads src/userplugins/mcVoiceHeads
   ```
4. Install dependencies and build:
   ```bash
   pnpm install
   pnpm build
   ```
5. Inject Vencord into the Discord client:
   ```bash
   pnpm inject
   ```
   Follow the instructions (point it at the Discord location) and restart the client.

## Enabling the plugin

Discord Settings → Vencord → Plugins → find **McVoiceHeads** → enable it. Click the gear
icon next to the plugin to open its settings.

## Settings

- **userMap** — a mapping of Discord ID → Minecraft UUID **or nickname** as JSON, e.g.:
  ```json
  {
    "123456789012345678": "069a79f4-44e9-4726-a5be-fca90e38aaf5",
    "987654321098765432": "8667ba71b85a4004af54457a9734eed7",
    "111222333444555666": "Notch"
  }
  ```
  The UUID may be with or without dashes — it will be normalized automatically. Instead of a
  UUID you can enter a **Minecraft nickname** (3–16 chars of `[A-Za-z0-9_]`) — the default
  `mc-heads.net` service resolves it server-side, so you don't have to look up the UUID
  yourself. A UUID is more robust though: a nickname follows account renames, a UUID does not.
  Invalid JSON or a value that is neither a UUID nor a nickname triggers a validation error on
  save.
- **restrictToVoiceView** — if enabled, the replacement only works while that person is
  currently in a voice channel; if disabled (the default), the avatar is replaced everywhere
  (messages, member list, profile…).
- **avatarUrlTemplate** — a URL template; `{uuid}` will be replaced with the player's UUID.
  Defaults to `https://mc-heads.net/avatar/{uuid}/128`.
- **idleOpacity** — the avatar's opacity while idle (45% by default).
- **hideNativeSpeakingRing** — hides Discord's native green ring on replaced tiles (enabled
  by default).
- **applyToAllParticipants** — applies the opacity/speaking effect to unmapped people too (on
  their original avatars), not only to those in the `userMap` list.
- **showVoicePanel** — enables the floating voice-channel panel (disabled by default).

## Voice panel

Inspired by [Overlayed](https://github.com/overlayeddev/overlayed). When **showVoicePanel** is
on, the plugin draws a small, draggable window inside the Discord client listing everyone in
your current voice channel:

- each participant as a Minecraft head (if mapped) or their regular Discord avatar,
- the **person speaking** is highlighted and fully opaque, everyone else is dimmed (to the same
  level as `idleOpacity`),
- **muted / deafened** users get a grayscale avatar and an icon (🔇 / 🎧),
- the header shows the channel name; drag the window by its header, and `×` closes it
  (turning `showVoicePanel` off).

The panel only appears while you're in a voice channel and disappears when you leave. It renders
in the **normal Discord app window** — not in the in-game overlay (Game Overlay); see
[Common problems](#common-problems).

## How to find a player's UUID by nickname

> 💡 With the default `mc-heads.net` service you can just put a **nickname** in `userMap`
> instead of a UUID — the steps below are only needed if you want to hard-code a UUID (stable
> across renames) or use a service that accepts UUIDs only.

Mojang's public API returns a UUID based on a player's current nickname.

```bash
curl -s https://api.mojang.com/users/profiles/minecraft/<nick>
```

Example for the player `Notch`:
```bash
curl -s https://api.mojang.com/users/profiles/minecraft/Notch
```
returns:
```json
{"id":"069a79f444e94726a5befca90e38aaf5","name":"Notch"}
```
The `id` field is the UUID you want (without dashes) — paste it directly as the value in
`userMap`:
```json
{"123456789012345678": "069a79f444e94726a5befca90e38aaf5"}
```

**Windows (PowerShell):**
```powershell
Invoke-RestMethod https://api.mojang.com/users/profiles/minecraft/<nick>
```

**Just the `id` field, if you have `jq`:**
```bash
curl -s https://api.mojang.com/users/profiles/minecraft/<nick> | jq -r .id
```

**When the player doesn't exist** — the API returns an empty body (HTTP 204):
```bash
curl -s -o /dev/null -w "%{http_code}\n" https://api.mojang.com/users/profiles/minecraft/<nick>
# 204 = wrong nickname or the player doesn't exist
```
The API works by **current** nickname, not name history — if a player renamed recently, check
their present nickname (e.g. on NameMC) before querying Mojang.

## Rebuilding after a Vencord update

Easiest: run `node install.mjs [path-to-Vencord]` again — it updates and rebuilds everything.

Manually:
```bash
git pull
pnpm install
pnpm build
pnpm inject
```
The `src/userplugins/mcVoiceHeads/` directory is not part of the Vencord repo, so `git pull`
in Vencord won't touch it — you need to update the plugin separately
(`git -C src/userplugins/mcVoiceHeads pull`) and rebuild.

---

## Common problems

| Problem | Solution |
|---|---|
| The speaking brighten effect doesn't work | Discord's CSS classes are hashed and change between versions. Open DevTools (Ctrl+Shift+I), find the actual class of a speaking participant's element and swap the `[class*="speaking"]` selector in the `CSS` constant in `index.tsx`. |
| `pnpm inject` doesn't see Discord | Run Discord at least once before installing; if the Vencord installer asks for the path, point it there manually. |
| The avatar didn't change despite a correct `userMap` | Check the setting's validation (a red message = bad JSON/UUID) and whether the Discord ID is correct (Settings → Advanced → Developer Mode, then right-click a person → Copy User ID). |
| Nothing changes in the **in-game overlay** (Discord Game Overlay) | This is not a plugin bug — Vencord doesn't inject into the in-game overlay window at all (a separate, unpatched Electron window), so none of its plugins work there. Test the effect in the normal Discord app window (the voice-channel participant list in the sidebar or the call popout). |

## Requirements

- A Discord (desktop) client with Vencord installed
- **Node.js** and **git** (for building/installing)
- The Minecraft account UUIDs **or nicknames** of the people whose avatars you want to replace

## Tests

The pure logic (map parsing, UUID/nickname validation, panel helpers) has unit tests run via
Node's built-in type stripping (18+, 22+ recommended):
```bash
npm test
```

## License

[GPL-3.0-or-later](LICENSE) — in line with the license of Vencord, whose plugin this is.
