export async function hashString(str: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function getTodayISO(): string {
  return new Date().toISOString().split('T')[0];
}

export function formatDate(d: Date): string {
  return d.toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}

export function getDayNumber(startDate: string, targetDate?: string): number {
  const start  = new Date(startDate);
  const target = targetDate ? new Date(targetDate) : new Date();
  return Math.floor((target.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

export function isLoggedIn(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem('loggedIn') === 'true';
}

export function setLoggedIn(): void {
  sessionStorage.setItem('loggedIn', 'true');
}

export function logout(): void {
  sessionStorage.removeItem('loggedIn');
}

// ─── Settings — local cache ───────────────────────────────────────────────────
const DEFAULTS = { startDate: '2026-04-13', goalWeight: '75', startWeight: '120' };

/** Reads from localStorage immediately (no async, no flicker). */
export function loadSettings() {
  if (typeof window === 'undefined') return DEFAULTS;
  return {
    startDate:   localStorage.getItem('setting_start_date')   || DEFAULTS.startDate,
    goalWeight:  localStorage.getItem('setting_goal_weight')  || DEFAULTS.goalWeight,
    startWeight: localStorage.getItem('setting_start_weight') || DEFAULTS.startWeight,
  };
}

function applySettingsToLocalStorage(s: { startDate: string; goalWeight: string; startWeight: string }) {
  localStorage.setItem('setting_start_date',   s.startDate);
  localStorage.setItem('setting_goal_weight',  s.goalWeight);
  localStorage.setItem('setting_start_weight', s.startWeight);
}

// ─── Settings — cloud (Google Sheets via Apps Script) ────────────────────────

const SETTINGS_URL_KEY = '__settings_script_url__';

/** Call once at app start after the Script URL is known (from config). */
export function initSettingsUrl(url: string) {
  if (typeof window !== 'undefined' && url) {
    sessionStorage.setItem(SETTINGS_URL_KEY, url);
  }
}

function getSettingsUrl(): string {
  if (typeof window === 'undefined') return '';
  return sessionStorage.getItem(SETTINGS_URL_KEY) || '';
}

/**
 * Fetches settings from Google Sheets and saves them to localStorage.
 * Returns the settings object (or local fallback on error).
 */
export async function loadSettingsFromCloud(): Promise<{ startDate: string; goalWeight: string; startWeight: string }> {
  const url = getSettingsUrl();
  if (!url) return loadSettings();
  try {
    const res = await fetch(url + '?action=getSettings', { redirect: 'follow' });
    if (!res.ok) throw new Error('bad status');
    const json = await res.json();
    if (json.ok && json.data) {
      const s = {
        startDate:   String(json.data.start_date   || DEFAULTS.startDate),
        goalWeight:  String(json.data.goal_weight  || DEFAULTS.goalWeight),
        startWeight: String(json.data.start_weight || DEFAULTS.startWeight),
      };
      applySettingsToLocalStorage(s);
      return s;
    }
  } catch { /* fall through to local */ }
  return loadSettings();
}

/**
 * Saves settings to Google Sheets AND localStorage.
 * Fire-and-forget — won't throw.
 */
export async function saveSettingsToCloud(s: { startDate: string; goalWeight: string; startWeight: string }) {
  applySettingsToLocalStorage(s);
  const url = getSettingsUrl();
  if (!url) return;
  try {
    await fetch(url, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        action:       'saveSettings',
        start_date:   s.startDate,
        goal_weight:  s.goalWeight,
        start_weight: s.startWeight,
      }),
    });
  } catch { /* ignore — already saved locally */ }
}
