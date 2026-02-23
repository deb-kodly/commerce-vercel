export type SortFilterItem = {
  title: string;
  slug: string | null;
  sortKey: 'RELEVANCE' | 'BEST_SELLING' | 'CREATED_AT' | 'PRICE';
  reverse: boolean;
};

export const defaultSort: SortFilterItem = {
  title: 'Relevance',
  slug: null,
  sortKey: 'RELEVANCE',
  reverse: false
};

export const sorting: SortFilterItem[] = [
  defaultSort,
  { title: 'Trending', slug: 'trending-desc', sortKey: 'BEST_SELLING', reverse: false },
  { title: 'Latest arrivals', slug: 'latest-desc', sortKey: 'CREATED_AT', reverse: true },
  { title: 'Price: Low to high', slug: 'price-asc', sortKey: 'PRICE', reverse: false },
  { title: 'Price: High to low', slug: 'price-desc', sortKey: 'PRICE', reverse: true }
];

export const TAGS = {
  collections: 'collections',
  products: 'products',
  cart: 'cart'
};

export const HIDDEN_PRODUCT_TAG = 'nextjs-frontend-hidden';
export const DEFAULT_OPTION = 'Default Title';

/**
 * Env Variables
 */

// Community Portal Base URL (e.g. https://shopdev.alliapetcare.com/AffinityPetcare)
export const SFDC_COMMERCE_WEBSTORE_SITE_URL = process.env.SFDC_COMMERCE_WEBSTORE_SITE_URL;

// Salesforce API version (e.g. v64.0) — used for REST data queries
export const SFDC_COMMERCE_API_VERSION = process.env.SFDC_COMMERCE_API_VERSION;

// Connected App Consumer Key (Client Id)
export const SALESFORCE_CONSUMER_KEY = process.env.SALESFORCE_CONSUMER_KEY;

// Connected App Consumer Secret (Client Secret)
export const SALESFORCE_CONSUMER_SECRET = process.env.SALESFORCE_CONSUMER_SECRET;

// CloudCraze Integration Service User credentials
export const SFDC_SERVICE_USER_USERNAME = process.env.SFDC_SERVICE_USER_USERNAME;
export const SFDC_SERVICE_USER_PASSWORD = process.env.SFDC_SERVICE_USER_PASSWORD;

// CloudCraze Storefront name (used in ccrz-context)
export const SFDC_CLOUDCRAZE_STOREFRONT = process.env.SFDC_CLOUDCRAZE_STOREFRONT;

/**
 * Cookie Names
 */

export const IS_GUEST_USER_COOKIE_NAME = 'isGuestUser';
export const SFDC_PORTAL_USER_ID_COOKIE_NAME = 'ccrzPortalUserId';
export const SFDC_EFF_ACCOUNT_ID_COOKIE_NAME = 'ccrzEffAccountId';
export const CART_ID_COOKIE_NAME = 'cartId';
export const SFDC_USER_LOCALE_COOKIE_NAME = 'ccrzUserLocale';
export const SFDC_USER_NAME_COOKIE_NAME = 'ccrzUserName';
export const GUEST_COOKIE_AGE = 365 * 24 * 60 * 60; /* one year */

/**
 * URLs
 */

// OAuth token endpoint for internal service user — must be the Salesforce org domain
// (e.g. https://orgname.sandbox.my.salesforce.com)
export const SFDC_OAUTH_BASE_URL = process.env.SFDC_OAUTH_BASE_URL;
export const SFDC_OAUTH_TOKEN_URL = SFDC_OAUTH_BASE_URL
  ? SFDC_OAUTH_BASE_URL + '/services/oauth2/token'
  : SFDC_COMMERCE_WEBSTORE_SITE_URL
    ? new URL(SFDC_COMMERCE_WEBSTORE_SITE_URL).origin + '/services/oauth2/token'
    : undefined;

// OAuth token endpoint for portal/community users — must be the Experience Cloud site URL
// Requires "Username-Password Flow" enabled on the Connected App in Salesforce Setup
export const SFDC_PORTAL_OAUTH_TOKEN_URL = SFDC_COMMERCE_WEBSTORE_SITE_URL
  ? SFDC_COMMERCE_WEBSTORE_SITE_URL + '/services/oauth2/token'
  : undefined;

// LWR Apex Execute endpoint — used for LoginFormController.loginGetPageRefUrl credential verification.
// Does NOT require "Username-Password Flow" on the Connected App.
export const SFDC_WEBRUNTIME_APEX_EXECUTE_URL = SFDC_COMMERCE_WEBSTORE_SITE_URL
  ? `${SFDC_COMMERCE_WEBSTORE_SITE_URL}/webruntime/api/apex/execute`
  : undefined;

// SOAP Partner API login URL — uses test.salesforce.com for sandbox orgs.
// Requires the portal user profile to have "API Enabled" permission.
export const SFDC_SOAP_LOGIN_URL = SFDC_COMMERCE_API_VERSION
  ? `https://test.salesforce.com/services/Soap/u/${SFDC_COMMERCE_API_VERSION.replace(/^v/, '')}`
  : undefined;

// Salesforce org ID — used in SOAP LoginScopeHeader for community user authentication.
// Find at: Salesforce Setup → Company Information → Organization ID
export const SFDC_ORG_ID = process.env.SFDC_ORG_ID;

// Experience Cloud Network ID — used as portalId in SOAP LoginScopeHeader.
// Query as service user: SELECT Id FROM Network WHERE UrlPathPrefix = 'AffinityPetcare'
export const SFDC_COMMUNITY_ID = process.env.SFDC_COMMUNITY_ID;

// OAuth redirect URI — must match a Callback URL registered in the Connected App.
// For the headless PKCE flow the code is returned in the JSON response body; this
// value is only validated (not actually redirected to).
export const SFDC_OAUTH_REDIRECT_URI = process.env.SFDC_OAUTH_REDIRECT_URI;

// CloudCraze Apex REST base URL
export const CCRZ_API_BASE_URL = SFDC_COMMERCE_WEBSTORE_SITE_URL + '/services/apexrest/ccrz';

// CloudCraze data service API version (e.g. v9) — configurable per environment
const CCRZ_DS_VERSION = process.env.CCRZ_DS_VERSION ?? 'v9';

// CloudCraze REST API resource paths (version included)
export const CCRZ_CART_API_URL = `${CCRZ_API_BASE_URL}/cccart/${CCRZ_DS_VERSION}`;
export const CCRZ_CATEGORY_API_URL = `${CCRZ_API_BASE_URL}/cccategory/${CCRZ_DS_VERSION}`;
export const CCRZ_PRODUCT_API_URL = `${CCRZ_API_BASE_URL}/ccproduct/${CCRZ_DS_VERSION}`;
