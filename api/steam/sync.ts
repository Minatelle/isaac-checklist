import {
  fetchUnlockedSteamIds,
  jsonResponse,
  readSteamIdCookie
} from '../_lib/steam';

export async function GET(request: Request): Promise<Response> {
  const steamId = readSteamIdCookie(request);
  if (!steamId) {
    return jsonResponse(401, {
      error: 'not_connected',
      message: 'Connect your Steam account first.'
    });
  }

  const apiKey = process.env['STEAM_WEB_API_KEY'];
  if (!apiKey) {
    return jsonResponse(500, {
      error: 'missing_api_key',
      message: 'Steam Web API key is not configured.'
    });
  }

  try {
    const { unlockedSteamIds, privateProfile } = await fetchUnlockedSteamIds(steamId, apiKey);

    if (privateProfile) {
      return jsonResponse(403, {
        error: 'private_profile',
        message:
          'Your Steam game details are private. Set Game details to Public, then try again.'
      });
    }

    return jsonResponse(200, { steamId, unlockedSteamIds });
  } catch {
    return jsonResponse(502, {
      error: 'steam_unavailable',
      message: 'Could not reach the Steam API. Try again later.'
    });
  }
}
