/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 kajorpiotr
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import assert from "node:assert";

import { isMinecraftName, markUrl, normalizeUuid, parseUserMap, resolveMcId } from "./parseUserMap.ts";

// normalizeUuid
assert.strictEqual(normalizeUuid("069a79f4-44e9-4726-a5be-fca90e38aaf5"), "069a79f444e94726a5befca90e38aaf5");
assert.strictEqual(normalizeUuid("069A79F444E94726A5BEFCA90E38AAF5"), "069a79f444e94726a5befca90e38aaf5");
assert.strictEqual(normalizeUuid("not-a-uuid"), null);
assert.strictEqual(normalizeUuid("069a79f4"), null);

// isMinecraftName
assert.strictEqual(isMinecraftName("Notch"), true);
assert.strictEqual(isMinecraftName("jeb_"), true);
assert.strictEqual(isMinecraftName("ab"), false); // too short
assert.strictEqual(isMinecraftName("ThisNameIsWayTooLong"), false); // > 16
assert.strictEqual(isMinecraftName("has space"), false);
assert.strictEqual(isMinecraftName("bad-dash"), false);

// resolveMcId: UUID takes precedence, otherwise username, otherwise null
assert.strictEqual(resolveMcId("069a79f4-44e9-4726-a5be-fca90e38aaf5"), "069a79f444e94726a5befca90e38aaf5");
assert.strictEqual(resolveMcId("Notch"), "Notch");
assert.strictEqual(resolveMcId("!!"), null);

// parseUserMap: UUID values
assert.deepStrictEqual(
    parseUserMap('{"123":"069a79f4-44e9-4726-a5be-fca90e38aaf5"}'),
    { "123": "069a79f444e94726a5befca90e38aaf5" },
);
// parseUserMap: username values (new)
assert.deepStrictEqual(parseUserMap('{"123":"Notch"}'), { "123": "Notch" });
assert.deepStrictEqual(
    parseUserMap('{"123":"069a79f444e94726a5befca90e38aaf5","456":"jeb_"}'),
    { "123": "069a79f444e94726a5befca90e38aaf5", "456": "jeb_" },
);
// parseUserMap: rejections
assert.strictEqual(parseUserMap("not json"), null);
assert.strictEqual(parseUserMap("[]"), null);
assert.strictEqual(parseUserMap('{"123": 456}'), null);
assert.strictEqual(parseUserMap('{"123": "invalid-uuid"}'), null);
assert.strictEqual(parseUserMap('{"123": "ab"}'), null); // username too short
assert.strictEqual(parseUserMap('{"123": "has space"}'), null);
assert.deepStrictEqual(parseUserMap("{}"), {});

// markUrl
assert.strictEqual(markUrl("https://mc-heads.net/avatar/abc/128", "vcmcvh"), "https://mc-heads.net/avatar/abc/128?vcmcvh=1");
assert.strictEqual(markUrl("https://mc-heads.net/avatar/abc?size=128", "vcmcvh"), "https://mc-heads.net/avatar/abc?size=128&vcmcvh=1");
assert.strictEqual(markUrl("not a url", "vcmcvh"), "not a url");

console.log("parseUserMap.test.ts: OK");
