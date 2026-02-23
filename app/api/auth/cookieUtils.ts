import { ServerCookieManager } from '../../../lib/server-cookies';

// -----------------------------
// Cookie Getters
// -----------------------------

/** Get the portal user's Salesforce User ID from cookies. */
export async function getPortalUserIdFromCookie(): Promise<string | null> {
  return ServerCookieManager.getInstance().getPortalUserId();
}

/** Get the portal user's effective Account ID from cookies. */
export async function getEffAccountIdFromCookie(): Promise<string | null> {
  return ServerCookieManager.getInstance().getEffAccountId();
}

/** Get the guest user status from cookies. */
export async function getIsGuestUserFromCookie(): Promise<boolean | null> {
  return ServerCookieManager.getInstance().getIsGuestUser();
}

/** Get the cart ID from cookies. */
export async function getCartIdFromCookie(): Promise<string | null> {
  return ServerCookieManager.getInstance().getCartId();
}

/** Get the portal user's locale from cookies. */
export async function getUserLocaleFromCookie(): Promise<string | null> {
  return ServerCookieManager.getInstance().getUserLocale();
}

/** Get the portal user's display name from cookies. */
export async function getUserNameFromCookie(): Promise<string | null> {
  return ServerCookieManager.getInstance().getUserName();
}

// -----------------------------
// Cookie Setters
// -----------------------------

/** Set the portal user's Salesforce User ID in cookies. */
export async function setPortalUserIdInCookie(userId: string) {
  await ServerCookieManager.getInstance().setPortalUserId(userId);
}

/** Set the portal user's effective Account ID in cookies. */
export async function setEffAccountIdInCookie(accountId: string) {
  await ServerCookieManager.getInstance().setEffAccountId(accountId);
}

/** Set the cart ID in cookies. */
export async function setCartIdInCookie(cartId: string) {
  await ServerCookieManager.getInstance().setCartId(cartId);
}

/** Set the portal user's locale in cookies. */
export async function setUserLocaleInCookie(userLocale: string) {
  await ServerCookieManager.getInstance().setUserLocale(userLocale);
}

/** Reset isGuestUser to true (default). */
export async function updateIsGuestUserToDefaultInCookie() {
  await ServerCookieManager.getInstance().setIsGuestUser(true);
}

// -----------------------------
// Cookie Deleters
// -----------------------------

/** Delete the portal user ID cookie. */
export async function deletePortalUserIdCookie(): Promise<void> {
  await ServerCookieManager.getInstance().deletePortalUserId();
}

/** Delete the effective account ID cookie. */
export async function deleteEffAccountIdCookie(): Promise<void> {
  await ServerCookieManager.getInstance().deleteEffAccountId();
}

/** Delete the cart ID cookie. */
export async function deleteCartIdCookie(): Promise<void> {
  await ServerCookieManager.getInstance().deleteCartId();
}

/** Delete the user locale cookie. */
export async function deleteUserLocaleCookie(): Promise<void> {
  await ServerCookieManager.getInstance().deleteUserLocale();
}

/** Delete the user name cookie. */
export async function deleteUserNameCookie(): Promise<void> {
  await ServerCookieManager.getInstance().deleteUserName();
}
