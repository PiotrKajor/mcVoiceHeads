/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 kajorpiotr
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

export function normalizeUuid(raw: string): string | null {
    const stripped = raw.replace(/-/g, "").toLowerCase();
    return /^[0-9a-f]{32}$/.test(stripped) ? stripped : null;
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
        const uuid = normalizeUuid(value);
        if (!uuid) return null;
        result[discordId] = uuid;
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
