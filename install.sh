#!/usr/bin/env bash
# mcVoiceHeads — instalator "jednym kliknięciem" dla macOS / Linux.
# Sprawdza node/git, pobiera najnowszy install.mjs z GitHuba i go uruchamia.
# (install.command to identyczna kopia dla dwukliku na macOS.)
set -euo pipefail

echo "==============================="
echo "  mcVoiceHeads — instalator"
echo "==============================="
echo

need() {
    command -v "$1" >/dev/null 2>&1 || {
        echo "[BŁĄD] Brak '$1' w PATH. $2"
        exit 1
    }
}

need node "Zainstaluj Node.js 18+ (https://nodejs.org/) i uruchom ponownie."
need git "Zainstaluj git (https://git-scm.com/downloads) i uruchom ponownie."

URL="https://raw.githubusercontent.com/PiotrKajor/mcVoiceHeads/master/install.mjs"
DIR="$(mktemp -d "${TMPDIR:-/tmp}/mcvoiceheads.XXXXXX")"
SCRIPT="$DIR/install.mjs"
trap 'rm -rf "$DIR"' EXIT

echo "Pobieram instalator:"
echo "  $URL"
if command -v curl >/dev/null 2>&1; then
    curl -fsSL "$URL" -o "$SCRIPT"
elif command -v wget >/dev/null 2>&1; then
    wget -qO "$SCRIPT" "$URL"
else
    echo "[BŁĄD] Potrzebny curl albo wget do pobrania instalatora."
    exit 1
fi

echo
echo "Uruchamiam instalator..."
echo
node "$SCRIPT" "$@"

echo
echo "=== Zakończono. Sprawdź log powyżej i zrestartuj Discorda całkowicie. ==="
