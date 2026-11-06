/**
 * Anti-CSRF (rancangan §15): request mutasi dari browser selalu membawa `Origin`; tolak bila beda dengan APP_URL.
 * shortcut: `Origin` kosong (klien non-browser seperti curl/Playwright API) diizinkan, karena serangan CSRF
 * lintas situs dari browser pasti membawa header ini; ketatkan bila ada klien non-browser yang tidak dipercaya.
 */
export function originValid(origin: string | null, appUrl: string): boolean {
  if (!origin) return true;
  try {
    return new URL(origin).origin === new URL(appUrl).origin;
  } catch {
    return false;
  }
}
