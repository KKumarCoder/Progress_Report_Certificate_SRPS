import { test } from "node:test";
import assert from "node:assert/strict";
import { validPassword } from "../../shared/password-policy.js";
test("password policy accepts exactly 6 through 20 characters", () => {
  for (const length of [6, 10, 20])
    assert.equal(validPassword("x".repeat(length)), true);
  for (const value of [
    "",
    "x".repeat(5),
    "x".repeat(21),
    null,
    undefined,
    123456,
    {},
  ])
    assert.equal(validPassword(value), false);
});
