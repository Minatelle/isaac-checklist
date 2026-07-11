export const ISAAC_APP_ID = 250900;
export const STEAM_ID_COOKIE = 'steam_id';
export const STEAM_ID_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

const STEAM_OPENID_LOGIN = 'https://steamcommunity.com/openid/login';
const STEAM_ID_REGEX = /^https?:\/\/steamcommunity\.com\/openid\/id\/(\d+)$/;

export function getPublicOrigin(request: Request): string {
  const realm = process.env['STEAM_REALM']?.replace(/\/$/, '');
  if (realm) {
    return realm;
  }

  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host');
  const proto = request.headers.get('x-forwarded-proto') ?? 'https';
  if (!host) {
    throw new Error('Unable to determine public origin');
  }

  return `${proto}://${host}`;
}

export function buildSteamLoginUrl(returnTo: string, realm: string): string {
  const params = new URLSearchParams({
    'openid.ns': 'http://specs.openid.net/auth/2.0',
    'openid.mode': 'checkid_setup',
    'openid.return_to': returnTo,
    'openid.realm': realm,
    'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
    'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select'
  });

  return `${STEAM_OPENID_LOGIN}?${params.toString()}`;
}

export function extractSteamId64(claimedId: string | null): string | null {
  if (!claimedId) {
    return null;
  }

  const match = STEAM_ID_REGEX.exec(claimedId.trim());
  return match?.[1] ?? null;
}

export function parseAchievementApiName(apiName: string): number | null {
  const trimmed = apiName.trim();
  if (/^\d+$/.test(trimmed)) {
    return Number(trimmed);
  }

  const prefixed = /^achievement[_\s-]?(\d+)$/i.exec(trimmed);
  return prefixed?.[1] != null ? Number(prefixed[1]) : null;
}

export async function validateSteamOpenId(params: URLSearchParams): Promise<boolean> {
  const body = new URLSearchParams(params);
  body.set('openid.mode', 'check_authentication');

  const response = await fetch(STEAM_OPENID_LOGIN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString()
  });

  if (!response.ok) {
    return false;
  }

  const text = await response.text();
  return text.includes('is_valid:true');
}

export function readSteamIdCookie(request: Request): string | null {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) {
    return null;
  }

  for (const part of cookieHeader.split(';')) {
    const [rawName, ...rest] = part.trim().split('=');
    if (rawName === STEAM_ID_COOKIE) {
      const value = rest.join('=').trim();
      return /^\d+$/.test(value) ? value : null;
    }
  }

  return null;
}

export function buildSteamIdCookie(steamId64: string): string {
  const parts = [
    `${STEAM_ID_COOKIE}=${steamId64}`,
    'Path=/',
    'HttpOnly',
    'Secure',
    'SameSite=Lax',
    `Max-Age=${STEAM_ID_COOKIE_MAX_AGE}`
  ];
  return parts.join('; ');
}

export function clearSteamIdCookie(): string {
  return [
    `${STEAM_ID_COOKIE}=`,
    'Path=/',
    'HttpOnly',
    'Secure',
    'SameSite=Lax',
    'Max-Age=0'
  ].join('; ');
}

interface SteamAchievement {
  apiname: string;
  achieved: number;
}

interface SteamPlayerAchievementsResponse {
  playerstats?: {
    success?: boolean;
    error?: string;
    achievements?: SteamAchievement[];
  };
}

export async function fetchUnlockedSteamIds(steamId64: string, apiKey: string): Promise<{
  unlockedSteamIds: number[];
  privateProfile: boolean;
}> {
  const url = new URL('https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v1/');
  url.searchParams.set('key', apiKey);
  url.searchParams.set('steamid', steamId64);
  url.searchParams.set('appid', String(ISAAC_APP_ID));

  const response = await fetch(url);
  const payload = (await response.json()) as SteamPlayerAchievementsResponse;
  const playerstats = payload.playerstats;

  if (!response.ok || playerstats?.success === false) {
    const errorText = (playerstats?.error ?? '').toLowerCase();
    const privateProfile =
      response.status === 403 ||
      errorText.includes('not public') ||
      errorText.includes('private') ||
      errorText.includes('profile');

    return { unlockedSteamIds: [], privateProfile };
  }

  const unlockedSteamIds = [
    ...new Set(
      (playerstats?.achievements ?? [])
        .filter(achievement => achievement.achieved === 1)
        .map(achievement => parseAchievementApiName(achievement.apiname))
        .filter((id): id is number => id != null && id > 0)
    )
  ].sort((a, b) => a - b);

  return { unlockedSteamIds, privateProfile: false };
}

export function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}
