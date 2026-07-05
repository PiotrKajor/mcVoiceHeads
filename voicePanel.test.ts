/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 kajorpiotr
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import assert from "node:assert";

import { clampPosition, compareParticipants, deriveVoiceStatus, pickDisplayName } from "./voicePanel.ts";

// deriveVoiceStatus
assert.deepStrictEqual(deriveVoiceStatus(undefined), { muted: false, deafened: false });
assert.deepStrictEqual(deriveVoiceStatus({}), { muted: false, deafened: false });
assert.deepStrictEqual(deriveVoiceStatus({ selfMute: true }), { muted: true, deafened: false });
assert.deepStrictEqual(deriveVoiceStatus({ mute: true }), { muted: true, deafened: false });
// deafened implies muted, even if the mute flags are not set
assert.deepStrictEqual(deriveVoiceStatus({ selfDeaf: true }), { muted: true, deafened: true });
assert.deepStrictEqual(deriveVoiceStatus({ deaf: true }), { muted: true, deafened: true });

// pickDisplayName precedence: nick > globalName > username > id
assert.strictEqual(pickDisplayName({ id: "1", nick: "Nick", globalName: "Global", username: "user" }), "Nick");
assert.strictEqual(pickDisplayName({ id: "1", globalName: "Global", username: "user" }), "Global");
assert.strictEqual(pickDisplayName({ id: "1", username: "user" }), "user");
assert.strictEqual(pickDisplayName({ id: "1" }), "1");
// blank / whitespace names are skipped
assert.strictEqual(pickDisplayName({ id: "1", nick: "  ", username: "user" }), "user");

// clampPosition keeps the panel on screen
assert.deepStrictEqual(
    clampPosition({ x: -50, y: -50 }, { width: 200, height: 100 }, { width: 1000, height: 800 }),
    { x: 8, y: 8 },
);
assert.deepStrictEqual(
    clampPosition({ x: 5000, y: 5000 }, { width: 200, height: 100 }, { width: 1000, height: 800 }),
    { x: 792, y: 692 },
);
// panel larger than viewport clamps to the top-left margin
assert.deepStrictEqual(
    clampPosition({ x: 300, y: 300 }, { width: 2000, height: 2000 }, { width: 1000, height: 800 }),
    { x: 8, y: 8 },
);

// compareParticipants: self is always first
const self = { id: "self", name: "Zzz" };
const other = { id: "other", name: "Aaa" };
assert.ok(compareParticipants(self, other, "self") < 0);
assert.ok(compareParticipants(other, self, "self") > 0);
// otherwise alphabetical, case-insensitive
assert.ok(compareParticipants({ id: "a", name: "alice" }, { id: "b", name: "Bob" }) < 0);
assert.ok(compareParticipants({ id: "b", name: "Bob" }, { id: "a", name: "alice" }) > 0);
// stable tiebreak by id when names match
assert.ok(compareParticipants({ id: "1", name: "Same" }, { id: "2", name: "Same" }) < 0);

console.log("voicePanel.test.ts: OK");
