// Run with: node --experimental-strip-types tests/parseUserMap.test.ts
// SPDX-License-Identifier: AGPL-3.0-only

import assert from "node:assert";

import { isMinecraftName, normalizeUuid, parseUserMap, resolveMcId } from "../src/utils/parseUserMap.ts";

assert.strictEqual(normalizeUuid("069a79f4-44e9-4726-a5be-fca90e38aaf5"), "069a79f444e94726a5befca90e38aaf5");
assert.strictEqual(normalizeUuid("069A79F444E94726A5BEFCA90E38AAF5"), "069a79f444e94726a5befca90e38aaf5");
assert.strictEqual(normalizeUuid("not-a-uuid"), null);
assert.strictEqual(normalizeUuid("069a79f4"), null);

assert.strictEqual(isMinecraftName("Notch"), true);
assert.strictEqual(isMinecraftName("a_b"), true);
assert.strictEqual(isMinecraftName("ab"), false);
assert.strictEqual(isMinecraftName("ThisNameIsWayTooLong"), false);
assert.strictEqual(isMinecraftName("bad-name"), false);

assert.strictEqual(resolveMcId("069a79f4-44e9-4726-a5be-fca90e38aaf5"), "069a79f444e94726a5befca90e38aaf5");
assert.strictEqual(resolveMcId("Notch"), "Notch");
assert.strictEqual(resolveMcId("abcdef"), "abcdef"); // short hex string is a valid username, not a UUID
assert.strictEqual(resolveMcId("bad name"), null);

assert.deepStrictEqual(parseUserMap('{"123":"069a79f4-44e9-4726-a5be-fca90e38aaf5"}'), {
  "123": "069a79f444e94726a5befca90e38aaf5",
});
assert.deepStrictEqual(parseUserMap('{"123":"Notch"}'), { "123": "Notch" });
assert.strictEqual(parseUserMap("not json"), null);
assert.strictEqual(parseUserMap("[]"), null);
assert.strictEqual(parseUserMap('{"123": 456}'), null);
assert.strictEqual(parseUserMap('{"123": "bad name"}'), null);
assert.deepStrictEqual(parseUserMap("{}"), {});

console.log("parseUserMap.test.ts: OK");
