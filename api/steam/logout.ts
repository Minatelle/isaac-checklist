import { clearSteamIdCookie, jsonResponse } from '../_lib/steam';

export function POST(): Response {
  const headers = new Headers();
  headers.set('Set-Cookie', clearSteamIdCookie());
  headers.set('Content-Type', 'application/json');

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
}

export function GET(): Response {
  return jsonResponse(405, {
    error: 'method_not_allowed',
    message: 'Use POST to log out.'
  });
}
