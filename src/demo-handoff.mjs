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
