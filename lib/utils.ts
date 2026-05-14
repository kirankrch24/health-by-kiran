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
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function getDayNumber(startDate: string, targetDate?: string): number {
  const start = new Date(startDate);
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
