export function getSupabaseApiHeaders(key: string): Record<string, string> {
  const headers: Record<string, string> = { apikey: key };

  // מפתחות sb_* חדשים — רק apikey, בלי Authorization Bearer
  if (!key.startsWith("sb_")) {
    headers.Authorization = `Bearer ${key}`;
  }

  return headers;
}
