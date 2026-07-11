import {
  buildSteamIdCookie,
  extractSteamId64,
  getPublicOrigin,
  validateSteamOpenId
} from '../_lib/steam.js';

export async function GET(request: Request): Promise<Response> {
  try {
    const origin = getPublicOrigin(request);
    const url = new URL(request.url);
    const params = url.searchParams;

    if (params.get('openid.mode') === 'error') {
      return Response.redirect(`${origin}/?steam=error`, 302);
    }

    const claimedId = params.get('openid.claimed_id');
    const steamId64 = extractSteamId64(claimedId);
    if (!steamId64) {
      return Response.redirect(`${origin}/?steam=error`, 302);
    }

    const isValid = await validateSteamOpenId(params);
    if (!isValid) {
      return Response.redirect(`${origin}/?steam=error`, 302);
    }

    const headers = new Headers();
    headers.set('Set-Cookie', buildSteamIdCookie(steamId64));
    headers.set('Location', `${origin}/?steam=connected`);

    return new Response(null, { status: 302, headers });
  } catch {
    return new Response('Steam callback failed', { status: 500 });
  }
}
