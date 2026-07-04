#!/usr/bin/env node
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { createInterface } from "node:readline/promises";

const vencordDir = process.argv[2] ?? join(homedir(), "Vencord");
const pluginDir = join(vencordDir, "src", "userplugins", "mcVoiceHeads");
const repoUrl = "https://github.com/PiotrKajor/mcVoiceHeads.git";

function run(cmd, cwd) {
    console.log(`$ ${cmd}`);
    execSync(cmd, { cwd, stdio: "inherit" });
}

async function pause(message) {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    await rl.question(message);
    rl.close();
}

function hasPnpm() {
    try {
        execSync("pnpm --version", { stdio: "ignore" });
        return true;
    } catch {
        return false;
    }
}

if (!hasPnpm()) {
    console.log("pnpm nie znaleziony, instaluję...");
    try {
        run("corepack enable");
    } catch {
        try {
            run("npm install -g pnpm");
        } catch {
            console.error("Nie udało się zainstalować pnpm automatycznie. Zainstaluj ręcznie: npm install -g pnpm");
            process.exit(1);
        }
    }
    if (!hasPnpm()) {
        console.error("pnpm nadal niedostępny w PATH. Zainstaluj ręcznie i uruchom skrypt ponownie.");
        process.exit(1);
    }
}

if (!existsSync(join(vencordDir, ".git"))) {
    console.log(`Klonuję Vencorda do ${vencordDir}...`);
    run(`git clone https://github.com/Vendicated/Vencord "${vencordDir}"`);
}

if (existsSync(join(pluginDir, ".git"))) {
    console.log("Aktualizuję plugin...");
    run("git pull", pluginDir);
} else {
    console.log("Klonuję plugin...");
    run(`git clone ${repoUrl} "${pluginDir}"`);
}

run("pnpm install", vencordDir);
run("pnpm build", vencordDir);

await pause("\nZamknij Discorda CAŁKOWICIE (też z zasobnika systemowego), po czym naciśnij Enter, aby wstrzyknąć Vencorda... ");
run("pnpm inject", vencordDir);

console.log(
    "\nSprawdź log powyżej. Jeśli ostatni krok pokazuje błąd (np. \"Cannot patch\" / \"❌ Failed\")," +
    " Discord nadal działał w tle — zamknij go całkowicie i uruchom sam ten krok ponownie w katalogu Vencorda: pnpm inject." +
    "\nJeśli zakończyło się bez błędów: uruchom Discorda i włącz McVoiceHeads w Ustawieniach Vencorda -> Pluginy.",
);
