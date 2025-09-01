export function getApiBaseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_API_URL;
  if (explicit) return explicit;

  if (typeof window !== 'undefined') {
    // If we're running the Next dev server on :3000, talk to API :4000
    if (location.port === '3000') return 'http://localhost:4000';
    // Otherwise assume NGINX proxy at /api
    return '/api';
  }
  // Server-side fallback to local API
  return 'http://localhost:4000';
}
