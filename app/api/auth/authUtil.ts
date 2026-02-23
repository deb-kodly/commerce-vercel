import {
  SALESFORCE_CONSUMER_KEY,
  SALESFORCE_CONSUMER_SECRET,
  SFDC_CLOUDCRAZE_STOREFRONT,
  SFDC_OAUTH_TOKEN_URL,
  SFDC_SOAP_LOGIN_URL,
  SFDC_SERVICE_USER_PASSWORD,
  SFDC_SERVICE_USER_USERNAME,
  SFDC_ORG_ID,
  SFDC_COMMERCE_API_VERSION,
} from 'lib/constants';

// ---------------------------------------------------------------------------
// Service User Token Cache (server-side, module-level)
// ---------------------------------------------------------------------------

interface CachedToken {
  access_token: string;
  instance_url: string;
  expires_at: number;
}

let _serviceTokenCache: CachedToken | null = null;
const TOKEN_EXPIRY_BUFFER_MS = 5 * 60 * 1000; // refresh 5 min before expiry

/**
 * Returns a valid Bearer access token for the CloudCraze integration service user.
 * Fetches a new token via OAuth Username-Password flow when the cached one expires.
 */
export async function getServiceUserToken(): Promise<string> {
  const now = Date.now();
  if (_serviceTokenCache && now < _serviceTokenCache.expires_at - TOKEN_EXPIRY_BUFFER_MS) {
    return _serviceTokenCache.access_token;
  }

  const params = new URLSearchParams({
    grant_type: 'password',
    client_id: SALESFORCE_CONSUMER_KEY!,
    client_secret: SALESFORCE_CONSUMER_SECRET!,
    username: SFDC_SERVICE_USER_USERNAME!,
    password: SFDC_SERVICE_USER_PASSWORD!,
  });

  const response = await fetch(SFDC_OAUTH_TOKEN_URL!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Service user OAuth failed: ${err}`);
  }

  const data = await response.json();
  // Salesforce access tokens are valid for 2 hours by default
  _serviceTokenCache = {
    access_token: data.access_token,
    instance_url: data.instance_url,
    expires_at: now + 2 * 60 * 60 * 1000,
  };
  return data.access_token;
}

// ---------------------------------------------------------------------------
// Portal User Login
// ---------------------------------------------------------------------------

export interface PortalUserInfo {
  userId: string;
  accountId: string;
  userLocale: string;
  userName: string;
}

function xmlEscape(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Authenticates a portal user via the SOAP Partner API login call at
 * test.salesforce.com (sandbox) or login.salesforce.com (production).
 * Does NOT require "Username-Password Flow" on the Connected App.
 *
 * On success the XML response contains <userId> which confirms valid credentials.
 * accountId lookup will be added later.
 */
export async function loginPortalUser(
  username: string,
  password: string
): Promise<PortalUserInfo | null> {
  const soapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
<env:Envelope xmlns:xsd="http://www.w3.org/2001/XMLSchema"
              xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
              xmlns:env="http://schemas.xmlsoap.org/soap/envelope/">
  <env:Header>
    <n1:LoginScopeHeader xmlns:n1="urn:partner.soap.sforce.com">
      <n1:organizationId>${xmlEscape(SFDC_ORG_ID!)}</n1:organizationId>
    </n1:LoginScopeHeader>
  </env:Header>
  <env:Body>
    <n1:login xmlns:n1="urn:partner.soap.sforce.com">
      <n1:username>${xmlEscape(username)}</n1:username>
      <n1:password>${xmlEscape(password)}</n1:password>
    </n1:login>
  </env:Body>
</env:Envelope>`;

  console.log('[loginPortalUser] SOAP URL:', SFDC_SOAP_LOGIN_URL);
  const soapResp = await fetch(SFDC_SOAP_LOGIN_URL!, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/xml; charset=utf-8',
      'SOAPAction': 'login',
    },
    body: soapEnvelope,
  });

  const soapText = await soapResp.text();
  console.log('[loginPortalUser] SOAP status:', soapResp.status, 'body:', soapText.substring(0, 500));

  if (!soapResp.ok) {
    const faultMatch = soapText.match(/<faultcode>([^<]+)<\/faultcode>/);
    const faultMsg = soapText.match(/<faultstring>([^<]+)<\/faultstring>/);
    console.error('[loginPortalUser] SOAP fault:', faultMatch?.[1], '-', faultMsg?.[1]);
    return null;
  }

  const userIdMatch = soapText.match(/<userId>([^<]+)<\/userId>/);
  if (!userIdMatch) {
    console.error('[loginPortalUser] No <userId> in SOAP response');
    return null;
  }
  const userId = userIdMatch[1]!;
  console.log('[loginPortalUser] SOAP login succeeded. userId:', userId);

  const { accountId, userLocale, userName } = await fetchUserAccountId(userId);
  return { userId, accountId, userLocale, userName };
}

/**
 * Queries the Salesforce REST API (as the service user) to retrieve the AccountId
 * and LocaleSidKey associated with the given portal User ID.
 */
async function fetchUserAccountId(userId: string): Promise<{ accountId: string; userLocale: string; userName: string }> {
  try {
    const serviceToken = await getServiceUserToken();
    // instance_url is populated by getServiceUserToken() into _serviceTokenCache
    const instanceUrl = _serviceTokenCache!.instance_url;
    const query = encodeURIComponent(`SELECT AccountId, LocaleSidKey, Name FROM User WHERE Id = '${userId}'`);
    const url = `${instanceUrl}/services/data/${SFDC_COMMERCE_API_VERSION}/query?q=${query}`;

    const resp = await fetch(url, {
      headers: {
        Authorization: `Bearer ${serviceToken}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await resp.json();
    if (!resp.ok) {
      console.error('[fetchUserAccountId] Query failed:', resp.status, data);
      return { accountId: '', userLocale: '', userName: '' };
    }

    const record = data.records?.[0];
    const accountId: string = record?.AccountId ?? '';
    const userLocale: string = record?.LocaleSidKey ?? '';
    const userName: string = record?.Name ?? '';
    console.log('[loginPortalUser] accountId:', accountId, 'userLocale:', userLocale, 'userName:', userName);
    return { accountId, userLocale, userName };
  } catch (err) {
    console.error('[fetchUserAccountId] Error:', err);
    return { accountId: '', userLocale: '', userName: '' };
  }
}

// ---------------------------------------------------------------------------
// ccrz-context builder
// ---------------------------------------------------------------------------

/**
 * Builds the Base64-encoded ccrz-context header value.
 * Pass portalUserId / effAccountId for authenticated users; omit (or leave empty) for guests.
 */
export function buildCcrzContext(portalUserId = '', effAccountId = '', userLocale = ''): string {
  const ctx = {
    storefront: SFDC_CLOUDCRAZE_STOREFRONT ?? '',
    portalUserId,
    effAccountId,
    userLocale,
    queryParams: {},
    currentCartId: '',
  };
  return Buffer.from(JSON.stringify(ctx)).toString('base64');
}
