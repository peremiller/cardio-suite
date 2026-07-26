const ACCOUNTS_KEY = "cardiosuite.accounts.v1";
const SESSION_KEY = "cardiosuite.session.v1";

export const roleLabels = {
  "medical-assistant": "Medical Assistant / Nurse",
  cardiologist: "Cardiologist",
  receptionist: "Receptionist",
  "clinic-admin": "Clinic Administrator",
};

async function hashPassword(password) {
  return bytesToHex(sha256(new TextEncoder().encode(password)));
}

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

export function listAccounts() {
  return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || "[]");
}

export async function authenticate(email, password) {
  const accounts = listAccounts();
  const account = accounts.find(
    (candidate) => candidate.email === normalizeEmail(email),
  );
  if (!account) throw new Error("We could not find that staff account.");

  const passwordHash = await hashPassword(password);
  if (passwordHash !== account.passwordHash) {
    throw new Error("The password is incorrect.");
  }

  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({ accountId: account.id, signedInAt: new Date().toISOString() }),
  );
  return account;
}

export async function createAccount({ name, email, password, role }) {
  const accounts = listAccounts();
  const normalizedEmail = normalizeEmail(email);
  if (accounts.some((account) => account.email === normalizedEmail)) {
    throw new Error("An account with that email already exists.");
  }

  const words = name.trim().split(/\s+/);
  const initials = words
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
  const titleByRole = {
    "medical-assistant": "Cardiology Clinic Assistant",
    cardiologist: "Cardiologist",
    receptionist: "Patient Services Coordinator",
    "clinic-admin": "Clinic Administrator",
  };
  const account = {
    id: crypto.randomUUID(),
    name: name.trim(),
    email: normalizedEmail,
    role,
    title: titleByRole[role],
    initials,
    color: "#0a89a8",
    passwordHash: await hashPassword(password),
  };

  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify([...accounts, account]));
  return account;
}

export async function restoreSession() {
  const session = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
  if (!session?.accountId) return null;
  return listAccounts().find((account) => account.id === session.accountId) || null;
}

export function signOut() {
  localStorage.removeItem(SESSION_KEY);
}

export function startSession(account) {
  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({ accountId: account.id, signedInAt: new Date().toISOString() }),
  );
}
import { sha256 } from "@noble/hashes/sha2.js";
import { bytesToHex } from "@noble/hashes/utils.js";
