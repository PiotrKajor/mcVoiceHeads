/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 kajorpiotr
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

export function normalizeUuid(raw: string): string | null {
    const stripped = raw.replace(/-/g, "").toLowerCase();
    return /^[0-9a-f]{32}$/.test(stripped) ? stripped : null;
}

/** Minecraft (Java) usernames are 3-16 chars of [A-Za-z0-9_]. */
export function isMinecraftName(raw: string): boolean {
    return /^[A-Za-z0-9_]{3,16}$/.test(raw);
}

/**
 * Accepts either a Minecraft UUID (dashes optional) or a current Minecraft
 * username, and returns the value to substitute into the avatar URL template.
 * UUIDs are normalized to 32 lowercase hex chars; usernames are returned as
 * typed (avatar services such as mc-heads.net resolve them server-side).
 */
export function resolveMcId(value: string): string | null {
    const uuid = normalizeUuid(value);
    if (uuid) return uuid;
    if (isMinecraftName(value)) return value;
    return null;
}

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

export function markUrl(url: string, markerKey: string): string {
    try {
        const u = new URL(url);
        u.searchParams.set(markerKey, "1");
        return u.toString();
    } catch {
        return url;
    }
}
