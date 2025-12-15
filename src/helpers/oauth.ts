const LINKEDIN_STATE_KEY = "linkedin_oauth_state";

function generateRandomState(bytes = 16): string {
  const array = new Uint8Array(bytes);
  if (globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(array);
  } else {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

interface StoredState {
  value: string;
  createdAt: number;
}

function persistState(state: string) {
  try {
    const record: StoredState = { value: state, createdAt: Date.now() };
    sessionStorage.setItem(LINKEDIN_STATE_KEY, JSON.stringify(record));
  } catch (err) {
    console.warn("Unable to persist LinkedIn state", err);
  }
}

function readState(): StoredState | null {
  try {
    const raw = sessionStorage.getItem(LINKEDIN_STATE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredState;
    if (!parsed?.value) return null;
    return parsed;
  } catch {
    sessionStorage.removeItem(LINKEDIN_STATE_KEY);
    return null;
  }
}

export function clearLinkedInState() {
  try {
    sessionStorage.removeItem(LINKEDIN_STATE_KEY);
  } catch (err) {
    console.warn("Unable to clear LinkedIn state", err);
  }
}

export function prepareLinkedInLogin(baseUrl: string): string {
  const state = generateRandomState();
  persistState(state);
  let url: URL;
  try {
    url = new URL(baseUrl);
  } catch {
    const origin = globalThis.location?.origin ?? "https://findjob.nu";
    url = new URL(baseUrl, origin);
  }
  url.searchParams.set("state", state);
  return url.toString();
}

export function validateLinkedInResponse(stateFromQuery: string | null, ttlMs = 5 * 60 * 1000): boolean {
  const cached = readState();
  if (!cached?.value || !stateFromQuery || cached.value !== stateFromQuery) {
    return false;
  }
  if (Date.now() - cached.createdAt > ttlMs) {
    clearLinkedInState();
    return false;
  }
  clearLinkedInState();
  return true;
}
