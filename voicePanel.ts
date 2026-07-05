/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 kajorpiotr
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

// Pure, dependency-free helpers for the floating voice panel.
// Kept free of DOM / Discord imports so they can be unit tested with plain Node.

export interface VoiceStateLike {
    mute?: boolean;
    deaf?: boolean;
    selfMute?: boolean;
    selfDeaf?: boolean;
}

export interface VoiceStatus {
    muted: boolean;
    deafened: boolean;
}

/**
 * Derives the effective mute/deafen status from a Discord voice state.
 * A deafened user is always also muted (Discord mutes your mic when you deafen).
 */
export function deriveVoiceStatus(state: VoiceStateLike | null | undefined): VoiceStatus {
    const s = state ?? {};
    const deafened = Boolean(s.deaf || s.selfDeaf);
    const muted = Boolean(s.mute || s.selfMute) || deafened;
    return { muted, deafened };
}

export interface DisplayNameParts {
    id: string;
    nick?: string | null;
    globalName?: string | null;
    username?: string | null;
}

/** Picks the best available display name, mirroring Discord's own precedence. */
export function pickDisplayName(parts: DisplayNameParts): string {
    return (
        firstNonEmpty(parts.nick) ??
        firstNonEmpty(parts.globalName) ??
        firstNonEmpty(parts.username) ??
        parts.id
    );
}

function firstNonEmpty(value: string | null | undefined): string | null {
    if (typeof value !== "string") return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}

export interface Point {
    x: number;
    y: number;
}

export interface Size {
    width: number;
    height: number;
}

/**
 * Keeps a panel fully on screen. If the panel is larger than the viewport the
 * position is clamped to the top-left margin rather than going negative.
 */
export function clampPosition(pos: Point, size: Size, viewport: Size, margin = 8): Point {
    const maxX = Math.max(margin, viewport.width - size.width - margin);
    const maxY = Math.max(margin, viewport.height - size.height - margin);
    return {
        x: clamp(pos.x, margin, maxX),
        y: clamp(pos.y, margin, maxY),
    };
}

function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

export interface ParticipantLike {
    id: string;
    name: string;
}

/**
 * Orders participants: the current user first, then alphabetically by display
 * name (case-insensitive), with the id as a stable tiebreaker.
 */
export function compareParticipants(a: ParticipantLike, b: ParticipantLike, selfId?: string): number {
    if (selfId) {
        if (a.id === selfId && b.id !== selfId) return -1;
        if (b.id === selfId && a.id !== selfId) return 1;
    }
    const byName = a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
    if (byName !== 0) return byName;
    return a.id.localeCompare(b.id);
}
