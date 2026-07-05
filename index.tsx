/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 kajorpiotr
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { definePluginSettings } from "@api/Settings";
import definePlugin, { OptionType } from "@utils/types";
import { GuildMember, User } from "@vencord/discord-types";
import { ChannelStore, FluxDispatcher, GuildMemberStore, IconUtils, SelectedChannelStore, UserStore, VoiceStateStore } from "@webpack/common";

import { createVoicePanel, type PanelHandle, type PanelRow } from "./panel";
import { markUrl as markUrlWith, parseUserMap } from "./parseUserMap";
import { compareParticipants, deriveVoiceStatus, pickDisplayName, type Point, type VoiceStateLike } from "./voicePanel";

const MARKER_KEY = "vcmcvh";
const STYLE_ID = "vc-mcvh-style";
const CSS = `
img[src*="${MARKER_KEY}=1"] {
    opacity: var(--vc-mcvh-idle-opacity, 0.45);
    transition: opacity 150ms ease;
}
[class*="speaking"] img[src*="${MARKER_KEY}=1"] {
    opacity: 1;
}
html.vc-mcvh-hide-ring [class*="speaking"]:has(img[src*="${MARKER_KEY}=1"]) {
    box-shadow: none !important;
    outline: none !important;
}

/* Floating voice panel */
.vc-mcvh-panel {
    position: fixed;
    z-index: 3000;
    display: none;
    flex-direction: column;
    min-width: 200px;
    max-width: 320px;
    max-height: 60vh;
    padding: 6px;
    border-radius: 8px;
    background: var(--background-floating, #232428);
    box-shadow: var(--elevation-high, 0 8px 16px rgba(0, 0, 0, 0.24));
    color: var(--text-normal, #dbdee1);
    font-size: 14px;
    user-select: none;
}
.vc-mcvh-panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 2px 4px 6px;
    cursor: move;
    font-weight: 600;
}
.vc-mcvh-panel-title {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.vc-mcvh-panel-close {
    all: unset;
    cursor: pointer;
    line-height: 1;
    font-size: 18px;
    padding: 0 4px;
    color: var(--interactive-normal, #b5bac1);
}
.vc-mcvh-panel-close:hover {
    color: var(--interactive-hover, #dbdee1);
}
.vc-mcvh-panel-list {
    display: flex;
    flex-direction: column;
    gap: 2px;
    overflow-y: auto;
}
.vc-mcvh-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 3px 4px;
    border-radius: 4px;
    opacity: var(--vc-mcvh-idle-opacity, 0.45);
    transition: opacity 150ms ease, background-color 150ms ease;
}
.vc-mcvh-row.speaking {
    opacity: 1;
    background: color-mix(in srgb, var(--green-360, #23a55a) 18%, transparent);
    box-shadow: inset 2px 0 0 var(--green-360, #23a55a);
}
.vc-mcvh-avatar {
    flex: 0 0 auto;
    width: 24px;
    height: 24px;
}
.vc-mcvh-avatar img {
    width: 24px;
    height: 24px;
    border-radius: 4px;
    object-fit: cover;
    display: block;
}
.vc-mcvh-row.muted .vc-mcvh-avatar img,
.vc-mcvh-row.deafened .vc-mcvh-avatar img {
    filter: grayscale(1);
}
.vc-mcvh-name {
    flex: 1 1 auto;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.vc-mcvh-badge {
    flex: 0 0 auto;
    font-size: 12px;
    line-height: 1;
}
`;

function markUrl(url: string): string {
    return markUrlWith(url, MARKER_KEY);
}

function buildTemplateUrl(mcId: string): string {
    return markUrl(buildHeadUrl(mcId));
}

/** Avatar URL for the given Minecraft id/name, without the speaking-effect marker. */
function buildHeadUrl(mcId: string): string {
    return settings.store.avatarUrlTemplate.replaceAll("{uuid}", mcId);
}

let userMap: Record<string, string> = {};
function rebuildUserMap() {
    userMap = parseUserMap(settings.store.userMap) ?? {};
}

function shouldMark(userId: string): boolean {
    return !settings.store.restrictToVoiceView || VoiceStateStore.getVoiceStateForUser(userId) != null;
}

function resolveAvatarUrl(userId: string | undefined, original: string): string;
function resolveAvatarUrl(userId: string | undefined, original: string | null): string | null;
function resolveAvatarUrl(userId: string | undefined, original: string | null) {
    if (!userId || !shouldMark(userId)) return original;

    const mcId = userMap[userId];
    if (mcId) return buildTemplateUrl(mcId);

    return original && settings.store.applyToAllParticipants ? markUrl(original) : original;
}

