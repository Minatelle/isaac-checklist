import { buildSteamLoginUrl, getPublicOrigin } from '../_lib/steam';

export function GET(request: Request): Response {
  try {
    const origin = getPublicOrigin(request);
    const returnTo = `${origin}/api/steam/callback`;
    const loginUrl = buildSteamLoginUrl(returnTo, origin);
    return Response.redirect(loginUrl, 302);
  } catch {
    return new Response('Steam login is misconfigured', { status: 500 });
  }
}
