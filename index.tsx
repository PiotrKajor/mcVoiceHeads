/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 kajorpiotr
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { definePluginSettings } from "@api/Settings";
import definePlugin, { OptionType } from "@utils/types";
import { GuildMember, User } from "@vencord/discord-types";
import { IconUtils, VoiceStateStore } from "@webpack/common";

import { markUrl as markUrlWith, parseUserMap } from "./parseUserMap";

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
`;

function markUrl(url: string): string {
    return markUrlWith(url, MARKER_KEY);
}

function buildTemplateUrl(uuid: string): string {
    return markUrl(settings.store.avatarUrlTemplate.replaceAll("{uuid}", uuid));
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

    const uuid = userMap[userId];
    if (uuid) return buildTemplateUrl(uuid);

    return original && settings.store.applyToAllParticipants ? markUrl(original) : original;
}

function applyIdleOpacity(percent: number) {
    document.documentElement.style.setProperty("--vc-mcvh-idle-opacity", String(percent / 100));
}

function applyHideRing(hide: boolean) {
    document.documentElement.classList.toggle("vc-mcvh-hide-ring", hide);
}

const settings = definePluginSettings({
    userMap: {
        type: OptionType.STRING,
        description: 'Mapowanie Discord ID -> UUID Minecraft (JSON), np. {"123456789012345678":"069a79f4-44e9-4726-a5be-fca90e38aaf5"}',
        default: "{}",
        multiline: true,
        onChange: rebuildUserMap,
        isValid: (value: string) => parseUserMap(value) !== null || "Nieprawidłowy JSON albo UUID (oczekiwano 32 znaków hex, myślniki opcjonalne)",
    },
    restrictToVoiceView: {
        type: OptionType.BOOLEAN,
        description: "Podmieniaj awatary tylko w widoku kanału głosowego (wyłączone = podmieniaj wszędzie)",
        default: false,
    },
    avatarUrlTemplate: {
        type: OptionType.STRING,
        description: "Szablon URL awatara, {uuid} zostanie podstawione",
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
});

let originalGetUserAvatarURL: typeof IconUtils.getUserAvatarURL;
let originalGetGuildMemberAvatarURL: typeof IconUtils.getGuildMemberAvatarURL;

export default definePlugin({
    name: "McVoiceHeads",
    description: "Podmienia awatary wybranych osób na twarze ich skinów z Minecrafta, z efektem opacity przy mówieniu na kanale głosowym",
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
    },

    stop() {
        document.getElementById(STYLE_ID)?.remove();
        IconUtils.getUserAvatarURL = originalGetUserAvatarURL;
        IconUtils.getGuildMemberAvatarURL = originalGetGuildMemberAvatarURL;
        document.documentElement.classList.remove("vc-mcvh-hide-ring");
        document.documentElement.style.removeProperty("--vc-mcvh-idle-opacity");
    },
});
