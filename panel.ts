/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 kajorpiotr
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

// Vanilla-DOM controller for the floating voice panel. Kept framework-free so
// it does not depend on any particular Vencord React-root API; index.tsx feeds
// it fully-computed rows and it renders/updates them imperatively.

import { clampPosition, type Point } from "./voicePanel";

export interface PanelRow {
    id: string;
    name: string;
    avatarUrl: string | null;
    speaking: boolean;
    muted: boolean;
    deafened: boolean;
}

export interface PanelOptions {
    /** Header text (e.g. the voice channel name). */
    getTitle: () => string;
    /** Current participants; an empty array hides the panel. */
    getRows: () => PanelRow[];
    /** Persisted position, or null to use the default corner. */
    getPosition: () => Point | null;
    /** Called after a drag finishes so the caller can persist the position. */
    onMove: (pos: Point) => void;
    /** Called when the user clicks the close button. */
    onClose: () => void;
}

export interface PanelHandle {
    update: () => void;
    destroy: () => void;
}

export const PANEL_ID = "vc-mcvh-panel";

const DEFAULT_MARGIN = 8;
const DEFAULT_OFFSET = 96;

export function createVoicePanel(opts: PanelOptions): PanelHandle {
    const container = document.createElement("div");
    container.id = PANEL_ID;
    container.className = "vc-mcvh-panel";
    container.style.display = "none";

    const header = document.createElement("div");
    header.className = "vc-mcvh-panel-header";

    const titleEl = document.createElement("span");
    titleEl.className = "vc-mcvh-panel-title";
    header.appendChild(titleEl);

    const closeBtn = document.createElement("button");
    closeBtn.className = "vc-mcvh-panel-close";
    closeBtn.type = "button";
    closeBtn.textContent = "×"; // ×
    closeBtn.setAttribute("aria-label", "Zamknij");
    closeBtn.addEventListener("click", e => {
        e.stopPropagation();
        opts.onClose();
    });
    header.appendChild(closeBtn);

    const list = document.createElement("div");
    list.className = "vc-mcvh-panel-list";

    container.appendChild(header);
    container.appendChild(list);
    document.body.appendChild(container);

    // Initial position: persisted, otherwise a top-right-ish default corner.
    const start = opts.getPosition() ?? {
        x: Math.max(DEFAULT_MARGIN, window.innerWidth - 260 - DEFAULT_OFFSET),
        y: DEFAULT_OFFSET,
    };
    setPosition(start.x, start.y);

    function setPosition(x: number, y: number) {
        const clamped = clampPosition(
            { x, y },
            { width: container.offsetWidth || 240, height: container.offsetHeight || 120 },
            { width: window.innerWidth, height: window.innerHeight },
            DEFAULT_MARGIN,
        );
        container.style.left = `${clamped.x}px`;
        container.style.top = `${clamped.y}px`;
        return clamped;
    }

    // --- drag handling ---
    let dragOffset: Point | null = null;

    function onPointerDown(e: MouseEvent) {
        if (e.button !== 0) return;
        if ((e.target as HTMLElement)?.closest(".vc-mcvh-panel-close")) return;
        const rect = container.getBoundingClientRect();
        dragOffset = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        document.addEventListener("mousemove", onPointerMove);
        document.addEventListener("mouseup", onPointerUp);
        e.preventDefault();
    }

    function onPointerMove(e: MouseEvent) {
        if (!dragOffset) return;
        setPosition(e.clientX - dragOffset.x, e.clientY - dragOffset.y);
    }

    function onPointerUp() {
        dragOffset = null;
        document.removeEventListener("mousemove", onPointerMove);
        document.removeEventListener("mouseup", onPointerUp);
        opts.onMove({
            x: parseFloat(container.style.left) || 0,
            y: parseFloat(container.style.top) || 0,
        });
    }

    header.addEventListener("mousedown", onPointerDown);

    function renderRow(row: PanelRow): HTMLElement {
        const el = document.createElement("div");
        el.className = "vc-mcvh-row";
        if (row.speaking) el.classList.add("speaking");
        if (row.muted) el.classList.add("muted");
        if (row.deafened) el.classList.add("deafened");

        const avatar = document.createElement("div");
        avatar.className = "vc-mcvh-avatar";
        if (row.avatarUrl) {
            const img = document.createElement("img");
            img.src = row.avatarUrl;
            img.alt = "";
            img.addEventListener("error", () => img.remove());
            avatar.appendChild(img);
        }
        el.appendChild(avatar);

        const name = document.createElement("span");
        name.className = "vc-mcvh-name";
        name.textContent = row.name; // textContent -> no HTML injection from names
        el.appendChild(name);

        if (row.deafened) {
            el.appendChild(makeBadge("🎧", "Ogłuszony"));
        } else if (row.muted) {
            el.appendChild(makeBadge("🔇", "Wyciszony"));
        }
        return el;
    }

    function makeBadge(text: string, title: string): HTMLElement {
        const badge = document.createElement("span");
        badge.className = "vc-mcvh-badge";
        badge.textContent = text;
        badge.title = title;
        return badge;
    }

    function update() {
        const rows = opts.getRows();
        if (rows.length === 0) {
            container.style.display = "none";
            return;
        }
        titleEl.textContent = opts.getTitle();
        list.replaceChildren(...rows.map(renderRow));
        container.style.display = "flex";
        // Re-clamp in case the panel grew past the viewport edge.
        setPosition(parseFloat(container.style.left) || 0, parseFloat(container.style.top) || 0);
    }

    function destroy() {
        header.removeEventListener("mousedown", onPointerDown);
        document.removeEventListener("mousemove", onPointerMove);
        document.removeEventListener("mouseup", onPointerUp);
        container.remove();
    }

    return { update, destroy };
}
