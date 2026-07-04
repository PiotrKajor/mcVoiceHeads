/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 kajorpiotr
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import assert from "node:assert";

import { markUrl, normalizeUuid, parseUserMap } from "./parseUserMap";

assert.strictEqual(normalizeUuid("069a79f4-44e9-4726-a5be-fca90e38aaf5"), "069a79f444e94726a5befca90e38aaf5");
assert.strictEqual(normalizeUuid("069A79F444E94726A5BEFCA90E38AAF5"), "069a79f444e94726a5befca90e38aaf5");
assert.strictEqual(normalizeUuid("not-a-uuid"), null);
assert.strictEqual(normalizeUuid("069a79f4"), null);

assert.deepStrictEqual(
    parseUserMap('{"123":"069a79f4-44e9-4726-a5be-fca90e38aaf5"}'),
    { "123": "069a79f444e94726a5befca90e38aaf5" },
);
assert.strictEqual(parseUserMap("not json"), null);
assert.strictEqual(parseUserMap("[]"), null);
assert.strictEqual(parseUserMap('{"123": 456}'), null);
assert.strictEqual(parseUserMap('{"123": "invalid-uuid"}'), null);
assert.deepStrictEqual(parseUserMap("{}"), {});

assert.strictEqual(markUrl("https://mc-heads.net/avatar/abc/128", "vcmcvh"), "https://mc-heads.net/avatar/abc/128?vcmcvh=1");
assert.strictEqual(markUrl("https://mc-heads.net/avatar/abc?size=128", "vcmcvh"), "https://mc-heads.net/avatar/abc?size=128&vcmcvh=1");
assert.strictEqual(markUrl("not a url", "vcmcvh"), "not a url");

console.log("parseUserMap.test.ts: OK");