function applyIdleOpacity(percent: number) {
    document.documentElement.style.setProperty("--vc-mcvh-idle-opacity", String(percent / 100));
}

function applyHideRing(hide: boolean) {
    document.documentElement.classList.toggle("vc-mcvh-hide-ring", hide);
}

// --- Floating voice panel ---------------------------------------------------

let panel: PanelHandle | null = null;
let panelPos: Point | null = null;
const speakingIds = new Set<string>();
let updateQueued = false;

function scheduleUpdate() {
    if (updateQueued) return;
    updateQueued = true;
    requestAnimationFrame(() => {
        updateQueued = false;
        if (panel) {
            try {
                panel.update();
            } catch {
                // never let a render error break the client
            }
        }
    });
}

function headUrlForPanel(userId: string, user: User | undefined): string | null {
    const mcId = userMap[userId];
    if (mcId) return buildHeadUrl(mcId);
    if (user && originalGetUserAvatarURL) {
        try {
            return originalGetUserAvatarURL.call(IconUtils, user, false, 64);
        } catch {
            return null;
        }
    }
    return null;
}

function currentTitle(): string {
    try {
        const id = SelectedChannelStore.getVoiceChannelId?.();
        if (id) {
            const name = ChannelStore.getChannel?.(id)?.name;
            if (name) return name;
        }
    } catch {
        // fall through to default
    }
    return "Kanał głosowy";
}

function getVoiceRows(): PanelRow[] {
    let channelId: string | null | undefined;
    try {
        channelId = SelectedChannelStore.getVoiceChannelId?.();
    } catch {
        channelId = null;
    }
    if (!channelId) return [];

    let states: Record<string, VoiceStateLike & { userId?: string; }> = {};
    try {
        states = VoiceStateStore.getVoiceStatesForChannel?.(channelId) ?? {};
    } catch {
        return [];
    }

    let guildId: string | undefined;
    try {
        guildId = ChannelStore.getChannel?.(channelId)?.guild_id ?? undefined;
    } catch {
        guildId = undefined;
    }
    let selfId: string | undefined;
    try {
        selfId = UserStore.getCurrentUser?.()?.id;
    } catch {
        selfId = undefined;
    }

    const rows: PanelRow[] = [];
    for (const userId of Object.keys(states)) {
        const state = states[userId];
        let user: User | undefined;
        try {
            user = UserStore.getUser?.(userId) ?? undefined;
        } catch {
            user = undefined;
        }
        let nick: string | null = null;
        if (guildId) {
            try {
                nick = GuildMemberStore.getNick?.(guildId, userId) ?? null;
            } catch {
                nick = null;
            }
        }
        const { muted, deafened } = deriveVoiceStatus(state);
        rows.push({
            id: userId,
            name: pickDisplayName({
                id: userId,
                nick,
                globalName: (user as { globalName?: string | null; })?.globalName,
                username: user?.username,
            }),
            avatarUrl: headUrlForPanel(userId, user),
            speaking: speakingIds.has(userId),
            muted,
            deafened,
        });
    }
    rows.sort((a, b) => compareParticipants(a, b, selfId));
    return rows;
}

function createPanel() {
    if (panel) return;
    panel = createVoicePanel({
        getTitle: currentTitle,
        getRows: getVoiceRows,
        getPosition: () => panelPos,
        onMove: pos => {
            panelPos = pos;
        },
        onClose: () => {
            settings.store.showVoicePanel = false;
        },
    });
    scheduleUpdate();
}

function destroyPanel() {
    panel?.destroy();
    panel = null;
}

function applyPanelSetting(show: boolean) {
    if (show) createPanel();
    else destroyPanel();
}

function onSpeaking(e: { userId?: string; speakingFlags?: number; }) {
    if (!e || typeof e.userId !== "string") return;
    if (e.speakingFlags) speakingIds.add(e.userId);
    else speakingIds.delete(e.userId);
    scheduleUpdate();
}

