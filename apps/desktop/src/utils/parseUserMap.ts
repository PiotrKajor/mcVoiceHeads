// Ported from https://github.com/PiotrKajor/mcVoiceHeads (GPL-3.0-or-later, same author)
// SPDX-License-Identifier: AGPL-3.0-only

/** Normalize a Minecraft UUID (dashes optional) to 32 lowercase hex chars, or null. */
export function normalizeUuid(raw: string): string | null {
  const stripped = raw.replace(/-/g, "").toLowerCase();
  return /^[0-9a-f]{32}$/.test(stripped) ? stripped : null;
}

/** Valid Minecraft username: 3-16 chars of [A-Za-z0-9_]. */
export function isMinecraftName(raw: string): boolean {
  return /^[A-Za-z0-9_]{3,16}$/.test(raw);
}

/** Resolve a user-supplied value to a UUID or username usable in mc-heads.net URLs, or null. */
export function resolveMcId(raw: string): string | null {
  return normalizeUuid(raw) ?? (isMinecraftName(raw) ? raw : null);
}

/**
 * Parse a JSON mapping of Discord ID -> Minecraft UUID or username.
 * Returns null if the JSON is invalid or any value is neither a UUID nor a valid username.
 */
export function parseUserMap(json: string): Record<string, string> | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return null;
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return null;

  const result: Record<string, string> = {};
  for (const [discordId, value] of Object.entries(parsed as Record<string, unknown>)) {
    if (typeof value !== "string") return null;
    const mcId = resolveMcId(value);
    if (!mcId) return null;
    result[discordId] = mcId;
  }
  return result;
}
