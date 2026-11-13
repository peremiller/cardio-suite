import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { preserveDemoHandoff } from "../src/demo-handoff.mjs";

function storageWith(existing = {}) {
  const records = new Map(Object.entries(existing));
  return {
    records,
    setItem(key, value) { records.set(key, value); },
    getItem(key) { return records.get(key) ?? null; },
  };
}

test("saving a demo handoff retains all existing unrelated drafts and account data", () => {
  const storage = storageWith({
    "cardiosuite.accounts.v1": "original accounts",
    "cardiosuite.draft.mary": "other sample draft",
    "cardiosuite.draft.john": "original draft",
  });
  const values = { systolic: "120", history: "example history", notes: "new demo note" };
  assert.equal(preserveDemoHandoff(storage, "cardiosuite.draft.john", values), true);
  assert.deepEqual(JSON.parse(storage.getItem("cardiosuite.draft.john")), values);
  assert.equal(storage.getItem("cardiosuite.accounts.v1"), "original accounts");
  assert.equal(storage.getItem("cardiosuite.draft.mary"), "other sample draft");
});

test("storage refusal cannot be treated as a completed handoff", () => {
  const saved = "original unsaved backup";
  const storage = { setItem() { throw new Error("QuotaExceededError"); }, getItem() { return saved; } };
  assert.throws(() => preserveDemoHandoff(storage, "cardiosuite.draft.john", {}), /QuotaExceededError/);
  assert.equal(storage.getItem(), saved);
});

test("invalid payloads never modify browser storage", () => {
  const storage = storageWith({ "cardiosuite.draft.john": "untouched" });
  assert.throws(() => preserveDemoHandoff(storage, "cardiosuite.draft.john", null));
  assert.throws(() => preserveDemoHandoff(storage, "cardiosuite.draft.john", []));
  assert.equal(storage.getItem("cardiosuite.draft.john"), "untouched");
});

test("UI does not claim a clinician received a local-only handoff", () => {
  const app = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
  assert.match(app, /preserveDemoHandoff\(localStorage, draftKey, values\)/);
  assert.match(app, /No physician notification was sent/);
  assert.doesNotMatch(app, /physician alerted immediately|Handoff sent to Dr\.|Physician notification delivered\.|has been notified that/);
  assert.doesNotMatch(app, /localStorage\.removeItem\(draftKey\);\s*notify\(redFlag/);
});
