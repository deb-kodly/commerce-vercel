import { getPortalUserIdFromCookie } from 'app/api/auth/cookieUtils';

/**
 * Determines if the current user is a guest by checking for a stored portal user ID.
 * Returns true if the user is a guest (no portal user ID cookie), false if authenticated.
 */
export async function fetchSessionContextDetails(): Promise<boolean> {
  try {
    const portalUserId = await getPortalUserIdFromCookie();
    return !portalUserId;
  } catch (error) {
    console.error('Error checking session context:', error);
    return true; // default to guest on error
  }
}