const settings = definePluginSettings({
    userMap: {
        type: OptionType.STRING,
        description: 'Mapowanie Discord ID -> UUID albo nick Minecraft (JSON), np. {"123456789012345678":"Notch"}',
        default: "{}",
        multiline: true,
        onChange: rebuildUserMap,
        isValid: (value: string) => parseUserMap(value) !== null || "Nieprawidłowy JSON albo wartość (oczekiwano UUID lub nicku Minecraft: 3-16 znaków [A-Za-z0-9_])",
    },
    restrictToVoiceView: {
        type: OptionType.BOOLEAN,
        description: "Podmieniaj awatary tylko w widoku kanału głosowego (wyłączone = podmieniaj wszędzie)",
        default: false,
    },
    avatarUrlTemplate: {
        type: OptionType.STRING,
        description: "Szablon URL awatara, {uuid} zostanie podstawione UUID-em lub nickiem",
        default: "https://mc-heads.net/avatar/{uuid}/128",
    },
    idleOpacity: {
        type: OptionType.SLIDER,
        description: "Opacity w spoczynku (%)",
        markers: [0, 20, 40, 60, 80, 100],
        default: 45,
        stickToMarkers: false,
        onChange: applyIdleOpacity,
    },
    hideNativeSpeakingRing: {
        type: OptionType.BOOLEAN,
        description: "Ukryj natywną zieloną obwódkę mówienia na podmienionych kafelkach",
        default: true,
        onChange: applyHideRing,
    },
    applyToAllParticipants: {
        type: OptionType.BOOLEAN,
        description: "Stosuj efekt opacity do wszystkich uczestników kanału, nie tylko zmapowanych",
        default: false,
    },
    showVoicePanel: {
        type: OptionType.BOOLEAN,
        description: "Pokazuj pływającą nakładkę głosową (uczestnicy kanału jako głowy Minecraft, z live wskaźnikiem mówienia i mute/deaf)",
        default: false,
        onChange: applyPanelSetting,
    },
});

let originalGetUserAvatarURL: typeof IconUtils.getUserAvatarURL;
let originalGetGuildMemberAvatarURL: typeof IconUtils.getGuildMemberAvatarURL;

export default definePlugin({
    name: "McVoiceHeads",
    description: "Podmienia awatary wybranych osób na twarze ich skinów z Minecrafta, z efektem opacity przy mówieniu oraz opcjonalną pływającą nakładką kanału głosowego",
    authors: [{ name: "kajorpiotr", id: 0n }],
    settings,

    start() {
        const style = document.createElement("style");
        style.id = STYLE_ID;
        style.textContent = CSS;
        document.head.appendChild(style);

        rebuildUserMap();
        applyIdleOpacity(settings.store.idleOpacity);
        applyHideRing(settings.store.hideNativeSpeakingRing);

        originalGetUserAvatarURL = IconUtils.getUserAvatarURL;
        originalGetGuildMemberAvatarURL = IconUtils.getGuildMemberAvatarURL;

        IconUtils.getUserAvatarURL = function (this: unknown, user: User, ...rest: [boolean?, number?, string?]) {
            const original = originalGetUserAvatarURL.call(this, user, ...rest);
            return resolveAvatarUrl(user?.id, original);
        };

        IconUtils.getGuildMemberAvatarURL = function (this: unknown, member: GuildMember, ...rest: [string?]) {
            const original = originalGetGuildMemberAvatarURL.call(this, member, ...rest);
            return resolveAvatarUrl(member?.userId, original);
        };

        try {
            VoiceStateStore.addChangeListener?.(scheduleUpdate);
        } catch { /* store may not expose listeners */ }
        try {
            SelectedChannelStore.addChangeListener?.(scheduleUpdate);
        } catch { /* store may not expose listeners */ }
        try {
            FluxDispatcher.subscribe("SPEAKING", onSpeaking);
        } catch { /* dispatcher unavailable */ }

        applyPanelSetting(settings.store.showVoicePanel);
    },

    stop() {
        document.getElementById(STYLE_ID)?.remove();
        IconUtils.getUserAvatarURL = originalGetUserAvatarURL;
        IconUtils.getGuildMemberAvatarURL = originalGetGuildMemberAvatarURL;
        document.documentElement.classList.remove("vc-mcvh-hide-ring");
        document.documentElement.style.removeProperty("--vc-mcvh-idle-opacity");

        try {
            VoiceStateStore.removeChangeListener?.(scheduleUpdate);
        } catch { /* ignore */ }
        try {
            SelectedChannelStore.removeChangeListener?.(scheduleUpdate);
        } catch { /* ignore */ }
        try {
            FluxDispatcher.unsubscribe("SPEAKING", onSpeaking);
        } catch { /* ignore */ }

        destroyPanel();
        speakingIds.clear();
    },
});
