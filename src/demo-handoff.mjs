/**
 * Persist an intake handoff as a browser-local demo draft.
 * This does not send a clinical notification or authorize real patient data.
 * Fail before confirming completion if browser storage is unavailable.
 */
export function preserveDemoHandoff(storage, key, values) {
  if (!storage || typeof storage.setItem !== "function" || !key || !values || typeof values !== "object" || Array.isArray(values)) {
    throw new Error("The demo intake could not be saved.");
  }
  storage.setItem(key, JSON.stringify(values));
  return true;
}

/**
 * Read existing browser-local demo drafts without mutating or deleting them.
 * An unreadable record must be kept for recovery instead of overwritten.
 */
export function readDemoDraft(storage, key) {
  try {
    if (!storage || typeof storage.getItem !== "function" || !key) {
      return { values: null, unreadable: true };
    }
    const raw = storage.getItem(key);
    if (raw === null) return { values: null, unreadable: false };
    const values = JSON.parse(raw);
    const expected = ["systolic", "diastolic", "heartRate", "spo2", "weight", "height", "medications", "history", "notes"];
    if (!values || typeof values !== "object" || Array.isArray(values) || !expected.every((field) => typeof values[field] === "string")) {
      return { values: null, unreadable: true };
    }
    return { values, unreadable: false };
  } catch {
    return { values: null, unreadable: true };
  }
}
