import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { preserveDemoHandoff, readDemoDraft } from "../src/demo-handoff.mjs";

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

test("valid existing demo drafts are restored unchanged and do not mutate other records", () => {
  const values = { systolic: "120", diastolic: "80", heartRate: "72", spo2: "98", weight: "175", height: "68", medications: "", history: "sample", notes: "" };
  const original = JSON.stringify(values);
  const storage = storageWith({ "cardiosuite.draft.john": original, "cardiosuite.accounts.v1": "account data" });
  assert.deepEqual(readDemoDraft(storage, "cardiosuite.draft.john"), { values, unreadable: false });
  assert.equal(storage.getItem("cardiosuite.draft.john"), original);
  assert.equal(storage.getItem("cardiosuite.accounts.v1"), "account data");
  assert.deepEqual(readDemoDraft(storage, "cardiosuite.draft.anna"), { values: null, unreadable: false });
});

test("invalid, partial and malformed drafts remain untouched and are reported unreadable", () => {
  for (const raw of ["{broken JSON", "null", "[]", '{"history":""}', '"text"']) {
    const storage = storageWith({ "cardiosuite.draft.john": raw, "cardiosuite.session.v1": "unchanged" });
    assert.deepEqual(readDemoDraft(storage, "cardiosuite.draft.john"), { values: null, unreadable: true });
    assert.equal(storage.getItem("cardiosuite.draft.john"), raw);
    assert.equal(storage.getItem("cardiosuite.session.v1"), "unchanged");
  }
});

test("sample arrival filters are interactive and never claim live queue freshness", () => {
  const app = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
  assert.match(app, /const \[statusFilter, setStatusFilter\] = useState\("all"\)/);
  assert.match(app, /onClick=\{\(\) => setStatusFilter\(id\)\}/);
  assert.match(app, /aria-pressed=\{statusFilter === id\}/);
  assert.match(app, /aria-label="Search sample arrivals"/);
  assert.match(app, /visible\.length === 0.*role="status"/);
  assert.match(app, /Sample arrivals · not live/);
  assert.doesNotMatch(app, /Updated 09:24 AM/);
});

test("storage read errors do not silently reset a draft", () => {
  const storage = { getItem() { throw new Error("SecurityError"); } };
  assert.deepEqual(readDemoDraft(storage, "cardiosuite.draft.john"), { values: null, unreadable: true });
});

test("unreadable demo draft prevents save, clear and handoff through visible, disabled controls", () => {
  const app = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
  assert.ok(app.includes("readDemoDraft(localStorage, draftKey)"));
  assert.ok(app.includes("setUnreadableDraft(unreadable)"));
  assert.ok(app.includes('unreadableDraft && <div className="form-error" role="alert">'));
  assert.ok(app.includes("onClick={sendHandoff} disabled={unreadableDraft}"));
  assert.ok(app.includes("onClick={saveDraft} disabled={unreadableDraft}"));
  assert.ok(app.includes("onClick={clearForm} disabled={unreadableDraft}"));
});
