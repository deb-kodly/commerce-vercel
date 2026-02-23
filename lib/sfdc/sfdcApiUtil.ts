import { NextRequest } from 'next/server';
import { getEffAccountIdFromCookie, getIsGuestUserFromCookie, getPortalUserIdFromCookie, getUserLocaleFromCookie } from 'app/api/auth/cookieUtils';
import { buildCcrzContext, getServiceUserToken } from 'app/api/auth/authUtil';

export enum HttpMethod {
  GET = 'GET',
  PUT = 'PUT',
  POST = 'POST',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
}

/**
 * Central API utility for CloudCraze REST calls.
 *
 * Every request is authenticated with the service user's Bearer token.
 * The portal user context (userId + accountId) is passed via the ccrz-context header,
 * which CloudCraze uses to scope catalog, pricing, and cart to the correct user/account.
 */
export async function makeSfdcApiCall(
  endpoint: string,
  httpMethod: HttpMethod,
  body?: object,
  req?: NextRequest
): Promise<Response> {
  try {
    const isGuestUserHeader = req?.headers.get('x-guest-user') ?? null;
    const isGuestUser: boolean =
      isGuestUserHeader !== null
        ? (JSON.parse(isGuestUserHeader) as boolean)
        : ((await getIsGuestUserFromCookie()) ?? true);

    const headers = await buildHeaders(isGuestUser, req);

    const fetchOptions: RequestInit = {
      method: httpMethod,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    };

    const response = await fetch(endpoint, fetchOptions);
    if (!response.ok) {
      const errBody = await response.clone().text();
      console.error('CloudCraze API error:', response.status, endpoint, errBody.substring(0, 500));
    }
    return response;
  } catch (error) {
    console.error('CloudCraze fetch error:', error);
    throw error;
  }
}

async function buildHeaders(
  isGuestUser: boolean,
  req?: NextRequest
): Promise<Record<string, string>> {
  const serviceToken = await getServiceUserToken();

  let portalUserId = '';
  let effAccountId = '';
  let userLocale = '';

  if (!isGuestUser) {
    portalUserId =
      req?.headers.get('x-portal-user-id') ?? (await getPortalUserIdFromCookie()) ?? '';
    effAccountId =
      req?.headers.get('x-eff-account-id') ?? (await getEffAccountIdFromCookie()) ?? '';
    userLocale = (await getUserLocaleFromCookie()) ?? '';
  }

  const ccrzContext = buildCcrzContext(portalUserId, effAccountId, userLocale);
  console.log('[buildHeaders] ccrz-context (decoded):', Buffer.from(ccrzContext, 'base64').toString('utf8'));

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${serviceToken}`,
    'ccrz-context': ccrzContext,
  };
}
